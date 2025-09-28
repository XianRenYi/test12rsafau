<template>
  <div class="tab-content">
    <div class="task-list">
      <div class="content-wrapper">
        <div class="color-reference">
          <div class="gradient-bar">
            <div class="gradient"></div>
          </div>
          <div class="scale-marks">
            <span>0.00</span>
            <span>100.00</span>
          </div>
          <h2>调整颜色参考</h2>
          <p>
            在左侧的可视化界面中，颜色越红代表浓度越高，颜色越绿代表浓度越低。可在此设置颜色与浓度之间的对应关系。
          </p>
        </div>
        <div class="settings-container">
          <div class="setting-item">
            <div class="setting-header">
              <h3>网格大小</h3>
              <span>{{ gridSize }}</span>
            </div>
            <div class="grid-size-buttons">
              <button
                v-for="size in gridSizes"
                :key="size"
                @click="setGridSize(size)"
                :class="['button', gridSize === size ? 'active' : '']"
              >
                {{ size }}
              </button>
            </div>
            <div class="checkbox-container">
              <el-checkbox v-model="useAverageValue">网格平均浓度值</el-checkbox>
              <p>
                通过上面的按钮与滑块调整网格的大小。网格越小，全图分辨率越高，但扫描区域所需要的路程越短。
              </p>
            </div>
          </div>
          <div class="setting-item">
            <h3>追踪模式</h3>
            <div class="tracking-buttons">
              <button
                v-for="mode in trackingModes"
                :key="mode"
                @click="setTrackingMode(mode)"
                :class="['button', trackingMode === mode ? 'active' : '']"
              >
                {{ mode }}
              </button>
            </div>
            <p>
              在"置中"模式下，设备位置会保持在地图视角的中心。在"跟随"模式下，设备位置会处于地图视角内。在"手动"模式下，您可以自由拖动地图视角。
            </p>
          </div>
          <div class="setting-item">
            <h3>地图源</h3>
            <div class="map-source-buttons">
              <button
                v-for="source in mapSources"
                :key="source"
                @click="setMapSource(source)"
                :class="['button', mapSource === source ? 'active' : '']"
              >
                {{ source }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ElCheckbox } from "element-plus";

export default {
  components: {
    ElCheckbox,
  },
  setup() {
    // 网格大小设置
    const gridSize = ref("小");
    const gridSizes = ref(["自定", "小", "中", "大"]);
    const useAverageValue = ref(true);

    // 追踪模式设置
    const trackingMode = ref("置中");
    const trackingModes = ref(["置中", "跟随", "手动"]);

    // 地图源设置
    const mapSource = ref("MapBox街道");
    const mapSources = ref(["高德卫星", "高德街道", "MapBox卫星", "MapBox街道"]);

    // 设置网格大小
    const setGridSize = (size) => {
      gridSize.value = size;
      console.log("网格大小设置为:", size);
    };

    // 设置追踪模式
    const setTrackingMode = (mode) => {
      trackingMode.value = mode;
      console.log("追踪模式设置为:", mode);
    };

    // 设置地图源
    const setMapSource = (source) => {
      mapSource.value = source;
      console.log("地图源设置为:", source);
    };

    return {
      gridSize,
      gridSizes,
      useAverageValue,
      trackingMode,
      trackingModes,
      mapSource,
      mapSources,
      setGridSize,
      setTrackingMode,
      setMapSource,
    };
  },
};
</script>

<style lang="scss" scoped>
// 引入主样式变量
// 引入主样式变量
$primary: #0b2453;
$primary-light: rgba($primary, 0.1);
$primary-dark: rgba($primary, 0.9);
$secondary: #6b7280;
$background: #f9fafb;
$card-bg: #ffffff;
$text-primary: #1f2937;
$text-secondary: #4b5563;
$border-color: #e5e7eb;

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

.content-wrapper {
  max-width: 750px;
  margin: 0 auto;
  background-color: $card-bg;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.color-reference {
  margin-bottom: 32px;
}

.gradient-bar {
  position: relative;
  height: 24px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid $border-color;
}

.gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #36d399, #fbbd23, #f87272);
}

.scale-marks {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: $text-secondary;
}

h2,
h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 16px 0 8px;
  color: $text-primary;
}

p {
  font-size: 14px;
  color: $text-secondary;
  margin-top: 8px;
  line-height: 1.6;
}

.setting-item {
  padding: 20px;
  background-color: $background;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid $border-color;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.grid-size-buttons,
.tracking-buttons,
.map-source-buttons {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.grid-size-buttons {
  grid-template-columns: repeat(4, 1fr);
}

.tracking-buttons {
  grid-template-columns: repeat(3, 1fr);
}

.map-source-buttons {
  grid-template-columns: repeat(2, 1fr);
}

.button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  background-color: $card-bg;
  color: $text-secondary;
  border: 1px solid $border-color;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &.active {
    background-color: $primary;
    color: white;
    border-color: $primary;
  }
}

.checkbox-container {
  margin-top: 8px;
}

// 复选框样式
:deep(.el-checkbox) {
  font-size: 14px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: $primary;
  border-color: $primary;
}

:deep(.el-checkbox__label) {
  color: $text-secondary;
  margin-left: 8px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .grid-size-buttons,
  .tracking-buttons,
  .map-source-buttons {
    gap: 8px;
  }

  .button {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
