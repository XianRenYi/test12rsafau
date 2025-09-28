<template>
    <el-dialog title="选择场景" v-model="openScene" width="800px" append-to-body>
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" style="margin-bottom: -10px">
            <el-form-item label="场景名称" prop="sceneName">
                <el-input v-model="queryParams.sceneName" placeholder="请输入场景名称" clearable size="small" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="handleResetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="sceneList" @row-click="rowClick" ref="singleTable" highlight-current-row size="mini">
            <el-table-column label="选择" width="50" align="center">
                <template #default="scope">
                    <input type="radio" :checked="scope.row.isSelect" name="product" />
                </template>
            </el-table-column>
            <el-table-column label="场景名称" align="center" prop="sceneName" />
            <el-table-column label="状态" align="center" prop="enable" width="">
                <template #default="scope">
                    <el-tag type="success" size="small" v-if="scope.row.enable == 1">启动</el-tag>
                    <el-tag type="danger" size="small" v-if="scope.row.enable == 2">暂停</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="触发条件" align="center" prop="cond">
                <template #default="scope">
                    <span v-if="scope.row.cond == 1">任意条件</span>
                    <span v-if="scope.row.cond == 2">所有条件</span>
                    <span v-if="scope.row.cond == 3">不满足条件</span>
                </template>
            </el-table-column>
            <el-table-column label="执行方式" align="center" prop="executeMode">
                <template #default="scope">
                    <span v-if="scope.row.executeMode == 1">串行</span>
                    <span v-if="scope.row.executeMode == 2">并行</span>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" width="100">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

        <template #footer>
            <div style="width: 100%">
                <el-button type="primary" @click="confirmSelectScene">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { listScene } from '@/api/iot/scene';
import { parseTime } from '@/utils/ruoyi';

const emit = defineEmits(['sceneEvent']);

// State
const openScene = ref(false);
const loading = ref(true);
const total = ref(0);
const sceneList = ref([]);
const selectSceneId = ref(0);
const scene = ref({});
const queryForm = ref();
const singleTable = ref();

// Query params
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    hasAlert: 1,
    sceneName: null,
});

// Form
const form = reactive({});

/** 查询场景联动列表 */
const getList = () => {
    loading.value = true;
    listScene(queryParams).then((response) => {
        sceneList.value = response.rows.map(item => ({
            ...item,
            isSelect: false
        }));
        total.value = response.total;
        loading.value = false;
        // 设置选中
        setRadioSelected(selectSceneId.value);
    });
};

// 取消按钮
const cancel = () => {
    openScene.value = false;
    scene.value = {};
};

// 搜索按钮操作
const handleQuery = () => {
    queryParams.pageNum = 1;
    getList();
};

// 重置按钮操作
const handleResetQuery = () => {
    queryForm.value.resetFields();
    handleQuery();
};

/** 单选数据 */
const rowClick = (row) => {
    if (row) {
        setRadioSelected(row.sceneId);
        scene.value = row;
    }
};

/** 设置单选按钮选中 */
const setRadioSelected = (sceneId) => {
    sceneList.value.forEach(item => {
        item.isSelect = item.sceneId === sceneId;
    });
};

/** 确定选择场景，场景传递给父组件 */
const confirmSelectScene = () => {
    if (scene.value) {
        emit('sceneEvent', scene.value);
    }
    openScene.value = false;
};

// Expose methods to parent component
defineExpose({
    openScene,
    selectSceneId,
    scene,
    getList,
    confirmSelectScene,
    cancel
});
</script>