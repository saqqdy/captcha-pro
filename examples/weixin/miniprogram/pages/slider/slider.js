/* global Page, wx */
Page({
	data: {
		isDark: false,
		status: '',
		backend: {
			getCaptcha: 'http://localhost:3001/api/captcha',
			verify: 'http://localhost:3001/api/captcha/verify',
			timeout: 10000,
		},
	},

	onLoad() {
		try {
			const saved = wx.getStorageSync('cp-theme')
			const systemDark = wx.getSystemInfoSync().theme === 'dark'
			this.setData({ isDark: saved === 'dark' || (saved !== 'light' && systemDark) })
		} catch {
			// ignore
		}
	},

	onSuccess(_e) {
		this.setData({ status: '验证成功' })
		wx.showToast({ title: '验证成功', icon: 'success' })
	},

	onFail() {
		this.setData({ status: '验证失败' })
		wx.showToast({ title: '验证失败', icon: 'error' })
	},

	onRefresh() {
		this.setData({ status: '' })
	},

	onError(err) {
		console.error('captcha error:', err)
		wx.showToast({ title: '加载失败', icon: 'error' })
	},
})
