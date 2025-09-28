<template>
    <el-dialog :title="'选择设备'"  v-model="openDeviceList"   width="900px" append-to-body>
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
            <el-form-item :label="'设备名称'" prop="productName">
                <el-input v-model="queryParams.productName" :placeholder="'请输入设备名称'" clearable
                    size="small" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="'序列号'" prop="serialNumber">
                <el-input v-model="queryParams.serialNumber" :placeholder="'请输入序列号'" clearable
                    size="small" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini"
                    @click="handleQuery">{{ '查询' }}</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ '重置' }}</el-button>
            </el-form-item>
        </el-form>

        <el-table ref="multipleTable" v-loading="loading" :data="deviceList" @select="handleSelectionChange"
            row-key="serialNumber" size="mini">
            <el-table-column type="selection" width="55" align="center" />
            <!-- <el-table-column :label="'设备名称'" align="center" prop="deviceName" /> -->
            <el-table-column :label="'序列号'" align="center" prop="serialNumber" />
            <el-table-column :label="'产品名称'" align="center" prop="productName" />
            <!-- <el-table-column :label="'设备类型'" align="center" width="75">
                <template #default="scope">
                    <el-tag type="success"
                        v-if="scope.row.isOwner == 0">{{ '分享' }}</el-tag>
                    <el-tag type="primary" v-else>{{ '拥有' }}</el-tag>
                </template>
            </el-table-column> -->
        
            <el-table-column :label="'设备状态'" align="center" prop="status" width="80">
                <template #default="scope">
                    <dict-tag :options="iot_device_status" :value="scope.row.status" />
                </template>
            </el-table-column>
        </el-table>
       
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"  />

    
        <template #footer>
            <div style="width: 100%">
                <el-button type="primary" @click="confirmSelectDevice">{{ '确认'}}</el-button>
                <el-button @click="closeSelectDeviceList">{{ '关闭' }}</el-button>
            </div>
          </template>

 

    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { listDeviceShort } from '@/api/iot/device';
import { useDict } from '@/utils/dict';

const emit = defineEmits(['deviceEvent']);

// 状态定义
const loading = ref(true);
const openDeviceList = ref(false);
const total = ref(0);
const deviceList = ref([]);
const selectDeviceNums = ref([]);
const productId = ref(0);
const productName = ref('');
const multipleTable = ref();

// 字典
const { proxy } = getCurrentInstance()
const { iot_device_status} = proxy.useDict('iot_device_status');

// 查询参数
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    deviceName: null,
    productId: null,
    productName: null,
    serialNumber: null,
    status: null,
});

// 获取设备列表
const getList = () => {
    deviceList.value = [];
    loading.value = true;
    queryParams.productId = queryParams.productId == 0 ? null : queryParams.productId;
    listDeviceShort(queryParams).then((response) => {
        deviceList.value = response.rows;
        total.value = response.total;
        loading.value = false;
        // 设置选中
        if (selectDeviceNums.value) {
            nextTick(() => {
                deviceList.value.forEach((row) => {
                    if (selectDeviceNums.value.some((x) => x === row.serialNumber)) {
                        multipleTable.value.toggleRowSelection(row, true);
                    }
                });
            });
        } else {
            // 初始化
            selectDeviceNums.value = [];
        }
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

/** 多选框选中数据 */
const handleSelectionChange = (selection, row) => {
    // 设备ID是否存在于原始设备ID数组中
    let index = selectDeviceNums.value.indexOf(row.serialNumber);
    // 是否选中
    let value = selection.indexOf(row);
    if (index == -1 && value != -1) {
        // 不存在且选中
        selectDeviceNums.value.push(row.serialNumber);
        productId.value = row.productId;
        productName.value = row.productName;
    } else if (index != -1 && value == -1) {
        // 存在且取消选中
        selectDeviceNums.value.splice(index, 1);
    }

    // 筛选产品下的设备比
    if (selectDeviceNums.value.length == 0) {
        queryParams.productId = null;
        getList();
    } else if (selectDeviceNums.value.length == 1) {
        queryParams.productId = row.productId;
        getList();
    }
};

// 全选事件处理
const handleSelectionAll = (selection) => {
    for (let i = 0; i < deviceList.value.length; i++) {
        // 设备ID是否存在于原始设备ID数组中
        let index = selectDeviceNums.value.indexOf(deviceList.value[i].serialNumber);
        // 是否选中
        let value = selection.indexOf(deviceList.value[i]);
        if (index == -1 && value != -1) {
            // 不存在且选中
            selectDeviceNums.value.push(deviceList.value[i].serialNumber);
        } else if (index != -1 && value == -1) {
            // 存在且取消选中
            selectDeviceNums.value.splice(index, 1);
        }
    }
};

// 关闭选择设备列表
const closeSelectDeviceList = () => {
    openDeviceList.value = false;
};

/**确定选择设备，设备传递给父组件 */
const confirmSelectDevice = () => {
    if (selectDeviceNums.value.length > 0) {
        var data = {
            productId: productId.value,
            productName: productName.value,
            deviceNums: selectDeviceNums.value,
        };
        emit('deviceEvent', data);
    }
    openDeviceList.value = false;
};

// 暴露方法给父组件
defineExpose({
    openDeviceList,
    selectDeviceNums,
    productId,
    productName,
    getList,
    confirmSelectDevice,
    closeSelectDeviceList
});
</script>

<style lang="scss" scoped>
/***隐藏全选，避免选中不同产品的设备**/
:deep(.el-table__header-wrapper .el-checkbox) {
    display: none;
}
</style>