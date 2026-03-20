import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({
	ignores: ['examples/**'],
	markdown: false,
	rules: {
		'n/no-unsupported-features/node-builtins': 'off',
		'perfectionist/sort-interfaces': 'off',
		'perfectionist/sort-objects': 'off',
		'perfectionist/sort-named-exports': 'off',
		'sort-keys': 'off',
	},
	stylistic: false,
	type: 'lib',
	typescript: true,
})
