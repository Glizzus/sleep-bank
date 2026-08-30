import { ref, type Ref } from 'vue'
import {
  getPreferences,
  updateBaselineSleepMinutes,
  updateWakeUpMinuteOfDay,
  type Preferences,
} from '@/queries/preferences'

export function usePreferences() {
  /** undefined until the first read resolves */
  const preferences: Ref<Preferences | undefined> = ref()

  async function refresh() {
    preferences.value = await getPreferences()
  }

  void refresh()

  /* writes repull instead of patching local state: the db is local, so a
     re-read is ~instant and stays the single source of truth */
  async function setBaselineSleepMinutes(minutes: number) {
    await updateBaselineSleepMinutes(minutes)
    await refresh()
  }

  async function setWakeUpMinuteOfDay(minutes: number) {
    await updateWakeUpMinuteOfDay(minutes)
    await refresh()
  }

  return { preferences, setBaselineSleepMinutes, setWakeUpMinuteOfDay }
}
