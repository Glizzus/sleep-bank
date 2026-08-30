<script setup lang="ts">
import { computed, ref } from 'vue'
import { nightDateKey, segmentMinutes } from '@sleep-bank/logic'
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

const { nightsByDate, saveNight } = useSleepLogs(year, month)
const { preferences } = usePreferences()

function paintNight(date: Date): string | undefined {
  const night = nightsByDate.value.get(nightDateKey(date))
  if (!night || !preferences.value) return undefined
  const slept = night.entries.reduce(
    (sum, entry) => sum + segmentMinutes(entry.startMinuteOfDay, entry.endMinuteOfDay),
    0,
  )
  const shortfall = Math.max(0, preferences.value.baselineSleepMinutes - slept)
  return debtClayColor(shortfall)
}

const sheetOpen = ref(false)
const selectedDate = ref<Date>()

const initialSegment = computed(() =>
  selectedDate.value
    ? nightsByDate.value.get(nightDateKey(selectedDate.value))?.entries[0]
    : undefined,
)

function openNight(date: Date) {
  selectedDate.value = date
  sheetOpen.value = true
}

function onSave(segment: SleepSegment) {
  if (selectedDate.value === undefined) return
  void saveNight(nightDateKey(selectedDate.value), segment)
}
</script>

<template>
  <h1>Nights</h1>
  <MonthCalendar
    v-model:year="year"
    v-model:month="month"
    :paint="paintNight"
    @select-day="openNight"
  />
  <SleepLogSheet
    v-model:open="sheetOpen"
    :date="selectedDate"
    :initial="initialSegment"
    @save="onSave"
  />
</template>
