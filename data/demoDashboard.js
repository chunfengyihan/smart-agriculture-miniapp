function createDemoDashboard() {
  const now = new Date()
  const hours = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(now.getTime() - (7 - index) * 60 * 60 * 1000)
    return date.toISOString()
  })

  return {
    generatedAt: now.toISOString(),
    source: 'local',
    crops: [
      {
        id: 'jujube',
        name: '冰糖枣',
        latinName: 'Ziziphus jujuba',
        description: '重点监测温湿度、光照、土壤水分与棚内预警。',
        heroImage: '/assets/images/jujube-hero.jpg',
        accent: '#0f7a4c',
        greenhouses: [
          {
            id: 'jujube-1',
            name: '冰糖枣 1 号棚',
            area: '大连金普新区',
            status: 'online',
            onlineDevices: 12,
            totalDevices: 12,
            metrics: [
              { key: 'airTemp', label: '空气温度', value: 26.4, unit: '°C', status: 'normal', target: '22-30°C' },
              { key: 'airHumidity', label: '空气湿度', value: 68, unit: '%', status: 'normal', target: '55-75%' },
              { key: 'light', label: '光照', value: 18300, unit: 'lux', status: 'normal', target: '12000-26000lux' },
              { key: 'co2', label: 'CO2', value: 520, unit: 'ppm', status: 'normal', target: '400-900ppm' },
              { key: 'soilHumidity', label: '土壤湿度', value: 41, unit: '%', status: 'warning', target: '45-65%' },
              { key: 'soilTemp', label: '土壤温度', value: 23.8, unit: '°C', status: 'normal', target: '18-26°C' },
              { key: 'ec', label: 'EC', value: 1.6, unit: 'mS/cm', status: 'normal', target: '1.2-2.2' },
              { key: 'ph', label: 'PH', value: 6.8, unit: '', status: 'normal', target: '6.0-7.5' },
            ],
            trend: hours.map((time, index) => ({
              time,
              airTemp: 24.8 + index * 0.3,
              airHumidity: 72 - index,
              soilHumidity: 44 - index * 0.4,
              light: index < 2 ? 0 : 12000 + index * 900,
            })),
            alerts: [
              {
                id: 'demo-alert-1',
                level: 'warning',
                message: '土壤湿度接近下限，建议复核滴灌计划。',
                time: now.toISOString(),
              },
            ],
          },
          {
            id: 'jujube-2',
            name: '冰糖枣 2 号棚',
            area: '大连金普新区',
            status: 'warning',
            onlineDevices: 10,
            totalDevices: 12,
            metrics: [
              { key: 'airTemp', label: '空气温度', value: 31.2, unit: '°C', status: 'warning', target: '22-30°C' },
              { key: 'airHumidity', label: '空气湿度', value: 61, unit: '%', status: 'normal', target: '55-75%' },
              { key: 'soilHumidity', label: '土壤湿度', value: 48, unit: '%', status: 'normal', target: '45-65%' },
              { key: 'light', label: '光照', value: 22600, unit: 'lux', status: 'normal', target: '12000-26000lux' },
            ],
            trend: hours.map((time, index) => ({
              time,
              airTemp: 27.2 + index * 0.5,
              airHumidity: 66 - index * 0.6,
              soilHumidity: 49 - index * 0.2,
              light: index < 2 ? 0 : 14000 + index * 1100,
            })),
            alerts: [
              {
                id: 'demo-alert-2',
                level: 'warning',
                message: '棚内温度偏高，请检查通风与遮阳状态。',
                time: now.toISOString(),
              },
            ],
          },
        ],
      },
      {
        id: 'blueberry',
        name: '蓝莓',
        latinName: 'Vaccinium',
        description: '关注土壤酸碱度、湿度和棚内温差。',
        heroImage: '/assets/images/blueberry-hero.jpg',
        accent: '#2864a8',
        greenhouses: [
          {
            id: 'blueberry-c1',
            name: '蓝莓 C1 棚',
            area: '大连庄河',
            status: 'online',
            onlineDevices: 9,
            totalDevices: 9,
            metrics: [
              { key: 'airTemp', label: '空气温度', value: 24.1, unit: '°C', status: 'normal', target: '18-26°C' },
              { key: 'airHumidity', label: '空气湿度', value: 74, unit: '%', status: 'normal', target: '60-80%' },
              { key: 'soilHumidity', label: '土壤湿度', value: 57, unit: '%', status: 'normal', target: '50-70%' },
              { key: 'ph', label: 'PH', value: 5.3, unit: '', status: 'normal', target: '4.5-5.8' },
            ],
            trend: hours.map((time, index) => ({
              time,
              airTemp: 22.6 + index * 0.2,
              airHumidity: 78 - index * 0.5,
              soilHumidity: 58 - index * 0.1,
              light: index < 2 ? 0 : 10500 + index * 800,
            })),
            alerts: [],
          },
        ],
      },
      {
        id: 'cherry',
        name: '樱桃',
        latinName: 'Prunus avium',
        description: '监测升温、湿度和授粉期环境变化。',
        heroImage: '/assets/images/cherry-hero.jpg',
        accent: '#b9384b',
        greenhouses: [
          {
            id: 'cherry-1',
            name: '樱桃示范棚',
            area: '大连旅顺口',
            status: 'offline',
            onlineDevices: 0,
            totalDevices: 8,
            metrics: [
              { key: 'airTemp', label: '空气温度', value: null, unit: '°C', status: 'critical', target: '18-25°C' },
              { key: 'airHumidity', label: '空气湿度', value: null, unit: '%', status: 'critical', target: '55-70%' },
              { key: 'soilHumidity', label: '土壤湿度', value: null, unit: '%', status: 'critical', target: '45-60%' },
            ],
            trend: [],
            alerts: [
              {
                id: 'demo-alert-3',
                level: 'critical',
                message: '设备离线，未收到最新环境数据。',
                time: now.toISOString(),
              },
            ],
          },
        ],
      },
    ],
  }
}

module.exports = {
  createDemoDashboard,
}
