<template>
  <div class="layout">
    <LayoutHeader />
    <!-- <LayoutFooter /> -->
    <div class="layout-main">
      <!-- 暂时注释掉所有可能干扰地图的元素 -->
      <!-- <div class="main-left">
        <WidgetPanel04 />
        <WidgetPanel02 />
        <WidgetPanel03 />
      </div> -->
      <!-- <div class="main-right">
        <div class="homeMainRight">
          <RightPanel>
            <item1 />
          </RightPanel>
        </div>
      </div> -->

      <!-- 地图区域 - 确保完全覆盖整个区域 -->
      <div class="map-area">
        <item9></item9>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import LayoutHeader from "./components/LayoutHeader.vue";

import item9 from "./components/cesuim/index.vue";
import item1 from "./components/item1/index.vue";
import RightPanel from "./components/Panel2/RightPanel.vue";


</script>
<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;
  background-color: #000;
  background-image: url(@/assets/page_bg.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .layout-main {
    position: relative;
    width: 100%;
    height: calc(100% - 80px);
    .main-left {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 100; /* 降低z-index，避免覆盖地图 */
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      grid-gap: 20px;
      width: 420px;
      height: calc(100% - 20px);
      pointer-events: auto; /* 确保可以交互 */
    }
    .main-right {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 100; /* 降低z-index，避免覆盖地图 */
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      grid-gap: 20px;
      width: 600px;
      max-width: 25%;
      height: calc(100% - 20px);
      pointer-events: auto; /* 确保可以交互 */
    }
    .main-middle {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1; /* 降低z-index，确保地图可以正常交互 */
      width: 100%;
      height: 100%;
      pointer-events: none; /* 确保不阻止地图交互 */
      &::before {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1; /* 降低z-index */
        width: 100%;
        height: 100%;
        pointer-events: none; /* 确保不阻止地图交互 */
        content: "";
        background-image: radial-gradient(circle, transparent 30%, #000 60%);
      }
    }
    
    /* 地图区域样式 */
    .map-area {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1000; /* 提高z-index，确保在地图区域之上 */
      width: 100%;
      height: 100%;
      pointer-events: auto; /* 确保地图可以交互 */
      background: transparent; /* 确保背景透明 */
    }
  }
}
</style>
