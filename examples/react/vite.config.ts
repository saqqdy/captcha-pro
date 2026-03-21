import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8003
  },
  resolve: {
    mainFields: ['module', 'main'],
    conditions: ['import', 'module', 'browser', 'default']
  }
})
