<template>
  <div :id="withKeyId" class="container"></div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import "leaflet/dist/leaflet.css";

//const breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 99];



import { dzxList } from "@/api/platform/DptMapShowTest";
import { lineString , bezierSpline, isobands, isolines,pointGrid,featureEach ,interpolate,randomPoint, bbox } from "@turf/turf";
const L =  require("null").L;
let map;

const withKeyId = computed(() => `ssss`);

onMounted(() => {
  initMars3d();
});

onBeforeUnmount(() => {
  if (map) {
    map.destroy();
    map = null;
  }
  console.log("map销毁完成", map);
});

const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 7,
    center: { lng: 120.526248, lat: 31.279101 },
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
  showWindLine();
};





function showWindLine() {


 let points = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "value": "95.19"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  113.94400,	22.53019
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "value": "22.11"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  113.94409,	22.53399
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "value": "79.91"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  113.94445,	22.53391
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "value": "0.51"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  113.94454,	22.53000
                ]
            }
        }
      
    ]
};

// 将 value 属性转换为数字
points.features.forEach(feature => {
    feature.properties.value = parseFloat(feature.properties.value);
});

debugger

var interpolate_options = {
  gridType: "points",
  property: "value",
  units: "degrees",
  weight: 1
};
let grid22 = interpolate(points, 0.00001, interpolate_options);




var isobands_options = {
  zProperty: "value",
  commonProperties: {
    "fill-opacity": 0.8
  },
  breaksProperties: [
    {fill: "#e3e3ff"},
    {fill: "#c6c6ff"},
    {fill: "#a9aaff"},
    {fill: "#8e8eff"},
    {fill: "#7171ff"},
    {fill: "#5554ff"},
    {fill: "#3939ff"},
    {fill: "#1b1cff"},
    {fill: "#1500ff"}
  ]
};

     // 2. 创建插值网格
     const cellSize = 0.1;

      
      
      // 3. 生成等值线
      const breaks = [10, 15, 20, 25, 30]; // 温度断点
      
      
     // const geojsonLine =  isolines(pointGrid2, breaks, { zProperty: 'temperature' });
     
     let geojsonLine = isobands(
  grid22,
  [1, 10, 20, 30, 50, 70, 100],
  isobands_options
);


  const layerDZX = new container.layer.GeoJsonLayer({
    name: "等值线",
    data: geojsonLine,
    popup: "{speed}",
    symbol: {
      styleOptions: {
        width: 2,
        color: "#000000",
        opacity: 0.5,
      },
    },
  });
  map.addLayer(layerDZX);
  const mpts = [[22.53019,113.94400,21],[22.53399,113.94409,21],[22.53391,113.94445,21],[22.53000,113.94454,21]];
  map.fitBounds(mpts);
}


</script>

<style scoped>
.container {
  height: 100vh;
  width: 100vw;
}
</style>