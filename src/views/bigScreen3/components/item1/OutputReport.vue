<template>
  <div class="tab-content">
    <el-card style="max-width: 450px">
      <div class="mb-4">
        <el-form-item label="项目名称">
          <el-input v-model="projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="监测单位">
          <el-input v-model="monitoringUnit" placeholder="请输入监测单位" />
        </el-form-item>
        <el-form-item label="报告日期">
          <el-date-picker
            v-model="reportDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="报告类型">
          <el-select v-model="reportType" placeholder="请选择报告类型">
            <el-option label="日报" value="daily" />
            <el-option label="周报" value="weekly" />
            <el-option label="月报" value="monthly" />
            <el-option label="自定义报告" value="custom" />
          </el-select>
        </el-form-item>
      </div>

      <div class="mb-4">
        <el-button
          type="primary"
          style="margin-top: 20px; width: 100%"
          @click="generateReport"
          >生成任务报告</el-button
        >
        <el-button style="margin-top: 10px; width: 100%" @click="exportReport"
          >导出报告</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from "vue";
import {
  ElCard,
  ElFormItem,
  ElInput,
  ElButton,
  ElDatePicker,
  ElSelect,
  ElOption,
} from "element-plus";

export default {
  components: {
    ElCard,
    ElFormItem,
    ElInput,
    ElButton,
    ElDatePicker,
    ElSelect,
    ElOption,
  },
  setup() {
    // 表单数据
    const projectName = ref("");
    const monitoringUnit = ref("");
    const reportDate = ref(new Date());
    const reportType = ref("daily");

    // 生成报告
    const generateReport = () => {
      if (!projectName.value || !monitoringUnit.value) {
        console.log("请填写项目名称和监测单位");
        return;
      }

      console.log("生成报告:", {
        projectName: projectName.value,
        monitoringUnit: monitoringUnit.value,
        reportDate: reportDate.value,
        reportType: reportType.value,
      });

      // 这里可以添加生成报告的逻辑
      alert("报告生成成功！");
    };

    // 导出报告
    const exportReport = () => {
      if (!projectName.value || !monitoringUnit.value) {
        console.log("请填写项目名称和监测单位");
        return;
      }

      console.log("导出报告:", {
        projectName: projectName.value,
        monitoringUnit: monitoringUnit.value,
        reportDate: reportDate.value,
        reportType: reportType.value,
      });

      // 这里可以添加导出报告的逻辑
      alert("报告导出成功！");
    };

    return {
      projectName,
      monitoringUnit,
      reportDate,
      reportType,
      generateReport,
      exportReport,
    };
  },
};
</script>

<style lang="scss" scoped>
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

  &.el-button--default {
    background: $card-bg;
    color: $text-secondary;
    border: 1px solid $border-color;

    &:hover {
      background-color: $primary-light;
      border-color: $primary;
      color: $primary;
    }
  }
}

// 表单样式
:deep(.el-form-item) {
  margin-bottom: 16px;

  & > label {
    font-size: 14px;
    color: $text-primary;
  }
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-date-editor) {
  border-color: $border-color;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 2px $primary-light;
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
</style>
