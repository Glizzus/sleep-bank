import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // default pattern skips fonts, which would break them offline
        globPatterns: ['**/*.{js,css,html,woff2,wasm}'],
        /* bumped once (2026-08-31): entries precached before the COOP/COEP
           deploy lack the headers and can't serve workers in the isolated
           context; a new cacheId refetches everything */
        cacheId: 'sleep-bank-coi',
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Sleep Bank',
        short_name: 'Sleep Bank',
        description: 'Sleep Bank client',
        display: 'standalone',
        theme_color: '#f7f4ef',
        background_color: '#f7f4ef',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  /* sqlite-wasm: COOP/COEP make the page cross-origin isolated, which OPFS
     persistence requires; production hosting must send the same headers */
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm', 'sqlocal'],
  },
})
