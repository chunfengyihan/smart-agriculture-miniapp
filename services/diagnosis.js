const { API_BASE_URL, CROP_DIAGNOSIS_ENDPOINT } = require('../config/api')
const { handleDemoFallback } = require('../utils/demoFallback')
const { metricSnapshot } = require('../utils/greenhouse')

function getToken() {
  return wx.getStorageSync('token') || ''
}

function unwrapUploadResponse(raw) {
  const body = JSON.parse(raw || '{}')
  if (body && body.code === 0 && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data
  }
  return body
}

function demoDiagnosis(crop, greenhouse) {
  const hasWarning = greenhouse.status === 'warning'

  return {
    riskLevel: hasWarning ? 'medium' : 'low',
    hasPestOrDisease: false,
    suspectedIssues: hasWarning
      ? [{ name: '环境胁迫风险', confidence: 0.62, evidence: '当前大棚存在预警状态，建议结合叶片与土壤情况复核。' }]
      : [],
    environmentAssessment: `${greenhouse.name} 的环境指标将作为诊断参考。当前为演示结果，未调用真实图像模型。`,
    recommendations: ['重新拍摄清晰叶片正反面照片', '保留现场温湿度和施肥记录', '必要时联系农艺人员复核'],
    disclaimer: '演示诊断不构成病虫害结论，真实上线需启用后端 AI 服务。',
    evidence: ['已读取大棚环境上下文', '已接收用户上传图片'],
    matchedRules: ['演示规则：图片上传 + 环境状态'],
    confidenceReason: '当前为演示模式，可信度仅表示流程完整性。',
    followUpQuestions: ['叶片背面是否有虫卵或斑点？', '最近是否调整过水肥或通风？'],
  }
}

function createUploadError(message, options = {}) {
  const error = new Error(message)
  error.statusCode = options.statusCode || 0
  error.code = String(options.code || options.statusCode || 'UPLOAD_FAILED')
  error.details = options.details || {}
  return error
}

function resolveOrRejectFallback(resolve, reject, crop, greenhouse, error) {
  try {
    resolve(handleDemoFallback('crop-diagnosis', 'crop diagnosis', error, () => demoDiagnosis(crop, greenhouse)))
  } catch (nextError) {
    reject(nextError)
  }
}

function diagnoseCrop(crop, greenhouse, imagePath, useEnvironmentContext) {
  const token = getToken()

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE_URL}${CROP_DIAGNOSIS_ENDPOINT}`,
      filePath: imagePath,
      name: 'image',
      timeout: 30000,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      formData: {
        cropId: crop.id,
        cropName: crop.name,
        greenhouseId: greenhouse.id,
        greenhouseName: greenhouse.name,
        useEnvironmentContext: useEnvironmentContext ? 'true' : 'false',
        metrics: JSON.stringify(useEnvironmentContext ? metricSnapshot(greenhouse.metrics) : []),
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(unwrapUploadResponse(response.data))
          } catch (error) {
            reject(new Error('诊断结果解析失败'))
          }
          return
        }

        resolveOrRejectFallback(
          resolve,
          reject,
          crop,
          greenhouse,
          createUploadError(`Image diagnosis failed ${response.statusCode}`, {
            statusCode: response.statusCode,
            details: response.data || {},
          }),
        )
      },
      fail(error) {
        resolveOrRejectFallback(
          resolve,
          reject,
          crop,
          greenhouse,
          createUploadError(error.errMsg || 'Image upload failed', { details: error }),
        )
      },
    })
  })
}

module.exports = {
  diagnoseCrop,
}
