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


    

  // 1. 散点坐标（格式：[lng, lat]）
var coords = [
  [110.763, 41.376],
              [110.823, 41.381],
              [110.815, 41.357],
              [110.944, 41.317],
              [110.978, 41.346],
              [111.026, 41.299],
              [111.085, 41.285],
              [111.096, 41.306],
              [111.232, 41.238],
              [111.273, 41.289],
              [111.439, 41.327],
              [111.724, 41.309],
              [111.833, 41.252],
              [111.822, 41.216],
              [111.862, 41.204],
              [111.874, 41.129],
              [112.027, 41.046],
              [112.011, 41.003],
              [112.035, 40.968],
              [112.138, 40.938],
              [112.178, 40.818],
              [112.144, 40.761],
              [112.086, 40.738],
              [112.124, 40.697],
              [112.108, 40.657],
              [112.038, 40.654],
              [112.092, 40.587],
              [112.046, 40.559],
              [112.218, 40.448],
              [112.259, 40.391],
              [112.229, 40.354],
              [112.264, 40.356],
              [112.305, 40.253],
              [111.964, 39.795],
              [111.925, 39.611],
              [111.829, 39.619],
              [111.777, 39.588],
              [111.64, 39.643],
              [111.511, 39.663],
              [111.43, 39.642],
              [111.435, 39.67],
              [111.358, 39.721],
              [111.366, 39.789],
              [111.439, 39.896],
              [111.405, 40.044],
              [111.308, 40.151],
              [111.039, 40.27],
              [111.024, 40.31],
              [111.108, 40.33],
              [111.121, 40.382],
              [110.953, 40.495],
              [110.895, 40.483],
              [110.837, 40.534],
              [110.874, 40.585],
              [110.796, 40.611],
              [110.78, 40.79],
              [110.705, 40.805],
              [110.739, 40.917],
              [110.623, 40.941],
              [110.672, 41.053],
              [110.639, 41.1],
              [110.65, 41.164],
              [110.554, 41.224],
              [110.559, 41.261],
              [110.512, 41.291],
              [110.547, 41.288],
              [110.569, 41.331],
              [110.629, 41.31],
              [110.719, 41.385],
              [110.763, 41.376]
]


  // 1. 构造点 FeatureCollection
  const points2 = turf.featureCollection(coords.map(coord => turf.point(coord)))

  // 2. 计算凸边界 Polygon
  const polygon = turf.convex(points2)
  if (!polygon) {
    throw new Error("边界生成失败，请检查输入点数量或分布")
  }

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

  debugger
let points = turf.randomPoint(30, { bbox: turf.bbox(boundaries) });
debugger
turf.featureEach(points, function (currentFeature, featureIndex) {
  currentFeature.properties = { value: (Math.random() * 100).toFixed(2) };
});
console.log(points);
debugger
var interpolate_options = {
  gridType: "points",
  property: "value",
  units: "degrees",
  weight: 10
};
debugger
let grid = turf.interpolate(points, 0.05, interpolate_options);
grid.features.map((i) => (i.properties.value = i.properties.value.toFixed(2)));
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
  [1, 10, 20, 30, 50, 70, 100],
  isobands_options
);


isobands = turf.flatten(isobands);
boundaries = turf.flatten(boundaries);


let features = [];

isobands.features.forEach(function (layer1) {
  boundaries.features.forEach(function (layer2) {
    let intersection = null;
    try {
      intersection = turf.intersect(turf.featureCollection([layer1, layer2]));
    } catch (e) {
      layer1 = turf.buffer(layer1, 0);
      intersection = turf.intersect(turf.featureCollection([layer1, layer2]));
    }
    if (intersection != null) {
      intersection.properties = layer1.properties;
      intersection.id = Math.random() * 100000;
      features.push(intersection);
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
