<template>
  <div class="echartsBodys">
    <!-- 地图容器组件 -->
    <MapContainer 
      ref="mapContainer"
      :dark-theme="darkTheme"
      :tile-filter="tileFilter"
      @map-created="onMapCreated"
      @map-device-selected="onMapDeviceSelected"
      @markers-loaded="onMarkersLoaded"
    />
    
    <!-- VOC监测浮窗组件 -->
    <VocWindow 
      ref="vocWindow" 
      @drag-start="onDragStart"
      @drag-end="onDragEnd"
    />
    

  </div>
</template>

<script>
import { useSelectedDataStore } from "@/store/selectedDataStore";
import MapContainer from "./components/MapContainer.vue";
import VocWindow from "./components/VocWindow.vue";

export default {
  name: 'Item9',
  components: {
    MapContainer,
    VocWindow,

  },
  data() {
    return {
      selectedFirst: null,
      mapInstance: null,
      // 深色主题配置
      darkTheme: {
        enabled: false, // 禁用深色主题，使用原始瓦片效果
        mode: 'soft' // 'filter' 使用CSS滤镜, 'overlay' 使用叠加层, 'blend' 使用混合模式, 'darkblue' 精确模拟图片效果, 'soft' 柔和深色
      },
      // 瓦片滤镜配置
      tileFilter: {
        enabled: true,
        preset: 'darkblue', // 'darkblue', 'night', 'warm', 'cool', 'custom'
        customFilter: 'grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)',
        // 滤镜预设
        presets: {
          darkblue: 'grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)',
          night: 'grayscale(50%) brightness(0.3) contrast(1.5) hue-rotate(220deg) saturate(1.2)',
          warm: 'sepia(30%) hue-rotate(30deg) saturate(1.3) brightness(0.8)',
          cool: 'hue-rotate(200deg) saturate(1.5) brightness(0.7) contrast(1.3)',
          custom: 'grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)'
        }
      },
    };
  },
  watch: {
    selectedData(newVal) {
      if (newVal) {
        this.selectedFirst = newVal;
        console.log("item9-selectedData", newVal);
        //  this.getData();
      }
    },
    centerPoint: {
      handler(newPoint) {
        if (newPoint && newPoint.latitude && newPoint.longitude) {
          this.centerMapOnPoint(newPoint.latitude, newPoint.longitude);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    selectedData() {
      return useSelectedDataStore().selectedData;
    },
    centerPoint() {
      return useSelectedDataStore().centerPoint;
    },
  },
  mounted() {
    // 启动浮窗数据更新定时器
    this.startVocDataUpdate();
  },
  beforeUnmount() {
    // 停止浮窗数据更新定时器
    this.stopVocDataUpdate();
  },
  methods: {
    // 地图创建完成回调
    onMapCreated(map) {
      this.mapInstance = map;
      console.log('地图实例已创建并传递给标记点组件');
    },

    // 地图设备选中事件处理
    onMapDeviceSelected(deviceData) {
      console.log('item9接收到地图设备选中事件:', deviceData);
      // 向父组件传递事件，让item5组件能够响应
      this.$emit('map-device-selected', deviceData);
    },

    // 标记点加载完成事件处理
    onMarkersLoaded() {
      console.log('item9接收到标记点加载完成事件');
      // 向父组件传递事件，通知标记点已准备就绪
      this.$emit('markers-loaded');
    },

    // 地图居中到指定点
    centerMapOnPoint(lat, lng, zoom = 13) {
      if (this.mapInstance) {
        this.mapInstance.setView([lat, lng], zoom);
        console.log(`地图已居中到: [${lat}, ${lng}]，缩放级别: ${zoom}`);
      } else {
        console.warn('地图实例未准备好，无法居中地图。');
      }
    },
    
    // 启动浮窗数据更新定时器
    startVocDataUpdate() {
      // 浮窗数据更新由item5组件处理，这里不需要额外的定时器
      // 因为item5组件每秒都会调用updateVocWindowData方法
    },
    
    // 停止浮窗数据更新定时器
    stopVocDataUpdate() {
      // 不需要额外的定时器清理
    },
    
    // 更新浮窗数据
    updateVocWindowData() {
      // 浮窗数据更新由item5组件处理
      // 这里不需要额外的逻辑
    },
    
    // 切换深色主题模式
    toggleDarkTheme(mode = null) {
      if (mode) {
        this.darkTheme.mode = mode;
      } else {
        // 循环切换模式
        const modes = ['soft', 'darkblue', 'filter', 'overlay', 'blend'];
        const currentIndex = modes.indexOf(this.darkTheme.mode);
        this.darkTheme.mode = modes[(currentIndex + 1) % modes.length];
      }
      console.log(`深色主题模式切换为: ${this.darkTheme.mode}`);
    },
    
    // 启用/禁用深色主题
    toggleDarkThemeEnabled() {
      this.darkTheme.enabled = !this.darkTheme.enabled;
      console.log(`深色主题${this.darkTheme.enabled ? '启用' : '禁用'}`);
    },

    // 刷新地图标记点
    refreshMarkers() {
      console.log('刷新地图标记点');
      this.$refs.mapMarkers?.refreshMarkers();
    },

    // 重新初始化地图
    reinitializeMap() {
      console.log('重新初始化地图');
      this.$refs.mapContainer?.forceRefreshFilters();
    },

    // 获取地图实例（供外部调用）
    getMapInstance() {
      return this.mapInstance;
    },

    // 获取设备数据（供外部调用）
    getDeviceData() {
      return this.$refs.mapMarkers?.getMarkerData() || {
        redPoints: [],
        greenPoints: []
      };
    },

    // 瓦片滤镜控制方法
    // 切换滤镜预设
    setTileFilterPreset(preset) {
      this.$refs.mapContainer?.setTileFilterPreset(preset);
    },

    // 设置自定义滤镜
    setCustomTileFilter(filterString) {
      this.$refs.mapContainer?.setCustomTileFilter(filterString);
    },

    // 启用/禁用瓦片滤镜
    toggleTileFilter() {
      this.$refs.mapContainer?.toggleTileFilter();
    },

    // 获取当前滤镜状态
    getTileFilterStatus() {
      return this.$refs.mapContainer?.getTileFilterStatus() || {
        enabled: false,
        preset: 'darkblue',
        customFilter: ''
      };
    },

    // 测试滤镜效果
    testTileFilter() {
      console.log('测试滤镜效果...');
      console.log('当前滤镜配置:', this.tileFilter);
      
      // 强制启用滤镜
      this.tileFilter.enabled = true;
      
      // 应用滤镜
      this.$refs.mapContainer?.forceRefreshFilters();
      
      console.log('滤镜测试完成');
    },

    // 强制刷新滤镜
    forceRefreshFilters() {
      console.log('强制刷新滤镜...');
      this.$refs.mapContainer?.forceRefreshFilters();
    },

    // 标记点相关方法
    // 添加单个标记点
    addSingleMarker(pointData, type = 'green') {
      this.$refs.mapMarkers?.addSingleMarker(pointData, type);
    },

    // 移除单个标记点
    removeMarker(markerIndex) {
      this.$refs.mapMarkers?.removeMarker(markerIndex);
    },

    // 移除指定位置的标记点
    removeMarkerByPosition(position) {
      this.$refs.mapMarkers?.removeMarkerByPosition(position);
    },

    // 更新标记点数据
    updateMarkerData(newRedPoints, newGreenPoints) {
      this.$refs.mapMarkers?.updateMarkerData(newRedPoints, newGreenPoints);
    },

    // 获取标记点数量
    getMarkerCount() {
      return this.$refs.mapMarkers?.getMarkerCount() || {
        red: 0,
        green: 0,
        total: 0
      };
    },

    // 设置标记点可见性
    setMarkersVisibility(visible) {
      this.$refs.mapMarkers?.setMarkersVisibility(visible);
    },

    // 设置特定类型标记点的可见性
    setMarkerTypeVisibility(type, visible) {
      this.$refs.mapMarkers?.setMarkerTypeVisibility(type, visible);
    },

    // 高亮指定标记点
    highlightMarker(position) {
      this.$refs.mapMarkers?.highlightMarker(position);
    },

    // 停止标记点动画
    stopMarkerAnimation() {
      this.$refs.mapMarkers?.stopMarkerAnimation();
    },

    // 浮窗相关方法
    // 设置浮窗位置
    setVocWindowPosition(right, bottom) {
      this.$refs.vocWindow?.setPosition(right, bottom);
    },

    // 获取浮窗位置
    getVocWindowPosition() {
      return this.$refs.vocWindow?.getPosition() || {
        right: '20px',
        bottom: '20px'
      };
    },
    
    // 处理拖动开始事件
    onDragStart() {
      console.log('浮窗开始拖动，暂停数据更新');
      // 通知父组件暂停定时器
      this.$emit('voc-drag-start');
    },
    
    // 处理拖动结束事件
    onDragEnd() {
      console.log('浮窗拖动结束，恢复数据更新');
      // 通知父组件恢复定时器
      this.$emit('voc-drag-end');
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
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
</style>

<style lang="scss">
/* 尝试隐藏右下角 Logo（仅测试环境使用！） */
.amap-logo,
.amap-copyright {
  z-index: -999999;
}
</style>
