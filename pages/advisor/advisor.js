const { getDashboardData } = require('../../services/dashboard')
const { askAdvisor } = require('../../services/advisor')
const { flattenGreenhouses } = require('../../utils/greenhouse')
const { guardPage } = require('../../utils/authGuard')

Page({
  data: {
    loading: true,
    asking: false,
    error: '',
    options: [],
    optionLabels: [],
    selectedIndex: 0,
    selected: null,
    question: '',
    result: null,
    quickQuestions: ['今天需要通风吗？', '土壤湿度偏低怎么办？', '设备离线后先检查什么？'],
    initialCropId: '',
    initialGreenhouseId: '',
  },

  onLoad(query = {}) {
    if (!guardPage('/pages/advisor/advisor', query)) return

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

  onQuestionInput(event) {
    this.setData({
      question: event.detail.value,
    })
  },

  onQuickTap(event) {
    this.setData({
      question: event.currentTarget.dataset.question,
    })
  },

  async onAskTap() {
    const question = this.data.question.trim()

    if (!this.data.selected) {
      this.setData({ error: '请先选择大棚' })
      return
    }

    if (!question) {
      this.setData({ error: '请输入问题' })
      return
    }

    this.setData({ asking: true, error: '', result: null })

    try {
      const result = await askAdvisor(this.data.selected.crop, this.data.selected.greenhouse, question)
      this.setData({
        result,
        asking: false,
      })
    } catch (error) {
      this.setData({
        asking: false,
        error: error.message || '问答生成失败',
      })
    }
  },
})
