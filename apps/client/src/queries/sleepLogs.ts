import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { debtWindow, wakeUpDateKey, type SleepLogNight, type SleepSegment } from '@sleep-bank/logic'
import { db } from '@/db'
import { sleepLog, sleepLogEntry } from '@/db/schema'
import { currentUserId } from '@/lib/id'

export type { SleepLogNight, SleepSegment }

/** logged nights waking in [start, end] (inclusive keys), with their segments */
async function getSleepLogsBetween(start: string, end: string): Promise<SleepLogNight[]> {
  const rows = await db
    .select({
      wakeUpDate: sleepLog.wakeUpDate,
      startMinuteOfDay: sleepLogEntry.startMinuteOfDay,
      endMinuteOfDay: sleepLogEntry.endMinuteOfDay,
    })
    .from(sleepLog)
    .leftJoin(sleepLogEntry, eq(sleepLogEntry.sleepLogId, sleepLog.id))
    .where(
      and(
        eq(sleepLog.userId, currentUserId()),
        gte(sleepLog.wakeUpDate, start),
        lte(sleepLog.wakeUpDate, end),
      ),
    )
    .orderBy(asc(sleepLog.wakeUpDate), asc(sleepLogEntry.startMinuteOfDay))

  const byDate = new Map<string, SleepLogNight>()
  for (const row of rows) {
    let night = byDate.get(row.wakeUpDate)
    if (!night) {
      night = { wakeUpDate: row.wakeUpDate, entries: [] }
      byDate.set(row.wakeUpDate, night)
    }
    /* left join: both null when the night has no entries */
    if (row.startMinuteOfDay !== null && row.endMinuteOfDay !== null) {
      night.entries.push({
        startMinuteOfDay: row.startMinuteOfDay,
        endMinuteOfDay: row.endMinuteOfDay,
      })
    }
  }
  return [...byDate.values()]
}

/** all logged nights of a month (0-indexed), with their segments */
export async function getSleepLogsForMonth(year: number, month: number): Promise<SleepLogNight[]> {
  const start = wakeUpDateKey(new Date(year, month, 1))
  const end = wakeUpDateKey(new Date(year, month + 1, 0))
  return getSleepLogsBetween(start, end)
}

/** the logged nights of the 14-night debt window ending at `endWakeUpDate` */
export async function getSleepLogsForDebtWindow(endWakeUpDate: string): Promise<SleepLogNight[]> {
  const window = debtWindow(endWakeUpDate)
  return getSleepLogsBetween(window[0]!, endWakeUpDate)
}

/** upserts the night and replaces its entries with the single given segment */
export async function saveSleepLog(wakeUpDate: string, segment: SleepSegment): Promise<void> {
  const existing = await db
    .select({ id: sleepLog.id })
    .from(sleepLog)
    .where(and(eq(sleepLog.userId, currentUserId()), eq(sleepLog.wakeUpDate, wakeUpDate)))

  let logId = existing[0]?.id
  if (logId === undefined) {
    logId = crypto.randomUUID()
    await db.insert(sleepLog).values({ id: logId, userId: currentUserId(), wakeUpDate })
  }

  await db.delete(sleepLogEntry).where(eq(sleepLogEntry.sleepLogId, logId))
  await db.insert(sleepLogEntry).values({
    id: crypto.randomUUID(),
    sleepLogId: logId,
    startMinuteOfDay: segment.startMinuteOfDay,
    endMinuteOfDay: segment.endMinuteOfDay,
  })
}
