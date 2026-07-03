const { getDashboardData } = require('../../services/dashboard')
const { formatTime, statusText } = require('../../utils/format')

Page({
  data: {
    loading: true,
    error: '',
    activeFilter: 'all',
    filters: [
      { key: 'all', label: '全部' },
      { key: 'warning', label: '预警' },
      { key: 'critical', label: '严重' },
    ],
    alerts: [],
    visibleAlerts: [],
    summary: {
      total: 0,
      warning: 0,
      critical: 0,
    },
  },

  onLoad() {
    this.loadAlerts()
  },

  onPullDownRefresh() {
    this.loadAlerts().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadAlerts() {
    this.setData({ loading: true, error: '' })

    try {
      const dashboard = await getDashboardData()
      const alerts = []

      for (const crop of dashboard.crops || []) {
        for (const greenhouse of crop.greenhouses || []) {
          for (const alert of greenhouse.alerts || []) {
            alerts.push({
              ...alert,
              cropId: crop.id,
              cropName: crop.name,
              greenhouseId: greenhouse.id,
              greenhouseName: greenhouse.name,
              area: greenhouse.area,
              levelLabel: statusText(alert.level),
              timeText: formatTime(alert.time),
            })
          }
        }
      }

      alerts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      this.setData({
        loading: false,
        alerts,
        summary: {
          total: alerts.length,
          warning: alerts.filter((item) => item.level === 'warning').length,
          critical: alerts.filter((item) => item.level === 'critical').length,
        },
      })
      this.applyFilter()
    } catch (error) {
      this.setData({
        loading: false,
        error: error.message || '预警加载失败',
      })
    }
  },

  onFilterTap(event) {
    this.setData({
      activeFilter: event.currentTarget.dataset.filter,
    })
    this.applyFilter()
  },

  applyFilter() {
    const activeFilter = this.data.activeFilter
    const visibleAlerts =
      activeFilter === 'all'
        ? this.data.alerts
        : this.data.alerts.filter((item) => item.level === activeFilter)

    this.setData({ visibleAlerts })
  },

  onAlertTap(event) {
    const index = Number(event.currentTarget.dataset.index)
    const alert = this.data.visibleAlerts[index]
    if (!alert) return

    wx.navigateTo({
      url: `/pages/greenhouse/greenhouse?cropId=${alert.cropId}&greenhouseId=${alert.greenhouseId}`,
    })
  },
})
