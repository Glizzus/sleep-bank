import { describe, it, expect } from 'vitest'
import { formatNightDate, wakeUpDateKey } from '../date'

describe('wakeUpDateKey', () => {
  it.each([
    [new Date(2026, 7, 30), '2026-08-30'],
    [new Date(2026, 0, 1), '2026-01-01'],
    [new Date(2026, 11, 9), '2026-12-09'],
    [new Date(2026, 7, 30, 23, 59), '2026-08-30'],
  ])('%o -> "%s"', (date, expected) => {
    expect(wakeUpDateKey(date)).toBe(expected)
  })
})

describe('formatNightDate', () => {
  it.each([
    [new Date(2026, 7, 26), 'Wed 26 August'],
    [new Date(2026, 7, 30), 'Sun 30 August'],
    [new Date(2026, 0, 1), 'Thu 1 January'],
    [new Date(2026, 11, 31), 'Thu 31 December'],
  ])('%o -> "%s"', (date, expected) => {
    expect(formatNightDate(date)).toBe(expected)
  })
})
