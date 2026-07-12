import eslintConfig from '@eslint-sets/eslint-config'

export default eslintConfig({ type: 'lib', ignores: ['**/miniprogram_npm/**'], typescript: true, stylistic: false, markdown: false, rules: { 'sort-keys': 'off' } })
