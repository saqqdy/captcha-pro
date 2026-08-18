const path = require('node:path')
const { defineConfig } = require('vite')
const { createVuePlugin } = require('vite-plugin-vue2')

module.exports = defineConfig({
  plugins: [createVuePlugin()],
  server: {
    port: 8002
  },
  resolve: {
    alias: {
      vue: path.resolve(__dirname, './node_modules/vue/dist/vue.esm.js')
    },
    dedupe: ['vue'],
    mainFields: ['module', 'main'],
    conditions: ['import', 'module', 'browser', 'default']
  }
})
