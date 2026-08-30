import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { nightDateKey } from '@sleep-bank/logic'
import { db } from '@/db'
import { sleepLog, sleepLogEntry } from '@/db/schema'
import { currentUserId } from '@/lib/id'

export interface SleepSegment {
  startMinuteOfDay: number
  endMinuteOfDay: number
}

export interface SleepLogNight {
  /** local YYYY-MM-DD of the wake-up date */
  nightDate: string
  /** empty means logged but slept nothing */
  entries: SleepSegment[]
}

/** all logged nights of a month (0-indexed), with their segments */
export async function getSleepLogsForMonth(year: number, month: number): Promise<SleepLogNight[]> {
  const start = nightDateKey(new Date(year, month, 1))
  const end = nightDateKey(new Date(year, month + 1, 1))

  const rows = await db
    .select({
      nightDate: sleepLog.nightDate,
      startMinuteOfDay: sleepLogEntry.startMinuteOfDay,
      endMinuteOfDay: sleepLogEntry.endMinuteOfDay,
    })
    .from(sleepLog)
    .leftJoin(sleepLogEntry, eq(sleepLogEntry.sleepLogId, sleepLog.id))
    .where(
      and(
        eq(sleepLog.userId, currentUserId()),
        gte(sleepLog.nightDate, start),
        lt(sleepLog.nightDate, end),
      ),
    )
    .orderBy(asc(sleepLog.nightDate), asc(sleepLogEntry.startMinuteOfDay))

  const byDate = new Map<string, SleepLogNight>()
  for (const row of rows) {
    let night = byDate.get(row.nightDate)
    if (!night) {
      night = { nightDate: row.nightDate, entries: [] }
      byDate.set(row.nightDate, night)
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

/** upserts the night and replaces its entries with the single given segment */
export async function saveSleepLog(nightDate: string, segment: SleepSegment): Promise<void> {
  const existing = await db
    .select({ id: sleepLog.id })
    .from(sleepLog)
    .where(and(eq(sleepLog.userId, currentUserId()), eq(sleepLog.nightDate, nightDate)))

  let logId = existing[0]?.id
  if (logId === undefined) {
    logId = crypto.randomUUID()
    await db.insert(sleepLog).values({ id: logId, userId: currentUserId(), nightDate })
  }

  await db.delete(sleepLogEntry).where(eq(sleepLogEntry.sleepLogId, logId))
  await db.insert(sleepLogEntry).values({
    id: crypto.randomUUID(),
    sleepLogId: logId,
    startMinuteOfDay: segment.startMinuteOfDay,
    endMinuteOfDay: segment.endMinuteOfDay,
  })
}
