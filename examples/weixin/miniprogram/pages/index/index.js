/* global Page, wx */
Page({
  data: {
    isDark: false,
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

  toggleTheme() {
    const isDark = !this.data.isDark
    this.setData({ isDark })
    try {
      wx.setStorageSync('cp-theme', isDark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  },
})
