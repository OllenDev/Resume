export type AppId =
  | 'clock'
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
}

export const defaultIcons: AppIcon[] = [
  { id: 'clock', label: 'Clock', icon: '🕒', route: '/app/clock', page: 1, position: 0 },
  { id: 'timer', label: 'Timer', icon: '⏱️', route: '/app/timer', page: 1, position: 1 },
  { id: 'settings', label: 'Settings', icon: '⚙️', route: '/app/settings', page: 1, position: 4 },
  { id: 'resume', label: 'Resume', icon: '📄', route: '/app/resume', page: 1, position: 5 },

  { id: 'company:salesforce', label: 'Salesforce', icon: '🏢', route: '/app/company/salesforce', page: 2, position: 0 },
  { id: 'company:strava', label: 'Strava', icon: '🏃', route: '/app/company/strava', page: 2, position: 1 },
  { id: 'company:lowes', label: "Lowe's", icon: '🏠', route: '/app/company/lowes', page: 2, position: 4 },
  { id: 'company:consulting', label: 'Consulting', icon: '💼', route: '/app/company/consulting', page: 2, position: 5 },
]
