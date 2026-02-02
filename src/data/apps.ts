import salesforceIcon from '../assets/icons/salesforce.svg'
import stravaIcon from '../assets/icons/strava.svg'
import lowesIcon from '../assets/icons/lowes.svg'
import skookumIcon from '../assets/icons/skookum.svg'
import cardinalIcon from '../assets/icons/cardinal.svg'
import timerIcon from '../assets/icons/timer.svg'
import settingsIcon from '../assets/icons/settings.svg'
import resumeIcon from '../assets/icons/resume.svg'

export type AppId =
  | 'clock'
  | 'clock-widget'
  | 'timer'
  | 'settings'
  | 'resume'
  | `company:${string}`

export type AppIcon = {
  id: AppId
  label: string
  icon: string // emoji placeholder for now
  iconImage?: string
  iconBg?: string
  route: string
  page: 1 | 2
  position: number // 0..15 for a 4x4
  size?: { cols: number; rows: number }
}

export const defaultIcons: AppIcon[] = [
  { id: 'clock-widget', label: 'Clock', icon: '🕒', route: '/app/clock', page: 1, position: 0, size: { cols: 2, rows: 2 } },
  { id: 'timer', label: 'Timer', icon: '', iconImage: timerIcon, iconBg: '#1e4fd6', route: '/app/timer', page: 1, position: 2 },
  { id: 'settings', label: 'Settings', icon: '', iconImage: settingsIcon, iconBg: '#4b5563', route: '/app/settings', page: 1, position: 3 },
  { id: 'resume', label: 'Resume', icon: '', iconImage: resumeIcon, iconBg: '#15803d', route: '/app/resume', page: 1, position: 6 },
  { id: 'company:salesforce', label: 'Salesforce', icon: '', iconImage: salesforceIcon, iconBg: '#00a1e0', route: '/app/company/salesforce', page: 1, position: 7 },
  { id: 'company:strava', label: 'Strava', icon: '', iconImage: stravaIcon, iconBg: '#fc4c02', route: '/app/company/strava', page: 1, position: 8 },
  { id: 'company:lowes', label: "Lowe's", icon: '', iconImage: lowesIcon, iconBg: '#004990', route: '/app/company/lowes', page: 1, position: 9 },
  { id: 'company:skookum', label: 'Skookum', icon: '', iconImage: skookumIcon, iconBg: '#111111', route: '/app/company/skookum', page: 2, position: 1 },
  { id: 'company:cardinal', label: 'Cardinal', icon: '', iconImage: cardinalIcon, iconBg: '#c8102e', route: '/app/company/cardinal', page: 2, position: 2 },
]
