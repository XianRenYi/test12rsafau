<template>
    <div style="padding-left:20px;">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
     
        <el-form-item label="时间范围">
          <el-date-picker v-model="daterangeTime"  style="width: 240px" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search"  @click="handleQuery">查询</el-button>
          <el-button icon="Refresh"  @click="resetQuery">重置</el-button>
          <!-- <el-button type="success" @click="forceInitCharts">强制初始化图表</el-button> -->
        </el-form-item>
      </el-form>


      <!-- 调试信息 -->
      <div v-if="staticList.length === 0" style="text-align: center; padding: 20px; color: #999;">
        暂无统计数据，staticList 长度: {{ staticList.length }}
      </div>
      
      <div v-for="(item, index) in staticList" :key="index" style="margin-bottom: 30px">
        <el-card
          shadow="hover"
          :body-style="{ padding: '10px 0px', overflow: 'auto' }"
          v-loading="loading"
        >
          <template #header>
            <div>{{ getDisplayName(item.id || item.name) }}{{ item.datatype?.unit ? `（${item.datatype.unit}）` : '' }}</div>
          </template>
          <div 
            :ref="el => setStatisticMapRef(el, index)" 
            :id="`chart-container-${index}`"
            :style="`height: ${CHART_HEIGHT}px; width: 100%; border: 1px solid #ddd; background-color: #f9f9f9;`"
          >
            图表容器 {{ index }}
          </div>
        </el-card>
      </div>

  
    </div>
  </template>
  
  <script setup name="DeviceLog">
  import { ref, reactive, watch, onMounted, getCurrentInstance, nextTick } from 'vue';
  import { useDict } from '@/utils/dict';
  import { listEventLog } from '@/api/iot/eventLog';

import { listHistory } from "@/api/iot/deviceLog";
import * as echarts from "echarts";


  const props = defineProps({
    device: {
      type: Object,
      default: null
    }
  });
  
  const { proxy } = getCurrentInstance();

  // 物模型
  const thingsModel = ref({});
  // 遮罩层
  const loading = ref(true);
  // 显示搜索条件
  const showSearch = ref(true);



  const queryFormRef = ref();
  // 状态定义

const deviceInfo = ref({});
const staticList = ref([]);
const chart = ref([]);
const queryParams = ref({
  serialNumber: null,
  identity: "",
  slaveId: undefined,
  beginTime: "",
  endTime: "",
  productId: "",
});
// 默认设置为当天
const today = new Date().toISOString().split('T')[0];
const daterangeTime = ref([today, today]);

// 图表固定宽度配置
const CHART_FIXED_WIDTH = 800;
const CHART_HEIGHT = 300;
const arrayData = ref([]);
const slaveList = ref([]);
const isSubDev = ref(false);
const statisticMap = ref([]);

// 设置template ref
function setStatisticMapRef(el, index) {
  if (el) {
    statisticMap.value[index] = el;
    console.log(`设置 statisticMap[${index}]:`, el);
  } else {
    console.warn(`statisticMap[${index}] 元素为空`);
  }
}
const queryForm = ref(null);

// 辅助函数：获取显示名称
function getDisplayName(key) {
  const nameMap = {
    'hum': '湿度',
    'temp': '温度', 
    'temperature': '温度',
    'humidity': '湿度',
    'pressure': '压力',
    'voltage': '电压',
    'current': '电流',
    'power': '功率'
  };
  return nameMap[key] || key;
}

// 辅助函数：获取单位
function getUnit(key) {
  const unitMap = {
    'hum': '%RH',
    'humidity': '%RH',
    'temp': '°C',
    'temperature': '°C',
    'pressure': 'Pa',
    'voltage': 'V',
    'current': 'A',
    'power': 'W'
  };
  return unitMap[key] || '';
}

// 监听device属性变化
watch(
  () => props.device,
  (newVal) => {
    if (newVal) {
      deviceInfo.value = newVal;
      if (deviceInfo.value.deviceId !== 0) {
        isSubDev.value =
          deviceInfo.value.subDeviceList && deviceInfo.value.subDeviceList.length > 0;
        queryParams.value.slaveId = deviceInfo.value.slaveId;
        queryParams.value.serialNumber = deviceInfo.value.serialNumber;
        slaveList.value = newVal.subDeviceList || [];

        // 处理统计列表
        console.log('设备信息:', deviceInfo.value);
        console.log('是否为子设备:', isSubDev.value);
        
        if (isSubDev.value) {
          staticList.value =
            deviceInfo.value.cacheThingsModel?.properties?.filter(
              (item) => item.tempSlaveId === queryParams.value.slaveId
            ) || [];
        } else {
          // 优先使用设备的staticList，如果没有则使用物模型数据
          staticList.value = deviceInfo.value.staticList || 
                              deviceInfo.value.cacheThingsModel?.properties || [];
          
          // 如果还是没有数据，尝试从其他字段获取
          if (staticList.value.length === 0 && deviceInfo.value.product) {
            staticList.value = deviceInfo.value.product.cacheThingsModel?.properties || [];
          }
          
          // 排序（如果有order字段）
          if (staticList.value.length > 0 && staticList.value[0].order !== undefined) {
            staticList.value.sort((a, b) => (b.order || 0) - (a.order || 0));
          }
        }
        
        console.log('处理后的staticList:', staticList.value);

        // 页面初始化，自动执行查询
        nextTick(() => {
          setTimeout(() => {
            console.log('页面初始化，自动执行查询');
            handleQuery();
          }, 300);
        });
      }
    }
  },
  { immediate: true }
);

  
  onMounted(() => {
    queryParams.serialNumber = props.device.serialNumber;

  });
  

  
// 方法定义
function getTime() {
  const date = new Date();
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getListHistory() {
  loading.value = true;

  // 设置序列号，处理从机情况
  queryParams.value.serialNumber = queryParams.value.slaveId
    ? `${deviceInfo.value.serialNumber}_${queryParams.value.slaveId}`
    : deviceInfo.value.serialNumber;

  // 设置时间范围
  if (daterangeTime.value && daterangeTime.value.length === 2 && daterangeTime.value[0] && daterangeTime.value[1]) {
    queryParams.value.beginTime = daterangeTime.value[0];
    queryParams.value.endTime = `${daterangeTime.value[1]} 23:59:59`;
    console.log('使用选择的时间范围:', queryParams.value.beginTime, '到', queryParams.value.endTime);
  } else {
    // 如果没有选择时间范围，设置为当天
    const today = new Date().toISOString().split('T')[0];
    queryParams.value.beginTime = today;
    queryParams.value.endTime = `${today} 23:59:59`;
    console.log('使用默认时间范围（当天）:', queryParams.value.beginTime, '到', queryParams.value.endTime);
  }

  queryParams.value.productId = deviceInfo.value.productId;

  console.log('查询参数:', queryParams.value);

  listHistory(queryParams.value)
    .then((res) => {
      console.log('API返回数据:', res.data);
      
      // 根据返回的数据动态创建staticList和图表
      if (res.data && Object.keys(res.data).length > 0) {
        // 检查并优化staticList
        if (staticList.value.length === 0) {
          console.log('根据API数据创建staticList');
          staticList.value = Object.keys(res.data).map((key, index) => ({
            id: key,
            name: getDisplayName(key),
            datatype: { unit: getUnit(key) },
            order: index
          }));
          console.log('创建的staticList:', staticList.value);
        } else {
          // 如果已有staticList，检查并补充缺失的数据项
          Object.keys(res.data).forEach((key) => {
            const exists = staticList.value.find(item => item.id === key);
            if (!exists) {
              staticList.value.push({
                id: key,
                name: getDisplayName(key),
                datatype: { unit: getUnit(key) },
                order: staticList.value.length
              });
            }
          });
          console.log('补充后的staticList:', staticList.value);
        }
        
        // 等待DOM更新后创建图表并填充数据
        nextTick(() => {
          console.log('开始根据数据创建图表');
          createChartsWithData(res.data);
        });
      } else {
        console.warn('API返回数据为空');
      }
      
      loading.value = false;
    })
    .catch((error) => {
      console.error('获取历史数据失败:', error);
      loading.value = false;
    });
}

// 更新图表数据的独立函数
function updateChartData(data) {
  console.log('=== 开始更新图表数据 ===');
  console.log('返回的数据:', data);
  console.log('当前 staticList:', staticList.value);
  console.log('当前 chart 实例数量:', chart.value.length);

  let updatedCount = 0;
  
  for (const key in data) {
    console.log(`处理数据键: ${key}`);
    
    for (let i = 0; i < staticList.value.length; i++) {
      if (key === staticList.value[i].id) {
        console.log(`匹配到图表 ${i}: ${staticList.value[i].name}`);
        
        // 转换数据格式
        const dataList = data[key].map((item) => [item.time, item.value]);
        console.log(`转换后的数据:`, dataList);

        // 更新图表数据
        if (chart.value[i]) {
          try {
            chart.value[i].setOption({
              series: [{
                data: dataList
              }]
            });
            console.log(`图表 ${i} 数据更新成功`);
            updatedCount++;
            
            // 强制重绘
            setTimeout(() => {
              chart.value[i].resize();
            }, 50);
            
          } catch (error) {
            console.error(`更新图表 ${i} 失败:`, error);
          }
        } else {
          console.warn(`图表 ${i} 未初始化，无法更新数据`);
        }
        break; // 找到匹配项后跳出内层循环
      }
    }
  }
  
  console.log(`成功更新了 ${updatedCount} 个图表的数据`);
  
  // 如果没有更新任何图表，可能是数据格式问题
  if (updatedCount === 0) {
    console.warn('没有更新任何图表，可能的原因:');
    console.warn('1. 数据键与 staticList.id 不匹配');
    console.warn('2. 图表未正确初始化');
    console.warn('3. 数据格式不正确');
  }
}

// 根据数据创建图表并填充数据
function createChartsWithData(data) {
  const color = [
    "#1890FF",
    "#91CB74", 
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3CA272",
    "#FC8452",
    "#9A60B4",
    "#ea7ccc",
  ];

  console.log('=== 根据数据创建图表 ===');
  console.log('数据:', data);
  console.log('staticList:', staticList.value);

  // 清空现有图表
  chart.value.forEach((instance, idx) => {
    if (instance) {
      console.log(`销毁图表 ${idx}`);
      instance.dispose();
    }
  });
  chart.value = [];

  // 等待DOM更新
  setTimeout(() => {
    staticList.value.forEach((item, i) => {
      console.log(`创建图表 ${i}: ${item.name}`);
      
      const container = statisticMap.value[i];
      if (container) {
        console.log(`找到容器 ${i}:`, container);
        
        // 设置固定宽度
        container.style.width = `${CHART_FIXED_WIDTH}px`;
        container.style.height = `${CHART_HEIGHT}px`;
        container.style.minHeight = `${CHART_HEIGHT}px`;
        
        try {
          // 初始化图表，指定固定尺寸
          const chartInstance = echarts.init(container, null, {
            width: CHART_FIXED_WIDTH,
            height: CHART_HEIGHT
          });
          chart.value[i] = chartInstance;
          console.log(`图表 ${i} 初始化成功`);

          // 准备数据
          let chartData = [];
          if (data[item.id]) {
            chartData = data[item.id].map((dataItem) => [dataItem.time, dataItem.value]);
            console.log(`图表 ${i} 的数据:`, chartData);
          }

          // 设置图表配置
          const displayName = getDisplayName(item.id || item.name);
          const unit = item.datatype?.unit || getUnit(item.id || item.name) || "无";
          const option = {
            backgroundColor: '#fff',
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: 'cross'
              }
            },
            title: {
              left: "center",
              text: `${displayName}统计${unit !== '无' ? ` （${unit}）` : ''}`,
              textStyle: {
                fontSize: 14
              }
            },
            grid: {
              top: "80px",
              left: "60px",
              right: "40px",
              bottom: "80px",
              containLabel: true,
            },
            toolbox: {
              right: 20,
              feature: {
                dataZoom: {
                  yAxisIndex: "none",
                },
                restore: {},
                saveAsImage: {},
              },
            },
            xAxis: {
              type: "time",
              boundaryGap: false
            },
            yAxis: {
              type: "value",
              scale: true,
              axisLabel: {
                formatter: (value) => value.toFixed(2),
              },
            },
            dataZoom: [
              {
                type: "inside",
                start: 0,
                end: 100,
              },
              {
                start: 0,
                end: 100,
                height: 30,
                bottom: 30
              },
            ],
            series: [
              {
                name: item.name,
                type: "line",
                symbol: "circle",
                symbolSize: 4,
                sampling: "lttb",
                itemStyle: {
                  color: i < color.length ? color[i] : color[i % color.length],
                },
                areaStyle: {
                  opacity: 0.3
                },
                data: chartData,
              },
            ],
          };

          chartInstance.setOption(option);
          
          // 强制重绘到固定尺寸
          setTimeout(() => {
            chartInstance.resize({
              width: CHART_FIXED_WIDTH,
              height: CHART_HEIGHT
            });
          }, 100);

          console.log(`图表 ${i} 创建完成，包含 ${chartData.length} 个数据点，固定尺寸: ${CHART_FIXED_WIDTH}x${CHART_HEIGHT}px`);
          
        } catch (error) {
          console.error(`创建图表 ${i} 失败:`, error);
        }
      } else {
        console.error(`容器 ${i} 不存在`);
      }
    });
  }, 100);
}

function getStatistic() {
  const color = [
    "#1890FF",
    "#91CB74",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3CA272",
    "#FC8452",
    "#9A60B4",
    "#ea7ccc",
  ];

  console.log('=== 开始初始化图表 ===');
  console.log('staticList长度:', staticList.value.length);
  console.log('staticList内容:', staticList.value);
  console.log('statisticMap数组长度:', statisticMap.value.length);
  console.log('statisticMap内容:', statisticMap.value);

  if (staticList.value.length === 0) {
    console.warn('staticList 为空，无法创建图表');
    return;
  }

  // 清空现有图表
  chart.value.forEach((instance, idx) => {
    if (instance) {
      console.log(`销毁图表 ${idx}`);
      instance.dispose();
    }
  });
  chart.value = [];

  // 多次尝试初始化，确保 DOM 元素已准备好
  const tryInit = (attempt = 0) => {
    console.log(`尝试初始化图表，第 ${attempt + 1} 次`);
    
    let successCount = 0;
    
    staticList.value.forEach((item, i) => {
      console.log(`处理图表 ${i}: ${item.name}`);
      
      const container = statisticMap.value[i];
      if (container) {
        console.log(`找到容器 ${i}:`, container);
        
        // 设置固定宽度
        container.style.width = `${CHART_FIXED_WIDTH}px`;
        container.style.height = `${CHART_HEIGHT}px`;
        container.style.minHeight = `${CHART_HEIGHT}px`;
        
        try {
          // 初始化图表，指定固定尺寸
          const chartInstance = echarts.init(container, null, {
            width: CHART_FIXED_WIDTH,
            height: CHART_HEIGHT
          });
          chart.value[i] = chartInstance;
          console.log(`图表 ${i} 初始化成功:`, chartInstance);

          // 设置图表配置
          const displayName = getDisplayName(item.id || item.name);
          const unit = item.datatype?.unit || getUnit(item.id || item.name) || "无";
          const option = {
            backgroundColor: '#fff',
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: 'cross'
              }
            },
            title: {
              left: "center",
              text: `${displayName}统计${unit !== '无' ? ` （${unit}）` : ''}`,
              textStyle: {
                fontSize: 14
              }
            },
            grid: {
              top: "80px",
              left: "60px",
              right: "40px",
              bottom: "80px",
              containLabel: true,
            },
            toolbox: {
              right: 20,
              feature: {
                dataZoom: {
                  yAxisIndex: "none",
                },
                restore: {},
                saveAsImage: {},
              },
            },
            xAxis: {
              type: "time",
              boundaryGap: false
            },
            yAxis: {
              type: "value",
              scale: true,
              axisLabel: {
                formatter: (value) => value.toFixed(2),
              },
            },
            dataZoom: [
              {
                type: "inside",
                start: 0,
                end: 100,
              },
              {
                start: 0,
                end: 100,
                height: 30,
                bottom: 30
              },
            ],
            series: [
              {
                name: item.name,
                type: "line",
                symbol: "circle",
                symbolSize: 4,
                sampling: "lttb",
                itemStyle: {
                  color: i < color.length ? color[i] : color[i % color.length],
                },
                areaStyle: {
                  opacity: 0.3
                },
                data: [
                  // 添加一些测试数据
                  [new Date().getTime() - 3600000, Math.random() * 100],
                  [new Date().getTime() - 1800000, Math.random() * 100],
                  [new Date().getTime(), Math.random() * 100]
                ],
              },
            ],
          };

          chartInstance.setOption(option);
          
          // 强制重绘到固定尺寸
          setTimeout(() => {
            chartInstance.resize({
              width: CHART_FIXED_WIDTH,
              height: CHART_HEIGHT
            });
          }, 100);

          successCount++;
          
        } catch (error) {
          console.error(`初始化图表 ${i} 失败:`, error);
        }
      } else {
        console.error(`容器 ${i} 不存在，statisticMap[${i}] =`, container);
      }
    });
    
    console.log(`成功初始化 ${successCount}/${staticList.value.length} 个图表，固定尺寸: ${CHART_FIXED_WIDTH}x${CHART_HEIGHT}px`);
    
    // 如果没有成功初始化任何图表，且尝试次数少于3次，则重试
    if (successCount === 0 && attempt < 2) {
      setTimeout(() => tryInit(attempt + 1), 500);
    }
  };

  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    setTimeout(() => tryInit(), 100);
  });
}

  /** 搜索按钮操作 */
  function handleQuery() {
    console.log('=== 点击查询按钮 ===');
    console.log('当前时间范围:', daterangeTime.value);
    console.log('当前staticList:', staticList.value);
    
    queryParams.value.pageNum = 1;
    
    // 直接获取数据，获取到数据后再渲染图表
    getListHistory();
  }
  
  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm('queryFormRef');
    // 重置为当天日期
    const today = new Date().toISOString().split('T')[0];
    daterangeTime.value = [today, today];
    handleQuery();
  }

  /** 强制初始化图表 */
  function forceInitCharts() {
    console.log('=== 强制初始化图表 ===');
    console.log('当前 staticList:', staticList.value);
    console.log('当前 props.device:', props.device);
    
    // 如果 staticList 为空，尝试重新获取
    if (staticList.value.length === 0 && props.device) {
      console.log('重新设置 staticList');
      if (isSubDev.value) {
        staticList.value = props.device.cacheThingsModel?.properties?.filter(
          (item) => item.tempSlaveId === queryParams.value.slaveId
        ) || [];
      } else {
        staticList.value = props.device.staticList || [];
        staticList.value.sort((a, b) => b.order - a.order);
      }
      console.log('重新设置后的 staticList:', staticList.value);
    }
    
    // 如果还是没有数据，创建测试数据并模拟API返回数据
    if (staticList.value.length === 0) {
      console.log('创建测试数据');
      staticList.value = [
        {
          id: 'test1',
          name: '测试图表1',
          datatype: { unit: '°C' }
        },
        {
          id: 'test2', 
          name: '测试图表2',
          datatype: { unit: '%' }
        }
      ];
      
      // 创建测试数据
      const mockData = {
        'test1': [
          { time: new Date().getTime() - 3600000, value: Math.random() * 100 },
          { time: new Date().getTime() - 1800000, value: Math.random() * 100 },
          { time: new Date().getTime(), value: Math.random() * 100 }
        ],
        'test2': [
          { time: new Date().getTime() - 3600000, value: Math.random() * 50 },
          { time: new Date().getTime() - 1800000, value: Math.random() * 50 },
          { time: new Date().getTime(), value: Math.random() * 50 }
        ]
      };
      
      nextTick(() => {
        createChartsWithData(mockData);
      });
    } else {
      // 如果有 staticList，执行正常查询流程
      handleQuery();
    }
  }
  

  </script>