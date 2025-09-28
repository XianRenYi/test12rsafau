import request from '@/utils/request'

// 查询设备经纬度参数记录列表
export function listDptDevicesLog(query) {
  return request({
    url: '/platform/DptDevicesLog/list',
    method: 'get',
    params: query
  })
}


export function getAllList(query) {
  return request({
    url: '/platform/DptDevicesLog/list',
    method: 'get',
    params: query
  })
}

// 查询设备经纬度参数记录详细
export function getDptDevicesLog(id) {
  return request({
    url: '/platform/DptDevicesLog/' + id,
    method: 'get'
  })
}

// 新增设备经纬度参数记录
export function addDptDevicesLog(data) {
  return request({
    url: '/platform/DptDevicesLog',
    method: 'post',
    data: data
  })
}

// 修改设备经纬度参数记录
export function updateDptDevicesLog(data) {
  return request({
    url: '/platform/DptDevicesLog',
    method: 'put',
    data: data
  })
}

// 删除设备经纬度参数记录
export function delDptDevicesLog(id) {
  return request({
    url: '/platform/DptDevicesLog/' + id,
    method: 'delete'
  })
}
