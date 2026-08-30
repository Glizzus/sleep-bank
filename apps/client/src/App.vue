<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <main>
    <RouterView />
  </main>
  <BottomNav />
</template>

<style scoped>
main {
  /* reserve room so content never hides behind the fixed nav */
  padding: 1rem 1rem calc(48px + env(safe-area-inset-bottom));
  min-height: 100dvh;
  box-sizing: border-box;
}
</style>
