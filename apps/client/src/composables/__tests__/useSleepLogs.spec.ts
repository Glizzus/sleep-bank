import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import {
  deleteSleepLog,
  getSleepLogsForMonth,
  saveSleepLog,
  type SleepLogNight,
} from '@/queries/sleepLogs'
import { useSleepLogs } from '../useSleepLogs'

vi.mock('@/queries/sleepLogs')

const loggedNight: SleepLogNight = {
  wakeUpDate: '2026-08-12',
  entries: [{ startMinuteOfDay: 1380, endMinuteOfDay: 390 }],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getSleepLogsForMonth).mockResolvedValue([loggedNight])
})

describe('useSleepLogs', () => {
  it('loads the month on first use and keys nights by date', async () => {
    const { nights, nightsByDate } = useSleepLogs(2026, 7)
    expect(nights.value).toBeUndefined()
    await flushPromises()
    expect(getSleepLogsForMonth).toHaveBeenCalledWith(2026, 7)
    expect(nightsByDate.value.get('2026-08-12')).toEqual(loggedNight)
  })

  it('saveNight writes, then repulls', async () => {
    const { nights, saveNight } = useSleepLogs(2026, 7)
    await flushPromises()
    vi.mocked(getSleepLogsForMonth).mockResolvedValue([])
    const segment = { startMinuteOfDay: 1350, endMinuteOfDay: 420 }
    await saveNight('2026-08-13', segment)
    expect(saveSleepLog).toHaveBeenCalledWith('2026-08-13', segment)
    expect(nights.value).toEqual([])
  })

  it('deleteNight deletes, then repulls', async () => {
    const { nights, deleteNight } = useSleepLogs(2026, 7)
    await flushPromises()
    vi.mocked(getSleepLogsForMonth).mockResolvedValue([])
    await deleteNight('2026-08-12')
    expect(deleteSleepLog).toHaveBeenCalledWith('2026-08-12')
    expect(nights.value).toEqual([])
  })
})
