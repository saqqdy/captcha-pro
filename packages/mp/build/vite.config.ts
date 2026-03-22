import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, '../src/index.ts'),
        'taro/index': resolve(__dirname, '../src/taro/index.ts'),
        'weixin/index': resolve(__dirname, '../src/weixin/index.ts'),
        'uniapp/index': resolve(__dirname, '../src/uniapp/index.ts'),
      },
      name: 'CaptchaMP',
    },
    rollupOptions: {
      external: ['@captcha/core', '@tarojs/components', '@tarojs/taro', 'vue', 'react'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          preserveModules: false,
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: false,
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
