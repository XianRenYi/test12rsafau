import request from '@/utils/request'

// 查询地图测试数据列表
export function listDptMapShowTest(query) {
  return request({
    url: '/platform/DptMapShowTest/list',
    method: 'get',
    params: query
  })
}


export function dzxList(query) {
  return request({
    url: '/platform/DptMapShowTest/dzxList',
    method: 'get',
    params: query
  })
}

// 查询地图测试数据详细
export function getDptMapShowTest(id) {
  return request({
    url: '/platform/DptMapShowTest/' + id,
    method: 'get'
  })
}

// 新增地图测试数据
export function addDptMapShowTest(data) {
  return request({
    url: '/platform/DptMapShowTest',
    method: 'post',
    data: data
  })
}

// 修改地图测试数据
export function updateDptMapShowTest(data) {
  return request({
    url: '/platform/DptMapShowTest',
    method: 'put',
    data: data
  })
}

// 删除地图测试数据
export function delDptMapShowTest(id) {
  return request({
    url: '/platform/DptMapShowTest/' + id,
    method: 'delete'
  })
}
