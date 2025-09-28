<template>
  
  <div class="echartsBodys">
  <div :id="withKeyId" class="map-container">
  </div>  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import "leaflet/dist/leaflet.css"




import { isobands, isolines } from "@turf/turf";
import * as mapv from "mapv";


import { listGetDptLog } from "@/api/platform/DptLog";

const L =  require("null").L;
// 用于存放地球组件实例
let map; // 移除类型注解

// 使用用户传入的 mapKey 拼接生成 withKeyId 作为当前显示容器的id
const withKeyId = computed(() => `ssss`);

const points = ref([]);
const displayedTimes = new Set(); // 添加 displayedTimes 集合

let fetchDataTimer; // 定义 fetchDataTimer 变量

onMounted(() => {
  initMars3d();

  fetchData();
  fetchDataTimer = setInterval(fetchData, 10000); // 每隔10秒获取一次数据
});

onBeforeUnmount(() => {
  if (map) {
    map.destroy();
    map = null;
  }
  console.log("map销毁完成", map);

  if (fetchDataTimer) {
    clearInterval(fetchDataTimer); // 清除定时器
  }
});

const fetchData = () => {
  listGetDptLog(null).then(response => {
    const newPoints = response.rows
      .filter(row => !displayedTimes.has(row.createTime)) // 过滤掉已经显示过的数据
      .map(row => ({
        lat: row.lat,
        lng: row.lng,
        value: row.value,
        createTime: row.createTime // 添加 createTime 到 newPoints
      }));
    if (newPoints.length > 0) { 
      // 检查是否有新数据
      points.value =[]; 
      points.value = [...points.value, ...newPoints]; // 将新数据添加到 points 数组中

      newPoints.forEach(row => {
        displayedTimes.add(row.createTime); // 将新数据的时间戳添加到 displayedTimes 集合中
      });

      // 重置索引和定时器以重新开始显示点
      index = 0;
      clearInterval(timer);
      timer = setInterval(() => {
        if (index < points.value.length) {
          showMapVLayer(points.value[index]);
          index++;
        } else {
          clearInterval(timer);
        }
      }, 1000); // 每隔1秒显示一个点
    }
  });
};

let timer;
let index = 0;

const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 17,
    center: { lng: 120.526248, lat: 31.279101 },
    minZoom: 3,
    maxZoom: 18,
    control: {
      scale: false,
      // locationBar: {
      //   crs: "CGCS2000_GK_Zone_3",
      //   template:
      //     "<div>经度:{lng}</div> <div>纬度:{lat}</div> <div>横{crsx}  纵{crsy}</div> <div>层级:{level}</div>",
      // },
      zoom: false,
      toolBar: false,
      layers: false,
      attributionControl:false,
      rightMenu:false,

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

  timer = setInterval(() => {
    if (index < points.value.length) {
      showMapVLayer(points.value[index]);
      index++;
    } else {
      clearInterval(timer);
    }
  }, 1000); // 每隔1秒显示一个点
};

function showMapVLayer(point) {
  // 构造数据
  const latlngs = [];
  const data = [];

  latlngs.push(point);

  data.push({
    geometry: { type: "Point", coordinates: [point.lng, point.lat] },
    count: point.value
  });

  map.fitBounds(latlngs);

  const dataSet =  new mapv.DataSet(data)
  const options = {
    fillStyle: "rgba(55, 50, 250, 0.8)",
    shadowColor: "rgba(255, 250, 50, 1)",
    shadowBlur: 20,
    max: 100,
    size: 50,
    label: {
      show: true,
      fillStyle: "white"
    },
    globalAlpha: 0.5,
    gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" },
    draw: "honeycomb"
  };

  // 创建MapV图层
  const mapVLayer = new container.layer.MapVLayer(options, dataSet);
  map.addLayer(mapVLayer);
}



</script>


<style lang="scss" scoped>
.echartsBodys {
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
}

.biankuang {
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  box-shadow: inset 0px 0px 32px 0px rgba(54, 171, 243, 0.8);
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
}

.biankuangTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  position: absolute;
  top: 0;
  left: 0;
  flex-direction: row;
  align-content: flex-start;
  background: url("assets/biankuang.png") center top no-repeat;
  width: 100%;
  height: 28px;
  background-size: 353px 28px;

  span {
    font-size: 18px;
    font-family: MicrosoftYaHei;
    font-weight: 700;
    color: #fff;
    margin-left: 10px;
    background: linear-gradient(180deg, #88ecfb, #66b6f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style lang="scss">
.echartsBodys {
  .amap-info-content {
    background: rgba(12, 158, 232, 0.5);
    backdrop-filter: blur(10px);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;

    h3 {
      margin: 5px 0;
      font-size: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      padding-bottom: 5px;
    }
  }

  .amap-info-close {
    right: 5px !important;
    top: 5px !important;
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .amap-info-close:hover {
    color: #fff !important;
  }

  .bottom-center .amap-info-sharp {
    border-top: 8px solid rgba(12, 158, 232, 0.7);
  }

  .fire-info {
    max-width: 250px;

    h3 {
      color: #ff4d4f;
    }
  }

  .hydrant-info {
    max-width: 200px;

    h3 {
      color: #3eaf7c;
    }
  }

  .station-info {
    h3 {
      color: #1e90ff;
    }
  }

  @supports not (backdrop-filter: blur(10px)) {
    .amap-info-content {
      background: rgba(12, 158, 232, 0.85);
    }

    .bottom-center .amap-info-sharp {
      border-top: 8px solid rgba(12, 158, 232, 0.85);
    }
  }
}
/* 尝试隐藏右下角 Logo（仅测试环境使用！） */
.amap-logo,
.amap-copyright {
  z-index: -999999;
}
</style>
<!-- 
<style scoped>

/* 新增的颜色参考条样式 */
.color-reference-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(to bottom, #4ade80, #facc15, #f87171);
  z-index: 1000000; /* 确保其在最顶层 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.color-reference-bar::before,
.color-reference-bar::after {
  content: '';
  width: 100%;
  height: 10px;
  background-color: white;
  position: absolute;
  left: 0;
}

.color-reference-bar::before {
  top: 0;
}

.color-reference-bar::after {
  bottom: 0;
}

.color-reference-bar span {
  color: white;
  font-size: 12px;
  margin: 5px 0;
}

.color-reference-bar .scale-marks {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  
}

.color-reference-bar .scale-marks span {
  color: white;
  font-size: 14px;
  color: black; /* 修改颜色为黑色 */
  font-size: 14px;
  text-decoration: underline; /* 添加下划线 */
  padding-left: 10px;
}
</style> -->
