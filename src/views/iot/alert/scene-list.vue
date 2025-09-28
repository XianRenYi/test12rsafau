<template>
    <el-dialog :title="'选择场景'" v-model="openScene"   width="800px" append-to-body>
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" style="margin-bottom: -10px">
            <el-form-item :label="'场景名称'" prop="sceneName">
                <el-input v-model="queryParams.sceneName" :placeholder="'请输入场景名'" clearable
                    size="small" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button icon="el-icon-search"  @click="handleQuery">{{ '查询' }}</el-button>
                <!-- <el-button icon="el-icon-refresh"  @click="handleResetQuery">{{ '重置' }}</el-button> -->
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="sceneList" @select="handleSelectionChange" @select-all="handleSelectionAll"
            ref="multipleTable" >
            <el-table-column type="selection" width="40"></el-table-column>
            <el-table-column :label="'场景名称'" align="center" prop="sceneName" />
            <el-table-column :label="'状态'" align="center" prop="enable" width="">
                <template #default="scope">
                    <el-tag type="success" size="small" v-if="scope.row.enable == 1">{{ '启动'
                        }}</el-tag>
                    <el-tag type="danger" size="small" v-if="scope.row.enable == 2">{{ '暂停'
                        }}</el-tag>
                </template>
            </el-table-column>
            <!-- <el-table-column :label="'触发条件'" align="center" prop="cond">
                <template #default="scope">
                    <span v-if="scope.row.cond == 1">{{ '任意条件' }}</span>
                    <span v-if="scope.row.cond == 2">{{ '所有条件' }}</span>
                    <span v-if="scope.row.cond == 3">{{ '不满足条件' }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="'执行方式'" align="center" prop="executeMode">
                <template #default="scope">
                    <span v-if="scope.row.executeMode == 1">{{ '串行' }}</span>
                    <span v-if="scope.row.executeMode == 2">{{ '并行' }}</span>
                </template>
            </el-table-column> -->
            <el-table-column :label="'创建时间'" align="center" prop="createTime" width="200">
                <template #default="scope">
                    <span>{{ scope.row.createTime }}</span>
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
  import { listScene } from '@/api/iot/scene';

  // 定义组件事件
  const emit = defineEmits(['sceneEvent']);
  // 状态定义（不再使用export，改为通过ref糖语法暴露）
  const openScene = ref(false);
  const ids = ref([]);
  const selectNotifyTemps = ref([]);
  const loading = ref(true);
  const total = ref(0);
  const sceneList = ref([]);
  
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
  
 
  // 监听弹窗显示，触发数据查询
  watch(openScene, (newVal) => {
    if (newVal) {
      getList();
    }
  });
  
  // 监听选中ID变化，更新表格选中状态
  watch(ids, (newVal) => {
    if (sceneList.value.length && newVal.length) {
      nextTick(() => {
        multipleTableRef.value.clearSelection();
        sceneList.value.forEach(row => {
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
    listScene(queryParams).then(response => {
      sceneList.value = response.rows;
      total.value = response.total;
      loading.value = false;
      // 同步选中状态
      if (ids.value.length) {
        nextTick(() => {
          sceneList.value.forEach(row => {
            if (ids.value.includes(row.id)) {
              multipleTableRef.value.toggleRowSelection(row, true);
            }
          });
        });
      }
    });
  };
  
  
  const handleEmitData = () => {
    openScene.value = false;
    emit('sceneEvent', selectNotifyTemps.value);
  };
  
  // 取消选择
  const cancel = () => {
    openScene.value = false;
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
    openScene,
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