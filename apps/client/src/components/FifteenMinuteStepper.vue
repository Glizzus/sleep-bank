<script setup lang="ts">
import { useFifteenMinuteStepper } from '@/composables/useFifteenMinuteStepper'

const props = withDefaults(defineProps<{ min?: number; max?: number; wrap?: boolean }>(), {
  min: 0,
  max: Number.POSITIVE_INFINITY,
  wrap: false,
})

/** the value in minutes */
const value = defineModel<number>({ required: true })

const { step, canStepDown, canStepUp } = useFifteenMinuteStepper(value, {
  min: () => props.min,
  max: () => props.max,
  wrap: () => props.wrap,
})
</script>

<template>
  <div class="stepper">
    <button aria-label="15 minutes less" :disabled="!canStepDown" @click="step(-1)">−</button>
    <span class="value"><slot :value="value">{{ value }}</slot></span>
    <button aria-label="15 minutes more" :disabled="!canStepUp" @click="step(1)">+</button>
  </div>
</template>

<style scoped>
.stepper {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: var(--color-recessed);
  color: var(--color-ink);
  font-family: inherit;
  font-size: var(--text-xl);
}

button:disabled {
  opacity: 0.35;
}

.value {
  text-align: center;
  font-size: var(--text-xl);
  font-variant-numeric: tabular-nums;
  /* widest value is "12:45 AM"; constant width keeps steppers aligned across rows */
  min-width: 8ch;
}
</style>
