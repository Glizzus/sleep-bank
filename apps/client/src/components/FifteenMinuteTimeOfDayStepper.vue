<script setup lang="ts">
import { formatTimeOfDay } from '@sleep-bank/logic'
import FifteenMinuteStepper from '@/components/FifteenMinuteStepper.vue'
import SettingRow from '@/components/SettingRow.vue'

defineProps<{ label: string }>()

/** time of day, in minutes since midnight */
const value = defineModel<number>({ required: true })
</script>

<template>
  <SettingRow :label="label">
    <FifteenMinuteStepper v-model="value" :max="1425" wrap>
      <template #default="{ value: minutes }">{{ formatTimeOfDay(minutes) }}</template>
    </FifteenMinuteStepper>
  </SettingRow>
</template>
