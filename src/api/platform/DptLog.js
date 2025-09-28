import request from '@/utils/request'

// 查询大平台测试记录列表
export function listDptLog(query) {
  return request({
    url: '/platform/DptLog/list',
    method: 'get',
    params: query
  })
}

export function listGetDptLog(query) {
  return request({
    url: '/platform/DptLog/list',
    method: 'get',
    params: query
  })
}

// 查询大平台测试记录详细
export function getDptLog(id) {
  return request({
    url: '/platform/DptLog/' + id,
    method: 'get'
  })
}

// 新增大平台测试记录
export function addDptLog(data) {
  return request({
    url: '/platform/DptLog',
    method: 'post',
    data: data
  })
}

// 修改大平台测试记录
export function updateDptLog(data) {
  return request({
    url: '/platform/DptLog',
    method: 'put',
    data: data
  })
}

// 删除大平台测试记录
export function delDptLog(id) {
  return request({
    url: '/platform/DptLog/' + id,
    method: 'delete'
  })
}


export function windPoint(query) {
  return request({
    url: '/platform/DptLog/list',
    method: 'get',
    params: query
  })
}