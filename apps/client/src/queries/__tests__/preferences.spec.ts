// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { migrate } from '@/db/migrate'
import { ensureUser } from '@/queries/users'
import {
  getPreferences,
  updateBaselineSleepMinutes,
  updateWakeUpMinuteOfDay,
} from '@/queries/preferences'

vi.mock('@/db', async () => {
  const { createTestDb } = await import('./test-db')
  return { db: await createTestDb() }
})

beforeAll(async () => {
  await migrate()
})

beforeEach(async () => {
  await db.run(sql`delete from "users"`)
})

describe('preferences', () => {
  it('is undefined before the user exists', async () => {
    expect(await getPreferences()).toBeUndefined()
  })

  it('ensureUser creates the user with schema defaults, once', async () => {
    await ensureUser()
    await updateBaselineSleepMinutes(510)
    await ensureUser() // idempotent: must not reset the row
    expect(await getPreferences()).toEqual({ baselineSleepMinutes: 510, wakeUpMinuteOfDay: 390 })
  })

  it('updates persist per field', async () => {
    await ensureUser()
    await updateBaselineSleepMinutes(510)
    await updateWakeUpMinuteOfDay(420)
    expect(await getPreferences()).toEqual({ baselineSleepMinutes: 510, wakeUpMinuteOfDay: 420 })
  })
})
