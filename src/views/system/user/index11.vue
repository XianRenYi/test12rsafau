<template>
  <div :id="withKeyId" class="container"></div>
</template>
<script  setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import "leaflet/dist/leaflet.css"




import { isobands, isolines } from "@turf/turf";
import * as mapv from "mapv";


const L =  require("null").L;
// 用于存放地球组件实例
let map; // 移除类型注解

// 使用用户传入的 mapKey 拼接生成 withKeyId 作为当前显示容器的id
const withKeyId = computed(() => `ssss`);


onMounted(() => {
 // init();
  initMars3d();
});


// 组件卸载之前销毁container实例
onBeforeUnmount(() => {
  if (map) {
    map.destroy();
    map = null;
  }
  console.log("map销毁完成", map);
});

// const init = () => {
//   // 1
//   // 设置地图显示区域
//   // "map"为div的id,将地图渲染在这个容器里
//   // setView的值为中心点和缩放级别（数值越大，地图越近）
//   const map = L.map("map").setView([34.4262106, 107.2284119], 12);
//   // 添加瓦片层到地图
//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     // 最大最小缩放
//     maxZoom: 20,
//     attribution: "© OpenStreetMap",
//   }).addTo(map);
// };

const init = () => {
  const map = L.map("map").setView([34.4262106, 107.2284119], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    // 最大最小缩放
    maxZoom: 20,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  const marker = L.marker([51.5, -0.09]).addTo(map);
  const circle = L.circle([51.508, -0.11], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 500000,
  }).addTo(map);
  const polygon = L.polygon([
    [51.509, -0.08],
    [41.503, -0.06],
    [51.51, -10.047],
  ]).addTo(map);
  marker.bindPopup("<b>Hello world!</b><br>I am a popup.");
  circle.bindPopup("I am a circle.");
  polygon.bindPopup("I am a polygon.");
  var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);
};

const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 7,
    center: { lng: 116.378174, lat: 30.537774 },
    minZoom: 3,
    maxZoom: 18,
    control: {
      scale: true,
      locationBar: {
        crs: "CGCS2000_GK_Zone_3",
        template:
          "<div>经度:{lng}</div> <div>纬度:{lat}</div> <div>横{crsx}  纵{crsy}</div> <div>层级:{level}</div>",
      },
      zoom: { position: "bottomleft" },
      toolBar: { position: "bottomleft" },
      layers: { position: "topleft" },
    },
    basemaps: [
      { name: "高德地图", type: "gaode", layer: "vec", show: true },
      {
        name: "高德卫星",
        type: "group",
        layers: [
          { name: "底图", type: "gaode", layer: "img_d" },
          { name: "注记", type: "gaode", layer: "img_z" },
        ],
      },
    ],
    operationallayers: [{ name: "经纬网", type: "graticule" }],
  });

  showHeatLayer();
};


// 显示热力图
function showHeatLayer() {
  container.Util.fetchJson({
    url: "http://data.container.cn/file/apidemo/heat.json"
  })
    .then((data) => {
debugger

      const mpts = []
      const arrdata = data.Data
      for (let i = 0; i < arrdata.length; i++) {
        const item = arrdata[i]
        mpts.push([item.Y, item.X, item.Count])
      }

      // 热点图
      const layerWork = new container.layer.HeatLayer(mpts, {
        // radius: 20,
        // blur: 10,
        minOpacity: 0.3,
        gradient: { 0.4: "blue", 0.6: "cyan", 0.7: "lime", 0.8: "yellow", 1: "red" }
      })
      map.addLayer(layerWork)

      map.fitBounds(mpts)
    })
    .catch((error) => {
      console.log("请求出错了", error)
    })
}




</script>
<style  scoped>
.container {
  height: 100vh;
  width: 100vw;
}
</style>