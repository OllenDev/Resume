import { useEffect, useState } from 'react'

function pad2(n: number) { return String(n).padStart(2, '0') }

export default function StatusBar() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h = now.getHours()
  const m = now.getMinutes()
  const hh = pad2(h)
  const mm = pad2(m)

  return (
    <div className="statusbar">
      <div className="status-left">{hh}:{mm}</div>
      <div className="status-right">
        <span className="sb">📶</span>
        <span className="sb">🔋</span>
      </div>
    </div>
  )
}
