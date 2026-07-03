const { getDashboardData } = require('../../services/dashboard')
const { diagnoseCrop } = require('../../services/diagnosis')
const { flattenGreenhouses } = require('../../utils/greenhouse')
const { guardPage } = require('../../utils/authGuard')

Page({
  data: {
    loading: true,
    diagnosing: false,
    error: '',
    options: [],
    optionLabels: [],
    selectedIndex: 0,
    selected: null,
    imagePath: '',
    useEnvironmentContext: true,
    result: null,
    initialCropId: '',
    initialGreenhouseId: '',
  },

  onLoad(query = {}) {
    if (!guardPage('/pages/diagnosis/diagnosis', query)) return

    this.setData({
      initialCropId: query.cropId || '',
      initialGreenhouseId: query.greenhouseId || '',
    })
    this.loadOptions()
  },

  async loadOptions() {
    this.setData({ loading: true, error: '' })

    try {
      const dashboard = await getDashboardData()
      const options = flattenGreenhouses(dashboard)

      if (!options.length) {
        throw new Error('暂无可用大棚')
      }

      const selectedIndex = this.findInitialIndex(options)

      this.setData({
        options,
        optionLabels: options.map((item) => item.label),
        selectedIndex,
        selected: options[selectedIndex],
        loading: false,
      })
    } catch (error) {
      this.setData({
        loading: false,
        error: error.message || '加载大棚失败',
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
    })
  },

  onContextChange(event) {
    this.setData({
      useEnvironmentContext: event.detail.value,
    })
  },

  onChooseImageTap() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const file = result.tempFiles && result.tempFiles[0]
        if (file) {
          this.setData({
            imagePath: file.tempFilePath,
            result: null,
          })
        }
      },
    })
  },

  async onDiagnoseTap() {
    if (!this.data.selected) {
      this.setData({ error: '请先选择大棚' })
      return
    }

    if (!this.data.imagePath) {
      this.setData({ error: '请先选择作物图片' })
      return
    }

    this.setData({ diagnosing: true, error: '', result: null })

    try {
      const result = await diagnoseCrop(
        this.data.selected.crop,
        this.data.selected.greenhouse,
        this.data.imagePath,
        this.data.useEnvironmentContext,
      )
      this.setData({
        result,
        diagnosing: false,
      })
    } catch (error) {
      this.setData({
        diagnosing: false,
        error: error.message || '图片诊断失败',
      })
    }
  },
})
