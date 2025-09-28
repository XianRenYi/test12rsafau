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

  showMapVLayer();
};


function showMapVLayer() {
  // 构造数据
  const latlngs = []
  const data = []
  let randomCount = 300
  while (randomCount--) {
    const point = randomLatLng() // js/randomLatLng.js
    latlngs.push(point)

    data.push({
      geometry: { type: "Point", coordinates: [point.lng, point.lat] },
      count: 30 * Math.random()
    })
  }
  map.fitBounds(latlngs)
debugger
  const dataSet =  new mapv.DataSet(data)
  const options = {
    fillStyle: "rgba(55, 50, 250, 0.8)",
    shadowColor: "rgba(255, 250, 50, 1)",
    shadowBlur: 20,
    size: 40,
    globalAlpha: 0.5,
    label: {
      show: true,
      fillStyle: "white"
      // shadowColor: 'yellow',
      // font: '20px Arial',
      // shadowBlur: 10,
    },
    gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" },
    draw: "grid"
  }

  // 创建MapV图层
  const mapVLayer = new container.layer.MapVLayer(options, dataSet)
  map.addLayer(mapVLayer)
}

// 未赋值时，使用中国区域内随机点
const chinaPoly = [
  [
    [114.02709960937501, 22.59372606392931],
    [113.59313964843751, 23.03929774776974],
    [113.48327636718751, 22.253512814974744],
    [110.24230957031251, 21.401933838235188],
    [107.88574218750001, 22.522705703482472],
    [105.27099609375, 23.664650731631625],
    [104.0625, 22.998851594142923],
    [99.93164062500001, 22.471954507739227],
    [98.85498046875001, 25.025884063244828],
    [99.84375, 29.065772888415406],
    [92.57080078125001, 28.65203063036226],
    [85.53955078125001, 29.219302076779456],
    [80.61767578125001, 31.690781806136822],
    [79.69482421875, 34.903952965590065],
    [75.49804687500001, 37.26530995561875],
    [74.95971679687501, 39.45316112807394],
    [81.82617187500001, 42.74701217318067],
    [81.5185546875, 44.25306865928177],
    [84.04541015625001, 46.042735653846506],
    [87.72583007812501, 48.026672195436014],
    [90.5712890625, 45.10454630976873],
    [96.45996093750001, 42.32606244456202],
    [105.71044921875001, 41.19518982948959],
    [112.0166015625, 42.84375132629023],
    [117.02636718750001, 45.73685954736049],
    [120.60791015625, 46.55886030311719],
    [117.83935546875001, 48.922499263758255],
    [122.65136718750001, 53.10721669189343],
    [127.13378906250001, 49.53946900793534],
    [130.97900390625003, 47.368594345213374],
    [134.45068359375003, 48.019324184801185],
    [131.11083984375003, 45.521743896993634],
    [130.51757812500003, 43.197167282501276],
    [126.46362304687501, 41.89409955811395],
    [121.94824218750001, 39.26628442213066],
    [122.54150390625001, 40.55554790286314],
    [121.70654296875001, 41.19518982948959],
    [119.46533203125001, 39.985538414809746],
    [118.64135742187501, 39.206718844918505],
    [117.52075195312501, 39.342794408952386],
    [117.43286132812501, 38.41055825094609],
    [118.56445312500001, 37.59682400108367],
    [119.080810546875, 36.96744946416934],
    [120.81665039062501, 37.326488613342086],
    [122.40966796875001, 37.22158045838649],
    [120.05859375000001, 36.35052700542766],
    [118.88305664062501, 35.10193405724608],
    [120.47607421875001, 33.422272258866045],
    [120.66284179687501, 31.784216884487385],
    [121.81640625000001, 30.996445897426373],
    [120.36621093750001, 30.477082932837682],
    [121.28906250000001, 29.19053283229458],
    [120.30029296875001, 27.31321389856826],
    [119.102783203125, 26.52956523826758],
    [118.45458984375001, 24.9163314045991],
    [116.71875000000001, 23.805449612314625],
    [115.04882812500001, 22.84707068783908],
    [114.02709960937501, 22.59372606392931]
  ]
]

let featureChina

// 取区域内的随机点
function randomLatLng(polygon) {
  if (polygon == null) {
    if (!featureChina) {
      featureChina = L.geoJSON({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: chinaPoly }
      }).getLayers()[0]
    }
    polygon = featureChina
  }

  const bounds = polygon.getBounds()
  const southwest = bounds.getSouthWest()
  const northeast = bounds.getNorthEast()

  const jd = random(southwest.lng * 1000000, northeast.lng * 1000000) / 1000000
  const wd = random(southwest.lat * 1000000, northeast.lat * 1000000) / 1000000

  try {
    const pt = window.turf.point([jd, wd])
    const isInside = window.turf.inside(pt, polygon.toGeoJSON())
    if (!isInside) {
      return randomLatLng(polygon)
    }
  } catch (e) {
    //
  }
  return L.latLng(wd, jd)
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}


</script>
<style  scoped>
.container {
  height: 100vh;
  width: 100vw;
}
</style>