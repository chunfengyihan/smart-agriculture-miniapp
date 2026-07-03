const { DASHBOARD_ENDPOINT, ENABLE_DEMO_FALLBACK } = require('../config/api')
const { createDemoDashboard } = require('../data/demoDashboard')
const { request } = require('../utils/request')

async function getDashboardData() {
  try {
    return await request({
      url: DASHBOARD_ENDPOINT,
      method: 'GET',
    })
  } catch (error) {
    if (ENABLE_DEMO_FALLBACK) {
      console.warn('Dashboard API failed, using demo data.', error)
      return createDemoDashboard()
    }

    throw error
  }
}

module.exports = {
  getDashboardData,
}
