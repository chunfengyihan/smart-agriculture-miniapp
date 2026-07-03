const { DASHBOARD_ENDPOINT } = require('../config/api')
const { createDemoDashboard } = require('../data/demoDashboard')
const { handleDemoFallback } = require('../utils/demoFallback')
const { request } = require('../utils/request')

async function getDashboardData() {
  try {
    return await request({
      url: DASHBOARD_ENDPOINT,
      method: 'GET',
    })
  } catch (error) {
    return handleDemoFallback('dashboard', 'dashboard data', error, createDemoDashboard)
  }
}

module.exports = {
  getDashboardData,
}
