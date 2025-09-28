<template>
  <div class="echartsBodys">
    <div :id="withKeyId" ref="mapContainer" class="map-container"></div>
    <VocWindowTwo 
      v-if="showVocWindow"
      :incident-data="currentIncidentData"
      :map-instance="map"
      @close-voc-window="closeVocWindow"
    ></VocWindowTwo>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDeviceBigScreenIndexList } from "@/api/bigScreenIndex/bigScreen";
import alarm3 from "../alarm3/index.vue"; //绿色 运行中
import alarm2 from "../alarm2/index.vue"; //红色 未运行
import VocWindowTwo from "./VocWindowTwo.vue"; // 导入 VocWindowTwo 组件
import { createApp, h } from 'vue'; // 导入 createApp 和 h
// import { useSelectedDataStore } from "@/store/selectedDataStore"; // 导入 store

// 引入 leaflet.tilelayer.colorfilter 插件
import "leaflet.tilelayer.colorfilter";

export default {
  name: 'MapContainer',
  components: {
    VocWindowTwo,
  },
  data() {
    return {
      withKeyId: "map-container",
      firstPoint: ["116.397428", "39.90923"],
      map: null,
      myFilter: [
        // "blur: 0px",
        // "brightness: 100%",
        // "contrast: 100%",
        // "grayscale: 0%",
        // "hue: 90deg",
        // "opacity: 100%",
        // "invert: 80%",
        // "saturate: 100%",
        // "sepia: 10%",
      ],
      redPoints: [], // 初始化 redPoints
      greenPoints: [], // 初始化 greenPoints
      markers: [], // 初始化 markers 数组
      showVocWindow: false, // 控制 VocWindowTwo 的可见性
      currentIncidentData: null, // 存储要传递给 VocWindowTwo 的数据
      selectedIncidentId: null, // 存储当前选中的标记点 ID，用于判断是否重复点击
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initLeafletMap();
      this.loadDeviceData();
    });
  },

  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },

  methods: {
        // 加载设备数据
        loadDeviceData() {
       getDeviceBigScreenIndexList().then((res) => {
        if (res.code == 200) {
          this.firstPoint = res.firstPoint;
          this.redPoints = res.redPoints || [];
          this.greenPoints = res.greenPoints || [];
          console.log('设备数据加载完成', { firstPoint: this.firstPoint });


          this.loadMapMarkers();

        } else {
          console.error('设备数据加载失败', res);
          throw new Error('设备数据加载失败');
        }
      });
    },
    // 初始化地图 (Leaflet)
    initLeafletMap() {
      const container = document.getElementById(this.withKeyId);
      const { clientWidth, clientHeight } = container.parentElement;

      this.map = L.map(this.withKeyId, {
        center: [31.279101, 120.526648], // 使用新的中心点
        zoom: 13,
        minZoom: 5,
        maxZoom: 13,
        attributionControl: false,
      });

      L.tileLayer.colorFilter("/MAP_zxy/{z}/{x}/{y}.png", {
        filter: this.myFilter,
        crossOrigin: 'Anonymous',
      }).addTo(this.map);

      window.addEventListener("resize", () => { this.map.invalidateSize(); });
    },
  
    
    // 加载地图标记点
    loadMapMarkers() {
      if (!this.map) {
        console.error('地图未初始化，无法加载标记点');
        return;
      }

      // 清除现有标记点
      this.clearMapMarkers();

      // 加载红色标记点（离线设备）
      this.loadRedMarkers();

      // 加载绿色标记点（在线设备）
      this.loadGreenMarkers();

      console.log('地图标记点加载完成');
    },

    // 清除地图标记点
    clearMapMarkers() {
      if (this.map && this.markers) {
        this.markers.forEach(marker => {
          this.map.removeLayer(marker);
        });
      }
      this.markers = [];
    },

    // 加载红色标记点
    loadRedMarkers() {
      this.redPoints.forEach((incident, index) => {
        this.createMarker(incident, 'red');
      });
    },

    // 加载绿色标记点
    loadGreenMarkers() {
      this.greenPoints.forEach((incident, index) => {
        this.createMarker(incident, 'green');
      });
    },

createMarker(incident, type) {
  const container = document.createElement("div");
  const alarmComponent = type === 'red' ? alarm2 : alarm3;

  // 挂载组件到容器
  const app = createApp(alarmComponent, {
    status: incident.status,
    name: incident.name,
  });
  app.mount(container);

  // 确保DOM已更新后再计算尺寸
  setTimeout(() => {
    const latLng = [incident.position[1], incident.position[0]]; // 交换经纬度顺序
    
    // 创建自定义图标
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: container, // 直接传递DOM元素
      iconSize: [container.offsetWidth, container.offsetHeight],
      iconAnchor: [container.offsetWidth / 2, container.offsetHeight / 2]
    });

    // 创建并添加标记
    const marker = L.marker(latLng, { icon: customIcon }).addTo(this.map);

    // 绑定标记后立即将地图居中到该点
    this.map.setView(latLng, this.map.getZoom() || 13); // 若没有当前缩放级别则使用默认值13

    // 绑定点击事件 - 点击时再次居中
    marker.on("click", () => {
      this.map.setView(latLng, this.map.getZoom()); // 保持当前缩放级别

      if (this.selectedIncidentId === incident.id) {
        // 如果点击的是同一个标记点，则关闭浮窗
        this.closeVocWindow();
      } else {
        // 否则，打开浮窗并更新数据
        this.showVocWindow = true;
        this.currentIncidentData = { ...incident, markerPosition: latLng };
        this.selectedIncidentId = incident.id;
      }
      console.log('Marker clicked!', { 
        showVocWindow: this.showVocWindow, 
        currentIncidentData: this.currentIncidentData,
        centerPosition: latLng
      });
    });

    // 存储标记点实例
    this.markers.push(marker);
  }, 0); // 下一帧计算尺寸，确保组件已渲染
},


    // 重新加载标记点（外部调用接口）
    addMarkers() {
      // 重新获取设备数据并更新标记点
      this.loadDeviceData().then(() => {
        this.loadMapMarkers();
      }).catch(error => {
        console.error('重新加载标记点失败:', error);
      });
    },

    // 刷新地图标记点
    refreshMarkers() {
      console.log('刷新地图标记点');
      this.addMarkers();
    },

    // 添加单个标记点
    addSingleMarker(pointData, type = 'green') {
      this.createMarker(pointData, type);
    },

    // 移除单个标记点
    removeMarker(markerIndex) {
      if (this.markers[markerIndex]) {
        this.map.remove(this.markers[markerIndex]);
        this.markers.splice(markerIndex, 1);
      }
    },

    // 移除指定位置的标记点
    removeMarkerByPosition(position) {
      const index = this.markers.findIndex(marker => {
        const markerPos = marker.getLatLng(); // 获取 Leaflet 的 LatLng 对象
        // 比较经纬度，注意 Leaflet 的 LatLng 对象的属性是 lat 和 lng
        return markerPos.lng === position[0] && markerPos.lat === position[1];
      });
      
      if (index !== -1) {
        this.removeMarker(index);
      }
    },

    // 更新标记点数据
    updateMarkerData(newRedPoints, newGreenPoints) {
      this.redPoints = newRedPoints || this.redPoints;
      this.greenPoints = newGreenPoints || this.greenPoints;
      this.loadMapMarkers();
    },

    // 获取所有标记点数据
    getMarkerData() {
      return {
        redPoints: this.redPoints,
        greenPoints: this.greenPoints,
        markers: this.markers
      };
    },

    // 获取标记点数量
    getMarkerCount() {
      return {
        red: this.redPoints.length,
        green: this.greenPoints.length,
        total: this.redPoints.length + this.greenPoints.length
      };
    },

    // 创建自定义标记点内容
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

    // 处理右键点击获取经纬度
    handleRightClick(e) {
      const lnglat = e.lnglat;
      console.log(`${lnglat.getLng()},${lnglat.getLat()}`);
    },

    // 设置标记点可见性
    setMarkersVisibility(visible) {
      this.markers.forEach(marker => {
        if (visible) {
          marker.setOpacity(1); // 显示标记
        } else {
          marker.setOpacity(0); // 隐藏标记
        }
      });
    },

    // 设置特定类型标记点的可见性
    setMarkerTypeVisibility(type, visible) {
      this.markers.forEach((marker, index) => {
        const isRedMarker = index < this.redPoints.length;
        const markerType = isRedMarker ? 'red' : 'green';
        
        if (markerType === type) {
          if (visible) {
            marker.setOpacity(1);
          } else {
            marker.setOpacity(0);
          }
        }
      });
    },

    // 高亮指定标记点
    highlightMarker(position) {
      this.markers.forEach(marker => {
        const markerPos = marker.getLatLng(); // 获取 Leaflet 的 LatLng 对象
        if (markerPos.lng === position[0] && markerPos.lat === position[1]) {
          // 可以添加高亮效果，比如改变样式或添加动画
          // Leaflet 没有直接的 setAnimation 方法，可以考虑使用 CSS class 或第三方插件实现动画
        }
      });
    },

    // 停止标记点动画
    stopMarkerAnimation() {
      this.markers.forEach(marker => {
        // Leaflet 没有直接的 stopAnimation 方法
      });
    },

    // 关闭 VocWindowTwo 弹窗
    closeVocWindow() {
      console.log('closeVocWindow called');
      this.showVocWindow = false;
      this.currentIncidentData = null;
      this.selectedIncidentId = null;
      console.log('showVocWindow after close:', this.showVocWindow);
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

.map-container {
  width: 100%;
  height: 160%;
  position: relative;
  z-index: 1;
  bottom: 220px;
  /* 移除所有 CSS 滤镜，改用 Colorizr 插件 */
}

/* 确保标记点和弹窗不受 Canvas 滤镜影响，如果需要的话可以继续在这里设置其样式 */
</style>

<style lang="scss">

</style>
