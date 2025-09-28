import request from '@/utils/request'

// 查询走航样机-2号 列表
export function listTestZouHangMoNi(query) {
  return request({
    url: '/platform/TestZouHangMoNi/list',
    method: 'get',
    params: query
  })
}
export function zouHangList(query) {
  return request({
    url: '/platform/TestZouHangMoNi/zouHangList',
    method: 'get',
    params: query
  })
}
// 查询走航样机-2号 详细
export function getTestZouHangMoNi(id) {
  return request({
    url: '/platform/TestZouHangMoNi/' + id,
    method: 'get'
  })
}

// 新增走航样机-2号 
export function addTestZouHangMoNi(data) {
  return request({
    url: '/platform/TestZouHangMoNi',
    method: 'post',
    data: data
  })
}

// 修改走航样机-2号 
export function updateTestZouHangMoNi(data) {
  return request({
    url: '/platform/TestZouHangMoNi',
    method: 'put',
    data: data
  })
}

// 删除走航样机-2号 
export function delTestZouHangMoNi(id) {
  return request({
    url: '/platform/TestZouHangMoNi/' + id,
    method: 'delete'
  })
}
