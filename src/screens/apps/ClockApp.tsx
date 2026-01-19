import { useEffect, useState } from 'react'

export default function ClockApp() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="center">
      <div className="clock-time">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="clock-date">
        {now.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}
