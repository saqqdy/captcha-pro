import { execSync } from 'node:child_process'

const packages = [
	'core',
	'mp-shared',
	'react',
	'taro-react',
	'taro-vue',
	'taro-vue2',
	'uniapp-vue',
	'uniapp-vue2',
	'vue',
	'vue2',
	'weixin',
]

for (const pkg of packages) {
	execSync(
		`curl -sX PUT -d "sync_upstream=true" "https://registry-direct.npmmirror.com/@captcha-pro/${pkg}/sync"`,
		{
			stdio: 'inherit',
		}
	)
}
