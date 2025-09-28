<template>
  <div class="container">
    <div :id="withKeyId" class="map-container" :style="mapStyle"></div>
    <div ref="echartsContainer" class="echarts-container"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import "leaflet/dist/leaflet.css";



import * as echarts from "echarts";
import "echarts-gl"; // 必须引入支持 3D 的 echarts-gl 扩展

let map = null;
const echartsInstance = ref(null);
const echartsContainer = ref(null);

// 计算地图容器 ID
const withKeyId = computed(() => `container`);

// 地图样式
const mapStyle = ref({
  width: "848px",
  height: "639px",
  transform: "rotateX(61deg) skewX(-165deg) translateY(115px) rotate(-7deg) translateZ(-27px) translateX(108px)"

});

// 初始化 container 地图
const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 17,
    center: { lng: 120.526248, lat: 31.279101 },
    minZoom: 3,
    maxZoom: 18,
    control: {
      scale: true,
    },
    basemaps: [
      { name: "高德地图", type: "gaode", layer: "vec", show: true },
    ],
  
  });

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
        distance: 300,
        alpha: 19,
        beta: 80,
        projection: "perspective",
        minAlpha: 0,  // 限制最小 alpha，防止翻转
        maxAlpha: 90, // 限制最大 alpha，防止过度旋转
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


// 监听 ECharts 3D 交互并更新 `.map-container` 样式
const updateMapStyle = () => {

  if (!echartsInstance.value) return;
  const option = echartsInstance.value.getOption();
  //const viewControl = option.grid3D[0].viewControl;
  const viewControl = echartsInstance.value.getModel().getComponent('grid3D').option.viewControl;
  console.log('当前 distance:', viewControl.distance);

  // 计算缩放比例
  var scale = 500 / (viewControl.distance + 100);

  console.log('当前缩放倍率: ', scale);

  var valueWidth=echartsInstance.value.getWidth();
  var valueHeight=echartsInstance.value.getHeight();

  // 设置地图旋转、缩放、位置变化
   var mapWidth2=valueWidth/1.7688679245283019;
   var mapHeight2=valueHeight/1.948356807511737;
   
   
  // var mapWidth=`${978}px`;
  // var mapHeight=`${ 639}px`;
 if(viewControl.distance==300){
   scale=1;
 } 
 
 var mapWidth=`${mapWidth2 * scale}px`;
  var mapHeight=`${ mapHeight2 * scale}px`;

  var viewControlalpha=viewControl.alpha;
  var viewControlbeta=viewControl.beta;

  var chanageAlpha=viewControlalpha+42  ;
  var chanageBeta=-84 + viewControlbeta  ;

  console.log('viewControlalpha: ', viewControlalpha);
  console.log('viewControlbeta: ', viewControlbeta);

 //  var chanageTransform = `rotateX(${viewControlalpha - 20}deg) rotateY(${viewControlbeta}deg) scale(${scale})`;
  // var chanageTransform ="rotateX(61deg) rotateY(-4deg) skewX(-159deg) translateY(106px) translateZ(-29px) translateX(107px)"

  if(viewControlbeta==80){
    var chanageTransform = `rotateX(${chanageAlpha}deg) rotateY(${chanageBeta}deg)  skewX(-159deg) translateY(106px) translateZ(-29px) translateX(107px)  scale(${scale})`;

  }else{
    var chanageTransform = `rotateX(${chanageAlpha-20}deg) rotateY(${chanageBeta}deg)  skewX(-159deg) translateY(106px) translateZ(-29px) translateX(107px)  scale(${scale})`;

  }


  mapStyle.value = {
    
     //width: `${mapWidth }px`,
    // height: `${mapHeight }px`,

    width: mapWidth,
    height: mapHeight,

     //transform: `rotateX(${viewControl.alpha + 40}deg) translateY(52px) rotate(-7deg) translateZ(1px) translateX(150px) scale(${scale})`,
     //transform: `rotateX(${viewControl.alpha - 20}deg) rotateY(${viewControl.beta}deg) scale(${scale})`,
      
     //transform: `rotateX(${viewControl.alpha - 20}deg) rotateY(${viewControl.beta}deg) scale(${scale})`,
     transform: chanageTransform
  };
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
  width: 848px;
  height: 639px;
  right: 3px;
  left: 48px;
  top: 277px;
  clip-path: polygon(48% -44%, 88% -152%, 98% 88%, 0% 98%);
  transform: rotateX(61deg) skewX(-165deg) translateY(115px) rotate(-7deg) translateZ(-27px) translateX(108px);
  z-index: 1;
  margin-left: 83px;
}

.echarts-container {
  width: 1500px;
  height: 1245px;
  position: absolute;
  bottom: -72px;
  z-index: 2;
}

.container-logo,
.container-attribution {
  display: none !important;
}
</style>
