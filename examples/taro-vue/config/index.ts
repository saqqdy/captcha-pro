import { defineConfig } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: 'taro-vue',
    date: '2026-7-5',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {},
    copy: { patterns: [], options: {} },
    framework: 'vue3',
    compiler: 'webpack5',
    cache: { enable: false },
    mini: {
      postcss: {
        pxtransform: { enable: true, config: {} },
        url: { enable: true, config: { limit: 1024 } },
        cssModules: {
          enable: false,
          config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' }
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: { enable: true, config: {} },
        cssModules: {
          enable: false,
          config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' }
        }
      }
    },
    alias: {
      '@': './src'
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
