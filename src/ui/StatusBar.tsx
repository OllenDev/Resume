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
  const displayHour = h % 12 || 12
  const hh = pad2(displayHour)
  const mm = pad2(m)
  const ampm = h >= 12 ? 'PM' : 'AM'

  return (
    <div className="statusbar">
      <div className="status-left">{hh}:{mm} {ampm}</div>
      <div className="status-right">
        <span className="status-pill">3G</span>
        <span className="signal" aria-hidden>
          <span className="b1" />
          <span className="b2" />
          <span className="b3" />
          <span className="b4" />
        </span>
        <span className="battery" aria-hidden>
          <span className="battery-level" />
        </span>
      </div>
    </div>
  )
}
