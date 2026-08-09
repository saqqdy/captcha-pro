import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({
	ignores: ['docs/**', '**/miniprogram_npm/**', 'examples/html/**'],
	markdown: false,
	stylistic: false,
	type: 'lib',
	typescript: true,
	rules: {
		'perfectionist/sort-objects': 'off',
	},
	languageOptions: {
		globals: {
			defineAppConfig: 'readonly',
			definePageConfig: 'readonly',
			uni: 'readonly',
		},
	},
})
