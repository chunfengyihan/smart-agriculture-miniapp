const { getDashboardData } = require('../../services/dashboard')
const { getWeatherAdvice } = require('../../services/weather')
const { flattenGreenhouses } = require('../../utils/greenhouse')
const { formatTime } = require('../../utils/format')
const { guardPage } = require('../../utils/authGuard')

Page({
  data: {
    loading: true,
    adviceLoading: false,
    error: '',
    emptyMessage: '',
    options: [],
    optionLabels: [],
    selectedIndex: 0,
    selected: null,
    result: null,
    current: null,
    forecast: [],
    advice: null,
    initialCropId: '',
    initialGreenhouseId: '',
  },

  onLoad(query = {}) {
    if (!guardPage('/pages/weather/weather', query)) return

    this.setData({
      initialCropId: query.cropId || '',
      initialGreenhouseId: query.greenhouseId || '',
    })
    this.loadOptions()
  },

  async loadOptions() {
    this.setData({ loading: true, error: '', emptyMessage: '' })

    try {
      const dashboard = await getDashboardData()
      const options = flattenGreenhouses(dashboard)

      if (!options.length) {
        this.setData({
          options: [],
          optionLabels: [],
          selected: null,
          result: null,
          current: null,
          forecast: [],
          advice: null,
          emptyMessage: '暂无可用大棚，暂不能生成天气建议。',
          loading: false,
        })
        return
      }

      const selectedIndex = this.findInitialIndex(options)

      this.setData({
        options,
        optionLabels: options.map((item) => item.label),
        selectedIndex,
        selected: options[selectedIndex],
        emptyMessage: '',
        loading: false,
      })
      this.loadAdvice()
    } catch (error) {
      this.setData({
        loading: false,
        error: error.message || '加载大棚失败',
        emptyMessage: '',
      })
    }
  },

  findInitialIndex(options) {
    const index = options.findIndex(
      (item) =>
        item.crop.id === this.data.initialCropId &&
        item.greenhouse.id === this.data.initialGreenhouseId,
    )
    return index >= 0 ? index : 0
  },

  onPickerChange(event) {
    const selectedIndex = Number(event.detail.value)
    this.setData({
      selectedIndex,
      selected: this.data.options[selectedIndex],
      result: null,
      current: null,
      forecast: [],
      advice: null,
    })
    this.loadAdvice()
  },

  async loadAdvice() {
    const selected = this.data.selected
    if (!selected) return

    this.setData({ adviceLoading: true, error: '', emptyMessage: '' })

    try {
      const result = await getWeatherAdvice(selected.crop, selected.greenhouse)
      this.setData({
        result,
        current: {
          ...result.weather.current,
          timeText: formatTime(result.weather.current.time),
        },
        forecast: (result.weather.forecast || []).map((day) => ({
          ...day,
          tempText: `${day.temperatureMin ?? '-'}-${day.temperatureMax ?? '-'}°C`,
          rainText: `${day.precipitationProbabilityMax ?? '-'}%`,
        })),
        advice: result.advice,
        adviceLoading: false,
      })
    } catch (error) {
      this.setData({
        adviceLoading: false,
        error: error.message || '天气建议加载失败',
      })
    }
  },

  onRetryTap() {
    if (this.data.options.length) {
      this.loadAdvice()
    } else {
      this.loadOptions()
    }
  },
})
