import { spawn } from 'node:child_process'

const [, , ...args] = process.argv

function run(): void {
	build()
}

function build(): void {
	const child = spawn(
		'rolldown',
		['-c', 'build/rolldown.config.ts'].concat(args.includes('-w') ? ['-w'] : []),
		{ stdio: 'inherit' }
	)

	child.on('exit', (code) => {
		process.exit(code ?? 0)
	})
}

run()
