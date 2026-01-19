import { describe, expect, it } from 'vitest'
import { layoutWithMovingIcon } from './layout'
import { AppIcon } from '../data/apps'

const baseIcons: AppIcon[] = [
  { id: 'timer', label: 'Timer', icon: '⏱️', route: '/app/timer', page: 1, position: 0 },
  { id: 'settings', label: 'Settings', icon: '⚙️', route: '/app/settings', page: 1, position: 1 },
  { id: 'resume', label: 'Resume', icon: '📄', route: '/app/resume', page: 1, position: 5 },
]

describe('layoutWithMovingIcon', () => {
  it('keeps other icons in place when moving into empty cells', () => {
    const result = layoutWithMovingIcon(baseIcons, 'timer', 2, 1)
    expect(result).not.toBeNull()
    const timer = result?.find(icon => icon.id === 'timer')
    const settings = result?.find(icon => icon.id === 'settings')
    const resume = result?.find(icon => icon.id === 'resume')
    expect(timer?.position).toBe(2)
    expect(settings?.position).toBe(1)
    expect(resume?.position).toBe(5)
  })

  it('moves only conflicted icons to nearest available slots', () => {
    const result = layoutWithMovingIcon(baseIcons, 'timer', 1, 1)
    expect(result).not.toBeNull()
    const timer = result?.find(icon => icon.id === 'timer')
    const settings = result?.find(icon => icon.id === 'settings')
    const resume = result?.find(icon => icon.id === 'resume')
    expect(timer?.position).toBe(1)
    expect(settings?.position).toBe(2)
    expect(resume?.position).toBe(5)
  })
})
