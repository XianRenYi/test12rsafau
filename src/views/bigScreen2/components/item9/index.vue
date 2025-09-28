<template>
  <div class="echartsBodys">
    <div id="map-container" ref="mapContainer" class="map-container"></div>
    <!-- <div class="biankuang">
      <div class="biankuangTitle">
        <span>设备分布</span>
      </div>
    </div> -->
  </div>
</template>

<script>
import { createApp, h } from "vue";
import alarm3 from "./alarm3/index.vue"; //绿色 运行中
import alarm2 from "./alarm2/index.vue"; //红色 未运行
import icon from "./icon/index.vue";
import { getDeviceBigScreenIndexList } from "@/api/bigScreenIndex/bigScreen";
import { useSelectedDataStore } from "@/store/selectedDataStore"; // 路径根据实际调整

export default {
  data() {
    return {
      selectedFirst: null,
      map: null,
      firstPoint: ["116.397428", "39.90923"],
      redPoints: [
        // 未运行位置
        {
          position: ["116.397428", "39.90923"],
          name: "设备:AL20250521001",
          status: "离线",
          details: "设备位置: 苏州市园区",
        },
        {
          position: ["116.419234", "39.895868"],
          name: "设备:AL20250521002",
          status: "离线",
          details: "设备位置: 苏州市园区",
        },
      ],
      greenPoints: [
        // 运行中位置
        {
          position: ["116.407428", "39.90923"],
          name: "设备:AL20250521003",
          status: "正常",
          details: "设备位置: 苏州市园区",
        },
        {
          position: ["116.429234", "39.895868"],
          name: "设备:AL20250521004",
          status: "正常",
          details: "设备位置: 苏州市园区",
        },
      ],
    };
  },
  components: {
    alarm3,
    alarm2,
    icon,
  },
  watch: {
    selectedData(newVal) {
      if (newVal) {
        this.selectedFirst = newVal;
        console.log("item9-selectedData", newVal);
        //  this.getData();
      }
    },
  },
  computed: {
    selectedData() {
      return useSelectedDataStore().selectedData;
    },
  },
  mounted() {
    // 在组件挂载后动态加载高德地图 JS
    this.loadAMapScript();
    // this.initMap();
    window.addEventListener("resize", this.resizeMap);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeMap);
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
  },
  methods: {
    loadAMapScript() {
      // 判断是否已经加载过高德地图脚本，避免重复加载
      if (window.AMap) {
        this.initMap();
        return;
      }

      // 高德地图 JS API 的 URL，替换 YOUR_API_KEY 为你的实际密钥
      const url = `https://webapi.amap.com/maps?v=2.0&key=5a2e4a9af3bad2091692a8028ba53210`;

      // 创建 script 标签
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = url;

      // 脚本加载完成后初始化地图
      script.onload = () => {
        console.log("高德地图脚本加载完成");
        this.initMap();
        // setInterval(this.addMarkers, 5000);
      };

      // 处理加载失败的情况（可选）
      script.onerror = () => {
        console.error("高德地图脚本加载失败");
      };

      // 将 script 标签插入到 head 中
      document.head.appendChild(script);
    },
    addMarkers() {
      if (this.map) {
        this.map.clearMap(); // 清除地图上的所有覆盖物
      }

      getDeviceBigScreenIndexList().then((res) => {
        if (res.code == 200) {
          this.firstPoint = res.firstPoint;
          this.redPoints = res.redPoints;
          this.greenPoints = res.greenPoints;

          // 添加位置（使用alarm和alarm2组件）
          this.redPoints.forEach((incident, index) => {
            const container = document.createElement("div");
            const alarmComponent = alarm2;

            createApp(alarmComponent, {
              status: incident.status,
              name: incident.name,
            }).mount(container);

            const marker = new AMap.Marker({
              position: incident.position,
              map: this.map,
              content: container,
            });

            // 点击火情位置显示详情
            const infoWindow = new AMap.InfoWindow({
              content: `<div class="fire-info">
                      <h3>${incident.name}</h3>
                      <div>状态: ${incident.status}</div>
                      <div>${incident.details}</div>
                    </div>`,
              offset: new AMap.Pixel(30, -30),
            });

            marker.on("click", () => {
              infoWindow.open(this.map, marker.getPosition());
            });
          });

          this.greenPoints.forEach((incident, index) => {
            const container = document.createElement("div");
            const alarmComponent = alarm3;

            createApp(alarmComponent, {
              status: incident.status,
              name: incident.name,
            }).mount(container);

            const marker = new AMap.Marker({
              position: incident.position,
              map: this.map,
              content: container,
            });

            // 点击火情位置显示详情
            const infoWindow = new AMap.InfoWindow({
              content: `<div class="fire-info">
                      <h3>${incident.name}</h3>
                      <div>状态: ${incident.status}</div>
                      <div>${incident.details}</div>
                    </div>`,
              offset: new AMap.Pixel(30, -30),
            });

            marker.on("click", () => {
              infoWindow.open(this.map, marker.getPosition());
            });
          });
        }
      });
    },
    initMap() {
      getDeviceBigScreenIndexList().then((res) => {
        if (res.code == 200) {
          this.firstPoint = res.firstPoint;
          this.redPoints = res.redPoints;
          this.greenPoints = res.greenPoints;

          this.map = new AMap.Map(this.$refs.mapContainer, {
            center: this.firstPoint,
            zoom: 13,
            pitch: 50,
            mapStyle: "amap://styles/darkblue",
             //mapStyle: "amap://styles/light",
          });

          // 添加位置（使用alarm和alarm2组件）
          this.redPoints.forEach((incident, index) => {
            const container = document.createElement("div");
            const alarmComponent = alarm2;

            createApp(alarmComponent, {
              status: incident.status,
              name: incident.name,
            }).mount(container);

            const marker = new AMap.Marker({
              position: incident.position,
              map: this.map,
              content: container,
            });

            // 点击火情位置显示详情
            const infoWindow = new AMap.InfoWindow({
              content: `<div class="fire-info">
                      <h3>${incident.name}</h3>
                      <div>状态: ${incident.status}</div>
                      <div>${incident.details}</div>
                    </div>`,
              offset: new AMap.Pixel(30, -30),
            });

            marker.on("click", () => {
              infoWindow.open(this.map, marker.getPosition());
            });
          });

          this.greenPoints.forEach((incident, index) => {
            const container = document.createElement("div");
            const alarmComponent = alarm3;

            createApp(alarmComponent, {
              status: incident.status,
              name: incident.name,
            }).mount(container);

            const marker = new AMap.Marker({
              position: incident.position,
              map: this.map,
              content: container,
            });

            // 点击火情位置显示详情
            const infoWindow = new AMap.InfoWindow({
              content: `<div class="fire-info">
                      <h3>${incident.name}</h3>
                      <div>状态: ${incident.status}</div>
                      <div>${incident.details}</div>
                    </div>`,
              offset: new AMap.Pixel(30, -30),
            });

            marker.on("click", () => {
              infoWindow.open(this.map, marker.getPosition());
            });
          });
        }
      });
    },

    // 处理右键点击获取经纬度
    handleRightClick(e) {
      const lnglat = e.lnglat;
      console.log(`${lnglat.getLng()},${lnglat.getLat()}`);
    },

    createCustomMarkerContent(itemData) {
      // 创建一个包含Vue组件的DOM元素
      const container = document.createElement("div");
      container.style.width = "100px"; // 与digitalIcon宽度一致
      container.style.height = "100px"; // 设置一个合适的高度

      // 创建Vue应用实例并挂载自定义图标组件
      const app = createApp({
        render() {
          return h(icon, {
            item: itemData,
          });
        },
      });

      app.mount(container);
      return container;
    },

    resizeMap() {
      if (this.map) {
        this.map.resize();
      }
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
