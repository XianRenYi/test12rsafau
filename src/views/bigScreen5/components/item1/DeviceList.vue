<template>
  <div class="tab-content">
    <!-- 设备表格 - 无卡片样式 -->
    <el-table
      :data="deviceList"
      row-key="id"
      class="full-width-table"
      height="calc(100% - 50px)"
      @row-click="handleRowClick"
      :row-class-name="tableRowClassName"
      border
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column property="name" label="设备名称" />
      <el-table-column property="type" label="设备类型" />
      <el-table-column property="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '在线' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column property="location" label="位置" />
    </el-table>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { ElTable, ElTableColumn, ElButton, ElTag, ElMessage } from "element-plus";
import { useDeviceStore } from "@/store/deviceStore";

export default {
  components: {
    ElTable,
    ElTableColumn,
    ElButton,
    ElTag,
  },
  setup() {
    // 设备数据
    const deviceList = ref([
      {
        id: 1,
        name: "传感器A-101",
        type: "多功能监测仪",
        status: "在线",
        lastActive: "2023-10-15 09:30:22",
        location: "车间A区",
      },
      {
        id: 2,
        name: "传感器B-203",
        type: "温湿度监测仪",
        status: "在线",
        lastActive: "2023-10-15 09:28:15",
        location: "车间B区",
      },
      {
        id: 3,
        name: "传感器C-305",
        type: "颗粒物监测仪",
        status: "离线",
        lastActive: "2023-10-15 08:15:47",
        location: "车间C区",
      },
      {
        id: 4,
        name: "传感器D-402",
        type: "多功能监测仪",
        status: "在线",
        lastActive: "2023-10-15 09:25:11",
        location: "仓库区",
      },
      {
        id: 5,
        name: "传感器E-501",
        type: "气体监测仪",
        status: "在线",
        lastActive: "2023-10-15 09:29:33",
        location: "实验室A",
      },
    ]);

    // 选中的设备ID
    const selectedDeviceId = ref(null);

    // 获取设备存储
    const deviceStore = useDeviceStore();

    // 当选中设备变化时，更新到全局存储
    watch(selectedDeviceId, (newVal) => {
      if (newVal) {
        const selectedDevice = deviceList.value.find((device) => device.id === newVal);
        if (selectedDevice) {
          deviceStore.setSelectedDevice(selectedDevice);
          ElMessage.success(`已选择设备: ${selectedDevice.name}`);
        }
      }
    });

    // 处理行点击事件
    const handleRowClick = (row) => {
      // 如果点击的是已选中的行，则取消选中
      if (selectedDeviceId.value === row.id) {
        selectedDeviceId.value = null;
        deviceStore.setSelectedDevice(null);
        ElMessage.info("已取消设备选择");
      } else {
        selectedDeviceId.value = row.id;
      }
    };

    // 行样式类名
    const tableRowClassName = ({ row }) => {
      return row.id === selectedDeviceId.value ? "selected-row" : "";
    };

    // 添加设备
    const addDevice = () => {
      ElMessage.info("打开添加设备对话框");
    };

    // 查看设备详情
    const viewDetails = (row) => {
      ElMessage.info(`查看 ${row.name} 的详情`);
    };

    return {
      deviceList,
      selectedDeviceId,
      handleRowClick,
      tableRowClassName,
      addDevice,
      viewDetails,
    };
  },
};
</script>

<style lang="scss" scoped>
// 样式变量
$primary: #0b2453;
$primary-light: rgba($primary, 0.1);
$primary-dark: rgba($primary, 0.9);
$secondary: #6b7280;
$background: #f9fafb;
$card-bg: #ffffff;
$text-primary: #1f2937;
$text-secondary: #4b5563;
$border-color: #e5e7eb;

:root {
  --font-size-base: 24px;
  --line-height-base: 1.6;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
  padding: 12px;
  width: 100%;
  height: 100%;
  min-height: 400px;
  box-sizing: border-box;
  background-color: $background;
}

// 列表标题栏
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid $border-color;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: $primary;
}

// 表格样式 - 撑满容器
.full-width-table {
  width: 100% !important;
  height: 100%;
  box-sizing: border-box;
  background-color: $card-bg;
  border-radius: 6px;
  overflow: hidden;
}

// 表格样式优化
:deep(.el-table) {
  width: 100% !important;
  height: 100% !important;
  border: 1px solid $border-color;

  .el-table__header-wrapper {
    background-color: $primary-light;
    width: 100% !important;

    th {
      color: $primary;
      background-color: transparent !important;
      border-bottom: 1px solid $border-color;
      text-align: center;
      font-weight: 500;
    }
  }

  .el-table__body-wrapper {
    width: 100% !important;
    height: calc(100% - 40px) !important;
    overflow: auto;

    tr {
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover > td {
        background-color: $primary-light !important;
      }
    }

    td {
      text-align: center;
      border-bottom: 1px solid $border-color;
    }

    // 选中行样式
    .selected-row > td {
      background-color: rgba($primary, 0.2) !important;
      color: $primary;
      font-weight: 500;
    }
  }
}

// 按钮样式优化
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.2s;

  &.el-button--primary {
    background: $primary;
    border: none;
    color: #ffffff;

    &:hover {
      background: $primary-dark;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba($primary, 0.3);
    }
  }
}

// 标签样式
:deep(.el-tag) {
  padding: 0 8px;
  border-radius: 4px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .tab-content {
    padding: 8px;
  }

  .list-header {
    padding: 8px 0;
  }
}
</style>
