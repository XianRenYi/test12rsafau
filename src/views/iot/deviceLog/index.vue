<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
        <el-form-item label="序列号" prop="serialNumber">
          <el-select
            style="width: 170px"
            v-model="queryParams.serialNumber"
            :placeholder="'请选择设备序列号'"
            filterable
            clearable
            @change="handleSerialNumberChange"
          >
            <el-option
              v-for="(item, index) in filteredDeviceList"
              :key="index"
              :label="item.deviceName +  '(' + item.productId + ')' +  '(' + item.serialNumber + ')' "
              :value="item.serialNumber"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监测因子" prop="identity">
            <el-input
              v-model="queryParams.identity"
              placeholder="请输入监测因子"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px"
            clearable
          />
        </el-form-item>
        <!-- <el-form-item label="系统通用" prop="isSys"    style="width: 240px">
          <el-select v-model="queryParams.isSys" placeholder="请选择是否系统通用" clearable >
            <el-option
              v-for="dict in iot_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item> -->
      
   
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
            >导出</el-button>
        </el-form-item>
      </el-form>
  
    
  
      <el-table v-loading="loading" :data="categoryList">
        <el-table-column label="序列号" align="center" prop="serialNumber" min-width="130" />
        <el-table-column label="产品名称" align="center" prop="deviceName" min-width="120" />
        <el-table-column label="监测因子" align="center" prop="identity" />
        <el-table-column label="数值" align="center" prop="logValue" />
        <el-table-column label="创建时间" align="center" prop="createTime" />
     
  
      </el-table>
      
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
  
   
    </div>
  </template>
  
  <script setup name="Category">
  import { listDeviceLog } from '@/api/iot/deviceLog'
import { listDeviceShort } from '@/api/iot/device'
import { ref, reactive, onMounted, getCurrentInstance, toRefs } from 'vue'
  
  

  const { proxy } = getCurrentInstance()
  const { iot_yes_no } = proxy.useDict('iot_yes_no')
  
  const categoryList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref("")
  
  // 新增：支持下拉框的数据变量
  const productNameList = ref([])
  const filteredDeviceList = ref([])
  const devDeviceList = ref([])
  
  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      productName: null,
      serialNumber: null,
      identity: null,
      categoryName: null,
      tenantId: null,
      tenantName: null,
      isSys: null,
      parentId: null,
      orderNum: null,
      dateRange: null,
    },
    rules: {
      categoryName: [
        { required: true, message: "产品分类名称不能为空", trigger: "blur" }
      ],
      tenantId: [
        { required: true, message: "租户ID不能为空", trigger: "blur" }
      ],
      tenantName: [
        { required: true, message: "租户名称不能为空", trigger: "blur" }
      ],
      isSys: [
        { required: true, message: "是否系统通用不能为空", trigger: "change" }
      ],
    }
  })
  
  const { queryParams, form, rules } = toRefs(data)
  
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
            
            // 初始化过滤后的设备列表
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
    queryParams.value.serialNumber = null;
    if (val) {
      filteredDeviceList.value = devDeviceList.value.filter(item => item.productName === val);
    } else {
      // 当产品名称取消选择时，显示所有设备
      filteredDeviceList.value = devDeviceList.value;
    }
  };
  
  // 新增：序列号选择变化处理
  const handleSerialNumberChange = (val) => {
    if (val) {
      // 根据选择的序列号自动填充产品名称
      const selectedDevice = devDeviceList.value.find(item => item.serialNumber === val);
      if (selectedDevice) {
        queryParams.value.productName = selectedDevice.productName;
      }
    }
  };

  // 新增：设置默认时间范围为当天
  const setDefaultDateRange = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    queryParams.value.dateRange = [
      startOfDay.toISOString().slice(0, 19).replace('T', ' '),
      endOfDay.toISOString().slice(0, 19).replace('T', ' ')
    ];
  };
  
  /** 查询产品分类列表 */
  function getList() {
    debugger
    loading.value = true
    listDeviceLog(queryParams.value).then(response => {
      categoryList.value = response.rows
      total.value = response.total
      loading.value = false
    })
  }
  
  // 取消按钮
  function cancel() {
    open.value = false
    reset()
  }
  
  // 表单重置
  function reset() {
    form.value = {
      categoryId: null,
      categoryName: null,
      tenantId: null,
      tenantName: null,
      isSys: null,
      parentId: null,
      orderNum: null,
      delFlag: null,
      createBy: null,
      createTime: null,
      updateBy: null,
      updateTime: null,
      remark: null
    }
    proxy.resetForm("categoryRef")
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    debugger
    queryParams.value.pageNum = 1
    if (queryParams.value.dateRange.length > 0) {
    queryParams.value.beginTime = formatDate(queryParams.value.dateRange[0]);
    queryParams.value.endTime = formatDate(queryParams.value.dateRange[1]);
  }
    getList()
  }
  const formatDate = (date) => {
  // 确保输入是Date对象
  const d = typeof date === "string" ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return "Invalid Date"; // 处理无效日期
  }

  // 使用本地时间而不是UTC时间来避免时区问题
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
  /** 重置按钮操作 */
  function resetQuery() {
    queryParams.value.productName = null;
    queryParams.value.serialNumber = null;
    queryParams.value.identity = null;
    queryParams.value.dateRange = null;
    proxy.resetForm("queryRef")
    
    // 重置过滤后的设备列表
    filteredDeviceList.value = devDeviceList.value;
    
    // 重新设置默认时间范围
    setDefaultDateRange();
    
    handleQuery()
  }
  
 /** 导出按钮操作 */
function handleExport() {
  proxy.download("/iot/deviceLog/export", {
    ...queryParams.value,
  }, `设备数据日志_${new Date().getTime()}.xlsx`);
}

// 初始化
onMounted(async () => {
  // 新增：获取下拉框数据
  await getDeviceListForDropdown();
  
  // 设置默认时间范围为当天
  setDefaultDateRange();
  
  getList()
})
  
  </script>
  