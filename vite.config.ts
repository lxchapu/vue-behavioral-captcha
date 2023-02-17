/// <reference types="vitest" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    root: 'src',
  },
  server: {
    port: 8080,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/index.ts'),
      name: 'VueBehavioralCaptcha',
      fileName: 'vue-behavioral-captcha',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'vue',
        },
      },
    },
  },
})
