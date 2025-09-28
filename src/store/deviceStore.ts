import { defineStore } from 'pinia';

export const useDeviceStore = defineStore('device', {
  state: () => ({
    selectedDevice: null, // 当前选中的设备
    deviceHistory: []     // 设备选择历史
  }),
  
  getters: {
    hasSelectedDevice: (state) => !!state.selectedDevice,
    selectedDeviceId: (state) => state.selectedDevice?.id || null
  },
  
  actions: {
    // 设置选中的设备
    setSelectedDevice(device) {
      this.selectedDevice = device;
      
      // 如果有选中设备，添加到历史记录
      if (device) {
        // 移除已存在的相同设备，避免重复
        this.deviceHistory = this.deviceHistory.filter(d => d.id !== device.id);
        // 添加到历史记录最前面
        this.deviceHistory.unshift(device);
        // 限制历史记录长度
        if (this.deviceHistory.length > 10) {
          this.deviceHistory.pop();
        }
      }
    },
    
    // 清除选中的设备
    clearSelectedDevice() {
      this.selectedDevice = null;
    }
  }
});
