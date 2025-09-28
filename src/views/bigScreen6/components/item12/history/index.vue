<template>
  <div class="scale-container">
    <div
      class="tableCom el-table--enable-row-hover el-table--medium"
      style="overflow: auto; height: 614px; max-height: 614px"
    >
      <div class="data-center-history-wrap">
        <div class="device-wrap">
          <div
            class="app-container"
            style="overflow: auto; height: 585px; max-height: 585px"
          >
            <el-form
              :model="queryParams"
              ref="queryRef"
              :inline="true"
              v-show="showSearch"
              label-width="60px"
            >
              <el-form-item label="告警名称" prop="alertName">
                <el-select
                  style="width: 156px"
                  v-model="queryParams.alertNames"
                  filterable
                  multiple
                  collapse-tags
                  placeholder="请选择告警名称"
                >
                  <el-option
                    v-for="dict in alerNameList"
                    :key="dict.alertName"
                    :label="dict.alertName"
                    :value="dict.alertName"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="告警级别" prop="alertLevel">
                <el-select
                  style="width: 156px"
                  v-model="queryParams.alertLevels"
                  placeholder="请选择告警级别"
                  filterable
                  multiple
                  collapse-tags
                >
                  <el-option
                    v-for="dict in iot_alert_level"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="处理状态" prop="status">
                <el-select
                  filterable
                  multiple
                  collapse-tags
                  style="width: 156px"
                  v-model="queryParams.statuss"
                  placeholder="请选择处理状态"
                  clearable
                >
                  <el-option
                    v-for="dict in iot_process_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="'时间'" prop="dayDaterange">
                <el-date-picker
                  style="width: 210px"
                  v-model="queryParams.dayDaterange"
                  type="datetimerange"
                  :shortcuts="shortcuts"
                  :start-placeholder="'开始日期'"
                  :end-placeholder="'结束日期'"
                ></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery"
                  >搜索</el-button
                >
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="success"
                  icon="Edit"
                  @click="handleBatchUpdate"
                  :disabled="ids.length === 0"
                  v-hasPermi="['AlertLog:AlertLog:edit']"
                >
                  批量处理
                </el-button>
                <el-button
                  type="warning"
                  plain
                  icon="Download"
                  @click="handleExport"
                  v-hasPermi="['AlertLog:AlertLog:export']"
                  >导出</el-button
                >
              </el-form-item>
            </el-form>

            <el-table
              v-loading="loading"
              :data="AlertLogList"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
                align="center"
                :selectable="isSelectable"
              ></el-table-column>
              <el-table-column label="设备编号" align="center" prop="serialNumber" />
              <el-table-column label="设备名称" align="center" prop="deviceName" />
              <el-table-column label="告警名称" align="center" prop="alertName" />
              <el-table-column label="告警级别" align="center" prop="alertLevel">
                <template #default="scope">
                  <dict-tag :options="iot_alert_level" :value="scope.row.alertLevel" />
                </template>
              </el-table-column>
              <el-table-column label="处理状态" align="center" prop="status">
                <template #default="scope">
                  <dict-tag :options="iot_process_status" :value="scope.row.status" />
                </template>
              </el-table-column>

              <el-table-column label="告警时间" align="center" prop="createTime" />

              <el-table-column
                label="操作"
                align="center"
                class-name="small-padding fixed-width"
              >
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    icon="Edit"
                    @click="handleUpdate(scope.row)"
                    v-hasPermi="['AlertLog:AlertLog:edit']"
                    :disabled="!isSelectable(scope.row)"
                    >处理</el-button
                  >
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

            <!-- 对话框内容 -->
            <el-dialog :title="title" v-model="open" width="500px" append-to-body>
              <el-form
                ref="AlertLogRef"
                :model="form"
                :rules="isBatch ? batchRules : rules"
                label-width="80px"
              >
                <el-form-item label="告警名称" prop="alertName" v-if="!isBatch">
                  <el-input
                    readonly
                    v-model="form.alertName"
                    placeholder="请输入告警名称"
                  />
                </el-form-item>
                <el-form-item label="告警级别" v-if="!isBatch" prop="alertLevel">
                  <el-select v-model="form.alertLevel" placeholder="请选择告警级别">
                    <el-option
                      v-for="dict in iot_alert_level"
                      :key="dict.value"
                      :label="dict.label"
                      :value="parseInt(dict.value)"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="处理状态" prop="status">
                  <el-select v-model="form.status" placeholder="请选择处理状态">
                    <el-option
                      v-for="dict in iot_process_status"
                      :key="dict.value"
                      :label="dict.label"
                      :value="parseInt(dict.value)"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button type="primary" @click="submitForm">确 定</el-button>
                  <el-button @click="cancel">取 消</el-button>
                </div>
              </template>
            </el-dialog>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="AlertLog">
import {
  listAlertLog,
  getAlertLog,
  delAlertLog,
  addAlertLog,
  updateAlertLog,
  selectAlertNameList,
  batchUpdateAlertLog,
} from "@/api/iot/alertLog";
const { proxy } = getCurrentInstance();
const { iot_alert_level, iot_process_status } = proxy.useDict(
  "iot_alert_level",
  "iot_process_status"
);

// 未处理状态值（根据实际业务调整）
const UNPROCESSED_STATUS = 2;

const alerNameList = ref([]);
const AlertLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const isBatch = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 8,
    alertName: null,
    alertNames: [],
    alertLevels: [],
    statuss: [],
    alertLevel: null,
    status: null,
    serialNumber: null,
    productId: null,
    detail: null,
    userId: null,
    deviceName: null,
    beginTime: null,
    endTime: null,
    dayDaterange: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date()],
  },
  rules: {
    alertName: [{ required: true, message: "告警名称不能为空", trigger: "blur" }],
    alertLevel: [{ required: true, message: "告警级别不能为空", trigger: "change" }],
    status: [{ required: true, message: "处理状态不能为空", trigger: "change" }],
    serialNumber: [{ required: true, message: "设备编号不能为空", trigger: "blur" }],
    productId: [{ required: true, message: "产品ID不能为空", trigger: "blur" }],
  },
  batchRules: {
    alertLevel: [{ required: true, message: "告警级别不能为空", trigger: "change" }],
    status: [{ required: true, message: "处理状态不能为空", trigger: "change" }],
  },
});

const { queryParams, form, rules, batchRules } = toRefs(data);

/** 判断是否可选择（仅未处理状态可选择） */
function isSelectable(row) {
  return row.status === UNPROCESSED_STATUS;
}

/** 查询列表 */
function getList() {
  loading.value = true;
  selectAlertNameList().then((res) => {
    alerNameList.value = res.rows;
  });
  listAlertLog(queryParams.value).then((response) => {
    AlertLogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  isBatch.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    alertLogId: null,
    alertName: null,
    alertLevel: null,
    status: null,
    serialNumber: null,
    productId: null,
    detail: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: "处理事件",
    userId: null,
    deviceName: null,
  };
  proxy.resetForm("AlertLogRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  if (queryParams.value.dayDaterange.length > 0) {
    queryParams.value.beginTime = formatDate(queryParams.value.dayDaterange[0]);
    queryParams.value.endTime = formatDate(queryParams.value.dayDaterange[1]);
  }
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.filter((row) => isSelectable(row)).map((item) => item.alertLogId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 处理按钮操作 */
function handleUpdate(row) {
  if (!isSelectable(row)) {
    proxy.$modal.msgWarning("只能处理未处理状态的告警记录");
    return;
  }

  reset();
  const _alertLogId = row.alertLogId || ids.value;
  getAlertLog(_alertLogId).then((response) => {
    form.value = response.data;
    open.value = true;
    isBatch.value = false;
    title.value = "处理设备告警日志";
  });
}

/** 批量处理按钮操作 */
function handleBatchUpdate() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning("请选择未处理的告警记录");
    return;
  }
  reset();
  open.value = true;
  isBatch.value = true;
  title.value = "批量处理设备告警日志";
}

/** 提交按钮 */
function submitForm() {
  const formRef = proxy.$refs["AlertLogRef"];
  formRef.validate((valid) => {
    if (valid) {
      if (isBatch.value) {
        const batchData = {
          ids: ids.value,
          alertLevel: form.value.alertLevel,
          status: form.value.status,
        };
        debugger;
        batchUpdateAlertLog(batchData).then(() => {
          proxy.$modal.msgSuccess("批量处理成功");
          open.value = false;
          isBatch.value = false;
          getList();
        });
      } else if (form.value.alertLogId != null) {
        updateAlertLog(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAlertLog(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _alertLogIds = row.alertLogId || ids.value;
  proxy.$modal
    .confirm(`是否确认删除设备告警日志编号为"${_alertLogIds}"的数据项？`)
    .then(() => delAlertLog(_alertLogIds))
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "iot/alertLog/export",
    { ...queryParams.value },
    `告警记录_${new Date().getTime()}.xlsx`
  );
}

// 日期格式化
const formatDate = (date) => {
  const d = new Date(date);
  const timezoneOffset = d.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(d.getTime() - timezoneOffset + 8 * 3600 * 1000);
  return adjustedDate.toISOString().slice(0, 19).replace("T", " ");
};

// 日期选择器快捷选项
const shortcuts = [
  {
    text: "最近2小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 2);
      return [start, end];
    },
  },
  {
    text: "最近1天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 1);
      return [start, end];
    },
  },
  {
    text: "最近7天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return [start, end];
    },
  },
  {
    text: "最近30天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    },
  },
  {
    text: "最近3个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    },
  },
];

// 初始化加载列表
handleQuery();
</script>

<style lang="scss" scoped>
// 新增按钮组样式
.button-group {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding-left: 0 !important; // 移除默认左内边距

  .right-buttons {
    display: flex;
    gap: 8px; // 按钮间距
  }

  // 调整所有按钮间距
  .el-button {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
}

::v-deep .tableCom {
  font-size: 12px !important;
  font-family: "Microsoft YaHei", sans-serif !important;
}

::v-deep .el-form,
::v-deep .el-form-item,
::v-deep .el-form-item__label,
::v-deep .el-select,
::v-deep .el-input,
::v-deep .el-date-picker,
::v-deep .el-button,
::v-deep .el-table,
::v-deep .el-table__cell,
::v-deep .el-dialog,
::v-deep .el-dialog__title,
::v-deep .el-pagination {
  font-size: 12px !important;
  font-family: "Microsoft YaHei", sans-serif !important;
}

.data-center-history-wrap {
  padding: 12px;
  background-color: #ffffff;

  .device-wrap {
    margin-top: 5px;
  }

  .el-table--enable-row-hover {
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  }
}

.el-form--inline .el-form-item {
  display: inline-flex;
  margin-right: 13px;
  vertical-align: middle;
}
</style>
