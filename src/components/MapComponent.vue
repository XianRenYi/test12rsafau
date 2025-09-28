<template>
  <div class="map-card">
  <div class="echartsBodys">
   
     <div id="map-container" ref="mapContainer" class="map-container"></div>
   
  </div>
</div>
</template>


<script>
import { createApp, h } from "vue";
import alarm3 from "./alarm3/index.vue"; //绿色 运行中
import alarm2 from "./alarm2/index.vue"; //红色 未运行
import icon from "./icon/index.vue";
import { getDeviceBigScreenIndexList } from "@/api/bigScreenIndex/bigScreen";
import { useSelectedDataStore } from "@/store/selectedDataStore"; // 路径根据实际调整
// import { loadAMapScript, initAMap } from "@/utils/amapUtils";

export default {
  data() {
    return {
      deviceCount:3,
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
    loadAMapScript() {
      if (window.AMap) {
        this.initMap();
        return;
      }

      const url = `https://webapi.amap.com/maps?v=2.0&key=5347d2541c1cb610089fe899b33e327a`;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = url;

      script.onload = () => {
        console.log("高德地图脚本加载完成");
        this.initMap();
      };

      script.onerror = () => {
        console.error("高德地图脚本加载失败");
      };

      document.head.appendChild(script);
    },
    initMap() {
      getDeviceBigScreenIndexList().then((res) => {
        if (res.code == 200) {
          this.firstPoint = res.firstPoint;
          this.redPoints = res.redPoints;
          this.greenPoints = res.greenPoints;

          this.map = new AMap.Map(this.$refs.mapContainer, {
            center: this.firstPoint,
            zoom: 3,
            pitch: 50,
            minZoom: 3,
            maxZoom: 9,
            zooms: [3, 9],
          });
          this.map.on('zoomchange', () => {
            console.log('当前缩放级别:', this.map.getZoom());
          });
          this.addMarkers(); // 调用addMarkers来添加标记
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
.map-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 400px;
  max-height: 400px;
}

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
    background: linear-gradient(180deg, #88ecfb, #66b6f1);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 深色主题模式1: CSS滤镜 - 匹配图片中的深蓝色效果 */
.map-container.dark-theme-filter :deep(.amap-layer) {
  filter: 
    hue-rotate(220deg)     /* 调整色调偏向深蓝 */
    saturate(1.5)          /* 增强饱和度 */
    brightness(0.25)       /* 降低亮度到25% */
    contrast(1.8)          /* 增强对比度 */
    invert(0.1);           /* 轻微反转增加深色效果 */
}

/* 深色主题模式2: 叠加层 - 匹配图片中的深蓝色效果 */
.map-container.dark-theme-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(180deg, 
      rgba(15, 25, 50, 0.85) 0%,    /* 深蓝黑色 */
      rgba(25, 45, 85, 0.80) 30%,   /* 深蓝色 */
      rgba(35, 65, 115, 0.75) 60%,  /* 中蓝色 */
      rgba(20, 35, 70, 0.85) 100%   /* 深蓝黑色 */
    );
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 2;
}

/* 深色主题模式3: 混合模式 */
.map-container.dark-theme-blend::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, 
    rgba(15, 30, 60, 0.8) 0%, 
    rgba(30, 60, 114, 0.9) 50%, 
    rgba(10, 20, 40, 0.95) 100%
  );
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}

/* 确保标记点在叠加层之上 */
.map-container :deep(.amap-marker) {
  z-index: 10 !important;
}

/* 确保信息窗口在叠加层之上 */
.map-container :deep(.amap-info-window) {
  z-index: 20 !important;
}

/* 深色主题模式4: 精确模拟图片中的深蓝色效果 */
.map-container.dark-theme-darkblue {
  background-color: #0f1929; /* 深蓝色背景 */
}

.map-container.dark-theme-darkblue :deep(.amap-layer) {
  filter: 
    hue-rotate(220deg)     /* 旋转色调到深蓝色 */
    saturate(1.2)          /* 适度增强饱和度 */
    brightness(0.4)        /* 适度降低亮度，保持可见性 */
    contrast(1.5)          /* 适度增强对比度 */
    invert(0.05);          /* 轻微反转 */
}

.map-container.dark-theme-darkblue::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(180deg, 
      rgba(25, 45, 85, 0.2) 0%,     /* 中心较亮的深蓝 */
      rgba(15, 30, 60, 0.3) 50%,    /* 中间深蓝 */
      rgba(10, 20, 40, 0.4) 100%    /* 边缘最深蓝黑 */
    );
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}

/* 深色主题模式5: 柔和深色效果，确保地图内容可见 */
.map-container.dark-theme-soft {
  background-color: #1a2332; /* 柔和深蓝色背景 */
}

.map-container.dark-theme-soft :deep(.amap-layer) {
  filter: 
    hue-rotate(210deg)     /* 色调偏向深蓝 */
    saturate(0.8)          /* 适度降低饱和度 */
    brightness(0.6)        /* 保持合理亮度 */
    contrast(1.3);         /* 适度增强对比度 */
}

.map-container.dark-theme-soft::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 40, 80, 0.25); /* 轻微的深蓝色叠加 */
  pointer-events: none;
  z-index: 1;
}

/* VOC浮窗样式 */
.voc-window {
  position: absolute;
  width: 340px;
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.65) 0%, rgba(42, 82, 152, 0.7) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 0px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
  z-index: 1000;
  user-select: none;
  right: 20px;
  bottom: 40px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.voc-window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.voc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 22px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  position: relative;
}

.voc-title {
  color: #88ecfb;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(136, 236, 251, 0.3);
  letter-spacing: 0.5px;
}

.status-online {
  display: flex;
  align-items: center;
  color: #52c41a;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s infinite, statusGlow 1s ease-in-out infinite alternate;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes statusGlow {
  0% { 
    box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
  }
  100% { 
    box-shadow: 0 0 15px rgba(82, 196, 26, 0.9);
  }
}

.device-type {
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.voc-content {
  padding: 12px 22px 14px;
  background: rgba(0, 0, 0, 0.05);
}

.value-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 20px;
}

.value-item {
  text-align: center;
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.value-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.value-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 6px;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.value-number {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.indicator-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.indicator-bar {
  position: relative;
  flex: 1;
  height: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bar-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #1890ff 0%, #52c41a 50%, #faad14 100%);
  border-radius: 5px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-pointer {
  position: absolute;
  top: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 16px solid #88ecfb;
  transform: translateX(-50%);
  transition: left 0.5s ease-in-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

.bar-labels span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  opacity: 0.8;
  font-weight: 500;
}

.daily-ratio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  width: calc(50% - 10px);
  box-sizing: border-box;
}

.daily-ratio:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.ratio-arrow {
  color: #ff4d4f;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(255, 77, 79, 0.4);
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


.map-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  text-align: center;
  pointer-events: none;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .map-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    line-height: 1.2;
  }

  .map-subtitle {
    margin: 0;
    font-size: 13px;
    color: #666;
    font-weight: normal;
  }
}


/* 尝试隐藏右下角 Logo（仅测试环境使用！） */
.amap-logo,
.amap-copyright {
  z-index: -999999;
}
</style>
