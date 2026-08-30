import { describe, it, expect } from 'vitest'
import { buildCalendarCells, shiftMonth } from '../calendar'

describe('buildCalendarCells', () => {
  it('builds February 2026 (starts Sunday, 28 days) as 35 cells with a blank last row', () => {
    const cells = buildCalendarCells(2026, 1)
    expect(cells).toHaveLength(35)
    expect(cells[0]).toEqual({ date: new Date(2026, 1, 1), dayOfMonth: 1 })
    expect(cells[27]).toEqual({ date: new Date(2026, 1, 28), dayOfMonth: 28 })
    expect(cells.slice(28).every((cell) => cell.date === null && cell.dayOfMonth === null)).toBe(
      true,
    )
  })

  it('builds August 2026 (starts Saturday, 31 days) as 42 cells with 6 leading blanks', () => {
    const cells = buildCalendarCells(2026, 7)
    expect(cells).toHaveLength(42)
    expect(cells.slice(0, 6).every((cell) => cell.date === null)).toBe(true)
    expect(cells[6]).toEqual({ date: new Date(2026, 7, 1), dayOfMonth: 1 })
    expect(cells[36]).toEqual({ date: new Date(2026, 7, 31), dayOfMonth: 31 })
  })

  it('handles December without breaking on the year boundary', () => {
    const cells = buildCalendarCells(2026, 11)
    const days = cells.filter((cell) => cell.date !== null)
    expect(days).toHaveLength(31)
    expect(days.at(-1)).toEqual({ date: new Date(2026, 11, 31), dayOfMonth: 31 })
  })
})

describe('shiftMonth', () => {
  it.each([
    [2026, 7, 1, { year: 2026, month: 8 }],
    [2026, 7, -1, { year: 2026, month: 6 }],
    [2026, 11, 1, { year: 2027, month: 0 }],
    [2026, 0, -1, { year: 2025, month: 11 }],
    [2026, 7, -14, { year: 2025, month: 5 }],
    [2026, 7, 0, { year: 2026, month: 7 }],
  ])('(%i, %i) + %i months', (year, month, delta, expected) => {
    expect(shiftMonth(year, month, delta)).toEqual(expected)
  })
})
