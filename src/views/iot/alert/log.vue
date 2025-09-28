<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="告警名称" prop="alertName">
        <el-select
          style="width: 200px"
          v-model="queryParams.alertNames"
          filterable
          multiple
          collapse-tags
          placeholder="请输入告警名称"
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
          style="width: 200px"
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
          style="width: 200px"
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

      <el-form-item :label="'时间范围'" prop="dayDaterange">
        <el-date-picker
          style="width: 340px"
          v-model="queryParams.dayDaterange"
          type="datetimerange"
          :shortcuts="shortcuts"
          :start-placeholder="'开始日期'"
          :end-placeholder="'结束日期'"
        ></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
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

    <el-table v-loading="loading" :data="AlertLogList">
      <el-table-column label="设备编号" align="center" prop="serialNumber" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="告警名称" align="center" prop="alertName" />
      <el-table-column label="告警数值" align="center" prop="valueRealTime" />
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

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['iot:AlertLog:edit']"
            >处理</el-button
          >
         <el-button 
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['iot:AlertLog:remove']"
            >删除</el-button
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

    <!-- 添加或修改设备告警日志对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="AlertLogRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="告警名称" prop="alertName">
          <el-input readonly v-model="form.alertName" placeholder="请输入告警名称" />
        </el-form-item>
        <el-form-item label="告警级别" prop="alertLevel">
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
</template>

<script setup name="AlertLog">
import {
  listAlertLog,
  getAlertLog,
  delAlertLog,
  addAlertLog,
  updateAlertLog,
  selectAlertNameList,
} from "@/api/iot/alertLog";
const { proxy } = getCurrentInstance();
const { iot_alert_level, iot_process_status } = proxy.useDict(
  "iot_alert_level",
  "iot_process_status"
);

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
const beginTime = ref("");
const endTime = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
    dayDaterange: [],
  },
  rules: {
    alertName: [{ required: true, message: "告警名称不能为空", trigger: "blur" }],
    alertLevel: [{ required: true, message: "告警级别不能为空", trigger: "change" }],
    status: [
      {
        required: true,
        message: "处理状态(1=不需要处理,2=未处理,3=已处理)不能为空",
        trigger: "change",
      },
    ],
    serialNumber: [{ required: true, message: "设备编号不能为空", trigger: "blur" }],
    productId: [{ required: true, message: "产品ID不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询设备告警日志列表 */
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
    (queryParams.value.beginTime = formatDate(queryParams.value.dayDaterange[0])),
      (queryParams.value.endTime = formatDate(queryParams.value.dayDaterange[1]));
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
  ids.value = selection.map((item) => item.alertLogId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加设备告警日志";
}

/** 处理按钮操作 */
function handleUpdate(row) {
  reset();
  const _alertLogId = row.alertLogId || ids.value;
  getAlertLog(_alertLogId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "处理设备告警日志";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["AlertLogRef"].validate((valid) => {
    if (valid) {
      if (form.value.alertLogId != null) {
        updateAlertLog(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAlertLog(form.value).then((response) => {
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
    .confirm('是否确认删除设备告警日志编号为"' + _alertLogIds + '"的数据项？')
    .then(function () {
      return delAlertLog(_alertLogIds);
    })
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
    {
      ...queryParams.value,
    },
    `告警记录_${new Date().getTime()}.xlsx`
  );
}

// 查询参数
const devQueryParams = reactive({
  deviceId: null,
  identifiers: [],
  dayDaterange: [new Date(new Date().getTime() - 3600 * 1000 * 2), new Date()],
});

const sceneQueryParams = reactive({
  sceneModelId: null,
  sceneModelDeviceId: null,
  identifiers: [],
  dayDaterange: [new Date(new Date().getTime() - 3600 * 1000 * 2), new Date()],
});

// 日期选择器快捷选项
const shortcuts = [
  {
    text: "最近2小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 2); // 精确减去2小时
      return [formatDate(start), formatDate(end)];
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
const formatDate = (date) => {
  const d = new Date(date);
  // 调整为北京时间 (UTC+8)
  const timezoneOffset = d.getTimezoneOffset() * 60000; // 分钟转为毫秒
  const adjustedDate = new Date(d.getTime() - timezoneOffset + 8 * 3600 * 1000);
  return adjustedDate.toISOString().slice(0, 19).replace("T", " ");
};

// 计算属性
const devTableList = computed(() => {
  
  const start = (devPageNum.value - 1) * devPageSize.value;
  const end = start + devPageSize.value;
  return devTableComTemp.value.slice(start, end);
});

getList();
</script>
