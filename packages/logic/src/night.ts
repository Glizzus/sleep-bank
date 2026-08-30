import { segmentMinutes } from './time'

export interface SleepSegment {
  startMinuteOfDay: number
  endMinuteOfDay: number
}

export interface SleepLogNight {
  /** local YYYY-MM-DD of the morning the night ended */
  wakeUpDate: string
  /** empty means logged but slept nothing */
  entries: SleepSegment[]
}

/** total minutes slept across one night's segments */
export function nightSleptMinutes(night: SleepLogNight): number {
  return night.entries.reduce(
    (sum, entry) => sum + segmentMinutes(entry.startMinuteOfDay, entry.endMinuteOfDay),
    0,
  )
}

/** minutes short of baseline for one night; 0 when at or over */
export function nightShortfall(night: SleepLogNight, baselineMinutes: number): number {
  return Math.max(0, baselineMinutes - nightSleptMinutes(night))
}
