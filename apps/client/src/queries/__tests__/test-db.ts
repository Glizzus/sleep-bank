import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import { drizzle } from 'drizzle-orm/sqlite-proxy'

/* the production db is sqlocal (a worker + OPFS around @sqlite.org/sqlite-wasm)
   behind drizzle's sqlite-proxy driver. Specs swap in this stand-in: the same
   wasm engine, in-memory in Node, behind the same driver contract — including
   sqlocal's positional row shape, which migrate.ts and the queries rely on */
export async function createTestDb() {
  const sqlite3 = await sqlite3InitModule()
  const sqlite = new sqlite3.oo1.DB(':memory:')
  return drizzle(async (sql, params, method) => {
    const rows = sqlite.exec({
      sql,
      bind: params.length ? params : undefined,
      returnValue: 'resultRows',
      rowMode: 'array',
    })
    return { rows: method === 'get' ? (rows[0] ?? []) : rows }
  })
}
