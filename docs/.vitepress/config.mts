import { defineConfig } from 'vitepress'

export default defineConfig({
	base: '/captcha-pro/',
	title: 'captcha-pro',
	description: 'A lightweight, framework-agnostic behavioral captcha library',

	head: [
		['link', { rel: 'icon', href: '/logo.svg' }],
	],

	themeConfig: {
		logo: '/logo.svg',

		nav: [
			{ text: 'Guide', link: '/guide/getting-started' },
			{ text: 'Components', link: '/components/' },
			{ text: 'Platforms', link: '/platforms/' },
			{ text: 'API', link: '/api/' },
			{ text: 'Backend', link: '/backend/' },
			{
				text: 'v2.0.0',
				items: [
					{ text: 'Changelog', link: 'https://github.com/saqqdy/captcha-pro/blob/master/CHANGELOG.md' },
					{ text: 'GitHub', link: 'https://github.com/saqqdy/captcha-pro' },
				],
			},
		],

		sidebar: {
			'/guide/': [
				{
					text: 'Guide',
					items: [
						{ text: 'Getting Started', link: '/guide/getting-started' },
						{ text: 'Basic Usage', link: '/guide/basic-usage' },
						{ text: 'Advanced Usage', link: '/guide/advanced-usage' },
						{ text: 'Internationalization', link: '/guide/i18n' },
						{ text: 'Migration from v1', link: '/guide/migration' },
					],
				},
			],
			'/components/': [
				{
					text: 'Captcha Types',
					items: [
						{ text: 'Overview', link: '/components/' },
						{ text: 'Slider Captcha', link: '/components/slider' },
						{ text: 'Click Captcha', link: '/components/click' },
						{ text: 'Popup Captcha', link: '/components/popup' },
						{ text: 'Invisible Captcha', link: '/components/invisible' },
					],
				},
			],
			'/platforms/': [
				{
					text: 'Platforms',
					items: [
						{ text: 'Overview', link: '/platforms/' },
						{ text: 'Vue', link: '/platforms/vue' },
						{ text: 'React', link: '/platforms/react' },
						{ text: 'Mini-Programs', link: '/platforms/mini-programs' },
						{ text: 'Native (Flutter / Android / iOS)', link: '/platforms/native' },
					],
				},
			],
			'/api/': [
				{
					text: 'API Reference',
					items: [
						{ text: 'Overview', link: '/api/' },
						{ text: 'Options', link: '/api/options' },
						{ text: 'Methods', link: '/api/methods' },
					],
				},
			],
			'/backend/': [
				{
					text: 'Backend',
					items: [
						{ text: 'Overview', link: '/backend/' },
						{ text: 'Node.js', link: '/backend/node' },
						{ text: 'Java', link: '/backend/java' },
						{ text: 'Go', link: '/backend/go' },
					],
				},
			],
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/saqqdy/captcha-pro' },
		],

		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2026-present saqqdy',
		},

		search: {
			provider: 'local',
		},

		editLink: {
			pattern: 'https://github.com/saqqdy/captcha-pro/edit/master/docs/:path',
			text: 'Edit this page on GitHub',
		},
	},

	locales: {
		root: {
			label: 'English',
			lang: 'en',
		},
		zh: {
			label: '简体中文',
			lang: 'zh-CN',
			link: '/zh/',
			themeConfig: {
				nav: [
					{ text: '指南', link: '/zh/guide/getting-started' },
					{ text: '验证码类型', link: '/zh/components/' },
					{ text: '多平台', link: '/zh/platforms/' },
					{ text: 'API', link: '/zh/api/' },
					{ text: '后端', link: '/zh/backend/' },
					{
						text: 'v2.0.0',
						items: [
							{ text: '更新日志', link: 'https://github.com/saqqdy/captcha-pro/blob/master/CHANGELOG.md' },
							{ text: 'GitHub', link: 'https://github.com/saqqdy/captcha-pro' },
						],
					},
				],
				sidebar: {
					'/zh/guide/': [
						{
							text: '指南',
							items: [
								{ text: '快速开始', link: '/zh/guide/getting-started' },
								{ text: '基础用法', link: '/zh/guide/basic-usage' },
								{ text: '进阶用法', link: '/zh/guide/advanced-usage' },
								{ text: '多语言', link: '/zh/guide/i18n' },
								{ text: '从 v1 升级', link: '/zh/guide/migration' },
							],
						},
					],
					'/zh/components/': [
						{
							text: '验证码类型',
							items: [
								{ text: '总览', link: '/zh/components/' },
								{ text: '滑动拼图', link: '/zh/components/slider' },
								{ text: '点选文字', link: '/zh/components/click' },
								{ text: '弹窗验证码', link: '/zh/components/popup' },
								{ text: '智能无感', link: '/zh/components/invisible' },
							],
						},
					],
					'/zh/platforms/': [
						{
							text: '多平台',
							items: [
								{ text: '总览', link: '/zh/platforms/' },
								{ text: 'Vue', link: '/zh/platforms/vue' },
								{ text: 'React', link: '/zh/platforms/react' },
								{ text: '小程序', link: '/zh/platforms/mini-programs' },
								{ text: '原生（Flutter / Android / iOS）', link: '/zh/platforms/native' },
							],
						},
					],
					'/zh/api/': [
						{
							text: 'API 参考',
							items: [
								{ text: '总览', link: '/zh/api/' },
								{ text: '选项', link: '/zh/api/options' },
								{ text: '方法', link: '/zh/api/methods' },
							],
						},
					],
					'/zh/backend/': [
						{
							text: '后端',
							items: [
								{ text: '总览', link: '/zh/backend/' },
								{ text: 'Node.js', link: '/zh/backend/node' },
								{ text: 'Java', link: '/zh/backend/java' },
								{ text: 'Go', link: '/zh/backend/go' },
							],
						},
					],
				},
				editLink: {
					pattern: 'https://github.com/saqqdy/captcha-pro/edit/master/docs/:path',
					text: '在 GitHub 上编辑此页',
				},
				footer: {
					message: '基于 MIT 许可发布。',
					copyright: 'Copyright © 2026-present saqqdy',
				},
			},
		},
	},
})
