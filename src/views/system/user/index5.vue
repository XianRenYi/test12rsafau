<template>
  <div class="container">
    <!-- 地图容器 -->
    <div id="map-container" class="map-container"></div>
    <!-- ECharts 容器，放置三维散点图 -->
    <div ref="echartsContainer" class="echarts-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import 'echarts-gl';  // 必须引入支持 3D 的 echarts-gl 扩展

export default {
  name: 'MapWith3DScatter',
  data() {
    return {
      map: null,
      echartsInstance: null,
      points: [
        { lng: 113.94360, lat: 22.53200, value: 50 },
        { lng: 113.94640, lat: 22.53300, value: 50 },
        { lng: 113.94920, lat: 22.53300, value: 50 },
        { lng: 113.95200, lat: 22.53300, value: 50 },
        { lng: 113.95480, lat: 22.53300, value: 50 },
        { lng: 113.95760, lat: 22.53300, value: 50 },
        { lng: 113.96040, lat: 22.53300, value: 50 },
        { lng: 113.96320, lat: 22.53300, value: 50 },
      ], // 3D 散点数据
      mapZoomLevel: 15, // 初始地图缩放级别
      currentIndex: 0, // 当前添加的散点索引
    };
  },
  mounted() {
    this.loadBaiduMap();
  },
  methods: {
    // 加载百度地图
    loadBaiduMap() {
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=ogtWVGJSHeqLKSbNSYTS3lQpZMXgVQjh&callback=initBaiduMap`;
      script.defer = true;
      document.body.appendChild(script);
      window.initBaiduMap = this.initMap;
    },

    // 初始化百度地图
    initMap() {
      this.map = new BMap.Map('map-container');
      const centerPoint = new BMap.Point(113.94360, 22.53200);
      this.map.centerAndZoom(centerPoint, this.mapZoomLevel);
      this.map.enableScrollWheelZoom(true);

      // 设置地图容器的位置偏移（往下移动）
      this.$nextTick(() => {
        const mapContainer = document.getElementById('map-container');
        mapContainer.style.transform = 'rotateX(52deg) skewX(-159deg) translateY(179px) rotate(-12deg)';
        mapContainer.style.width = '1000px';
        mapContainer.style.height = '500px';
        mapContainer.style.right = '20px';
        mapContainer.style.left = '215px';
        mapContainer.style.top = '209px';
        mapContainer.style.clipPath = 'polygon(49% -3%, 100% 6%, 100% 100%, 9% 100%)';
      });

      // 在地图上绘制 3D 散点图
      this.initECharts(centerPoint);

      // 添加标记点
      this.marker = new BMap.Marker(centerPoint);
      this.map.addOverlay(this.marker);

      // 定时移动点位
      setInterval(this.moveMarker, 2000);
    },

    // 让点位移动（保持地图居中且置顶）
    moveMarker() {
      if (this.currentIndex >= this.points.length - 1) this.currentIndex = 0;
      let nextPoint = new BMap.Point(this.points[this.currentIndex].lng, this.points[this.currentIndex].lat);

      // 移动标记
      this.marker.setPosition(nextPoint);

      // 让地图跟随点位居中
      this.map.panTo(nextPoint);

      // 生成遮盖方块
      this.createOverlay(nextPoint, this.points[this.currentIndex].value);

      this.currentIndex++;
    },

    // 生成遮盖方块（不同颜色、数字、半透明，点击弹窗）
    createOverlay(point, value) {
      let color = value < 60 ? "green" : value < 80 ? "orange" : "red";

      function SquareOverlay(point, text, color, map) {
        this._point = point;
        this._text = text;
        this._color = color;
        this._map = map;
      }

      SquareOverlay.prototype = new BMap.Overlay();
      SquareOverlay.prototype.initialize = function () {
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.width = "40px";
        div.style.height = "40px";
        div.style.background = this._color;
        div.style.opacity = "0.3";
        div.style.textAlign = "center";
        div.style.lineHeight = "40px";
        div.style.color = "#fff";
        div.style.fontSize = "14px";
        div.style.fontWeight = "bold";
        div.innerHTML = this._text;
        div.style.cursor = "pointer";

        div.onclick = () => {
          let infoWindow = new BMap.InfoWindow(`
            <div style="font-size:14px; padding:5px;">
              <b>坐标:</b> ${this._point.lng}, ${this._point.lat}<br>
              <b>数值:</b> ${this._text}
            </div>
          `, { width: 200, height: 100, title: "详细信息" });
          this._map.openInfoWindow(infoWindow, this._point);
        };

        this._map.getPanes().labelPane.appendChild(div);
        this._div = div;

        return div;
      };

      SquareOverlay.prototype.draw = function () {
        let position = this._map.pointToOverlayPixel(this._point);
        this._div.style.left = position.x - 20 + "px";
        this._div.style.top = position.y - 20 + "px";
      };

      let overlay = new SquareOverlay(point, value, color, this.map);
      this.map.addOverlay(overlay);
    },

    // 初始化 ECharts 三维散点图
    initECharts(centerPoint) {
      const echartsContainer = this.$refs.echartsContainer;
      const width = echartsContainer.offsetWidth;
      const height = echartsContainer.offsetHeight;

      this.echartsInstance = echarts.init(echartsContainer);

      const option = {
        title: {
          //text: '3D Scatter Plot',
        },
        tooltip: {
          trigger: 'item',
        },
        visualMap: {
          min: 10,
          max: 60,
          dimension: 3,
          inRange: {
            color: ['#ff0000', '#ffff00', '#00ff00']
          }
        },
        xAxis3D: {
          type: 'value',
          min: -0.02,
          max: 0.02,
        },
        yAxis3D: {
          type: 'value',
          min: -0.02,
          max: 0.02,
        },
        zAxis3D: {
          type: 'value',
          min: 0,
          max: 100,
        },
        grid3D: {
          boxWidth: 150,
          boxDepth: 150,
          viewControl: {
            rotate: [30, 90, 30],
            distance: 300,
            alpha: 19,
            beta: 80,
            projection: 'perspective',
            distance: 250,
            center: [-0.05, -0.05, 0],
          },
          top: -200,
        },
        series: [
          {
            type: 'scatter3D',
            symbolSize: 10,
            data: [],
            itemStyle: {
              color: '#FF6347',
            },
          },
        ],
      };

      this.echartsInstance.setOption(option);

      // 逐步添加散点
      this.addScatterPointSequentially(centerPoint);
    },

    // 逐步添加散点，并同步更新地图中心点
    addScatterPointSequentially(centerPoint) {
      const interval = 500; // 每隔 500 毫秒添加一个散点
      const totalPoints = this.points.length;

      const timer = setInterval(() => {
        if (this.currentIndex < totalPoints) {
          const point = this.points[this.currentIndex];
          const scatterData = this.echartsInstance.getOption().series[0].data;
          scatterData.push([
            point.lng - centerPoint.lng,
            point.lat - centerPoint.lat,
            point.value,
          ]);

          // 更新 ECharts 数据
          this.echartsInstance.setOption({
            series: [{
              data: scatterData,
            }]
          });

          // 更新地图中心点
          const newCenterPoint = new BMap.Point(point.lng, point.lat);
          this.map.panTo(newCenterPoint);

          // 如果有标记点，也移动标记点
          if (this.marker) {
            this.marker.setPosition(newCenterPoint);
          }

          this.currentIndex++;
        } else {
          clearInterval(timer);
        }
      }, interval);
    },
  },
};
</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.echarts-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>
