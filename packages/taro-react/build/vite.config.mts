import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), react()],
  build: {
    lib: { cssFileName: 'style',
      entry: { index: resolve(__dirname, '../src/index.ts') },
      name: 'CaptchaTaroReact',
    },
    rollupOptions: {
      external: ['@captcha-pro/mp-shared', '@captcha-pro/core', '@tarojs/components', '@tarojs/taro', 'react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: [
        { format: 'es', entryFileNames: '[name].js', preserveModules: false },
        { format: 'cjs', entryFileNames: '[name].cjs', preserveModules: false },
      ],
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
  },
})
