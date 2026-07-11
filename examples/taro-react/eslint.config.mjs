import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({
	react: true, // taro-react 用 react: true，taro-vue/taro-vue2 用 vue: true
	typescript: true,
	stylistic: false,
	markdown: false,
	rules: {
		'sort-keys': 'off',
		'perfectionist/sort-interfaces': 'off',
		'perfectionist/sort-objects': 'off',
		'no-undef': 'off',
	},
})
