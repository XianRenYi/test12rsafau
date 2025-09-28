<template>
  <div 
    v-if="vocWindowState.visible"
    ref="vocWindow" 
    class="voc-window"
    :style="vocWindowStyle"
    :class="{ 'dragging': isDragging }"
    @mousedown="handleMouseDown"
  >
    <div class="voc-header">
      <span class="voc-title">{{ vocWindowState.deviceData?.remark || '说明' }}</span>
      <!-- <span class="status-online">
        <span class="status-dot"></span>
        {{ vocWindowState.deviceData?.statusName || '在线' }}
      </span> -->
      <span class="device-type"></span>
      <!-- <div class="close-button" @click="closeWindow">×</div> -->
    </div>
    
    <div class="voc-content">
      <div class="value-section">
        <div class="value-item">
          <div class="value-label">实时数值</div>
          <div class="value-number" :key="vocWindowState.deviceData?.valueLatest">
            {{ vocWindowState.deviceData?.valueLatest || '23' }}
          </div>
        </div>
        <div class="value-item">
          <div class="value-label">今日平均数值</div>
          <div class="value-number" :key="vocWindowState.deviceData?.valueAvg">
            {{ vocWindowState.deviceData?.valueAvg || '23' }}
          </div>
        </div>
      </div>
      
      <div class="indicator-section">
        <div class="indicator-bar">
          <div class="bar-gradient"></div>
          <div class="bar-pointer" :style="{ left: getIndicatorPosition() }"></div>
          <div class="bar-labels">
            <span>0</span>
            <span>50</span>
          </div>
        </div>
        <!-- <div class="daily-ratio">

          <span>日环比 12.4%</span>
          <span class="ratio-arrow">↗</span>
        
        </div>
       -->
      
      </div>
    </div>
  </div>
</template>

<script>
import { useSelectedDataStore } from "@/store/selectedDataStore";

export default {
  name: 'VocWindow',
  data() {
    return {
      vocWindowStyle: {
        right: '90px',
        bottom: '65px'
      },
      // 拖动相关数据
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      initialRight: 0,
      initialBottom: 0,
    };
  },
  computed: {
    vocWindowState() {
      const state = useSelectedDataStore().vocWindowState;
      //console.log('浮窗状态变化:', state);
      return state;
    },
  },
  mounted() {
    // 初始化浮窗位置到右下角
    this.initVocWindowPosition();
    window.addEventListener("resize", this.resizeWindow);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeWindow);
    // 清理拖动事件监听器
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  },
  methods: {
    // 初始化浮窗位置到右下角
    initVocWindowPosition() {
     // 直接设置为右下角位置，考虑新的宽度
     this.vocWindowStyle.right = '150px';
          this.vocWindowStyle.marginRight = 'calc(1%)';
          this.vocWindowStyle.bottom = 'calc(10% - 70px)';
    },
    
    // 计算指示器位置
    getIndicatorPosition() {
      if (!this.vocWindowState.deviceData?.valueLatest) {
        return '46%'; // 默认位置
      }
      
      const value = parseFloat(this.vocWindowState.deviceData.valueLatest);
      const maxValue = 50; // 最大值
      const percentage = Math.min((value / maxValue) * 100, 100);
      return percentage + '%';
    },
    
    // 重新计算浮窗位置
    resizeWindow() {
      this.initVocWindowPosition();
    },
    
    // 设置浮窗位置
    setPosition(right, bottom) {
      this.vocWindowStyle.right = right;
      this.vocWindowStyle.bottom = bottom;
    },
    
    // 获取当前位置
    getPosition() {
      return {
        right: this.vocWindowStyle.right,
        bottom: this.vocWindowStyle.bottom
      };
    },
    closeWindow() {
      const selectedDataStore = useSelectedDataStore();
        // 更新浮窗状态中的设备数据
        selectedDataStore.setVocWindowState({
          visible: false,
          deviceIndex: null,
          deviceData: null
        });
        this.vocWindowVisible = false;
        this.vocWindowDeviceIndex = null;
        window.removeEventListener("resize", this.resizeWindow);
    },
    
    // 拖动相关方法
    handleMouseDown(event) {
      // 阻止默认行为
      event.preventDefault();
      
      // 开始拖动
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      
      // 记录初始位置
      this.initialRight = parseInt(this.vocWindowStyle.right) || 0;
      this.initialBottom = parseInt(this.vocWindowStyle.bottom) || 0;
      
      // 添加全局事件监听器
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      
      // 通知父组件开始拖动
      this.$emit('drag-start');
      
      console.log('开始拖动浮窗');
    },
    
    handleMouseMove(event) {
      if (!this.isDragging) return;
      
      // 计算移动距离
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;
      
      // 计算新位置（Y轴方向修正：鼠标往下移动，bottom应该减少）
      const newRight = this.initialRight - deltaX;
      const newBottom = this.initialBottom - deltaY;
      
      // 允许拖动到地图外面，只限制在浏览器视窗范围内
      const maxRight = window.innerWidth - 340; // 浮窗宽度
      const maxBottom = window.innerHeight - 200; // 浮窗高度估算
      
      // 允许部分弹窗超出边界，但至少保留一部分可见
      const minRight = -300; // 允许弹窗大部分超出右边界
      const minBottom = -150; // 允许弹窗大部分超出下边界
      
      this.vocWindowStyle.right = Math.max(minRight, Math.min(newRight, maxRight)) + 'px';
      this.vocWindowStyle.bottom = Math.max(minBottom, Math.min(newBottom, maxBottom)) + 'px';
    },
    
    handleMouseUp(event) {
      if (!this.isDragging) return;
      
      // 结束拖动
      this.isDragging = false;
      
      // 移除全局事件监听器
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      
      // 通知父组件结束拖动
      this.$emit('drag-end');
      
      console.log('结束拖动浮窗');
    },
  },
};
</script>

<style lang="scss" scoped>
/* VOC浮窗样式 */
.voc-window {
  position: absolute;
  width: 340px;
  background: linear-gradient(135deg, rgb(16 49 96) 0%, rgb(2 121 178) 100%);
  border-radius: 0px;
  box-shadow: 
    0 80px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
  z-index: 500;
  user-select: none;
  right: 80px;
  bottom: 80px;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: grab; /* 默认显示抓取手型 */
}

/* 拖动时的样式 */
.voc-window.dragging {
  cursor: grabbing; /* 拖动时显示握拳手型 */
  transition: none; /* 拖动时禁用过渡动画 */
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: scale(1.02); /* 拖动时稍微放大 */
}

.voc-window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.voc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 22px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  position: relative;
}

.voc-title {
  color: #88ecfb;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(136, 236, 251, 0.3);
  letter-spacing: 0.5px;
}

.status-online {
  display: flex;
  align-items: center;
  color: #52c41a;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s infinite, statusGlow 1s ease-in-out infinite alternate;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes statusGlow {
  0% { 
    box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
  }
  100% { 
    box-shadow: 0 0 15px rgba(82, 196, 26, 0.9);
  }
}

.device-type {
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.voc-content {
  padding: 12px 22px 14px;
  background: rgba(0, 0, 0, 0.05);
}

.value-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 80px;
}

.value-item {
  text-align: center;
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.value-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.value-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 6px;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.value-number {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.indicator-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.indicator-bar {
  position: relative;
  flex: 1;
  height: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bar-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #1890ff 0%, #52c41a 50%, #faad14 100%);
  border-radius: 5px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-pointer {
  position: absolute;
  top: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 16px solid #88ecfb;
  transform: translateX(-50%);
  transition: left 0.5s ease-in-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

.bar-labels span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  opacity: 0.8;
  font-weight: 500;
}

.daily-ratio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  width: calc(50% - 10px);
  box-sizing: border-box;
}

.daily-ratio:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.ratio-arrow {
  color: #ff4d4f;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(255, 77, 79, 0.4);
}


.close-button {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 24px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 510;
}

.close-button:hover {
  color: #fff;
}


</style>
