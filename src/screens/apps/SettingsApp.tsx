import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { loadJson, saveJson } from '../../lib/storage'
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'

type Prefs = {
  iconSize: 'normal' | 'large'
  fontSize: 'normal' | 'large'
  use24h: boolean
  tapSounds: boolean
}

const KEY = 'a1_settings_v1'
const defaults: Prefs = { iconSize: 'normal', fontSize: 'normal', use24h: false, tapSounds: true }

export default function SettingsApp() {
  return (
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/appearance" element={<Appearance />} />
      <Route path="/system" element={<System />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

function Top() {
  return (
    <div className="list">
      <Link className="row" to="/app/settings/appearance">Appearance <span className="chev">›</span></Link>
      <Link className="row" to="/app/settings/system">System <span className="chev">›</span></Link>
      <Link className="row" to="/app/settings/about">About Phone <span className="chev">›</span></Link>
    </div>
  )
}

function Appearance() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadJson(KEY, defaults))
  useEffect(() => saveJson(KEY, prefs), [prefs])

  function set<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setPrefs(p => ({ ...p, [k]: v }))
    trackEvent('settings_change', { setting_key: k, setting_value: String(v) })
  }

  return (
    <div className="list">
      <div className="row">
        Icon Size
        <select value={prefs.iconSize} onChange={e => set('iconSize', e.target.value as any)}>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="row">
        Font Size
        <select value={prefs.fontSize} onChange={e => set('fontSize', e.target.value as any)}>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  )
}

function System() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadJson(KEY, defaults))
  useEffect(() => saveJson(KEY, prefs), [prefs])

  function toggle(k: 'use24h' | 'tapSounds') {
    setPrefs(p => {
      const next = { ...p, [k]: !p[k] }
      trackEvent('settings_change', { setting_key: k, setting_value: String(next[k]) })
      return next
    })
  }

  return (
    <div className="list">
      <label className="row">
        24-hour time
        <input type="checkbox" checked={prefs.use24h} onChange={() => toggle('use24h')} />
      </label>
      <label className="row">
        Tap sounds
        <input type="checkbox" checked={prefs.tapSounds} onChange={() => toggle('tapSounds')} />
      </label>
    </div>
  )
}

function About() {
  const nav = useNavigate()
  return (
    <div className="list">
      <div className="row"><span>Android Version</span><span className="muted">1.0web</span></div>
      <div className="row"><span>Device Name</span><span className="muted">ChrisPhone</span></div>
      <div className="row"><span>Build Number</span><span className="muted">0001</span></div>
      <button className="row btnlink" onClick={() => nav('/app/resume')}>Open Resume PDF</button>
    </div>
  )
}
