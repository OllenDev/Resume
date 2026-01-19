import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { defaultIcons, AppIcon } from '../data/apps'
import { loadJson, saveJson } from '../lib/storage'
import { trackEvent } from '../lib/analytics'

const LAYOUT_KEY = 'a1_layout_v1'
type LayoutState = { icons: AppIcon[]; page: 1 | 2 }
const defaultLayout: LayoutState = { icons: defaultIcons, page: 1 }
const GRID_COLUMNS = 4
const GRID_ROWS = 4
const CELL_COUNT = GRID_COLUMNS * GRID_ROWS

type DragState = {
  draggingId: AppIcon['id']
  originIcons: AppIcon[]
  didDrop: boolean
  hoverIcons: AppIcon[] | null
}

const defaultSize = { cols: 1, rows: 1 }

function getSize(icon: AppIcon) {
  return icon.size ?? defaultSize
}


function getCellsForPosition(position: number, size: { cols: number; rows: number }) {
  const row = Math.floor(position / GRID_COLUMNS)
  const col = position % GRID_COLUMNS
  if (col + size.cols > GRID_COLUMNS || row + size.rows > GRID_ROWS) {
    return []
  }
  const cells: number[] = []
  for (let r = 0; r < size.rows; r += 1) {
    for (let c = 0; c < size.cols; c += 1) {
      cells.push((row + r) * GRID_COLUMNS + (col + c))
    }
  }
  return cells
}

function getOccupiedCells(icons: AppIcon[], page: 1 | 2, excludeId?: AppIcon['id']) {
  const occupied = new Map<number, AppIcon>()
  icons.forEach(icon => {
    if (icon.page !== page) return
    if (excludeId && icon.id === excludeId) return
    const size = getSize(icon)
    const cells = getCellsForPosition(icon.position, size)
    cells.forEach(cell => occupied.set(cell, icon))
  })
  return occupied
}

function findNextAvailablePosition(
  size: { cols: number; rows: number },
  occupied: Set<number>
) {
  for (let pos = 0; pos < CELL_COUNT; pos += 1) {
    const cells = getCellsForPosition(pos, size)
    if (cells.length === 0) continue
    if (cells.every(cell => !occupied.has(cell))) {
      return pos
    }
  }
  return null
}

function layoutWithMovingIcon(
  icons: AppIcon[],
  movingId: AppIcon['id'],
  targetPosition: number,
  page: 1 | 2
) {
  const movingIcon = icons.find(icon => icon.id === movingId)
  if (!movingIcon) return null
  const movingSize = getSize(movingIcon)
  const movingCells = getCellsForPosition(targetPosition, movingSize)
  if (movingCells.length === 0) return null

  const occupied = new Set<number>()
  movingCells.forEach(cell => occupied.add(cell))

  const updated = icons.map(icon =>
    icon.id === movingId ? { ...icon, position: targetPosition, page } : { ...icon }
  )

  const candidates = icons
    .filter(icon => icon.id !== movingId && icon.page === page)
    .sort((a, b) => a.position - b.position)

  for (const icon of candidates) {
    const size = getSize(icon)
    const nextPosition = findNextAvailablePosition(size, occupied)
    if (nextPosition == null) {
      return null
    }
    const nextCells = getCellsForPosition(nextPosition, size)
    nextCells.forEach(cell => occupied.add(cell))
    const target = updated.find(item => item.id === icon.id)
    if (target) target.position = nextPosition
  }

  return updated
}

export default function Home() {
  const nav = useNavigate()
  const [state, setState] = useState<LayoutState>(() => loadJson(LAYOUT_KEY, defaultLayout))
  useEffect(() => saveJson(LAYOUT_KEY, state), [state])
  const [now, setNow] = useState(() => new Date())
  const [isEditing, setIsEditing] = useState(false)
  const dragStateRef = useRef<DragState | null>(null)
  const [draggingId, setDraggingId] = useState<AppIcon['id'] | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const lastHoverPositionRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const pressStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const LONG_PRESS_MS = 400
  const MOVE_TOLERANCE = 10

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pageIcons = useMemo(
    () => state.icons.filter(i => i.page === state.page),
    [state.icons, state.page]
  )

  const touchStartX = useRef<number | null>(null)

  function open(icon: AppIcon) {
    if (dragStateRef.current || isEditing) return
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    trackEvent('icon_click', { icon_id: icon.id, icon_label: icon.label, page: state.page })
    trackEvent('app_open', { app_id: icon.id, app_name: icon.label, source: 'home', home_page: state.page })
    nav(icon.route)
  }

  function setPage(p: 1 | 2) {
    setState(s => ({ ...s, page: p }))
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (isEditing) return
    const start = touchStartX.current
    const end = e.changedTouches[0]?.clientX ?? null
    touchStartX.current = null
    if (start == null || end == null) return
    const dx = end - start
    if (Math.abs(dx) < 50) return
    if (dx < 0) setPage(state.page === 1 ? 2 : 2)
    if (dx > 0) setPage(state.page === 2 ? 1 : 1)
  }

  function onDragOverPosition(position: number) {
    const dragState = dragStateRef.current
    if (!dragState) return
    const dragging = dragState.originIcons.find(item => item.id === dragState.draggingId)
    if (!dragging) return
    if (dragging.page !== state.page) return

    const nextIcons = layoutWithMovingIcon(
      dragState.originIcons,
      dragState.draggingId,
      position,
      state.page
    )
    if (!nextIcons) return
    dragState.hoverIcons = nextIcons
    setState(s => ({ ...s, icons: nextIcons }))
  }

  function onGridPointerMove(clientX: number, clientY: number) {
    if (!gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
    const col = Math.min(GRID_COLUMNS - 1, Math.max(0, Math.floor(x / (rect.width / GRID_COLUMNS))))
    const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(y / (rect.height / GRID_ROWS))))
    const position = row * GRID_COLUMNS + col
    if (position === lastHoverPositionRef.current) return
    lastHoverPositionRef.current = position
    onDragOverPosition(position)
  }

  function finishDrag(didDrop: boolean) {
    const dragState = dragStateRef.current
    if (!dragState) return
    if (didDrop && dragState.hoverIcons) {
      setState(s => ({ ...s, icons: dragState.hoverIcons ?? s.icons }))
    } else if (!didDrop) {
      setState(s => ({ ...s, icons: dragState.originIcons }))
    }
    dragStateRef.current = null
    setDraggingId(null)
    lastHoverPositionRef.current = null
    activePointerIdRef.current = null
    dragStartRef.current = null
    hasDraggedRef.current = false
  }

  function resetDragState() {
    dragStateRef.current = null
    setDraggingId(null)
    lastHoverPositionRef.current = null
    activePointerIdRef.current = null
    dragStartRef.current = null
    hasDraggedRef.current = false
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function onIconPointerDown(icon: AppIcon, e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return
    clearLongPressTimer()
    if (isEditing) {
      activePointerIdRef.current = e.pointerId
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStateRef.current = {
        draggingId: icon.id,
        originIcons: state.icons,
        didDrop: false,
        hoverIcons: null,
      }
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      hasDraggedRef.current = false
      return
    }
    pressStartRef.current = { x: e.clientX, y: e.clientY }
    longPressTimerRef.current = window.setTimeout(() => {
      setIsEditing(true)
      suppressClickRef.current = true
      longPressTimerRef.current = null
    }, LONG_PRESS_MS)
  }

  function onIconPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (activePointerIdRef.current === e.pointerId && dragStateRef.current) {
      const start = dragStartRef.current
      if (!start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (!hasDraggedRef.current) {
        if (Math.hypot(dx, dy) < MOVE_TOLERANCE) return
        hasDraggedRef.current = true
        setDraggingId(dragStateRef.current.draggingId)
      }
      onGridPointerMove(e.clientX, e.clientY)
      return
    }
    if (!pressStartRef.current || !longPressTimerRef.current) return
    const dx = e.clientX - pressStartRef.current.x
    const dy = e.clientY - pressStartRef.current.y
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE) {
      clearLongPressTimer()
    }
  }

  function onIconPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (activePointerIdRef.current === e.pointerId && dragStateRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      if (hasDraggedRef.current) {
        finishDrag(true)
      } else {
        resetDragState()
      }
      return
    }
    clearLongPressTimer()
    pressStartRef.current = null
  }

  const hour = now.getHours() % 12
  const minute = now.getMinutes()
  const hourDeg = hour * 30 + minute / 2
  const minuteDeg = minute * 6

  return (
    <div className={`launcher ${isEditing ? 'editing' : ''}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="grid" ref={gridRef}>
        {pageIcons.map(icon => {
          const size = getSize(icon)
          const cells = getCellsForPosition(icon.position, size)
          if (cells.length === 0) return null
          const row = Math.floor(icon.position / GRID_COLUMNS)
          const col = icon.position % GRID_COLUMNS
          const isClockWidget = icon.id === 'clock-widget'
          return (
            <button
              key={icon.id}
              className={`icon ${isClockWidget ? 'widget clock-widget' : ''} ${draggingId === icon.id ? 'dragging' : ''}`}
              onClick={() => open(icon)}
              draggable={false}
              onPointerDown={event => onIconPointerDown(icon, event)}
              onPointerMove={onIconPointerMove}
              onPointerUp={onIconPointerUp}
              onPointerCancel={onIconPointerUp}
              style={{
                gridColumn: `${col + 1} / span ${size.cols}`,
                gridRow: `${row + 1} / span ${size.rows}`,
              }}
            >
              {isClockWidget ? (
                <div className="widget-clock">
                  <div className="tick" />
                  <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
                  <div className="hand min" style={{ transform: `rotate(${minuteDeg}deg)` }} />
                  <div className="center" />
                </div>
              ) : (
                <>
                  <div className="glyph">{icon.icon}</div>
                  <div className="label">{icon.label}</div>
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="dots">
        <button className={`dot ${state.page === 1 ? 'active' : ''}`} onClick={() => setPage(1)} aria-label="Page 1" />
        <button className={`dot ${state.page === 2 ? 'active' : ''}`} onClick={() => setPage(2)} aria-label="Page 2" />
      </div>
    </div>
  )
}
