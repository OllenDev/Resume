import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { defaultIcons, AppIcon } from '../data/apps'
import { loadJson, saveJson } from '../lib/storage'
import { trackEvent } from '../lib/analytics'

const LAYOUT_KEY = 'a1_layout_v1'
type LayoutState = { icons: AppIcon[]; page: 1 | 2 }
const defaultLayout: LayoutState = { icons: defaultIcons, page: 1 }

export default function Home() {
  const nav = useNavigate()
  const [state, setState] = useState<LayoutState>(() => loadJson(LAYOUT_KEY, defaultLayout))
  useEffect(() => saveJson(LAYOUT_KEY, state), [state])

  const pageIcons = useMemo(
    () => state.icons.filter(i => i.page === state.page),
    [state.icons, state.page]
  )

  const touchStartX = useRef<number | null>(null)

  function open(icon: AppIcon) {
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

  return (
    <div className="launcher" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="grid">
        {Array.from({ length: 16 }).map((_, idx) => {
          const icon = pageIcons.find(i => i.position === idx)
          return (
            <div key={idx} className="cell">
              {icon && (
                <button className="icon" onClick={() => open(icon)}>
                  <div className="glyph">{icon.icon}</div>
                  <div className="label">{icon.label}</div>
                </button>
              )}
            </div>
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
