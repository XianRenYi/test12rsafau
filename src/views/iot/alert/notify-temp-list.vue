<template>
  <el-dialog 
    :title="title" 
    v-model="open" 
    width="800px" 
    append-to-body
  >
    <el-form 
      :model="queryParams" 
      ref="queryFormRef" 
      :inline="true" 
      label-width="68px" 
      style="margin-bottom: -10px"
    >
      <el-form-item label="模版名称" prop="name">
        <el-input 
          v-model="queryParams.name" 
          placeholder="请输入模版名称" 
          size="mini"
          clearable 
          @keyup.enter="handleQuery" 
        />
      </el-form-item>
      <el-form-item label="渠道类型" prop="channelType">
        <el-select 
          v-model="queryParams.channelType" 
          placeholder="请选择渠道类型"
          clearable 
          size="mini" 
          style="width: 100%"
        >
          <el-option 
            v-for="option in notifyChannelType" 
            :key="option.value" 
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button 
          type="primary" 
          icon="el-icon-search" 
          size="mini"
          @click="handleQuery"
        >查询</el-button>
        <!-- <el-button 
          icon="el-icon-refresh" 
          size="mini" 
          @click="resetQuery"
        >重置</el-button> -->
      </el-form-item>
    </el-form>

    <el-table 
      v-loading="loading" 
      :data="notifyTempList" 
      @select="handleSelectionChange"
      @select-all="handleSelectionAll" 
      ref="multipleTableRef" 
      size="mini"
    >
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column label="编号" width="50" align="center" prop="id" />
      <el-table-column label="模版名称" align="center" prop="name" min-width="100" />
      <el-table-column label="是否启用" align="center" prop="status">
        <template #default="scope">
          <el-switch 
            v-model="scope.row.status" 
            @change="handleStatus(scope.row)" 
            disabled 
            :active-value="1"
            :inactive-value="0" 
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

    <template #footer>
      <div style="width: 100%">
        <el-button 
          type="primary" 
          @click="handleEmitData"
        >确认</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick , defineEmits } from 'vue';
import { useDict } from '@/utils/dict';
import { listTemplate } from '@/api/notify/template';

// 定义组件事件
const emit = defineEmits(['notifyEvent']);
// 状态定义（不再使用export，改为通过ref糖语法暴露）
const open = ref(false);
const ids = ref([]);
const selectNotifyTemps = ref([]);
const title = ref('通知模板场景');
const loading = ref(true);
const total = ref(0);
const notifyTempList = ref([]);

// 搜索参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  serviceCode: 'alert',
  name: null,
  channelType: null,
});

// 组件引用
const queryFormRef = ref();
const multipleTableRef = ref();

// 获取字典数据
const { notify_channel_type: notifyChannelType } = useDict('notify_channel_type');

// 监听弹窗显示，触发数据查询
watch(open, (newVal) => {
  if (newVal) {
    getList();
  }
});

// 监听选中ID变化，更新表格选中状态
watch(ids, (newVal) => {
  if (notifyTempList.value.length && newVal.length) {
    nextTick(() => {
      multipleTableRef.value.clearSelection();
      notifyTempList.value.forEach(row => {
        if (newVal.includes(row.id)) {
          multipleTableRef.value.toggleRowSelection(row, true);
        }
      });
    });
  }
});

// 查询模板列表
const getList = () => {
  loading.value = true;
  listTemplate(queryParams).then(response => {
    notifyTempList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    // 同步选中状态
    if (ids.value.length) {
      nextTick(() => {
        notifyTempList.value.forEach(row => {
          if (ids.value.includes(row.id)) {
            multipleTableRef.value.toggleRowSelection(row, true);
          }
        });
      });
    }
  });
};


const handleEmitData = () => {
  open.value = false;
  emit('notifyEvent', selectNotifyTemps.value);
};

// 取消选择
const cancel = () => {
  open.value = false;
  ids.value = [];
  selectNotifyTemps.value = [];
};

// 搜索操作
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置搜索
const resetQuery = () => {
  queryParams.name = null;
  queryParams.channelType = null;
  queryFormRef.value.resetFields();
  handleQuery();
};

// 选中项变化处理
const handleSelectionChange = (selection, row) => {
  const index = ids.value.indexOf(row.id);
  const isSelected = selection.includes(row);
  if (isSelected && index === -1) {
    ids.value.push(row.id);
    selectNotifyTemps.value.push(row);
  } else if (!isSelected && index !== -1) {
    ids.value.splice(index, 1);
    selectNotifyTemps.value.splice(index, 1);
  }
};

// 全选处理
const handleSelectionAll = (selection) => {
  ids.value = selection.map(item => item.id);
  selectNotifyTemps.value = [...selection];
};

// 状态变更处理
const handleStatus = (row) => {
  console.log('状态变更:', row);
};

// 显式暴露组件属性（替代export）
defineExpose({
  open,
  ids,
  selectNotifyTemps,
  getList,
  handleEmitData,
  cancel
});
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
</style>