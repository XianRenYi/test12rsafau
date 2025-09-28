import request from '@/utils/request'

// 开始Modbus定时任务
export function startModbusTask(data) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/startTask',
    method: 'post',
    data: data
  })
}

// 停止Modbus定时任务
export function stopModbusTask(data) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/stopTask',
    method: 'post',
    data: data
  })
}

// 获取所有Modbus定时任务
export function listModbusTasks() {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/tasks',
    method: 'get'
  })
}

// 立即执行一次Modbus定时任务
export function runModbusTask(data) {
  return request({
    url: '/IotDeviceModbusRtu/IotDeviceModbusRtu/runTask',
    method: 'post',
    data: data
  })
}
