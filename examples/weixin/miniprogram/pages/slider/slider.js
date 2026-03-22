Page({
  data: {
    status: ''
  },

  onSuccess() {
    this.setData({ status: '验证成功' })
    wx.showToast({ title: '验证成功', icon: 'success' })
  },

  onFail() {
    this.setData({ status: '验证失败' })
    wx.showToast({ title: '验证失败', icon: 'error' })
  }
})
