function metricSnapshot(metrics) {
  return (metrics || []).map((metric) => ({
    key: metric.key,
    label: metric.label,
    value: metric.value,
    unit: metric.unit,
    target: metric.target,
  }))
}

function flattenGreenhouses(dashboard) {
  const options = []

  for (const crop of dashboard.crops || []) {
    for (const greenhouse of crop.greenhouses || []) {
      options.push({
        label: `${crop.name} / ${greenhouse.name}`,
        crop,
        greenhouse,
      })
    }
  }

  return options
}

module.exports = {
  flattenGreenhouses,
  metricSnapshot,
}
