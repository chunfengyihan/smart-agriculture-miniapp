const { getDashboardData } = require('../../services/dashboard')
const { assetPath, formatTime, metricValue, statusText, summarizeCrop } = require('../../utils/format')

Page({
  data: {
    loading: true,
    refreshing: false,
    error: '',
    generatedAt: '',
    source: '',
    crops: [],
    activeCropIndex: 0,
    activeCrop: null,
    cropSummary: null,
    greenhouses: [],
  },

  onLoad() {
    this.loadDashboard()
  },

  onPullDownRefresh() {
    this.loadDashboard({ refreshing: true }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadDashboard(options = {}) {
    this.setData({
      loading: !options.refreshing,
      refreshing: !!options.refreshing,
      error: '',
    })

    try {
      const dashboard = await getDashboardData()
      const crops = dashboard.crops || []
      const nextIndex = Math.min(this.data.activeCropIndex, Math.max(crops.length - 1, 0))

      this.setData({
        crops,
        activeCropIndex: nextIndex,
        generatedAt: formatTime(dashboard.generatedAt),
        source: dashboard.source || '-',
        loading: false,
        refreshing: false,
      })
      this.applyActiveCrop(nextIndex)
    } catch (error) {
      this.setData({
        error: error.message || '看板数据加载失败',
        loading: false,
        refreshing: false,
      })
    }
  },

  applyActiveCrop(index) {
    const rawActiveCrop = this.data.crops[index] || null
    const activeCrop = rawActiveCrop ? {
      ...rawActiveCrop,
      heroImage: assetPath(rawActiveCrop.heroImage),
    } : null
    const greenhouses = activeCrop && activeCrop.greenhouses ? activeCrop.greenhouses.map((greenhouse) => {
      const airTemp = (greenhouse.metrics || []).find((metric) => metric.key === 'airTemp')
      const airHumidity = (greenhouse.metrics || []).find((metric) => metric.key === 'airHumidity')
      const soilHumidity = (greenhouse.metrics || []).find((metric) => metric.key === 'soilHumidity')

      return {
        ...greenhouse,
        statusLabel: statusText(greenhouse.status),
        airTempText: metricValue(airTemp),
        airHumidityText: metricValue(airHumidity),
        soilHumidityText: metricValue(soilHumidity),
      }
    }) : []

    this.setData({
      activeCrop,
      cropSummary: activeCrop ? summarizeCrop(activeCrop) : null,
      greenhouses,
    })
  },

  onCropTap(event) {
    const index = Number(event.currentTarget.dataset.index)
    this.setData({
      activeCropIndex: index,
    })
    this.applyActiveCrop(index)
  },

  onGreenhouseTap(event) {
    const greenhouseId = event.currentTarget.dataset.id
    const cropId = this.data.activeCrop ? this.data.activeCrop.id : ''

    wx.navigateTo({
      url: `/pages/greenhouse/greenhouse?cropId=${cropId}&greenhouseId=${greenhouseId}`,
    })
  },

  onRetryTap() {
    this.loadDashboard()
  },
})
