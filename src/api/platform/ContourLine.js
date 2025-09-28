import request from '@/utils/request'

// 查询等值线列表
export function listContourLine(query) {
  return request({
    url: '/platform/ContourLine/list',
    method: 'get',
    params: query
  })
}

// 查询等值线详细
export function getContourLine(id) {
  return request({
    url: '/platform/ContourLine/' + id,
    method: 'get'
  })
}

// 新增等值线
export function addContourLine(data) {
  return request({
    url: '/platform/ContourLine',
    method: 'post',
    data: data
  })
}

// 修改等值线
export function updateContourLine(data) {
  return request({
    url: '/platform/ContourLine',
    method: 'put',
    data: data
  })
}

// 删除等值线
export function delContourLine(id) {
  return request({
    url: '/platform/ContourLine/' + id,
    method: 'delete'
  })
}
