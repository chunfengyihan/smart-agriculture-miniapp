const { WECHAT_LOGIN_ENDPOINT } = require('../config/api')
const { handleDemoFallback } = require('../utils/demoFallback')
const { request } = require('../utils/request')

function createDemoLoginResult() {
  return {
    token: `demo-token-${Date.now()}`,
    user: {
      id: 'demo-user',
      nickname: '演示用户',
      role: 'viewer',
    },
    demo: true,
  }
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(result) {
        if (result.code) {
          resolve(result.code)
          return
        }

        reject(new Error('未获取到微信登录 code'))
      },
      fail(error) {
        reject(new Error(error.errMsg || '微信登录失败'))
      },
    })
  })
}

async function loginWithWechat() {
  const code = await wxLogin()
  let result

  try {
    result = await request({
      url: WECHAT_LOGIN_ENDPOINT,
      method: 'POST',
      data: { code },
    })
  } catch (error) {
    result = handleDemoFallback('wechat-login', 'wechat login', error, createDemoLoginResult)
  }

  const accessToken = result.access || result.accessToken || result.token
  const refreshToken = result.refresh || result.refreshToken

  if (accessToken) {
    wx.setStorageSync('token', accessToken)
  }

  if (refreshToken) {
    wx.setStorageSync('refreshToken', refreshToken)
  }

  if (result.user) {
    wx.setStorageSync('userInfo', result.user)
  }

  return result
}

module.exports = {
  loginWithWechat,
}
