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
  route: string
  page: 1 | 2
  position: number // 0..15 for a 4x4
  size?: { cols: number; rows: number }
}

export const defaultIcons: AppIcon[] = [
  { id: 'clock-widget', label: 'Clock', icon: '🕒', route: '/app/clock', page: 1, position: 0, size: { cols: 2, rows: 2 } },
  { id: 'timer', label: 'Timer', icon: '⏱️', route: '/app/timer', page: 1, position: 2 },
  { id: 'settings', label: 'Settings', icon: '⚙️', route: '/app/settings', page: 1, position: 3 },
  { id: 'resume', label: 'Resume', icon: '📄', route: '/app/resume', page: 1, position: 6 },
  { id: 'company:salesforce', label: 'Salesforce', icon: '🏢', route: '/app/company/salesforce', page: 1, position: 7 },
  { id: 'company:strava', label: 'Strava', icon: '🏃', route: '/app/company/strava', page: 1, position: 8 },
  { id: 'company:lowes', label: "Lowe's", icon: '🏠', route: '/app/company/lowes', page: 1, position: 9 },
  { id: 'company:consulting', label: 'Consulting', icon: '💼', route: '/app/company/consulting', page: 1, position: 10 },
]
