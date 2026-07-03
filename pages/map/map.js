const { getDashboardData } = require('../../services/dashboard')
const { findLocation } = require('../../data/greenhouseLocations')
const { statusText } = require('../../utils/format')

Page({
  data: {
    loading: true,
    error: '',
    latitude: 39.45,
    longitude: 121.85,
    scale: 9,
    selectedMarkerId: 0,
    sheetExpanded: true,
    sheetTouchStartY: 0,
    sheetDragY: 0,
    sheetDragging: false,
    markers: [],
    greenhouses: [],
    selectedGreenhouse: null,
  },

  onLoad() {
    this.loadMap()
  },

  onPullDownRefresh() {
    this.loadMap().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadMap() {
    this.setData({ loading: true, error: '' })

    try {
      const dashboard = await getDashboardData()
      const greenhouses = []
      let markerId = 1

      for (const crop of dashboard.crops || []) {
        for (const greenhouse of crop.greenhouses || []) {
          const location = findLocation(crop.id, greenhouse.id)
          greenhouses.push({
            markerId,
            cropId: crop.id,
            cropName: crop.name,
            greenhouseId: greenhouse.id,
            name: greenhouse.name,
            area: greenhouse.area,
            status: greenhouse.status,
            statusLabel: statusText(greenhouse.status),
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          })
          markerId += 1
        }
      }

      const selectedMarkerId = greenhouses[0] ? greenhouses[0].markerId : 0
      const markers = this.buildMarkers(greenhouses, selectedMarkerId)

      this.setData({
        loading: false,
        greenhouses,
        markers,
        selectedMarkerId,
        selectedGreenhouse: greenhouses[0] || null,
        latitude: greenhouses[0] ? greenhouses[0].latitude : this.data.latitude,
        longitude: greenhouses[0] ? greenhouses[0].longitude : this.data.longitude,
        scale: greenhouses[0] ? 13 : 9,
      })
    } catch (error) {
      this.setData({
        loading: false,
        error: error.message || '地图数据加载失败',
      })
    }
  },

  onMarkerTap(event) {
    const markerId = event.detail.markerId
    const item = this.data.greenhouses.find((greenhouse) => greenhouse.markerId === markerId)
    if (item) this.focusGreenhouse(item)
  },

  onGreenhouseTap(event) {
    const markerId = Number(event.currentTarget.dataset.markerId)
    const item = this.data.greenhouses.find((greenhouse) => greenhouse.markerId === markerId)
    if (item) this.focusGreenhouse(item)
  },

  focusGreenhouse(item) {
    this.setData({
      latitude: item.latitude,
      longitude: item.longitude,
      scale: 15,
      selectedMarkerId: item.markerId,
      selectedGreenhouse: item,
      sheetExpanded: false,
      markers: this.buildMarkers(this.data.greenhouses, item.markerId),
    })
  },

  onSheetHandleTap() {
    this.setData({
      sheetExpanded: !this.data.sheetExpanded,
    })
  },

  onSheetTouchStart(event) {
    const touch = event.touches && event.touches[0]
    if (!touch) return

    this.setData({
      sheetTouchStartY: touch.clientY,
      sheetDragY: 0,
      sheetDragging: true,
    })
  },

  onSheetTouchMove(event) {
    const touch = event.touches && event.touches[0]
    if (!touch) return

    const deltaY = touch.clientY - this.data.sheetTouchStartY
    const dragY = this.data.sheetExpanded ? Math.max(0, Math.min(deltaY, 160)) : Math.min(0, Math.max(deltaY, -160))

    this.setData({ sheetDragY: dragY })
  },

  onSheetTouchEnd(event) {
    const touch = event.changedTouches && event.changedTouches[0]
    if (!touch) {
      this.setData({ sheetDragY: 0, sheetDragging: false })
      return
    }

    const deltaY = touch.clientY - this.data.sheetTouchStartY
    if (Math.abs(deltaY) < 24) {
      this.setData({ sheetDragY: 0, sheetDragging: false })
      return
    }

    this.setData({
      sheetExpanded: deltaY < 0,
      sheetDragY: 0,
      sheetDragging: false,
    })
  },

  buildMarkers(greenhouses, selectedMarkerId) {
    return greenhouses.map((item) => {
      const selected = item.markerId === selectedMarkerId
      return {
        id: item.markerId,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.name,
        width: selected ? 34 : 28,
        height: selected ? 34 : 28,
        callout: {
          content: selected ? `${item.name}\n${item.address}` : item.name,
          color: '#16231c',
          fontSize: selected ? 13 : 12,
          borderRadius: 6,
          bgColor: '#ffffff',
          padding: 8,
          display: selected ? 'ALWAYS' : 'BYCLICK',
        },
      }
    })
  },
})
