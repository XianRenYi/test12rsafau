<template>
  <div class="echarts1" ref="echarts"></div>
</template>

<script>
import { FontChart } from "@/utils/utils.js";
import dian from "./dian.png";
import dian2 from "./dian2.png";
import * as echarts from "echarts";

export default {
  name: "echarts1",
  components: {},
  props: {
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {};
  },
  watch: {
    list() {
      this.drawLine();
    },
  },
  mounted() {
    this.drawLine();
  },
  methods: {
    drawLine() {
      var that = this;
      window.addEventListener("resize", this.drawLine);
      let myChart = echarts.init(this.$refs.echarts);
      var option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "line", // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {
              color: "#017bec",
              type: "dashed",
            },
          },
        },
        legend: {
          show: true,
          right: FontChart(18),
          top: "5",
          itemWidth: FontChart(28),
          textStyle: {
            color: "rgba(0, 209, 255, 1)",
            fontSize: FontChart(18),
          },
        },
        grid: {
          top: FontChart(60),
          bottom: FontChart(20),
          left: FontChart(20),
          right: FontChart(20),
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#0f337b",
              },
            },
            axisLabel: {
              fontSize: "17px",
              color: "#fff",
            },
            axisTick: {
              show: false,
            },
            data: this.list.map((obj) => obj.name),
          },
        ],
        yAxis: [
          {
            splitLine: {
              show: true,
              lineStyle: {
                color: "rgba(21, 58, 121, 0.6)",
                type: "dashed",
              },
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "rgba(32, 72, 141, 1)",
              },
            },
            axisLabel: {
              fontSize: "17px",
              color: "#fff",
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            type: "line",
            symbol: "none",
            lineStyle: {
              normal: {
                color: "#36fff0", // 线条颜色
              },
            },
            itemStyle: {
              color: "#36fff0",
              borderColor: "#36fff0",
              fontSize: FontChart(18),
              borderWidth: FontChart(2),
            },
            label: {
              normal: {
                show: false,
                position: "top",
                color: "#fff",
                align: "center",
                fontWeight: 500,
                fontSize: FontChart(18),
              },
            },
            tooltip: {
              show: true,
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "rgba(0, 255, 240, 0.3)",
                    },
                    {
                      offset: 1,
                      color: "rgba(0, 156, 255, 0)",
                    },
                  ],
                  false
                ),
              },
            },
            data: this.list.map((obj) => obj.value),
          },
        ],
      };

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
  height: calc(100% - 0px);
}
</style>
