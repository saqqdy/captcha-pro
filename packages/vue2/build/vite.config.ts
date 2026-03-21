import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [createVuePlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.js'),
      name: 'CaptchaVue2',
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
