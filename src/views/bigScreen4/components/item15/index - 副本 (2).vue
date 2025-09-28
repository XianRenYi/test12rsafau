<template>
  <!-- <pop title="历史数据">
    <history></history>
  </pop> -->
  <div class="but" @click="showPop">历史数据</div>
  <div class="chart-container">
    <div class="chart-controls">
      <button
        v-for="type in ['avg', 'max', 'min']"
        :key="type"
        @click="switchChart(type)"
        :class="{ active: currentType === type }"
      >
        {{ titleMap[type] }}
      </button>
    </div>
    <div class="echarts1" ref="echarts"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { FontChart } from "@/utils/utils.js";
import pop from "@/components/pop/index.vue";
import history from "./history/index.vue";
import { jingliuxiaoshishujufenxi } from "@/api/bigScreenIndex/bigScreen";
import { useSelectedDataStore } from "@/store/selectedDataStore";

// 自定义图形类型定义（调整柱子宽度为原来的1.33倍）
const registerCustomShapes = () => {
  const widthFactor = 1; // 宽度因子：增加三分之一

  const CubeLeft = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
    },
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint;
      const c0 = [shape.x, shape.y];
      const c1 = [shape.x - 4.5 * widthFactor, shape.y - 4.5 * widthFactor];
      const c2 = [xAxisPoint[0] - 4.5 * widthFactor, xAxisPoint[1] - 4.5 * widthFactor];
      const c3 = [xAxisPoint[0], xAxisPoint[1]];
      ctx
        .moveTo(c0[0], c0[1])
        .lineTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .closePath();
    },
  });

  const CubeRight = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
    },
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint;
      const c1 = [shape.x, shape.y];
      const c2 = [xAxisPoint[0], xAxisPoint[1]];
      const c3 = [xAxisPoint[0] + 9 * widthFactor, xAxisPoint[1] - 4.5 * widthFactor];
      const c4 = [shape.x + 9 * widthFactor, shape.y - 4.5 * widthFactor];
      ctx
        .moveTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .lineTo(c4[0], c4[1])
        .closePath();
    },
  });

  const CubeTop = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
    },
    buildPath: function (ctx, shape) {
      const c1 = [shape.x, shape.y];
      const c2 = [shape.x + 9 * widthFactor, shape.y - 4.5 * widthFactor];
      const c3 = [shape.x + 4.5 * widthFactor, shape.y - 9 * widthFactor];
      const c4 = [shape.x - 4.5 * widthFactor, shape.y - 4.5 * widthFactor];
      ctx
        .moveTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .lineTo(c4[0], c4[1])
        .closePath();
    },
  });

  echarts.graphic.registerShape("CubeLeft", CubeLeft);
  echarts.graphic.registerShape("CubeRight", CubeRight);
  echarts.graphic.registerShape("CubeTop", CubeTop);
};

// 确保只注册一次
let shapesRegistered = false;

export default {
  name: "echarts1",
  components: {
    pop,
    history,
  },
  data() {
    return {
      selectedFirst: null,
      currentType: "max",
      titleMap: {
        max: "最大值",
        avg: "平均值",
        min: "最小值",
      },
      list: [],
      myChart: null,
      resizeObserver: null,
    };
  },
  watch: {
    selectedData(newVal) {
      if (newVal) {
        this.selectedFirst = newVal;
        console.log("item15-selectedData", newVal);
        this.getData();
      }
    },
  },
  computed: {
    selectedData() {
      return useSelectedDataStore().selectedData;
    },
  },
  mounted() {
    if (!shapesRegistered) {
      registerCustomShapes();
      shapesRegistered = true;
    }

    this.changeCharts();
    setInterval(this.changeCharts, 5000);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.myChart) {
      this.myChart.dispose();
    }
  },
  methods: {
    changeCharts() {
      this.getData();
      this.initChart();
      window.addEventListener("resize", this.handleResize);
    },

    async getData() {
      try {
        const res = await jingliuxiaoshishujufenxi(this.selectedFirst);
        this.list = res.data;
        this.initChart();
      } catch (err) {
        console.error(err);
      }
    },
    initChart() {
      this.myChart = echarts.init(this.$refs.echarts);

      this.drawChart();
    },
    handleResize() {
      if (this.myChart) {
        this.myChart.resize();
      }
    },
    switchChart(type) {
      this.currentType = type;
      this.drawChart();
    },
    drawChart() {
      if (!this.myChart) return;

      const valueIndex = {
        avg: 0,
        max: 1,
        min: 2,
      }[this.currentType];

      const option = {
        title: {
          text: ``,
          left: "center",
          top: FontChart(20),
          textStyle: {
            color: "#fff",
            fontSize: FontChart(20),
          },
        },
        grid: {
          top: FontChart(100),
          bottom: FontChart(20),
          left: FontChart(20),
          right: FontChart(1),
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            // 获取当前数据的索引
            const dataIndex = params[0].dataIndex;
            // 获取对应的颜色
            const color = this.list[dataIndex].color;
            // 自定义 tooltip 内容
            return `
        <div>
          <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
          ${params[0].name}: ${params[0].value} mg/L
        </div>
      `;
          },
        },
        xAxis: {
          type: "category",
          data: this.list.map((obj) => obj.name),
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(0, 164, 255, 0.2)",
              fontSize: FontChart(14),
            },
          },
          offset: 0,
          axisTick: {
            show: false,
            length: FontChart(9),
            alignWithLabel: true,
            lineStyle: {
              color: "#7DFFFD",
            },
          },
          axisLabel: {
            fontSize: FontChart(14),
            color: "#fff",
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
            lineStyle: {
              color: "white",
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(0, 164, 255, 0.2)",
            },
          },

          axisTick: {
            show: false,
          },
          axisLabel: {
            fontSize: "17px",
            color: "#fff",
          },
        },
        series: [
          {
            type: "custom",
            renderItem: (params, api) => {
              const location = api.coord([api.value(0), api.value(1)]);
              const index = params.dataIndex;
              const color1 = this.list[index].color;
              const color2 = this.list[index].color2;
              const value = api.value(1);
              const name = this.list[index].name;
              const values = this.list[index].value;

              // 鼠标悬停提示文本 - 显示完整的平均值、最大值、最小值
              const tooltipText = `
                <div style="padding:5px;background:rgba(0,0,0,0.7);border-radius:4px;color:white;">
                  <div><strong>${name}</strong></div>
                  <div>平均值: ${values[0]} mg/L</div>
                  <div>最大值: ${values[1]} mg/L</div>
                  <div>最小值: ${values[2]} mg/L</div>
                </div>
              `;

              return {
                type: "group",
                children: [
                  {
                    type: "CubeLeft",
                    shape: {
                      api,
                      xValue: api.value(0),
                      yValue: api.value(1),
                      x: location[0],
                      y: location[1],
                      xAxisPoint: api.coord([api.value(0), 0]),
                    },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: color1 },
                        { offset: 1, color: color2 },
                      ]),
                    },
                  },
                  {
                    type: "CubeRight",
                    shape: {
                      api,
                      xValue: api.value(0),
                      yValue: api.value(1),
                      x: location[0],
                      y: location[1],
                      xAxisPoint: api.coord([api.value(0), 0]),
                    },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: color1 },
                        { offset: 1, color: color2 },
                      ]),
                    },
                  },
                  {
                    type: "CubeTop",
                    shape: {
                      api,
                      xValue: api.value(0),
                      yValue: api.value(1),
                      x: location[0],
                      y: location[1],
                      xAxisPoint: api.coord([api.value(0), 0]),
                    },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: color1 },
                        { offset: 1, color: color2 },
                      ]),
                    },
                  },
                ],
              };
            },
            data: this.list.map((obj) => obj.value[valueIndex]),
          },
        ],
      };
      this.myChart.clear();
      this.myChart.resize();
      this.myChart.setOption(option);
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.echarts1 {
  position: relative;
  width: 92%;
  height: calc(100% - 0px);
}

.chart-controls {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 10;
  display: flex;
  gap: 10px;

  button {
    background: rgba(0, 164, 255, 0.2);
    font-size: 17px;
    font-family: MicrosoftYaHei;
    color: #fff;
    border: 0px solid #7dfffd;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover,
    &.active {
      background: rgba(0, 164, 255, 0.5);
      transform: translateY(0px);
    }
  }
}

.but {
  position: absolute;
  right: 10px;
  top: -35px;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  color: #fff;
  font-size: 17px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.but:hover {
  background-color: rgba(45, 175, 233, 0.2); /* 背景颜色变化 */
  border-color: #00bfff; /* 边框颜色变化 */
  box-shadow: inset 0 0 15px rgba(45, 175, 233, 1), 0 0 10px rgba(45, 175, 233, 0.5); /* 内发光增强 + 外发光效果 */
  transform: scale(1.05); /* 轻微放大 */
}

@media screen and (max-width: 768px) {
  .chart-controls {
    top: 5px;
    right: 10px;

    button {
      padding: 1px 5px;
      font-size: 17px;
    }
  }
}
</style>
