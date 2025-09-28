<template>
  <div class="tab-content">
    <div class="task-list">
      <el-card style="max-width: 480px">
        <template #header>
          <div class="card-header">
            <span>当前加载的任务列表</span>
          </div>
        </template>

        <el-table
          ref="multipleTableRef"
          :data="tableData"
          row-key="id"
          style="width: 100%"
          height="250"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" :selectable="selectable" width="55" />
          <el-table-column label="时间" width="120">
            <template #default="scope">{{ scope.row.date }}</template>
          </el-table-column>

          <el-table-column property="address" label="文件名称" />
        </el-table>

        <el-button type="primary" style="margin-top: 20px; width: 100%"
          >载入本地任务文件</el-button
        >
      </el-card>

      <el-card style="margin-top: 10px">
        <template #header>
          <div class="card-header">
            <span>数据时间范围</span>
          </div>
        </template>

        <div class="mb-4">
          <el-button type="primary" style="margin-top: 20px; width: 120px"
            >所有</el-button
          >
          <el-button type="primary" style="margin-top: 20px; width: 120px"
            >0.5小时内</el-button
          >
          <el-button type="primary" style="margin-top: 20px; width: 120px"
            >1小时内</el-button
          >
        </div>
        <div class="mb-4">
          <el-button type="primary" style="margin-top: 20px; width: 120px"
            >2小时内</el-button
          >
          <el-button type="primary" style="margin-top: 20px; width: 120px"
            >6小时内</el-button
          >
          <el-button type="primary" style="margin-top: 20px; width: 120px"
            >24小时内</el-button
          >
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ElCard, ElTable, ElTableColumn, ElButton } from "element-plus";

export default {
  components: {
    ElCard,
    ElTable,
    ElTableColumn,
    ElButton,
  },
  setup() {
    const multipleTableRef = ref(null);
    const multipleSelection = ref([]);

    // 表格数据
    const tableData = ref([
      {
        id: 1,
        date: "2016-05-03",
        name: "Tom",
        address: "环境监测数据_20160503.csv",
      },
      {
        id: 2,
        date: "2016-05-02",
        name: "Tom",
        address: "环境监测数据_20160502.csv",
      },
      {
        id: 3,
        date: "2016-05-01",
        name: "Tom",
        address: "环境监测数据_20160501.csv",
      },
    ]);

    // 处理选择变化
    const handleSelectionChange = (val) => {
      multipleSelection.value = val;
      console.log("选中的任务:", val);
    };

    // 选择权限控制
    const selectable = (row, index) => {
      return true;
    };

    return {
      multipleTableRef,
      multipleSelection,
      tableData,
      handleSelectionChange,
      selectable,
    };
  },
};
</script>

<style lang="scss" scoped>
// 引入主样式变量
// 引入主样式变量
$primary: #0b2453;
$primary-light: rgba($primary, 0.1);
$primary-dark: rgba($primary, 0.9);
$secondary: #6b7280;
$background: #f9fafb;
$card-bg: #ffffff;
$text-primary: #1f2937;
$text-secondary: #4b5563;
$border-color: #e5e7eb;

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
  padding: 12px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

.task-list {
  width: 100%;
}

.mb-4 {
  margin-bottom: 16px;
}

// 卡片样式优化
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid $border-color;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: $card-bg;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .el-card__header {
    padding: 12px 16px;
    background-color: $primary-light;
    border-bottom: 1px solid $border-color;
    color: $primary;
    font-weight: 500;
  }

  .el-card__body {
    padding: 16px;
    color: $text-secondary;
  }
}

// 按钮样式优化
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.2s;

  &:not(:last-child) {
    margin-right: 8px;
  }

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

// 表格样式优化
:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid $border-color;

  .el-table__header-wrapper {
    background-color: $primary-light;

    th {
      color: $primary;
      background-color: transparent !important;
      border-bottom: 1px solid $border-color;
    }
  }

  .el-table__body-wrapper {
    tr {
      &:hover > td {
        background-color: $primary-light !important;
      }
    }

    td {
      border-bottom: 1px solid $border-color;
    }
  }
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

// 响应式适配
@media (max-width: 768px) {
  :deep(.el-button) {
    font-size: 14px;
    padding: 6px 12px;
  }
}
</style>
