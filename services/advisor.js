const { AGRI_CHAT_ENDPOINT, ENABLE_DEMO_FALLBACK } = require('../config/api')
const { request } = require('../utils/request')
const { metricSnapshot } = require('../utils/greenhouse')

function demoAdvisor(crop, greenhouse, question) {
  const hasWarning = greenhouse.status === 'warning'

  return {
    riskLevel: hasWarning ? 'medium' : 'low',
    summary: question
      ? `针对“${question}”，建议先复核 ${greenhouse.name} 的温湿度、土壤湿度和设备在线状态。`
      : `${greenhouse.name} 当前没有明显高风险信号，建议保持常规巡检。`,
    likelyCauses: hasWarning ? ['棚内环境指标接近阈值', '通风或滴灌策略需要复核'] : ['当前指标处于目标范围', '设备在线状态正常'],
    actions: ['查看最近 24 小时趋势', '现场复核传感器读数', '记录处理动作和复查时间'],
    watchItems: ['温度连续升高', '土壤湿度低于目标', '设备离线'],
    matchedRules: ['演示规则：环境指标 + 大棚状态'],
    disclaimer: '演示回答仅用于功能预览，不能替代现场农艺诊断。',
  }
}

async function askAdvisor(crop, greenhouse, question) {
  try {
    return await request({
      url: AGRI_CHAT_ENDPOINT,
      method: 'POST',
      data: {
        cropId: crop.id,
        cropName: crop.name,
        greenhouseId: greenhouse.id,
        greenhouseName: greenhouse.name,
        metrics: metricSnapshot(greenhouse.metrics),
        question,
      },
      timeout: 25000,
    })
  } catch (error) {
    if (ENABLE_DEMO_FALLBACK) {
      console.warn('Agri advisor failed, using demo data.', error)
      return demoAdvisor(crop, greenhouse, question)
    }

    throw error
  }
}

module.exports = {
  askAdvisor,
}
