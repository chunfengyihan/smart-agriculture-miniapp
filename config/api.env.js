module.exports = {
  RUNTIME_ENV: 'develop',
  API_BASES: {
    develop: 'http://127.0.0.1:8000',
    trial: 'https://trial-api.smart-agri.cn',
    release: '',
  },
  REQUEST_TIMEOUT_MS: 12000,
  REQUEST_RETRY_COUNT: 1,
  ENABLE_DEMO_FALLBACK: true,
}
