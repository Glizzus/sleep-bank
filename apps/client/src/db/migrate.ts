import { sql } from 'drizzle-orm'
import { db } from './index'

/* drizzle-kit's node migrator can't run in the browser, so migrations are
   bundled as raw SQL and applied here, tracked in __migrations by filename */
const migrationFiles = import.meta.glob('./migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export async function migrate(): Promise<void> {
  await db.run(sql`create table if not exists "__migrations" ("name" text primary key)`)
  /* the sqlite-proxy driver returns rows positionally, so read via values() */
  const applied = new Set(
    (await db.values<[string]>(sql`select "name" from "__migrations"`)).map(([name]) => name),
  )
  const files = Object.entries(migrationFiles).sort(([a], [b]) => a.localeCompare(b))
  for (const [path, contents] of files) {
    const name = path.split('/').at(-1)!
    if (applied.has(name)) continue
    for (const statement of contents.split('--> statement-breakpoint')) {
      const trimmed = statement.trim()
      if (trimmed) await db.run(sql.raw(trimmed))
    }
    await db.run(sql`insert into "__migrations" ("name") values (${name})`)
  }
}
