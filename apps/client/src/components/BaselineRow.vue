<script setup lang="ts">
import { ref } from 'vue'
import { formatDuration } from '@sleep-bank/logic'
import FifteenMinuteStepper from '@/components/FifteenMinuteStepper.vue'
import SettingRow from '@/components/SettingRow.vue'

/** baseline sleep need, in minutes */
const value = ref(480)
</script>

<template>
  <SettingRow label="Baseline">
    <FifteenMinuteStepper v-model="value" :min="60" :max="720">
      <template #default="{ value: minutes }">{{ formatDuration(minutes) }}</template>
    </FifteenMinuteStepper>
  </SettingRow>
</template>
