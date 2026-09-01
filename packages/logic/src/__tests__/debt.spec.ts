import { describe, it, expect } from 'vitest'
import {
  bedtimeMinuteOfDay,
  debtWindow,
  nightDebtDelta,
  sleepDebt,
  tonightTargetMinutes,
  type SleepLogNight,
} from '../index'

/** a night that slept `minutes`, waking on `wakeUpDate` */
function night(wakeUpDate: string, minutes: number): SleepLogNight {
  return { wakeUpDate, entries: [{ startMinuteOfDay: 0, endMinuteOfDay: minutes }] }
}

const END = '2026-08-30'
const BASELINE = 480

describe('nightDebtDelta', () => {
  it.each([
    [420, 60], // an hour short
    [480, -30], // on target: 30 for showing up
    [510, -60], // show-up plus surplus 1:1
    [540, -90], // 60 surplus reaches the cap exactly
    [570, -90], // repayment caps at 90
    [960, -90], // rule 3: a 16-hour sleep repays the same
    [0, 480], // logged, slept nothing
  ])('slept %i vs 480 baseline -> %i', (slept, expected) => {
    expect(nightDebtDelta(night(END, slept), BASELINE)).toBe(expected)
  })
})

describe('debtWindow', () => {
  it('is the 14 nights ending at the given wake-up date, ascending', () => {
    const window = debtWindow(END)
    expect(window).toHaveLength(14)
    expect(window[0]).toBe('2026-08-17')
    expect(window[13]).toBe('2026-08-30')
  })

  it('crosses month boundaries', () => {
    expect(debtWindow('2026-09-05')[0]).toBe('2026-08-23')
  })
})

describe('sleepDebt', () => {
  it('is 0 with no logged nights', () => {
    expect(sleepDebt([], BASELINE, END)).toBe(0)
  })

  it('sums shortfalls across the window', () => {
    const nights = [night('2026-08-28', 420), night('2026-08-29', 420)]
    expect(sleepDebt(nights, BASELINE, END)).toBe(120)
  })

  it('credits repayments against shortfall, capped per night', () => {
    const nights = [
      night('2026-08-27', 300), // 180 short
      night('2026-08-28', 960), // repays only 90 despite 8h over
      night('2026-08-29', 510), // repays 60: show-up plus 30 surplus
    ]
    expect(sleepDebt(nights, BASELINE, END)).toBe(30)
  })

  it('floors at zero — no bank, no surplus', () => {
    const nights = [night('2026-08-28', 570), night('2026-08-29', 570)]
    expect(sleepDebt(nights, BASELINE, END)).toBe(0)
  })

  it('ignores nights older than the window, includes the 14th', () => {
    const nights = [
      night('2026-08-16', 0), // one day too old: not a number
      night('2026-08-17', 420), // oldest night still in
    ]
    expect(sleepDebt(nights, BASELINE, END)).toBe(60)
  })

  it('quantizes the total to 30 minutes', () => {
    expect(sleepDebt([night('2026-08-29', 435)], BASELINE, END)).toBe(60) // 45 -> 60
    expect(sleepDebt([night('2026-08-29', 465)], BASELINE, END)).toBe(30) // 15 -> 30
  })

  it('never exceeds what 14 nights could make', () => {
    const nights = debtWindow(END).map((key) => night(key, 0))
    expect(sleepDebt(nights, BASELINE, END)).toBe(14 * BASELINE)
  })
})

describe('tonightTargetMinutes', () => {
  it.each([
    [0, 480], // no debt: just the baseline
    [30, 480], // showing up already repays it
    [60, 510], // 30 surplus on top of the show-up credit
    [90, 540], // exactly the cap: 60 surplus
    [300, 540], // rule 3: one night repays at most 90
  ])('debt %i with 480 baseline -> %i', (debt, expected) => {
    expect(tonightTargetMinutes(480, debt)).toBe(expected)
  })
})

describe('bedtimeMinuteOfDay', () => {
  it.each([
    [390, 480, 1350], // 6:30 AM wake, 8h -> in bed 10:30 PM
    [390, 570, 1260], // 9.5h -> 9:00 PM
    [480, 480, 0], // 8:00 AM wake, 8h -> midnight exactly
    [420, 360, 60], // 7:00 AM wake, 6h -> 1:00 AM, no wrap needed
  ])('wake %i, target %i -> %i', (wake, target, expected) => {
    expect(bedtimeMinuteOfDay(wake, target)).toBe(expected)
  })
})
