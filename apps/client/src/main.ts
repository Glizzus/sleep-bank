// import '@fontsource-variable/newsreader'
import '@fontsource-variable/literata'

import './assets/theme.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
