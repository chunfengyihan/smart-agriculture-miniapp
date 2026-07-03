const ENV_CONFIG = require('./api.env')

const RUNTIME_ENV_ALIASES = {
  development: 'develop',
  develop: 'develop',
  test: 'trial',
  trial: 'trial',
  production: 'release',
  release: 'release',
}

function normalizeEnv(env) {
  return RUNTIME_ENV_ALIASES[env] || 'develop'
}

function getRuntimeEnvVersion() {
  try {
    if (typeof wx === 'undefined' || !wx.getAccountInfoSync) return ''
    const account = wx.getAccountInfoSync()
    return (account && account.miniProgram && account.miniProgram.envVersion) || ''
  } catch (error) {
    return ''
  }
}

function getCurrentEnv() {
  return normalizeEnv(getRuntimeEnvVersion() || ENV_CONFIG.RUNTIME_ENV)
}

function getApiBaseUrl(env = getCurrentEnv()) {
  const normalizedEnv = normalizeEnv(env)
  const apiBaseUrl = ENV_CONFIG.API_BASES && ENV_CONFIG.API_BASES[normalizedEnv]
  if (!apiBaseUrl) {
    throw new Error(`Missing API base URL for miniapp env: ${normalizedEnv}`)
  }
  return apiBaseUrl.replace(/\/+$/, '')
}

const ENV = getCurrentEnv()

module.exports = {
  ENV,
  BUILD_ENV: normalizeEnv(ENV_CONFIG.RUNTIME_ENV),
  API_BASES: ENV_CONFIG.API_BASES,
  API_BASE_URL: getApiBaseUrl(ENV),
  REQUEST_TIMEOUT_MS: Number(ENV_CONFIG.REQUEST_TIMEOUT_MS || 12000),
  REQUEST_RETRY_COUNT: Number(ENV_CONFIG.REQUEST_RETRY_COUNT || 0),
  DASHBOARD_ENDPOINT: '/api/v1/greenhouse/dashboard',
  WEATHER_ADVICE_ENDPOINT: '/api/v1/weather/greenhouse-advice',
  CROP_DIAGNOSIS_ENDPOINT: '/api/v1/ai/crop-diagnosis',
  AGRI_CHAT_ENDPOINT: '/api/v1/ai/agri-chat',
  WECHAT_LOGIN_ENDPOINT: '/api/v1/auth/wechat-login',
  ENABLE_DEMO_FALLBACK: Boolean(ENV_CONFIG.ENABLE_DEMO_FALLBACK && ENV === 'develop'),
  getApiBaseUrl,
  getCurrentEnv,
}
