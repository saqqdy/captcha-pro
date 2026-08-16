import { defineConfig } from 'vitest/config'

// No Vue SFC plugin needed: the mixins under test are plain JS, the test
// uses render functions (no template compiler), and .vue components are
// stubbed via vi.mock so no SFC compilation runs.
export default defineConfig({
	test: {
		environment: 'happy-dom',
		include: ['test/**/*.test.ts'],
	},
})
