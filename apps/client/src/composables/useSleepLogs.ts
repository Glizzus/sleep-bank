import { computed, ref, watchEffect, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import {
  deleteSleepLog,
  getSleepLogsForMonth,
  saveSleepLog,
  type SleepLogNight,
  type SleepSegment,
} from '@/queries/sleepLogs'

export function useSleepLogs(year: MaybeRefOrGetter<number>, month: MaybeRefOrGetter<number>) {
  /** undefined until the month's first read resolves */
  const nights: Ref<SleepLogNight[] | undefined> = ref()

  async function refresh() {
    nights.value = await getSleepLogsForMonth(toValue(year), toValue(month))
  }

  /* reloads whenever the month changes; the args are read synchronously so
     watchEffect tracks them */
  watchEffect(() => void refresh())

  /** lookup by wakeUpDateKey, for calendar paint and sheet prefill */
  const nightsByDate = computed(
    () => new Map(nights.value?.map((night) => [night.wakeUpDate, night])),
  )

  /* writes repull instead of patching local state: the db is local, so a
     re-read is ~instant and stays the single source of truth */
  async function saveNight(wakeUpDate: string, segment: SleepSegment) {
    await saveSleepLog(wakeUpDate, segment)
    await refresh()
  }

  async function deleteNight(wakeUpDate: string) {
    await deleteSleepLog(wakeUpDate)
    await refresh()
  }

  return { nights, nightsByDate, saveNight, deleteNight }
}
