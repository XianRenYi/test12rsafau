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
        <el-input
          v-model="queryParams.alertName"
          placeholder="请输入告警名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="告警级别" prop="alertLevel">
        <el-select
          style="width: 200px"
          v-model="queryParams.alertLevel"
          placeholder="请选择告警级别"
          clearable
        >
          <el-option
            v-for="dict in iot_alert_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="告警状态" prop="status">
        <el-select
          style="width: 200px"
          v-model="queryParams.status"
          placeholder="请选择告警状态"
          clearable
        >
          <el-option
            v-for="dict in iot_alert_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['iot:alert:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['iot:alert:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['iot:alert:remove']"
          >删除</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['iot:alert:export']"
          >导出</el-button>
        </el-col> -->
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="alertList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="告警标题" align="center" prop="alertTitle" />
      <el-table-column label="告警名称" align="center" prop="alertName" />
      <el-table-column label="告警级别" align="center" prop="alertLevel">
        <template #default="scope">
          <dict-tag :options="iot_alert_level" :value="scope.row.alertLevel" />
        </template>
      </el-table-column>
      <el-table-column label="告警状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="iot_alert_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="是否弹窗告警提醒" align="center" prop="alertPop">
        <template #default="scope">
          <el-switch
            v-model="scope.row.alertPop"
            :active-value="1"
            :inactive-value="2"
        
            @change="handleAlertPopChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['iot:alert:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['iot:alert:remove']"
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

    <!-- 添加或修改设备告警对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="alertRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="告警标题" prop="alertTitle">
          <el-input v-model="form.alertTitle" placeholder="请输入告警标题" />
        </el-form-item>
        <el-form-item label="告警内容" prop="alertName">
          <el-input v-model="form.alertName" placeholder="请输入告警内容" />
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
        <el-form-item label="告警状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择告警状态">
            <el-option
              v-for="dict in iot_alert_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否弹窗告警提醒" prop="alertPop">
          <el-select v-model="form.alertPop" placeholder="是否弹窗告警提醒">
            <el-option
              v-for="dict in iot_alert_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>

        <el-tabs v-model="activeName" style="padding: 10px">
          <el-tab-pane :label="'关联场景'" name="relateScene">
            <el-table :data="form.scenes" border v-loading="sceneLoading">
              <el-table-column
                prop="sceneName"
                align="center"
                :label="'场景名称'"
              ></el-table-column>
              <el-table-column :label="'状态'" align="center" prop="enable">
                <template #default="scope">
                  <el-tag type="success" size="small" v-if="scope.row.enable == 1">{{
                    "启动"
                  }}</el-tag>
                  <el-tag type="danger" size="small" v-if="scope.row.enable == 2">{{
                    "暂停"
                  }}</el-tag>
                </template>
              </el-table-column>
              <!-- <el-table-column :label="'触发条件'" align="center" prop="cond">
                <template #default="scope">
                  <span v-if="scope.row.cond == 1">{{ "任意条件" }}</span>
                  <span v-if="scope.row.cond == 2">{{ "所有条件" }}</span>
                  <span v-if="scope.row.cond == 3">{{ "不满足条件" }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="'执行方式'" align="center" prop="executeMode">
                <template #default="scope">
                  <span v-if="scope.row.executeMode == 1">{{ "串行" }}</span>
                  <span v-if="scope.row.executeMode == 2">{{ "并" }}</span>
                </template>
              </el-table-column> -->
              <el-table-column :label="'操作'" align="center" width="120">
                <template #default="scope">
                  <el-button type="text" @click="handleAlertSceneRemove(scope.row)"
                    >移除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- <el-tab-pane :label="'消息通知'" name="notify">
            <el-table :data="form.notifyTemplateList" border v-loading="notifyLoading">
              <el-table-column
                prop="name"
                align="center"
                :label="'模板名称'"
              ></el-table-column>
              <el-table-column :label="'状态'" align="center" prop="status">
                <template #default="scope">
                  <el-tag type="success" size="small" v-if="scope.row.status == '1'">{{
                    "启动"
                  }}</el-tag>
                  <el-tag type="danger" size="small" v-if="scope.row.status == '0'">{{
                    "暂停"
                  }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column :label="'操作'" align="center" width="120">
                <template #default="scope">
                  <el-button
                    type="text"
                    icon="el-icon-delete"
                    @click="handleAlertNotifyTempRemove(scope.row)"
                    >{{ "移除" }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane> -->
          <!-- 用于设置间距 -->

          <el-tab-pane disabled>
            <template #label>
              <div style="margin-left: 450px"></div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="sceneButton" disabled v-if="activeName == 'relateScene'">
            <template #label>
              <span>
                <el-button
                  type=""
                  @click="addAlertScenesButton"
                  v-hasPermi="['iot:alert:add']"
                  >{{ "添加场景" }}</el-button
                >
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="notifyButton" disabled v-else>
            <template #label>
              <span>
                <el-button
                  type=""
                  @click="addAlertNotifyTempButton"
                  v-hasPermi="['iot:alert:add']"
                  >{{ "添加模板" }}</el-button
                >
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- 选择场景对话框 -->
        <scene-list ref="sceneListRef" @sceneEvent="getSceneData" />
        <!-- 选择通知模板 -->
        <notify-temp-list ref="notifyTempListRef" @notifyEvent="getNotifyTempData" />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <!-- <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button> -->

          <el-button
            type="primary"
            @click="submitForm"
            :disabled="updateBtnDisabled"
            :loading="confirmLoading"
            v-hasPermi="['iot:alert:edit']"
            v-show="form.alertId"
            >{{ "修改" }}</el-button
          >
          <el-button
            type="primary"
            @click="submitForm"
            :disabled="updateBtnDisabled"
            :loading="confirmLoading"
            v-hasPermi="['iot:alert:add']"
            v-show="!form.alertId"
            >{{ "新增" }}</el-button
          >
          <el-button @click="handleCancel">{{ "取消" }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Alert">
import { listAlert, getAlert, delAlert, addAlert, updateAlert, updateAlertPop } from "@/api/iot/alert";

import sceneList from "./scene-list";
import notifyTempList from "./notify-temp-list.vue";

const updateBtnDisabled = ref(false);
const { proxy } = getCurrentInstance();
const { iot_alert_level, iot_alert_status } = proxy.useDict(
  "iot_alert_level",
  "iot_alert_status"
);
const activeName = ref("relateScene");
const alertList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 子组件引用
const notifyTempListRef = ref(null);
// 子组件引用
const sceneListRef = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    alertName: null,
    alertLevel: null,
    status: null,
    notify: null,
    tenantId: null,
    tenantName: null,
    alertTitle: null,
  },
  rules: {
    alertTitle: [{ required: true, message: "告警标题不能为空", trigger: "blur" }],
    alertName: [{ required: true, message: "告警内容不能为空", trigger: "blur" }],
    alertLevel: [{ required: true, message: "告警级别不能为空", trigger: "change" }],
    status: [{ required: true, message: "告警状态不能为空", trigger: "change" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询设备告警列表 */
function getList() {
  loading.value = true;
  listAlert(queryParams.value).then((response) => {
    alertList.value = response.rows;
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
    alertId: null,
    alertName: null,
    alertLevel: null,
    status: null,
    notify: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    tenantName: null,
    alertTitle: null,
  };
  proxy.resetForm("alertRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.alertId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加设备告警";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _alertId = row.alertId || ids.value;
  getAlert(_alertId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改设备告警";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["alertRef"].validate((valid) => {
    if (valid) {
      if (form.value.alertId != null) {
        updateAlert(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAlert(form.value).then((response) => {
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
  const _alertIds = row.alertId || ids.value;
  proxy.$modal
    .confirm('是否确认删除设备告警编号为"' + _alertIds + '"的数据项？')
    .then(function () {
      return delAlert(_alertIds);
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
    "system/alert/export",
    {
      ...queryParams.value,
    },
    `alert_${new Date().getTime()}.xlsx`
  );
}

/** 添加通知模板按钮处理函数 */
const addAlertNotifyTempButton = () => {
  if (notifyTempListRef.value) {
    // 显示子组件对话框
    notifyTempListRef.value.open = true;

    // 传递已选中的模板列表（深拷贝避免数据污染）
    if (form.value.notifyTemplateList && form.value.notifyTemplateList.length > 0) {
      const selectedList = JSON.parse(JSON.stringify(form.value.notifyTemplateList));
      notifyTempListRef.value.selectNotifyTemps = selectedList;
      notifyTempListRef.value.ids = selectedList.map((item) => item.id);
    }

    // 刷新子组件中的模板列表
    notifyTempListRef.value.getList();
  }
};

/** 添加通知模板按钮处理函数 */
const addAlertScenesButton = () => {
  
  if (sceneListRef.value) {
    // 显示子组件对话框
    sceneListRef.value.openScene = true;

    // 传递已选中的模板列表（深拷贝避免数据污染）
    if (form.value.scenes && form.value.scenes.length > 0) {
      const selectedList = JSON.parse(JSON.stringify(form.value.scenes));
      sceneListRef.value.selectNotifyTemps = selectedList;
      sceneListRef.value.ids = selectedList.map((item) => item.id);
    }

    // 刷新子组件中的模板列表
    sceneListRef.value.getList();
  }
};

/** 接收子组件传递的通知模板数据 */
const getNotifyTempData = (selectedTemplates) => {
  form.value.notifyTemplateList = selectedTemplates;
};

/**获取场景数据*/
const getSceneData = (data) => {
  form.value.scenes = data;
};

/** 移除告警场景项*/
function handleAlertSceneRemove(row) {
  for (let i = 0; i < form.value.scenes.length; i++) {
    if (row.sceneId == form.value.scenes[i].sceneId) {
      form.value.scenes.splice(i, 1);
    }
  }
}
/** 移除告警通知项*/
function handleAlertNotifyTempRemove(row) {
  for (let i = 0; i < form.value.notifyTemplateList.length; i++) {
    if (row.id == form.value.notifyTemplateList[i].id) {
      form.value.notifyTemplateList.splice(i, 1);
    }
  }
}

// 取消按钮
function handleCancel() {
  open.value = false;
  reset();
}

// 处理弹窗告警提醒开关变化
function handleAlertPopChange(row) {
  const data = {
    alertId: row.alertId,
    alertPop: row.alertPop
  };
  updateAlertPop(data).then((response) => {
    proxy.$modal.msgSuccess("更新成功");
  }).catch(() => {
    // 如果更新失败，恢复原状态
    row.alertPop = row.alertPop === 1 ? 2 : 1;
  });
}

getList();
</script>
