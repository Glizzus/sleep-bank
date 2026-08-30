import { describe, it, expect } from 'vitest'
import { nightShortfall, nightSleptMinutes, type SleepLogNight } from '../night'

function night(...entries: [start: number, end: number][]): SleepLogNight {
  return {
    wakeUpDate: '2026-08-30',
    entries: entries.map(([startMinuteOfDay, endMinuteOfDay]) => ({
      startMinuteOfDay,
      endMinuteOfDay,
    })),
  }
}

describe('nightSleptMinutes', () => {
  it('is 0 for a logged night with no sleep', () => {
    expect(nightSleptMinutes(night())).toBe(0)
  })

  it('sums segments, crossing midnight', () => {
    // 11:00 PM -> 6:30 AM (450) plus a 2:00 PM -> 3:00 PM nap (60)
    expect(nightSleptMinutes(night([1380, 390], [840, 900]))).toBe(510)
  })
})

describe('nightShortfall', () => {
  it('is the baseline for a logged night with no sleep', () => {
    expect(nightShortfall(night(), 480)).toBe(480)
  })

  it('subtracts a single segment, crossing midnight', () => {
    // 11:00 PM -> 6:30 AM is 450 minutes
    expect(nightShortfall(night([1380, 390]), 480)).toBe(30)
  })

  it('sums multiple segments', () => {
    // 11:00 PM -> 2:00 AM (180) plus 3:00 AM -> 6:00 AM (180)
    expect(nightShortfall(night([1380, 120], [180, 360]), 480)).toBe(120)
  })

  it('clamps to 0 at exactly baseline', () => {
    expect(nightShortfall(night([0, 480]), 480)).toBe(0)
  })

  it('clamps to 0 when over baseline, not negative', () => {
    expect(nightShortfall(night([1320, 480]), 480)).toBe(0)
  })
})
