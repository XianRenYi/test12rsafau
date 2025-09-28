<template>
  <div class="scale-container">
    <div
      class="tableCom el-table--enable-row-hover el-table--medium"
      style="overflow: auto; height: 614px; max-height: 614px; font-size: 12px"
    >
      <div class="data-center-history-wrap">
        <div class="device-wrap">
          <el-form
            :model="devQueryParams"
            ref="devQueryForm"
            :inline="true"
            label-width="68px"
          >
            <el-form-item
              :label="'产品名称'"
              prop="productName"
            >
              <el-select
                style="width: 170px"
                v-model="devQueryParams.productName"
                :placeholder="'请选择产品名称'"
                filterable
                clearable
                @change="handleProductNameChange"
              >
                <el-option
                  v-for="(item, index) in productNameList"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="'产品型号'"
              prop="productId"
            >
              <el-select
                style="width: 170px"
                v-model="devQueryParams.productId"
                :placeholder="'请选择产品型号'"
                filterable
                clearable
                @change="handleProductIdChange"
              >
                <el-option
                  v-for="(item, index) in filteredProductIdList"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="'序列号'"
              prop="deviceId"
              :error="formErrors.deviceId"
            >
              <el-select
                style="width: 170px"
                v-model="devQueryParams.deviceId"
                :placeholder="'请选择设备序列号'"
                filterable
                clearable
                @change="handleDevDeviceChange"
              >
                <el-option
                  v-for="(item, index) in filteredDeviceList"
                  :key="index"
                  :label="item.deviceName +  '(' + item.productId + ')' +  '(' + item.serialNumber + ')' "
                  :value="item.deviceId"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="'变量名称'"
              prop="identifiers"
              :error="formErrors.identifiers"
            >
              <el-select
                style="width: 170px"
                v-model="devQueryParams.identifiers"
                :placeholder="'请选择变量名称'"
                filterable
                multiple
                collapse-tags
              >
                <el-option
                  v-for="(item, index) in devIdentifierList"
                  :key="index"
                  :label="item.modelName"
                  :value="item.identifier"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="'时间'" prop="dayDaterange">
              <el-date-picker
                style="width: 300px"
                v-model="devQueryParams.dayDaterange"
                type="datetimerange"
                :shortcuts="shortcuts"
                :start-placeholder="'开始时间'"
                :end-placeholder="'结束时间'"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleDevQuery"
                >搜索</el-button
              >
              <el-button icon="Refresh" @click="handleDevResetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row>
            <el-col :span="24" style="margin-bottom: 15px">
              <el-card v-loading="loading" shadow="never">
                <!-- 标题、切换按钮和导出按钮同一行 -->
                <div class="chart-header">
                  <div v-if="showChart">
                    <span class="chart-title"></span>
                    <span
                      style="margin-left: 10px; color: #f56c6c; font-size: 14px"
                    ></span>
                  </div>

                  <div v-if="!showChart">
                    <span class="chart-title"></span>
                    <span
                      style="margin-left: 10px; color: #f56c6c; font-size: 14px"
                    ></span>
                  </div>

                                    <div class="chart-actions">
                    <el-button
                      v-if="showChart"
                      type="primary"
                      icon="Grid"
                      @click="toggleChartMode"
                      class="toggle-chart-mode-btn"
                    >
                      {{ isSingleChartMode ? "多图表模式" : "单图表模式" }}
                    </el-button>
                    <el-button
                      type="primary"
                      icon="List"
                      @click="toggleChartTable"
                      class="toggle-btn"
                    >
                      {{ showChart ? "切换列表" : "切换图表" }}
                    </el-button>
                    <el-button
                      type="primary"
                      icon="Download"
                      @click="exportWithLabels('设备趋势图')"
                      class="export-btn"
                    >
                      导出图片
                    </el-button>
                    <el-button
                      type="success"
                      icon="Document"
                      @click="exportToExcel"
                      class="export-excel-btn"
                    >
                      导出Excel
                    </el-button>
                  </div>
                </div>

                <!-- 搜索加载遮盖层 - 带过渡效果 -->
                <div
                  v-if="isSearchLoading"
                  class="search-loading-mask"
                  :class="{ 'fade-out': !isSearchLoading }"
                >
                  <div class="loading-content">
                    <el-loading-spinner></el-loading-spinner>
                    <p>查询中，请稍候...</p>
                  </div>
                </div>

                <!-- 可导出的容器：包含标签和图表 -->
                <div ref="exportContainer" class="export-container">
                  <!-- 自定义标签显示区域（每行最多2列） -->
                  <div v-if="showTapLabels" class="custom-tap-labels">
                    <div
                      v-for="(identifier, index) in devQueryParams.identifiers"
                      :key="index"
                      class="tap-label"
                    >
                      <span class="label-name">{{ getIdentifierName(identifier) }}</span>
                      <span class="label-stat"
                        >平均值:
                        <span class="label-stat_value">{{
                          getIdentifierStats(identifier, "avg").toFixed(2)
                        }}</span>
                      </span>
                      <span class="label-stat"
                        >最大值:
                        <span class="label-stat_value">{{
                          getIdentifierStats(identifier, "max")
                        }}</span>
                      </span>
                      <span class="label-stat"
                        >最小值:
                        <span class="label-stat_value">
                          {{ getIdentifierStats(identifier, "min") }}</span
                        ></span
                      >
                    </div>
                  </div>

                  <!-- 图表容器 - 根据showChart显示 -->
                  <div v-if="showChart">
                    <!-- 单图表模式 -->
                    <div v-if="isSingleChartMode">
                      <div
                        v-show="devDatas.length !== 0"
                        ref="devLineChart"
                        style="width: 100%; height: 270px; background: #fff"
                      ></div>
                      <el-empty
                        v-if="devDatas.length === 0"
                        style="height: 380px"
                        :description="'暂无数据'"
                      ></el-empty>
                    </div>
                    
                    <!-- 多图表模式（类似historyRealTime） -->
                    <div v-else>
                      <div v-for="(identifier, index) in devQueryParams.identifiers" :key="index" class="chart-container">
                        <div :ref="el => setChartRef(el, identifier)" style="width: 100%; height: 270px; background: #fff"></div>
                      </div>
                      <el-empty v-if="devDatas.length === 0" style="height: 380px" :description="'暂无数据'"></el-empty>
                    </div>
                  </div>

                  <!-- 列表 - 根据!showChart显示 -->
                  <div v-if="!showChart">
                    <el-empty
                      v-if="devDatas.length === 0"
                      style="height: 380px"
                      :description="'暂无数据'"
                    ></el-empty>
                    <el-table
                      v-show="devTotal > 0"
                      style="
                        width: 100%;
                        height: 380px;
                        margin-top: 50px;
                        padding-right: 50px;
                        padding-left: 50px;
                      "
                      :data="devTableList"
                      :border="false"
                    >
                      <el-table-column :label="'更新时间'" prop="time" width="200" />
                      <el-table-column
                        v-for="item in devTableHeaderTemp"
                        :key="item.value"
                        :label="item.name"
                        :prop="item.value"
                      />
                    </el-table>

                    <pagination
                      v-show="devTotal > 0"
                      :autoScroll="false"
                      :total="devTotal"
                      v-model:page="devPageNum"
                      v-model:limit="devPageSize"
                      @pagination="getDevTableList"
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onUnmounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { debounce } from "lodash-es";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { listDeviceShort, listThingsModel } from "@/api/iot/device.js";
import {
  getDataCenterDeviceHistory,
  getDataCenterSceneHistory,
} from "@/api/data/center.js";
import * as echarts from "echarts";

const router = useRouter();
const route = useRoute();

// 状态管理 - 存储每个变量的统计数据
const devStats = ref({});
// 导出容器引用
const exportContainer = ref(null);
// 控制tap标签显示
const showTapLabels = ref(false);
// 控制图表/列表显示状态，默认显示图表
const showChart = ref(true);
// 控制图表显示模式：true为单图表模式，false为多图表模式（类似historyRealTime）
const isSingleChartMode = ref(true);
// 控制搜索加载遮盖的显示状态 - 带过渡效果
const isSearchLoading = ref(false);
// 跟踪加载任务数量 - 确保所有内容渲染完成
const loadingTasks = ref(0);
// 标记图表是否已渲染完成
const chartRendered = ref(false);
// 标记列表是否已渲染完成
const tableRendered = ref(false);
// 表单验证错误信息
const formErrors = ref({
  deviceId: "",
  identifiers: "",
});

// 状态管理变量声明
const activeTab = ref("device");
const devDeviceList = ref([]);
const productNameList = ref([]);
const filteredProductIdList = ref([]);
const filteredDeviceList = ref([]);
const devIdentifierList = ref([]);
const sceneModelList = ref([]);
const sceneDeviceList = ref([]);
const sceneIdentifierList = ref([]);
const loading = ref(false);
const devDatas = ref([]);
const devTableComTemp = ref([]);
const devTableHeaderTemp = ref([]);
const devPageNum = ref(1);
const devPageSize = ref(10);
const devTotal = ref(0);
const sceneDatas = ref([]);
const sceneTableHeaderTemp = ref([]);
const scenePageNum = ref(1);
const scenePageSize = ref(10);
const sceneTotal = ref(0);

// 引用
const devQueryForm = ref(null);
const sceneQueryForm = ref(null);
const devLineChart = ref(null);
const devLineCharts = ref({}); // 多图表模式的引用
const sceneLineChart = ref(null);

// 设置多图表模式的引用
const setChartRef = (el, identifier) => {
  if (el) {
    devLineCharts.value[identifier] = el;
  }
};

const formatDate = (date) => {
  // 确保输入是Date对象
  const d = typeof date === "string" ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return "Invalid Date"; // 处理无效日期
  }

  // 获取UTC时间的年、月、日
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateTime = (date) => {
  // 确保输入是Date对象
  const d = typeof date === "string" ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return "Invalid Date"; // 处理无效日期
  }

  // 获取UTC时间的年、月、日、时、分、秒
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 查询参数
const devQueryParams = reactive({
  productName: null,
  productId: null,
  deviceId: null,
  identifiers: [],
  dayDaterange: [
    formatDateTime(new Date(Date.now() - 60 * 60 * 1000)), // 近一小时
    formatDateTime(new Date()) // 当前时间
  ],
});

const sceneQueryParams = reactive({
  sceneModelId: null,
  sceneModelDeviceId: null,
  identifiers: [],
  dayDaterange: [formatDate(new Date()), formatDate(new Date())],
});

// 日期选择器快捷选项
const shortcuts = [
  {
    text: "近一小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 60 * 60 * 1000);
      return [formatDateTime(start), formatDateTime(end)];
    },
  },
  {
    text: "近两小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 2 * 60 * 60 * 1000);
      return [formatDateTime(start), formatDateTime(end)];
    },
  },
  {
    text: "最近1天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 1);
      return [formatDateTime(start), formatDateTime(end)];
    },
  },
  {
    text: "最近7天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return [formatDateTime(start), formatDateTime(end)];
    },
  },
  {
    text: "最近30天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [formatDateTime(start), formatDateTime(end)];
    },
  },
  {
    text: "最近3个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    },
  },
];

// 计算属性
const devTableList = computed(() => {
  const start = (devPageNum.value - 1) * devPageSize.value;
  const end = start + devPageSize.value;
  return devTableComTemp.value.slice(start, end);
});

const sceneTableList = computed(() => {
  const start = (scenePageNum.value - 1) * scenePageSize.value;
  const end = start + scenePageSize.value;
  return sceneDatas.value.slice(start, end);
});

// 检查是否所有内容都已渲染完成
const checkAllRendered = () => {
  if (showChart.value) {
    // 如果显示图表，检查图表是否渲染完成
    return chartRendered.value;
  } else {
    // 如果显示列表，检查列表是否渲染完成
    return tableRendered.value;
  }
};

// 加载状态管理函数 - 确保所有内容渲染完成后再隐藏遮盖
const startLoadingTask = () => {
  loadingTasks.value++;
  isSearchLoading.value = true;
  // 重置渲染状态
  chartRendered.value = false;
  tableRendered.value = false;
};

const completeLoadingTask = () => {
  loadingTasks.value--;
  // 当所有任务完成且内容已渲染时才隐藏遮盖
  if (loadingTasks.value <= 0 && checkAllRendered()) {
    loadingTasks.value = 0;
    // 添加强制延迟确保过渡效果可见
    setTimeout(() => {
      isSearchLoading.value = false;
    }, 300);
  }
};

// 生命周期钩子
onMounted(async () => {
  // 等待设备列表加载完成
  await getDevDeviceList();

  const {
    activeName,
    deviceId,
    identifier,
    sceneModelId,
    sceneModelDeviceId,
  } = route.query;
  if (activeName) {
    activeTab.value = activeName || "device";

    if (activeName === "device") {
      devQueryParams.deviceId = Number(deviceId);
      getDevIdentifierList(Number(deviceId));
      devQueryParams.identifiers = [identifier];
      // 确保设备列表已加载完成后再执行查询
      if (devDeviceList.value && devDeviceList.value.length > 0) {
        handleDevQuery();
      }
    } else {
      sceneQueryParams.sceneModelId = Number(sceneModelId);
      getSceneModelDetailDatas(Number(sceneModelId));
      sceneQueryParams.sceneModelDeviceId = Number(sceneModelDeviceId);
      getSceneIdentifierList(Number(sceneModelDeviceId));
      sceneQueryParams.identifiers = [identifier];
      handleSceneQuery();
    }
  }
});

// 设备相关方法
const getDevDeviceList = async () => {
  try {
    const params = {
      showChild: true,
      pageNum: 1,
      pageSize: 9999,
    };
    
    return new Promise((resolve) => {
      listDeviceShort(params).then((data) => {
        if (data.code === 200) {
          devDeviceList.value = data.rows;
          // Extract unique product names for dropdown
          const uniqueProductNames = [...new Set(data.rows.map(item => item.productName))];
          productNameList.value = uniqueProductNames;
          // Initialize filtered lists - 让产品型号默认也可以直接选择
          const uniqueProductIds = [...new Set(data.rows.map(item => item.productId))];
          filteredProductIdList.value = uniqueProductIds;
          filteredDeviceList.value = data.rows;
          
          // 如果URL中有deviceId参数，设置对应的产品信息
          const { deviceId, activeName } = route.query;
          if (activeName === "device" && deviceId) {
            setProductInfoFromDevice(Number(deviceId));
          }
          
          resolve(); // 解析Promise
        } else {
          resolve(); // 即使失败也要解析Promise
        }
      }).catch((error) => {
        console.error("获取设备列表失败", error);
        resolve(); // 即使出错也要解析Promise
      });
    });
  } catch (error) {
    console.error("获取设备列表失败", error);
    return Promise.resolve(); // 返回已解析的Promise
  }
};

const handleProductNameChange = (val) => {
  devQueryParams.productId = null;
  devQueryParams.deviceId = null;
  if (val) {
    const filteredIds = [...new Set(
      devDeviceList.value
        .filter(item => item.productName === val)
        .map(item => item.productId)
    )];
    filteredProductIdList.value = filteredIds;
    filteredDeviceList.value = devDeviceList.value.filter(item => item.productName === val);
  } else {
    // 当产品名称取消选择时，显示所有可用的产品型号
    const uniqueProductIds = [...new Set(devDeviceList.value.map(item => item.productId))];
    filteredProductIdList.value = uniqueProductIds;
    filteredDeviceList.value = devDeviceList.value;
  }
};

const handleProductIdChange = (val) => {
  devQueryParams.deviceId = null;
  if (val) {
    if (devQueryParams.productName) {
      // 如果同时选择了产品名称和产品型号，按两者过滤
      filteredDeviceList.value = devDeviceList.value.filter(
        item => item.productName === devQueryParams.productName && item.productId === val
      );
    } else {
      // 如果只选择了产品型号，按产品型号过滤
      filteredDeviceList.value = devDeviceList.value.filter(
        item => item.productId === val
      );
    }
  } else if (devQueryParams.productName) {
    // 如果只选择了产品名称，按产品名称过滤
    filteredDeviceList.value = devDeviceList.value.filter(
      item => item.productName === devQueryParams.productName
    );
  } else {
    // 如果都没有选择，显示所有设备
    filteredDeviceList.value = devDeviceList.value;
  }
};

// 根据设备ID设置产品信息的通用函数
const setProductInfoFromDevice = (deviceId) => {
  const selectedDevice = devDeviceList.value.find(item => item.deviceId === deviceId);
  if (selectedDevice) {
    devQueryParams.productName = selectedDevice.productName;
    devQueryParams.productId = selectedDevice.productId;
    
    // 更新过滤后的产品型号和设备列表
    const filteredIds = [...new Set(
      devDeviceList.value
        .filter(item => item.productName === selectedDevice.productName)
        .map(item => item.productId)
    )];
    filteredProductIdList.value = filteredIds;
    filteredDeviceList.value = devDeviceList.value.filter(item => item.productName === selectedDevice.productName);
  }
};

const handleDevDeviceChange = (val) => {
  // 清除变量选择和相关错误提示
  devQueryParams.identifiers = [];
  formErrors.value.identifiers = "";
  getDevIdentifierList(val);

  // 清除设备选择的错误提示
  if (val) {
    formErrors.value.deviceId = "";
    
    // 根据选择的设备自动填充产品名称和产品型号
    setProductInfoFromDevice(val);
  }
};

const getDevIdentifierList = async (deviceId) => {
  try {
    const params = {
      deviceId: deviceId,
      pageNum: 1,
      pageSize: 9999,
    };

    listThingsModel(params).then((data) => {
      if (data.code === 200) {
        // 确保每个标识符都有有效的type字段
        devIdentifierList.value = data.rows.map(item => ({
          ...item,
          type: item.type !== null && item.type !== undefined ? item.type : 0
        }));
        // 默认选中所有变量名称
        devQueryParams.identifiers = data.rows.map(item => item.identifier);
      }
    });
  } catch (error) {
    console.error("获取设备标识符列表失败", error);
  }
};

const getDevChartDatas = async () => {
  if (!devQueryParams.deviceId || !devQueryParams.identifiers.length) return;

  // 确保设备列表已加载完成
  if (!devDeviceList.value || devDeviceList.value.length === 0) {
    console.warn("设备列表尚未加载完成，等待加载...");
    return;
  }

  loading.value = true;
  startLoadingTask(); // 开始数据加载任务

  try {
    const devices = devDeviceList.value.find(
      (item) => item.deviceId === devQueryParams.deviceId
    );
    
    // 安全检查：确保找到了设备
    if (!devices) {
      console.error(`未找到设备ID为 ${devQueryParams.deviceId} 的设备`);
      loading.value = false;
      completeLoadingTask();
      return;
    }

    const identifierList = devQueryParams.identifiers.map((item) => {
      const identifiers = devIdentifierList.value.find(
        (chil) => chil.identifier === item
      );
      // 确保type字段有有效值，避免后端null错误
      const type = identifiers && identifiers.type !== null && identifiers.type !== undefined ? identifiers.type : 0;
      return { 
        identifier: identifiers ? identifiers.identifier : item, 
        type: type 
      };
    });

    const params = {
      deviceId: devices.deviceId,
      serialNumber: devices.serialNumber,
      identifierList: identifierList,
      beginTime: devQueryParams.dayDaterange[0],
      endTime: devQueryParams.dayDaterange[1] + ' 23:59:59',
    };

    return new Promise((resolve, reject) => {
      getDataCenterDeviceHistory(params)
        .then((data) => {
          if (data.code === 200) {
            devDatas.value = data.data;
            formatDevTableDatas();
            calculateIdentifierStats(); // 计算每个变量的统计数据
            // 查询成功后显示tap标签
            showTapLabels.value = true;

            // 如果有数据，等待图表绘制完成
            if (devDatas.value.length !== 0) {
              startLoadingTask(); // 开始图表绘制任务
              nextTick(() => {
                // 根据图表模式选择绘制方法
                const drawMethod = isSingleChartMode.value ? drawDevLine : drawDevMultiLine;
                drawMethod()
                  .then(() => {
                    chartRendered.value = true; // 标记图表已渲染
                    completeLoadingTask(); // 完成图表绘制任务
                    resolve();
                  })
                  .catch(() => {
                    chartRendered.value = true; // 即使出错也标记为已处理
                    completeLoadingTask();
                    resolve();
                  });
              });
            } else {
              chartRendered.value = true; // 无数据时也标记为已渲染
              resolve();
            }
          } else {
            chartRendered.value = true;
            resolve();
          }
        })
        .catch((error) => {
          console.error("获取设备图表数据失败", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("获取设备图表数据失败", error);
    return Promise.reject(error);
  } finally {
    loading.value = false;
    completeLoadingTask(); // 完成数据加载任务
  }
};

// 计算每个变量的统计数据
const calculateIdentifierStats = () => {
  const stats = {};

  // 初始化每个变量的统计数据
  devQueryParams.identifiers.forEach((identifier) => {
    stats[identifier] = {
      avg: 0,
      max: null,
      min: null,
      count: 0,
      sum: 0,
    };
  });

  // 遍历数据计算统计值
  devDatas.value.forEach((dataItem) => {
    const dataValues = Object.values(dataItem)[0];
    if (dataValues) {
      dataValues.forEach((valueItem) => {
        const [identifier, value] = Object.entries(valueItem)[0];
        const numValue = Number(value);

        if (!isNaN(numValue) && stats[identifier]) {
          // 累加求和用于计算平均值
          stats[identifier].sum += numValue;
          stats[identifier].count += 1;

          // 计算最大值
          if (stats[identifier].max === null || numValue > stats[identifier].max) {
            stats[identifier].max = numValue;
          }

          // 计算最小值
          if (stats[identifier].min === null || numValue < stats[identifier].min) {
            stats[identifier].min = numValue;
          }
        }
      });
    }
  });

  // 计算平均值
  devQueryParams.identifiers.forEach((identifier) => {
    if (stats[identifier].count > 0) {
      stats[identifier].avg = stats[identifier].sum / stats[identifier].count;
    }
  });

  devStats.value = stats;
};

// 获取变量名称
const getIdentifierName = (identifier) => {
  const item = devIdentifierList.value.find((chil) => chil.identifier === identifier);
  return item ? item.modelName + "  (" + item.unit + ")" : identifier;
};

// 获取变量的统计数据
const getIdentifierStats = (identifier, type) => {
  if (devStats.value[identifier]) {
    return devStats.value[identifier][type] || 0;
  }
  return 0;
};

// 验证表单数据
const validateForm = () => {
  let isValid = true;
  formErrors.value = { deviceId: "", identifiers: "" };

  // 验证设备名称
  if (!devQueryParams.deviceId) {
    formErrors.value.deviceId = "请选择设备名称";
    isValid = false;
  }

  // 验证变量名称
  if (!devQueryParams.identifiers || devQueryParams.identifiers.length === 0) {
    formErrors.value.identifiers = "请选择至少一个变量名称";
    isValid = false;
  }

  return isValid;
};

const handleDevQuery = async () => {
  // 先验证表单
  if (!validateForm()) {
    return;
  }

  // 显示加载遮盖
  isSearchLoading.value = true;

  try {
    // 等待所有数据和图表加载完成
    await getDevChartDatas();
    // 手动检查渲染状态，确保遮盖能正确隐藏
    if (checkAllRendered() && loadingTasks.value <= 0) {
      isSearchLoading.value = false;
    }
  } finally {
    // 空操作，确保try中的代码执行完成
  }
};

const handleDevResetQuery = () => {
  // 移除事件监听
  if (devLineChart.value?.chartsInstance) {
    devLineChart.value.chartsInstance.off("dataZoom", handleDataZoom);
  }
  if (devLineCharts.value) {
    Object.values(devLineCharts.value).forEach(chartRef => {
      if (chartRef?.chartsInstance) {
        chartRef.chartsInstance.off("dataZoom", handleDataZoom);
      }
    });
  }

  devQueryParams.productName = null;
  devQueryParams.productId = null;
  devQueryParams.deviceId = null;
  devQueryParams.identifiers = [];
  devQueryParams.dayDaterange = [
    formatDateTime(new Date(Date.now() - 60 * 60 * 1000)), // 近一小时
    formatDateTime(new Date()) // 当前时间
  ];
  devDatas.value = [];
  devTotal.value = 0;
  devStats.value = {}; // 重置统计值
  showTapLabels.value = false; // 重置时隐藏tap标签
  showChart.value = true; // 重置时默认显示图表
  isSingleChartMode.value = true; // 重置时默认单图表模式
  isSearchLoading.value = false; // 重置时隐藏加载遮盖
  formErrors.value = { deviceId: "", identifiers: "" }; // 重置错误提示
  loadingTasks.value = 0; // 重置加载任务计数
  chartRendered.value = false;
  tableRendered.value = false;
  filteredProductIdList.value = [];
  filteredDeviceList.value = devDeviceList.value;

  // 重置过滤后的产品型号列表
  const uniqueProductIds = [...new Set(devDeviceList.value.map(item => item.productId))];
  filteredProductIdList.value = uniqueProductIds;
  filteredDeviceList.value = devDeviceList.value;

  // 重置表单验证
  if (devQueryForm.value) {
    devQueryForm.value.resetFields();
  }

  handleDevQuery();
};

// 切换图表显示模式（单图表/多图表）
const toggleChartMode = async () => {
  isSingleChartMode.value = !isSingleChartMode.value;
  
  // 如果当前显示图表且有数据，需要重新绘制
  if (showChart.value && devDatas.value.length !== 0) {
    startLoadingTask(); // 开始切换加载任务
    
    try {
      await nextTick();
      
      if (isSingleChartMode.value) {
        // 切换到单图表模式，清除多图表实例
        if (devLineCharts.value) {
          Object.values(devLineCharts.value).forEach(chartRef => {
            if (chartRef?.chartsInstance) {
              chartRef.chartsInstance.dispose();
            }
          });
        }
        // 重新绘制单图表
        await drawDevLine();
      } else {
        // 切换到多图表模式，清除单图表实例
        if (devLineChart.value?.chartsInstance) {
          devLineChart.value.chartsInstance.dispose();
        }
        // 重新绘制多图表
        await drawDevMultiLine();
      }
      
      chartRendered.value = true; // 标记图表已渲染
    } finally {
      completeLoadingTask(); // 完成切换加载任务
    }
  }
};

// 切换图表/列表显示状态
const toggleChartTable = async () => {
  showChart.value = !showChart.value;
  startLoadingTask(); // 开始切换加载任务

  try {
    // 切换到图表且有数据时，重新绘制图表
    if (showChart.value && devDatas.value.length !== 0) {
      // 使用nextTick确保DOM已更新
      await nextTick();
      // 先清除可能存在的旧图表实例
      if (isSingleChartMode.value) {
        if (devLineChart.value?.chartsInstance) {
          devLineChart.value.chartsInstance.dispose();
        }
        // 重新绘制单图表
        await drawDevLine();
      } else {
        if (devLineCharts.value) {
          Object.values(devLineCharts.value).forEach(chartRef => {
            if (chartRef?.chartsInstance) {
              chartRef.chartsInstance.dispose();
            }
          });
        }
        // 重新绘制多图表
        await drawDevMultiLine();
      }
      chartRendered.value = true; // 标记图表已渲染
    } else if (!showChart.value) {
      // 切换到列表时，等待表格渲染完成
      await nextTick();
      tableRendered.value = true; // 标记列表已渲染
    }
  } finally {
    completeLoadingTask(); // 完成切换加载任务
  }
};

const getDevTableList = (e) => {
  devPageNum.value = e.page;
  devPageSize.value = e.limit;
  // 列表分页变化时标记为已渲染
  nextTick(() => {
    tableRendered.value = true;
    completeLoadingTask();
  });
};

// 场景相关方法
const getSceneModelDetail = () => {};
const getSceneModelDataList = () => {};

const getSceneModelDetailDatas = async (sceneModelId) => {
  try {
    getSceneModelDetail(sceneModelId).then((data) => {
      if (data.code === 200) {
        sceneDeviceList.value = data.data.sceneModelDeviceList;
      }
    });
  } catch (error) {
    console.error("获取场景模型详情失败", error);
  }
};

const handleSceneDeviceChange = (val) => {
  sceneQueryParams.identifiers = [];
  getSceneIdentifierList(val);
};

const getSceneIdentifierList = async (sceneModelDeviceId) => {
  try {
    const params = {
      sceneModelId: sceneQueryParams.sceneModelId,
      sceneModelDeviceId: sceneModelDeviceId,
      pageNum: 1,
      pageSize: 9999,
    };
    getSceneModelDataList(params).then((data) => {
      if (data.code === 200) {
        sceneIdentifierList.value = data.rows;
      }
    });
  } catch (error) {
    console.error("获取场景标识符列表失败", error);
  }
};

const getSceneChartDatas = async () => {
  if (
    !sceneQueryParams.sceneModelId ||
    !sceneQueryParams.sceneModelDeviceId ||
    !sceneQueryParams.identifiers.length
  )
    return;

  loading.value = true;
  startLoadingTask(); // 开始场景数据加载任务

  try {
    const device = sceneDeviceList.value.find(
      (item) => item.id === sceneQueryParams.sceneModelDeviceId
    );
    const ids = sceneQueryParams.identifiers
      .map(
        (item) => sceneIdentifierList.value.find((chil) => chil.identifier === item).id
      )
      .join(",");

    const params = {
      sceneModelId: sceneQueryParams.sceneModelId,
      sceneModelDeviceId: sceneQueryParams.sceneModelDeviceId,
      variableType: device?.variableType || "",
      ids: ids,
      beginTime: sceneQueryParams.dayDaterange[0],
      endTime: sceneQueryParams.dayDaterange[1] + ' 23:59:59',
    };

    return new Promise((resolve) => {
      getDataCenterSceneHistory(params).then((data) => {
        if (data.code === 200) {
          sceneDatas.value = data.data;
          formatSceneTableDatas();

          if (sceneDatas.value.length !== 0) {
            startLoadingTask(); // 开始场景图表绘制任务
            drawSceneLine().then(() => {
              chartRendered.value = true; // 标记场景图表已渲染
              completeLoadingTask(); // 完成场景图表绘制任务
              resolve();
            });
          } else {
            chartRendered.value = true;
            resolve();
          }
        } else {
          chartRendered.value = true;
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("获取场景图表数据失败", error);
    return Promise.reject(error);
  } finally {
    loading.value = false;
    completeLoadingTask(); // 完成场景数据加载任务
  }
};

const handleSceneQuery = async () => {
  // 场景查询的验证逻辑
  const isField = areAllFields(sceneQueryParams);
  if (isField) {
    // 显示加载遮盖
    isSearchLoading.value = true;

    try {
      // 等待所有场景数据和图表加载完成
      await getSceneChartDatas();
      // 手动检查渲染状态
      if (checkAllRendered() && loadingTasks.value <= 0) {
        isSearchLoading.value = false;
      }
    } finally {
      // 空操作
    }
  }
};

// 工具方法
const areAllFields = (obj) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (
        !obj[key] ||
        obj[key] === "" ||
        (Array.isArray(obj[key]) && obj[key].length === 0)
      ) {
        return false;
      }
    }
  }
  return true;
};

// 图表绘制 - 返回Promise确保绘制完成
const drawDevLine = () => {
  return new Promise((resolve) => {
    if (!devLineChart.value) {
      resolve();
      return;
    }

    // 初始化折线图
    const charts = echarts.init(devLineChart.value);
    charts.clear();

    // 设置折线图数据和样式
    charts.setOption({
      tooltip: {
        trigger: "axis",
      },
      legend: {
        align: "right",
        left: "3%",
        top: "15%",
      },
      grid: {
        top: "30%",
        left: "5%",
        right: "5%",
        bottom: "5%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          // 隐藏ECharts内置下载按钮
          myDownload: {
            show: false,
          },
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
        },
      ],
      xAxis: {
        type: "category",
        boundaryGap: true,
        axisTick: {
          alignWithLabel: true,
        },
        data:
          devDatas.value.length !== 0 &&
          devDatas.value.length !== 0 &&
          devDatas.value.map((item) => Object.keys(item)[0]),
      },
      yAxis: {
        type: "value",
        scale: true, //自适应
      },
      series: getDevSeries(),
    });

    // 添加dataZoom事件监听
    charts.on("dataZoom", handleDataZoom);

    // 监听窗口大小变化，重新绘制图表
    const resizeObserver = new ResizeObserver(() => {
      charts.resize();
    });

    resizeObserver.observe(devLineChart.value);
    // 保存charts实例以便后续使用
    devLineChart.value.chartsInstance = charts;

    // 图表渲染完成的回调
    resolve();
  });
};

// 多图表模式绘制 - 返回Promise确保绘制完成
const drawDevMultiLine = () => {
  return new Promise((resolve) => {
    if (!devLineCharts.value || Object.keys(devLineCharts.value).length === 0) {
      resolve();
      return;
    }

    let completedCharts = 0;
    const totalCharts = devQueryParams.identifiers.length;
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

    devQueryParams.identifiers.forEach((identifier, index) => {
      const chartRef = devLineCharts.value[identifier];
      if (chartRef) {
        const charts = echarts.init(chartRef);
        charts.clear();

        charts.setOption({
          tooltip: {
            trigger: "axis",
          },
          legend: {
            align: "right",
            left: "3%",
            top: "15%",
          },
          grid: {
            top: "30%",
            left: "5%",
            right: "5%",
            bottom: "5%",
            containLabel: true,
          },
          toolbox: {
            feature: {
              myDownload: {
                show: false,
              },
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
            },
          ],
          xAxis: {
            type: "category",
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true,
            },
            data: devDatas.value.length !== 0 && devDatas.value.map((item) => Object.keys(item)[0]),
          },
          yAxis: {
            type: "value",
            scale: true,
          },
          series: [{
            name: getIdentifierName(identifier),
            type: "line",
            stack: "数据",
            symbol: "none",
            lineStyle: {
              width: 2,
              color: colors[index % colors.length]
            },
            data: devDatas.value.map((d) => {
              const ide = Object.values(d)[0]?.find((f) => Object.keys(f)[0] === identifier);
              return ide ? Object.values(ide)[0] : null;
            }),
          }],
        });

        charts.on("dataZoom", handleDataZoom);

        const resizeObserver = new ResizeObserver(() => {
          charts.resize();
        });

        resizeObserver.observe(chartRef);
        chartRef.chartsInstance = charts;

        completedCharts++;
        if (completedCharts === totalCharts) {
          resolve();
        }
      }
    });

    if (totalCharts === 0) {
      resolve();
    }
  });
};

// 导出包含标签的图片 - 优化布局
const exportWithLabels = (defaultName = "图表") => {
  if (!exportContainer.value) return;

  // 显示加载状态
  loading.value = true;

  // 获取设备名称作为文件名一部分
  const deviceName =
    devDeviceList.value.find((item) => item.deviceId === devQueryParams.deviceId)
      ?.deviceName || "未知设备";

  // 获取变量名称作为文件名一部分
  const varNames = devQueryParams.identifiers
    .map(
      (id) =>
        devIdentifierList.value.find((item) => item.identifier === id)?.modelName || id
    )
    .join("-");

  // 生成文件名
  const fileName = `${deviceName}-${varNames}-${new Date()
    .toLocaleDateString()
    .replace(/\//g, "-")}.png`;

  // 使用html2canvas将整个容器转换为图片
  html2canvas(exportContainer.value, {
    useCORS: true, // 允许跨域图片
    logging: false,
    backgroundColor: "#ffffff",
    scale: 1, // 提高导出分辨率
    scrollX: 0,
    scrollY: 0,
  })
    .then((canvas) => {
      // 转换为图片并下载
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
    })
    .finally(() => {
      // 隐藏加载状态
      loading.value = false;
    });
};

// 导出Excel功能
const exportToExcel = () => {
  if (!devTableComTemp.value || devTableComTemp.value.length === 0) {
    alert("暂无数据可导出");
    return;
  }

  // 显示加载状态
  loading.value = true;

  try {
    // 获取设备名称作为文件名一部分
    const deviceName =
      devDeviceList.value.find((item) => item.deviceId === devQueryParams.deviceId)
        ?.deviceName || "未知设备";

    // 生成文件名
    const fileName = `${deviceName}-历史数据-${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.xlsx`;

    // 准备Excel数据
    const excelData = devTableComTemp.value.map((item, index) => {
      const row = {
        '序号': index + 1,
        '更新时间': item.time,
      };
      
      // 添加各个变量的数据
      devQueryParams.identifiers.forEach(identifier => {
        const identifierName = getIdentifierName(identifier);
        row[identifierName] = item[identifier] || '';
      });
      
      return row;
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },  // 序号
      { wch: 20 }, // 更新时间
    ];
    
    // 为每个变量列设置宽度
    devQueryParams.identifiers.forEach(() => {
      colWidths.push({ wch: 15 });
    });
    
    ws['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "历史数据");
    
    // 导出文件
    XLSX.writeFile(wb, fileName);
    
  } catch (error) {
    console.error("导出Excel失败:", error);
    alert("导出Excel失败，请重试");
  } finally {
    // 隐藏加载状态
    loading.value = false;
  }
};

const getDevSeries = () => {
  return devQueryParams.identifiers.map((item) => {
    return {
      name: getIdentifierName(item),
      type: "line",
      stack: "数据",
      symbol: "none", // 去掉折线上的点
      lineStyle: {
        width: 2, // 设置线条宽度
      },
      data: devDatas.value.map((d) => {
        const ide = Object.values(d)[0]?.find((f) => Object.keys(f)[0] === item);
        return ide ? Object.values(ide)[0] : null;
      }),
    };
  });
};

const handleDataZoom = (params) => {
  // 获取当前图表实例
  const charts = devLineChart.value?.chartsInstance;
  if (!charts) return;

  // 获取当前显示的数据范围
  const option = charts.getOption();
  const dataZoom = option.dataZoom[0];

  // 计算当前显示的数据范围
  const startValue = dataZoom.startValue || 0;
  const endValue = dataZoom.endValue || devDatas.value.length - 1;

  // 计算当前显示范围内的统计值
  const visibleData = devDatas.value.slice(startValue, endValue + 1);
  const zoomStats = {};

  // 初始化
  devQueryParams.identifiers.forEach((identifier) => {
    zoomStats[identifier] = {
      sum: 0,
      count: 0,
      max: null,
      min: null,
    };
  });

  // 计算可见范围内的统计值
  visibleData.forEach((d) => {
    Object.values(d)[0]?.forEach((f) => {
      const [identifier, value] = Object.entries(f)[0];
      const numValue = Number(value);

      if (!isNaN(numValue) && zoomStats[identifier]) {
        zoomStats[identifier].sum += numValue;
        zoomStats[identifier].count += 1;

        if (zoomStats[identifier].max === null || numValue > zoomStats[identifier].max) {
          zoomStats[identifier].max = numValue;
        }

        if (zoomStats[identifier].min === null || numValue < zoomStats[identifier].min) {
          zoomStats[identifier].min = numValue;
        }
      }
    });
  });

  // 更新平均值
  devQueryParams.identifiers.forEach((identifier) => {
    if (zoomStats[identifier].count > 0 && devStats.value[identifier]) {
      devStats.value[identifier].avg =
        zoomStats[identifier].sum / zoomStats[identifier].count;
      devStats.value[identifier].max = zoomStats[identifier].max;
      devStats.value[identifier].min = zoomStats[identifier].min;
    }
  });
};

const formatDevTableDatas = () => {
  devTableComTemp.value = devDatas.value.map((item) => {
    const time = Object.keys(item)[0];
    let obj = {};
    Object.values(item)[0].forEach((chil) => {
      obj[Object.keys(chil)[0]] = Object.values(chil)[0];
    });
    return { time, ...obj };
  });

  devTotal.value = devDatas.value.length;
  devTableHeaderTemp.value = devQueryParams.identifiers.map((item) => ({
    name: getIdentifierName(item),
    value: item,
  }));

  // 标记列表已渲染
  nextTick(() => {
    tableRendered.value = true;
    completeLoadingTask();
  });
};

// 场景图表绘制 - 返回Promise确保绘制完成
const drawSceneLine = () => {
  return new Promise((resolve) => {
    if (!sceneLineChart.value) {
      resolve();
      return;
    }

    // 初始化折线图
    const charts = echarts.init(sceneLineChart.value);
    charts.clear();

    // 设置折线图数据和样式
    charts.setOption({
      tooltip: {
        trigger: "axis",
      },
      legend: {
        align: "right",
        left: "3%",
        top: "1%",
      },
      grid: {
        top: "1%",
        left: "5%",
        right: "5%",
        bottom: "5%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          // 隐藏ECharts内置下载按钮
          myDownload: {
            show: false,
          },
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
        },
      ],
      xAxis: {
        type: "category",
        boundaryGap: true,
        axisTick: {
          alignWithLabel: true,
        },
        data:
          sceneDatas.value.length !== 0 &&
          sceneDatas.value.map((item) => Object.keys(item)[0]),
      },
      yAxis: {
        type: "value",
        boundaryGap: true,
        splitNumber: 4,
        interval: 250,
      },
      series: getSceneSeries(),
    });

    // 监听窗口大小变化，重新绘制图表
    const resizeObserver = new ResizeObserver(() => {
      charts.resize();
    });

    resizeObserver.observe(sceneLineChart.value);

    // 图表渲染完成
    resolve();
  });
};

const getSceneSeries = () => {
  return sceneQueryParams.identifiers.map((item) => {
    return {
      name:
        sceneIdentifierList.value.find((chil) => chil.identifier === item)?.sourceName ||
        item,
      type: "line",
      stack: "数据",
      data: sceneDatas.value.map((d) => {
        const ide = Object.values(d)[0]?.find((f) => Object.keys(f)[0] === item);
        return ide ? Object.values(ide)[0] : null;
      }),
    };
  });
};

const formatSceneTableDatas = () => {
  sceneTotal.value = sceneDatas.value.length;

  sceneTableHeaderTemp.value = sceneQueryParams.identifiers.map((item) => ({
    name:
      sceneIdentifierList.value.find((chil) => chil.identifier === item)?.sourceName ||
      item,
    value: item,
  }));

  // 标记场景列表已渲染
  nextTick(() => {
    tableRendered.value = true;
    completeLoadingTask();
  });
};

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.activeName) {
      activeTab.value = newQuery.activeName;

      if (newQuery.activeName === "device" && newQuery.deviceId) {
        devQueryParams.deviceId = Number(newQuery.deviceId);
        getDevIdentifierList(Number(newQuery.deviceId));

        if (newQuery.identifier) {
          devQueryParams.identifiers = [newQuery.identifier];
        }
      } else if (newQuery.activeName === "scene" && newQuery.sceneModelId) {
        sceneQueryParams.sceneModelId = Number(newQuery.sceneModelId);
        getSceneModelDetailDatas(Number(newQuery.sceneModelId));

        if (newQuery.sceneModelDeviceId) {
          sceneQueryParams.sceneModelDeviceId = Number(newQuery.sceneModelDeviceId);
          getSceneIdentifierList(Number(newQuery.sceneModelDeviceId));
        }

        if (newQuery.identifier) {
          sceneQueryParams.identifiers = [newQuery.identifier];
        }
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (devLineChart.value?.chartsInstance) {
    devLineChart.value.chartsInstance.off("dataZoom", handleDataZoom);
    devLineChart.value.chartsInstance.dispose();
  }
});
</script>
<style lang="scss" scoped>
// 全局字体样式设置
::v-deep .tableCom {
  font-size: 12px !important;
  font-family: "Microsoft YaHei", sans-serif !important;
}

// 穿透设置Element UI组件字体
::v-deep .el-form,
::v-deep .el-form-item,
::v-deep .el-form-item__label,
::v-deep .el-select,
::v-deep .el-input,
::v-deep .el-date-picker,
::v-deep .el-button,
::v-deep .el-table,
::v-deep .el-table__cell,
::v-deep .el-dialog,
::v-deep .el-dialog__title,
::v-deep .el-pagination {
  font-size: 12px !important;
  font-family: "Microsoft YaHei", sans-serif !important;
}

.export-container {
  padding-top: 30px;
  padding-bottom: 30px;
}

.data-center-history-wrap {
  padding: 10px;
  background-color: #ffffff;
  font-size: 12px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .chart-actions {
      display: flex;
      gap: 10px;
    }
  }

  .toggle-btn,
  .export-btn,
  .export-excel-btn {
    font-size: 12px;
  }

  .device-wrap {
    margin-top: 5px;
  }

  // ========== 核心调整：每行2个、加宽宽度、与图表对齐 ==========
  .custom-tap-labels {
    margin: 10px 0 15px;
    display: grid;
    grid-template-columns: repeat(2, 1fr); // 强制每行2列
    gap: 8px; // 两列之间的间距同步加大
    // 核心：左右各增加20px边距（总间距40px），同时限制宽度不超过图表
    width: calc(100% - 104px); // 减去左右边距总和，确保不超出图表范围
    margin-left: 52px; // 左边距
    margin-right: 52px; // 右边距
    box-sizing: border-box; // 包含内边距，避免超出
    padding: 0; // 移除额外内边距，与图表对齐
  }

  .tap-label {
    display: flex;
    align-items: center;
    flex-wrap: nowrap; // 强制单行
    padding: 12px 20px; // 适当加宽内边距，视觉更宽
    background-color: #f5f7fa;
    border-radius: 4px;
    box-sizing: border-box;
    width: 100%; // 占满每列宽度，确保加宽
  }

  .label-name {
    font-weight: bold;
    color: #1890ff;
    min-width: 100px; // 略加宽名称宽度
    flex-shrink: 0;
    padding-right: 15px;
    margin-right: 15px;
    border-right: 1px solid #ccc;
  }

  .label-stat {
    padding: 0 15px;
    width: 120px;
    max-width: 120px;
    &:not(:last-child) {
      border-right: 1px solid #ccc;
    }
  }

  .label-stat_value {
    color: #333;
  }
  // ============================================

  // 调整element-ui组件字号
  .el-form-item__label {
    font-size: 12px;
  }

  .el-select,
  .el-date-picker {
    font-size: 12px;
  }

  .el-button {
    font-size: 12px;
  }

  .el-empty__description {
    font-size: 12px;
  }
}

// 搜索加载遮盖样式
.search-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.85);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  transition: opacity 0.3s ease-in-out;
  opacity: 1;

  &.fade-out {
    opacity: 0;
  }

  .loading-content {
    text-align: center;

    p {
      margin-top: 16px;
      color: #666;
      font-size: 12px;
    }
  }
}

// 错误提示样式
::v-deep .el-form-item__error {
  font-size: 12px;
  padding-top: 4px;
}

// 多图表模式样式
.chart-container {
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.chart-container:nth-child(2n) {
  margin-right: 0;
}
</style>
