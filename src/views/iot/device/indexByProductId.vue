<template>
  <div style="padding: 6px">
    <el-card style="margin-bottom: 6px">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="75px" style="margin-bottom: -20px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable  @keyup.enter="handleQuery" style="width: 150px" />
        </el-form-item>
        <el-form-item label="设备编号" prop="serialNumber">
          <el-input v-model="queryParams.serialNumber" placeholder="请输入设备编号" clearable  @keyup.enter="handleQuery" style="width: 150px" />
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择设备状态" clearable  style="width: 150px">
            <el-option v-for="dict in iot_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
     
        <el-form-item>
          <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
          <el-button icon="refresh"  @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" plain icon="plus"  @click="handleEditDevice(0)" v-hasPermi="['iot:device:add']">新增</el-button>
          <el-button type="primary" plain icon="grid"  @click="handleChangeShowType" v-hasPermi="['iot:device:add']">切换</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- List View -->
    <el-card style="padding-bottom: 100px" v-if="showType === 'list'">
      <el-table v-loading="loading" :data="deviceList" border>
        <el-table-column label="编号" align="center" header-align="center" prop="deviceId" width="50" />
        <el-table-column label="设备名称" align="center" header-align="center" prop="deviceName" min-width="120" />
        <el-table-column label="设备编号" align="center" prop="serialNumber" min-width="130" />
        <el-table-column label="所属产品" align="center" prop="productName" min-width="120" />
        <el-table-column label="协议" align="center" prop="transport" min-width="50" />
        <el-table-column label="通讯协议" align="center" prop="protocolCode" min-width="100" />
        <el-table-column label="子设备数" align="center" prop="subDeviceCount" width="80">
          <template #default="{row}">
            {{ row.subDeviceCount }}
          </template>
        </el-table-column>
  
        <el-table-column label="状态" align="center" prop="status" width="80">
          <template #default="{row}">
            <dict-tag :options="iot_device_status" :value="row.status"  />
          </template>
        </el-table-column>
        <el-table-column label="信号" align="center" prop="rssi" width="60">
          <template #default="{row}">
            <svg-icon v-if="row.status == 3 && row.rssi >= '-55'" icon-class="wifi_4" />
            <svg-icon v-else-if="row.status == 3 && row.rssi >= '-70' && row.rssi < '-55'" icon-class="wifi_3" />
            <svg-icon v-else-if="row.status == 3 && row.rssi >= '-85' && row.rssi < '-70'" icon-class="wifi_2" />
            <svg-icon v-else-if="row.status == 3 && row.rssi >= '-100' && row.rssi < '-85'" icon-class="wifi_1" />
            <svg-icon v-else icon-class="wifi_0" />
          </template>
        </el-table-column>
     
        <el-table-column label="激活时间" align="center" prop="activeTime">
          <template #default="{row}">
            <span>{{ row.activeTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime">
          <template #default="{row}">
            <span>{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="{row}">
            <el-button type="primary"  style="padding: 5px" icon="view" @click="handleEditDevice(row)" v-hasPermi="['iot:device:add']">查看</el-button>
            <el-button type="danger"  style="padding: 5px" icon="delete" @click="handleDelete(row)" v-hasPermi="['iot:device:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :pageSizes="[12, 24, 36, 60]" @pagination="getList" />
    </el-card>

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
                <!-- <label v-if="item.status == '3'">在线</label> <label v-else>离线</label> -->
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
            
            <el-button-group style="margin-top: 15px">
              <el-button type="danger" size="mini" style="padding: 5px 10px" icon="delete" @click="handleDelete(item)" v-hasPermi="['iot:device:remove']">删除</el-button>
              <el-button type="primary" size="mini" style="padding: 5px 15px" icon="view" @click="handleEditDevice(item, 'basic')" v-hasPermi="['iot:device:add']">查看</el-button>
              <el-button type="success" size="mini" style="padding: 5px 15px" icon="odometer" @click="handleRunDevice(item)" v-hasPermi="['iot:device:add']">运行状态</el-button>
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDict } from '@/utils/dict';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listDeviceShort, delDevice } from '@/api/iot/device';
import { listGroup } from '@/api/iot/group';
import { delSipDeviceBySipId } from '@/api/iot/sipdevice';

import gatewayImg from "@/assets/images/gateway.png";
import videoImg from "@/assets/images/video.png";
import productImg from "@/assets/images/product.png";
import mqttTool from '@/utils/mqttTool';

const router = useRouter();

const { parseTime } = useDict();

// 数据状态
const loading = ref(true);
const total = ref(0);
const deviceList = ref([]);
const myGroupList = ref([]);
const openSummary = ref(false);
const showType = ref('card');
const qrText = ref('senbe');
const queryFormRef = ref();

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 13,
  deviceName: null,
  productId: null,
  groupId: null,
  productName: null,
  userId: null,
  userName: null,
  tenantId: null,
  tenantName: null,
  serialNumber: null,
  status: null,
  networkAddress: null,
  activeTime: null,
});

// 表单参数
const form = reactive({
  productId: 0,
  status: 1,
  locationWay: 1,
  firmwareVersion: 1.0,
  serialNumber: '',
  deviceType: 1,
  isSimulate: 0,
});

const baseUrl = import.meta.env.VITE_APP_BASE_API;

const { proxy } = getCurrentInstance();
const { iot_device_status, iot_is_enable, iot_location_way, iot_transport_type} = proxy.useDict('iot_device_status', 'iot_is_enable', 'iot_location_way', 'iot_transport_type');


// 初始化路由参数
const initRouteParams = () => {

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

// 查询设备列表
const getList = async () => {
  try {
    loading.value = true;
    const response = await listDeviceShort(queryParams);
    deviceList.value = response.rows.filter(device => device.deviceId !== 118);
    total.value = response.total - 1;
    
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
  queryParams.productId = null;
  queryParams.groupId = null;
  queryParams.serialNumber = null;
  queryFormRef.value.resetFields();
  handleQuery();
};

// 切换显示方式
const handleChangeShowType = () => {
  showType.value = showType.value === 'card' ? 'list' : 'card';
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
  const activeName = row.deviceType === 3 ? 'videoLive' : 'runningStatus';
  
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

// 初始化
onMounted(async () => {
  
  const route = useRoute();

  let productId = route.query.productId;
        if (productId != null) {
    queryParams.productId = Number(productId);
    queryParams.groupId = null;
    queryParams.serialNumber = null;
        }

  
  if(mqttTool.client == null){
    await mqttTool.connect();
  }
  mqttCallback();
  getList();
});
</script>

<style scoped>
.card-item {
  border-radius: 15px;
}
</style>