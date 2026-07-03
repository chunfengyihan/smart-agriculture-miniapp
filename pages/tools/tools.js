const { requireLogin } = require('../../utils/authGuard')

Page({
  data: {
    tools: [
      {
        title: '天气与棚内建议',
        desc: '查看大棚所在地天气、未来预报和操作建议',
        tag: '天气',
        url: '/pages/weather/weather',
      },
      {
        title: '作物图片诊断',
        desc: '上传叶片或果实照片，结合环境指标辅助判断',
        tag: '诊断',
        url: '/pages/diagnosis/diagnosis',
      },
      {
        title: '农业问答',
        desc: '基于当前作物和大棚指标获取处理建议',
        tag: '问答',
        url: '/pages/advisor/advisor',
      },
    ],
  },

  onToolTap(event) {
    const url = event.currentTarget.dataset.url
    if (!requireLogin(url)) return

    wx.navigateTo({ url })
  },
})
