import { defineConfig } from 'rolldown'
import filesize from 'rollup-plugin-filesize'
import { banner, reporter, version } from './config'

export interface Config {
	browser?: boolean
	env: 'development' | 'production'
	file: string
	format: 'es' | 'cjs' | 'iife'
	input: string
	minify?: boolean
}

const IS_WATCH = process.env.ROLLDOWN_WATCH

// Build outputs:
// - index.mjs           -> ESM for bundlers
// - index.cjs           -> CommonJS for Node.js
// - index.global.js     -> IIFE for browsers (development)
// - index.global.min.js -> IIFE for browsers (production, minified)
const configs: Config[] = IS_WATCH
	? [
			{
				env: 'development',
				file: 'dist/index.mjs',
				format: 'es',
				input: 'src/index.ts',
			},
			{
				env: 'development',
				file: 'dist/index.cjs',
				format: 'cjs',
				input: 'src/index.ts',
			},
		]
	: [
			// ESM for bundlers (webpack, vite, rolldown, etc.)
			{
				env: 'development',
				file: 'dist/index.mjs',
				format: 'es',
				input: 'src/index.ts',
			},
			// CommonJS for Node.js
			{
				env: 'development',
				file: 'dist/index.cjs',
				format: 'cjs',
				input: 'src/index.ts',
			},
			// IIFE for browsers - development
			{
				browser: true,
				env: 'development',
				file: 'dist/index.global.js',
				format: 'iife',
				input: 'src/index.default.ts',
			},
			// IIFE for browsers - production (minified)
			{
				browser: true,
				env: 'production',
				file: 'dist/index.global.min.js',
				format: 'iife',
				input: 'src/index.default.ts',
				minify: true,
			},
		]

export default defineConfig(
	configs.map((config) => {
		const isGlobalBuild = config.format === 'iife'

		return {
			input: config.input,
			external: isGlobalBuild ? [] : ['core-js', 'js-cool'],
			output: {
				file: config.file,
				format: config.format,
				name: isGlobalBuild ? 'CaptchaPro' : undefined,
				exports: (config.format === 'cjs' || isGlobalBuild ? 'named' : 'auto') as 'auto' | 'named',
				banner: isGlobalBuild || config.browser ? banner : undefined,
				sourcemap: config.env === 'development' && !config.browser,
				minify: config.minify ?? false,
			},
			plugins: [
				// File size reporter
				filesize({ reporter }),
			],
			// Treeshaking
			treeshake: {
				moduleSideEffects: false,
			},
			// Replace version placeholder
			define: {
				__VERSION__: JSON.stringify(version),
			},
			// Target ES5 for IE11 support (Rolldown uses oxc for transpilation)
			target: 'es5',
			// Warnings
			onwarn(warning: { message: string }, warn: (warning: unknown) => void) {
				if (!/Circular/.test(warning.message)) {
					warn(warning)
				}
			},
		}
	})
)
