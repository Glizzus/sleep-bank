/* dev-only console helpers; loaded from main.ts behind import.meta.env.DEV,
   so the seeder (and faker inside it) never reaches a production bundle */

import { goldenNights } from '@sleep-bank/seeder'
import { saveSleepLog } from '@/queries/sleepLogs'
import { today } from '@/lib/clock'

/** seeds the golden dataset through the real write path (overwriting logged
    nights), then reloads so views repull */
async function seedNights() {
  for (const night of goldenNights(today())) await saveSleepLog(night.wakeUpDate, night.entries)
  location.reload()
}

async function resetLocalData() {
  if (!confirm('This will delete all local data. Continue?')) return

  localStorage.clear()

  const root = await navigator.storage.getDirectory()
  for await (const entry of root.values()) {
    try {
      await root.removeEntry(entry.name, { recursive: true })
    } catch {}
  }

  location.reload()
}

declare global {
  interface Window {
    resetLocalData: () => Promise<void>
    seedNights: () => Promise<void>
  }
}

window.resetLocalData = resetLocalData
window.seedNights = seedNights
