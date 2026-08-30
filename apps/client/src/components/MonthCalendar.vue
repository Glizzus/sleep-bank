<script setup lang="ts">
import { computed } from 'vue'
import { buildCalendarCells, shiftMonth } from '@sleep-bank/logic'
import { isToday } from '@/lib/clock'
import CalendarCell from '@/components/CalendarCell.vue'
import MonthNav from '@/components/MonthNav.vue'

defineProps<{
  /** paint for a day's cell, e.g. a debt mark; undefined leaves it unpainted */
  paint?: (date: Date) => string | undefined
  /** small line under a day's number, e.g. a shortfall; undefined omits it */
  sublabel?: (date: Date) => string | undefined
}>()

defineEmits<{ selectDay: [date: Date] }>()

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** the visible month, owned by the parent view */
const year = defineModel<number>('year', { required: true })
const month = defineModel<number>('month', { required: true })

const cells = computed(() => buildCalendarCells(year.value, month.value))
const monthLabel = computed(() =>
  new Date(year.value, month.value).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  }),
)

function shift(delta: number) {
  const shifted = shiftMonth(year.value, month.value, delta)
  year.value = shifted.year
  month.value = shifted.month
}
</script>

<template>
  <div>
    <MonthNav :label="monthLabel" @prev="shift(-1)" @next="shift(1)" />
    <div class="calendar">
      <span v-for="(day, i) in WEEKDAYS" :key="i" class="weekday">{{ day }}</span>
      <template v-for="(cell, i) in cells" :key="i">
        <CalendarCell
          v-if="cell.date && cell.dayOfMonth"
          :today="isToday(cell.date)"
          :day-of-month="cell.dayOfMonth"
          :paint="paint?.(cell.date)"
          :sublabel="sublabel?.(cell.date)"
          @click="$emit('selectDay', cell.date)"
        />
        <div v-else class="blank" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.weekday {
  display: grid;
  place-items: center;
  padding-block: 0.25rem;
  font-size: var(--text-xs);
  opacity: 0.55;
}

/* matches the cell's ratio so empty rows keep the same height */
.blank {
  aspect-ratio: 1 / 1.2;
}
</style>
