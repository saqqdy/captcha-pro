import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.ts'),
      name: 'CaptchaVue3',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@captcha/core'],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.mjs',
          preserveModules: false,
        },
        {
          format: 'cjs',
          entryFileNames: 'index.cjs',
          preserveModules: false,
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
  },
})
