const ENV = 'development'

const API_HOSTS = {
  development: 'http://127.0.0.1:8000',
  test: 'https://test.example.com',
  production: 'https://api.example.com',
}

module.exports = {
  ENV,
  API_BASE_URL: API_HOSTS[ENV],
  DASHBOARD_ENDPOINT: '/api/v1/greenhouse/dashboard',
  WEATHER_ADVICE_ENDPOINT: '/api/v1/weather/greenhouse-advice',
  CROP_DIAGNOSIS_ENDPOINT: '/api/v1/ai/crop-diagnosis',
  AGRI_CHAT_ENDPOINT: '/api/v1/ai/agri-chat',
  WECHAT_LOGIN_ENDPOINT: '/api/v1/auth/wechat-login',
  ENABLE_DEMO_FALLBACK: true,
}
