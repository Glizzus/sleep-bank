import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { sleepDebt, wakeUpDateKey, type SleepLogNight } from '@sleep-bank/logic'
import { getSleepLogsForDebtWindow } from '@/queries/sleepLogs'
import { today } from '@/lib/clock'

/** the 14-night rolling sleep debt, as of this morning's wake-up */
export function useSleepDebt(baselineMinutes: MaybeRefOrGetter<number | undefined>) {
  const endWakeUpDate = wakeUpDateKey(today())

  /** undefined until the window's first read resolves */
  const nights: Ref<SleepLogNight[] | undefined> = ref()

  async function refresh() {
    nights.value = await getSleepLogsForDebtWindow(endWakeUpDate)
  }

  void refresh()

  /** minutes of debt; undefined until nights and the baseline have loaded */
  const debt = computed(() => {
    const baseline = toValue(baselineMinutes)
    if (!nights.value || baseline === undefined) return undefined
    return sleepDebt(nights.value, baseline, endWakeUpDate)
  })

  return { debt, refresh }
}
