const { WEATHER_ADVICE_ENDPOINT } = require('../config/api')
const { findLocation } = require('../data/greenhouseLocations')
const { handleDemoFallback } = require('../utils/demoFallback')
const { request } = require('../utils/request')
const { metricSnapshot } = require('../utils/greenhouse')

function demoWeatherAdvice(crop, greenhouse) {
  const now = new Date()
  const days = Array.from({ length: 3 }, (_, index) => {
    const date = new Date(now.getTime() + index * 24 * 60 * 60 * 1000)
    return {
      date: date.toISOString().slice(0, 10),
      description: index === 0 ? '多云' : index === 1 ? '晴' : '小雨',
      temperatureMax: 27 + index,
      temperatureMin: 18 + index,
      precipitationProbabilityMax: index === 2 ? 65 : 20,
      windSpeedMax: 18 + index * 3,
    }
  })

  return {
    cacheKey: 'demo-weather',
    cachedAt: now.toISOString(),
    weather: {
      source: 'Open-Meteo',
      sourceUrl: '',
      generatedAt: now.toISOString(),
      location: findLocation(crop.id, greenhouse.id),
      current: {
        time: now.toISOString(),
        temperature: 25.6,
        apparentTemperature: 26.1,
        humidity: 68,
        precipitation: 0,
        windSpeed: 12,
        weatherCode: 3,
        description: '多云',
      },
      forecast: days,
    },
    advice: {
      riskLevel: greenhouse.status === 'warning' ? 'medium' : 'low',
      summary: `${greenhouse.name} 当前环境整体可控，建议结合棚内温湿度安排通风和灌溉。`,
      actions: ['上午巡检通风口与遮阳状态', '土壤湿度低于目标下限时补充滴灌', '降雨前检查棚膜和排水沟'],
      watchItems: ['午后高温', '夜间湿度回升', '设备离线告警'],
      disclaimer: '演示建议仅用于功能预览，生产决策请结合现场农艺判断。',
    },
    adviceError: null,
  }
}

async function getWeatherAdvice(crop, greenhouse) {
  const location = findLocation(crop.id, greenhouse.id)

  try {
    return await request({
      url: WEATHER_ADVICE_ENDPOINT,
      method: 'POST',
      data: {
        cropId: crop.id,
        cropName: crop.name,
        greenhouseId: greenhouse.id,
        greenhouseName: greenhouse.name,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        metrics: metricSnapshot(greenhouse.metrics),
        includeAdvice: true,
      },
      timeout: 18000,
    })
  } catch (error) {
    return handleDemoFallback('weather-advice', 'weather advice', error, () => demoWeatherAdvice(crop, greenhouse))
  }
}

module.exports = {
  getWeatherAdvice,
}
