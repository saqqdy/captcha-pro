import { defineConfig } from 'rolldown'
import filesize from 'rollup-plugin-filesize'

const formats = [
  { format: 'esm', ext: '.mjs' },
  { format: 'cjs', ext: '.cjs' },
] as const

export default defineConfig(
  formats.map(({ format, ext }) => ({
    input: './src/index.ts',
    output: {
      dir: './dist',
      format,
      entryFileNames: `index${ext}`,
      sourcemap: true,
    },
    plugins: [filesize()],
    external: ['vue', '@captcha/core'],
  }))
)
