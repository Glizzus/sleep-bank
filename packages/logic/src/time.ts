/** 465 -> "7h 45m", 480 -> "8h 00m", 45 -> "0h 45m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

/** duration of a sleep segment in minutes; start > end wraps past midnight */
export function segmentMinutes(startMinuteOfDay: number, endMinuteOfDay: number): number {
  return (endMinuteOfDay - startMinuteOfDay + 1440) % 1440
}

/** minutes since midnight -> "6:30 AM"; 0 -> "12:00 AM", 720 -> "12:00 PM" */
export function formatTimeOfDay(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const period = h24 < 12 ? 'AM' : 'PM'
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}
