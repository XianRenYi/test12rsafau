<template>
  <div>
    <div id="cesiumContainer"></div>
    <div class="control-panel">
      <button @click="toggleGrid">显示/隐藏网格</button>
      <button @click="zoomToGrid">定位到网格范围</button>
    </div>
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

import { dzxList } from "@/api/platform/DptMapShowTest";
export default {
  data() {
    return {
            index: 0,
      viewer: null,
      gridEntities: [], // 存储所有网格实体，方便控制显隐
      gridVisible: true,
      gridOptions: {
        cellSize: 50,      // 单元格大小（米）
        extent: 1000,      // 网格总范围（米，中心向四周延伸）
        width: 2,          // 网格线宽
        animationSpeed: 50 // 每个网格延迟（毫秒），控制动画速度
      },
      // 模拟热力数据：二维数组，值越大颜色越“红”（可替换为真实接口数据）
      heatData: [
        [1,1,2,3,4,5,4,3,2,1],
        [1,2,3,4,5,6,5,4,3,2],
        [2,3,4,5,6,7,6,5,4,3],
        [3,4,5,6,7,8,7,6,5,4],
        [4,5,6,7,8,9,8,7,6,5],
        [5,6,7,8,9,10,9,8,7,6],
        [4,5,6,7,8,9,8,7,6,5],
        [3,4,5,6,7,8,7,6,5,4],
        [2,3,4,5,6,7,6,5,4,3],
        [1,2,3,4,5,6,5,4,3,2],
      ]
    }
  },
  mounted() {
    // 设置 Cesium Ion 令牌（保留你的原始逻辑）
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZGRiMjUzZS1jZWNlLTRjMDYtODU5Mi05MjNiZDRjOGUwNTIiLCJpZCI6NDMxMDUsImlhdCI6MTY0NjI3MDQ2M30.ZH81WWILiz6RytEPHTdeRV-_Au5QuYN6JzJ8LsNqzLw'
    
    // 初始化 Cesium  viewer
    this.initCesium()
    // 隐藏版权信息
    this.viewer.cesiumWidget.creditContainer.style.display = 'none'
    // 加载高德底图
    this.loadGaode()
    
    // 定位到初始位置 lng: 113.94400, lat: 22.53019
    const centerLon = 113.94400
    const centerLat = 22.53019
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 600),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        roll: 0.0
      },
      duration: 1
    })

    // 延迟创建网格，确保 Cesium 初始化完成
    // setTimeout(() => {
    //   this.createGridWithAnimation(centerLon, centerLat)
    // }, 500)
  
        // 4. 获取新数据
      dzxList(null).then((response) => {
        
        const newPoints = response.rows.map((row) => ({
          // 注意：这里移除了过滤，确保每次都获取所有数据
          lat: row.lat,
          lng: row.lng,
          value: row.temperature,
          createTime: row.createTime,
        }));

        if (newPoints.length > 0) {
          this.points = [...newPoints];
      
          this.startShowPoints(); // 直接开始显示新数据
        }
      });
  },
  methods: {

    // 开始显示点
    startShowPoints() {
     debugger
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

      console.log('显示地图点图层', point);
      this.createGridWithAnimation(point.lng, point.lat)
    

    },
    // 初始化 Cesium Viewer（保留你的原始逻辑）
    initCesium() {
      this.viewer = new Cesium.Viewer('cesiumContainer', {
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        selectionIndicator: false,
        maximumRenderTimeChange: Infinity,
        shadows: false,
        shouldAnimate: false,
        requestRenderMode: true,
        cesiumLogo: false,
        infoBox: false
      })
    },

    // 加载高德底图（保留你的原始逻辑）
    loadGaode() {
      const gaodeLayer = new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          minimumLevel: 1,
          maximumLevel: 18
        })
      )
      this.viewer.imageryLayers.add(gaodeLayer)
    },

    // 【核心改造】逐行创建彩色网格，实现“逐个出现”动画
    createGridWithAnimation(centerLon, centerLat) {
      // 1. 清理旧网格
      //this.clearGrid()

      

      const { cellSize, extent, width, animationSpeed } = this.gridOptions

      const centerLonNumber = Number(centerLon);  // 字符串转数值
      const centerLatNumber = Number(centerLat);

      const centerCartesian = Cesium.Cartesian3.fromDegrees(centerLonNumber, centerLatNumber)
      const rowCount = this.heatData.length       // 热力数据的行数（控制网格行数）
      const colCount = this.heatData[0].length    // 热力数据的列数（控制网格列数）

      // 2. 逐行创建网格（模拟“逐个出现”）
      for (let row = 0; row < rowCount; row++) {
        setTimeout(() => {
          this.createGridRow(centerCartesian, row, cellSize, extent, width, colCount)
        }, row * animationSpeed) // 每行延迟 animationSpeed 毫秒
      }
    },

    // 创建某一行的网格（包含颜色映射）
    createGridRow(centerCartesian, rowIndex, cellSize, extent, width, colCount) {
      const localFrame = Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian)
      const rowData = this.heatData[rowIndex] // 当前行的热力值

      // 计算当前行的南北偏移（y 方向）
      const yOffset = -extent + rowIndex * cellSize 

      for (let col = 0; col < colCount; col++) {
        // 计算当前列的东西偏移（x 方向）
        const xOffset = -extent + col * cellSize 

        // 3. 计算单元格的“四个角”坐标（这里简化为“垂直线”示例，可扩展为面网格）
        const southWest = this.offsetPosition(localFrame, xOffset, yOffset)
        const northEast = this.offsetPosition(localFrame, xOffset + cellSize, yOffset + cellSize)

        if (Cesium.Cartesian3.equals(southWest, Cesium.Cartesian3.ZERO) || 
            Cesium.Cartesian3.equals(northEast, Cesium.Cartesian3.ZERO)) {
          continue
        }

        // 4. 根据热力值映射颜色（示例：值越大越红）
        const color = this.getColorByHeat(rowData[col])

        // 5. 创建网格实体（这里用“垂直线”示例，也可改为“面网格”）
        const entity = this.viewer.entities.add({
          polyline: {
            positions: [southWest, northEast], // 示例：画垂直线，可扩展为完整单元格
            width: width,
            material: color,
            show: true
          }
        })
        this.gridEntities.push(entity)
      }
    },

    // 【关键】根据热力值映射颜色（可自定义渐变规则）
    getColorByHeat(heatValue) {
      // 简单示例：热力值越大，颜色越红（0→绿，10→红）
      const maxHeat = 10
      const ratio = heatValue / maxHeat
      return Cesium.Color.fromCssColorString(`rgb(${255 * ratio}, ${255 * (1 - ratio)}, 0)`)
    },

    // 偏移坐标计算（复用你的逻辑）
    offsetPosition(localFrame, x, y) {
      try {
        return Cesium.Matrix4.multiplyByPoint(
          localFrame,
          new Cesium.Cartesian3(x, y, 0),
          new Cesium.Cartesian3()
        )
      } catch (error) {
        console.error('计算偏移位置失败:', error)
        return Cesium.Cartesian3.ZERO
      }
    },

    // 显示/隐藏网格（保留你的原始逻辑，改造为控制 gridEntities）
    toggleGrid() {
      this.gridVisible = !this.gridVisible
      this.gridEntities.forEach(entity => {
        entity.polyline.show = this.gridVisible
      })
    },

    // 定位到网格（保留你的原始逻辑，改造为控制 gridEntities）
    zoomToGrid() {
      if (this.gridEntities.length) {
        this.viewer.flyTo(this.gridEntities, {
          duration: 1,
          offset: new Cesium.HeadingPitchRange(
            0,
            Cesium.Math.toRadians(-60),
            2000
          )
        })
      }
    },

    // 清理网格
    clearGrid() {
      this.gridEntities.forEach(entity => {
        this.viewer.entities.remove(entity)
      })
      this.gridEntities = []
    }
  },

  beforeUnmount() {
    // 组件销毁时清理
    this.clearGrid()
    if (this.viewer) {
      this.viewer.destroy()
    }
  }
}
</script>

<style scoped>
#cesiumContainer {
  position: relative;
  width: 100%;
  height: 100vh;
}

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

button {
  margin: 0 5px;
  padding: 6px 12px;
  cursor: pointer;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 3px;
  transition: background 0.3s;
}

button:hover {
  background: #359469;
}
</style>