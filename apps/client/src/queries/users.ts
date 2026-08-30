import { db } from '@/db'
import { users } from '@/db/schema'
import { currentUserId } from '@/lib/id'

/** creates the user row on first launch; column defaults come from the schema */
export async function ensureUser(): Promise<void> {
  await db.insert(users).values({ id: currentUserId() }).onConflictDoNothing()
}
