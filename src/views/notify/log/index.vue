<template>
  <div class="notify-log">
    <el-card v-show="showSearch" style="margin-bottom: 10px">
      <el-form
        @submit.prevent
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        size="mini"
        label-width="78px"
        style="margin-bottom: -18px"
      >
        <el-form-item :label="'渠道编号 '" prop="channelId">
          <el-input
            v-model="queryParams.channelId"
            :placeholder="'请输入渠道编号 '"
            clearable
            type="number"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="'模版编号'" prop="notifyTemplateId" label-width="106px">
          <el-input
            v-model="queryParams.notifyTemplateId"
            :placeholder="'请输入模版编号 '"
            clearable
            type="number"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="'发送账号 '" prop="sendAccount">
          <el-input
            v-model="queryParams.sendAccount"
            :placeholder="'请输入发送账号 '"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <template v-if="searchShow">
          <el-form-item :label="'业务编码 '" prop="serviceCode">
            <el-select
              v-model="queryParams.serviceCode"
              :placeholder="'请选择通知业务 '"
              clearable
              style="width: 100%; display: inline-block"
            >
              <el-option
                v-for="dict in dict.type.notify_service_code"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>

        <template v-if="searchShow">
          <el-form-item :label="'发送时间 '">
            <el-date-picker
              v-model="dateRange"
              style="width: 220px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              :start-placeholder="'开始日期 '"
              :end-placeholder="'结束日期 '"
              :picker-options="pickerOptions"
            ></el-date-picker>
          </el-form-item>
        </template>

        <el-form-item style="float: right">
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
            >{{ "搜索" }}</el-button
          >
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{
            "重置"
          }}</el-button>
          <el-button type="text" @click="searchChange">
            {{ searchShow ? "收起" : "展开" }}
            <i
              :class="{
                'el-icon-arrow-down': !searchShow,
                'el-icon-arrow-up': searchShow,
              }"
            ></i>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-row :gutter="10" style="margin-bottom: 15px">
        <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table
        v-loading="loading"
        :data="logList"
        :border="false"
        @selection-change="handleSelectionChange"
      >
        <el-table-column :label="'渠道编号 '" align="left" prop="channelId" width="100" />
        <el-table-column
          :label="'渠道账号 '"
          align="center"
          prop="channelName"
          min-width="150"
        />
        <el-table-column
          :label="'模版编号'"
          align="left"
          prop="notifyTemplateId"
          width="100"
        />
        <el-table-column
          :label="'模板名称 '"
          align="center"
          prop="templateName"
          min-width="180"
        />
        <el-table-column
          :label="'业务编码 '"
          align="center"
          prop="serviceCode"
          width="100"
        >
          <template #slot-scope="scope">
            <dict-tag
              :options="dict.type.notify_service_code"
              :value="scope.row.serviceCode"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="'发送账号 '"
          align="left"
          prop="sendAccount"
          min-width="250"
        />
        <el-table-column
          :label="'发送状态 '"
          align="center"
          prop="sendStatus"
          width="100"
        >
          <template #slot-scope="scope">
            <el-tag size="mini" type="danger" v-if="scope.row.sendStatus == 0">{{
              "失败 "
            }}</el-tag>
            <el-tag size="mini" type="success" v-if="scope.row.sendStatus == 1">{{
              "成功 "
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="'发送时间 '"
          align="center"
          prop="createTime"
          width="180"
        >
          <template #slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="'操作'"
          align="center"
          class-name="small-padding fixed-width"
          width="140"
        >
          <template #slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleView(scope.row)"
              v-hasPermi="['notify:log:query']"
              >{{ "详情" }}</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['notify:log:remove']"
              >{{ "删除" }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination
        style="margin-bottom: 20px"
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 通知日志详情对话框 -->
    <el-dialog :title="title" :visible="open" width="700px" append-to-body>
      <div style="margin-top: -55px" class="dialog-wrap">
        <el-divider style="margin-top: -30px"></el-divider>
        <el-form ref="form" :model="form" label-width="80px" disabled>
          <el-form-item :label="'发送账号 '" prop="sendAccount">
            <el-input v-model="form.sendAccount" :placeholder="'请输入发送账号 '" />
          </el-form-item>
          <el-form-item :label="'返回内容 '">
            <el-input
              type="textarea"
              :rows="8"
              :placeholder="'请输入内容 '"
              v-model="form.resultContent"
            ></el-input>
          </el-form-item>
          <el-form-item :label="'消息内容 '">
            <editor v-model="form.msgContent" :min-height="192" :readOnly="true" />
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLog, getLog, delLog, addLog, updateLog } from "@/api/notify/log";

export default {
  name: "Log",
  dicts: ["notify_message_type", "iot_is_enable", "notify_service_code"],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      searchShow: false, //搜索展开
      // 总条数
      total: 0,
      // 通知日志表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        notifyTemplateId: null,
        channelId: null,
        msgContent: null,
        sendAccount: null,
        sendStatus: null,
        resultContent: null,
        dateRange: "",
        serviceCode: null,
      },
      //选择时间不超过当前时间
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询通知日志列表 */
    getList() {
      this.loading = true;
      listLog(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
        this.logList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        notifyTemplateId: null,
        channelId: null,
        msgType: null,
        msgContent: null,
        sendAccount: null,
        sendStatus: null,
        resultContent: null,
        createTime: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加通知日志 ";
    },
    /** 详情按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id || this.ids;
      getLog(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "查看日志详情 ";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateLog(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLog(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm("是否确认删除通知日志")
        .then(function () {
          return delLog(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "notify/log/export",
        {
          ...this.queryParams,
        },
        `log_${new Date().getTime()}.xlsx`
      );
    },
    // 搜索展开隐藏
    searchChange() {
      this.searchShow = !this.searchShow;
    },
  },
};
</script>

<style lang="scss" scoped>
.notify-log {
  padding: 20px;
}

.dialog-wrap ::v-deep .el-input.is-disabled .el-input__inner {
  background-color: #fff;
  color: #000000 !important;
}

.dialog-wrap ::v-deep textarea[disabled],
textarea:disabled,
textarea.disabled {
  color: #000000 !important;
  background-color: #fff !important;
  font-size: 16px;
}

.status-success-wrap {
  color: #13ce66 !important;
}

.status-error-wrap {
  color: #ff4949 !important;
}
</style>
