<template>
  <div class="device-overview-card device-overview-compact info-card-compact">
    <div class="info-header">
    </div>
    <div class="device-count">
      <div :id="chartId" class="pie-chart"></div>
      <div class="data-rank">
        <div v-for="(item, index) in list" :key="index" class="rank-item">
          <div class="rank-data">
            <div class="rank-name">
              <div class="rank-index-dot" :class="`color${index}`"></div> <!-- 替换为圆点样式 -->
              <div class="rank-label">{{ item.name }} （{{ item.value }}）<span ></span></div>
              
            </div>
            <div class="rank-line">
              <div
                class="process-line orange"
                :class="`color${index}`"
                :style="{
                  width: totalValue ? (item.value / totalValue) * 100 + '%' : '0%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const chartId = ref("repairStatusChart" + Math.random().toString(36).substring(2, 12));
let myChart = null;

const totalValue = computed(() => {
  return props.list.reduce((sum, item) => sum + item.value, 0);
});

const createChart = () => {
  const chartDom = document.getElementById(chartId.value);
  if (!chartDom) {
    console.warn("Chart DOM element not found:", chartId.value);
    return;
  }

  // 确保 chartDom 具有非零的宽度和高度
  const { clientWidth, clientHeight } = chartDom;
  if (clientWidth === 0 || clientHeight === 0) {
    console.warn("Chart DOM element has zero width or height:", chartId.value, clientWidth, clientHeight);
    // 可以选择在此处添加一个延迟重试机制，或者依赖父组件的布局调整
    return;
  }

  if (!myChart) {
    myChart = echarts.init(chartDom);
  }

  const color1 = [
    'rgba(11, 232, 252,1)', // 正常
    'rgba(255, 228, 120,1)', // 待维修
    'rgba(255, 100, 21,1)',  // 报废
  ];

  const color2 = [
    'rgba(11, 232, 252,0.25)',
    'rgba(255, 228, 120,0.25)',
    'rgba(255, 100, 21,0.25)',
  ];

  const data1 = [];
  const data2 = [];

  props.list.forEach((item, index) => {
    data1.push({
      value: item.value,
      name: item.name,
      itemStyle: {
        normal: {
          color: color1[index % color1.length],
          // borderColor: '#000',
          // borderWidth: 2,
        },
      },
    });
    data2.push({
      value: item.value,
      name: item.name,
      itemStyle: {
        normal: {
          color: color2[index % color2.length],
        },
      },
    });
  });

  const option = {
    title: {
      text: totalValue.value,
      subtext: '设备总数',
      top: '30%',
      left: '48%',
      textAlign: 'center',
      textStyle: {
        color: '#0BE8FC',
        fontSize: 24, // 调整字体大小
      },
      subtextStyle: {
        fontSize: 16, // 调整字体大小
        color: '#b0c9d7', // 调整颜色
      },
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#b0c9d7', // 调整文本颜色
      },
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // 调整背景为半透明黑色
      borderRadius: 4,
      // borderColor: '#ddd',
    },
    series: [
      {
        type: 'pie',
        name: '外层细圆环',
        radius: ['100%', '98%'],
        center: ['50%', '50%'],
        hoverAnimation: false,
        clockwise: false,
        tooltip: { show: false },
        itemStyle: {
          normal: {
            color: 'rgba(255, 255, 255, 0.2)', // 更柔和的白色
            opacity: 0.5, // 增加透明度
          },
        },
        label: { show: false },
        data: [1],
      },
      {
        type: 'pie',
        hoverAnimation: false,
        radius: ['76%', '88%'],
        center: ['50%', '50%'],
        label: {
          show: false,
          position: 'center',
        },
        data: data1,
      },
      {
        type: 'pie',
        hoverAnimation: false,
        radius: ['56%', '76%'],
        center: ['50%', '50%'],
        tooltip: { show: false },
        label: {
          normal: { show: false },
        },
        data: data2,
      },
    ],
  };

  if (myChart) {
    // 如果图表实例已存在，直接更新配置
    myChart.setOption(option, true); // true 表示不合并配置，完全替换
    return;
  }

  myChart = echarts.init(chartDom);

  myChart.setOption(option);
};

onMounted(() => {
  nextTick(() => {
    createChart();
  });
});

defineExpose({ createChart });
</script>

<style lang="scss" scoped>
.device-overview-card {
  border-radius: 12px; /* 调整圆角 */
  padding: 25px;
  transition: all 0.3s ease; /* 更改为 all */
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 添加柔和阴影 */
  .info-header {
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #b0c9d7; // 将颜色改为更亮的颜色
    }
  }
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* 调整 hover 阴影 */
  }

  .info-header {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .device-count {
    display: flex;
    align-items: center;
    gap: 20px;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

    .pie-chart {
      width: 180px; /* 进一步放大 */
      height: 180px; /* 进一步放大 */
      flex-shrink: 0;
    }

    .data-rank {
      flex: 1;
      
      &::-webkit-scrollbar {
        display: none;
      }
      
      scrollbar-width: none;
      -ms-overflow-style: none;

      .rank-item {
        margin-bottom: 15px;

        .rank-data {
          .rank-name {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .rank-index-dot {
              width: 10px; /* 调整圆点大小 */
              height: 10px; /* 调整圆点大小 */
              border-radius: 50%;
              margin-right: 10px;
              flex-shrink: 0;
              &.color0 { background: rgba(11, 232, 252,1); }
              &.color1 { background: rgba(255, 228, 120,1); }
              &.color2 { background: rgba(255, 100, 21,1); }
            }

            .rank-label {
              color: #b0c9d7; // 将颜色改为更亮的颜色
              margin-right: 10px;
              flex: 1;
              font-size: 14px; /* 增大字体 */
              display: flex; /* 使用 flex 布局 */
              justify-content: space-between; /* 子元素两端对齐 */
              align-items: center; /* 垂直居中 */
            }

            .rank-value {
              color: #0be8fc;
              font-weight: bold;
              margin-left: 1px; /* 与文字保持距离 */
            }
          }

          .rank-line {
            height: 6px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            overflow: hidden;

            .process-line {
              height: 100%;
              border-radius: 3px;
              transition: width 0.3s ease;

              &.color0 {
                background: linear-gradient(90deg, rgba(11, 232, 252, 0.8), rgba(11, 232, 252, 1));
              }
              &.color1 {
                background: linear-gradient(90deg, rgba(255, 228, 120, 0.8), rgba(255, 228, 120, 1));
              }
              &.color2 {
                background: linear-gradient(90deg, rgba(255, 100, 21, 0.8), rgba(255, 100, 21, 1));
              }
              &.color3 {
                background: linear-gradient(90deg, rgba(255, 141, 21, 0.8), rgba(255, 141, 21, 1));
              }
              &.color4 {
                background: linear-gradient(90deg, rgba(255, 100, 21, 0.8), rgba(255, 100, 21, 1));
              }
            }
          }
        }
      }
    }
  }

  &.device-overview-compact {
    padding: 20px;
    margin-bottom: 20px;

    .info-header {
      margin-bottom: 12px;

      h3 {
        font-size: 18px; /* 增大字体 */
      }
    }

    .device-count {
      gap: 15px;

      .pie-chart {
        width: 150px; /* 放大 */
        height: 150px; /* 放大 */
      }

      .data-rank {
        .rank-item {
          margin-bottom: 12px;

          .rank-data {
            .rank-name {
              margin-bottom: 6px;

              .rank-index-dot {
                width: 8px; /* 调整圆点大小 */
                height: 8px; /* 调整圆点大小 */
                margin-right: 8px;
              }

              .rank-label {
                font-size: 13px; /* 调整字体 */
                margin-right: 8px;
                display: flex; /* 使用 flex 布局 */
                justify-content: space-between; /* 子元素两端对齐 */
                align-items: center; /* 垂直居中 */
              }
              .rank-value {
                margin-left: 8px; /* 与文字保持距离 */
              }
            }

            .rank-line {
              height: 5px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .device-overview-card {
    padding: 20px;

         .info-header h3 {
       font-size: 16px; /* 调整字体 */
     }

    .device-count {
      gap: 15px;

      .pie-chart {
        width: 150px; /* 放大 */
        height: 150px; /* 放大 */
      }

      .data-rank {
        .rank-item {
          margin-bottom: 12px;

          .rank-data {
            .rank-name {
              margin-bottom: 6px;

              .rank-index-dot {
                width: 8px; /* 调整圆点大小 */
                height: 8px; /* 调整圆点大小 */
                margin-right: 8px;
              }

              .rank-label {
                font-size: 13px; /* 调整字体 */
                margin-right: 8px;
                display: flex; /* 使用 flex 布局 */
                justify-content: space-between; /* 子元素两端对齐 */
                align-items: center; /* 垂直居中 */
              }
              .rank-value {
                margin-left: 8px; /* 与文字保持距离 */
              }
            }

            .rank-line {
              height: 5px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .device-overview-card {
    padding: 15px;
    margin-bottom: 15px;

         .info-header h3 {
       font-size: 15px; /* 调整字体 */
     }

    .device-count {
      gap: 10px;

      .pie-chart {
        width: 120px; /* 放大 */
        height: 120px; /* 放大 */
      }

      .data-rank {
        .rank-item {
          margin-bottom: 10px;

          .rank-data {
            .rank-name {
              margin-bottom: 5px;

              .rank-index-dot {
                width: 6px; /* 调整圆点大小 */
                height: 6px; /* 调整圆点大小 */
                margin-right: 6px;
              }

              .rank-label {
                font-size: 12px; /* 调整字体 */
                margin-right: 6px;
                display: flex; /* 使用 flex 布局 */
                justify-content: space-between; /* 子元素两端对齐 */
                align-items: center; /* 垂直居中 */
              }
              .rank-value {
                margin-left: 6px; /* 与文字保持距离 */
              }
            }

            .rank-line {
              height: 4px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .device-overview-card {
    padding: 12px;
    margin-bottom: 10px;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

         .info-header h3 {
       font-size: 14px; /* 调整字体 */
     }

    .device-count {
      gap: 8px;
      
      &::-webkit-scrollbar {
        display: none;
      }
      
      scrollbar-width: none;
      -ms-overflow-style: none;

      .pie-chart {
        width: 100px; /* 放大 */
        height: 100px; /* 放大 */
      }

      .data-rank {
        .rank-item {
          margin-bottom: 8px;

          .rank-data {
            .rank-name {
              margin-bottom: 4px;

              .rank-index-dot {
                width: 5px; /* 调整圆点大小 */
                height: 5px; /* 调整圆点大小 */
                margin-right: 4px;
              }

              .rank-label {
                font-size: 11px; /* 调整字体 */
                margin-right: 4px;
                display: flex; /* 使用 flex 布局 */
                justify-content: space-between; /* 子元素两端对齐 */
                align-items: center; /* 垂直居中 */
              }
              .rank-value {
                margin-left: 4px; /* 与文字保持距离 */
              }
            }

            .rank-line {
              height: 3px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
