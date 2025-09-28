<template>
  <div class="container">
    <div v-for="(item, index) in filteredChartDataList" :key="index" class="chart-item">
      <div class="content-wrapper">
        <!-- 左侧 header-container -->
        <div class="header-container" :class="{ active: activeIndices.includes(index) }" @click="handleChartClick(index)">
        <span></span>
          
    
            <h1 style="cursor: pointer; margin: 0;padding-top: 15px;width: 74px;">{{ item.name }}</h1>
            <h1 id="showValue" style="cursor: pointer; margin: 0;padding-top: 15px;">{{ item.value }}</h1>
         
        </div>

        <!-- 右侧图表 -->
        <v-chart
          class="chart"
          :option="generateOption(item)"
          autoresize
          v-if="item.data && item.data.length > 0"
          :ref="(el) => setChartRef(el, index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import VChart from 'vue-echarts'
import {graphic} from "echarts"
import { useChartStore } from '@/store/chartStore'
import { fetchRightBottomData } from '@/api/bigScreenIndex/bigScreen'
import { useDeviceMapStore } from "@/store/deviceMapStore";
const deviceMapStore = useDeviceMapStore();
let deviceId: string = ''

const chartRefs = ref<Record<number, InstanceType<typeof VChart>>>({})
const setChartRef = (el: InstanceType<typeof VChart>, index: number) => {
  chartRefs.value[index] = el
}

const chartStore = useChartStore()

let randomColorCOunt=0;
// 生成随机颜色函数
const getRandomColor = () => {

  const r = Math.floor(Math.random() * 200 + 55)
  const g = Math.floor(Math.random() * 200 + 55)
  const b = Math.floor(Math.random() * 200 + 55)
  return `rgba(${r}, ${g}, ${b}, .7)`
}

interface ChartItem {
  deviceId: string
  name: string
  value: string
  data: number[]
  color: string
}

// 初始化为空数据
let chartDataList = ref<ChartItem[]>([])

const activeIndices = ref<number[]>([]) // 存储被点击的索引
const filteredChartDataList = ref<typeof chartDataList.value>([])
const currentTime = ref('')

// X轴时间标签
const xData = ref<string[]>([])

// 动态生成时间戳
const generateTimeLabels = () => {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}
// 构建每个图表的 option
const generateOption = (item: any) => {
  const minLength = Math.min(item.data.length, xData.value.length)
  const adjustedXData = xData.value.slice(-minLength)
  const adjustedData = item.data.slice(-minLength)

  const maxDataValue =   Math.max(... item.data) 
  
  // 设置Y轴最大值为数据最大值的2倍
  const yAxisMax = Math.round(maxDataValue * 2 * 0.6)
  
  // 计算每个分段的间隔，确保Y轴正好分为10段
  const yAxisInterval = yAxisMax / 10 


  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,.6)',
      borderColor: 'rgba(147, 235, 248, .8)',
      textStyle: {
        color: '#FFF',
      },
      axisPointer: {
      animation: false
    }
    },
    grid: {
      top: 20,
      bottom: 20,
      left: 40,
      right: 10,
    },
    xAxis: {
      type: 'category',
      data: adjustedXData,
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
      min: 0, // 确保Y轴从0开始
      max: yAxisMax, // 设置Y轴最大值为数据最大值的2倍
      interval: yAxisInterval, // 设置Y轴间隔，确保正好分为10段
      splitLine: {
        lineStyle: {
          color: '#333',
        },
      },
    },
    series: [
      {
        name: item.name,
        type: 'line',
        symbol: "none", //去除点
        data: adjustedData,
        color: item.color,
        showSymbol: false,
        symbolSize: 4,          // 减小数据点大小
  lineStyle: {
    width: 1.5            // 减细线条
  },
  areaStyle: {            // 可选：添加面积填充
    opacity: 0.2,
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: item.color },
      { offset: 1, color: 'transparent' }
    ])
  }
      },
    ],
  }
}

// 点击事件处理
const handleChartClick = (index: number) => {
  const item = chartDataList.value[index]
  chartStore.toggleChart(item)

  const i = activeIndices.value.indexOf(index)
  if (i > -1) {
    activeIndices.value.splice(i, 1)
  } else {
    activeIndices.value.push(index)
  }
}

// 监听 selectedDeviceId 变化，动态更新显示的图表
watch(
  [() => chartStore.selectedDeviceId, () => deviceMapStore.selectedDevice,], 
  ([newDeviceId, newParam]) => {
    chartDataList = ref<ChartItem[]>([])

    if (!newDeviceId) {
      chartStore.toggleChartClear()
      activeIndices.value=[]
      filteredChartDataList.value = chartDataList.value
    } else {
      chartStore.toggleChartClear()
      activeIndices.value=[]
      filteredChartDataList.value = chartDataList.value.filter(
        (item) => item.deviceId === newDeviceId
      )
    }

    if(newParam){
      deviceId = newParam.id
    }
  },
  { immediate: true, deep: true }
)

// 动态添加数据
onMounted(() => {
  let count = 0
 
  const addDataPoint = () => {
  fetchRightBottomData({deviceId:deviceId}).then((res: any) => {
    if (res.code !== 200 || !res.data || res.data.length === 0) return

   
    const timeLabel = generateTimeLabels()

    // 提取最新的10条数据（假设接口已按时间倒序返回）
    const latest10Items = res.data.slice(0, 100)

    // 去重：只保留时间不同的数据（避免重复更新）
    const uniqueItems = latest10Items.filter(
      (newItem: any) =>
        !chartDataList.value.some(
          (existing) =>
            existing.name === newItem.name &&
            existing.deviceId === String(newItem.deviceId) &&
            existing.value === newItem.value
        )
    )

    // 更新 x 轴时间标签（如果当前时间与上次不同才添加）
    if (xData.value[xData.value.length - 1] !== timeLabel) {
      xData.value = [...xData.value, timeLabel]
    }

    // 处理每一条新数据
    uniqueItems.forEach((item: any) => {
      const dataPoint = Number(item.value)

      const existingIndex = chartDataList.value.findIndex(
        (i) => i.name === item.name && i.deviceId === String(item.deviceId)
      )

      if (existingIndex > -1) {
        // 已有该设备/传感器，追加数据
        const existing = chartDataList.value[existingIndex]
        existing.data = [...existing.data, dataPoint]
        existing.value = String(dataPoint)
      } else {
        // 新设备/传感器，添加进列表
        chartDataList.value.push({
          deviceId: String(item.deviceId),
          name: item.name,
          value: String(item.value),
          data: [dataPoint],
          color:  getRandomColor(),
        })
      }
    })

    currentTime.value = timeLabel

    // 刷新图表
    Object.values(chartRefs.value).forEach((chart) => {
      if (chart) chart.resize()
    })
  })
}

  // 初始填充几个点
  addDataPoint()

  // 每秒继续添加新点
  setInterval(addDataPoint, 1000)
})
</script>

<style scoped>
.container {
  height: 70vh;
  padding: 20px;
  overflow-y: auto;
}
/* 隐藏滚动条 */
.container::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}
.chart-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}
.header-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  min-width: 100px;
}
.header-container h1 {
  font-weight: normal;
  transition: color 0.3s ease, font-weight 0.3s ease;
}
.header-container.active h1 {
  color: rgb(50, 197, 233);
}
.chart {
  width: 100%;
  height: 180px;
}
</style>