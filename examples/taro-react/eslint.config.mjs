import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({
  react: true, // taro-react 用 react: true，taro-vue/taro-vue2 用 vue: true
  vue: false,
  typescript: true,
  stylistic: false,
  markdown: false,
	languageOptions: {
		globals: {
			defineAppConfig: 'readonly',
			definePageConfig: 'readonly',
		},
	},
})
