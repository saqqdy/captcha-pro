import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import filesize from 'rollup-plugin-filesize'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read package.json for version
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const banner =
	`/*!\n` +
	` * ${pkg.name} v${pkg.version}\n` +
	` * ${pkg.description}\n` +
	` * (c) 2021-${new Date().getFullYear()} saqqdy <https://github.com/saqqdy> \n` +
	` * Released under the MIT License.\n` +
	` */`

const version = pkg.version

const reporter = (opt, outputOptions, info) =>
	`${info.bundleSize ? `${outputOptions.file?.split('src/').pop() || info.fileName || ''}: bundle size ${info.bundleSize} -> minified ${info.minSize || ''}` : ''}`

// Check if we're in watch mode
const IS_WATCH = process.env.ROLLUP_WATCH

const baseConfig = {
	treeshake: {
		moduleSideEffects: false,
	},
	onwarn(warning, warn) {
		if (!/Circular/.test(warning.message)) {
			warn(warning)
		}
	},
}

// ESM and CJS builds
const libConfig = {
	...baseConfig,
	input: 'src/index.ts',
	external: ['core-js', 'js-cool'],
	output: [
		{
			file: 'dist/index.mjs',
			format: 'es',
			sourcemap: true,
		},
		{
			file: 'dist/index.cjs',
			format: 'cjs',
			exports: 'named',
			sourcemap: true,
		},
	],
	plugins: [
		replace({
			preventAssignment: true,
			values: {
				__VERSION__: JSON.stringify(version),
			},
		}),
		typescript({
			tsconfig: 'src/tsconfig.json',
			declaration: false, // We use api-extractor for types
			outDir: 'dist', // Override to match rollup output
			sourceMap: true,
		}),
		filesize({ reporter }),
	],
}

// Browser IIFE builds
const browserDevConfig = {
	...baseConfig,
	input: 'src/index.default.ts',
	output: {
		file: 'dist/index.global.js',
		format: 'iife',
		name: 'CaptchaPro',
		banner,
	},
	plugins: [
		replace({
			preventAssignment: true,
			values: {
				__VERSION__: JSON.stringify(version),
			},
		}),
		typescript({
			tsconfig: 'src/tsconfig.json',
			declaration: false,
			outDir: 'dist',
		}),
		filesize({ reporter }),
	],
}

const browserProdConfig = {
	...baseConfig,
	input: 'src/index.default.ts',
	output: {
		file: 'dist/index.global.min.js',
		format: 'iife',
		name: 'CaptchaPro',
		banner,
		compact: true,
	},
	plugins: [
		replace({
			preventAssignment: true,
			values: {
				__VERSION__: JSON.stringify(version),
			},
		}),
		typescript({
			tsconfig: 'src/tsconfig.json',
			declaration: false,
			outDir: 'dist',
		}),
		terser(),
		filesize({ reporter }),
	],
}

// In watch mode, only build ESM and CJS
export default IS_WATCH
	? [libConfig]
	: [libConfig, browserDevConfig, browserProdConfig]