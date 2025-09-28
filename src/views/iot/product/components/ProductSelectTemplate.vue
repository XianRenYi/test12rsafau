<template>
    <div>
      <el-form :model="queryParams" ref="formRef" :inline="true" label-width="68px">
         <el-form-item label="产品名称" prop="productName">
          <el-select 
            style="width: 180px;" 
            v-model="queryParams.productName" 
            placeholder="请选择产品名称" 
            filterable
            clearable
            @change="handleProductNameChange"
          >
            <el-option 
              v-for="(item, index) in productNameList" 
              :key="index" 
              :label="item" 
              :value="item" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品型号" prop="productId">
          <el-select 
            style="width: 180px;" 
            v-model="queryParams.productId" 
            placeholder="请选择产品型号" 
            filterable
            clearable
            @change="handleProductIdChange"
          >
            <el-option 
              v-for="(item, index) in filteredProductIdList" 
              :key="index" 
              :label="item" 
              :value="item" 
            />
          </el-select>
        </el-form-item>
        <el-form-item  style="width: 200px;"  label="因子" prop="modelName">
          <el-input v-model="queryParams.modelName" placeholder="请输入因子" clearable 
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item  style="width: 200px;"  label="标识" prop="identifier">
          <el-input v-model="queryParams.identifier" placeholder="请输入标识" clearable 
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item  style="width: 200px;" label="类型" prop="datatype" >
           <el-select v-model="queryParams.datatype" placeholder="请选择数据类型" @change="dataTypeChange" style="width: 175px">
            <el-option key="integer" label="整数" value="integer"></el-option>
            <el-option key="decimal" label="小数" value="decimal"></el-option>
          </el-select>
        </el-form-item>

      

        <el-form-item>
          <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
          <el-button icon="refresh"  @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange"
        ref="selectTemplateTable" >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="产品型号" align="center" prop="productId" />
        <el-table-column label="因子" align="center" prop="modelName" />
        <el-table-column label="标识" align="center" prop="identifier" />
     
      
        
        <el-table-column label="类型" align="center"  width="100">
          <template #default="{ row }">
            <dict-tag :options="iot_data_type" :value="row.datatype" />
          </template>
        </el-table-column>
        <el-table-column label="最大值" align="center" >
        <template #default="scope">
          <div v-html="getValue_formatSpecsDisplay(scope.row.specs,'最大值')"></div>
        </template>
      </el-table-column>

      <el-table-column label="最小值" align="center" header-align="center" >
        <template #default="scope">
          <div v-html="getValue_formatSpecsDisplay(scope.row.specs,'最小值')"></div>
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center" header-align="center" >
        <template #default="scope">
          <div v-html="getValue_formatSpecsDisplay(scope.row.specs,'单位')"></div>
        </template>
      </el-table-column>

      </el-table>
  
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" 
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useDict } from '@/utils/dict';
  import { listModel } from "@/api/iot/model";
  import { listShortAllList } from "@/api/iot/product";
  import { listDeviceShort } from "@/api/iot/device";
  
  // 定义props，接收父组件传入的当前产品基础信息
  const props = defineProps({
    currentProductName: {
      type: String,
      default: null
    },
    currentProductId: {
      type: String,
      default: null
    }
  });
  
  const emit = defineEmits(['idsToParentEvent']);
  const { proxy } = getCurrentInstance();
  const { iot_things_type, iot_data_type, iot_yes_no } = proxy.useDict('iot_things_type', 'iot_data_type', 'iot_yes_no');
  const showType = ref('list');
  // 数据状态
  const loading = ref(false);
  const templateList = ref([]);
  const total = ref(0);
  const formRef = ref();
  const selectTemplateTable = ref();
  
  // 新增：支持下拉框的数据变量
  const productNameList = ref([]);
  const filteredProductIdList = ref([]);
  const devDeviceList = ref([]);

  // 查询参数
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    modelName: null,
    type: null,
    productName: null,
    productId: null
  });
  
  // 选中数据
  const ids = ref([]);
  const single = ref(true);
  const multiple = ref(true);
  
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
            
            // 初始化过滤后的产品型号列表 - 让产品型号默认也可以直接选择
            const uniqueProductIds = [...new Set(data.rows.map(item => item.productId))];
            filteredProductIdList.value = uniqueProductIds;
            
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
    if (val) {
      const filteredIds = [...new Set(
        devDeviceList.value
          .filter(item => item.productName === val)
          .map(item => item.productId)
      )];
      filteredProductIdList.value = filteredIds;
    } else {
      // 当产品名称取消选择时，显示所有可用的产品型号
      const uniqueProductIds = [...new Set(devDeviceList.value.map(item => item.productId))];
      filteredProductIdList.value = uniqueProductIds;
    }
  };

  // 新增：产品型号变化处理
  const handleProductIdChange = (val) => {
    // 可以在这里添加额外的逻辑，比如自动填充其他字段
  };

  // 数据类型变化处理
  const dataTypeChange = (val) => {
    // 处理数据类型变化
  };
  
  // 获取当前产品的基础信息
  const getCurrentProductName = () => {
    // 从父组件传入的props获取当前产品名称
    return props.currentProductName;
  };
  
  const getCurrentProductId = () => {
    // 从父组件传入的props获取当前产品型号
    return props.currentProductId;
  };
  
  /** 查询通用物模型列表 */
  function getList() {
    loading.value = true;
    listModel(queryParams).then((response) => {
      templateList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.pageNum = 1;
    getList();
  }
  
  /** 重置按钮操作 */
  function resetQuery() {
    // 重置表单字段
    formRef.value.resetFields();
    
    // 手动重置查询参数
    queryParams.productName = null;
    queryParams.productId = null;
    queryParams.pageNum = 1;
    queryParams.pageSize = 10;
    queryParams.modelName = null;
    queryParams.identifier = null;
    queryParams.datatype = null;
    
    // 重置过滤后的产品型号列表
    if (devDeviceList.value && devDeviceList.value.length > 0) {
      const uniqueProductIds = [...new Set(devDeviceList.value.map(item => item.productId))];
      filteredProductIdList.value = uniqueProductIds;
    }
    
    // 重新获取列表
    getList();
    
    // 清除选择状态
    if (selectTemplateTable.value) {
      selectTemplateTable.value.clearSelection();
    }
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map((item) => item.modelId);
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
    // Id数组传递到父组件
    emit('idsToParentEvent', ids.value);
  }
  
/** 格式化显示数据定义 */
function getValue_formatSpecsDisplay(json,name) {
  let specs = JSON.parse(json);
  
  if(name=='最大值'){
    return specs.max;
  }

  if(name=='最小值'){
    return specs.step;
  }

  if(name=='单位'){
    return specs.unit;
  }
  
  if(name=='最大长度' && specs.type === 'string'){
    return specs.maxLength;
  }
  
  if(name=='数组类型'){
    return specs.arrayType;
  }
 
  if(name=='元素个数'){
    return specs.arrayCount;
  }

}

/** 格式化显示数据定义 */
function formatSpecsDisplay(json) {
  let specs = JSON.parse(json);
  if (specs.type === 'integer' || specs.type === 'decimal' || specs.type === 'INT16' || specs.type === 'INT') {
    return (
      '<span style="width:50%;display:inline-block;font-size:14px;">最大值：<span style="color:#F56C6C;font-size:14px;">' +
      specs.max +
      '</span></span>最小值：<span style="color:#F56C6C;font-size:14px;">' +
      specs.step +
      '</span></span>单位：<span style="color:#F56C6C;font-size:14px;">' +
      specs.unit +
      '</span>'
    );
  } else if (specs.type === 'string') {
    return '最大长度：<span style="color:#F56C6C;font-size:14px;">' + specs.maxLength + '</span>';
  } else if (specs.type === 'array') {
    return '<span style="width:50%;display:inline-block;font-size:14px;">数组类型：<span style="color:#F56C6C;font-size:14px;">' + specs.arrayType + '</span></span>元素个数：<span style="color:#F56C6C;font-size:14px;">' + specs.arrayCount + '</span>';
  } else if (specs.type === 'enum') {
    let items = '';
    for (let i = 0; i < specs.enumList.length; i++) {
      items = items + '<span style="width:50%;display:inline-block;font-size:14px;">' + specs.enumList[i].value + '：<span style="color:#F56C6C;font-size:14px;">' + specs.enumList[i].text + '</span></span>';
      if (i > 0 && i % 2 != 0) {
        items = items + '<br />';
      }
    }
    return items;
  } else if (specs.type === 'bool') {
    return '<span style="width:50%;display:inline-block;font-size:14px;">0：<span style="color:#F56C6C;font-size:14px;">' + specs.falseText + '</span></span>1：<span style="color:#F56C6C;font-size:14px;">' + specs.trueText + '</span>';
  } else if (specs.type === 'object') {
    let items = '';
    for (let i = 0; i < specs.params.length; i++) {
      items = items + '<span style="width:50%;display:inline-block;font-size:14px;">' + specs.params[i].name + '：<span style="color:#F56C6C;font-size:14px;">' + specs.params[i].datatype.type + '</span></span>';
      if (i > 0 && i % 2 != 0) {
        items = items + '<br />';
      }
    }
    return items;
  }
}

  // 初始化加载，先加载设备列表，再加载物模型列表
  onMounted(async () => {
    await getDeviceListForDropdown();
    
    // 第一次默认加载时，如果有产品名称，自动选择与基础信息不一致的第一个产品名称
    if (productNameList.value && productNameList.value.length > 0) {
      // 获取当前产品的基础信息（从父组件传入或从其他地方获取）
      const currentProductName = getCurrentProductName();
      const currentProductId = getCurrentProductId();
      
      // 找到与当前产品基础信息不一致的第一个产品名称
      let selectedProductName = null;
      for (let i = 0; i < productNameList.value.length; i++) {
        if (productNameList.value[i] !== currentProductName) {
          selectedProductName = productNameList.value[i];
          break;
        }
      }
      
      // 如果没有找到不一致的，就选择第一个
      if (!selectedProductName) {
        selectedProductName = productNameList.value[0];
      }
      
      // 自动选择产品名称
      queryParams.productName = selectedProductName;
      
      // 根据选择的产品名称过滤产品型号
      const filteredIds = [...new Set(
        devDeviceList.value
          .filter(item => item.productName === queryParams.productName)
          .map(item => item.productId)
      )];
      filteredProductIdList.value = filteredIds;
      
      // 自动选择与当前产品型号不一致的第一个产品型号（如果有的话）
      if (filteredIds.length > 0) {
        let selectedProductId = null;
        for (let i = 0; i < filteredIds.length; i++) {
          if (filteredIds[i] !== currentProductId) {
            selectedProductId = filteredIds[i];
            break;
          }
        }
        
        // 如果没有找到不一致的，就选择第一个
        if (!selectedProductId) {
          selectedProductId = filteredIds[0];
        }
        
        queryParams.productId = selectedProductId;
      }
    }
    
    getList();
  });
  </script>