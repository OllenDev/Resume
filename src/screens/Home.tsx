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
}

const defaultSize = { cols: 1, rows: 1 }

function getSize(icon: AppIcon) {
  return icon.size ?? defaultSize
}

function isSingleCell(icon: AppIcon) {
  const size = getSize(icon)
  return size.cols === 1 && size.rows === 1
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

function canPlaceIcon(
  icon: AppIcon,
  position: number,
  icons: AppIcon[],
  page: 1 | 2,
  excludeId?: AppIcon['id']
) {
  const size = getSize(icon)
  const cells = getCellsForPosition(position, size)
  if (cells.length === 0) return false
  const occupied = getOccupiedCells(icons, page, excludeId)
  return cells.every(cell => !occupied.has(cell))
}

function moveIconToPosition(
  icons: AppIcon[],
  draggingId: AppIcon['id'],
  position: number,
  page: 1 | 2
) {
  const dragging = icons.find(icon => icon.id === draggingId)
  if (!dragging) return icons
  const updated = icons.map(icon =>
    icon.id === draggingId ? { ...icon, position, page } : icon
  )
  return updated
}

function shiftIconsForDrop(
  icons: AppIcon[],
  draggingId: AppIcon['id'],
  targetPosition: number,
  page: 1 | 2
) {
  const dragging = icons.find(icon => icon.id === draggingId)
  if (!dragging || !isSingleCell(dragging)) return null

  const occupied = getOccupiedCells(icons, page, draggingId)
  const targetIcon = occupied.get(targetPosition)
  if (!targetIcon || !isSingleCell(targetIcon)) return null

  const emptyPositions = Array.from({ length: CELL_COUNT }, (_, idx) => idx).filter(
    pos => !occupied.has(pos)
  )
  if (emptyPositions.length === 0) return null

  const forwardEmpty = emptyPositions.find(pos => pos > targetPosition)
  const backwardEmpty = [...emptyPositions].reverse().find(pos => pos < targetPosition)
  const emptyPosition = forwardEmpty ?? backwardEmpty
  if (emptyPosition == null) return null

  const rangeStart = Math.min(targetPosition, emptyPosition)
  const rangeEnd = Math.max(targetPosition, emptyPosition)
  for (let pos = rangeStart; pos <= rangeEnd; pos += 1) {
    const icon = occupied.get(pos)
    if (icon && !isSingleCell(icon)) return null
  }

  const shifted = icons.map(icon => ({ ...icon }))
  if (emptyPosition > targetPosition) {
    for (let pos = emptyPosition - 1; pos >= targetPosition; pos -= 1) {
      const icon = occupied.get(pos)
      if (!icon) continue
      const target = shifted.find(item => item.id === icon.id)
      if (target) target.position = pos + 1
    }
  } else {
    for (let pos = emptyPosition + 1; pos <= targetPosition; pos += 1) {
      const icon = occupied.get(pos)
      if (!icon) continue
      const target = shifted.find(item => item.id === icon.id)
      if (target) target.position = pos - 1
    }
  }

  const draggingTarget = shifted.find(item => item.id === draggingId)
  if (draggingTarget) draggingTarget.position = targetPosition
  return shifted
}

export default function Home() {
  const nav = useNavigate()
  const [state, setState] = useState<LayoutState>(() => loadJson(LAYOUT_KEY, defaultLayout))
  useEffect(() => saveJson(LAYOUT_KEY, state), [state])
  const [now, setNow] = useState(() => new Date())
  const dragStateRef = useRef<DragState | null>(null)
  const [draggingId, setDraggingId] = useState<AppIcon['id'] | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const lastHoverPositionRef = useRef<number | null>(null)

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
    if (dragStateRef.current) return
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
    const start = touchStartX.current
    const end = e.changedTouches[0]?.clientX ?? null
    touchStartX.current = null
    if (start == null || end == null) return
    const dx = end - start
    if (Math.abs(dx) < 50) return
    if (dx < 0) setPage(state.page === 1 ? 2 : 2)
    if (dx > 0) setPage(state.page === 2 ? 1 : 1)
  }

  function onDragStart(icon: AppIcon, e: React.DragEvent<HTMLButtonElement>) {
    e.dataTransfer.effectAllowed = 'move'
    dragStateRef.current = { draggingId: icon.id, originIcons: state.icons, didDrop: false }
    setDraggingId(icon.id)
  }

  function onDragOverPosition(position: number) {
    const dragState = dragStateRef.current
    if (!dragState) return
    const dragging = state.icons.find(item => item.id === dragState.draggingId)
    if (!dragging) return
    if (dragging.page !== state.page) return

    const isAvailable = canPlaceIcon(dragging, position, state.icons, state.page, dragState.draggingId)
    if (isAvailable) {
      const moved = moveIconToPosition(state.icons, dragState.draggingId, position, state.page)
      setState(s => ({ ...s, icons: moved }))
      return
    }

    const shifted = shiftIconsForDrop(state.icons, dragState.draggingId, position, state.page)
    if (shifted) {
      setState(s => ({ ...s, icons: shifted }))
    }
  }

  function onGridDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
    const col = Math.min(GRID_COLUMNS - 1, Math.max(0, Math.floor(x / (rect.width / GRID_COLUMNS))))
    const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(y / (rect.height / GRID_ROWS))))
    const position = row * GRID_COLUMNS + col
    if (position === lastHoverPositionRef.current) return
    lastHoverPositionRef.current = position
    onDragOverPosition(position)
  }

  function onDrop() {
    const dragState = dragStateRef.current
    if (!dragState) return
    dragState.didDrop = true
    dragStateRef.current = null
    setDraggingId(null)
    lastHoverPositionRef.current = null
  }

  function onDragEnd() {
    const dragState = dragStateRef.current
    if (dragState && !dragState.didDrop) {
      setState(s => ({ ...s, icons: dragState.originIcons }))
    }
    dragStateRef.current = null
    setDraggingId(null)
    lastHoverPositionRef.current = null
  }

  const hour = now.getHours() % 12
  const minute = now.getMinutes()
  const hourDeg = hour * 30 + minute / 2
  const minuteDeg = minute * 6

  return (
    <div className="launcher" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="hero">
        <div className="hero-clock" aria-hidden="true">
          <div className="tick" />
          <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
          <div className="hand min" style={{ transform: `rotate(${minuteDeg}deg)` }} />
          <div className="center" />
        </div>
      </div>
      <div className="grid" ref={gridRef} onDragOver={onGridDragOver} onDrop={onDrop}>
        {pageIcons.map(icon => {
          const size = getSize(icon)
          const cells = getCellsForPosition(icon.position, size)
          if (cells.length === 0) return null
          const row = Math.floor(icon.position / GRID_COLUMNS)
          const col = icon.position % GRID_COLUMNS
          return (
            <button
              key={icon.id}
              className={`icon ${draggingId === icon.id ? 'dragging' : ''}`}
              onClick={() => open(icon)}
              draggable
              onDragStart={event => onDragStart(icon, event)}
              onDragEnd={onDragEnd}
              style={{
                gridColumn: `${col + 1} / span ${size.cols}`,
                gridRow: `${row + 1} / span ${size.rows}`,
              }}
            >
              <div className="glyph">{icon.icon}</div>
              <div className="label">{icon.label}</div>
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
