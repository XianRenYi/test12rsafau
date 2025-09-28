<template>
  <div class="echartsBodys">
    <div :id="withKeyId" ref="mapContainer" class="map-container"></div>
 
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDeviceBigScreenIndexList } from "@/api/bigScreenIndex/bigScreen";
import alarm3 from "../alarm3/index.vue"; //绿色 运行中
import alarm2 from "../alarm2/index.vue"; //红色 未运行
import VocWindow from "./VocWindow.vue"; // 导入VocWindow组件
import { createApp, h } from 'vue'; // 导入 createApp 和 h
import { useSelectedDataStore } from "@/store/selectedDataStore"; // 导入 store

// 引入 leaflet.tilelayer.colorfilter 插件
import "leaflet.tilelayer.colorfilter";

export default {
  name: 'MapContainer',
  components: {
    VocWindow,
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
      vocWindowVisible: false, // 浮窗显示状态
      vocWindowDeviceIndex: null, // 浮窗设备索引
      activeMarkerIndex: null, // 当前激活的标记点索引
      markerComponents: [], // 存储标记点组件实例
      markersToLoad: 0, // 需要加载的标记点总数
      markersLoaded: 0, // 已加载的标记点数量
      refreshTimer: null, // 定时器实例
      refreshInterval: 60000, // 1分钟 = 60000毫秒
    };
  },
  computed: {
    centerPoint() {
      return useSelectedDataStore().centerPoint;
    },
    selectedData() {
      return useSelectedDataStore().selectedData;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initLeafletMap();
      this.loadDeviceData();
      this.startRefreshTimer();
    });
  },

  beforeUnmount() {
    // 清理定时器
    this.clearRefreshTimer();
    
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  watch: {
    centerPoint: {
      handler(newPoint) {
        if (this.map && newPoint && newPoint.latitude && newPoint.longitude) {
          this.map.setView([newPoint.latitude, newPoint.longitude], this.map.getZoom() || 13);
          console.log(`MapContainer: 地图已居中到: [${newPoint.latitude}, ${newPoint.longitude}]`);
        }
      },
      deep: true,
      immediate: true,
    },
    selectedData: {
      handler(newData) {
        console.log('selectedData变化:', newData);
        console.log('markerComponents长度:', this.markerComponents.length);
        if (newData && this.markerComponents.length > 0) {
          console.log('检测到列表选择变化，激活对应标记点:', newData);
          this.activateMarkerByDeviceData(newData);
        } else if (newData && this.markerComponents.length === 0) {
          console.warn('标记点组件尚未加载完成，延迟处理');
          // 延迟处理，等待标记点加载完成
          this.$nextTick(() => {
            if (this.markerComponents.length > 0) {
              console.log('延迟激活标记点:', newData);
              this.activateMarkerByDeviceData(newData);
            }
          });
        }
      },
      deep: true,
      immediate: true,
    },
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
        zoom: 17,
        minZoom: 10,
        maxZoom: 18,
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

      // 重置计数器
      this.markersToLoad = 0;
      this.markersLoaded = 0;

      // 计算需要加载的标记点总数
      this.markersToLoad = this.redPoints.length + this.greenPoints.length;

      // 加载红色标记点（离线设备）
      this.loadRedMarkers();

      // 加载绿色标记点（在线设备）
      this.loadGreenMarkers();

      console.log(`开始加载 ${this.markersToLoad} 个标记点`);
    },

    // 清除地图标记点
    clearMapMarkers() {
      if (this.map && this.markers) {
        this.markers.forEach(marker => {
          this.map.removeLayer(marker);
        });
      }
      this.markers = [];
      this.markerComponents = [];
      this.activeMarkerIndex = null;
    },

    // 加载红色标记点
    loadRedMarkers() {
      this.redPoints.forEach((incident, index) => {
        this.createMarker(incident, 'red', index);
      });
    },

    // 加载绿色标记点
    loadGreenMarkers() {
      this.greenPoints.forEach((incident, index) => {
        // 绿色标记点的索引需要加上红色标记点的数量
        const greenIndex = this.redPoints.length + index;
        this.createMarker(incident, 'green', greenIndex);
      });
    },

createMarker(incident, type, index) {
  const container = document.createElement("div");
  const alarmComponent = type === 'red' ? alarm2 : alarm3;

  // 挂载组件到容器，默认不播放动画
  const app = createApp(alarmComponent, {
    status: incident.status,
    name: incident.name,
    isActive: false, // 默认不播放动画
  });
  const componentInstance = app.mount(container);

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

    // 绑定点击事件 - 点击时启动动画并显示浮窗
    marker.on("click", () => {
      this.map.setView(latLng, this.map.getZoom()); // 保持当前缩放级别
      // 激活当前标记点动画
      this.activateMarker(index);
      // 调用浮窗切换方法
      this.toggleVocWindow(incident, index);
    });

    // 存储标记点实例和组件实例
    this.markers.push(marker);
    this.markerComponents.push(componentInstance);
    
    // 增加已加载计数
    this.markersLoaded++;
    console.log(`标记点加载进度: ${this.markersLoaded}/${this.markersToLoad}`);
    
    // 检查是否所有标记点都已加载完成
    if (this.markersLoaded >= this.markersToLoad) {
      console.log('所有标记点加载完成');
      // 标记点加载完成后，通知父组件
      this.$emit('markers-loaded');
    }
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
      // 为新添加的标记点分配一个唯一的索引
      const newIndex = this.markers.length;
      this.createMarker(pointData, type, newIndex);
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

    // 切换浮窗显示状态（参考item5的实现）
    toggleVocWindow(incident, index) {
      console.log('点击地图标记点:', index, incident);
      
      if (this.vocWindowVisible && this.vocWindowDeviceIndex === index) {
        // 如果浮窗正在显示且点击的是当前显示的浮窗，则隐藏
        this.vocWindowVisible = false;
        this.vocWindowDeviceIndex = null;
        console.log('隐藏浮窗');
      } else {
        // 如果点击的是新点或浮窗未显示，则显示浮窗
        this.vocWindowVisible = false;
        this.vocWindowDeviceIndex = index;
        console.log('显示浮窗，设备数据:', incident);
      }
      
      // 处理设备数据，确保status字段为数字类型
      const processedIncident = this.processDeviceData(incident);
      
      // 更新store中的浮窗状态
      const selectedDataStore = useSelectedDataStore();
      selectedDataStore.setVocWindowState({
        visible: this.vocWindowVisible,
        deviceIndex: this.vocWindowDeviceIndex,
        deviceData: this.vocWindowVisible ? processedIncident : null
      });
      
      // 通知父组件选中对应的列表行
      this.notifyListSelection(processedIncident);
      
      console.log('Store状态已更新:', this.vocWindowVisible, this.vocWindowDeviceIndex);
    },

    // 处理设备数据，确保status字段为数字类型
    processDeviceData(deviceData) {
      if (!deviceData) {
        return deviceData;
      }

      const processedData = { ...deviceData };
      
      // 状态映射：将状态字符串转换为数字
      const statusMap = {
        '未激活': 1,
        '禁用': 2,
        '在线': 3,
        '离线': 4,
        '运行中': 3,
        '未运行': 4
      };
      
      // 如果存在statusName字段，转换为status数字字段
      if (processedData.statusName && !processedData.status) {
        processedData.status = statusMap[processedData.statusName] || 4;
      }
      
      // 如果status字段是字符串，转换为数字
      if (typeof processedData.status === 'string') {
        processedData.status = statusMap[processedData.status] || 4;
      }
      
      return processedData;
    },

    // 通知父组件选中对应的列表行
    notifyListSelection(deviceData) {
      console.log('通知列表选中:', deviceData);
      // 通过事件向父组件发送选中通知
      this.$emit('map-device-selected', deviceData);
    },

    // 激活指定标记点的动画
    activateMarker(index) {
      console.log('激活标记点动画:', index);
      
      // 先停止所有标记点的动画
      this.deactivateAllMarkers();
      
      // 激活指定标记点
      if (this.markerComponents[index]) {
        // 直接调用组件的方法
        this.markerComponents[index].playAnimation();
        this.activeMarkerIndex = index;
        console.log('标记点动画已激活:', index);
      }
    },

    // 停止所有标记点的动画
    deactivateAllMarkers() {
      console.log('停止所有标记点动画');
      this.markerComponents.forEach((component) => {
        if (component) {
          // 重置动画到初始状态
          component.resetAnimation();
        }
      });
      this.activeMarkerIndex = null;
    },

    // 根据设备数据激活对应的标记点
    activateMarkerByDeviceData(deviceData) {
      console.log('根据设备数据激活标记点:', deviceData);
      console.log('当前红色标记点数据:', this.redPoints);
      console.log('当前绿色标记点数据:', this.greenPoints);
      
      // 在红色标记点中查找，通过serialNumber匹配
      const redIndex = this.redPoints.findIndex(point => {
        const serialMatch = point.serialNumber === deviceData.serialNumber;
        console.log('红色标记点匹配检查:', {
          pointSerialNumber: point.serialNumber,
          deviceSerialNumber: deviceData.serialNumber,
          serialMatch
        });
        return serialMatch;
      });
      
      if (redIndex !== -1) {
        console.log('找到红色标记点，索引:', redIndex);
        this.activateMarker(redIndex);
        return;
      }
      
      // 在绿色标记点中查找，通过serialNumber匹配
      const greenIndex = this.greenPoints.findIndex(point => {
        const serialMatch = point.serialNumber === deviceData.serialNumber;
        console.log('绿色标记点匹配检查:', {
          pointSerialNumber: point.serialNumber,
          deviceSerialNumber: deviceData.serialNumber,
          serialMatch
        });
        return serialMatch;
      });
      
      if (greenIndex !== -1) {
        const actualIndex = this.redPoints.length + greenIndex;
        console.log('找到绿色标记点，索引:', greenIndex, '实际索引:', actualIndex);
        this.activateMarker(actualIndex);
        return;
      }
      
      console.warn('未找到对应的标记点:', deviceData);
    },

    // 启动定时刷新器
    startRefreshTimer() {
      console.log('启动定时刷新器，间隔:', this.refreshInterval / 1000, '秒');
      this.refreshTimer = setInterval(() => {
        this.refreshDeviceData();
      }, this.refreshInterval);
    },

    // 清理定时刷新器
    clearRefreshTimer() {
      if (this.refreshTimer) {
        console.log('清理定时刷新器');
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    // 刷新设备数据（只更新状态，不重新创建标记点）
    refreshDeviceData() {
      console.log('定时刷新设备数据...');
      getDeviceBigScreenIndexList().then((res) => {
        if (res.code == 200) {
          const newRedPoints = res.redPoints || [];
          const newGreenPoints = res.greenPoints || [];
          
          console.log('刷新数据获取成功:', {
            newRedCount: newRedPoints.length,
            newGreenCount: newGreenPoints.length,
            oldRedCount: this.redPoints.length,
            oldGreenCount: this.greenPoints.length
          });

          // 检测数据变化
          const hasDataChanged = this.detectDataChanges(newRedPoints, newGreenPoints);
          
          if (hasDataChanged) {
            console.log('检测到数据变化，更新标记点显示状态');
            // 更新数据
            this.redPoints = newRedPoints;
            this.greenPoints = newGreenPoints;

            // 更新标记点显示状态
            this.updateMarkerDisplayStates();
          } else {
            console.log('数据无变化，跳过更新');
          }

          console.log('设备数据刷新完成');
        } else {
          console.error('刷新设备数据失败', res);
        }
      }).catch(error => {
        console.error('刷新设备数据异常:', error);
      });
    },

    // 检测数据变化
    detectDataChanges(newRedPoints, newGreenPoints) {
      // 检查数量变化
      if (newRedPoints.length !== this.redPoints.length || 
          newGreenPoints.length !== this.greenPoints.length) {
        console.log('标记点数量发生变化');
        return true;
      }

      // 检查设备状态变化
      const allOldPoints = [...this.redPoints, ...this.greenPoints];
      const allNewPoints = [...newRedPoints, ...newGreenPoints];

      for (let i = 0; i < allOldPoints.length; i++) {
        const oldPoint = allOldPoints[i];
        const newPoint = allNewPoints[i];
        
        if (oldPoint && newPoint) {
          // 检查设备序列号是否相同
          if (oldPoint.serialNumber !== newPoint.serialNumber) {
            console.log('设备序列号发生变化:', oldPoint.serialNumber, '->', newPoint.serialNumber);
            return true;
          }
          
          // 检查设备状态是否发生变化
          const oldStatus = oldPoint.status || oldPoint.statusName;
          const newStatus = newPoint.status || newPoint.statusName;
          
          if (oldStatus !== newStatus) {
            console.log(`设备 ${oldPoint.serialNumber} 状态发生变化:`, oldStatus, '->', newStatus);
            return true;
          }
        }
      }

      return false;
    },

    // 更新标记点的显示状态（alarm2/alarm3）
    updateMarkerDisplayStates() {
      console.log('更新标记点显示状态...');
      
      // 由于标记点的数量可能发生变化，我们需要重新创建标记点
      // 但保持当前激活状态和浮窗状态
      const currentActiveIndex = this.activeMarkerIndex;
      const currentVocWindowIndex = this.vocWindowDeviceIndex;
      const currentVocWindowVisible = this.vocWindowVisible;
      
      // 保存当前激活的标记点数据
      let currentActiveDeviceData = null;
      if (currentActiveIndex !== null) {
        if (currentActiveIndex < this.redPoints.length) {
          currentActiveDeviceData = this.redPoints[currentActiveIndex];
        } else {
          const greenIndex = currentActiveIndex - this.redPoints.length;
          if (greenIndex < this.greenPoints.length) {
            currentActiveDeviceData = this.greenPoints[greenIndex];
          }
        }
      }

      // 重新加载标记点（这会重新创建所有标记点）
      this.loadMapMarkers();

      // 恢复激活状态
      if (currentActiveDeviceData) {
        this.$nextTick(() => {
          // 延迟执行，确保新的标记点已经创建完成
          setTimeout(() => {
            this.activateMarkerByDeviceData(currentActiveDeviceData);
            
            // 恢复浮窗状态
            if (currentVocWindowVisible && currentVocWindowIndex !== null) {
              this.vocWindowVisible = currentVocWindowVisible;
              this.vocWindowDeviceIndex = currentVocWindowIndex;
              
              // 更新store状态
              const selectedDataStore = useSelectedDataStore();
              selectedDataStore.setVocWindowState({
                visible: this.vocWindowVisible,
                deviceIndex: this.vocWindowDeviceIndex,
                deviceData: currentActiveDeviceData
              });
            }
          }, 500); // 等待标记点加载完成
        });
      }

      console.log('标记点显示状态更新完成');
    },

    // 暂停定时刷新
    pauseRefreshTimer() {
      if (this.refreshTimer) {
        console.log('暂停定时刷新');
        this.clearRefreshTimer();
      }
    },

    // 恢复定时刷新
    resumeRefreshTimer() {
      if (!this.refreshTimer) {
        console.log('恢复定时刷新');
        this.startRefreshTimer();
      }
    },

    // 设置刷新间隔
    setRefreshInterval(interval) {
      this.refreshInterval = interval;
      if (this.refreshTimer) {
        this.clearRefreshTimer();
        this.startRefreshTimer();
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
