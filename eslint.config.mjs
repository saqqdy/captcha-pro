import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({
	ignores: ['examples/**'],
	markdown: false,
	rules: {
		'yml/file-extension': 'off',
		'n/no-unsupported-features/node-builtins': 'off',
		'perfectionist/sort-interfaces': 'off',
		'perfectionist/sort-objects': 'off',
		'perfectionist/sort-named-exports': 'off',
		'sort-keys': 'off',
	},
	stylistic: false,
	type: 'lib',
	typescript: true,
}).then(configs => [
	...configs,
	// WeChat Mini-program globals (Component, wx)
	{
		files: ['packages/mp/src/weixin/**/*.{js,ts}'],
		languageOptions: {
			globals: {
				Component: 'readonly',
				wx: 'readonly',
			},
		},
	},
	// uni-app globals (uni)
	{
		files: ['packages/mp/src/uniapp/**/*.{js,ts,vue}'],
		languageOptions: {
			globals: {
				uni: 'readonly',
			},
		},
	},
])
