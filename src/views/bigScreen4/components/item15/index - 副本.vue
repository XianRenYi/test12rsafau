<template>
  <div class="water-quality-card">
    <!-- 标题栏 -->
    <div class="card-header">
      <div class="title">近12小时数据分析</div>
      <div class="history-btn" @click="openHistory">历史水质</div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 实时趋势（模拟） -->
    <div class="realtime-trend">实时趋势</div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  data() {
    return {
      chart: null,
      data: [{ name: "水质", value: 50, color: ["#00ffde", "#ffd700"] }],
      isZoomed: false,
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    if (this.chart) this.chart.dispose();
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    initChart() {
      // 1. 初始化图表
      const container = this.$refs.chartContainer;
      this.chart = echarts.init(container);

      // 2. 注册3D柱状图形状（核心）
      this.register3DShape();

      // 3. 渲染图表
      this.renderChart();

      // 4. 修正交互偏移
      this.fixInteraction();
    },

    register3DShape() {
      // 左侧面
      echarts.graphic.registerShape(
        "CubeLeft",
        echarts.graphic.extendShape({
          buildPath: (ctx, shape) => {
            const { x, y, xAxisPoint } = shape;
            ctx
              .moveTo(x, y)
              .lineTo(x - 6, y - 4)
              .lineTo(xAxisPoint[0] - 6, xAxisPoint[1] - 4)
              .lineTo(xAxisPoint[0], xAxisPoint[1])
              .closePath();
          },
        })
      );

      // 右侧面
      echarts.graphic.registerShape(
        "CubeRight",
        echarts.graphic.extendShape({
          buildPath: (ctx, shape) => {
            const { x, y, xAxisPoint } = shape;
            ctx
              .moveTo(x, y)
              .lineTo(xAxisPoint[0], xAxisPoint[1])
              .lineTo(xAxisPoint[0] + 6, xAxisPoint[1] - 4)
              .lineTo(x + 6, y - 4)
              .closePath();
          },
        })
      );

      // 顶面
      echarts.graphic.registerShape(
        "CubeTop",
        echarts.graphic.extendShape({
          buildPath: (ctx, shape) => {
            const { x, y } = shape;
            ctx
              .moveTo(x, y)
              .lineTo(x + 6, y - 4)
              .lineTo(x + 3, y - 8)
              .lineTo(x - 3, y - 4)
              .closePath();
          },
        })
      );
    },

    renderChart() {
      const option = {
        grid: {
          left: 20,
          right: 20,
          bottom: 30,
          top: 30,
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.data.map((item) => item.name),
          show: false, // 隐藏x轴（设计稿无坐标轴）
        },
        yAxis: {
          type: "value",
          show: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#c0c0c0",
            fontSize: 12,
          },
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,0.1)",
            },
          },
        },
        series: [
          {
            type: "custom",
            renderItem: (params, api) => {
              const value = api.value(1);
              const coord = api.coord([api.value(0), value]);
              const xAxisCoord = api.coord([api.value(0), 0]);
              const dataIndex = params.dataIndex;
              const { color } = this.data[dataIndex];

              return {
                type: "group",
                children: [
                  {
                    type: "CubeLeft",
                    shape: { x: coord[0], y: coord[1], xAxisPoint: xAxisCoord },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: color[0] },
                        { offset: 1, color: color[1] },
                      ]),
                    },
                  },
                  {
                    type: "CubeRight",
                    shape: { x: coord[0], y: coord[1], xAxisPoint: xAxisCoord },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: color[0] },
                        { offset: 1, color: color[1] },
                      ]),
                    },
                  },
                  {
                    type: "CubeTop",
                    shape: { x: coord[0], y: coord[1] },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: color[0] },
                        { offset: 1, color: color[1] },
                      ]),
                    },
                  },
                ],
              };
            },
            data: this.data.map((item) => item.value),
          },
        ],
      };

      this.chart.setOption(option);
    },

    // 修正鼠标交互偏移
    fixInteraction() {
      this.chart.getZr().on("mousemove", (event) => {
        const scaledEvent = {
          ...event,
          offsetX: event.offsetX * devicePixelRatio,
          offsetY: event.offsetY * devicePixelRatio,
        };
        this.chart.getZr().handler.dispatch(event.type, scaledEvent);
      });
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize();
        this.renderChart(); // 重新渲染确保适配
      }
    },

    openHistory() {
      // 调用弹窗逻辑
      // this.$refs.pop.open();
    },
  },
};
</script>

<style scoped>
/* 卡片整体样式 */
.water-quality-card {
  width: 320px;
  height: 300px;
  background: linear-gradient(135deg, #0b1c27, #0f344f);
  border: 1px solid #1f78b4;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 120, 255, 0.1);
  padding: 10px;
  box-sizing: border-box;
  position: relative;
}

/* 标题栏 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 10px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #00ffff;
}

.history-btn {
  background: #1f78b4;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.history-btn:hover {
  background: #3399ff;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

/* 实时趋势栏 */
.realtime-trend {
  position: absolute;
  bottom: 10px;
  left: 20px;
  color: #00ffff;
  font-size: 12px;
}

/* 适配深色背景的滚动条（可选） */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #1f78b4;
  border-radius: 4px;
}

::-webkit-scrollbar-track {
  background: #0b1c27;
}
</style>
