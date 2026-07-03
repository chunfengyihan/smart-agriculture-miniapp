const { getDashboardData } = require('../../services/dashboard')
const { formatNumber, formatTemperature, formatTime, normalizeMetrics, statusText } = require('../../utils/format')
const { requireLogin } = require('../../utils/authGuard')

Page({
  data: {
    cropId: '',
    greenhouseId: '',
    loading: true,
    error: '',
    crop: null,
    greenhouse: null,
    metrics: [],
    trend: [],
    alerts: [],
    generatedAt: '',
  },

  onLoad(query) {
    this.setData({
      cropId: query.cropId || '',
      greenhouseId: query.greenhouseId || '',
    })
    this.loadDetail()
  },

  onPullDownRefresh() {
    this.loadDetail().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadDetail() {
    this.setData({
      loading: true,
      error: '',
    })

    try {
      const dashboard = await getDashboardData()
      const crops = dashboard.crops || []
      const crop = crops.find((item) => item.id === this.data.cropId) || crops[0] || null
      const greenhouses = crop && crop.greenhouses ? crop.greenhouses : []
      const greenhouse =
        greenhouses.find((item) => item.id === this.data.greenhouseId) || greenhouses[0] || null

      if (!crop || !greenhouse) {
        throw new Error('未找到大棚数据')
      }

      wx.setNavigationBarTitle({
        title: greenhouse.name,
      })

      this.setData({
        crop,
        greenhouse: {
          ...greenhouse,
          statusLabel: statusText(greenhouse.status),
        },
        metrics: normalizeMetrics(greenhouse.metrics),
        trend: (greenhouse.trend || []).slice(-8).map((point) => ({
          ...point,
          timeText: formatTime(point.time),
          airTempText: formatTemperature(point.airTemp),
          airHumidityText: formatNumber(point.airHumidity),
          soilHumidityText: formatNumber(point.soilHumidity),
        })),
        alerts: (greenhouse.alerts || []).map((alert) => ({
          ...alert,
          levelLabel: statusText(alert.level),
          timeText: formatTime(alert.time),
        })),
        generatedAt: formatTime(dashboard.generatedAt),
        loading: false,
      }, () => {
        this.drawTrendChart()
      })
    } catch (error) {
      this.setData({
        error: error.message || '大棚详情加载失败',
        loading: false,
      })
    }
  },

  onRetryTap() {
    this.loadDetail()
  },

  onToolTap(event) {
    const type = event.currentTarget.dataset.type
    const paths = {
      weather: '/pages/weather/weather',
      diagnosis: '/pages/diagnosis/diagnosis',
      advisor: '/pages/advisor/advisor',
    }
    const path = paths[type]

    if (!path || !this.data.crop || !this.data.greenhouse) return

    const url = `${path}?cropId=${this.data.crop.id}&greenhouseId=${this.data.greenhouse.id}`
    if (!requireLogin(url)) return

    wx.navigateTo({ url })
  },

  drawTrendChart() {
    const trend = this.data.trend || []
    if (!trend.length) return

    const query = wx.createSelectorQuery().in(this)
    query
      .select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec((result) => {
        const canvasInfo = result && result[0]
        if (!canvasInfo || !canvasInfo.node) return

        const canvas = canvasInfo.node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio || 1
        const width = canvasInfo.width
        const height = canvasInfo.height

        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, width, height)

        const padding = { top: 22, right: 18, bottom: 30, left: 34 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        const series = [
          { key: 'airTemp', color: '#0f7a4c', label: '气温' },
          { key: 'airHumidity', color: '#2864a8', label: '湿度' },
          { key: 'soilHumidity', color: '#c98700', label: '土壤' },
        ]
        const values = trend
          .flatMap((point) => series.map((item) => point[item.key]))
          .filter((value) => value !== null && value !== undefined && !Number.isNaN(Number(value)))
          .map(Number)

        if (!values.length) return

        const min = Math.min(...values)
        const max = Math.max(...values)
        const range = max - min || 1

        ctx.strokeStyle = '#e4ece6'
        ctx.lineWidth = 1
        ctx.font = '11px sans-serif'
        ctx.fillStyle = '#6b7d70'

        for (let i = 0; i <= 3; i += 1) {
          const y = padding.top + (chartHeight / 3) * i
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
        }

        series.forEach((item) => {
          const points = trend
            .map((point, index) => {
              const value = point[item.key]
              if (value === null || value === undefined || Number.isNaN(Number(value))) return null
              const x = padding.left + (trend.length === 1 ? chartWidth / 2 : (chartWidth / (trend.length - 1)) * index)
              const y = padding.top + chartHeight - ((Number(value) - min) / range) * chartHeight
              return { x, y }
            })
            .filter(Boolean)

          if (!points.length) return

          ctx.beginPath()
          ctx.strokeStyle = item.color
          ctx.lineWidth = 2
          points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y)
            else ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()

          ctx.fillStyle = item.color
          points.forEach((point) => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
            ctx.fill()
          })
        })

        ctx.fillStyle = '#6b7d70'
        const first = trend[0]
        const last = trend[trend.length - 1]
        if (first) ctx.fillText(first.timeText.slice(6), padding.left, height - 10)
        if (last) ctx.fillText(last.timeText.slice(6), width - padding.right - 42, height - 10)
      })
  },
})
