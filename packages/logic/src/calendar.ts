export interface CalendarCell {
  date: Date | null
  dayOfMonth: number | null
}

/** month is 0-indexed (0 = January, 11 = December); weeks start Sunday */
export function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0) // day 0 of next month = last day of this month
  const firstWeekday = firstOfMonth.getDay() // 0 = Sunday, 6 = Saturday
  const daysInMonth = lastOfMonth.getDate()

  const totalCells = firstWeekday + daysInMonth <= 35 ? 35 : 42
  const cells: CalendarCell[] = []

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: null, dayOfMonth: null })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), dayOfMonth: day })
  }
  while (cells.length < totalCells) {
    cells.push({ date: null, dayOfMonth: null })
  }

  return cells
}

/** month arithmetic with year rollover; delta may be any integer */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const shifted = new Date(year, month + delta)
  return { year: shifted.getFullYear(), month: shifted.getMonth() }
}
