import request from '@/utils/request'

// 查询设备modbus维护列表
export function listIotDeviceModbusRtu(query) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/list',
    method: 'get',
    params: query
  })
}

// 查询设备modbus维护详细
export function getIotDeviceModbusRtu(id) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/' + id,
    method: 'get'
  })
}

// 新增设备modbus维护
export function addIotDeviceModbusRtu(data) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu',
    method: 'post',
    data: data
  })
}

// 修改设备modbus维护
export function updateIotDeviceModbusRtu(data) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu',
    method: 'put',
    data: data
  })
}

// 删除设备modbus维护
export function delIotDeviceModbusRtu(id) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/' + id,
    method: 'delete'
  })
}
