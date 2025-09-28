<template>
  <div class="echartsBodys">
    <div :id="withKeyId" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";


import { isobands, isolines } from "@turf/turf";
import * as mapv from "mapv";
;
import { listGetDptLog } from "@/api/platform/DptLog";
import { useSelectedDataStore } from "@/store/selectedDataStore";

export default {
  data() {
    return {
      selectedFirst: null,
      withKeyId: "map-container",
      map: null,
      points: [],
      displayedTimes: new Set(),
      fetchDataTimer: null,
      timer: null,
      index: 0,
      L: container.L,
      // 新增：用于存储所有已添加的图层
      mapLayers: [],
    };
  },
  watch: {
    selectedData(newVal) {
      if (newVal) {
        this.selectedFirst = newVal;
        console.log("item9-selectedData", newVal);
        this.fetchData();
      }
    },
  },
  computed: {
    selectedData() {
      return useSelectedDataStore().selectedData;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initMars3d();
      this.fetchData();
    });
  },

  beforeUnmount() {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    if (this.fetchDataTimer) {
      clearInterval(this.fetchDataTimer);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  methods: {
    // 初始化地图
    initMars3d() {
      const container = document.getElementById(this.withKeyId);
      const { clientWidth, clientHeight } = container.parentElement;

      this.map = new container.Map(this.withKeyId, {
        zoom: 17,
        center: { lng: 120.526248, lat: 31.279101 },
        minZoom: 3,
        maxZoom: 18,
        width: clientWidth,
        height: clientHeight,
        control: {
          scale: false,
          zoom: false,
          toolBar: false,
          layers: false,
          attributionControl: false,
          rightMenu: false,
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
        onLoad: () => {
          this.map.invalidateSize();
        },
      });

      this.startShowPoints();
    },

    // 获取数据 - 新增清除逻辑
    fetchData() {
      // 1. 清除现有所有点位图层
      this.clearAllLayers();

      // 2. 重置数据存储
      this.points = [];
      this.displayedTimes.clear();
      this.index = 0;

      // 3. 清除定时器
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      // 4. 获取新数据
      listGetDptLog(null).then((response) => {
        const newPoints = response.rows.map((row) => ({
          // 注意：这里移除了过滤，确保每次都获取所有数据
          lat: row.lat,
          lng: row.lng,
          value: row.value,
          createTime: row.createTime,
        }));

        if (newPoints.length > 0) {
          this.points = [...newPoints];
          newPoints.forEach((row) => this.displayedTimes.add(row.createTime));
          this.startShowPoints(); // 直接开始显示新数据
        }
      });
    },

    // 新增：清除所有图层
    clearAllLayers() {
      // 移除所有自定义添加的图层
      this.mapLayers.forEach((layer) => {
        if (this.map && this.map.hasLayer(layer)) {
          this.map.removeLayer(layer);
        }
      });
      // 清空图层数组
      this.mapLayers = [];
    },

    // 重新开始显示点
    restartShowPoints() {
      this.index = 0;
      if (this.timer) clearInterval(this.timer);
      this.startShowPoints();
    },

    // 开始显示点
    startShowPoints() {
      this.timer = setInterval(() => {
        if (this.index < this.points.length) {
          this.showMapVLayer(this.points[this.index]);
          this.index++;
        } else {
          clearInterval(this.timer);
        }
      }, 1000);
    },

    // 显示地图点图层 - 修改为存储图层引用
    showMapVLayer(point) {
      if (!point || !point.lng || !point.lat) return;

      const data = [
        {
          geometry: { type: "Point", coordinates: [point.lng, point.lat] },
          count: point.value,
        },
      ];

      const dataSet = new mapv.DataSet(data);
      const options = {
        fillStyle: "rgba(55, 50, 250, 0.8)",
        shadowBlur: 20,
        size: 40,
        globalAlpha: 0.5,
        label: {
          show: true,
          fillStyle: "white",
        },
        gradient: {
          0.25: "rgb(0,0,255)",
          0.55: "rgb(0,255,0)",
          0.85: "yellow",
          1.0: "rgb(255,0,0)",
        },
        draw: "grid",
      };

      const mapVLayer = new container.layer.MapVLayer(options, dataSet);
      this.map.addLayer(mapVLayer);

      // 存储图层引用，便于后续清除
      this.mapLayers.push(mapVLayer);
    },
  },
};
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
