import { AppIcon } from '../data/apps'

export const GRID_COLUMNS = 4
export const GRID_ROWS = 6
export const CELL_COUNT = GRID_COLUMNS * GRID_ROWS

export const defaultSize = { cols: 1, rows: 1 }

export function getSize(icon: AppIcon) {
  return icon.size ?? defaultSize
}

export function getCellsForPosition(position: number, size: { cols: number; rows: number }) {
  const row = Math.floor(position / GRID_COLUMNS)
  const col = position % GRID_COLUMNS
  if (col + size.cols > GRID_COLUMNS || row + size.rows > GRID_ROWS) {
    return []
  }
  const cells: number[] = []
  for (let r = 0; r < size.rows; r += 1) {
    for (let c = 0; c < size.cols; c += 1) {
      cells.push((row + r) * GRID_COLUMNS + (col + c))
    }
  }
  return cells
}

export function findClosestAvailablePosition(
  startPosition: number,
  size: { cols: number; rows: number },
  occupied: Set<number>
) {
  if (startPosition >= 0 && startPosition < CELL_COUNT) {
    const startCells = getCellsForPosition(startPosition, size)
    if (startCells.length > 0 && startCells.every(cell => !occupied.has(cell))) {
      return startPosition
    }
  }
  for (let offset = 1; offset < CELL_COUNT; offset += 1) {
    const forward = startPosition + offset
    if (forward >= 0 && forward < CELL_COUNT) {
      const forwardCells = getCellsForPosition(forward, size)
      if (forwardCells.length > 0 && forwardCells.every(cell => !occupied.has(cell))) {
        return forward
      }
    }
    const backward = startPosition - offset
    if (backward >= 0 && backward < CELL_COUNT) {
      const backwardCells = getCellsForPosition(backward, size)
      if (backwardCells.length > 0 && backwardCells.every(cell => !occupied.has(cell))) {
        return backward
      }
    }
  }
  return null
}

export function layoutWithMovingIcon(
  icons: AppIcon[],
  movingId: AppIcon['id'],
  targetPosition: number,
  page: 1 | 2
) {
  const movingIcon = icons.find(icon => icon.id === movingId)
  if (!movingIcon) return null
  const movingSize = getSize(movingIcon)
  const movingCells = getCellsForPosition(targetPosition, movingSize)
  if (movingCells.length === 0) return null

  const updated = icons.map(icon =>
    icon.id === movingId ? { ...icon, position: targetPosition, page } : { ...icon }
  )

  const occupied = new Set<number>()
  const conflictedIds = new Set<AppIcon['id']>()

  updated.forEach(icon => {
    if (icon.page !== page) return
    if (icon.id === movingId) return
    const size = getSize(icon)
    const cells = getCellsForPosition(icon.position, size)
    cells.forEach(cell => occupied.add(cell))
  })

  const conflicts = new Set<number>()
  movingCells.forEach(cell => {
    if (occupied.has(cell)) conflicts.add(cell)
  })

  if (conflicts.size === 0) {
    movingCells.forEach(cell => occupied.add(cell))
    return updated
  }

  updated.forEach(icon => {
    if (icon.page !== page) return
    if (icon.id === movingId) return
    const size = getSize(icon)
    const cells = getCellsForPosition(icon.position, size)
    if (cells.some(cell => conflicts.has(cell))) {
      conflictedIds.add(icon.id)
      cells.forEach(cell => occupied.delete(cell))
    }
  })

  movingCells.forEach(cell => occupied.add(cell))

  const conflictsSorted = updated
    .filter(icon => conflictedIds.has(icon.id))
    .sort((a, b) => a.position - b.position)

  for (const icon of conflictsSorted) {
    const size = getSize(icon)
    const nextPosition = findClosestAvailablePosition(icon.position, size, occupied)
    if (nextPosition == null) {
      return null
    }
    const nextCells = getCellsForPosition(nextPosition, size)
    nextCells.forEach(cell => occupied.add(cell))
    icon.position = nextPosition
  }

  return updated
}
