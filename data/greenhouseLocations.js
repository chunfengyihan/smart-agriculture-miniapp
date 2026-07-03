const locations = [
  {
    cropId: 'jujube',
    greenhouseId: 'jujube-1',
    latitude: 39.7834416,
    longitude: 122.1747936,
    address: '大连市普兰店区四平街道四平社区',
  },
  {
    cropId: 'jujube',
    greenhouseId: 'jujube-2',
    latitude: 39.7819,
    longitude: 122.1765,
    address: '大连市普兰店区四平街道四平社区',
  },
  {
    cropId: 'blueberry',
    greenhouseId: 'blueberry-c1',
    latitude: 39.2802386,
    longitude: 122.0278486,
    address: '大连市金普新区华家街道',
  },
  {
    cropId: 'cherry',
    greenhouseId: 'cherry-1',
    latitude: 38.8306,
    longitude: 121.2547,
    address: '大连市旅顺口区',
  },
]

function findLocation(cropId, greenhouseId) {
  return (
    locations.find((item) => item.cropId === cropId && item.greenhouseId === greenhouseId) ||
    locations.find((item) => item.cropId === cropId) ||
    {
      latitude: 39.629,
      longitude: 121.98,
      address: '大连市',
    }
  )
}

module.exports = {
  findLocation,
  locations,
}
