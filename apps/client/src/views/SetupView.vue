<script setup lang="ts">
import BaselineRow from '@/components/BaselineRow.vue'
import WakeTimeRow from '@/components/WakeTimeRow.vue'
</script>

<template>
  <h1>Setup</h1>
  <div class="rows">
    <BaselineRow />
    <WakeTimeRow />
  </div>
</template>

<style scoped>
.rows > * + * {
  border-top: 1px solid var(--color-recessed);
}
</style>
