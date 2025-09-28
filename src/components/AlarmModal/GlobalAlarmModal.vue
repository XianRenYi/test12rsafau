<template>
  <div>
    <!-- 全局报警弹窗 -->
    <AlarmModal 
      :visible="isVisible" 
      :alert-data="alertData"
      @close="closeModal"
      @start-auto-popup="handleStartAutoPopup"
      @stop-auto-popup="handleStopAutoPopup"
      @update-interval="handleUpdateInterval"
      @alarm-stopped="handleAlarmStopped"
    />
    
    <!-- 触发按钮（可选，用于测试） -->
    <!-- <div v-if="showTriggerButton" class="alarm-trigger-button" @click="openModal">
      <span class="trigger-icon">🚨</span>
      <span class="trigger-text">报警检测</span>
    </div> -->
  </div>
</template>

<script>
import AlarmModal from './index.vue'
import {
  getAlertLogFirst,
} from "@/api/iot/alertLog";
import { getToken } from '@/utils/auth'
export default {
  name: 'GlobalAlarmModal',
  components: {
    AlarmModal
  },
  props: {
    showTriggerButton: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisible: false,
      autoPopupTimer: null,
      autoPopupInterval: 1000, // 10秒间隔
      alertData: null, // 存储获取到的告警数据
      checkAlertTimer: null, // 检查告警的定时器
      stopAlarmTimer: null, // 停止告警后的暂停定时器
      isAlarmStopped: false, // 告警是否已停止
      isLoggedIn: false // 用户是否已登录
    }
  },
  mounted() {
    this.checkLoginStatus()
    // 监听登录状态变化
    this.$watch('$route', this.checkLoginStatus)
  },
  beforeUnmount() {
    this.stopCheckAlert()
    this.clearStopAlarmTimer()
  },
  methods: {
    // 打开弹窗
    openModal() {
      this.isVisible = true
      this.$emit('opened')
    },
    
    // 关闭弹窗
    closeModal() {
      this.isVisible = false
      this.$emit('closed')
    },
    
    // 切换弹窗显示状态
    toggleModal() {
      this.isVisible = !this.isVisible
      this.$emit(this.isVisible ? 'opened' : 'closed')
    },
    
    // 开始自动弹出定时器
    startAutoPopup() {
      this.stopAutoPopup() // 先清除现有定时器
      this.autoPopupTimer = setInterval(() => {
        if (!this.isVisible) {
          this.openModal()
        }
      }, this.autoPopupInterval)
    },
    
    // 停止自动弹出定时器
    stopAutoPopup() {
      if (this.autoPopupTimer) {
        clearInterval(this.autoPopupTimer)
        this.autoPopupTimer = null
      }
    },
    
    // 设置自动弹出间隔
    setAutoPopupInterval(interval) {
      this.autoPopupInterval = interval
      if (this.autoPopupTimer) {
        this.startAutoPopup() // 重新启动定时器
      }
    },
    
    // 处理开始自动弹出事件
    handleStartAutoPopup() {
      this.startAutoPopup()
      this.$emit('auto-popup-started')
    },
    
    // 处理停止自动弹出事件
    handleStopAutoPopup() {
      this.stopAutoPopup()
      this.$emit('auto-popup-stopped')
    },
    
    // 处理更新间隔事件
    handleUpdateInterval(interval) {
      this.setAutoPopupInterval(interval)
      this.$emit('interval-updated', interval)
    },
    
    // 处理告警停止事件
    handleAlarmStopped() {
      this.stopAlarmCheck()
      this.$emit('alarm-stopped')
    },
    
    // 开始检查告警数据
    startCheckAlert() {
      this.stopCheckAlert() // 先清除现有定时器
      this.checkAlertTimer = setInterval(() => {
       this.checkAlertData()
      }, this.autoPopupInterval)
      // 立即执行一次检查
      this.checkAlertData()
    },
    
    // 停止检查告警数据
    stopCheckAlert() {
      if (this.checkAlertTimer) {
        clearInterval(this.checkAlertTimer)
        this.checkAlertTimer = null
      }
    },
    
    // 检查登录状态
    checkLoginStatus() {
      const token = getToken()
      const wasLoggedIn = this.isLoggedIn
      this.isLoggedIn = !!token
      
      // 如果登录状态发生变化
      if (wasLoggedIn !== this.isLoggedIn) {
        if (this.isLoggedIn) {
          // 用户已登录，开始检查告警
          this.startCheckAlert()
        } else {
          // 用户未登录，停止检查告警
          this.stopCheckAlert()
          this.closeModal()
        }
      }
    },
    
    // 检查告警数据
    async checkAlertData() {
      // 如果未登录，跳过检查
      if (!this.isLoggedIn) {
        return
      }
      
      // 如果告警已停止，跳过检查
      if (this.isAlarmStopped) {
        return
      }
      
      try {
        const response = await getAlertLogFirst()
        if (response && response.code === 200) {
          // 如果返回数据不为null，则显示告警弹窗
          if (response.data) {
            this.alertData = response.data
            if (!this.isVisible) {
              this.openModal()
            }
          } else {
            // 返回null，不弹出告警
            this.alertData = null
            if (this.isVisible) {
              this.closeModal()
            }
          }
        }
      } catch (error) {
        console.error('获取告警数据失败:', error)
        // 如果是401错误，说明登录状态已过期，停止检查
        if (error && error.includes && error.includes('401')) {
          this.isLoggedIn = false
          this.stopCheckAlert()
        }
      }
    },
    
    // 停止告警（暂停检查）
    stopAlarmCheck() {
      this.isAlarmStopped = true
      this.clearStopAlarmTimer()
      
      // 设置30秒后重新开始检查告警
      this.stopAlarmTimer = setTimeout(() => {
        this.isAlarmStopped = false
        console.log('告警检查已重新启动')
      }, 30000) // 30秒后重新开始检查
    },
    
    // 清除停止告警定时器
    clearStopAlarmTimer() {
      if (this.stopAlarmTimer) {
        clearTimeout(this.stopAlarmTimer)
        this.stopAlarmTimer = null
      }
    }
  },
  // 提供全局方法供外部调用
  provide() {
    return {
      openAlarmModal: this.openModal,
      closeAlarmModal: this.closeModal,
      toggleAlarmModal: this.toggleModal
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-trigger-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(248, 4, 87, 0.9) 0%, rgba(233, 12, 38, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(248, 4, 87, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.alarm-trigger-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(248, 4, 87, 0.4);
  background: linear-gradient(135deg, rgba(248, 4, 87, 1) 0%, rgba(233, 12, 38, 1) 100%);
}

.trigger-icon {
  font-size: 18px;
  animation: pulse 2s infinite;
}

.trigger-text {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.1); 
  }
}
</style>
