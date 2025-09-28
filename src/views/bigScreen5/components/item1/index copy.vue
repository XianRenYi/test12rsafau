<template>
  <div class="layout-panel">
    <!-- 顶部操作栏区域 -->
    <div class="panel-header">
      <div class="panel-header-title"></div>
    </div>

    <!-- 标签页选择区域 -->
    <div class="tabs-nav-container">
      <el-tabs
        v-model="activeName"
        type="border-card"
        @tab-click="handleClick"
        class="custom-tabs"
      >
        <el-tab-pane label="设备列表" name="fifth" />
        <el-tab-pane label="实时数据" name="first" />
        <el-tab-pane label="加载" name="second" />
        <el-tab-pane label="可视化" name="third" />
        <el-tab-pane label="输出" name="fourth" />
      </el-tabs>
    </div>

    <!-- 内容区域 -->
    <div class="panel-body">
      <div class="info">
        <!-- 各标签页内容 -->
        <div v-if="activeName === 'first'" class="tab-content">
          <el-card style="max-width: 480px; margin-bottom: 15px">
            <div ref="tempChartRef" style="width: 100%; height: 200px"></div>
          </el-card>

          <el-card style="max-width: 480px; margin-bottom: 15px">
            <div ref="humidityChartRef" style="width: 100%; height: 200px"></div>
          </el-card>

          <el-card style="max-width: 480px; margin-bottom: 15px">
            <div ref="pm1ChartRef" style="width: 100%; height: 200px"></div>
          </el-card>
          <el-card style="max-width: 480px; margin-bottom: 15px">
            <div ref="pm25ChartRef" style="width: 100%; height: 200px"></div>
          </el-card>
          <el-card style="max-width: 480px; margin-bottom: 15px">
            <div ref="pm10ChartRef" style="width: 100%; height: 200px"></div>
          </el-card>
        </div>

        <div v-if="activeName === 'second'" class="tab-content">
          <div class="task-list">
            <el-card style="max-width: 480px">
              <template #header>
                <div class="card-header">
                  <span>当前加载的任务列表</span>
                </div>
              </template>

              <el-table
                ref="multipleTableRef"
                :data="tableData"
                row-key="id"
                style="width: 100%"
                height="250"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" :selectable="selectable" width="55" />
                <el-table-column label="时间" width="120">
                  <template #default="scope">{{ scope.row.date }}</template>
                </el-table-column>

                <el-table-column property="address" label="文件名称" />
              </el-table>

              <el-button type="primary" style="margin-top: 20px; width: 100%"
                >载入本地任务文件</el-button
              >
            </el-card>

            <el-card style="margin-top: 10px">
              <template #header>
                <div class="card-header">
                  <span>数据时间范围</span>
                </div>
              </template>

              <div class="mb-4">
                <el-button type="primary" style="margin-top: 20px; width: 120px"
                  >所有</el-button
                >
                <el-button type="primary" style="margin-top: 20px; width: 120px"
                  >0.5小时内</el-button
                >
                <el-button type="primary" style="margin-top: 20px; width: 120px"
                  >1小时内</el-button
                >
              </div>
              <div class="mb-4">
                <el-button type="primary" style="margin-top: 20px; width: 120px"
                  >2小时内</el-button
                >
                <el-button type="primary" style="margin-top: 20px; width: 120px"
                  >6小时内</el-button
                >
                <el-button type="primary" style="margin-top: 20px; width: 120px"
                  >24小时内</el-button
                >
              </div>
            </el-card>
          </div>
        </div>

        <div v-if="activeName === 'third'" class="tab-content">
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

        <div v-if="activeName === 'fourth'" class="tab-content">
          <el-card style="max-width: 450px">
            <div class="mb-4">
              <el-form-item label="项目名称">
                <el-input />
              </el-form-item>
              <el-form-item label="监测单位">
                <el-input />
              </el-form-item>
            </div>

            <div class="mb-4">
              <el-button type="primary" style="margin-top: 20px; width: 100%"
                >生成任务报告</el-button
              >
            </div>
          </el-card>
        </div>

        <div v-if="activeName === 'fifth'" class="tab-content">
          <el-card style="max-width: 480px">
            <template #header>
              <div class="card-header">
                <span>更多</span>
              </div>
            </template>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import {
  ElSlider,
  ElCheckbox,
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElRadioGroup,
  ElRadio,
  ElFormItem,
  ElInput,
  ElTabs,
  ElTabPane,
} from "element-plus";
import "element-plus/dist/index.css";

export default {
  components: {
    ElSlider,
    ElCheckbox,
    ElCard,
    ElTable,
    ElTableColumn,
    ElButton,
    ElRadioGroup,
    ElRadio,
    ElFormItem,
    ElInput,
    ElTabs,
    ElTabPane,
  },
  data() {
    return {
      activeName: "first",
      tempChartRef: null,
      humidityChartRef: null,
      pm1ChartRef: null,
      pm25ChartRef: null,
      pm10ChartRef: null,
      multipleTableRef: null,
      multipleSelection: [],
      tableData: [
        {
          id: 1,
          date: "2016-05-03",
          name: "Tom",
          address: "No. 189, Grove St, Los Angeles",
        },
        {
          id: 2,
          date: "2016-05-02",
          name: "Tom",
          address: "No. 189, Grove St, Los Angeles",
        },
      ],
      // 可视化相关配置
      gridSize: "小",
      gridSizes: ["自定", "小", "中", "大"],
      useAverageValue: true,
      trackingMode: "置中",
      trackingModes: ["置中", "跟随", "手动"],
      mapSource: "MapBox街道",
      mapSources: ["高德卫星", "高德街道", "MapBox卫星", "MapBox街道"],
      colorMode: "线性",
      colorModes: ["线性", "美国AQI", "中国AQI"],
      opacity: 49.4,
      heightRange: [0, 100],
      radio: 3,
    };
  },
  methods: {
    handleClick(tab) {
      console.log("切换到标签页:", tab.name);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    setGridSize(size) {
      this.gridSize = size;
    },
    setTrackingMode(mode) {
      this.trackingMode = mode;
    },
    setMapSource(source) {
      this.mapSource = source;
    },
    setColorMode(mode) {
      this.colorMode = mode;
    },
    selectable(row, index) {
      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
// 统一色彩变量系统
$primary: #0b2453;
$primary-light: rgba($primary, 0.1);
$primary-dark: rgba($primary, 0.9);
$secondary: #6b7280;
$background: #f9fafb;
$card-bg: #ffffff;
$text-primary: #1f2937;
$text-secondary: #4b5563;
$border-color: #e5e7eb;

// 统一字体大小设置
:root {
  --font-size-base: 18px;
  --line-height-base: 1.6;
}

.layout-panel {
  position: relative;
  color: $text-primary;
  background: $background url("@/assets/panel_body_bg.png") no-repeat center/cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    height: 65px;
    background: $primary url("@/assets/panel_title_bg.png") no-repeat center/cover;
    padding: 0 20px;

    .panel-header-title {
      font-size: var(--font-size-base);
      font-weight: 500;
      letter-spacing: 0.5px;
      color: #ffffff;
    }
  }

  // 标签页导航容器
  .tabs-nav-container {
    background-color: $card-bg;
    border-bottom: 1px solid $border-color;

    .custom-tabs {
      width: 100%;
      --el-tabs-header-height: 50px;

      :deep(.el-tabs__nav) {
        width: 100%;
        justify-content: space-around;
        border-bottom: none;

        .el-tabs__item {
          padding: 0 20px;
          font-size: 24px;
          height: 50px;
          line-height: 50px;
          transition: all 0.3s;
          color: $text-secondary;

          &.is-active {
            color: $primary;
            font-weight: 500;
            border-bottom: 2px solid $primary;
          }

          &:hover {
            color: $primary;
            background-color: $primary-light;
          }
        }
      }
    }
  }

  .panel-body {
    height: calc(118vh - 115px);
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: $background;
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);

    // 滚动条美化
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: $primary-light;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: $primary;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: $primary-dark;
    }
  }
}

.info {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 16px 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
  padding: 12px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

// 卡片样式优化
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid $border-color;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: $card-bg;
  margin-bottom: 16px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .el-card__header {
    padding: 12px 16px;
    background-color: $primary-light;
    border-bottom: 1px solid $border-color;
    color: $primary;
    font-weight: 500;
    font-size: var(--font-size-base);
  }

  .el-card__body {
    padding: 16px;
    color: $text-secondary;
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
  }
}

// 按钮样式优化
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.2s;
  font-size: var(--font-size-base);
  padding: 8px 16px;

  &:not(:last-child) {
    margin-right: 8px;
  }

  &.el-button--primary {
    background: $primary;
    border: none;
    color: #ffffff;

    &:hover {
      background: $primary-dark;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba($primary, 0.3);
    }
  }

  &.el-button--default {
    background: $card-bg;
    color: $text-secondary;
    border: 1px solid $border-color;

    &:hover {
      background-color: $primary-light;
      border-color: $primary;
      color: $primary;
    }
  }
}

// 表格样式优化
:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid $border-color;
  font-size: var(--font-size-base);

  .el-table__header-wrapper {
    background-color: $primary-light;

    th {
      color: $primary;
      background-color: transparent !important;
      border-bottom: 1px solid $border-color;
      font-size: var(--font-size-base);
    }
  }

  .el-table__body-wrapper {
    tr {
      &:hover > td {
        background-color: $primary-light !important;
      }
    }

    td {
      border-bottom: 1px solid $border-color;
      font-size: var(--font-size-base);
    }
  }
}

// 动画效果
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

// 可视化样式
.content-wrapper {
  max-width: 450px;
  margin: 0 auto;
  background-color: $card-bg;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 24px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
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
  font-size: var(--font-size-base);
  color: $text-secondary;
}

h2,
h3 {
  font-size: var(--font-size-base);
  font-weight: 500;
  margin: 16px 0 8px;
  color: $text-primary;
}

p {
  font-size: var(--font-size-base);
  color: $text-secondary;
  margin-top: 8px;
  line-height: var(--line-height-base);
}

.setting-item {
  padding: 20px;
  background-color: $background;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid $border-color;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: var(--font-size-base);
}

.grid-size-buttons,
.tracking-buttons,
.map-source-buttons,
.color-mode-buttons {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.grid-size-buttons {
  grid-template-columns: repeat(4, 1fr);
}

.tracking-buttons,
.color-mode-buttons {
  grid-template-columns: repeat(3, 1fr);
}

.map-source-buttons {
  grid-template-columns: repeat(2, 1fr);
}

.button {
  padding: 8px 16px;
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-base);
}

:deep(.el-slider__runway) {
  background-color: $border-color;
}

:deep(.el-slider__bar) {
  background-color: $primary;
}

:deep(.el-slider__button) {
  border-color: $primary;
  background-color: $card-bg;

  &:hover {
    box-shadow: 0 0 0 5px $primary-light;
  }
}

:deep(.el-checkbox) {
  font-size: var(--font-size-base);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: $primary;
  border-color: $primary;
}

:deep(.el-checkbox__label) {
  color: $text-secondary;
  font-size: var(--font-size-base);
  margin-left: 8px;
}

:deep(.el-input__wrapper) {
  border-color: $border-color;
  font-size: var(--font-size-base);

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 2px $primary-light;
  }
}

:deep(.el-form-item) {
  margin-bottom: 16px;

  & > label {
    font-size: var(--font-size-base);
    color: $text-primary;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .layout-panel {
    .panel-body {
      padding: 12px;
    }

    .tabs-nav-container {
      .custom-tabs {
        :deep(.el-tabs__item) {
          padding: 0 8px;
          font-size: var(--font-size-base);
        }
      }
    }

    .info {
      max-width: 100%;
    }
  }

  .grid-size-buttons,
  .tracking-buttons,
  .map-source-buttons,
  .color-mode-buttons {
    gap: 8px;
  }

  .button {
    padding: 6px 8px;
    font-size: var(--font-size-base);
  }

  :deep(.el-button) {
    font-size: var(--font-size-base);
    padding: 6px 12px;
  }
}
</style>
