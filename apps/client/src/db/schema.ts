import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  baselineSleepMinutes: integer('baseline_sleep_minutes').default(480).notNull(),
  wakeUpMinuteOfDay: integer('wake_up_minute_of_day').default(390).notNull(),
})

/* a logged night; existing with no entries means "logged, slept nothing" */
export const sleepLog = sqliteTable(
  'sleep_log',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** local YYYY-MM-DD of the morning the night ended */
    wakeUpDate: text('wake_up_date').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [unique().on(table.userId, table.wakeUpDate)],
)

/* one sleep segment (main block or nap) of a logged night */
export const sleepLogEntry = sqliteTable(
  'sleep_log_entry',
  {
    id: text('id').primaryKey(),
    sleepLogId: text('sleep_log_id')
      .notNull()
      .references(() => sleepLog.id, { onDelete: 'cascade' }),
    /** minutes of day, 0-1439; start > end means the segment crosses midnight */
    startMinuteOfDay: integer('start_minute_of_day').notNull(),
    endMinuteOfDay: integer('end_minute_of_day').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index('sleep_log_entry_sleep_log_id_idx').on(table.sleepLogId)],
)
