import { resolve } from 'node:path'
import { defineConfig } from 'vite'

/**
 * uni-app Vue 3 Package Build Config
 *
 * IMPORTANT: For uni-app, .vue SFC files must NOT be pre-compiled.
 * uni-app's compiler handles them at build time with platform-specific optimizations.
 * Pre-compiling breaks compatibility with uni-app's custom Vue runtime.
 *
 * This config only compiles TypeScript files (composables, utilities, types).
 * Vue components are exported as source files directly.
 * CSS is extracted via a dedicated style.ts entry that imports the SCSS.
 */
export default defineConfig({
	build: {
		lib: {
			cssFileName: 'style',
			entry: {
				// Only compile TypeScript files, NOT .vue files
				index: resolve(__dirname, '../src/index.ts'),
				'composables/useClickCaptcha': resolve(__dirname, '../src/composables/useClickCaptcha.ts'),
				'composables/usePopupCaptcha': resolve(__dirname, '../src/composables/usePopupCaptcha.ts'),
				'composables/useSliderCaptcha': resolve(__dirname, '../src/composables/useSliderCaptcha.ts'),
				request: resolve(__dirname, '../src/request.ts'),
				types: resolve(__dirname, '../src/types.ts'),
				// CSS entry - imports SCSS so Vite can extract it as dist/style.css
				style: resolve(__dirname, '../src/style.ts'),
			},
			name: 'CaptchaUniappVue',
		},
		rollupOptions: {
			external: ['@captcha-pro/mp-shared', '@captcha-pro/core', 'vue'],
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
