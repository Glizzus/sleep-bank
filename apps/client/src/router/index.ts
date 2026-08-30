import { createRouter, createWebHistory } from 'vue-router'

import TonightView from '@/views/TonightView.vue'
import NightsView from '@/views/NightsView.vue'
import SetupView from '@/views/SetupView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'tonight', component: TonightView },
    { path: '/nights', name: 'nights', component: NightsView },
    { path: '/setup', name: 'setup', component: SetupView },
  ],
})
