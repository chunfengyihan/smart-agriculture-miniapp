const { API_BASE_URL } = require('../config/api')

function getToken() {
  return wx.getStorageSync('token') || ''
}

function unwrapResponse(body) {
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data') && body.code === 0) {
    return body.data
  }

  return body
}

function request(options) {
  const token = getToken()
  const header = Object.assign(
    {
      'content-type': 'application/json',
    },
    options.header || {},
  )

  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || 12000,
      header,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(unwrapResponse(response.data))
          return
        }

        reject(new Error(response.data && response.data.message ? response.data.message : `请求失败 ${response.statusCode}`))
      },
      fail(error) {
        reject(new Error(error.errMsg || '网络请求失败'))
      },
    })
  })
}

module.exports = {
  request,
}
