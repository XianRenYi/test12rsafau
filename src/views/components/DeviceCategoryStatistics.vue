<template>
  <div class="device-overview-card device-overview-compact info-card-compact">
    <div class="info-header">
      <h3>设备分类</h3>
    </div>
    <div class="device-count">
      <div id="deviceTypeChart" class="pie-chart"></div>
      <div class="data-rank">
        <div v-for="(item, index) in deviceTypeList" :key="index" class="rank-item">
          <div class="rank-data">
            <div class="rank-name">
              <div class="rank-index">{{ index + 1 }}</div>
              <div class="rank-label">{{ item.label }}</div>
              <div>{{ item.value }}</div>
            </div>
            <div class="rank-line">
              <div
                class="process-line orange"
                :class="`color${index}`"
                :style="{
                  width: deviceMax ? (item.value / deviceMax) * 100 + '%' : '0%',
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
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const deviceMax = ref(0)
const deviceTypeList = ref([
  { label: '液位计', value: 0 },
  { label: '流量计', value: 0 },
  { label: '雨量计', value: 0 },
  { label: '水质仪', value: 0 },
  { label: '监测站', value: 0 },
])

let deviceChart = null

const getDeviceCategoryData = () => {
  deviceTypeList.value[0].value = Math.floor(Math.random() * 20) + 15 // 液位计 15-35台
  deviceTypeList.value[1].value = Math.floor(Math.random() * 30) + 25 // 流量计 25-55台
  deviceTypeList.value[2].value = Math.floor(Math.random() * 15) + 10 // 雨量计 10-25台
  deviceTypeList.value[3].value = Math.floor(Math.random() * 10) + 5  // 水质仪 5-15台
  deviceTypeList.value[4].value = Math.floor(Math.random() * 10) + 5  // 监测站 5-15台

  deviceMax.value = Math.max(...deviceTypeList.value.map((item) => item.value || 0))

  nextTick(() => {
    createDeviceTypeChart()
  })
}

const createDeviceTypeChart = () => {
  const chartDom = document.getElementById('deviceTypeChart')
  if (!chartDom) return

  if (deviceChart) {
    deviceChart.dispose()
  }

  deviceChart = echarts.init(chartDom)

  const color1 = [
    'rgba(11, 232, 252,1)',
    'rgba(255, 228, 120,1)',
    'rgba(255, 208, 21,1)',
    'rgba(255, 141, 21,1)',
    'rgba(255, 100, 21,1)',
  ]

  const color2 = [
    'rgba(11, 232, 252,0.25)',
    'rgba(255, 228, 120,0.25)',
    'rgba(255, 208, 21,0.25)',
    'rgba(255, 141, 21,0.25)',
    'rgba(255, 100, 21,0.25)',
  ]

  const data1 = []
  const data2 = []
  let total = 0

  deviceTypeList.value.forEach((item, index) => {
    data1.push({
      value: item.value,
      name: item.label,
      itemStyle: {
        normal: {
          color: color1[index],
          borderColor: '#000',
          borderWidth: 2,
        },
      },
    })
    data2.push({
      value: item.value,
      name: item.label,
      itemStyle: {
        normal: {
          color: color2[index],
        },
      },
    })
    total += item.value
  })

  const option = {
    title: {
      text: total,
      subtext: '总设备数',
      top: '30%',
      left: '48%',
      textAlign: 'center',
      textStyle: {
        color: '#0BE8FC',
        fontSize: 24,
      },
      subtextStyle: {
        fontSize: 16,
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#333',
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 4,
      borderColor: '#ddd',
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
            color: '#fff',
            opacity: 10,
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
  }

  deviceChart.setOption(option)
}

onMounted(() => {
  getDeviceCategoryData()
})
</script>

<style lang="scss" scoped>
.device-overview-card {
  background: #fff;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  .info-header {
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
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
      width: 156px;
      height: 156px;
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

            .rank-index {
              width: 20px;
              height: 20px;
              background: #0be8fc;
              color: #000;
              font-size: 12px;
              font-weight: bold;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 10px;
            }

            .rank-label {
              color: #333;
              margin-right: 10px;
              flex: 1;
            }

            div:last-child {
              color: #0be8fc;
              font-weight: bold;
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
                background: linear-gradient(90deg, rgba(255, 208, 21, 0.8), rgba(255, 208, 21, 1));
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
        font-size: 15px;
      }
    }

    .device-count {
      gap: 15px;

      .pie-chart {
        width: 130px;
        height: 130px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 12px;

          .rank-data {
            .rank-name {
              margin-bottom: 6px;

              .rank-index {
                width: 18px;
                height: 18px;
                font-size: 11px;
                margin-right: 8px;
              }

              .rank-label {
                font-size: 13px;
                margin-right: 8px;
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
       font-size: 15px;
     }

    .device-count {
      gap: 15px;

      .pie-chart {
        width: 130px;
        height: 130px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 12px;

          .rank-data {
            .rank-name {
              margin-bottom: 6px;

              .rank-index {
                width: 18px;
                height: 18px;
                font-size: 11px;
                margin-right: 8px;
              }

              .rank-label {
                font-size: 13px;
                margin-right: 8px;
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
       font-size: 14px;
     }

    .device-count {
      gap: 10px;

      .pie-chart {
        width: 100px;
        height: 100px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 10px;

          .rank-data {
            .rank-name {
              margin-bottom: 5px;

              .rank-index {
                width: 12px;
                height: 12px;
                font-size: 8px;
                margin-right: 6px;
              }

              .rank-label {
                font-size: 12px;
                margin-right: 6px;
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
       font-size: 13px;
     }

    .device-count {
      gap: 8px;
      
      &::-webkit-scrollbar {
        display: none;
      }
      
      scrollbar-width: none;
      -ms-overflow-style: none;

      .pie-chart {
        width: 80px;
        height: 80px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 8px;

          .rank-data {
            .rank-name {
              margin-bottom: 4px;

              .rank-index {
                width: 10px;
                height: 10px;
                font-size: 6px;
                margin-right: 4px;
              }

              .rank-label {
                font-size: 11px;
                margin-right: 4px;
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
