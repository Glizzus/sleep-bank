<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="row">
    <span>{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;
}

.row > span {
  font-size: 1.25rem;
}
</style>
