import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		coverage: {
			exclude: ['src/types.ts', 'src/index.ts'],
			include: ['src/**/*.ts'],
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
		environment: 'happy-dom',
		globals: true,
		include: ['test/**/*.test.ts'],
		setupFiles: ['./test/setup.ts'],
	},
})
