import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import { currentUserId } from '@/lib/id'

export interface Preferences {
  baselineSleepMinutes: number
  wakeUpMinuteOfDay: number
}

export async function getPreferences(): Promise<Preferences | undefined> {
  const rows = await db
    .select({
      baselineSleepMinutes: users.baselineSleepMinutes,
      wakeUpMinuteOfDay: users.wakeUpMinuteOfDay,
    })
    .from(users)
    .where(eq(users.id, currentUserId()))
  return rows[0]
}

export async function updateBaselineSleepMinutes(minutes: number): Promise<void> {
  await db
    .update(users)
    .set({ baselineSleepMinutes: minutes })
    .where(eq(users.id, currentUserId()))
}

export async function updateWakeUpMinuteOfDay(minutes: number): Promise<void> {
  await db
    .update(users)
    .set({ wakeUpMinuteOfDay: minutes })
    .where(eq(users.id, currentUserId()))
}
