<template>
  <div class="tab-content">
    <el-card style="max-width: 480px; margin-bottom: 15px">
      <template #header>
        <div class="card-header">
          <span>温度监测</span>
        </div>
      </template>
      <div ref="tempChartRef" style="width: 100%; height: 200px"></div>
    </el-card>

    <el-card style="max-width: 480px; margin-bottom: 15px">
      <template #header>
        <div class="card-header">
          <span>湿度监测</span>
        </div>
      </template>
      <div ref="humidityChartRef" style="width: 100%; height: 200px"></div>
    </el-card>

    <el-card style="max-width: 480px; margin-bottom: 15px">
      <template #header>
        <div class="card-header">
          <span>PM1 监测</span>
        </div>
      </template>
      <div ref="pm1ChartRef" style="width: 100%; height: 200px"></div>
    </el-card>
    
    <el-card style="max-width: 480px; margin-bottom: 15px">
      <template #header>
        <div class="card-header">
          <span>PM2.5 监测</span>
        </div>
      </template>
      <div ref="pm25ChartRef" style="width: 100%; height: 200px"></div>
    </el-card>
    
    <el-card style="max-width: 480px; margin-bottom: 15px">
      <template #header>
        <div class="card-header">
          <span>PM10 监测</span>
        </div>
      </template>
      <div ref="pm10ChartRef" style="width: 100%; height: 200px"></div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { ElCard } from "element-plus";
// 假设引入ECharts用于图表展示
// import * as echarts from 'echarts';

export default {
  components: {
    ElCard,
  },
  setup() {
    // 图表容器引用
    const tempChartRef = ref(null);
    const humidityChartRef = ref(null);
    const pm1ChartRef = ref(null);
    const pm25ChartRef = ref(null);
    const pm10ChartRef = ref(null);

    onMounted(() => {
      // 初始化图表
      // initCharts();
      console.log("实时数据图表容器已准备就绪");
    });

    // 图表初始化函数
    // const initCharts = () => {
    //   // 温度图表
    //   const tempChart = echarts.init(tempChartRef.value);
    //   // 湿度图表
    //   const humidityChart = echarts.init(humidityChartRef.value);
    //   // PM1图表
    //   const pm1Chart = echarts.init(pm1ChartRef.value);
    //   // PM2.5图表
    //   const pm25Chart = echarts.init(pm25ChartRef.value);
    //   // PM10图表
    //   const pm10Chart = echarts.init(pm10ChartRef.value);
      
    //   // 这里可以添加图表配置和数据
    // };

    return {
      tempChartRef,
      humidityChartRef,
      pm1ChartRef,
      pm25ChartRef,
      pm10ChartRef,
    };
  },
};
</script>

<style lang="scss" scoped>
// 引入主样式变量
// 引入主样式变量
$primary: #0b2453;
$primary-light: rgba($primary, 0.1);
$primary-dark: rgba($primary, 0.9);
$secondary: #6b7280;
$background: #f9fafb;
$card-bg: #ffffff;
$text-primary: #1f2937;
$text-secondary: #4b5563;
$border-color: #e5e7eb;

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
  padding: 12px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

// 卡片样式优化
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid $border-color;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: $card-bg;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .el-card__header {
    padding: 12px 16px;
    background-color: $primary-light;
    border-bottom: 1px solid $border-color;
    color: $primary;
    font-weight: 500;
  }

  .el-card__body {
    padding: 16px;
    color: $text-secondary;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
