<template>
  <el-dialog title="选择产品" v-model="open" width="800px">
    <div style="margin-top: -55px">
      <el-divider style="margin-top: -30px"></el-divider>
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable size="small" 
                   @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" ref="singleTable" :data="productList" @row-click="rowClick" 
               highlight-current-row size="mini">
        <el-table-column label="选择" width="50" align="center">
          <template #default="scope">
            <input type="radio" :checked="scope.row.isSelect" name="product" />
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="分类名称" align="center" prop="categoryName" />
        <el-table-column label="租户名称" align="center" prop="tenantName" />
        <el-table-column label="授权码" align="center" prop="status" width="70">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.isAuthorize == 1">启用</el-tag>
            <el-tag type="info" v-if="scope.row.isAuthorize == 0">未启用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证方式" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="iot_vertificate_method" :value="scope.row.vertificateMethod" />
          </template>
        </el-table-column>
        <el-table-column label="联网方式" align="center" prop="networkMethod">
          <template #default="scope">
            <dict-tag :options="iot_network_method" :value="scope.row.networkMethod" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" 
                 v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
    <div  class="dialog-footer">
      <el-button @click="confirmSelectProduct" type="primary">确定</el-button>
      <el-button @click="closeDialog" type="info">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { listProduct } from '@/api/iot/product'

const { proxy } = getCurrentInstance()
// 字典
const { iot_vertificate_method, iot_network_method } = proxy.useDict('iot_vertificate_method', 'iot_network_method')

// 组件引用
const queryFormRef = ref()
const singleTable = ref()

// 数据状态
const loading = ref(true)
const open = ref(false)
const total = ref(0)
const productList = ref([])
const selectProductId = ref(0)
const product = ref({})

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: null,
  categoryId: null,
  categoryName: null,
  tenantId: null,
  tenantName: null,
  isSys: null,
  status: 2, // 已发布
  deviceType: null,
  networkMethod: null,
})

// 暴露方法给父组件
defineExpose({
  open: () => open.value = true,
  close: () => open.value = false,
  getList: () => getList()
});

/** 查询产品列表 */
const getList = async () => {
  debugger
  loading.value = true
  try {
    const response = await listProduct(queryParams)
    // 产品列表初始化isSelect值，用于单选
    productList.value = response.rows.map(item => ({
      ...item,
      isSelect: false
    }))
    total.value = response.total
    // 设置产品选中
    setRadioSelected(selectProductId.value)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 单选数据 */
const rowClick = (row) => {
  if (row) {
    setRadioSelected(row.productId)
    product.value = row
  }
}

/** 设置单选按钮选中 */
const setRadioSelected = (productId) => {
  productList.value.forEach(item => {
    item.isSelect = item.productId === productId
  })
}

/** 确定选择产品，产品传递给父组件 */
const confirmSelectProduct = () => {
  if (!product.value.productId) {
    ElMessage.warning('请先选择产品')
    return
  }
  emit('productEvent', product.value)
  open.value = false
}

/** 关闭对话框 */
const closeDialog = () => {
  open.value = false
}

// 定义事件
const emit = defineEmits(['productEvent'])

// 初始化
onMounted(() => {
  getList()
})
</script>