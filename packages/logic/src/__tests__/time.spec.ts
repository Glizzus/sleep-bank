import { describe, it, expect } from 'vitest'
import { formatDuration, formatDurationCompact, formatTimeOfDay, segmentMinutes } from '../time'

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

describe('formatDurationCompact', () => {
  it.each([
    [0, '0m'],
    [45, '45m'],
    [60, '1h'],
    [65, '1h05'],
    [450, '7h30'],
    [465, '7h45'],
    [480, '8h'],
  ])('formats %i minutes as "%s"', (minutes, expected) => {
    expect(formatDurationCompact(minutes)).toBe(expected)
  })
})

describe('segmentMinutes', () => {
  it.each([
    [1380, 390, 450], // 11:00 PM -> 6:30 AM crosses midnight
    [0, 480, 480],
    [840, 900, 60], // afternoon nap
    [390, 390, 0],
    [15, 0, 1425],
  ])('(%i, %i) -> %i', (start, end, expected) => {
    expect(segmentMinutes(start, end)).toBe(expected)
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
