<script setup lang="ts">
import FifteenMinuteTimeOfDayStepper from '@/components/FifteenMinuteTimeOfDayStepper.vue'
import SettingRow from '@/components/SettingRow.vue'

/** wake time, in minutes since midnight */
const value = defineModel<number>({ required: true })
</script>

<template>
  <SettingRow label="Wake Time">
    <FifteenMinuteTimeOfDayStepper v-model="value" />
  </SettingRow>
</template>
