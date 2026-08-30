import { nightSleptMinutes, type SleepLogNight } from './night'

/* SLEEP.md rule 1: debt is a 14-day rolling sum */
export const DEBT_WINDOW_NIGHTS = 14
/* SLEEP.md rule 3: one night repays at most 90 minutes */
export const MAX_NIGHTLY_REPAYMENT_MINUTES = 90
/* SLEEP.md rule 2: compute and show at 30 */
export const DEBT_RESOLUTION_MINUTES = 30

/**
 * One night's signed contribution to debt, in minutes: positive shortfall,
 * or negative credited surplus (1:1, capped — SLEEP.md rule 3).
 */
export function nightDebtDelta(night: SleepLogNight, baselineMinutes: number): number {
  const delta = baselineMinutes - nightSleptMinutes(night)
  return delta >= 0 ? delta : Math.max(delta, -MAX_NIGHTLY_REPAYMENT_MINUTES)
}

/** the 14 wake-up-date keys of the window ending at `endWakeUpDate`, ascending */
export function debtWindow(endWakeUpDate: string): string[] {
  const [year, month, day] = endWakeUpDate.split('-').map(Number)
  return Array.from({ length: DEBT_WINDOW_NIGHTS }, (_, i) => {
    const date = new Date(year!, month! - 1, day! - (DEBT_WINDOW_NIGHTS - 1) + i)
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${m}-${d}`
  })
}

/**
 * Minutes to sleep tonight: baseline plus as much debt as one night may
 * repay (SLEEP.md rule 3).
 */
export function tonightTargetMinutes(baselineMinutes: number, debtMinutes: number): number {
  return baselineMinutes + Math.min(debtMinutes, MAX_NIGHTLY_REPAYMENT_MINUTES)
}

/** minute of day to be in bed to fit `targetMinutes` before the wake-up time */
export function bedtimeMinuteOfDay(wakeUpMinuteOfDay: number, targetMinutes: number): number {
  return (((wakeUpMinuteOfDay - targetMinutes) % 1440) + 1440) % 1440
}

/**
 * SLEEP.md rule 1: shortfall over the last 14 nights, minus credited surplus,
 * floored at zero (rule 4) and quantized to 30 (rule 2). Nights outside the
 * window ending at `endWakeUpDate` are not a number and are ignored; unlogged
 * nights inside it contribute nothing.
 */
export function sleepDebt(
  nights: SleepLogNight[],
  baselineMinutes: number,
  endWakeUpDate: string,
): number {
  const window = new Set(debtWindow(endWakeUpDate))
  const balance = nights
    .filter((night) => window.has(night.wakeUpDate))
    .reduce((sum, night) => sum + nightDebtDelta(night, baselineMinutes), 0)
  const floored = Math.max(0, balance)
  return Math.round(floored / DEBT_RESOLUTION_MINUTES) * DEBT_RESOLUTION_MINUTES
}
