'use strict'

// Preload vue@2 into require.cache before vite starts.
//
// With shamefully-hoist=true, vue@3 is hoisted to root node_modules/vue.
// vue-template-compiler lives at root node_modules/vue-template-compiler
// and does require('vue') which resolves to the hoisted vue@3, triggering:
//   "Vue packages version mismatch: vue@3.x vs vue-template-compiler@2.x"
//
// We fix this by pre-loading vue@2 from the local package and placing it
// in require.cache at the path where vue-template-compiler will look.
// This only affects Node-level require() calls during the vite build,
// not vite's own module resolution (which uses resolve.alias).

const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const pkgDir = path.resolve(__dirname, '..')

// Resolve vue@2 from the local package directory
const localVuePath = require.resolve('vue', { paths: [pkgDir] })
// Resolve where vue-template-compiler (at root node_modules) will look for vue
const hoistedVuePath = require.resolve('vue', { paths: [rootDir] })

if (localVuePath !== hoistedVuePath) {
  // Load vue@2 — this populates require.cache[localVuePath]
  const vue2 = require(localVuePath)

  // Ensure cache entry for local vue@2
  if (!require.cache[localVuePath]) {
    require.cache[localVuePath] = {
      exports: vue2,
      id: localVuePath,
      filename: localVuePath,
      loaded: true,
    }
  }

  // Point the hoisted location to vue@2's module
  require.cache[hoistedVuePath] = require.cache[localVuePath]

  // Also cache vue/package.json since some tools resolve it
  const localVuePkg = require.resolve('vue/package.json', { paths: [pkgDir] })
  const hoistedVuePkg = require.resolve('vue/package.json', { paths: [rootDir] })
  if (localVuePkg !== hoistedVuePkg) {
    if (!require.cache[localVuePkg]) {
      require.cache[localVuePkg] = {
        exports: require(localVuePkg),
        id: localVuePkg,
        filename: localVuePkg,
        loaded: true,
      }
    }
    require.cache[hoistedVuePkg] = require.cache[localVuePkg]
  }

  console.info('[preload-vue2] Patched require.cache so vue-template-compiler finds vue@2')
}
