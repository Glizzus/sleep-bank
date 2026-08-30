import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  baselineSleepMinutes: integer('baseline_sleep_minutes').default(480).notNull(),
  wakeUpMinuteOfDay: integer('wake_up_minute_of_day').default(390).notNull(),
})
