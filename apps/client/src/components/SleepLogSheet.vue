<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatNightDate } from '@sleep-bank/logic'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import FifteenMinuteTimeOfDayStepper from '@/components/FifteenMinuteTimeOfDayStepper.vue'
import type { SleepSegment } from '@/queries/sleepLogs'

const props = defineProps<{
  date?: Date
  /** prefills the steppers when opening; undefined means an unlogged night */
  initial?: SleepSegment
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{ save: [segment: SleepSegment] }>()

const asleep = ref(1380)
const awake = ref(390)

watch(open, (isOpen) => {
  if (isOpen) {
    asleep.value = props.initial?.startMinuteOfDay ?? 1380
    awake.value = props.initial?.endMinuteOfDay ?? 390
  }
})

function save() {
  emit('save', { startMinuteOfDay: asleep.value, endMinuteOfDay: awake.value })
  open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>{{ date ? formatNightDate(date) : '' }}</SheetTitle>
      </SheetHeader>
      <div class="rows">
        <FifteenMinuteTimeOfDayStepper v-model="asleep" label="Asleep" />
        <FifteenMinuteTimeOfDayStepper v-model="awake" label="Awake" />
      </div>
      <SheetFooter class="flex-row">
        <SheetClose as-child>
          <Button variant="outline" class="flex-1">Cancel</Button>
        </SheetClose>
        <Button class="flex-1" @click="save">Save</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.rows {
  padding-inline: 1rem;
  padding-bottom: 1rem;
}

.rows > * + * {
  border-top: 1px solid var(--color-recessed);
}
</style>
