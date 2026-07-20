import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.ts'),
      name: 'CaptchaMpShared',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@captcha-pro/core'],
      output: [
        { format: 'es', entryFileNames: '[name].js', preserveModules: false },
        { format: 'cjs', entryFileNames: '[name].cjs', preserveModules: false },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
  },
})