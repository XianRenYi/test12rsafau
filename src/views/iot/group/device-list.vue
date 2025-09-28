<template>
  <el-dialog
    title="选择设备"
    v-model:visible="openDeviceList"
    width="800px"
    append-to-body
  >
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model:value="queryParams.deviceName"
          placeholder="请输入设备名称"
          clearable
          
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="deviceList"
      @select="handleSelectionChange"
      @select-all="handleSelectionAll"
      ref="multipleTable"
      size="mini"
      border
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="设备编号" align="center" prop="serialNumber" />
      <el-table-column label="产品名称" align="center" prop="productName" />
      <el-table-column label="设备类型" align="center">
        <template v-slot="scope">
          <el-tag type="success" v-if="scope.row.isOwner == 0">分享</el-tag>
          <el-tag type="primary" v-else>拥有</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="设备状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag
            :options="dict.type.iot_device_status"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleDeviceSelected"
          >确 定</el-button
        >
        <el-button @click="closeSelectDeviceList">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import deviceList from './device-list'
import { listGroup, getGroup, delGroup, addGroup, updateGroup } from "@/api/iot/group"
const data = reactive({
  // 设备分组
  deviceGroup: {},
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 是否显示设备列表
      openDeviceList: false,
      // 总条数
      total: 0,
      // 设备表格数据
      deviceList: [],
  queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceName: null,
        productId: null,
        productName: null,
        userId: null,
        userName: null,
        tenantId: null,
        tenantName: null,
        serialNumber: null,
        status: null,
        networkAddress: null,
        activeTime: null,
  },

})
</script>