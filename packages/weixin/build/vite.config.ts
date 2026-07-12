import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

/** Copy WeChat native component files (.js/.wxml/.wxss/.json) to dist */
function copyWeixinComponents(): void {
  const srcDir = resolve(__dirname, '../src/components')
  const destDir = resolve(__dirname, '../dist/components')
  if (!existsSync(srcDir)) return
  mkdirSync(destDir, { recursive: true })
  const copyDir = (from: string, to: string): void => {
    mkdirSync(to, { recursive: true })
    for (const name of readdirSync(from)) {
      const src = resolve(from, name)
      const dst = resolve(to, name)
      if (statSync(src).isDirectory()) { copyDir(src, dst) } else { copyFileSync(src, dst) }
    }
  }
  copyDir(srcDir, destDir)
}

export default defineConfig({
  plugins: [{
    name: 'copy-weixin-components',
    closeBundle() { copyWeixinComponents() },
  }],
  build: {
    lib: { cssFileName: 'style',
      entry: { index: resolve(__dirname, '../src/index.ts') },
      name: 'CaptchaWeixin',
    },
    rollupOptions: {
      external: ['@captcha-pro/mp-shared', '@captcha-pro/core'],
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
