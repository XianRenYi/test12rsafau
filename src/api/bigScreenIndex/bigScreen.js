import request from '@/utils/request'

export const fetchRightBottomData = (query) => {
    return request({
      url: '/iot/bigScreen/fetchRightBottomData', 
      method: 'get',
      params: query
    })

}

export const centerBottom = (query) => {
  return request({
    url: '/iot/bigScreen/centerBottom', 
    method: 'get',
    params: query
  })

}

// 地图中心获取设备列表
export const bigScreenIndexDeviceList = (query) => {
  return request({
    url: '/iot/bigScreen/bigScreenIndexDeviceList', 
    method: 'get',
    params: query
  })

}

export function proportionOfRespondingPolice(query) {
  return request({
      url: '/iot/bigScreen/proportionOfRespondingPolice',
      method: 'get',
      params: query
  })
}

export function hourfiredistribution(query) {
  return request({
      url: '/iot/bigScreen/hourfiredistribution',
      method: 'get',
      params: query
  })
}

export function jingliuxiaoshishujufenxi(query) {
  return request({
      url: '/iot/bigScreen/jingliuxiaoshishujufenxi',
      method: 'get',
      params: query
  })
}

export function shebeiliebao(query) {
  return request({
      url: '/iot/bigScreen/shebeiliebao',
      method: 'get',
      params: query
  })
}

export function selectLimitDescList(query) {
  return request({
      url: '/iot/bigScreen/selectLimitDescList',
      method: 'get',
      params: query
  })
}

export function statisticsDevices(query) {
  return request({
      url: '/iot/bigScreen/statisticsDevices',
      method: 'get',
      params: query
  })
}

export function alertLogCount(query) {
  return request({
      url: '/iot/bigScreen/alertLogCount',
      method: 'get',
      params: query
  })
}

export function selectStatisticsAllCount(query) {
  return request({
      url: '/iot/bigScreen/selectStatisticsAllCount',
      method: 'get',
      params: query
  })
}




export function getMonthlyAlertCountLast6Months(query) {
  return request({
      url: '/iot/bigScreen/getMonthlyAlertCountLast6Months',
      method: 'get',
      params: query
  })
}



export function getDeviceBigScreenIndexList(query) {
  return request({
      url: '/iot/bigScreen/getDeviceBigScreenIndexList',
      method: 'get',
      params: query
  })
}


