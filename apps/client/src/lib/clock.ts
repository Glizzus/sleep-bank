/** the single place the app reads the wall clock, so tests can mock it */
export function now(): Date {
  return new Date()
}

/** local midnight of the current day */
export function today(): Date {
  const current = now()
  current.setHours(0, 0, 0, 0)
  return current
}

/** does `date` fall on the current calendar day? */
export function isToday(date: Date): boolean {
  const current = today()
  return (
    date.getFullYear() === current.getFullYear() &&
    date.getMonth() === current.getMonth() &&
    date.getDate() === current.getDate()
  )
}
