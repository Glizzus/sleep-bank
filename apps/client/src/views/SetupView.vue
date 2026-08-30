<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences'
import BaselineRow from '@/components/BaselineRow.vue'
import WakeTimeRow from '@/components/WakeTimeRow.vue'

const { preferences, setBaselineSleepMinutes, setWakeUpMinuteOfDay } = usePreferences()
</script>

<template>
  <h1>Setup</h1>
  <div v-if="preferences" class="rows">
    <BaselineRow
      :model-value="preferences.baselineSleepMinutes"
      @update:model-value="setBaselineSleepMinutes"
    />
    <WakeTimeRow
      :model-value="preferences.wakeUpMinuteOfDay"
      @update:model-value="setWakeUpMinuteOfDay"
    />
  </div>
</template>

<style scoped>
.rows > * + * {
  border-top: 1px solid var(--color-recessed);
}
</style>
