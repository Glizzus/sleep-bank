import { describe, it, expect } from 'vitest'
import { formatDuration, formatTimeOfDay } from '../time'

describe('formatDuration', () => {
  it.each([
    [0, '0h 00m'],
    [15, '0h 15m'],
    [45, '0h 45m'],
    [60, '1h 00m'],
    [465, '7h 45m'],
    [480, '8h 00m'],
    [720, '12h 00m'],
    [750, '12h 30m'],
  ])('formats %i minutes as "%s"', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })
})

describe('formatTimeOfDay', () => {
  it.each([
    [0, '12:00 AM'],
    [15, '12:15 AM'],
    [390, '6:30 AM'],
    [705, '11:45 AM'],
    [720, '12:00 PM'],
    [765, '12:45 PM'],
    [780, '1:00 PM'],
    [1425, '11:45 PM'],
    [1440, '12:00 AM'],
  ])('formats %i minutes since midnight as "%s"', (minutes, expected) => {
    expect(formatTimeOfDay(minutes)).toBe(expected)
  })
})
