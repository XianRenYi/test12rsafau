<template>
  <!-- <pop title="历史数据">
    <history></history>
  </pop> -->

  <div>
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
  </div>

  <div class="echarts1" ref="echarts"></div>
</template>

<script>
import * as echarts from "echarts";
import { FontChart } from "@/utils/utils.js";
import pop from "@/components/pop/index.vue";
import history from "./history/index.vue";
import { jingliuxiaoshishujufenxi } from "@/api/bigScreenIndex/bigScreen";
import { useSelectedDataStore } from "@/store/selectedDataStore";

export default {
  name: "echarts1",
  components: {
    pop,
    history,
  },
  data() {
    return {
      currentType: "max",
      titleMap: {
        max: "最大值",
        avg: "平均值",
        min: "最小值",
      },
      showName: "最大值",
      selectedFirst: null,
      list: [
        {
          name: "pH",
          value: Math.floor(Math.random() * 14) + 1,
          color: "#f1f198",
          color2: "#6dc4ce",
        },
        {
          name: "COD",
          value: Math.floor(Math.random() * 100) + 1,
          color: "#7945e1",
          color2: "#ed5563",
        },
        {
          name: "BOD",
          value: Math.floor(Math.random() * 100) + 1,
          color: "#f05e62",
          color2: "#efc27d",
        },
        {
          name: "SS",
          value: Math.floor(Math.random() * 100) + 1,
          color: "#efcf80",
          color2: "#eff08b",
        },
        {
          name: "氨氮",
          value: Math.floor(Math.random() * 10) + 1,
          color: "rgba(234, 206, 15, 1)",
          color2: "rgba(196, 217, 18, 1)",
        },
        {
          name: "总磷",
          value: Math.floor(Math.random() * 10) + 1,
          color: "rgba(139, 234, 15, 1)",
          color2: "rgba(105, 159, 11, 1)",
        },
        {
          name: "总氮",
          value: Math.floor(Math.random() * 10) + 1,
          color: "rgba(15, 234, 234, 1)",
          color2: "rgba(11, 159, 159, 1)",
        },
      ],
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
    this.getData();
    setInterval(this.getData, 5000);
  },
  methods: {
    async getData() {
      try {
        const res = await jingliuxiaoshishujufenxi(this.selectedFirst);
        
        this.list = res.data;
        this.drawLine();
      } catch (err) {
        console.error(err);
      }
    },
    switchChart(type) {
      this.currentType = type;

      if (type === "avg") {
        this.list.forEach((item) => {
          item.value = item.valueAvg;
        });
      }
      if (type === "min") {
        this.list.forEach((item) => {
          item.value = item.valueMin;
        });
      }
      if (type === "max") {
        this.list.forEach((item) => {
          item.value = item.valueMax;
        });
      }

      this.drawLine();
    },
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      window.addEventListener("resize", this.drawLine);
      let myChart = echarts.init(this.$refs.echarts);

      // 1. 计算当前数据的最大值（根据当前类型：max/avg/min）
      const currentValues = this.list.map((item) => item.value);
      const maxValue = Math.max(...currentValues); // 当前数据最大值

      // 2. 确保最大值为整数，并添加适当余量
      let yMax = Math.ceil(maxValue); // 向上取整确保是整数
      // 如果最大值为0，设置一个默认值
      if (yMax === 0) {
        yMax = 5; // 确保能分成5段，每段1
      } else {
        // 计算需要补充多少才能被5整除，确保间隔为整数
        const remainder = yMax % 5;
        if (remainder !== 0) {
          yMax += 5 - remainder;
        }
        // 如果数据较少，适当增加余量，但保持能被6整除
        if (yMax < 12 && maxValue > 0) {
          yMax = 12; // 最小确保12，每段2
        }
      }

      const minValue = 0; // 固定最小值为0
      const interval = (yMax - minValue) / 5; // 强制6段的间隔，此时一定是整数
      const CubeLeft = echarts.graphic.extendShape({
        shape: {
          x: 0,
          y: 0,
        },
        buildPath: function (ctx, shape) {
          const xAxisPoint = shape.xAxisPoint;
          const c0 = [shape.x, shape.y];
          const c1 = [shape.x - 4.5, shape.y - 4.5];
          const c2 = [xAxisPoint[0] - 4.5, xAxisPoint[1] - 4.5];
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
          const c3 = [xAxisPoint[0] + 9, xAxisPoint[1] - 4.5];
          const c4 = [shape.x + 9, shape.y - 4.5];
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
          const c2 = [shape.x + 9, shape.y - 4.5];
          const c3 = [shape.x + 4.5, shape.y - 9];
          const c4 = [shape.x - 4.5, shape.y - 4.5];
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

      var option = {
        grid: {
          left: FontChart(20),
          right: FontChart(25),
          bottom: FontChart(20),
          top: FontChart(110),
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none", // 替换为阴影形式
            // type: 'line', // 或者使用直线形式（但不是虚线）
            // type: 'none', // 或者完全隐藏
          },
          formatter: (params) => {
            // 获取当前数据的索引
            const dataIndex = params[0].dataIndex;
            // 获取对应的颜色
            const color = this.list[dataIndex].color;
            const ShowTitle = this.titleMap[this.currentType];
            // 自定义 tooltip 内容
            return `
        <div>
          <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
        ${ShowTitle}：${params[0].value}
         <br/>
             <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
          小时：${params[0].name}
        </div>
      `;
          },
        },
        graphic: [
          {
            type: 'text',
            left: FontChart(30),
            top: FontChart(30),
            style: {
              text: this.selectedFirst && this.selectedFirst.unit ? `单位 ${this.selectedFirst.unit}` : '单位 --',
              fontSize: FontChart(20),
              fontFamily: 'MicrosoftYaHei',
              fill: '#ffffff',
              padding: [FontChart(8), FontChart(12), FontChart(8), FontChart(12)]
            },
            textStyle: {
              color: '#ffffff',
              fontSize: FontChart(20),
              fontFamily: 'MicrosoftYaHei'
            }
          }
        ],

        xAxis: {
          type: "category",
          data: this.list.map((obj) => obj.name),
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(0, 164, 255, 0.2)",
              fontSize: "17px",
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
            fontSize: "17px",
            color: "#fff",
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          min: minValue, // 强制最小值
          max: yMax, // 强制最大值（带余量）
          interval: interval, // 强制间隔=总范围/6
          scale: false, // 关闭自适应缩放，确保强制分段生效
          axisLine: {
            show: false,
            lineStyle: { color: "white" },
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
              const index = params.dataIndex; // 获取当前索引
              const color1 = this.list[index].color; // 从list中获取对应的color1
              const color2 = this.list[index].color2; // 从list中获取对应的color2
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
            data: this.list.map((obj) => obj.value),
          },
        ],
      };

      myChart.clear();
      myChart.resize();
      myChart.setOption(option);
    },
  },
};
</script>

<style lang="scss" scoped>
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
.echarts1 {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
