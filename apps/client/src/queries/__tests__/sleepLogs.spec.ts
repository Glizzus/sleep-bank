// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { sleepLog } from '@/db/schema'
import { migrate } from '@/db/migrate'
import { ensureUser } from '@/queries/users'
import {
  deleteSleepLog,
  getSleepLogsForDebtWindow,
  getSleepLogsForMonth,
  saveSleepLog,
} from '@/queries/sleepLogs'

vi.mock('@/db', async () => {
  const { createTestDb } = await import('./test-db')
  return { db: await createTestDb() }
})

/* mirrors the app bootstrap in main.ts */
beforeAll(async () => {
  await migrate()
  await ensureUser()
})

beforeEach(async () => {
  await db.run(sql`delete from "sleep_log_entry"`)
  await db.run(sql`delete from "sleep_log"`)
})

describe('saveSleepLog / getSleepLogsForMonth', () => {
  it('round-trips a night, entries sorted by start minute', async () => {
    await saveSleepLog('2026-08-12', [
      { startMinuteOfDay: 780, endMinuteOfDay: 840 },
      { startMinuteOfDay: 1380, endMinuteOfDay: 390 },
    ])
    expect(await getSleepLogsForMonth(2026, 7)).toEqual([
      {
        wakeUpDate: '2026-08-12',
        entries: [
          { startMinuteOfDay: 780, endMinuteOfDay: 840 },
          { startMinuteOfDay: 1380, endMinuteOfDay: 390 },
        ],
      },
    ])
  })

  it('re-saving replaces the entries wholesale', async () => {
    await saveSleepLog('2026-08-12', [
      { startMinuteOfDay: 1380, endMinuteOfDay: 390 },
      { startMinuteOfDay: 780, endMinuteOfDay: 840 },
    ])
    await saveSleepLog('2026-08-12', [{ startMinuteOfDay: 1350, endMinuteOfDay: 420 }])
    const [night] = await getSleepLogsForMonth(2026, 7)
    expect(night!.entries).toEqual([{ startMinuteOfDay: 1350, endMinuteOfDay: 420 }])
  })

  it('keeps duplicate segments — two naps may share identical times', async () => {
    await saveSleepLog('2026-08-12', [
      { startMinuteOfDay: 780, endMinuteOfDay: 840 },
      { startMinuteOfDay: 780, endMinuteOfDay: 840 },
    ])
    const [night] = await getSleepLogsForMonth(2026, 7)
    expect(night!.entries).toHaveLength(2)
  })

  it('saving no segments keeps the night logged with no entries', async () => {
    await saveSleepLog('2026-08-12', [{ startMinuteOfDay: 1380, endMinuteOfDay: 390 }])
    await saveSleepLog('2026-08-12', [])
    expect(await getSleepLogsForMonth(2026, 7)).toEqual([
      { wakeUpDate: '2026-08-12', entries: [] },
    ])
  })

  it('returns only the asked month, boundary days included', async () => {
    for (const date of ['2026-07-31', '2026-08-01', '2026-08-31', '2026-09-01']) {
      await saveSleepLog(date, [{ startMinuteOfDay: 1380, endMinuteOfDay: 390 }])
    }
    const nights = await getSleepLogsForMonth(2026, 7)
    expect(nights.map((night) => night.wakeUpDate)).toEqual(['2026-08-01', '2026-08-31'])
  })

  it("never returns another user's nights", async () => {
    await db
      .insert(sleepLog)
      .values({ id: crypto.randomUUID(), userId: 'someone-else', wakeUpDate: '2026-08-12' })
    expect(await getSleepLogsForMonth(2026, 7)).toEqual([])
  })
})

describe('getSleepLogsForDebtWindow', () => {
  it('spans the 14 nights ending at the given date, inclusive', async () => {
    /* one night inside each boundary, one just outside each */
    for (const date of ['2026-08-17', '2026-08-18', '2026-08-31', '2026-09-01']) {
      await saveSleepLog(date, [{ startMinuteOfDay: 1380, endMinuteOfDay: 390 }])
    }
    const nights = await getSleepLogsForDebtWindow('2026-08-31')
    expect(nights.map((night) => night.wakeUpDate)).toEqual(['2026-08-18', '2026-08-31'])
  })
})

describe('deleteSleepLog', () => {
  it('removes the night and its entries', async () => {
    await saveSleepLog('2026-08-12', [{ startMinuteOfDay: 1380, endMinuteOfDay: 390 }])
    await deleteSleepLog('2026-08-12')
    expect(await getSleepLogsForMonth(2026, 7)).toEqual([])
    /* entries went with it, not just the log row */
    expect(await db.values(sql`select count(*) from "sleep_log_entry"`)).toEqual([[0]])
  })

  it('is a no-op for an unlogged night', async () => {
    await expect(deleteSleepLog('2026-08-12')).resolves.toBeUndefined()
  })
})
