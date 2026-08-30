/** local calendar-day key, e.g. "2026-08-30"; sorts chronologically */
export function nightDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** "Wed 26 August" */
export function formatNightDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${weekday} ${date.getDate()} ${month}`
}
