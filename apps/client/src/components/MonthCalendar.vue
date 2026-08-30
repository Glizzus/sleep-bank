<script setup lang="ts">
import { computed, ref } from 'vue'
import { buildCalendarCells, shiftMonth } from '@sleep-bank/logic'
import { isToday, today as startOfToday } from '@/lib/clock'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const today = startOfToday()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())

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
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="cell"
        :class="{ 'cell--today': cell.date !== null && isToday(cell.date) }"
      >
        <template v-if="cell.date && cell.dayOfMonth">
          <slot name="day" :date="cell.date" :day-of-month="cell.dayOfMonth">
            {{ cell.dayOfMonth }}
          </slot>
        </template>
      </div>
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

.cell {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-variant-numeric: tabular-nums;
}

.cell--today {
  background: var(--color-recessed);
}
</style>
