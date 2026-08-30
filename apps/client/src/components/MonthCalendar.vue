<script setup lang="ts">
import { computed } from 'vue'
import { buildCalendarCells, shiftMonth } from '@sleep-bank/logic'
import { isToday } from '@/lib/clock'
import CalendarCell from '@/components/CalendarCell.vue'

defineProps<{
  /** paint for a day's cell, e.g. a debt mark; undefined leaves it unpainted */
  paint?: (date: Date) => string | undefined
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
    <header class="month-nav">
      <button aria-label="Previous month" @click="shift(-1)">‹</button>
      <span>{{ monthLabel }}</span>
      <button aria-label="Next month" @click="shift(1)">›</button>
    </header>
    <div class="calendar">
      <span v-for="(day, i) in WEEKDAYS" :key="i" class="weekday">{{ day }}</span>
      <template v-for="(cell, i) in cells" :key="i">
        <CalendarCell
          v-if="cell.date && cell.dayOfMonth"
          :today="isToday(cell.date)"
          :paint="paint?.(cell.date)"
          @click="$emit('selectDay', cell.date)"
        >
          <slot name="day" :date="cell.date" :day-of-month="cell.dayOfMonth">
            {{ cell.dayOfMonth }}
          </slot>
        </CalendarCell>
        <div v-else class="blank" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 0.5rem;
}

.month-nav button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-ink);
  font: inherit;
  font-size: var(--text-xl);
}

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

.blank {
  aspect-ratio: 1;
}
</style>
