<script setup lang="ts">
defineProps<{
  /** e.g. "August 2026" */
  label: string
}>()

defineEmits<{ prev: []; next: [] }>()
</script>

<template>
  <header class="month-nav">
    <button aria-label="Previous month" @click="$emit('prev')">‹</button>
    <span>{{ label }}</span>
    <button aria-label="Next month" @click="$emit('next')">›</button>
  </header>
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
</style>
