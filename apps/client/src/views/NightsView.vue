<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  formatDurationCompact,
  wakeUpDateKey,
  nightShortfall,
  nightSleptMinutes,
} from '@sleep-bank/logic'
import MonthCalendar from '@/components/MonthCalendar.vue'
import SleepLogSheet from '@/components/SleepLogSheet.vue'
import { useSleepLogs } from '@/composables/useSleepLogs'
import { usePreferences } from '@/composables/usePreferences'
import { debtClayColor } from '@/lib/clay'
import { today } from '@/lib/clock'
import type { SleepSegment } from '@/queries/sleepLogs'

const current = today()
const year = ref(current.getFullYear())
const month = ref(current.getMonth())

const { nightsByDate, saveNight, deleteNight } = useSleepLogs(year, month)
const { preferences } = usePreferences()

function shortfallOf(date: Date): number | undefined {
  const night = nightsByDate.value.get(wakeUpDateKey(date))
  if (!night || !preferences.value) return undefined
  return nightShortfall(night, preferences.value.baselineSleepMinutes)
}

function paintNight(date: Date): string | undefined {
  const shortfall = shortfallOf(date)
  return shortfall === undefined ? undefined : debtClayColor(shortfall)
}

function sleptLabel(date: Date): string | undefined {
  const night = nightsByDate.value.get(wakeUpDateKey(date))
  return night ? formatDurationCompact(nightSleptMinutes(night)) : undefined
}

const sheetOpen = ref(false)
const selectedDate = ref<Date>()

const initialSegments = computed(() =>
  selectedDate.value
    ? nightsByDate.value.get(wakeUpDateKey(selectedDate.value))?.entries
    : undefined,
)

function openNight(date: Date) {
  selectedDate.value = date
  sheetOpen.value = true
}

function onSave(segments: SleepSegment[]) {
  if (selectedDate.value === undefined) return
  void saveNight(wakeUpDateKey(selectedDate.value), segments)
}

function onClear() {
  if (selectedDate.value === undefined) return
  void deleteNight(wakeUpDateKey(selectedDate.value))
}
</script>

<template>
  <h1>Nights</h1>
  <MonthCalendar
    v-model:year="year"
    v-model:month="month"
    :paint="paintNight"
    :sublabel="sleptLabel"
    @select-day="openNight"
  />
  <SleepLogSheet
    v-model:open="sheetOpen"
    :date="selectedDate"
    :initial="initialSegments"
    @save="onSave"
    @clear="onClear"
  />
</template>
