<template>
    <el-dialog :title="'选择产品'" v-model="open" width="800px" :close-on-click-modal="false">
        <div >
      
            <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" style="margin-bottom: 10px;">
                <el-form-item :label="'产品名称'" prop="productName">
                    <el-input v-model="queryParams.productName" :placeholder="'请输入产品名称'" clearable
                         @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search"  @click="handleQuery">{{ '查询'
                        }}</el-button>
                    <el-button icon="el-icon-refresh"  @click="resetQuery">{{'重置' }}</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" ref="singleTable" :data="productList" @row-click="rowClick"
                highlight-current-row >
                <el-table-column :label="'单选'" width="50" align="center">
                    <template #default="scope">
                        <input type="radio" :checked="scope.row.isSelect" name="product" />
                    </template>
                </el-table-column>
                <el-table-column :label="'产品名称'" align="center" prop="productName" />
                <el-table-column :label="'分类名称'" align="center" prop="categoryName" />
                <el-table-column :label="'创建时间'" align="center" prop="createTime" width="100">
                    <template #default="scope">
                        <span>{{ scope.row.createTime }}</span>
                    </template>
                </el-table-column>
            </el-table>

            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList" />
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="confirmSelectProduct" type="primary">{{ '确认' }}</el-button>
                <el-button @click="closeDialog" type="info">{{ '关闭' }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { listProduct } from '@/api/iot/product';
import { useDict } from '@/utils/dict';

const emit = defineEmits(['productEvent']);

// State
const loading = ref(true);
const total = ref(0);
const open = ref(false);
const productList = ref([]);
const selectProductId = ref(0);
const product = ref(null);
const singleTable = ref();
const queryForm = ref();

// Dict
const dict = useDict(['iot_vertificate_method', 'iot_network_method']);

// Query params
const queryParams = reactive({
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
    showSenior: false,
});

/** 查询产品列表 */
const getList = () => {
    loading.value = true;
    listProduct(queryParams).then((response) => {
        // 产品列表初始化isSelect值，用于单选
        productList.value = response.rows.map(item => ({
            ...item,
            isSelect: false
        }));
        total.value = response.total;
        loading.value = false;
        // 设置产品选中
        setRadioSelected(selectProductId.value);
    });
};

/** 搜索按钮操作 */
const handleQuery = () => {
    queryParams.pageNum = 1;
    getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
    queryForm.value.resetFields();
    handleQuery();
};

/** 单选数据 */
const rowClick = (row) => {
    if (row) {
        setRadioSelected(row.productId);
        product.value = row;
    }
};

/** 设置单选按钮选中 */
const setRadioSelected = (productId) => {
    productList.value.forEach(item => {
        item.isSelect = item.productId === productId;
    });
};

/** 确定选择产品，产品传递给父组件 */
const confirmSelectProduct = () => {
    if (product.value) {
        emit('productEvent', product.value);
    }
    open.value = false;
    product.value = null;
};

/** 关闭对话框 */
const closeDialog = () => {
    open.value = false;
};

// Expose methods to parent component
defineExpose({
    open,
    selectProductId,
    product,
    getList,
    confirmSelectProduct,
    closeDialog,
    queryParams 
});
</script>