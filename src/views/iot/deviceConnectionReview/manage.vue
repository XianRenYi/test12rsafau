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
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 170px">
            <el-option v-for="dict in iot_device_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="审核状态" prop="isApprove">
          <el-select v-model="queryParams.isApprove" placeholder="请选择审核状态" clearable style="width: 170px">
            <el-option v-for="item in reviewStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
     
        <el-form-item>
          <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
          <el-button icon="refresh"  @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
      
         <el-button
                  type="success"
                  icon="Edit"
                  @click="openReviewDialog('batch')"
                  :disabled="selectedDevices.length === 0"
                >
                  批量审核
                </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- List View -->
    <el-card style="padding-bottom: 100px" v-if="showType === 'list'">
      <el-table v-loading="loading" :data="deviceList" border @selection-change="handleSelectionChange">
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" align="center" />
        
        <!-- <el-table-column label="设备名称" align="center" header-align="center" prop="deviceName" min-width="120" /> -->
      
        <el-table-column label="产品名称" align="center" prop="productName" min-width="120" />
        <el-table-column label="产品型号" align="center" prop="productId" min-width="120" />
        <el-table-column label="序列号" align="center" prop="serialNumber" min-width="130" />
        <el-table-column label="状态" align="center" prop="status" width="120">
          <template #default="{row}">
            <dict-tag :options="iot_device_status" :value="row.status"  />
          </template>
        </el-table-column>

        <el-table-column label="审核状态" align="center" prop="isApprove" width="120">
          <template #default="{row}">
            <dict-tag :options="iot_device_isapprove" :value="String(row.isApprove)"  />
          </template>
        </el-table-column>
      
        <el-table-column label="创建时间" align="center" prop="createTime">
          <template #default="{row}">
            <span>{{ row.createTime }}</span>
          </template>
        </el-table-column>
        
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  fixed="right"  min-width="120">
        <template #default="{row}">
          <el-button link type="primary" icon="Check" @click="openReviewDialog('single', row)" v-hasPermi="['system:category:edit']">审核</el-button>
          <el-button link type="primary" icon="odometer"   @click="handleRunDevice(row)" v-hasPermi="['system:category:remove']">详情</el-button>
        </template>
      </el-table-column>


      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :pageSizes="[12, 24, 36, 60]" @pagination="getList" />
    </el-card>

    <!-- 统一审核对话框（批量和单个共用） -->
    <el-dialog :title="reviewDialogTitle" v-model="reviewDialogVisible" :width="reviewDialogWidth">
      <!-- 审核设备列表 -->
      <div class="review-list">
        <el-table 
          :data="reviewDevices" 
          border 
          :show-header="true"
          style="width: 100%; margin-bottom: 20px"
        >
          <el-table-column label="设备名称" align="center" prop="deviceName" min-width="120" />
          <el-table-column label="设备编号" align="center" prop="serialNumber" min-width="130" />
          <el-table-column label="产品名称" align="center" prop="productName" min-width="120" />
          <el-table-column label="产品型号" align="center" prop="productId" min-width="120" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmReview(1)">审核通过</el-button>
        <el-button type="danger" @click="confirmReview(2)">审核不通过</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDict } from '@/utils/dict';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listDeviceConnectionReview, delDevice, updateIsApprove, listDeviceShort } from '@/api/iot/device';
import { listGroup } from '@/api/iot/group';
import { delSipDeviceBySipId } from '@/api/iot/sipdevice';


import mqttTool from '@/utils/mqttTool';

const router = useRouter();

const { parseTime } = useDict();

// 数据状态
const loading = ref(true);
const total = ref(0);
const deviceList = ref([]);
const myGroupList = ref([]);
const openSummary = ref(false);
const showType = ref('list');
const qrText = ref('senbe');
const queryFormRef = ref();

// 新增：下拉框相关变量
const devDeviceList = ref([]);
const productNameList = ref([]);
const filteredProductIdList = ref([]);
const filteredDeviceList = ref([]);

// 审核相关状态
const selectedDevices = ref([]);
const reviewDialogVisible = ref(false);
const reviewDialogTitle = ref('');
const reviewDialogWidth = ref('');
const reviewDevices = ref([]); // 存储当前需要审核的设备列表
const reviewType = ref(''); // 'batch' 或 'single'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: null,
  productId: null,
  groupId: null,
  deviceId: null,
  userId: null,
  userName: null,
  tenantId: null,
  tenantName: null,
  status: null,
  isApprove: null,
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
const { iot_device_status, iot_is_enable, iot_location_way, iot_transport_type, iot_device_isapprove } = proxy.useDict(
  'iot_device_status', 
  'iot_is_enable', 
  'iot_location_way', 
  'iot_transport_type', 
  'iot_device_isapprove'
);

// 手动补充审核状态字典
const localIotDeviceIsApprove = ref([
  { value: '0', label: '未审核' },
  { value: '1', label: '审核通过' },
  { value: '2', label: '审核拒绝' },
  { value: '3', label: '审核中' }
]);

// 审核状态下拉框选项
const reviewStatusOptions = ref([
  { value: '0', label: '未审核' },
  { value: '1', label: '审核通过' },
  { value: '2', label: '审核不通过' }
]);

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

// 查询设备列表
const getList = async () => {
  try {
    loading.value = true;
    
    // 构建查询参数，移除空值
    const params = { ...queryParams };
    if (!params.productName) delete params.productName;
    if (!params.productId) delete params.productId;
    if (!params.deviceId) delete params.deviceId;
    if (!params.isApprove) delete params.isApprove;
    
    const response = await listDeviceConnectionReview(params);
    deviceList.value = response.rows;
    total.value = response.total;
    
    // 确保审核状态为字符串类型（与字典匹配）
    deviceList.value.forEach(item => {
      item.isApprove = String(item.isApprove);
    });
    
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
  queryParams.productName = null;
  queryParams.deviceId = null;
  queryParams.isApprove = null;
  handleQuery();
};

// 编辑设备
const handleEditDevice = (row, activeName = 'basic') => {
  const deviceId = row !== 0 ? row.deviceId : 0;
  const isSubDev = row !== 0 && row.subDeviceCount > 0 ? 1 : 0;
  
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

// 查看设备详情
const handleRunDevice = (row) => {
  const deviceId = row !== 0 ? row.deviceId : 0;
  const isSubDev = row !== 0 && row.subDeviceCount > 0 ? 1 : 0;
  const activeName = row.deviceType === 3 ? 'videoLive' : 'runningStatus';
  
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

// 处理多选变化
const handleSelectionChange = (selection) => {
  selectedDevices.value = selection;
};

// 打开审核对话框（批量或单个）
const openReviewDialog = (type, row = null) => {
  if (type === 'batch') {
    // 批量审核
    if (selectedDevices.value.length === 0) {
      ElMessage.warning('请先选择要审核的设备');
      return;
    }
    reviewType.value = 'batch';
    reviewDialogTitle.value = '批量审核设备';
    reviewDialogWidth.value = '70%';
    reviewDevices.value = [...selectedDevices.value];
  } else if (type === 'single') {
    // 单个审核
    reviewType.value = 'single';
    reviewDialogTitle.value = '审核设备';
    reviewDialogWidth.value = '50%';
    reviewDevices.value = [row];
  }
  
  reviewDialogVisible.value = true;
};

// 确认审核操作（批量和单个共用）
const confirmReview = async (reviewResult) => {
  if (reviewDevices.value.length === 0) {
    ElMessage.warning('未获取到设备信息');
    return;
  }
  
  try {
    loading.value = true;
    // 批量更新设备审核状态
    for (const device of reviewDevices.value) {
      debugger;
      await updateIsApprove({
        deviceId: device.deviceId,
        isApprove: reviewResult.toString() // 转为字符串确保类型匹配
      });
    }
    
    // 根据审核类型显示不同提示
    const message = reviewType.value === 'batch' 
      ? `批量${reviewResult === 1 ? '审核通过' : '审核不通过'}成功`
      : `${reviewResult === 1 ? '审核通过' : '审核不通过'}成功`;
      
    ElMessage.success(message);
    reviewDialogVisible.value = false;
    getList(); // 重新获取列表刷新数据
  } catch (error) {
    ElMessage.error('审核操作失败: ' + (error.msg || error.message));
    console.error('Review error:', error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(async () => {
  initRouteParams();
  
  // 新增：获取下拉框数据
  await getDeviceListForDropdown();
  
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

.review-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.el-dialog__body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 操作按钮样式调整 */
:deep(.el-button--text) {
  margin: 0 5px;
}
</style>
    