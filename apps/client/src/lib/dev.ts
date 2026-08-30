/* dev-only console helpers; loaded from main.ts behind import.meta.env.DEV */

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
  }
}

window.resetLocalData = resetLocalData
