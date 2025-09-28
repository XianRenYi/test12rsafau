import { createApp } from 'vue'
import GlobalAlarmModal from '@/components/AlarmModal/GlobalAlarmModal.vue'

// 全局报警弹窗插件
const AlarmModalPlugin = {
  install(app, options = {}) {
    // 创建全局报警弹窗实例
    const alarmModalApp = createApp(GlobalAlarmModal, {
      showTriggerButton: options.showTriggerButton || false
    })
    
    // 创建挂载点
    const mountPoint = document.createElement('div')
    mountPoint.id = 'global-alarm-modal'
    document.body.appendChild(mountPoint)
    
    // 挂载组件
    const alarmModalInstance = alarmModalApp.mount(mountPoint)
    
    // 将方法添加到全局属性
    app.config.globalProperties.$alarmModal = {
      open: () => alarmModalInstance.openModal(),
      close: () => alarmModalInstance.closeModal(),
      toggle: () => alarmModalInstance.toggleModal(),
      isVisible: () => alarmModalInstance.isVisible,
      startAutoPopup: () => alarmModalInstance.startAutoPopup(),
      stopAutoPopup: () => alarmModalInstance.stopAutoPopup(),
      setAutoPopupInterval: (interval) => alarmModalInstance.setAutoPopupInterval(interval)
    }
    
    // 添加到 Vue 实例
    app._alarmModal = alarmModalInstance
    
    // 提供全局方法
    app.provide('$alarmModal', app.config.globalProperties.$alarmModal)
  }
}

// 全局报警弹窗管理器
class AlarmModalManager {
  constructor() {
    this.instance = null
    this.isVisible = false
    this.autoPopupEnabled = true
    this.autoPopupInterval = 10000 // 10秒
  }
  
  // 设置弹窗实例
  setInstance(instance) {
    this.instance = instance
  }
  
  // 打开弹窗
  open() {
    if (this.instance) {
      this.instance.openModal()
      this.isVisible = true
    }
  }
  
  // 关闭弹窗
  close() {
    if (this.instance) {
      this.instance.closeModal()
      this.isVisible = false
    }
  }
  
  // 切换弹窗
  toggle() {
    if (this.isVisible) {
      this.close()
    } else {
      this.open()
    }
  }
  
  // 开始自动弹出
  startAutoPopup() {
    if (this.instance && this.instance.startAutoPopup) {
      this.instance.startAutoPopup()
      this.autoPopupEnabled = true
    }
  }
  
  // 停止自动弹出
  stopAutoPopup() {
    if (this.instance && this.instance.stopAutoPopup) {
      this.instance.stopAutoPopup()
      this.autoPopupEnabled = false
    }
  }
  
  // 设置自动弹出间隔
  setAutoPopupInterval(interval) {
    this.autoPopupInterval = interval
    if (this.instance && this.instance.setAutoPopupInterval) {
      this.instance.setAutoPopupInterval(interval)
    }
  }
  
  // 获取状态
  getStatus() {
    return {
      isVisible: this.isVisible,
      autoPopupEnabled: this.autoPopupEnabled,
      autoPopupInterval: this.autoPopupInterval
    }
  }
}

// 创建全局管理器实例
const alarmModalManager = new AlarmModalManager()

// 导出插件和管理器
export default AlarmModalPlugin
export { AlarmModalManager, alarmModalManager }

// 在 window 对象上添加全局方法（可选）
if (typeof window !== 'undefined') {
  window.$alarmModal = {
    open: () => alarmModalManager.open(),
    close: () => alarmModalManager.close(),
    toggle: () => alarmModalManager.toggle(),
    startAutoPopup: () => alarmModalManager.startAutoPopup(),
    stopAutoPopup: () => alarmModalManager.stopAutoPopup(),
    setAutoPopupInterval: (interval) => alarmModalManager.setAutoPopupInterval(interval),
    getStatus: () => alarmModalManager.getStatus()
  }
}
