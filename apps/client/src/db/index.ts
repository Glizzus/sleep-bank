import { SQLocalDrizzle } from 'sqlocal/drizzle'
import { drizzle } from 'drizzle-orm/sqlite-proxy'

const { driver, batchDriver } = new SQLocalDrizzle('sleep-bank.sqlite3')

export const db = drizzle(driver, batchDriver)
