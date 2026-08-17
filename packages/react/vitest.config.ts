import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

// The hook (source code) and react-dom (CJS in node_modules) resolve to
// different React v19 instances in this pnpm workspace: the hook imports
// packages/react/node_modules/react, while react-dom internally uses
// node_modules/react-dom/node_modules/react. react-dom sets the hook
// dispatcher on its copy; the hook reads from the other → "Invalid hook
// call". Alias react to react-dom's copy so all code shares one instance.
const reactPath = require.resolve('react', {
	paths: [require.resolve('react-dom')],
})

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [{ find: /^react$/, replacement: reactPath }],
	},
	test: {
		environment: 'happy-dom',
		include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
	},
})
