/*
 * @Author: 杨旭
 * @Date: 2023-02-09 16:31:39
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-09 16:52:00
 * @FilePath: \vue-slide-puzzle\vite.config.ts
 * @Description:
 */
/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
      name: 'VuePuzzleSlider',
      fileName: 'vue-puzzle-slider',
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
