<template>
  <el-dialog title="选择产品" v-model="open" width="800px">
    <div >
     
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
        <el-form-item label="产品名称" prop="productName">
          <el-input 
            v-model="queryParams.productName" 
            placeholder="请输入产品名称" 
            clearable 
             
            @keyup.enter="handleQuery" 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search"  @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh"  @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        v-loading="loading" 
        ref="singleTableRef" 
        :data="productList" 
        @row-click="rowClick" 
        highlight-current-row 
        
      >
        <el-table-column label="选择" width="50" align="center">
          <template #default="scope">
            <input type="radio" :checked="scope.row.isSelect" name="product" />
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="产品型号" align="center" prop="productId" />
        <el-table-column label="分类名称" align="center" prop="categoryName" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination 
        v-show="total>0" 
        :total="total" 
        v-model:page="queryParams.pageNum" 
        v-model:limit="queryParams.pageSize" 
        @pagination="getList" 
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="confirmSelectProduct" type="primary">确定</el-button>
        <el-button @click="closeDialog" type="info">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

import { parseTime } from '@/utils/ruoyi';
import { listProduct } from "@/api/iot/product";

const props = defineProps({
  productId: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['productEvent']);


// 响应式数据
const loading = ref(true);
const total = ref(0);
const open = ref(false);
const productList = ref([]);
const product = ref({});

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  productName: null,
  categoryId: null,
  categoryName: null,
  tenantId: null,
  tenantName: null,
  isSys: null,
  status: 2, //已发布
  deviceType: null,
  networkMethod: null,
});

// 模板引用
const queryFormRef = ref(null);
const singleTableRef = ref(null);

watch(() => props.productId, (newVal) => {
  if (newVal !== null && newVal !== 0) {
    getList();
  }
});
// 方法定义
const getList = async () => {
  loading.value = true;
  try {
    const response = await listProduct(queryParams.value);
    
    // 产品列表初始化isSelect值，用于单选
    productList.value = response.rows.map(item => ({
      ...item,
      isSelect: false
    }));
    
    total.value = response.total;
    
    if (props.productId != 0) {
      setRadioSelected(props.productId);
    }
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields();
  }
  handleQuery();
};

const rowClick = (row) => {
  if (row) {
    setRadioSelected(row.productId);
    product.value = row;
  }
};

const setRadioSelected = (productId) => {
  productList.value = productList.value.map(item => ({
    ...item,
    isSelect: item.productId === productId
  }));
};

const confirmSelectProduct = () => {
  emit('productEvent', product.value);
  open.value = false;
};

const closeDialog = () => {
  open.value = false;
};

// 暴露方法给父组件
defineExpose({
  open: () => open.value = true,
  close: () => open.value = false,
  getList: () => getList()
});
</script>

<script>
export default {
  name: "ProductList"
};
</script>