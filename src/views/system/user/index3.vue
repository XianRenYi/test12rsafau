<template>
  <div class="container">
    <div :id="withKeyId" class="map-container" :style="mapStyle"></div>
    <div ref="echartsContainer" class="echarts-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";

import * as echarts from "echarts";
import "echarts-gl"; // 3D 扩展支持

let map = null;
const echartsInstance = ref(null);
const echartsContainer = ref(null);

// 计算地图容器 ID
const withKeyId = computed(() => `container`);

// 地图样式
const mapStyle = ref({
  width: "1021px",
  height: "461px",
  transform: "rotateX(51deg) skewX(-159deg) translateY(179px) rotate(-12deg)",
});

// 初始化 container 地图
const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 7,
    center: { lng: 116.378174, lat: 30.537774 },
    minZoom: 3,
    maxZoom: 18,
    control: {
      scale: true,
      zoom: { position: "bottomleft" },
    },
    basemaps: [{ name: "高德地图", type: "gaode", layer: "vec", show: true }],
    operationallayers: [{ name: "经纬网", type: "graticule" }],
  });
};

// 监听 ECharts 3D 交互并更新 `.map-container` 样式
const updateMapStyle = () => {
debugger

  if (!echartsInstance.value) return;
  const option = echartsInstance.value.getOption();
  const viewControl = option.grid3D[0].viewControl;

  // 计算缩放比例
  const scale = Math.max(0.5, Math.min(1.5, 500 / viewControl.distance));

  // 设置地图旋转、缩放、位置变化
  mapStyle.value = {
    width: `${1021 * scale}px`,
    height: `${461 * scale}px`,
    transform: `rotateX(${viewControl.alpha - 20}deg) rotateY(${viewControl.beta}deg) scale(${scale})`,
  };
};

// 初始化 ECharts 3D
const initECharts = () => {
  if (!echartsContainer.value || echartsInstance.value) return;
  echartsInstance.value = echarts.init(echartsContainer.value);

  const option = {
    tooltip: {
      formatter: (params) => {
        const data = params.data;
        return `经度: ${data[0].toFixed(4)}<br/>纬度: ${data[1].toFixed(4)}<br/>值: ${data[2]}`;
      },
    },
    xAxis3D: { type: "value", min: 113.94, max: 113.97 },
    yAxis3D: { type: "value", min: 22.531, max: 22.534 },
    zAxis3D: { type: "value", min: 0, max: 100 },
    grid3D: {
      boxWidth: 150,
      boxDepth: 150,
      boxHeight: 70,
      viewControl: {
        distance: 250,
        alpha: 19,
        beta: 80,
        projection: "perspective",
      },
      light: {
        main: { intensity: 1.5, shadow: true, shadowQuality: "high" },
      },
    },
    series: [
      {
        type: "scatter3D",
        symbolSize: 16,
        data: [
          [113.94360, 22.53200, 50],
          [113.94640, 22.53300, 50],
          [113.94920, 22.53300, 50],
          [113.95200, 22.53300, 50],
          [113.95480, 22.53300, 50],
          [113.95760, 22.53300, 50],
          [113.96040, 22.53300, 50],
          [113.96320, 22.53300, 50],
        ],
        itemStyle: { color: "#FF4500", opacity: 0.8, borderColor: "#FFF", borderWidth: 1 },
        emphasis: { itemStyle: { color: "#FF6347", borderWidth: 2 } },
      },
    ],
  };

  echartsInstance.value.setOption(option);

  // 监听 3D 交互
  
  echartsInstance.value.on("updateAxisPointer", updateMapStyle);
 

};

onMounted(() => {
  nextTick(() => {
    initMars3d();
    initECharts();
  });
});

onBeforeUnmount(() => {
  if (map) {
    map.destroy();
    map = null;
  }
  if (echartsInstance.value) {
    echartsInstance.value.dispose();
    echartsInstance.value = null;
  }
});
</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map-container {
  position: absolute;
  overflow: hidden;
  background-color: rgb(243, 241, 236);
  text-align: left;
  width: 1021px;
  height: 461px;
  right: 3px;
  left: 48px;
  top: 277px;
  clip-path: polygon(49% -3%, 100% 6%, 100% 100%, 9% 100%);
  transform: rotateX(51deg) skewX(-159deg) translateY(179px) rotate(-12deg);
  z-index: 1;
}

.echarts-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: -100px;
  left: -161px;
  z-index: 2;
}

.container-logo,
.container-attribution {
  display: none !important;
}
</style>
