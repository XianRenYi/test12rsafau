<template>
  <div class="echarts1" ref="echarts">

  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: 'echarts1',
  components: {},
  watch: {
    xData() {
      this.drawEcharts()
    },
    yData() {
      this.drawEcharts()
    },
  },
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  mounted() {
    this.drawEcharts()
  },
  computed: {
    xData: function () {
      var list = []
      this.list.forEach((type) => {
        list.push(type.title)
      });
      return list
    },
    yData: function () {
      var list = []
      this.list.forEach((type) => {
        var data = {
          value: type.value
        }
        list.push(data)
      });
      return list
    },
  },
  methods: {
    drawEcharts() {
      var that = this
      window.addEventListener('resize', this.drawEcharts)
      let myChart = echarts.init(this.$refs.echarts)
      var option = {
        textStyle: {
          color: '#c0c3cd',
          fontSize: 14,
        },
        color: ['#00D7E9', 'rgba(0, 215, 233, 0.9)'],
        grid: {
          containLabel: true,
          left: 20,
          right: 20,
          bottom: 0,
          top: 40,
        },
        xAxis: {
          nameTextStyle: {
            color: '#c0c3cd',
            padding: [0, 0, -10, 0],
            fontSize: 13,
          },
          axisLabel: {
            color: 'rgba(149, 201, 255, 1)',
            fontSize: 13,
            interval: 0,
            lineHeight: 20,
          },
          axisTick: {
            show: false,
            lineStyle: {
              color: '#384267',
              width: 1,
            },
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#335971',
            },
            show: true,
          },
          data: this.xData,
          type: 'category',
        },
        yAxis: {
          // name: '册',
          // nameTextStyle: {
          //   color: 'rgba(11, 255, 168, 1)',
          //   padding: [0, 0, 0, 0],
          //   fontSize: 12,
          // },
          axisLabel: {
            color: 'rgba(149, 201, 255, 1)',
            fontSize: 12,
            interval: 0,
            fontFamily: 'OPPOSans'
          },
          axisTick: {
            lineStyle: {
              color: '#668092',
              width: 0,
            },
            show: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#335971',
              "type": "dashed"
            },
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(8, 46, 124, 1.00)',
              width: 1,
              type: "dashed"
            },
            show: false,
          }
        },
        series: [
          {
            data: this.yData,
            type: 'bar',
            barMaxWidth: 'auto',
            barWidth: 10,
            itemStyle: {
              color: {
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                type: 'linear',
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(18, 99, 255, 1)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(4, 206, 247, 1)',
                  },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              distance: 10,
              color: '#fff',
              fontFamily: 'DIN-bold'
            },
          }
        ],
        tooltip: {
          show: true,
          formatter: '{b}:{c0}',
        },
      };
      myChart.clear()
      myChart.resize()
      myChart.setOption(option)
    },
  }
}
</script>

<style lang="scss" scoped>
.echarts1 {
  position: relative;
  width: 100%;
  height: calc(100% - 10px);
}
</style>

