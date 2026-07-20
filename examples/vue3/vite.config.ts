import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8001
  },
  resolve: {
    // 优先使用 ESM 版本
    mainFields: ['module', 'main'],
    conditions: ['import', 'module', 'browser', 'default']
  }
})
