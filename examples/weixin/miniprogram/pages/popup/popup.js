/* global Page, wx */
Page({
	data: {
		status: '',
		captchaType: 'slider',
		backend: {
			getCaptcha: 'http://localhost:3001/api/captcha',
			verify: 'http://localhost:3001/api/captcha/verify',
			timeout: 10000,
		},
	},

	onShowSliderPopup() {
		this.setData({ captchaType: 'slider' })
		const popup = this.selectComponent('#popupCaptcha')
		if (popup) popup.show()
	},

	onShowClickPopup() {
		this.setData({ captchaType: 'click' })
		const popup = this.selectComponent('#popupCaptcha')
		if (popup) popup.show()
	},

	onHidePopup() {
		const popup = this.selectComponent('#popupCaptcha')
		if (popup) popup.hide()
	},

	onSuccess(_e) {
		this.setData({ status: '验证成功' })
		wx.showToast({ title: '验证成功', icon: 'success' })
	},

	onFail() {
		this.setData({ status: '验证失败' })
	},

	onOpen() {
		console.info('popup opened')
	},

	onClose() {
		console.info('popup closed')
	},

	onRefresh() {
		this.setData({ status: '' })
	},

	onError(err) {
		console.error('captcha error:', err)
		wx.showToast({ title: '加载失败', icon: 'error' })
	},
})
