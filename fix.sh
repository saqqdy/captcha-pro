#!/bin/bash

set -e

echo "Fixing packages/react: pnpm eslint packages/react --fix"
pnpm eslint packages/react --fix
echo "Fixing packages/vue2: pnpm eslint packages/vue2 --fix"
pnpm eslint packages/vue2 --fix
echo "Fixing packages/vue3: pnpm eslint packages/vue3 --fix"
pnpm eslint packages/vue3 --fix
# echo "Fixing packages/taro-react: pnpm eslint packages/taro-react --fix"
# pnpm eslint packages/taro-react --fix
# echo "Fixing packages/taro-vue: pnpm eslint packages/taro-vue --fix"
# pnpm eslint packages/taro-vue --fix
# echo "Fixing packages/taro-vue2: pnpm eslint packages/taro-vue2 --fix"
# pnpm eslint packages/taro-vue2 --fix
# echo "Fixing packages/uniapp-vue: pnpm eslint packages/uniapp-vue --fix"
# pnpm eslint packages/uniapp-vue --fix
# echo "Fixing packages/uniapp-vue2: pnpm eslint packages/uniapp-vue2 --fix"
# pnpm eslint packages/uniapp-vue2 --fix
# echo "Fixing packages/weixin: pnpm eslint packages/weixin --fix"
# pnpm eslint packages/weixin --fix
# echo "Fixing packages/mp-shared: pnpm eslint packages/mp-shared --fix"
# pnpm eslint packages/mp-shared --fix

echo "Fixing examples/react: pnpm eslint examples/react --fix"
pnpm eslint examples/react --fix
echo "Fixing examples/vue2: pnpm eslint examples/vue2 --fix"
pnpm eslint examples/vue2 --fix
echo "Fixing examples/vue3: pnpm eslint examples/vue3 --fix"
pnpm eslint examples/vue3 --fix
# echo "Fixing examples/taro-react: pnpm eslint examples/taro-react --fix"
# pnpm eslint examples/taro-react --fix
# echo "Fixing examples/taro-vue: pnpm eslint examples/taro-vue --fix"
# pnpm eslint examples/taro-vue --fix
# echo "Fixing examples/taro-vue2: pnpm eslint examples/taro-vue2 --fix"
# pnpm eslint examples/taro-vue2 --fix
# echo "Fixing examples/uniapp-vue: pnpm eslint examples/uniapp-vue --fix"
# pnpm eslint examples/uniapp-vue --fix
# echo "Fixing examples/weixin: pnpm eslint examples/weixin --fix"
# pnpm eslint examples/weixin --fix

git add packages/react
git add packages/vue2
git add packages/vue3
# git add packages/taro-react
# git add packages/taro-vue
# git add packages/taro-vue2
# git add packages/uniapp-vue
# git add packages/uniapp-vue2
# git add packages/weixin
# git add packages/mp-shared

git add examples/react
git add examples/vue2
git add examples/vue3
# git add examples/taro-react
# git add examples/taro-vue
# git add examples/taro-vue2
# git add examples/uniapp-vue
# git add examples/weixin
