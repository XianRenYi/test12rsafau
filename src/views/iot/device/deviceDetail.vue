<template>
  <div class="app-container">
    <el-card style="margin: 6px; padding-bottom: 100px">
  
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="100">
          <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="8">
            <!-- <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="form.deviceName" placeholder="请输入设备名称">
           
              </el-input>
            </el-form-item> -->
            <el-form-item label="" prop="productName">
              <template #label>
                <span style="color: red">*</span>
                产品名称
              </template>
              <el-input
                readonly
                v-model="form.productName"
                placeholder="请选择产品"
                disabled
              >
                <template #append>
                  <el-button @click="selectProduct()" :disabled="form.status != 1"
                    >选择</el-button
                  >
                </template>
              </el-input>
            </el-form-item>

                    <el-form-item label="" prop="productId">
              <template #label>
                <span style="color: red">*</span>
                产品型号
              </template>
              <el-input
                readonly
                v-model="form.productId"
                placeholder="请选择产品"
                disabled
              >
          
              </el-input>
            </el-form-item>


            <el-form-item label="" prop="serialNumber">
              <template #label>
                <span style="color: red">*</span>
                序列号
              </template>
              <el-input
                v-model="form.serialNumber"
                placeholder="请输入序列号"
                :disabled="form.status !== 1"
                maxlength="32"
              >
                <!-- <template #append>
                  <el-button
                    v-if="form.deviceType !== 3"
                    @click="generateNum"
                    :loading="genDisabled"
                    :disabled="form.status != 1"
                    v-hasPermi="['iot:device:add']"
                    >生成</el-button
                  >
                  <el-button
                    v-if="form.deviceType === 3"
                    @click="genSipID()"
                    :disabled="form.status != 1"
                    v-hasPermi="['iot:device:add']"
                    >生成</el-button
                  >
                </template> -->
              </el-input>
            </el-form-item>

  
            <el-form-item label="到期时间" prop="expirationTime">
              <el-date-picker
                clearable
                v-model="form.expirationTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="到期时间"
                :disabled="expirationType == 2"
                style="width: 200px;padding-right: 20px;"
                :shortcuts="shortcuts"
              ></el-date-picker>
              <el-radio-group v-model="expirationType" @change="handleExpirationTypeChange">
                <el-radio-button :label="1">有期限</el-radio-button>
                <el-radio-button :label="2">无期限</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="维修状态" prop="maintenanceCycle">
              <div style="display: flex; align-items: center; gap: 10px;">
                <dict-tag
                  :options="customDeviceStatus2"
                  :value="form.maintenanceStatusName"
                  style="display: inline-block; margin-right: 8px"
                />
                <el-radio-group
                  v-model="form.maintenanceStatus"
                  v-hasPermi="['iot:device:edit']"
                  v-show="form.deviceId != 0"
                  @change="handleStatusChange"
                  class="status-radio-group"
                >
                  <el-radio-button
                    v-for="statusOption in customDeviceStatus"
                    :key="statusOption.value"
                    :label="Number(statusOption.value)"
                    :type="statusOption.elTagType"
                  >
                    {{ statusOption.label }}
                  </el-radio-button>
                </el-radio-group>

              </div>
            </el-form-item>

            <el-form-item label="维护信息" v-if="showMaintenanceInfo">
              <el-date-picker
                v-model="form.maintenanceTime"
                type="date"
                placeholder="选择提醒日期"
                value-format="YYYY-MM-DD"
                style="width: 100%; margin-bottom: 10px;"
              ></el-date-picker>
              <el-input
                v-model="form.maintenanceRemark"
                type="textarea"
                :rows="3"
                placeholder="请输入维护内容"
              ></el-input>
            </el-form-item>

            <!-- <el-form-item label="禁用设备" prop="deviceStatus">
              <el-switch
                v-model="deviceStatus"
                :disabled="form.status === 1 || form.deviceType === 3"
                :active-value="1"
                :inactive-value="0"
                active-color="#F56C6C"
              ></el-switch>
            </el-form-item> -->
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="8">
            <el-form-item label="定位方式" prop="locationWay">
              <el-select
                v-model="form.locationWay"
                placeholder="请选择设备状态"
                clearable
                style="width: 100%"
                :disabled="form.deviceType === 3"
              >
                <el-option
                  v-for="dict in iot_location_way"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="设备经度" prop="longitude">
              <el-input
                v-model="form.longitude"
                placeholder="请输入设备经度"
                type="number"
                :disabled="form.locationWay != 3"
              >
                <template #append>
                  <el-link
                    :underline="false"
                    href="https://api.map.baidu.com/lbsapi/getpoint/index.html"
                    target="_blank"
                    :disabled="form.locationWay != 3"
                    >坐标拾取</el-link
                  >
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="设备纬度" prop="latitude">
              <el-input
                v-model="form.latitude"
                placeholder="请输入设备纬度"
                type="number"
                :disabled="form.locationWay != 3"
              >
                <template #append>
                  <el-link
                    :underline="false"
                    href="https://api.map.baidu.com/lbsapi/getpoint/index.html"
                    target="_blank"
                    :disabled="form.locationWay != 3"
                    >坐标拾取</el-link
                  >
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="所在地址" prop="networkAddress">
              <el-input
                v-model="form.networkAddress"
                placeholder="请输入设备所在地址"
                :disabled="form.locationWay != 3"
              />
            </el-form-item>
            <el-form-item label="状态" prop="remark" v-if="form.deviceId != 0">
              <dict-tag
                :options="iot_device_status"
                :value="form.status"
                style="display: inline-block; margin-right: 8px"
              />
              <el-button @click="handleViewMqtt()">MQTT连接信息</el-button>
            </el-form-item>

            <el-form-item label="备注信息" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="请输入内容"
                rows="3"
              />
            </el-form-item>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="24"
            :lg="12"
            :xl="8"
            v-if="form.deviceId != 0"
          >
        
          </el-col>
        </el-row>

   

     
            <!-- 按钮区域 -->
            <el-row>
              <el-col :span="24" class="button-group">
            

              <el-button type="primary" @click="submitForm" v-hasPermi="['iot:device:edit']" v-show="form.deviceId != 0" class="main-btn">修 改</el-button>
              <el-button type="primary" @click="submitForm" v-hasPermi="['iot:device:add']"  v-show="form.deviceId == 0" class="main-btn" >新 增</el-button>

                  <el-button @click="goBack()" size="large" class="reset-btn">
                    <i class="el-icon-refresh mr-1"></i>返回列表
                  </el-button>
                      <!-- <el-button type="info" size="mini" @click="goBack()">返回列表</el-button> -->
              </el-col>
            </el-row>
      
      </el-form>



      <el-dialog
        title="Mqtt连接参数"
        v-model="openViewMqtt"
        width="600px"
        append-to-body
        :close-on-click-modal="false"
      >
        <el-form ref="listQueryRef" :model="listQuery" :rules="rules" label-width="150px">
          <el-form-item label="客户端ID" prop="clientId">
            <el-input v-model="listQuery.clientId" readonly style="width: 80%" />
          </el-form-item>
          <el-form-item label="MQ账号" prop="username">
            <el-input v-model="listQuery.username" readonly style="width: 80%" />
          </el-form-item>
          <el-form-item label="MQ密码" prop="passwd">
            <el-input
              clearable
              v-model="listQuery.passwd"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
          <el-form-item label="订阅主题" prop="subscribeTopic">
            <el-input
              clearable
              v-model="listQuery.subscribeTopic"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
          <el-form-item label="发布主题" prop="reportTopic">
            <el-input
              clearable
              v-model="listQuery.reportTopic"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
          <el-form-item label="连接IP" prop="port">
            <el-input
              clearable
              v-model="listQuery.ipUrl"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
          <el-form-item label="连接端口" prop="port">
            <el-input
              clearable
              v-model="listQuery.port"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button class="btns" type="primary" @click="doCopy(2)">一键复制</el-button>
            <el-button @click="closeSummaryDialog">关 闭</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup name="DeviceEdit">
import { ref, reactive, computed, watch, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useDict } from "@/utils/dict";
import {
  deviceSynchronization,
  getDevice,
  addDevice,
  updateDevice,
  generatorDeviceNum,
  getMqttConnect,
} from "@/api/iot/device";
import { getDeviceRunningStatus } from "@/api/iot/device";
import { cacheJsonThingsModel } from "@/api/iot/model";
import productList from "./components/product-list.vue";
import deviceLog from "./components/device-log.vue";
import deviceStatistic from "./components/device-statistic.vue";
import deviceVariable from "./components/device-variable.vue";

import runningStatus from "./components/running-status.vue";
import mqttTool from "@/utils/mqttTool";

const showMaintenanceInfo = ref(false);
const maintenanceReminderDate = ref(null);
const maintenanceContent = ref('');

const customDeviceStatus = ref([
  { label: '启用', value: '1', elTagType: 'success' },
  { label: '禁用', value: '2', elTagType: 'warning' },
  { label: '报废', value: '3', elTagType: 'danger' }
]);

const customDeviceStatus2 = ref([
  { label: '正常', value: '正常', elTagType: 'success' },
  { label: '待维护', value: '待维护', elTagType: 'success' },
  { label: '报废', value: '报废', elTagType: 'danger' }
]);
const expirationType = ref(2); // 1: 有期限, 2: 无期限, 默认无期限

const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '下个月',
    value: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  },
  {
    text: '三个月',
    value: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date;
    },
  },
  {
    text: '半年',
    value: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 6);
      return date;
    },
  },
  {
    text: '一年',
    value: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    },
  },
  {
    text: '三年',
    value: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 3);
      return date;
    },
  },
  {
    text: '五年',
    value: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 5);
      return date;
    },
  },
];

const handleExpirationTypeChange = (value) => {
  if (value === 2) { // 如果选择无期限
    form.expirationTime = ''; // 清空到期时间
    form.expirationStausName="无期限";
  }else{
    form.expirationStausName="有期限";
  }
};

const maintenanceCycleNum = ref(180)
const handleChange = (value) => {
  console.log(value)
}

// 处理设备状态更改
const handleStatusChange = (value) => {
  switch (value) {
    case 1: // 启用
      showMaintenanceInfo.value = true;
      // form.maintenanceStatus = 1; 已经在v-model中绑定
    //  proxy.$modal.alertSuccess("设备已启用");
      break;
    case 2: // 禁用
      showMaintenanceInfo.value = false;
      // form.maintenanceStatus = 2; 已经在v-model中绑定
    //  proxy.$modal.alertWarning("设备已禁用");
      break;
    case 3: // 报废
      showMaintenanceInfo.value = false;
      // form.maintenanceStatus = 3; 已经在v-model中绑定
  //    proxy.$modal.alertError("设备已报废");
      break;
    default:
      break;
  }
};

const { proxy } = getCurrentInstance();
const { iot_device_status, iot_location_way } = proxy.useDict(
  "iot_device_status",
  "iot_location_way"
);

const route = useRoute();
const router = useRouter();

// 二维码内容
const qrText = ref("senbe");
// 打开设备配置对话框
const openSummary = ref(false);
// 二维码
const openCode = ref(false);
const openViewMqtt = ref(false);
// 生成设备编码是否禁用
const genDisabled = ref(false);
// 选中选项卡
const activeName = ref("basic");
// 查看mqtt参数
const mqttList = ref([]);
// 设备开始状态
const oldDeviceStatus = ref(null);
const deviceId = ref("");
const channelId = ref("");
// 表单参数
const form = reactive({
  productId: 0,
  status: 1,
  locationWay: 1,
  firmwareVersion: 1.0,
  serialNumber: "",
  deviceType: 1,
  isSimulate: 0,
  maintenanceReminderDate: null,
  maintenanceContent: null,
  maintenanceStatus:2,
  expireTime: null,
});
// mqtt参数查看
const listQuery = reactive({
  ipUrl: "wss://www.cbiet.com:8084/mqttwss",
  clientId: 0,
  username: "",
  passwd: "",
  subscribeTopic: "",
  reportTopic: "",
  port: "",
});
const openTip = ref(false);
const openServerTip = ref(false);
const serverType = ref(1);
// 用于判断是否是设备组(modbus)
const isSubDev = ref(false);
// 设备摘要
const summary = ref([]);
// 地址
const baseUrl = import.meta.env.VITE_APP_BASE_API;

// 表单校验
const rules = reactive({
  deviceName: [
    {
      required: true,
      message: "设备名称不能为空",
      trigger: "blur",
    },
    {
      min: 2,
      max: 32,
      message: "设备名称长度在 2 到 32 个字符",
      trigger: "blur",
    },
  ],
  firmwareVersion: [
    {
      required: true,
      message: "固件版本不能为空",
      trigger: "blur",
    },
  ],
});

// Refs
const formRef = ref();
const productListRef = ref();
const runningStatusRef = ref();
const deviceLogRef = ref();
const deviceStatisticRef = ref();
const deviceVariableRef = ref();

const listQueryRef = ref();

// 设备状态计算属性
const deviceStatus = computed({
  get() {
    if (form.status == 2) {
      return 1;
    }
    return 0;
  },
  set(val) {
    if (val == 1) {
      // 1-未激活，2-禁用，3-在线，4-离线
      form.status = 2;
    } else if (val == 0) {
      form.status = 4;
    } else {
      form.status = oldDeviceStatus.value;
    }
  },
});

onMounted(() => {
  let activeNameParam = route.query.activeName;
  if (activeNameParam != null && activeNameParam != "") {
    activeName.value = activeNameParam;
  }
  // 获取设备信息
  form.deviceId = route.query && route.query.deviceId;
  
  if (form.deviceId != 0) {
    getDevice2(form.deviceId);
  }
  isSubDev.value = route.query.isSubDev === 1;
});

onUnmounted(() => {
  // 取消订阅主题
  mqttUnSubscribe(form);
});

// 获取子组件订阅的设备状态
function getDeviceStatusData(status) {
  form.status = status;
}

function getPlayerData(data) {
  activeName.value = data.tabName;
  channelId.value = data.channelId;
  if (channelId.value) {
    proxy.$refs.deviceLiveStream.channelId = channelId.value;
    proxy.$refs.deviceLiveStream.changeChannel();
  }
}

// 选项卡改变事件
function tabChange(panel) {
  proxy.$nextTick(() => {
    if (form.deviceType == 3 && panel.name != "deviceReturn") {
      if (panel.name === "sipPlayer") {
        if (proxy.$refs.deviceVideo && proxy.$refs.deviceVideo.destroy) {
          proxy.$refs.deviceVideo.destroy();
        }
        if (channelId.value) {
          if (
            proxy.$refs.deviceLiveStream &&
            proxy.$refs.deviceLiveStream.channelId !== undefined
          ) {
            proxy.$refs.deviceLiveStream.channelId = channelId.value;
          }
          proxy.$refs.deviceLiveStream.changeChannel();
        }
        if (proxy.$refs.deviceLiveStream.channelId !== undefined) {
          proxy.$refs.deviceLiveStream.changeChannel();
        }
      } else if (panel.name === "sipVideo") {
        if (proxy.$refs.deviceLiveStream && proxy.$refs.deviceLiveStream.destroy) {
          proxy.$refs.deviceLiveStream.destroy();
        }
        if (
          proxy.$refs.deviceVideo &&
          proxy.$refs.deviceVideo.channelId !== undefined &&
          proxy.$refs.deviceVideo.queryDate
        ) {
          proxy.$refs.deviceVideo.loadDevRecord();
        }
      } else if (panel.name === "sipChannel") {
        proxy.$nextTick(() => {
          proxy.$refs.Channel.getList();
        });
      }
      // 关闭直播流
      if (
        panel.name !== "sipPlayer" &&
        proxy.$refs.deviceLiveStream &&
        proxy.$refs.deviceLiveStream.playing
      ) {
        proxy.$refs.deviceLiveStream.closeDestroy(false);
      }
      // 关闭录像流
      if (
        panel.name !== "sipVideo" &&
        proxy.$refs.deviceVideo &&
        proxy.$refs.deviceVideo.playing
      ) {
        proxy.$refs.deviceVideo.closeDestroy();
      }
    }
  });

  proxy.$nextTick(() => {
    // 获取监测统计数据
    if (panel.name === "deviceStastic") {
      proxy.$refs.deviceStatistic.getListHistory();
    } else if (panel.name === "deviceSub") {
      if (form.serialNumber) {
        proxy.$refs.deviceSub.queryParams.gwDeviceId = form.deviceId;
        proxy.$refs.deviceSub.gateway.gwDeviceId = form.deviceId;
        proxy.$refs.deviceSub.getList();
      }
    }
  });
  if (form.deviceType !== 3) {
    // 用于关闭视频推流（页面切换时候需要关闭推流）
    if (panel.name !== "inlineVideo") {
      proxy.$refs.deviceInlineVideo && proxy.$refs.deviceInlineVideo.handleClose();
    }
    if (panel.name !== "scada") {
      const scadaRef = proxy.$refs.deviceScada || {};
      if (scadaRef && scadaRef.$refs && scadaRef.$refs.deviceScada) {
        const copmRef = scadaRef.$refs.deviceScada;
        if (copmRef.$refs && copmRef.$refs.spirit) {
          copmRef.$refs.spirit.forEach((item) => {
            if (item.$vnode.tag.includes("ViewInlineVideo")) {
              item.handleCloseJessibuca();
            }
          });
        }
      }
    }
  }
}

// 获取设备详情
async function getDevice2(deviceId) {
  const response = await getDevice(deviceId);

  // 获取设备状态和物模型
  await getDeviceStatusWitchThingsModel(response);
}

// 获取缓存物模型
async function getCacheThingsModdel(productId) {
  try {
    const response = await cacheJsonThingsModel(productId);
    return JSON.parse(response.data);
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 获取设备运行状态
async function getDeviceStatus(data) {
  const params = {
    deviceId: data.deviceId,
  };
  try {
    const response = await getDeviceRunningStatus(params);
    return response.data.thingsModels;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 格式化物模型
function formatThingsModel(data) {
  data.chartList = [];
  data.monitorList = [];
  data.staticList = [];
  // 物模型格式化
  for (let i = 0; i < data.thingsModels.length; i++) {
    // 数字类型设置默认值并转换未数值
    if (
      data.thingsModels[i].datatype.type == "integer" ||
      data.thingsModels[i].datatype.type == "decimal"
    ) {
      if (data.thingsModels[i].shadow == "") {
        data.thingsModels[i].shadow = Number(data.thingsModels[i].datatype.min);
      } else {
        data.thingsModels[i].shadow = Number(data.thingsModels[i].shadow);
      }
    }

    // 物模型分类放置
    if (data.thingsModels[i].datatype.type == "array") {
      if (data.thingsModels[i].datatype.arrayType == "object") {
        for (let k = 0; k < data.thingsModels[i].datatype.arrayParams.length; k++) {
          for (let j = 0; j < data.thingsModels[i].datatype.arrayParams[k].length; j++) {
            // 数组元素中参数ID添加前缀，例如：array_00_
            let index = k > 9 ? String(k) : "0" + k;
            let prefix = "array_" + index + "_";
            data.thingsModels[i].datatype.arrayParams[k][j].id =
              prefix + data.thingsModels[i].datatype.arrayParams[k][j].id;
            // 图表、实时监测、监测统计分类放置
            if (data.thingsModels[i].datatype.arrayParams[k][j].isChart == 1) {
              // 图表
              data.thingsModels[i].datatype.arrayParams[k][j].name =
                "[" +
                data.thingsModels[i].name +
                (k + 1) +
                "] " +
                data.thingsModels[i].datatype.arrayParams[k][j].name;
              data.thingsModels[i].datatype.arrayParams[k][j].datatype.arrayType =
                "object";
              data.chartList.push(data.thingsModels[i].datatype.arrayParams[k][j]);

              if (data.thingsModels[i].datatype.arrayParams[k][j].isMonitor == 1) {
                // 实时监测
                data.monitorList.push(data.thingsModels[i].datatype.arrayParams[k][j]);
              }
              data.thingsModels[i].datatype.arrayParams[k].splice(j--, 1);
            }
          }
        }
      } else {
        // 字符串拆分为物模型数组 model=id/name/type/isReadonly/value/shadow
        let values =
          data.thingsModels[i].value != "" ? data.thingsModels[i].value.split(",") : [];
        let shadows =
          data.thingsModels[i].shadow != "" ? data.thingsModels[i].shadow.split(",") : [];
        for (let j = 0; j < data.thingsModels[i].datatype.arrayCount; j++) {
          if (!data.thingsModels[i].datatype.arrayModel) {
            data.thingsModels[i].datatype.arrayModel = [];
          }
          // 数组里面的ID需要添加前缀和索引，例如：array_00_temperature
          let index = j > 9 ? String(j) : "0" + j;
          let prefix = "array_" + index + "_";
          data.thingsModels[i].datatype.arrayModel[j] = {
            id: prefix + data.thingsModels[i].id,
            name: data.thingsModels[i].name,
            type: data.thingsModels[i].type,
            isReadonly: data.thingsModels[i].isReadonly,
            value: values[j] ? values[j] : "",
            shadow: shadows[j] ? shadows[j] : "",
          };
        }
      }
    } else if (data.thingsModels[i].datatype.type == "object") {
      for (let j = 0; j < data.thingsModels[i].datatype.params.length; j++) {
        // 图表、实时监测、监测统计分类放置
        if (data.thingsModels[i].datatype.params[j].isChart == 1) {
          // 图表
          data.thingsModels[i].datatype.params[j].name =
            "[" +
            data.thingsModels[i].name +
            "] " +
            data.thingsModels[i].datatype.params[j].name;
          data.chartList.push(data.thingsModels[i].datatype.params[j]);

          if (data.thingsModels[i].datatype.params[j].isMonitor == 1) {
            // 实时监测
            data.monitorList.push(data.thingsModels[i].datatype.params[j]);
          }
          data.thingsModels[i].datatype.params.splice(j--, 1);
        }
      }
    } else if (data.thingsModels[i].isChart == 1) {
      // 图表、实时监测、监测统计分类放置
      data.chartList.push(data.thingsModels[i]);

      if (data.thingsModels[i].isMonitor == 1) {
        // 实时监测
        data.monitorList.push(data.thingsModels[i]);
      }
      // 使用i--解决索引变更问题
      data.thingsModels.splice(i--, 1);
    }
  }
}

// 返回按钮
function goBack() {
  const obj = {
    path: "/iot/device",
    query: {
      t: Date.now(),
      pageNum: route.query.pageNum,
    },
  };
  proxy.$tab.closeOpenPage(obj);
  reset();
}

// 表单重置
function reset() {
  Object.assign(form, {
    deviceId: 0,
    deviceName: null,
    productId: null,
    productName: null,
    userId: null,
    userName: null,
    tenantId: null,
    tenantName: null,
    serialNumber: "",
    firmwareVersion: 1.0,
    status: 1,
    rssi: null,
    networkAddress: null,
    networkIp: null,
    longitude: null,
    latitude: null,
    activeTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    locationWay: 1,
    clientId: 0,
  });
  deviceStatus.value = 0;
  proxy.resetForm("formRef");
}

// 提交按钮
async function submitForm() {
  if (form.serialNumber == null || form.serialNumber == 0) {
    proxy.$modal.alertError("设备编号不能为空");
    return;
  }
  let reg = /^[0-9a-zA-Z]+$/;
  if (!reg.test(form.serialNumber)) {
    proxy.$modal.alertError("设备编号只能是字母和数字");
    return;
  }
  if (form.productId == null || form.productId == 0) {
    proxy.$modal.alertError("所属产品不能为空");
    return;
  }

  formRef.value.validate((valid) => {
    if (valid) {
      if (form.deviceId != 0) {
        
        // const updateData = {};
        // updateData.deviceId = form.deviceId;
        // updateData.deviceName = form.deviceName;
        // updateData.productId = form.productId;
        // updateData.status = form.status;
        // updateData.productName = form.productName;
        // updateData.serialNumber = form.serialNumber;
        // updateData.expirationTime = form.expirationTime;
        // updateData.maintenanceTime = form.maintenanceTime;
        // updateData.remark = form.remark;
        // updateData.locationWay = form.locationWay;
        // updateData.longitude = form.longitude;
        // updateData.latitude = form.latitude;
        // updateData.networkAddress = form.networkAddress;
        // updateData.remark = form.remark;
         
        
        updateDevice(form).then(async (response) => {
          if (response.data == 0) {
            proxy.$modal.alertError(response.msg);
          } else {
            // 修改成功后，重新获取设备详情数据
            try {
              await getDevice2(form.deviceId);
              // 刷新页面数据后弹出成功提示
              proxy.$modal.alertSuccess("修改成功");
            } catch (error) {
              console.error("获取设备详情失败:", error);
              // 即使获取详情失败，也显示修改成功
              proxy.$modal.alertSuccess("修改成功");
            }
          }
        });
      } else {
        addDevice(form).then(async (response) => {
          // 获取设备状态
          await getDeviceStatusWitchThingsModel(response);
          if (form.deviceId == null || form.deviceId == 0) {
            proxy.$modal.alertError("设备编号已经存在，添加设备失败");
          } else {
            if (form.status == 2) {
              deviceStatus.value = 1;
            }
            proxy.$modal.alertSuccess("添加设备成功");
          }
        });
      }
    }
  });
}

// 获取设备状态和物模型
async function getDeviceStatusWitchThingsModel(response) {
  // 获取缓存物模型
  response.data.cacheThingsModel = await getCacheThingsModdel(response.data.productId);

  // 获取设备运行状态
  response.data.thingsModels = await getDeviceStatus(response.data);

  // 格式化物模型，拆分出监测值,数组添加前缀
  formatThingsModel(response.data);
  Object.assign(form, response.data);
  

  // 根据 form.maintenanceStatus 初始化 showMaintenanceInfo
  showMaintenanceInfo.value = form.maintenanceStatus === 1; // 仅当“启用”时显示维修信息

  // 根据 form.expirationTime 初始化 expirationType
  if (form.expirationTime) {
    expirationType.value = 1; // 有期限
  } else {
    expirationType.value = 2; // 无期限
  }

  // 解析设备摘要
  if (form.summary != null && form.summary != "") {
    summary.value = JSON.parse(form.summary);
  }
  isSubDev.value = form.subDeviceList && form.subDeviceList.length > 0;
  oldDeviceStatus.value = form.status;

  // Mqtt订阅
  connectMqtt();
  mqttSubscribe(form);
}

// 选择产品
function selectProduct() {
  const productComponent = productListRef.value;

  if (!productComponent) {
    console.error("productListRef.value is undefined");
    return;
  }

  console.log("productListRef.value:", productComponent);
  console.log("typeof productComponent.open:", typeof productComponent.open);

  if (typeof productComponent.open === "function") {
    productComponent.open();
    productComponent.getList();
  } else {
    console.warn("open is not a function");
  }
}

function genSipID() {
  proxy.$refs.sipidGen.open = true;
}

// 获取选中的产品
function getProductData(product) {
  form.productId = product.productId;
  form.productName = product.productName;
  form.deviceType = product.deviceType;
  form.tenantId = product.tenantId;
  form.tenantName = product.tenantName;
  if (product.transport === "TCP") {
    openServerTip.value = true;
    serverType.value = 3;
  } else {
    openServerTip.value = false;
    serverType.value = 1;
  }
}

function getSipIDData(devsipid) {
  form.serialNumber = devsipid;
}

// 获取选中的用户
function getUserData(user) {}

// 关闭物模型
function openSummaryDialog() {
  let json = {
    type: 1, // 1=扫码关联设备
    deviceNumber: form.serialNumber,
    productId: form.productId,
  };
  qrText.value = JSON.stringify(json);
  openSummary.value = true;
}

// 关闭物模型
function closeSummaryDialog() {
  openSummary.value = false;
  openViewMqtt.value = false;
}

function doCopy(type) {
  if (type == 2) {
    const input = document.createElement("input");
    input.value =
      '{"clientId":"' +
      listQuery.clientId +
      '","username":"' +
      listQuery.username +
      '","passwd":"' +
      listQuery.passwd +
      '","subscribeTopic":"' +
      listQuery.subscribeTopic +
      '","reportTopic":"' +
      listQuery.reportTopic +
      '","port":"' +
      listQuery.port +
      '"}';
    document.body.appendChild(input);
    input.select(); // 选中输入框
    document.execCommand("Copy"); // 复制当前选中文本到前切板
    document.body.removeChild(input);
    ElMessage.success("复制成功");
  }
}

// 生成随机字母和数字
function generateNum() {
  if (!form.productId || form.productId == 0) {
    proxy.$modal.alertError("请先选择产品");
    return;
  }
  genDisabled.value = true;
  const params = { type: serverType.value };
  generatorDeviceNum(params).then((response) => {
    form.serialNumber = response.data;
    genDisabled.value = false;
  });
}

// mqtt参数查看
function handleViewMqtt() {
  openViewMqtt.value = true;
  const params = {
    deviceId: form.deviceId,
  };
  getMqttConnect(params).then((response) => {
    if (response.code == 200) {
      
      Object.assign(listQuery, response.data);
    }
  });
}

/* 连接Mqtt消息服务器 */
async function connectMqtt() {
  if (mqttTool.client == null) {
    await mqttTool.connect(proxy.vuex_token);
  }
  mqttCallback();
}

/* Mqtt回调处理 */
function mqttCallback() {
  mqttTool.client.on("message", (topic, message, buffer) => {
    let topics = topic.split("/");
    let productId = topics[1];
    let deviceNum = topics[2];
    message = JSON.parse(message.toString());
    if (!message) {
      return;
    }
    if (topics[3] == "status" || topics[2] == "status") {
      console.log("接收到【设备状态-详情】主题：", topic);
      console.log("接收到【设备状态-详情】内容：", message);
      // 更新列表中设备的状态
      if (form.serialNumber == deviceNum) {
        oldDeviceStatus.value = message.status;
        form.status = message.status;
        form.isShadow = message.isShadow;
        form.rssid = message.rssid;
      }
    }
    // 不是modbus不转发到子页面，其他设备的页面有回调方法
    if (isSubDev.value) {
      /* 发送设备上报到子模块 */
      if (topic.endsWith("ws/service")) {
        proxy.$busEvent.$emit("updateData", {
          serialNumber: topics[2],
          productId: form.productId,
          data: message,
        });
      }
    }
    /* 发送设备上报到子模块 */
    if (topic.endsWith("ws/post/simulate")) {
      proxy.$busEvent.$emit("logData", {
        serialNumber: topics[1],
        productId: form.productId,
        data: message,
      });
    }
  });
}

/** Mqtt订阅主题 */
function mqttSubscribe(device) {
  // 订阅当前设备状态和实时监测
  let topicStatus = "/" + device.productId + "/" + device.serialNumber + "/status/post";
  let topicProperty =
    "/" + device.productId + "/" + device.serialNumber + "/property/post";
  let topicFunction =
    "/" + device.productId + "/" + device.serialNumber + "/function/post";
  let topicMonitor = "/" + device.productId + "/" + device.serialNumber + "/monitor/post";
  let topicReply = "/" + device.productId + "/" + device.serialNumber + "/service/reply";
  let topics = [];
  let serviceTop = "/" + device.productId + "/" + device.serialNumber + "/ws/service";
  topics.push(serviceTop);

  topics.push(topicStatus);
  topics.push(topicFunction);
  topics.push(topicMonitor);
  topics.push(topicReply);
  /* modbus设备不订阅此topic */
  if (!isSubDev.value) {
    // topics.push(topicProperty);
  }
  mqttTool.subscribe(topics);
}

/** Mqtt取消订阅主题 */
function mqttUnSubscribe(device) {
  // 订阅当前设备状态和实时监测
  let topicStatus = "/" + device.productId + "/" + device.serialNumber + "/status/post";
  let topicProperty =
    "/" + device.productId + "/" + device.serialNumber + "/property/post";
  let topicFunction =
    "/" + device.productId + "/" + device.serialNumber + "/function/post";
  let topicMonitor = "/" + device.productId + "/" + device.serialNumber + "/monitor/post";
  let topicReply = "/" + device.productId + "/" + device.serialNumber + "/service/reply";
  let topics = [];
  let serviceTop = "/" + device.productId + "/" + device.serialNumber + "/ws/service";
  topics.push(serviceTop);

  topics.push(topicStatus);
  topics.push(topicFunction);
  topics.push(topicMonitor);
  topics.push(topicReply);
  /* modbus设备不订阅此topic */
  if (!isSubDev.value) {
    /* 通过网关再转发 */
    // topics.push(topicProperty);
  }
  mqttTool.unsubscribe(topics);
}
</script>
<style scoped>

.reset-btn {
  width: 140px;
  height: 46px;

  border-radius: 6px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.main-btn {
  width: 140px;
  height: 46px;

  border-radius: 6px;
  margin-right: 15px;
  transition: all 0.2s ease;
}

.main-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.button-group {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding: 20px 0;

}

::v-deep .button-group .el-form-item {
  margin-bottom: 0;
}

.status-radio-group .el-radio-button__inner {
  width: 80px; /* 与旧按钮保持一致的宽度 */
  height: 32px; /* 与旧按钮保持一致的高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: none !important;
}

.status-radio-group .el-radio-button:first-child .el-radio-button__inner {
  border-radius: 4px 0 0 4px; /* 左边按钮的圆角 */
}

.status-radio-group .el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 4px 4px 0; /* 右边按钮的圆角 */
}

.status-radio-group .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: var(--el-color-primary); /* 默认选中颜色 */
  border-color: var(--el-color-primary); /* 默认选中边框颜色 */
  color: white;
}

/* 自定义选中颜色 */
.status-radio-group .el-radio-button__orig-radio:checked + .el-radio-button__inner[type="success"] {
  background-color: green !important;
  border-color: green !important;
}

.status-radio-group .el-radio-button__orig-radio:checked + .el-radio-button__inner[type="warning"] {
  background-color: orange !important;
  border-color: orange !important;
}

.status-radio-group .el-radio-button__orig-radio:checked + .el-radio-button__inner[type="danger"] {
  background-color: red !important;
  border-color: red !important;
}
</style>