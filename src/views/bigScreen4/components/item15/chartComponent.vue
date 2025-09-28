<template>
    <div class="echarts1" ref="echarts"></div>
  </template>
  
  <script>
  import * as echarts from "echarts";
  import { FontChart } from "@/utils/utils.js";
  
  // 自定义图形类型定义
  const registerCustomShapes = () => {
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
        ctx.moveTo(c0[0], c0[1])
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
        ctx.moveTo(c1[0], c1[1])
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
        ctx.moveTo(c1[0], c1[1])
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
    name: "ChartComponent",
    props: {
      list: {
        type: Array,
        required: true,
        default: () => []
      },
      currentType: {
        type: String,
        required: true,
        default: 'max'
      }
    },
    data() {
      return {
        myChart: null,
        resizeObserver: null
      };
    },
    mounted() {
      if (!shapesRegistered) {
        registerCustomShapes();
        shapesRegistered = true;
      }
      this.initChart();
      window.addEventListener("resize", this.handleResize);
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
      initChart() {
        this.myChart = echarts.init(this.$refs.echarts);
        
        // 添加自适应调整
        this.resizeObserver = new ResizeObserver(entries => {
          if (entries[0].intersectionRatio > 0) {
            requestAnimationFrame(() => {
              if (this.myChart) {
                this.myChart.resize();
              }
            });
          }
        });
        
        this.resizeObserver.observe(this.$refs.echarts);
        
        this.drawChart();
      },
      handleResize() {
        if (this.myChart) {
          this.myChart.resize();
        }
      },
      drawChart() {
        if (!this.myChart) return;
  
        const valueIndex = {
          avg: 0,
          max: 1,
          min: 2
        }[this.currentType];
  
        const option = {
          title: {
            text: ``,
            left: 'center',
            top: FontChart(10),
            textStyle: {
              color: '#fff',
              fontSize: FontChart(16)
            }
          },
          grid: {
            top: FontChart(60),
            bottom: FontChart(20),
            left: FontChart(20),
            right: FontChart(20),
            containLabel: true
          },
          tooltip: {
            trigger: "axis",
            formatter: (params) => {
              const dataIndex = params[0].dataIndex;
              const color = this.list[dataIndex].color;
              const values = this.list[dataIndex].value;
              return `
                <div>
                  <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>
                  ${params[0].name}<br/>
                  平均值: ${values[0]} mg/L<br/>
                  最大值: ${values[1]} mg/L<br/>
                  最小值: ${values[2]} mg/L
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
            max:  Math.round(Math.max(...this.list.map(obj => obj.value[valueIndex])) * 10/6)
  
          },
          series: [
            {
              type: "custom",
              label: {
                show: true,
                position: 'top',
                formatter: '{c}',
                color: '#fff',
                fontSize: FontChart(12)
              },
              renderItem: (params, api) => {
                const location = api.coord([api.value(0), api.value(1)]);
                const index = params.dataIndex;
                const color1 = this.list[index].color;
                const color2 = this.list[index].color2;
                
                // 获取当前柱子的值用于显示
                const value = api.value(1);
                
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
                    // 添加数值文本
                    {
                      type: 'text',
                      style: {
                        text: value,
                        x: location[0],
                        y: location[1] - 25,
                        fill: '#fff',
                        fontSize: FontChart(12),
                        textAlign: 'center'
                      }
                    }
                  ],
                };
              },
              data: this.list.map(obj => obj.value[valueIndex]),
            },
          ],
        };
  
        this.myChart.setOption(option, true);
      }
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .echarts1 {
    width: 100%;
    height: 100%;
  }
  </style>