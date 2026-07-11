import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({
  react: true,
  typescript: true,
  stylistic: false,
  markdown: false,
  rules: {
    'sort-keys': 'off',
    'perfectionist/sort-interfaces': 'off',
    'perfectionist/sort-objects': 'off',
  },
})
