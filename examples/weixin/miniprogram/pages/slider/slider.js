/* global Page, wx */
Page({
	data: {
		status: '',
		backend: {
			getCaptcha: 'http://localhost:3001/api/captcha',
			verify: 'http://localhost:3001/api/captcha/verify',
			timeout: 10000,
		},
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
