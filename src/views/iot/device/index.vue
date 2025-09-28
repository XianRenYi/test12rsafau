<template>
  <div style="padding: 6px">
    <el-card style="margin-bottom: 6px">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px" style="margin-bottom: -20px">
        <el-form-item label="产品名称" prop="productName">
          <el-select
            style="width: 170px"
            v-model="queryParams.productName"
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
        <el-form-item label="产品型号" prop="productId">
          <el-select
            style="width: 170px"
            v-model="queryParams.productId"
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
        <el-form-item label="序列号" prop="deviceId">
          <el-select
            style="width: 170px"
            v-model="queryParams.deviceId"
            :placeholder="'请选择设备序列号'"
            filterable
            clearable
            @change="handleDeviceChange"
          >
            <el-option
              v-for="(item, index) in filteredDeviceList"
              :key="index"
              :label="item.deviceName +  '(' + item.productId + ')' +  '(' + item.serialNumber + ')' "
              :value="item.deviceId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="在线状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择在线状态" clearable  style="width: 150px">
            <el-option v-for="dict in iot_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
     
        <el-form-item>
          <el-button type="primary" icon="search"  @click="handleQuery" v-hasPermi="['iot:device:query']">搜索</el-button>
          <el-button icon="refresh"  @click="resetQuery"  v-hasPermi="['iot:device:query']">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" plain icon="plus"  @click="handleAddDevice" v-hasPermi="['iot:device:add']">新增</el-button>
          
          <el-button type="primary" plain icon="grid"  @click="handleChangeShowType" v-hasPermi="['iot:device:qiehuan']">切换</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- List View -->
    <el-card style="padding-bottom: 100px" v-if="showType === 'list'">
      <el-table v-loading="loading" :data="deviceList" border>
        <!-- <el-table-column label="设备名称" align="center" header-align="center" prop="deviceName" min-width="120" /> -->
     
        <el-table-column label="产品名称" align="center" prop="productName" min-width="120" />
        <el-table-column label="产品型号" align="center" prop="productId" min-width="120" />
        <el-table-column label="序列号" align="center" prop="serialNumber" min-width="130" />
        <el-table-column label="在线状态" align="center" prop="status" width="80">
          <template #default="{row}">
            <dict-tag :options="iot_device_status" :value="row.status"  />
          </template>
        </el-table-column>
        <el-table-column label="维护状态" align="center" prop="maintenanceStatusName" width="80"/>
        <!-- <el-table-column label="信号" align="center" prop="rssi" width="60">
          <template #default="{row}">
            <svg-icon v-if="row.status == 3 && row.rssi >= '-55'" icon-class="wifi_4" />
            <svg-icon v-else-if="row.status == 3 && row.rssi >= '-70' && row.rssi < '-55'" icon-class="wifi_3" />
            <svg-icon v-else-if="row.status == 3 && row.rssi >= '-85' && row.rssi < '-70'" icon-class="wifi_2" />
            <svg-icon v-else-if="row.status == 3 && row.rssi >= '-100' && row.rssi < '-85'" icon-class="wifi_1" />
            <svg-icon v-else icon-class="wifi_0" />
          </template>
        </el-table-column> -->
     
        <!-- <el-table-column label="激活时间" align="center" prop="activeTime">
          <template #default="{row}">
            <span>{{ row.activeTime }}</span>
        </el-table-column> -->
        <el-table-column label="创建时间" align="center" prop="createTime"  min-width="120" >
          <template #default="{row}">
            <span>{{ row.createTime }}</span>
          </template>
        </el-table-column>

 
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="400">
          <template  #default="{row}" >

 
          <el-button class="el-button--mini"  @click="handleQueryHistoryRealTime(row)"  v-hasPermi="['iot:device:sssj']" >实时数据</el-button>
        
          <el-button class="el-button--mini"   @click="handleQueryHistory(row)" v-hasPermi="['iot:device:lssj']"  >历史数据</el-button>
        
          <el-button class="el-button--mini"  @click="handleRunDevice(row)"  v-hasPermi="['iot:device:edit']">编辑</el-button>
                  
          <el-button  class="el-button--mini"  @click="handleDelete(row)" v-hasPermi="['iot:device:remove']"  >删除</el-button>



          </template>
        </el-table-column>

      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :pageSizes="[12, 24, 36, 60]" @pagination="getList" />
    </el-card>

    <!-- 添加或修改产品对话框 -->
    <el-dialog :title="'新增设备'" v-model="openDevicceAdd" width="700px"  append-to-body  :close-on-click-modal="false"
                 :close-on-press-escape="false">
          <!-- 选择产品 -->
          <productList
            ref="productListRef"
            :productId="form.productId"
            @productEvent="getProductData($event)"
          />
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="100">
              <el-col >
                <el-form-item label="" prop="productName">
                  <template #label>
                    <span style="color: red">*</span>
                    所属产品
                  </template>
                  <el-input
                    readonly
                    v-model="form.productName"
                    placeholder="请选择产品"
                    :disabled="form.status != 1"
                  >
                    <template #append>
                      <el-button @click="selectProduct()" :disabled="form.status != 1"
                        >选择产品</el-button
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
                    :disabled="true"
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
                    <template #append>
                      <el-button
                        @click="generateNum"
                        v-hasPermi="['iot:device:add']"
                        >生成</el-button
                      >
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="设备名称" prop="deviceName">
                  <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量导入组件 -->
    <batchImport 
      ref="batchImportRef" 
      @refresh-list="getList" 
    />

    <!-- Card View -->
    <el-card style="padding-bottom: 100px" v-if="showType === 'card'">
      <el-row :gutter="30" v-loading="loading">
        <el-col 
          v-for="(item, index) in deviceList" 
          :key="index" 
          :xs="24" :sm="12" :md="12" :lg="8" :xl="6" 
          style="margin-bottom: 30px; text-align: center"
        >
          <el-card :body-style="{ padding: '20px' }" shadow="always" class="card-item">
            <el-row type="flex" :gutter="10" justify="space-between">
              <el-col :span="20" style="text-align: left">
                <el-link type="" :underline="false" @click="handleEditDevice(item)" style="font-weight: bold; font-size: 16px; line-height: 32px">
                   <span style="margin: 0 5px">{{ item.deviceName }}</span>   
                </el-link>
              </el-col>
              <el-col :span="1.5" style="font-size: 20px; padding-top: 5px; cursor: pointer">
              </el-col>
              <el-col :span="3">
                <div style="font-size: 28px; color: #ccc">
                  <svg-icon v-if="item.status == 3 && item.rssi >= '-55'" icon-class="wifi_4" />
                  <svg-icon v-else-if="item.status == 3 && item.rssi >= '-70' && item.rssi < '-55'" icon-class="wifi_3" />
                  <svg-icon v-else-if="item.status == 3 && item.rssi >= '-85' && item.rssi < '-70'" icon-class="wifi_2" />
                  <svg-icon v-else-if="item.status == 3 && item.rssi >= '-100' && item.rssi < '-85'" icon-class="wifi_1" />
                  <svg-icon v-else icon-class="wifi_0" />
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="10">
              <el-col :span="17">
                <div style="text-align: left; line-height: 40px; white-space: nowrap">
                  <dict-tag :options="iot_device_status" :value="item.status"  style="display: inline-block" />
                  <span style="display: inline-block; margin: 0 10px">
                    <el-tag type="primary"  v-if="item.protocolCode">{{ item.protocolCode }}</el-tag>
                  </span>
                  <el-tag type="primary"  v-if="item.transport">{{ item.transport }}</el-tag>
                </div>
                <el-descriptions :column="1" size="mini" style="white-space: nowrap">
                  <el-descriptions-item label="编号">
                    {{ item.serialNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="产品">
                    {{ item.productName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="激活时间">
                    {{item.activeTime }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-col>
              <el-col :span="7">
                <div style="margin-top: 10px">
                  <el-image 
                    v-if="item.imgUrl" 
                    style="width: 100%; height: 100px; border-radius: 10px" 
                    lazy 
                    :preview-src-list="[baseUrl + item.imgUrl]" 
                    :src="baseUrl + item.imgUrl" 
                    fit="cover"
                  />
                  <el-image 
                    v-else-if="item.deviceType == 2"
                    style="width: 100%; height: 100px; border-radius: 10px" 
                    :preview-src-list="[gatewayImg]" 
                    :src="gatewayImg" 
                    fit="cover"
                  />
                  <el-image 
                    v-else-if="item.deviceType == 3"
                    style="width: 100%; height: 100px; border-radius: 10px" 
                    :preview-src-list="[videoImg]" 
                    :src="videoImg" 
                    fit="cover"
                  />
                  <el-image 
                    v-else
                    style="width: 100%; height: 100px; border-radius: 10px" 
                    :preview-src-list="[productImg]" 
                    :src="productImg" 
                    fit="cover"
                  />
                </div>
              </el-col>
            </el-row>
            
      <el-divider  style="margin-top: 5px" />
            <el-button-group style="margin-top: -20px">
          
          <el-button class="el-button--mini"  @click="handleQueryHistoryRealTime(item)"  v-hasPermi="['iot:device:sssj']" >实时数据</el-button>
        
          <el-button class="el-button--mini"   @click="handleQueryHistory(item)" v-hasPermi="['iot:device:lssj']"  >历史数据</el-button>
        
          <el-button class="el-button--mini"  @click="handleRunDevice(item)"  v-hasPermi="['iot:device:edit']">编辑</el-button>
                  
          <el-button  class="el-button--mini"  @click="handleDelete(item)" v-hasPermi="['iot:device:remove']"  >删除</el-button>


            </el-button-group>
          </el-card>
        </el-col>
      </el-row>
      
      <el-empty description="暂无数据，请添加设备" v-if="total === 0" />
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :pageSizes="[12, 24, 36, 60]" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDict } from '@/utils/dict';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listDeviceShort, delDevice, addDevice, updateDevice } from '@/api/iot/device';
import { listGroup } from '@/api/iot/group';
import { delSipDeviceBySipId } from '@/api/iot/sipdevice';
import productList from "./components/product-list.vue";
import gatewayImg from "@/assets/images/gateway.png";
import videoImg from "@/assets/images/video.png";
import productImg from "@/assets/images/product.png";
import mqttTool from '@/utils/mqttTool';

// 引入批量导入组件
import batchImport from './components/batch-import-dialog.vue';

const router = useRouter();
const { parseTime } = useDict();

// Refs
const formRef = ref();
const batchImportRef = ref(); // 批量导入组件引用
const loading = ref(true);
const total = ref(0);
const deviceList = ref([]);
const myGroupList = ref([]);
const openSummary = ref(false);
const openDevicceAdd = ref(false);
const showType = ref('list');
const qrText = ref('senbe');
const queryFormRef = ref();
const productListRef = ref();
const deviceType = ref('SENBE');

// 新增：支持下拉框的数据变量
const productNameList = ref([]);
const filteredProductIdList = ref([]);
const filteredDeviceList = ref([]);
const devDeviceList = ref([]);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: null,
  productId: null,
  deviceId: null,
  groupId: null,
  userId: null,
  userName: null,
  tenantId: null,
  tenantName: null,
  status: null,
  networkAddress: null,
  activeTime: null,
});

// 表单参数
const form = reactive({
  productId: '',
  status: 1,
  locationWay: 1,
  firmwareVersion: 1.0,
  serialNumber: '',
  deviceType: 1,
  isSimulate: 0,
  productName: ''
});

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const { proxy } = getCurrentInstance();
const { iot_device_status, iot_is_enable, iot_location_way, iot_transport_type} = proxy.useDict(
  'iot_device_status', 'iot_is_enable', 'iot_location_way', 'iot_transport_type'
);

// 打开批量导入对话框
const handleBatchImport = () => {
  if (batchImportRef.value) {
    batchImportRef.value.openDialog();
  }
};

// 选择产品
const selectProduct = () => {
  const productComponent = productListRef.value;
  if (!productComponent) {
    console.error("productListRef.value is undefined");
    return;
  }
  if (typeof productComponent.open === "function") {
    productComponent.open();
    productComponent.getList();
  } else {
    console.warn("open is not a function");
  }
};

// 获取选中的产品
const getProductData = (product) => {
  form.productId = product.productId;
  form.productName = product.productName;
  form.deviceName = product.productName;
  form.serialNumber = generateSingleSerial();
};

const cancel = () => {
  openDevicceAdd.value = false;
  proxy.resetForm("formRef");
};

// 提交按钮
async function submitForm() {
  if (!form.serialNumber) {
    proxy.$modal.alertError("序列号不能为空");
    return;
  }
  const reg = /^[0-9a-zA-Z]+$/;
  if (!reg.test(form.serialNumber)) {
    proxy.$modal.alertError("序列号只能是字母和数字");
    return;
  }
  if (!form.productId) {
    proxy.$modal.alertError("所属产品不能为空");
    return;
  }

  formRef.value.validate((valid) => {
    if (valid) {
      addDevice(form).then(async (response) => {
        openDevicceAdd.value = false;
        proxy.resetForm("formRef");
        proxy.$modal.msgSuccess("新增成功");
        getList();
      });
    }
  });
}

const generateNum = () => {
  if (!form.productId) {
    proxy.$modal.alertError("请先选择产品");
    return;
  }
  form.serialNumber = generateSingleSerial();
};

/** 生成单个IoT序列号 */
const generateSingleSerial = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomStr += chars[randomIndex];
  }
  
  return `${deviceType.value}${year}${month}${day}${randomStr}`;
};

// 初始化路由参数
const initRouteParams = () => {
  const route = useRoute();
  const { productId, groupId, sn, pageNum } = route.query;
  
  if (productId) {
    queryParams.productId = Number(productId);
    queryParams.groupId = null;
    queryParams.serialNumber = null;
  }
  
  if (groupId) {
    queryParams.groupId = Number(groupId);
    queryParams.productId = null;
    queryParams.serialNumber = null;
  }
  
  if (sn) {
    queryParams.serialNumber = sn;
    queryParams.productId = null;
    queryParams.groupId = null;
  }
  
  if (pageNum) {
    queryParams.pageNum = Number(pageNum);
  }
};

// MQTT回调处理
const mqttCallback = () => {
  mqttTool.client.on('message', (topic, message) => {
    const topics = topic.split('/');
    const deviceNum = topics[2];
    const msg = JSON.parse(message.toString());
    
    if (!msg || topics[3] !== 'status') return;
    
    console.log('接收到【设备状态】主题：', topic);
    console.log('接收到【设备状态】内容：', msg);
    
    // 更新设备状态
    const device = deviceList.value.find(d => d.serialNumber === deviceNum);
    if (device) {
      device.status = msg.status;
      device.isShadow = msg.isShadow;
      device.rssi = msg.rssi;
    }
  });
};

// 订阅MQTT主题
const mqttSubscribe = (devices) => {
  const topics = devices.map(device => `/${device.productId}/${device.serialNumber}/status/post`);
  mqttTool.subscribe(topics);
};

// 查询设备分组列表
const getGroupList = async () => {
  try {
    loading.value = true;
    const response = await listGroup({
      pageSize: 30,
      pageNum: 1,
      userId: JSON.parse(localStorage.getItem('userInfo')).userId,
    });
    myGroupList.value = response.rows;
  } catch (error) {
    console.error('Error fetching group list:', error);
  } finally {
    loading.value = false;
  }
};

// 新增：获取设备列表并初始化下拉框数据
const getDeviceListForDropdown = async () => {
  try {
    const params = {
      showChild: true,
      pageNum: 1,
      pageSize: 9999,
    };
    
    return new Promise((resolve) => {
      listDeviceShort(params).then((data) => {
        if (data.code === 200) {
          // 保存完整的设备列表
          devDeviceList.value = data.rows;
          
          // 提取唯一的产品名称
          const uniqueProductNames = [...new Set(data.rows.map(item => item.productName))];
          productNameList.value = uniqueProductNames;
          
          // 初始化过滤后的产品型号和设备列表 - 让产品型号默认也可以直接选择
          const uniqueProductIds = [...new Set(data.rows.map(item => item.productId))];
          filteredProductIdList.value = uniqueProductIds;
          filteredDeviceList.value = data.rows;
          
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

// 新增：产品名称变化处理
const handleProductNameChange = (val) => {
  queryParams.productId = null;
  queryParams.deviceId = null;
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

// 新增：产品型号变化处理
const handleProductIdChange = (val) => {
  queryParams.deviceId = null;
  if (val) {
    if (queryParams.productName) {
      // 如果同时选择了产品名称和产品型号，按两者过滤
      filteredDeviceList.value = devDeviceList.value.filter(
        item => item.productName === queryParams.productName && item.productId === val
      );
    } else {
      // 如果只选择了产品型号，按产品型号过滤
      filteredDeviceList.value = devDeviceList.value.filter(
        item => item.productId === val
      );
    }
  } else if (queryParams.productName) {
    // 如果只选择了产品名称，按产品名称过滤
    filteredDeviceList.value = devDeviceList.value.filter(
      item => item.productName === queryParams.productName
    );
  } else {
    // 如果都没有选择，显示所有设备
    filteredDeviceList.value = devDeviceList.value;
  }
};

// 新增：设备选择变化处理
const handleDeviceChange = (val) => {
  if (val) {
    // 根据选择的设备自动填充产品名称和产品型号
    setProductInfoFromDevice(val);
  }
};
  // 查询历史数据
  function handleQueryHistory(item) {
    router.push({
      path: "/screen/dataCenterHistory",
      query: {
        deviceId: item.deviceId,
     //   identifier: item.identifier,
        activeName: "device",
      },
    });
  }
   // 查询历史数据
   function handleQueryHistoryRealTime(item) {
    router.push({
      path: "/screen/dataCenterHistoryRealTime",
      query: {
        deviceId: item.deviceId,
     //   identifier: item.identifier,
        activeName: "device",
      },
    });
  }
  
// 查询设备列表
const getList = async () => {
  try {
    loading.value = true;
    
    // 构建查询参数，移除空值
    const params = { ...queryParams };
    if (!params.productName) delete params.productName;
    if (!params.productId) delete params.productId;
    if (!params.deviceId) delete params.deviceId;
    
    const response = await listDeviceShort(params);
    deviceList.value = response.rows;
    total.value = response.total;
    
    if (deviceList.value.length > 0) {
      mqttSubscribe(deviceList.value);
    }
  } catch (error) {
    console.error('Error fetching device list:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索按钮操作
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置按钮操作
const resetQuery = () => {
  queryParams.productName = null;
  queryParams.productId = null;
  queryParams.deviceId = null;
  queryParams.groupId = null;
  queryFormRef.value.resetFields();
  
  // 重置过滤后的列表
  const uniqueProductIds = [...new Set(devDeviceList.value.map(item => item.productId))];
  filteredProductIdList.value = uniqueProductIds;
  filteredDeviceList.value = devDeviceList.value;
  
  handleQuery();
};

// 切换显示方式
const handleChangeShowType = () => {
  showType.value = showType.value === 'card' ? 'list' : 'card';
};

const handleAddDevice = () => {
  openDevicceAdd.value = true;
};

// 编辑设备
const handleEditDevice = (row, activeName = 'basic') => {
  const deviceId = row !== 0 ? row.deviceId : 0;
  const isSubDev = row !== 0 && row.subDeviceCount > 0 ? 1 : 0;
  
  router.push({
    path: '/iot/device-edit',
    query: {
      deviceId,
      isSubDev,
      pageNum: queryParams.pageNum,
      activeName,
    },
  });
};

// 运行状态
const handleRunDevice = (row) => {
  const deviceId = row !== 0 ? row.deviceId : 0;
  const isSubDev = row !== 0 && row.subDeviceCount > 0 ? 1 : 0;
  const activeName = 'basic';
  
  router.push({
    path: '/iot/deviceDetail',
    query: {
      deviceId,
      isSubDev,
      pageNum: queryParams.pageNum,
      activeName,
    },
  });
};

// 删除设备
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`是否确认删除设备编号为"${row.deviceId}"的数据项？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    if (row.deviceType === 3) {
      await delSipDeviceBySipId(row.serialNumber);
    }
    
    await delDevice(row.deviceId);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    console.log('Delete canceled', error);
  }
};

// 根据设备ID设置产品信息的通用函数
const setProductInfoFromDevice = (deviceId) => {
  const selectedDevice = devDeviceList.value.find(item => item.deviceId === deviceId);
  if (selectedDevice) {
    queryParams.productName = selectedDevice.productName;
    queryParams.productId = selectedDevice.productId;
    
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

// 初始化
onMounted(async () => {
  const route = useRoute();
  const { productId } = route.query;
  
  if (productId != null) {
    queryParams.productId = Number(productId);
    queryParams.groupId = null;
  }
  
  // 新增：获取下拉框数据
  await getDeviceListForDropdown();
  
  if (!mqttTool.client) {
    await mqttTool.connect();
  }
  mqttCallback();
  getList();
});
</script>

<style scoped>
.el-button--mini {
    border: 0 ;
    padding: 7px 15px;
    font-size: 15px;
    border-radius: 3px;
}
</style>
