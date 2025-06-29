import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: [
      'src/__tests__/**/*.spec.js',
      'src/components/**/__tests__/**/*.spec.js'
    ],
  },
})
