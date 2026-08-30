import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { sleepDebt, type SleepLogNight } from '@sleep-bank/logic'
import { getSleepLogsForDebtWindow } from '@/queries/sleepLogs'
import { useSleepDebt } from '../useSleepDebt'

vi.mock('@/queries/sleepLogs')
vi.mock('@/lib/clock', () => ({ today: () => new Date(2026, 7, 30) }))
vi.mock('@sleep-bank/logic', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sleepDebt: vi.fn(() => 90),
}))

const windowNights: SleepLogNight[] = [{ wakeUpDate: '2026-08-29', entries: [] }]

async function flush() {
  await Promise.resolve()
  await nextTick()
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getSleepLogsForDebtWindow).mockResolvedValue(windowNights)
})

describe('useSleepDebt', () => {
  it("fetches the window ending at today's wake-up date", async () => {
    useSleepDebt(480)
    await flush()
    expect(getSleepLogsForDebtWindow).toHaveBeenCalledWith('2026-08-30')
  })

  it('computes the debt from the fetched nights and baseline', async () => {
    const { debt } = useSleepDebt(480)
    await flush()
    expect(debt.value).toBe(90)
    expect(vi.mocked(sleepDebt)).toHaveBeenCalledWith(windowNights, 480, '2026-08-30')
  })

  it('is undefined until the nights load and until the baseline exists', async () => {
    const baseline = ref<number | undefined>(undefined)
    const { debt } = useSleepDebt(baseline)
    expect(debt.value).toBeUndefined() // nights pending
    await flush()
    expect(debt.value).toBeUndefined() // baseline pending
    baseline.value = 480
    expect(debt.value).toBe(90)
  })

  it('recomputes on refresh', async () => {
    const { debt, refresh } = useSleepDebt(480)
    await flush()
    vi.mocked(sleepDebt).mockReturnValue(30)
    vi.mocked(getSleepLogsForDebtWindow).mockResolvedValue([])
    await refresh()
    expect(debt.value).toBe(30)
  })
})
