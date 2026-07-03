const { API_BASE_URL, REQUEST_RETRY_COUNT, REQUEST_TIMEOUT_MS } = require('../config/api')

function getToken() {
  return wx.getStorageSync('token') || ''
}

function isObject(value) {
  return value && typeof value === 'object'
}

function createRequestError(message, options = {}) {
  const error = new Error(message)
  error.statusCode = options.statusCode || 0
  error.code = String(options.code || options.statusCode || 'REQUEST_FAILED')
  error.details = options.details || {}
  error.requestId = options.requestId || ''
  return error
}

function unwrapResponse(body) {
  if (isObject(body) && Object.prototype.hasOwnProperty.call(body, 'code')) {
    if (body.code === 0 && Object.prototype.hasOwnProperty.call(body, 'data')) {
      return body.data
    }

    throw createRequestError(body.message || 'Request failed', {
      code: body.code,
      details: body.details || body.data || {},
      requestId: body.request_id || '',
    })
  }

  return body
}

function errorFromResponse(response) {
  const body = response.data

  if (isObject(body) && Object.prototype.hasOwnProperty.call(body, 'code')) {
    return createRequestError(body.message || `Request failed ${response.statusCode}`, {
      statusCode: response.statusCode,
      code: body.code,
      details: body.details || body.data || {},
      requestId: body.request_id || '',
    })
  }

  if (isObject(body) && body.message) {
    return createRequestError(body.message, {
      statusCode: response.statusCode,
      details: body,
    })
  }

  return createRequestError(`Request failed ${response.statusCode}`, {
    statusCode: response.statusCode,
    details: body || {},
  })
}

function shouldRetry(error) {
  if (!error) return false
  if (!error.statusCode) return true
  return error.statusCode >= 500
}

function requestOnce(options) {
  const token = getToken()
  const header = Object.assign(
    {
      'content-type': 'application/json',
    },
    options.header || {},
  )

  if (token && !header.Authorization) {
    header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || REQUEST_TIMEOUT_MS,
      header,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(unwrapResponse(response.data))
          } catch (error) {
            error.statusCode = error.statusCode || response.statusCode
            reject(error)
          }
          return
        }

        reject(errorFromResponse(response))
      },
      fail(error) {
        reject(createRequestError(error.errMsg || 'Network request failed', { details: error }))
      },
    })
  })
}

async function request(options) {
  const retryCount = Number.isFinite(Number(options.retryCount))
    ? Number(options.retryCount)
    : REQUEST_RETRY_COUNT
  const maxAttempts = Math.max(1, Math.min(4, retryCount + 1))
  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await requestOnce(options)
    } catch (error) {
      lastError = error
      if (attempt >= maxAttempts || !shouldRetry(error)) break
      console.warn('[request] retrying failed request', {
        url: options.url,
        attempt,
        maxAttempts,
        statusCode: error.statusCode || 0,
        code: error.code || '',
      })
    }
  }

  throw lastError
}

module.exports = {
  createRequestError,
  request,
  unwrapResponse,
}
