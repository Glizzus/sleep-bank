<script setup lang="ts">
const tabs = [
  { label: 'Tonight', to: '/' },
  { label: 'Nights', to: '/nights' },
  { label: 'Setup', to: '/setup' },
]
</script>

<template>
  <nav>
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to">
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
nav {
  position: fixed;
  inset: auto 0 0 0;
  display: flex;
  background: var(--color-recessed);
  /* keep the tabs above the iOS home indicator in standalone mode */
  padding-bottom: env(safe-area-inset-bottom);
}

a {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 48px;
  color: var(--color-ink);
  text-transform: uppercase;
  opacity: 0.55;
  text-decoration: none;
  font-size: var(--text-xs);
}

/* vue-router sets aria-current="page" on the exact-active link */
a[aria-current='page'] {
  opacity: 1;
  font-weight: 600;
}
</style>
