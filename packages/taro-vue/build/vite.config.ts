import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { cssFileName: 'style',
      entry: { index: resolve(__dirname, '../src/index.ts') },
      name: 'CaptchaTaroVue',
    },
    rollupOptions: {
      external: ['@captcha-pro/mp-shared', '@captcha-pro/core', '@tarojs/components', '@tarojs/taro', 'vue'],
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
