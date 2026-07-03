const STATUS_TEXT = {
  online: '在线',
  warning: '预警',
  offline: '离线',
  normal: '正常',
  critical: '严重',
  notice: '提示',
}

const RISK_TEXT = {
  normal: '正常',
  warning: '预警',
  critical: '严重',
  online: '在线',
  offline: '离线',
  notice: '提示',
}

function statusText(status) {
  return STATUS_TEXT[status] || status || '-'
}

function metricValue(metric) {
  if (!metric || metric.value === null || metric.value === undefined || Number.isNaN(Number(metric.value))) {
    return '-'
  }

  const value = Number(metric.value)
  if (metric.key === 'airTemp' || metric.key === 'soilTemp' || metric.unit === '°C') {
    return `${value.toFixed(1)}${metric.unit || ''}`
  }

  const formatted = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '')
  return `${formatted}${metric.unit || ''}`
}

function formatNumber(value, digits = 1, trimZero = true) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-'
  }

  const formatted = Number(value).toFixed(digits)
  return trimZero ? formatted.replace(/\.0$/, '') : formatted
}

function formatTemperature(value) {
  return formatNumber(value, 1, false)
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function summarizeCrop(crop) {
  const greenhouses = crop && crop.greenhouses ? crop.greenhouses : []
  const totalDevices = greenhouses.reduce((sum, greenhouse) => sum + (greenhouse.totalDevices || 0), 0)
  const onlineDevices = greenhouses.reduce((sum, greenhouse) => sum + (greenhouse.onlineDevices || 0), 0)
  const warningCount = greenhouses.filter((greenhouse) => greenhouse.status === 'warning').length
  const offlineCount = greenhouses.filter((greenhouse) => greenhouse.status === 'offline').length

  return {
    greenhouseCount: greenhouses.length,
    totalDevices,
    onlineDevices,
    warningCount,
    offlineCount,
  }
}

function normalizeMetrics(metrics) {
  return (metrics || []).map((metric) => ({
    ...metric,
    displayValue: metricValue(metric),
    statusLabel: RISK_TEXT[metric.status] || metric.status || '-',
  }))
}

function assetPath(path) {
  if (!path) return ''

  if (path.startsWith('/images/')) {
    return path.replace('/images/', '/assets/images/')
  }

  if (path.startsWith('images/')) {
    return `/${path.replace('images/', 'assets/images/')}`
  }

  return path
}

module.exports = {
  assetPath,
  formatNumber,
  formatTemperature,
  formatTime,
  metricValue,
  normalizeMetrics,
  statusText,
  summarizeCrop,
}
