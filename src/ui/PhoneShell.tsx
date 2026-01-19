import { ReactNode, useEffect, useState } from 'react'
import StatusBar from './StatusBar'
import { loadJson, saveJson } from '../lib/storage'

type Prefs = {
  wallpaper: 'default' | 'dark'
  iconSize: 'normal' | 'large'
  fontSize: 'normal' | 'large'
  use24h: boolean
  tapSounds: boolean
  showDots: boolean
  enableSwipe: boolean
}

const PREFS_KEY = 'a1_prefs_v1'
export const defaultPrefs: Prefs = {
  wallpaper: 'default',
  iconSize: 'normal',
  fontSize: 'normal',
  use24h: false,
  tapSounds: true,
  showDots: true,
  enableSwipe: true,
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadJson(PREFS_KEY, defaultPrefs))
  useEffect(() => saveJson(PREFS_KEY, prefs), [prefs])
  return { prefs, setPrefs }
}

export default function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <div className="phone">
        <StatusBar />
        <div className="screen">
          {children}
        </div>
      </div>
    </div>
  )
}
