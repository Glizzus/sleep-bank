<script setup lang="ts">
import { formatTimeOfDay } from '@sleep-bank/logic'
import FifteenMinuteStepper from '@/components/FifteenMinuteStepper.vue'

/** time of day, in minutes since midnight */
const value = defineModel<number>({ required: true })
</script>

<template>
  <FifteenMinuteStepper v-model="value" :max="1425" wrap>
    <template #default="{ value: minutes }">{{ formatTimeOfDay(minutes) }}</template>
  </FifteenMinuteStepper>
</template>
