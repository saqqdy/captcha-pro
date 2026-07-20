import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

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
  plugins: [react(), copyCoreCss()],
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.ts'),
      name: 'CaptchaReact',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: (id) => {
        // Externalize react, react-dom, and their submodules
        if (id === 'react' || id === 'react-dom' || id.startsWith('react/') || id.startsWith('react-dom/')) {
          return true
        }
        // Externalize @captcha-pro/core and its submodules
        if (id === '@captcha-pro/core' || id.startsWith('@captcha-pro/core/')) {
          return true
        }
        return false
      },
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
