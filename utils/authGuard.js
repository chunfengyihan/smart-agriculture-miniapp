function hasLogin() {
  return !!wx.getStorageSync('token')
}

function buildUrl(path, query = {}) {
  const params = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&')

  return params ? `${path}?${params}` : path
}

function requireLogin(redirectUrl) {
  if (hasLogin()) {
    return true
  }

  if (redirectUrl) {
    wx.setStorageSync('postLoginRedirect', redirectUrl)
  }
  wx.setStorageSync('loginPrompt', '请先微信登录后使用智能工具')

  wx.switchTab({
    url: '/pages/profile/profile',
  })

  return false
}

function guardPage(path, query = {}) {
  return requireLogin(buildUrl(path, query))
}

module.exports = {
  buildUrl,
  guardPage,
  hasLogin,
  requireLogin,
}
