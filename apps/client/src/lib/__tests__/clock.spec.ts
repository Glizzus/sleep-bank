import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { now, today, isToday } from '../clock'

const SYSTEM_TIME = new Date(2026, 7, 30, 21, 37, 45, 123)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(SYSTEM_TIME)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('now', () => {
  it('returns new Date()', () => {
    expect(now()).toBeInstanceOf(Date)
    expect(now()).toEqual(new Date())
    expect(now().getTime()).toBe(SYSTEM_TIME.getTime())
  })

  it('returns a fresh instance per call', () => {
    expect(now()).not.toBe(now())
  })
})

describe('today', () => {
  it('returns local midnight of the current day', () => {
    expect(today()).toEqual(new Date(2026, 7, 30))
  })

  it.each([
    ['just after midnight', new Date(2026, 7, 30, 0, 0, 0, 1)],
    ['midday', new Date(2026, 7, 30, 12, 30)],
    ['just before the next day', new Date(2026, 7, 30, 23, 59, 59, 999)],
  ])('is unaffected by time of day: %s', (_, systemTime) => {
    vi.setSystemTime(systemTime)
    expect(today()).toEqual(new Date(2026, 7, 30))
  })
})

describe('isToday', () => {
  it.each([
    ['today at midnight', new Date(2026, 7, 30), true],
    ['today at another time', new Date(2026, 7, 30, 6, 30), true],
    ['yesterday', new Date(2026, 7, 29), false],
    ['tomorrow', new Date(2026, 7, 31), false],
    ['same day of a different month', new Date(2026, 6, 30), false],
    ['same day of a different year', new Date(2025, 7, 30), false],
  ])('%s -> %s', (_, date, expected) => {
    expect(isToday(date)).toBe(expected)
  })
})
