<script setup lang="ts">
import { XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import FifteenMinuteTimeOfDayStepper from '@/components/FifteenMinuteTimeOfDayStepper.vue'
import SettingRow from '@/components/SettingRow.vue'

defineProps<{
  label: string
  /** shows the remove button; the parent decides (only when the night has 2+ segments) */
  removable?: boolean
}>()

const emit = defineEmits<{ remove: [] }>()

/** times of day, in minutes since midnight */
const asleep = defineModel<number>('asleep', { required: true })
const awake = defineModel<number>('awake', { required: true })
</script>

<template>
  <div>
    <div class="label-row">
      <p class="label">{{ label }}</p>
      <Button
        v-if="removable"
        variant="ghost"
        size="icon-sm"
        class="remove"
        @click="emit('remove')"
      >
        <XIcon />
        <span class="sr-only">Remove {{ label }}</span>
      </Button>
    </div>
    <div class="segment">
      <SettingRow label="Asleep">
        <FifteenMinuteTimeOfDayStepper v-model="asleep" />
      </SettingRow>
      <SettingRow label="Awake">
        <FifteenMinuteTimeOfDayStepper v-model="awake" />
      </SettingRow>
    </div>
  </div>
</template>

<style scoped>
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
}

.label {
  margin: 0;
  opacity: 0.55;
}
</style>
