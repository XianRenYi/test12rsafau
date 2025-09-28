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
        <DeviceList v-if="activeName === 'fifth'" />
        <RealtimeData v-if="activeName === 'first'" />
        <LoadData v-if="activeName === 'second'" />
        <Visualization v-if="activeName === 'third'" />
        <OutputReport v-if="activeName === 'fourth'" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ElTabs, ElTabPane } from "element-plus";
import DeviceList from "./DeviceList.vue";
import RealtimeData from "./RealtimeData.vue";
import LoadData from "./LoadData.vue";
import Visualization from "./Visualization.vue";
import OutputReport from "./OutputReport.vue";

export default {
  components: {
    ElTabs,
    ElTabPane,
    DeviceList,
    RealtimeData,
    LoadData,
    Visualization,
    OutputReport,
  },
  setup() {
    const activeName = ref("first");

    const handleClick = (tab) => {
      console.log("切换到标签页:", tab.name);
    };

    return {
      activeName,
      handleClick,
    };
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
  --font-size-base: 24px;
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
    padding: 6px;
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
  max-width: 700px;
  margin: 0 auto;
  padding: 16px 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
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
}
</style>
