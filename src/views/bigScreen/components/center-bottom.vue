<template>
  <div class="center-bottom-container">
    <v-chart :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { graphic } from 'echarts'
import { useChartStore } from '@/store/chartStore'
import { centerBottom } from '@/api/bigScreenIndex/bigScreen'
import { useDeviceMapStore } from "@/store/deviceMapStore"

const deviceMapStore = useDeviceMapStore()
const chartStore = useChartStore()
const option = ref<any>({})
const xData = ref<string[]>([])

// 动态生成时间标签
const generateTimeLabels = () => {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

// 构建图表配置
const buildOption = (selectedCharts: any[]) => {
  if (selectedCharts.length === 0) return {}
  
  const allData = selectedCharts.flatMap(item => item.data)
  const maxDataValue = Math.max(...allData)
  const yAxisMax = Math.round(maxDataValue * 2 * 0.6)
  const yAxisInterval = yAxisMax / 10

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,.6)',
      borderColor: 'rgba(147, 235, 248, .8)',
      textStyle: { color: '#FFF' },
      axisPointer: { animation: false }
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "20%",
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xData.value,
      splitLine: {
        show: false,
        lineStyle: {
          color: '#333',
          width: 1,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      splitNumber: 10,
      boundaryGap: [0, '100%'],
      type: 'value',
      min: 0,
      max: yAxisMax,
      interval: yAxisInterval,
      splitLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    series: selectedCharts.map(item => ({
      name: item.name,
      type: 'line',
      symbol: "none",
      data: item.data,
      color: item.color,
      showSymbol: false,
      symbolSize: 4,
      lineStyle: {
        width: 1.5
      },
      areaStyle: {
        opacity: 0.2,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: item.color },
          { offset: 1, color: 'transparent' }
        ])
      }
    }))
  }
}

// 数据更新函数
const updateData = () => {
  const timeLabel = generateTimeLabels()
  if (xData.value.length === 0 || xData.value[xData.value.length - 1] !== timeLabel) {
    xData.value = [...xData.value, timeLabel]
  }

  // 更新图表配置
  option.value = buildOption(chartStore.selectedCharts)
}

onMounted(() => {
  // 初始数据加载
  updateData()
  
  // 每秒更新数据
  setInterval(updateData, 1000)
})

// 监听 selectedCharts 变化
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