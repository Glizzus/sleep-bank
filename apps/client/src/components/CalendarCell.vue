<script setup lang="ts">
defineProps<{
  dayOfMonth: number
  today?: boolean
  /** background color, e.g. a debt mark */
  paint?: string
  /** small line under the day number, e.g. a shortfall */
  sublabel?: string
}>()
</script>

<template>
  <button type="button" class="cell" :class="{ 'cell--today': today }" :style="{ background: paint }">
    <span class="day">{{ dayOfMonth }}</span>
    <span v-if="sublabel" class="sublabel">{{ sublabel }}</span>
  </button>
</template>

<style scoped>
.cell {
  border: none;
  /* unlogged look; a night's paint overrides via inline style */
  background: var(--color-recessed);
  color: var(--color-ink);
  font: inherit;
  padding: 0;

  aspect-ratio: 1 / 1.2;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.3rem;
  font-variant-numeric: tabular-nums;

  /* touch feel: no double-tap-zoom delay, no tap flash, no long-press selection */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.day {
  font-size: var(--text-xs);
  line-height: 1;
  opacity: 0.55;
}

/* centered in the space the header leaves */
.sublabel {
  margin-block: auto;
  font-size: var(--text-xs);
  line-height: 1;
  opacity: 0.7;
}

/* :hover doesn't exist on touch; :active is the press feedback */
.cell:active {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-recessed));
}

/* a ring, not a fill, so it stays visible over any paint */
.cell--today {
  outline: 2px solid var(--color-ink);
  outline-offset: -2px;
}
</style>
