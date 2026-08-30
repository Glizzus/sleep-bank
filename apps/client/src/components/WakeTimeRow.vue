<script setup lang="ts">
import { ref } from 'vue'
import { formatTimeOfDay } from '@sleep-bank/logic'
import FifteenMinuteStepper from '@/components/FifteenMinuteStepper.vue'
import SettingRow from '@/components/SettingRow.vue'

/** wake time, in minutes since midnight */
const value = ref(390)
</script>

<template>
  <SettingRow label="Wake Time">
    <FifteenMinuteStepper v-model="value" :max="1425" wrap>
      <template #default="{ value: minutes }">{{ formatTimeOfDay(minutes) }}</template>
    </FifteenMinuteStepper>
  </SettingRow>
</template>
