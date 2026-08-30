// import '@fontsource-variable/newsreader'
import '@fontsource-variable/literata'

import './assets/theme.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { migrate } from './db/migrate'
import { ensureUser } from './queries/users'

if (import.meta.env.DEV) {
  await import('./lib/dev')
}

await migrate()
await ensureUser()

createApp(App).use(router).mount('#app')
