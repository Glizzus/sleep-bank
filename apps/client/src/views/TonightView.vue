<script setup lang="ts">
import { computed } from 'vue'
import {
  bedtimeMinuteOfDay,
  formatDuration,
  formatTimeOfDay,
  tonightTargetMinutes,
} from '@sleep-bank/logic'
import { usePreferences } from '@/composables/usePreferences'
import { useSleepDebt } from '@/composables/useSleepDebt'

const { preferences } = usePreferences()
const { debt } = useSleepDebt(() => preferences.value?.baselineSleepMinutes)

const debtLabel = computed(() =>
  debt.value === undefined ? undefined : formatDuration(debt.value),
)

const bedtimeLabel = computed(() => {
  if (debt.value === undefined || !preferences.value) return undefined
  const target = tonightTargetMinutes(preferences.value.baselineSleepMinutes, debt.value)
  return formatTimeOfDay(bedtimeMinuteOfDay(preferences.value.wakeUpMinuteOfDay, target))
})
</script>

<template>
  <h1>Tonight</h1>
  <section v-if="debtLabel" class="stat debt">
    <span class="stat-label">Sleep debt</span>
    <span class="stat-figure">{{ debtLabel }}</span>
  </section>
  <section v-if="bedtimeLabel" class="stat bedtime">
    <span class="stat-label">Eyes shut by</span>
    <span class="stat-figure">{{ bedtimeLabel }}</span>
  </section>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding-block: 2rem;
}

.stat-label {
  font-size: var(--text-xs);
  opacity: 0.55;
}

.stat-figure {
  font-size: var(--text-xl);
  font-variant-numeric: tabular-nums;
}
</style>
