const { defineConfig } = require('vite')
const { createVuePlugin } = require('vite-plugin-vue2')

module.exports = defineConfig({
  plugins: [createVuePlugin()],
  server: {
    port: 8002
  },
  resolve: {
    mainFields: ['module', 'main'],
    conditions: ['import', 'module', 'browser', 'default']
  }
})
