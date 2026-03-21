import { defineConfig, type Plugin } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Plugin to copy CSS from core package
function copyCoreCss(): Plugin {
  return {
    name: 'copy-core-css',
    buildStart() {
      const src = resolve(__dirname, '../../core/src/styles/index.css')
      const dest = resolve(__dirname, '../dist/style.css')
      if (existsSync(src)) {
        if (!existsSync(resolve(__dirname, '../dist'))) {
          mkdirSync(resolve(__dirname, '../dist'), { recursive: true })
        }
        copyFileSync(src, dest)
        console.log('[copy-core-css] Copied style.css to dist/')
      }
    },
  }
}

export default defineConfig({
  plugins: [createVuePlugin(), copyCoreCss()],
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
