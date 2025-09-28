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

import {getAllList} from "@/api/platform/DptDevicesLog";


const L =  require("null").L;
let map;

const colors = [
  "#53dd7b", "#74da67", "#97d651", "#bad33c", "#dacf29", "#facb17", 
  "#facb17", "#f9ba27", "#f9a938", "#f9964a", "#f9875c"
];
const breaks = [0.00, 50.00, 100.00, 150.00, 200.00, 250.00, 300.00, 350.00, 400.00, 450.00, 500.00];

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

function showWindLine() {
  getAllList().then(res => {
    const points2 = turf.featureCollection(
      res.rows.map(item => turf.point([item.x, item.y], { value: item.speed }))
    )


debugger
    // 1. 构建自然边界（concave 多边形）
    const polygon = turf.concave(points2, { maxEdge: 0.5 }) || turf.convex(points2)
debugger
    const boundaries = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: [[polygon.geometry.coordinates[0]]]
          },
          properties: {}
        }
      ]
    }
    debugger
    // 2. 插值网格：使用 square 栅格 & 合理单位
    const interpolate_options = {
      gridType: "square",
      property: "value",
      units: "kilometers",
      weight: 1
    }

  //  const grid = turf.interpolate(points2,  0.1, interpolate_options)  // 2km网格
    const grid = turf.interpolate(points2, 0.1, {
  gridType: "points", // 这一项非常重要！
  property: "value",
  units: "kilometers",
  weight: 1
})

    // 3. 生成等值面和等值线
    const isobands_options = { zProperty: "value" }
    const isobands = turf.isobands(grid, breaks, isobands_options)
    const isolines = turf.isolines(grid, breaks, isobands_options)

    // 4. 裁剪：对每对 Feature 逐一 intersect
    const clippedBands = []
    const clippedLines = []

  

    // 5. 创建图层并添加到地图
    const bandLayer = new container.layer.GeoJsonLayer({
      name: "等值面",
      data: clippedBands,
      popup: "{value}",
      symbol: {
        styleOptions: {
          fill: true,
          fillOpacity: 0.6,
          outline: false
        },
        callback: (attr) => ({
          fillColor: getColor(Number(attr.value?.split("-")[0] || 0))
        })
      }
    })

    const lineLayer = new container.layer.GeoJsonLayer({
      name: "等值线",
      data: clippedLines,
      popup: "{value}",
      symbol: {
        styleOptions: {
          width: 1,
          color: "#333",
          opacity: 0.5
        }
      }
    })

    const boundaryLayer = new container.layer.GeoJsonLayer({
      name: "边界",
      data: boundaries,
      symbol: {
        styleOptions: {
          fill: false,
          color: "#ff0000",
          width: 2
        }
      }
    })

    map.addLayer(boundaryLayer)
    map.addLayer(bandLayer)
    map.addLayer(lineLayer)

    map.flyToGraphic(boundaryLayer)
  })
}

function safeIntersect(a, b) {
  if (
    !a || !b ||
    !a.geometry || !b.geometry ||
    !["Polygon", "MultiPolygon", "LineString"].includes(a.geometry.type) ||
    !["Polygon", "MultiPolygon", "LineString"].includes(b.geometry.type)
  ) {
    return null
  }

  try {
    return turf.intersect(a, b)
  } catch (err) {
    console.warn("intersect error:", err)
    return null
  }
}
function getColor(value) {
  for (let i = breaks.length - 1; i >= 0; i--) {
    if (value >= breaks[i]) {
      return colors[i]
    }
  }
  return colors[0]
}
</script>
<style scoped>
.container {
  height: 100vh;
  width: 100vw;
}
</style> -->
