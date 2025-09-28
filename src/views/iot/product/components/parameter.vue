<template>
  <div style="padding: 6px">
    <!-- 添加或修改通用物模型对话框 -->
    <el-dialog v-model="openEdit" title="编辑参数" width="900px" append-to-body>
      <div style="margin: -30px 0 30px; background-color: #ddd; height: 1px"></div>
      <el-row>
        <el-col :span="12" style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background-color: #eee">
          <el-form :model="queryParams" :inline="true" label-width="48px" >
            <el-form-item prop="templateName">
              <el-input v-model="queryParams.templateName" placeholder="请输入物模型名称" style="width: 160px" clearable 
                 @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="info" icon="search"  @click="handleQuery" style="padding: 5px">搜索</el-button>
            </el-form-item>
            <el-form-item>
              <el-link :underline="false" icon="info" type="primary" style="margin-left: 20px">单击应用模板</el-link>
            </el-form-item>
          </el-form>

          <el-table v-loading="loading" :data="templateList"  @row-click="rowClick" highlight-current-row 
            :border="false" :show-header="false" :row-style="{ backgroundColor: '#eee' }">
            <el-table-column label="选择" width="30" align="center">
              <template #default="{ row }">
                <input type="radio" :checked="row.isSelect" :disabled="row.datatype == 'array' || row.datatype == 'object'" 
                  name="template" />
              </template>
            </el-table-column>
            <el-table-column label="名称" align="left" prop="templateName" />
            <el-table-column label="标识符" align="left" prop="identifier" />
            <el-table-column label="数据类型" align="center" prop="datatype" width="60">
              <template #default="{ row }">
                <dict-tag :options="dict.iot_data_type" :value="row.datatype" />
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            small
            style="margin: 0 0 10px; background-color: #eee"
            layout="prev, pager, next"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </el-col>

        <el-col :span="11" :offset="1">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="参数名称" prop="name">
              <el-input v-model="form.name" placeholder="例如：温度" style="width: 270px"  />
            </el-form-item>
            <el-form-item label="参数标识" prop="id">
              <el-input v-model="form.id" placeholder="例如：temperature" style="width: 270px" ></el-input>
            </el-form-item>
            <el-form-item label="参数排序" prop="order">
              <el-input-number controls-position="right" v-model="form.order" placeholder="请输入排序" type="number" 
                style="width: 270px"  />
            </el-form-item>

            <el-form-item label="参数特性" prop="property">
              <el-checkbox name="isChart" label="图表展示" @change="isChartChange" v-model="form.isChart" 
                :true-value="1" :false-value="0"></el-checkbox>
              <el-checkbox name="isMonitor" label="实时监测" @change="isMonitorChange" v-model="form.isMonitor" 
                :true-value="1" :false-value="0"></el-checkbox>
              <el-checkbox name="isReadonly" label="只读数据" @change="isReadonlyChange" v-model="form.isReadonly" 
                :true-value="1" :false-value="0"></el-checkbox>
              <el-checkbox name="isHistory" label="历史存储" v-model="form.isHistory" 
                :true-value="1" :false-value="0"></el-checkbox>
              <el-checkbox name="isSharePerm" label="分享权限" v-model="form.isSharePerm" 
                :true-value="1" :false-value="0"></el-checkbox>
            </el-form-item>

            <div style="margin-bottom: 20px; background-color: #ddd; height: 1px"></div>
            <el-form-item label="数据类型" prop="datatype">
              <el-select v-model="form.datatype" placeholder="请选择数据类型" style="width: 125px" >
                <el-option key="integer" label="整数" value="integer"></el-option>
                <el-option key="decimal" label="小数" value="decimal"></el-option>
                <el-option key="bool" label="布尔" value="bool" :disabled="form.isChart == 1"></el-option>
                <el-option key="enum" label="枚举" value="enum" :disabled="form.isChart == 1"></el-option>
                <el-option key="string" label="字符串" value="string" :disabled="form.isChart == 1"></el-option>
              </el-select>
            </el-form-item>
            <div v-if="form.datatype == 'integer' || form.datatype == 'decimal'">
              <el-form-item label="取值范围">
                <el-row>
                  <el-col :span="10">
                    <el-input v-model="form.specs.min" placeholder="最小值" type="number"  />
                  </el-col>
                  <el-col :span="4" align="center">到</el-col>
                  <el-col :span="10">
                    <el-input v-model="form.specs.max" placeholder="最大值" type="number"  />
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item label="单位">
                <el-input v-model="form.specs.unit" placeholder="例如：℃" style="width: 308px"  />
              </el-form-item>
              <el-form-item label="步长">
                <el-input-number controls-position="right" v-model="form.specs.step" placeholder="例如：1" type="number" 
                  style="width: 308px"  />
              </el-form-item>
            </div>
            <div v-if="form.datatype == 'bool'">
              <el-form-item label="布尔值">
                <el-row style="margin-bottom: 10px">
                  <el-col :span="10">
                    <el-input v-model="form.specs.falseText" placeholder="例如：关闭"  />
                  </el-col>
                  <el-col :span="10" :offset="1">（0 值对应文本）</el-col>
                </el-row>
                <el-row>
                  <el-col :span="10">
                    <el-input v-model="form.specs.trueText" placeholder="例如：打开"  />
                  </el-col>
                  <el-col :span="10" :offset="1">（1 值对应文本）</el-col>
                </el-row>
              </el-form-item>
            </div>
            <div v-if="form.datatype == 'enum'">
              <el-form-item label="展示方式">
                <el-select v-model="form.specs.showWay" placeholder="请选择展示方式" style="width: 175px">
                  <el-option key="select" label="下拉框" value="select"></el-option>
                  <el-option key="button" label="按钮" value="button"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="枚举项">
                <el-row v-for="(item, index) in form.specs.enumList" :key="'enum' + index" style="margin-bottom: 10px">
                  <el-col :span="8">
                    <el-input v-model="item.value" placeholder="例如：0"  />
                  </el-col>
                  <el-col :span="11" :offset="1">
                    <el-input v-model="item.text" placeholder="例如：中速挡位"  />
                  </el-col>
                  <el-col :span="3" :offset="1" v-if="index != 0">
                    <a style="color: #f56c6c" @click="removeEnumItem(index)">删除</a>
                  </el-col>
                </el-row>
                <div>
                  +
                  <a style="color: #409eff" @click="addEnumItem()">添加枚举项</a>
                </div>
              </el-form-item>
            </div>
            <div v-if="form.datatype == 'string'">
              <el-form-item label="最大长度">
                <el-row>
                  <el-col :span="10">
                    <el-input v-model="form.specs.maxLength" placeholder="例如：1024" type="number"  />
                  </el-col>
                </el-row>
              </el-form-item>
            </div>
          </el-form>
        </el-col>
      </el-row>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useDict } from '@/utils/dict';
import { listTemplate } from '@/api/iot/template';

const dict = useDict(['iot_things_type', 'iot_data_type', 'iot_yes_no']);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['dataEvent']);

// 数据状态
const loading = ref(true);
const openEdit = ref(false);
const total = ref(0);
const formRef = ref();
const index = ref(-1);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  templateName: null,
  type: null,
});

// 表单数据
const form = reactive({
  name: null,
  id: null,
  order: 0,
  datatype: 'integer',
  isChart: 0,
  isHistory: 1,
  isSharePerm: 0,
  isMonitor: 0,
  isReadonly: 0,
  specs: {
    enumList: [
      {
        value: '',
        text: '',
      },
    ],
    showWay: 'select',
  },
});

// 表格数据
const templateList = ref([]);

// 表单验证
const rules = reactive({
  name: [
    {
      required: true,
      message: '参数名称不能为空',
      trigger: 'blur',
    },
  ],
  id: [
    {
      required: true,
      message: '参数标识符不能为空',
      trigger: 'blur',
    },
  ],
  order: [
    {
      required: true,
      message: '模型排序不能为空',
      trigger: 'blur',
    },
  ],
  datatype: [
    {
      required: true,
      message: '数据类型不能为空',
      trigger: 'change',
    },
  ],
});

// 监听props变化
watch(() => props.data, (newVal) => {
  index.value = newVal.index;
  if (newVal?.parameter?.name) {
    Object.assign(form, {
      name: newVal.parameter.name,
      id: newVal.parameter.id,
      order: newVal.parameter.order,
      isChart: newVal.parameter.isChart ?? 0,
      isHistory: newVal.parameter.isHistory ?? 1,
      isSharePerm: newVal.parameter.isSharePerm ?? 0,
      isMonitor: newVal.parameter.isMonitor ?? 0,
      isReadonly: newVal.parameter.isReadonly ?? 0,
      specs: newVal.parameter.datatype,
      datatype: newVal.parameter.datatype?.type || 'integer',
    });

    if (!form.specs.enumList) {
      form.specs.enumList = [
        {
          value: '',
          text: '',
        },
      ];
    }
  }
  openEdit.value = true;
  getList();
}, { immediate: true, deep: true });

/** 查询通用物模型列表 */
function getList() {
  loading.value = true;
  listTemplate(queryParams).then((response) => {
    templateList.value = response.rows.map(item => ({
      ...item,
      isSelect: false
    }));
    total.value = response.total;
    loading.value = false;
  });
}

/** 单选数据 */
function rowClick(item) {
  if (item && item.datatype !== 'array' && item.datatype !== 'object') {
    Object.assign(form, {
      name: item.templateName,
      id: item.identifier,
      order: item.modelOrder,
      isChart: item.isChart ?? 0,
      isHistory: item.isHistory ?? 1,
      isSharePerm: item.isSharePerm ?? 0,
      isReadonly: item.isReadonly ?? 0,
      isMonitor: item.isMonitor ?? 0,
      datatype: item.datatype,
      specs: JSON.parse(item.specs),
    });

    if (!form.specs.enumList) {
      form.specs.enumList = [
        {
          value: '',
          text: '',
        },
      ];
    }

    setRadioSelected(item.templateId);
  }
}

/** 设置单选按钮选中 */
function setRadioSelected(templateId) {
  templateList.value = templateList.value.map(item => ({
    ...item,
    isSelect: item.templateId === templateId
  }));
}

// 取消按钮
function cancel() {
  openEdit.value = false;
  reset();
}

// 表单重置
function reset() {
  index.value = -1;
  Object.assign(form, {
    name: null,
    id: null,
    order: 0,
    datatype: 'integer',
    isChart: 0,
    isHistory: 1,
    isSharePerm: 0,
    isMonitor: 0,
    isReadonly: 0,
    specs: {
      enumList: [
        {
          value: '',
          text: '',
        },
      ],
      showWay: 'select',
    },
  });
  formRef.value?.resetFields();
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 提交按钮 */
function submitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      const data = {
        parameter: {
          ...form,
          datatype: formatThingsSpecs()
        },
        index: index.value,
      };
      
      delete data.parameter.specs;
      openEdit.value = false;
      emit('dataEvent', data);
      reset();
    }
  });
}

// 是否图表展示改变
function isChartChange() {
  if (form.isChart === 1) {
    form.isReadonly = 1;
  } else {
    form.isMonitor = 0;
  }
}

// 是否实时监测改变
function isMonitorChange() {
  if (form.isMonitor === 1) {
    form.isReadonly = 1;
    form.isChart = 1;
  }
}

// 是否只读数据改变
function isReadonlyChange() {
  if (form.isReadonly === 0) {
    form.isMonitor = 0;
    form.isChart = 0;
  }
}

// 格式化物模型
function formatThingsSpecs() {
  const data = { type: form.datatype };
  
  switch (form.datatype) {
    case 'integer':
    case 'decimal':
      data.min = Number(form.specs.min ?? 0);
      data.max = Number(form.specs.max ?? 100);
      data.unit = form.specs.unit ?? '';
      data.step = Number(form.specs.step ?? 1);
      break;
    case 'string':
      data.maxLength = Number(form.specs.maxLength ?? 1024);
      break;
    case 'bool':
      data.falseText = form.specs.falseText ?? '关闭';
      data.trueText = form.specs.trueText ?? '打开';
      break;
    case 'enum':
      data.showWay = form.specs.showWay;
      if (form.specs.enumList?.[0]?.text) {
        data.enumList = form.specs.enumList;
      } else {
        data.showWay = 'select';
        data.enumList = [
          { value: '0', text: '低' },
          { value: '1', text: '高' },
        ];
      }
      break;
  }
  
  return data;
}

/** 添加枚举项 */
function addEnumItem() {
  form.specs.enumList.push({
    value: '',
    text: '',
  });
}

/** 删除枚举项 */
function removeEnumItem(index) {
  form.specs.enumList.splice(index, 1);
}
</script>

<style scoped>
.specsColor {
  background-color: #fcfcfc;
}
</style>