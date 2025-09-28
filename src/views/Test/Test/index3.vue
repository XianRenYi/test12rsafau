<template>
  <span></span>
</template>
<!-- <template>
  <div :id="withKeyId" class="container"></div>
</template>
<script  setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import "leaflet/dist/leaflet.css"



import { lineString , bezierSpline, isobands, isolines } from "@turf/turf";
import * as turf from "@turf/turf";
	import intersect from '@turf/intersect'


import { windPoint } from "@/api/platform/DptLog";
import {getAllList} from "@/api/platform/DptDevicesLog";


const L =  require("null").L;
let map;

const colors = [
  "#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", 
  "#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026"
];
const breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 99];

const withKeyId = computed(() => `ssss`);

onMounted(() => {
  initMars3d();
  initWindPoint();
});

const initWindPoint = () => {
  showWindLine();

};

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
    center: { lng:111.833, lat: 41.252 },
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
};

function showWindLine(arr) {
  
  getAllList().then(res => {

    debugger

    
const points2 = turf.featureCollection(
  res.rows.map(item => turf.point([item.x, item.y], { value: item.speed }))
);

  // 1. 构造点 FeatureCollection
 // const points2 = turf.featureCollection(coords.map(coord => turf.point(coord)))

  // 生成凸包边界（Polygon）
//const polygon = turf.convex(points2);
const polygon = turf.concave(points2)  // maxEdge 单位是 km
// 转为 MultiPolygon 格式
//const boundaries = turf.multiPolygon([polygon.geometry.coordinates]);



//   // 2. 计算凸边界 Polygon
//   const polygon = turf.convex(points2)
//   if (!polygon) {
//     throw new Error("边界生成失败，请检查输入点数量或分布")
//   }

 // 3. 构造 MultiPolygon 格式
 var boundaries = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [polygon.geometry.coordinates[0]]  // 包成 MultiPolygon 格式
          ]
        }
      }
    ]
  }



var interpolate_options = {
  gridType: "points",
  property: "value",
  units: "degrees",
  weight: 10
};

// 0.001公里==1米
let grid = turf.interpolate(points2,  0.001, interpolate_options);

debugger
var isobands_options = {
  zProperty: "value",
  commonProperties: {
    "fill-opacity": 0.8
  },
  breaksProperties: [
    { fill: "#e3e3ff" },
    { fill: "#c6c6ff" },
    { fill: "#a9aaff" },
    { fill: "#8e8eff" },
    { fill: "#7171ff" },
    { fill: "#5554ff" },
    { fill: "#3939ff" },
    { fill: "#1b1cff" },
    { fill: "#1500ff" }
  ]
};
let isobands = turf.isobands(
  grid,
  [1, 10, 20, 30,40, 50,60, 70,80,90,100],
  isobands_options
);

const geojsonLine = turf.isolines( grid,
  [1, 10, 20, 30,40, 50,60, 70,80,90,100],
  isobands_options);


// isobands = turf.flatten(isobands);
// boundaries = turf.flatten(boundaries);


let features = [];

isobands.features.forEach(function (layer1) {
  boundaries.features.forEach(function (layer2) {
    let intersection = null;
    intersection = turf.intersect(turf.featureCollection([layer1, layer2]));
    if (intersection != null) {
      intersection.properties = layer1.properties;
      intersection.id = Math.random() * 100000;
      features.push(intersection);
    }
  });
});


let dzxS=[];
geojsonLine.features.forEach(function (layer1) {
  boundaries.features.forEach(function (layer2) {
    let intersection = null;
    intersection = turf.intersect(turf.featureCollection([layer1, layer2]));
    if (intersection != null) {
      intersection.properties = layer1.properties;
      intersection.id = Math.random() * 100000;
      dzxS.push(intersection);
    }
  });
});

// 可视化及交互部分
debugger
const geoJsonLayer = new container.layer.GeoJsonLayer({
    name: "等值面",
    data: features,
    popup: "{value}",
    symbol: {
      styleOptions: {
        fill: true,
        fillColor: "#ffff00",
        fillOpacity: 0.7,
        outline: false,
      },
      callback: (attr, styleOpt) => ({ fillColor: getColor(Number(attr.value.split("-")[0] || 0)) })
    },
  });

  //添加到地图
  map.addLayer(geoJsonLayer);
  debugger
  const layerDZX = new container.layer.GeoJsonLayer({
    name: "等值线",
    data: dzxS,
    popup: "{value}",
    symbol: {
      styleOptions: {
        width: 2,
        color: "#000000",
        opacity: 0.5,
      },
    },
  });
  
  debugger
  map.addLayer(layerDZX);
  debugger

  // 展示边界并飞入视角
  map.flyToGraphic(geoJsonLayer)



  });


}

function getColor(value) {
  for (let i = 0; i < breaks.length; i++) {
    if (breaks[i] === value) {
      return colors[i];
    }
  }
  return colors[0];
}
</script>
<style scoped>
.container {
  height: 100vh;
  width: 100vw;
}
</style> -->
