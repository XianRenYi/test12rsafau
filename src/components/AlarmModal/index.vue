<template>
  <div v-if="visible" class="alarm-modal-overlay" @click="handleOverlayClick">
    <div class="alarm-modal" @click.stop>
      <!-- 红色头部 -->
      <div class="alarm-header">
        <span class="header-text">告警提醒</span>
        <div class="close-button" @click="closeModal">×</div>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="alarm-content">
        
        <!-- 数据展示区域 -->
        <div class="data-display">
          <div class="data-row">
            <div class="data-item">
              <span class="data-label">序列号</span>
              <span class="data-value threshold" :style="{ color: '#ffffff' }">
                {{ displayAlertData.serialNumber }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">报警类型</span>
              <span class="data-value actual" :style="{ color: '#ffffff' }">
                {{ displayAlertData.alarmType }}
              </span>
            </div>
          </div>
          <div class="data-row">
            <div class="data-item">
              <span class="data-label">名称</span>
              <span class="data-value status" :style="{ color: '#ffffff' }">
                {{ displayAlertData.deviceName }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">告警内容</span>
              <span class="data-value level" :style="{ color: '#ffffff' }">
                {{ displayAlertData.actualValue }}
              </span>
            </div>
          </div>

          <div class="data-row">
            <div class="data-item">
           
              <span class="data-label">因子</span>
              <span class="data-value status" :style="{ color: '#ffffff' }">
                {{ displayAlertData.status }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">告警数值</span>
              <span class="data-value level" :style="{ color: '#dc3545' }">
                {{ displayAlertData.warningValue }}
              </span>
            </div>
          </div>

          <div class="data-row">
            <div class="data-item">
              <span class="data-label">地址</span>
              <span class="data-value status" :style="{ color: '#ffffff' }">
                {{ displayAlertData.address }}
              </span>

             
            </div>
            <div class="data-item">
              <span class="data-label">单位</span>
              <span class="data-value level" :style="{ color: '#ffffff' }">
                {{ displayAlertData.unit }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 告警停止提示信息 -->
        <div class="alarm-stop-info" v-if="isAlarmStopped">
          <div class="stop-icon">⚠️</div>
          <div class="stop-message">
            <div class="stop-title">告警已停止</div>
            <div class="stop-desc">告警已暂时停止，您可以在告警配置中重新开启</div>
          </div>
        </div>

        <!-- 停止告警确认弹窗 -->
        <div class="confirm-dialog" v-if="showStopConfirm">
          <div class="confirm-overlay" @click="cancelStopAlarm"></div>
          <div class="confirm-content">
            <div class="confirm-header">
              <div class="confirm-icon">⚠️</div>
              <div class="confirm-title">确认停止告警</div>
            </div>
            <div class="confirm-message">
              确定要停止告警提醒吗？停止后系统将暂停告警提醒弹窗，您可以在告警配置中重新开启。
            </div>
            <div class="confirm-buttons">
              <button class="btn btn-cancel" @click="cancelStopAlarm">取消</button>
              <button class="btn btn-confirm" @click="confirmStopAlarm">确认停止</button>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="control-buttons">
          <button class="btn btn-stop" @click="stopAlarm" v-if="!isAlarmStopped">停止告警</button>
          <!-- <button class="btn btn-restart" @click="restartAlarm" v-if="isAlarmStopped">重新开启</button> -->
          <button class="btn btn-close" @click="closeModal">关闭</button>
        </div>
        
        <!-- 按钮下方提示信息 -->
        <div class="button-tip" v-if="!isAlarmStopped">
          <div class="tip-icon">⚠️</div>
          <div class="tip-text">点击停止告警后，系统将暂停告警提醒弹窗，可在告警配置中重新开启</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  updateAlertLog,
} from "@/api/iot/alertLog";
import {
  updateAlertPop,
} from "@/api/iot/alert";

export default {
  name: 'AlarmModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    alertData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectedType: 1, // 默认选择一级预警
      updateTime: '',
      simulationTimer: null,
      isSimulating: false,
      isAutoPopupEnabled: true, // 定时弹出状态
      autoPopupInterval: 1000, // 默认10秒
      isAlarmStopped: false, // 告警停止状态
      showStopConfirm: false, // 显示停止确认弹窗
      deviceLocation: '未来科技城',
      deviceName: '无线烟感报警器',
      alarmTime: '',
      alarmTypes: [
        {
          level: 1,
          name: '告警提醒',
          color: 'rgba(248, 4, 87, 1)',
          threshold: 50,
          unit: 'ppm'
        },
        {
          level: 2,
          name: '数据阈值下限报警',
          color: 'rgba(254, 229, 0, 1)',
          threshold: 40,
          unit: 'ppm'
        },
        {
          level: 3,
          name: '设备离线报警',
          color: 'rgba(2, 255, 134, 1)',
          threshold: 30,
          unit: 'ppm'
        }
      ],
      currentAlarmData: {
        threshold: 50,
        actual: 0,
        unit: 'ppm'
      },
      // 模拟数据
      simulationData: {
        serialNumber: 'SN20240108001',
        alarmType: '二级报警',
        deviceName: '固定式VOC其他检测仪',
        actualValue: '',
        status: 'voc',
        warningValue: 60,
        address: '固定通道2',
        unit: 'ppm'
      }
    }
  },
  computed: {
    currentAlarmType() {
      return this.alarmTypes.find(type => type.level === this.selectedType) || this.alarmTypes[0]
    },
    // 获取显示的告警数据
    displayAlertData() {
      if (this.alertData) {


        return {
          serialNumber: this.alertData.serialNumber || '未知',
          alarmType: this.getAlertLevelText(this.alertData.alertLevel),
          deviceName: this.alertData.deviceName || '未知设备',
          actualValue: this.alertData.alertName || '0',
          status: this.alertData.warningIdentifier || '未知因子',
          warningValue: this.alertData.warningValue || '0',
          address: this.alertData.networkAddress || '未知地址',
          unit: this.alertData.unit || '单位'
        }
      }
      return this.simulationData
    }
  },
  mounted() {
    this.updateTimeDisplay()
    this.initializeData()
  },
  beforeUnmount() {
    this.stopSimulation()
  },
  methods: {
    // 选择预警类型
    selectType(level) {
      this.selectedType = level
      this.updateAlarmData()
    },
    
    // 更新预警数据
    updateAlarmData() {
      const type = this.currentAlarmType
      this.currentAlarmData = {
        threshold: type.threshold,
        actual: this.currentAlarmData.actual,
        unit: type.unit
      }
    },
    
    // 初始化数据
    initializeData() {
      this.updateAlarmData()
      this.updateTimeDisplay()
      this.updateAlarmTime()
    },
    
    // 更新实际值颜色
    getActualValueColor() {
      const ratio = this.currentAlarmData.actual / this.currentAlarmData.threshold
      if (ratio >= 1) {
        return 'rgba(248, 4, 87, 1)' // 红色 - 超过阈值
      } else if (ratio >= 0.8) {
        return 'rgba(254, 229, 0, 1)' // 黄色 - 接近阈值
      } else {
        return 'rgba(2, 255, 134, 1)' // 绿色 - 正常
      }
    },
    
    // 获取状态颜色
    getStatusColor() {
      const ratio = this.currentAlarmData.actual / this.currentAlarmData.threshold
      if (ratio >= 1) {
        return 'rgba(248, 4, 87, 1)'
      } else if (ratio >= 0.8) {
        return 'rgba(254, 229, 0, 1)'
      } else {
        return 'rgba(2, 255, 134, 1)'
      }
    },
    
    // 获取预警状态文本
    getAlarmStatus() {
      const ratio = this.currentAlarmData.actual / this.currentAlarmData.threshold
      if (ratio >= 1) {
        return '超限报警'
      } else if (ratio >= 0.8) {
        return '接近阈值'
      } else {
        return '正常'
      }
    },
    
    // 获取进度条宽度
    getProgressWidth() {
      const ratio = this.currentAlarmData.actual / this.currentAlarmData.threshold
      return Math.min(ratio * 100, 100)
    },
    
    // 获取进度文本
    getProgressText() {
      const ratio = this.currentAlarmData.actual / this.currentAlarmData.threshold
      return `${(ratio * 100).toFixed(1)}%`
    },
    
    // 开始模拟
    startSimulation() {

    },
    
    // 停止模拟
    stopSimulation() {
      this.isSimulating = false
      if (this.simulationTimer) {
        clearInterval(this.simulationTimer)
        this.simulationTimer = null
      }
    },
    
    // 重置数据
    resetData() {
      this.stopSimulation()
      this.simulationData.actualValue = ''
      this.simulationData.status = '正常'
      this.updateTimeDisplay()
    },
    
    // 生成模拟数据
    generateSimulationData() {
      const baseValue = this.simulationData.warningValue * 0.3
      const variation = this.simulationData.warningValue * 0.6
      const randomValue = baseValue + (Math.random() - 0.5) * variation
      this.simulationData.actualValue = ''
      
      // 根据实际值更新状态
      const ratio = this.simulationData.actualValue / this.simulationData.warningValue
      if (ratio >= 1) {
        this.simulationData.status = '超限报警'
      } else if (ratio >= 0.8) {
        this.simulationData.status = '接近阈值'
      } else {
        this.simulationData.status = '正常'
      }
    },
    
    // 更新时间显示
    updateTimeDisplay() {
      const now = new Date()
      this.updateTime = now.toLocaleTimeString('zh-CN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // 更新报警时间
    updateAlarmTime() {
      const now = new Date()
      this.alarmTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    },
    
    // 关闭弹窗
    async closeModal() {
      // 更新告警日志的isShow参数
      if (this.alertData && this.alertData.alertLogId) {
        try {
          await updateAlertLog({
            alertLogId: this.alertData.alertLogId,
            isShow: 1
          })
        } catch (error) {
          console.error('更新告警日志失败:', error)
        }
      }
      
      this.$emit('close')
    },
    
        // 关闭弹窗
        async closeAlertShow() {
      // 更新告警日志的isShow参数
      if (this.alertData && this.alertData.alertId) {
        try {
          await updateAlertPop({
            alertId: this.alertData.alertId,
            alertPop: 2
          })
        } catch (error) {
          console.error('更新告警日志失败:', error)
        }
      }
      
      this.$emit('close')
    },

    // 点击遮罩层关闭
    handleOverlayClick() {
      this.closeModal()
    },
    
    // 切换定时弹出状态
    toggleAutoPopup() {
      this.isAutoPopupEnabled = !this.isAutoPopupEnabled
      if (this.isAutoPopupEnabled) {
        this.$emit('start-auto-popup')
      } else {
        this.$emit('stop-auto-popup')
      }
    },
    
    // 更新定时间隔
    updateInterval() {
      this.$emit('update-interval', parseInt(this.autoPopupInterval))
    },
    
    // 停止告警（显示确认弹窗）
    stopAlarm() {
      this.showStopConfirm = true
    },
    
    // 确认停止告警
    async confirmStopAlarm() {
      this.showStopConfirm = false
      this.stopSimulation()
      this.closeAlertShow()
      this.closeModal();
      
      // 通知父组件停止告警检查
      this.$emit('alarm-stopped')
      
      // 如果父组件有停止告警检查的方法，调用它
      if (this.$parent && this.$parent.stopAlarmCheck) {
        this.$parent.stopAlarmCheck()
      }
    },
    
    // 取消停止告警
    cancelStopAlarm() {
      this.showStopConfirm = false
    },
    
    // 重新开启告警
    restartAlarm() {
      this.isAlarmStopped = false
    
      this.$emit('alarm-restarted')
    },
    
    // 获取告警级别文本
    getAlertLevelText(level) {
      const levelMap = {
        1: '一级预警',
        2: '二级预警', 
        3: '三级预警',
      }
      return levelMap[level] || '未知级别'
    },
    
    // 获取告警单位
    getAlertUnit(identifier) {
      const unitMap = {
        'voc': 'ppm',
        'co': 'ppm',
        'co2': 'ppm',
        'temperature': '℃',
        'humidity': '%',
        'pressure': 'Pa'
      }
      return unitMap[identifier] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.alarm-modal {
  width: 900px;
  max-width: 90vw;
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.7),
    0 12px 24px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #dc3545;
  border-bottom: none;
}

.header-text {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  border: none;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.alarm-content {
  padding: 40px;
  background: #1a1a2e;
  color: #ffffff;
}

/* 报警详情区域 */
.alarm-details {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  margin-bottom: 40px;
}

.alarm-icon {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.warning-icon {
  width: 120px;
  height: 120px;
}

.alarm-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.info-item {
  display: flex;
  margin-bottom: 18px;
  font-size: 18px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.info-label {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 20px;
  min-width: 120px;
  font-weight: 500;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 18px;
}

/* 数据展示区域 */
.data-display {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 35px;
}

.data-row {
  display: flex;
  gap: 40px;
  margin-bottom: 25px;
}

.data-row:last-child {
  margin-bottom: 0;
}

.data-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 500;
}

.data-value {
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 控制按钮样式 */

.control-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.btn-close {
  background: #dc3545;
  color: #ffffff;
  border: 1px solid #dc3545;
}

.btn-close:hover {
  background: #c82333;
  border-color: #bd2130;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.btn-stop {
  background: #dc3545;
  color: #ffffff;
  border: 1px solid #dc3545;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.btn-stop:hover {
  background: #c82333;
  border-color: #bd2130;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.btn-stop:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.btn-restart {
  background: #28a745;
  color: #ffffff;
  border: 1px solid #28a745;
}

.btn-restart:hover {
  background: #218838;
  border-color: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

/* 告警停止提示信息样式 */
.alarm-stop-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.stop-icon {
  font-size: 24px;
  animation: pulse 2s infinite;
}

.stop-message {
  flex: 1;
}

.stop-title {
  color: #ffc107;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stop-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.4;
}

/* 按钮下方提示信息样式 */
.button-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 15px;
  animation: fadeInUp 0.3s ease-out;
}

.tip-icon {
  font-size: 18px;
  animation: pulse 2s infinite;
}

.tip-text {
  color: #dc3545;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 停止告警确认弹窗样式 */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.confirm-content {
  position: relative;
  background: #1a1a2e;
  border-radius: 12px;
  padding: 30px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.8),
    0 12px 24px rgba(0, 0, 0, 0.6);
  animation: confirmSlideIn 0.3s ease-out;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.confirm-icon {
  font-size: 32px;
  animation: pulse 2s infinite;
}

.confirm-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.confirm-message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.confirm-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-cancel {
  background: #6c757d;
  color: #ffffff;
  border: 1px solid #6c757d;
}

.btn-cancel:hover {
  background: #5a6268;
  border-color: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.btn-confirm {
  background: #dc3545;
  color: #ffffff;
  border: 1px solid #dc3545;
}

.btn-confirm:hover {
  background: #c82333;
  border-color: #bd2130;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

@keyframes confirmSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 滚动条样式 */
.alarm-content::-webkit-scrollbar {
  width: 6px;
}

.alarm-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.alarm-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.alarm-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}


/* 响应式设计 */
@media (max-width: 768px) {
  .alarm-modal {
    width: 95vw;
    margin: 20px;
  }
  
  .alarm-content {
    padding: 15px;
  }
  
  .alarm-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .data-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
