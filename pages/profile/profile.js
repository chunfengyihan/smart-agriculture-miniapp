const { API_BASE_URL } = require('../../config/api')
const { loginWithWechat } = require('../../services/auth')

Page({
  data: {
    apiBaseUrl: API_BASE_URL,
    token: '',
    userInfo: null,
    loggingIn: false,
    message: '',
    showLoginPrompt: false,
  },

  onShow() {
    const loginPrompt = wx.getStorageSync('loginPrompt')
    const token = wx.getStorageSync('token') || ''
    if (loginPrompt) {
      wx.removeStorageSync('loginPrompt')
    }

    this.setData({
      token,
      userInfo: wx.getStorageSync('userInfo') || null,
      message: loginPrompt && token ? loginPrompt : this.data.message,
      showLoginPrompt: !!loginPrompt && !token,
    })
  },

  async onLoginTap() {
    this.setData({
      loggingIn: true,
      showLoginPrompt: false,
      message: '',
    })

    try {
      const result = await loginWithWechat()
      this.setData({
        token: wx.getStorageSync('token') || '',
        userInfo: result.user || null,
        loggingIn: false,
        message: result.demo ? '已进入演示登录' : '登录成功',
        showLoginPrompt: false,
      })

      this.openPostLoginRedirect()
    } catch (error) {
      this.setData({
        loggingIn: false,
        message: error.message || '登录失败',
      })
    }
  },

  onLogoutTap() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('postLoginRedirect')
    getApp().globalData.token = ''
    getApp().globalData.userInfo = null
    this.setData({
      token: '',
      userInfo: null,
      message: '已退出登录',
      showLoginPrompt: false,
    })
  },

  onDismissLoginPrompt() {
    wx.removeStorageSync('postLoginRedirect')
    this.setData({
      showLoginPrompt: false,
      message: '',
    })
  },

  openPostLoginRedirect() {
    const redirectUrl = wx.getStorageSync('postLoginRedirect')
    if (!redirectUrl) return

    wx.removeStorageSync('postLoginRedirect')
    setTimeout(() => {
      wx.navigateTo({
        url: redirectUrl,
      })
    }, 300)
  },
})
