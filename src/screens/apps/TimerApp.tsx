import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '../../lib/analytics'

function pad2(n: number) { return String(n).padStart(2, '0') }

export default function TimerApp() {
  const [total, setTotal] = useState(5 * 60) // seconds
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setTotal(s => {
        if (s <= 1) {
          trackEvent('timer_complete')
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  const hhmmss = useMemo(() => {
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${pad2(h)} : ${pad2(m)} : ${pad2(s)}`
  }, [total])

  function add(delta: number) {
    setTotal(s => Math.max(0, s + delta))
  }

  function startPause() {
    const next = !running
    setRunning(next)
    trackEvent(next ? 'timer_start' : 'timer_pause', { seconds_remaining: total })
  }

  function reset() {
    setRunning(false)
    setTotal(5 * 60)
    trackEvent('timer_reset')
  }

  return (
    <div className="timer">
      <div className="timer-display">{hhmmss}</div>
      <div className="timer-row">
        <button className="btn" onClick={() => add(60)}>+1m</button>
        <button className="btn primary" onClick={startPause}>{running ? 'Pause' : 'Start'}</button>
        <button className="btn" onClick={() => add(-60)}>-1m</button>
      </div>
      <button className="btn ghost" onClick={reset}>Reset</button>
    </div>
  )
}
