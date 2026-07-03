const fs = require('fs')
const path = require('path')
const vm = require('vm')

const VALID_ENVS = new Set(['develop', 'trial', 'release'])
const FORBIDDEN_RELEASE_HOST_PARTS = ['localhost', '127.', '0.0.0.0', 'example.com', '.test', 'test-', '-test', 'trial']

function loadCommonJsConfig(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const module = { exports: {} }
  const sandbox = {
    module,
    exports: module.exports,
    require,
    console,
    process,
  }
  vm.runInNewContext(source, sandbox, { filename: filePath })
  return module.exports
}

function normalizeEnv(env) {
  if (env === 'development') return 'develop'
  if (env === 'test') return 'trial'
  if (env === 'production') return 'release'
  return env
}

function fail(message) {
  console.error(`[miniapp-api-config] ${message}`)
  process.exit(1)
}

function validateUrl(env, rawUrl) {
  if (!rawUrl) fail(`${env} API base URL is missing`)

  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch (error) {
    fail(`${env} API base URL is invalid: ${rawUrl}`)
  }

  if (env !== 'develop' && parsed.protocol !== 'https:') {
    fail(`${env} API base URL must use HTTPS: ${rawUrl}`)
  }

  if (env === 'release') {
    const hostname = parsed.hostname.toLowerCase()
    const forbiddenPart = FORBIDDEN_RELEASE_HOST_PARTS.find((part) => hostname.includes(part))
    if (forbiddenPart) {
      fail(`release API base URL uses forbidden host pattern "${forbiddenPart}": ${rawUrl}`)
    }
  }

  return parsed.origin
}

function validateNumber(name, value, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    fail(`${name} must be between ${min} and ${max}, got ${value}`)
  }
  return number
}

const projectRoot = path.resolve(__dirname, '..')
const configPath = path.join(projectRoot, 'config', 'api.env.js')
const config = loadCommonJsConfig(configPath)
const targetEnv = normalizeEnv(process.argv[2] || process.env.MINIAPP_ENV || config.RUNTIME_ENV || 'develop')

if (!VALID_ENVS.has(targetEnv)) {
  fail(`unknown env "${targetEnv}", expected develop, trial, or release`)
}

const envOverride = process.env.MINIAPP_API_BASE_URL
const bases = Object.assign({}, config.API_BASES)
if (envOverride) bases[targetEnv] = envOverride

const origin = validateUrl(targetEnv, bases[targetEnv])
const timeout = validateNumber('REQUEST_TIMEOUT_MS', config.REQUEST_TIMEOUT_MS || 12000, 3000, 60000)
const retryCount = validateNumber('REQUEST_RETRY_COUNT', config.REQUEST_RETRY_COUNT || 0, 0, 3)

console.log(
  JSON.stringify(
    {
      env: targetEnv,
      apiBaseUrl: origin,
      timeout,
      retryCount,
      demoFallbackEnabled: Boolean(config.ENABLE_DEMO_FALLBACK && targetEnv === 'develop'),
    },
    null,
    2,
  ),
)
