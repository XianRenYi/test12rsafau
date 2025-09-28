<template>
  <pop title="历史水质">
    <history></history>
  </pop>
  <div class="echarts1" ref="echarts"></div>
</template>

<script>
import * as echarts from "echarts";
import {FontChart} from "@/utils/utils.js";
import pop from '@/components/pop/index.vue'
import history from './history/index.vue'
export default {
  name: "echarts1",
  components: {
    pop,
    history
  },
  data() {
    return {
      list: [
        {name: "pH", value: Math.floor(Math.random() * 14) + 1, color: "#f1f198", color2: "#6dc4ce"},
        {name: "COD", value: Math.floor(Math.random() * 100) + 1, color: "#7945e1", color2: "#ed5563"},
        {name: "BOD", value: Math.floor(Math.random() * 100) + 1, color: "#f05e62", color2: "#efc27d"},
        {name: "SS", value: Math.floor(Math.random() * 100) + 1, color: "#efcf80", color2: "#eff08b"},
        {
          name: "氨氮",
          value: Math.floor(Math.random() * 10) + 1,
          color: "rgba(234, 206, 15, 1)",
          color2: "rgba(196, 217, 18, 1)"
        },
        {
          name: "总磷",
          value: Math.floor(Math.random() * 10) + 1,
          color: "rgba(139, 234, 15, 1)",
          color2: "rgba(105, 159, 11, 1)"
        },
        {
          name: "总氮",
          value: Math.floor(Math.random() * 10) + 1,
          color: "rgba(15, 234, 234, 1)",
          color2: "rgba(11, 159, 159, 1)"
        },
      ],
    };
  },
  mounted() {
    this.drawLine();
  },
  methods: {
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      window.addEventListener("resize", this.drawLine);
      let myChart = echarts.init(this.$refs.echarts);

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
          ctx.moveTo(c0[0], c0[1]).lineTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).closePath();
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
          ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath();
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
          ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath();
        },
      });

      echarts.graphic.registerShape("CubeLeft", CubeLeft);
      echarts.graphic.registerShape("CubeRight", CubeRight);
      echarts.graphic.registerShape("CubeTop", CubeTop);

      var option = {
        grid: {
          left: FontChart(20),
          right: FontChart(20),
          bottom: FontChart(20),
          top: FontChart(50),
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
        graphic: [
          {
            type: "text",
            left: FontChart(20),
            top: FontChart(10),
            style: {
              text: "单位: mg/L",
              fill: "#fff",
              fontSize: FontChart(14),
            },
          },
        ],
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
            show: false
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
              color: "rgba(0, 164, 255, 0.2)"
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            fontSize: FontChart(14),
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
                        {offset: 0, color: color1},
                        {offset: 1, color: color2},
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
                        {offset: 0, color: color1},
                        {offset: 1, color: color2},
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
                        {offset: 0, color: color1},
                        {offset: 1, color: color2},
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
.echarts1 {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>