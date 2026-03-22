import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const banner =
	`/*!\n` +
	` * ${pkg.name} v${pkg.version}\n` +
	` * ${pkg.description}\n` +
	` * (c) 2021-present saqqdy <https://github.com/saqqdy> \n` +
	` * Released under the MIT License.\n` +
	` */`

export const externals = {}

export const version = pkg.version

export const extensions = [
	'.js',
	'.mjs',
	'.cjs',
	'.jsx',
	'.ts',
	'.mts',
	'.cts',
	'.tsx',
	'.es6',
	'.es',
	'.json',
	'.less',
	'.css',
]

export const alias = {
	'@': resolve(__dirname, '..', 'src'),
	'captcha-pro': resolve(__dirname, '..'),
}

export const reporter = (opt: any, outputOptions: any, info: any): string =>
	`${chalk.cyan(
		chalk.bold(
			outputOptions.file ? `${outputOptions.file.split('src/').pop()}` : info.fileName || ''
		)
	)}: bundle size ${chalk.yellow(info.bundleSize)} -> minified ${chalk.green((info.minSize && `${info.minSize}`) || '')}`
