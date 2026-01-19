import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PhoneShell from './ui/PhoneShell'
import Home from './screens/Home'
import AppFrame from './ui/AppFrame'
import ClockApp from './screens/apps/ClockApp'
import TimerApp from './screens/apps/TimerApp'
import SettingsApp from './screens/apps/SettingsApp'
import ResumePdfApp from './screens/apps/ResumePdfApp'
import CompanyApp from './screens/apps/CompanyApp'
import { useEffect } from 'react'
import { trackPageView } from './lib/analytics'

export default function App() {
  const loc = useLocation()

  useEffect(() => {
    trackPageView(loc.pathname)
  }, [loc.pathname])

  return (
    <PhoneShell>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route path="/app/clock" element={<AppFrame title="Clock"><ClockApp /></AppFrame>} />
        <Route path="/app/timer" element={<AppFrame title="Timer"><TimerApp /></AppFrame>} />
        <Route path="/app/settings/*" element={<AppFrame title="Settings"><SettingsApp /></AppFrame>} />
        <Route path="/app/resume" element={<AppFrame title="Resume"><ResumePdfApp /></AppFrame>} />
        <Route path="/app/company/:id" element={<AppFrame title="Company"><CompanyApp /></AppFrame>} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </PhoneShell>
  )
}
