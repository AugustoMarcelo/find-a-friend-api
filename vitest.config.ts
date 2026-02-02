import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    exclude: ['**/*.e2e-spec.ts', 'node_modules'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      test: path.resolve(__dirname, './test'),
    },
  },
})
