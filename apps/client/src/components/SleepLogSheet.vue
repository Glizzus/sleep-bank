<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatDuration, formatNightDate, segmentMinutes } from '@sleep-bank/logic'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import SleepSegmentRow from '@/components/SleepSegmentRow.vue'
import type { SleepSegment } from '@/queries/sleepLogs'

const props = defineProps<{
  date?: Date
  /** prefills the rows when opening; undefined or empty means an unlogged night */
  initial?: SleepSegment[]
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{ save: [segments: SleepSegment[]]; clear: [] }>()

/** a segment plus an ephemeral key so rows keep their identity across removals */
type SegmentRow = { key: string; segment: SleepSegment }

function toRow(segment: SleepSegment): SegmentRow {
  return { key: crypto.randomUUID(), segment }
}

const rows = ref<SegmentRow[]>([toRow({ startMinuteOfDay: 1380, endMinuteOfDay: 390 })])

watch(open, (isOpen) => {
  if (isOpen) {
    rows.value = props.initial?.length
      ? props.initial.map((segment) => toRow({ ...segment }))
      : [toRow({ startMinuteOfDay: 1380, endMinuteOfDay: 390 })]
  }
})

/** the first segment is the main night's sleep; later ones are numbered from 2 */
function segmentLabel(index: number) {
  return index === 0 ? 'Main' : `Segment ${index + 1}`
}

function addSegment() {
  rows.value.push(toRow({ startMinuteOfDay: 780, endMinuteOfDay: 840 }))
}

function removeSegment(key: string) {
  rows.value = rows.value.filter((row) => row.key !== key)
}

const slept = computed(() =>
  formatDuration(
    rows.value.reduce(
      (total, { segment }) => total + segmentMinutes(segment.startMinuteOfDay, segment.endMinuteOfDay),
      0,
    ),
  ),
)

function save() {
  emit('save', rows.value.map(({ segment }) => ({ ...segment })))
  open.value = false
}

function clear() {
  emit('clear')
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
        <SleepSegmentRow
          v-for="(row, i) in rows"
          :key="row.key"
          v-model:asleep="row.segment.startMinuteOfDay"
          v-model:awake="row.segment.endMinuteOfDay"
          :label="segmentLabel(i)"
          :removable="rows.length > 1"
          @remove="removeSegment(row.key)"
        />
      </div>
      <p class="slept">{{ slept }}</p>
      <Button variant="ghost" class="mx-4 h-12 self-start" @click="addSegment">
        + Add Segment
      </Button>
      <SheetFooter class="flex-row">
        <Button variant="outline" class="h-12 flex-1" @click="clear">Clear</Button>
        <Button class="h-12 flex-[3]" @click="save">Save</Button>
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

.slept {
  margin: 0;
  padding-bottom: 1rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  opacity: 0.55;
}
</style>
