<template>
  <div 
    v-if="incidentData"
    ref="vocWindow" 
    class="voc-window"
    :style="vocWindowStyle"
  >
    <div class="voc-header">
      <span class="voc-title">{{ incidentData?.serialNumber || '序列号' }}</span>
      <span class="status-online">
        <span class="status-dot"></span>
        {{ incidentData?.statusName || '在线' }}
      </span>
      <span class="device-type"></span>
      <div class="close-button" @click="closeWindow">×</div>
    </div>
    
    <div class="voc-content">
      <div class="value-section">
        <div class="value-item">
          <div class="value-number" :key="incidentData?.valueLatest">
            {{ incidentData?.name || ' ' }}
          </div>
        </div>
      
      </div>
      <div class="value-section">
        <div class="value-item">
          <div class="value-number" :key="incidentData?.valueLatest">
            {{ incidentData?.details || ' ' }}
          </div>
        </div>
      
      </div>
     

      <div class="indicator-section">
      
      </div>
    </div>
  </div>
</template>

<script>
// import { useSelectedDataStore } from "@/store/selectedDataStore";

export default {
  name: 'VocWindowTwo',
  props: {
    incidentData: {
      type: Object,
      default: null
    },
    mapInstance: {
      type: Object, // Leaflet Map 实例
      default: null
    }
  },
  data() {
    return {
      vocWindowStyle: {
        position: 'absolute',
        // 移除原有的 right 和 bottom 属性，改为使用 left 和 top
      },
    };
  },
  watch: {
    incidentData: {
      handler(newVal) {
        console.log('VocWindowTwo: incidentData changed', newVal);
        debugger
        if (newVal && this.mapInstance) {
          this.updateWindowPosition();
        }
      },
      deep: true,
      immediate: true,
    },
    mapInstance: {
      handler(newVal) {
        console.log('VocWindowTwo: mapInstance changed', newVal);
        if (newVal && this.incidentData) {
          this.updateWindowPosition();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    window.addEventListener("resize", this.resizeWindow);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeWindow);
  },
  methods: {
    // 初始化浮窗位置到右下角
    initVocWindowPosition() {
    },
    
    // 更新浮窗位置
    updateWindowPosition() {
      console.log('VocWindowTwo: updateWindowPosition called', { mapInstance: !!this.mapInstance, incidentData: !!this.incidentData, markerPosition: this.incidentData?.markerPosition });
      if (!this.mapInstance || !this.incidentData || !this.incidentData.markerPosition) {
        console.warn('VocWindowTwo: updateWindowPosition aborted due to missing data');
        return;
      }

      const [lat, lng] = this.incidentData.markerPosition; // 注意，markerPosition 已经是 [lat, lng]
      const point = this.mapInstance.latLngToContainerPoint([lat, lng]); // 相对于地图容器的像素坐标
      console.log('VocWindowTwo: Marker screen point (relative to map container)', point);

      // 获取浮窗自身尺寸
      this.$nextTick(() => {
        const vocWindowElement = this.$refs.vocWindow;
        if (vocWindowElement) {
          const windowWidth = vocWindowElement.offsetWidth;
          const windowHeight = vocWindowElement.offsetHeight;

          // 获取地图容器及其父元素的边界信息
          const mapContainerElement = this.mapInstance.getContainer();
          const echartsBodysElement = mapContainerElement.parentElement; // div.echartsBodys

          const rectMap = mapContainerElement.getBoundingClientRect();
          const rectEchartsBodys = echartsBodysElement.getBoundingClientRect();

          // 计算标记点相对于 echartsBodys 的像素坐标
          const markerX_relativeTo_EchartsBodys = (rectMap.left - rectEchartsBodys.left) + point.x;
          const markerY_relativeTo_EchartsBodys = (rectMap.top - rectEchartsBodys.top) + point.y;

          // 计算浮窗的 left 和 top 样式
          const leftOffset = markerX_relativeTo_EchartsBodys - windowWidth / 2; // 浮窗水平居中于标记点
          const topOffset = markerY_relativeTo_EchartsBodys - windowHeight + 30; // 浮窗底部上移 40px 位于标记点上方

          this.vocWindowStyle.left = `${leftOffset}px`;
          this.vocWindowStyle.top = `${topOffset}px`;
          // 移除 right 和 bottom，因为现在使用 left 和 top
          delete this.vocWindowStyle.right;
          delete this.vocWindowStyle.bottom;
          console.log('VocWindowTwo: Window position updated', { left: this.vocWindowStyle.left, top: this.vocWindowStyle.top, markerX: markerX_relativeTo_EchartsBodys, markerY: markerY_relativeTo_EchartsBodys });
        }
      });
    },

    // 计算指示器位置
    getIndicatorPosition() {
      if (!this.incidentData?.valueLatest) {
        return '46%'; // 默认位置
      }
      
      const value = parseFloat(this.incidentData.valueLatest);
      const maxValue = 50; // 最大值
      const percentage = Math.min((value / maxValue) * 100, 100);
      return percentage + '%';
    },
    
    // 重新计算浮窗位置
    resizeWindow() {
      this.updateWindowPosition();
    },
    
    // 设置浮窗位置
    setPosition(left, top) {
      this.vocWindowStyle.left = left;
      this.vocWindowStyle.top = top;
    },
    
    // 获取当前位置
    getPosition() {
      return {
        left: this.vocWindowStyle.left,
        top: this.vocWindowStyle.top
      };
    },
    closeWindow() {
      this.$emit('close-voc-window');
    },
  },
};
</script>

<style lang="scss" scoped>
/* VOC浮窗样式 */
.voc-window {
  position: absolute;
  width: 340px;
  height: 160px; /* 固定高度 */
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.65) 0%, rgba(42, 82, 152, 0.7) 100%);
  backdrop-filter: blur(80px);
  -webkit-backdrop-filter: blur(80px);
  border-radius: 0px;
  box-shadow: 
    0 80px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
  z-index: 500;
  user-select: none;
  /* 移除以下定位属性，因为它们将通过 vocWindowStyle 动态设置 */
  /* right: 80px;
  bottom: 80px; */
  transition: all 0.3s ease;
  overflow: hidden;
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
</style>
