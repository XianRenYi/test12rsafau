<template>
  <div class="center-bottom-container">
    <v-chart :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { useChartStore } from '@/store/chartStore'
import { centerBottom } from '@/api/bigScreenIndex/bigScreen'

const chartStore = useChartStore()
const option = ref<any>({})
const xData = ref<string[]>([])

// 构建多图层 Option
const buildOption = (selectedCharts: any[]) => {
  // 计算所有系列数据中的最大值
  const allData = selectedCharts.flatMap(item => item.data)
  const maxDataValue = Math.max(...allData)
  
  // 设置Y轴最大值为数据最大值的2倍
  const yAxisMax = maxDataValue * 2
  
  // 计算每个分段的间隔，确保Y轴正好分为10段
  const yAxisInterval = yAxisMax / 10

  const series = selectedCharts.map(item => ({
    name: item.name,
    type: 'line',
    smooth: true,
    symbol: "none", // 不显示连接点
    symbolSize: 4,
    data: item.data,
    color: item.color,
    lineStyle: {
      width: 3,
      shadowBlur: 20,
    },
    itemStyle: {
      borderWidth: 1,
      borderColor: item.color
    },
    areaStyle: {
      opacity: 1,
    },
    emphasis: {
      itemStyle: {
        color: item.color
      }
    }
  }))

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: 'rgba(0,0,0,.6)',
      borderColor: 'rgba(147, 235, 248, .8)',
      textStyle: { color: '#FFF' }
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "2%",
      top: "17%",
      containLabel: true,
    },
    
    xAxis: {
      type: 'category',
      data: xData.value,
      axisLine: {
        lineStyle: {
          color: '#7EB7FD'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#333',
          width: 1,
          type: 'dashed'
        }
      }
    },
    yAxis: {
      splitNumber: 10,
      type: 'value',
      min: 0, // 确保Y轴从0开始
      max: yAxisMax, // 设置Y轴最大值为数据最大值的2倍
      interval: yAxisInterval, // 设置Y轴间隔，确保正好分为10段
      nameTextStyle: {
        align: 'right',
        color: 'rgba(230, 247, 255, 0.50)',
      },
      axisLabel: {
        color: "rgba(230, 247, 255, 0.50)",
        fontSize: 22,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "rgba(230, 247, 255, 0.20)",
        },
      },
    },
    series
  }
}

// 初始化默认时间数据（最近10秒）
const initTimeLabels = () => {
  const now = new Date()
  const labels = []
  for (let i = -20; i <= 0; i++) {
    const time = new Date(now.getTime() + i * 1000)
    const label = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
    labels.push(label)
  }
  return labels
}

onMounted(() => {
  // 初始化时间轴数据
  xData.value = initTimeLabels()

  setInterval(() => {
    const now = new Date()
    const newTimeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    // centerBottom().then((res:any) => {
    //   if (res.code === 200) {
        
    //     if(res.data){
    //       // 更新时间轴数据
    //       xData.value = res.data[0].xdata

    //       // 重新构建图表配置
    //       option.value = buildOption(res.data)
    //     }
    //   }
    // })
  }, 1000)
})

// 监听 selectedCharts 变化并更新图表
watch(
  () => chartStore.selectedCharts,
  (newVal) => {
    option.value = buildOption(newVal)
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
.center-bottom-container {
  width: 100%;
  height: 100%;
}
</style>