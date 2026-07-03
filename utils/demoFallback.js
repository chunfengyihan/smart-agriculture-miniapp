const { ENABLE_DEMO_FALLBACK, ENV } = require('../config/api')

function getRuntimeEnvVersion() {
  try {
    if (typeof wx === 'undefined' || !wx.getAccountInfoSync) return ''
    const account = wx.getAccountInfoSync()
    return (account && account.miniProgram && account.miniProgram.envVersion) || ''
  } catch (error) {
    return ''
  }
}

function isDevelopmentRuntime() {
  const envVersion = getRuntimeEnvVersion()
  if (envVersion) return envVersion === 'develop'
  return ENV === 'develop' || ENV === 'development'
}

function canUseDemoFallback() {
  return Boolean(ENABLE_DEMO_FALLBACK && isDevelopmentRuntime())
}

function errorSummary(error) {
  if (!error) return 'unknown error'

  const parts = []
  if (error.statusCode) parts.push(`HTTP ${error.statusCode}`)
  if (error.code) parts.push(String(error.code))
  if (error.message) parts.push(error.message)
  if (error.requestId) parts.push(`requestId=${error.requestId}`)
  return parts.length ? parts.join(' | ') : String(error)
}

function logDemoFallback(serviceName, enabled, error) {
  const payload = {
    serviceName,
    enabled,
    configEnv: ENV,
    runtimeEnv: getRuntimeEnvVersion() || 'unknown',
    error: errorSummary(error),
  }

  if (enabled) {
    console.warn('[demo-fallback] enabled', payload)
  } else {
    console.error('[demo-fallback] disabled', payload)
  }
}

function createServiceError(serviceLabel, error) {
  const summary = errorSummary(error)
  const nextError = new Error(`${serviceLabel} request failed: ${summary}`)
  nextError.statusCode = error && error.statusCode ? error.statusCode : 0
  nextError.code = error && error.code ? error.code : 'SERVICE_REQUEST_FAILED'
  nextError.details = error && error.details ? error.details : {}
  nextError.requestId = error && error.requestId ? error.requestId : ''
  nextError.cause = error
  return nextError
}

function handleDemoFallback(serviceName, serviceLabel, error, createDemoData) {
  const enabled = canUseDemoFallback()
  logDemoFallback(serviceName, enabled, error)

  if (enabled) {
    return createDemoData()
  }

  throw createServiceError(serviceLabel, error)
}

module.exports = {
  canUseDemoFallback,
  createServiceError,
  getRuntimeEnvVersion,
  handleDemoFallback,
  isDevelopmentRuntime,
}
