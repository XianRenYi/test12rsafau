<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
     <el-col :span="1.5">
         <el-button   v-if="productInfo.status == 1"  type="primary"     plain   icon="Plus"       @click="handleAdd"     v-hasPermi="['system:category:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Upload" @click="handleSelect" v-if="productInfo.status == 1">选择导入模型</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="View" @click="handleOpenThingsModel">查看模型JSON</el-button>
      </el-col>
    </el-row>


    <el-table v-loading="loading" :data="modelList" size="small" style="height: auto; max-height: 45vh; overflow-y: auto;" @sort-change="handleSortChange">
      <el-table-column fixed label="名称" align="center" prop="modelName" sortable="custom" />
      <el-table-column label="标识" align="center" prop="identifier" sortable="custom" />
      <el-table-column label="类型" align="center" prop="datatype" width="100" sortable="custom">
        <template #default="scope">
          <dict-tag :options="iot_data_type" :value="scope.row.datatype" />
        </template>
      </el-table-column>

      <el-table-column label="最大值" align="center" >
        <template #default="scope">
          <div v-html="getValue_formatSpecsDisplay(scope.row.specs,'最大值')"></div>
        </template>
      </el-table-column>

      <el-table-column label="最小值" align="center" header-align="center" >
        <template #default="scope">
          <div v-html="getValue_formatSpecsDisplay(scope.row.specs,'最小值')"></div>
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center" header-align="center" >
        <template #default="scope">
          <div v-html="getValue_formatSpecsDisplay(scope.row.specs,'单位')"></div>
        </template>
      </el-table-column>


      <!-- <el-table-column label="排序" align="center" prop="modelOrder" width="80" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="productInfo.status != 2">
        <template #default="scope">
          <el-button size="small" type="text" icon="Edit" @click="handleUpdate(scope.row)" v-if="productInfo.status != 2">修改</el-button>
          <el-button size="small" type="text" icon="Delete" @click="handleDelete(scope.row)" v-if="productInfo.status != 2">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--物模型参数类型-->
    <things-parameter :data="paramData" @dataEvent="getParamData" />

    <!-- 添加或修改产品分类对话框 -->
    <el-dialog :title="title" v-model="openSelect" width="1500px" append-to-body>
      <product-select-template ref="productSelectTemplateRef" @idsToParentEvent="getChildData" />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="importSelect">导 入</el-button>
          <el-button @click="cancelSelect">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 物模型JSON -->
    <el-dialog :title="title" v-model="openThingsModel" width="600px" append-to-body>
      <div style="border: 1px solid #ccc; margin-top: -15px; height: 600px; overflow: scroll">
          <vue-json-pretty :deep="3" selectableType="single" 
          :highlightMouseoverNode="true" 
          :collapsedOnClickBrackets="true" 
          :highlightSelectedNode="true"
           :showLine="true"
          :data="jsonData" > </vue-json-pretty>
      </div>
      <template #footer>
        <div class="dialog-footer">
           <el-button  type="primary"   @click="copyJsonContent">    复制JSON </el-button>
           <el-button  type="info" @click="handleCloseThingsModel">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>


  
    <!-- 添加或修改通用物模型对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="TemplateRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入名称，例如：温度" style="width: 385px" />
        </el-form-item>
        <el-form-item label="标识" prop="identifier">
          <el-input v-model="form.identifier" placeholder="请输入标识，例如：voc" style="width: 385px" />
        </el-form-item>
        <!-- <el-form-item label="模型排序" prop="modelOrder">
          <el-input-number controls-position="right" v-model="form.modelOrder" placeholder="请输入排序"
            style="width: 386px" />
        </el-form-item> -->
        <el-form-item label="类别" prop="type" style="display: none;">
          <el-radio-group v-model="form.type" @change="typeChange(form.type)">
            <el-radio-button label="1">属性</el-radio-button>
            <el-radio-button label="2">功能</el-radio-button>
            <!-- <el-radio-button label="3">事件</el-radio-button> -->
          </el-radio-group>
        </el-form-item>

    

        <div style="display: none;">
          <el-form-item label="模型特性" prop="property">
            <el-checkbox name="isHistory" label="数据存储" v-model="form.isHistory" :true-label="1"
            :false-label="0"></el-checkbox>
            <el-checkbox name="isChart" label="图表展示" @change="isChartChange" v-show="form.type == 1"
            v-model="form.isChart" :true-label="1" :false-label="0"></el-checkbox>
            <el-checkbox name="isMonitor" label="实时监测" @change="isMonitorChange" v-show="form.type == 1"
            v-model="form.isMonitor" :true-label="1" :false-label="0"></el-checkbox>
          </el-form-item>
        </div>
       


        <el-form-item label="类型" prop="datatype">
          <el-select v-model="form.datatype" placeholder="请选择类型" @change="dataTypeChange" style="width: 175px">
            <el-option key="integer" label="整数" value="integer"></el-option>
            <el-option key="decimal" label="小数" value="decimal"></el-option>
            <!-- <el-option key="bool" label="布尔" value="bool" :disabled="form.isChart == 1"></el-option>
            <el-option key="enum" label="枚举" value="enum" :disabled="form.isChart == 1"></el-option>
            <el-option key="string" label="字符串" value="string" :disabled="form.isChart == 1"></el-option> -->
          
          </el-select>
        </el-form-item>
        <div>
          <el-form-item label="取值范围" v-if="form.datatype == 'integer'">
            <el-row>
              <el-col :span="9">
                <el-input v-model="form.specs.min" placeholder="最小值" controls-position="right" type="number"
                  style="width: 174px;" @input="handleEdit" />
              </el-col>
              <el-col :span="2" align="center">到</el-col>
              <el-col :span="9">
                <el-input v-model="form.specs.max" placeholder="最大值" type="number" controls-position="right"
                  style="width: 174px;" @input="handleEditmax" />
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="取值范围" v-if="form.datatype == 'decimal'">
            <el-row>
              <el-col :span="9">
                <el-input v-model="form.specs.min" placeholder="最小值" controls-position="right" type="number"
                  style="width: 174px;" />
              </el-col>
              <el-col :span="2" align="center">到</el-col>
              <el-col :span="9">
                <el-input v-model="form.specs.max" placeholder="最大值" type="number" controls-position="right"
                  style="width: 174px;" />
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="单位" prop="unit" v-if="form.datatype == 'integer' || form.datatype == 'decimal'">
            <el-input v-model="form.specs.unit" placeholder="请输入单位，例如：℃" style="width: 385px" />
          </el-form-item>
          <!-- <el-form-item label="步长" prop="step" v-if="form.datatype == 'integer' || form.datatype == 'decimal'">
            <el-input controls-position="right" v-model="form.specs.step" placeholder="请输入步长，例如：1" type="number"
              style="width: 386px" />
          </el-form-item> -->
        </div>
        <div v-if="form.datatype == 'bool'">
          <el-form-item label="布尔值" prop="">
            <el-row style="margin-bottom: 10px">
              <el-col :span="9">
                <el-input v-model="form.specs.falseText" placeholder="例如：关闭" />
              </el-col>
              <el-col :span="10" :offset="1">（0 值对应文本）</el-col>
            </el-row>
            <el-row>
              <el-col :span="9">
                <el-input v-model="form.specs.trueText" placeholder="例如：打开" />
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
          <el-form-item label="枚举项" prop="">
            <el-row v-for="(item, index) in form.specs.enumList" :key="'enum' + index" style="margin-bottom: 10px">
              <el-col :span="9">
                <el-input v-model="item.value" placeholder="参数值，例如：0" />
              </el-col>
              <el-col :span="11" :offset="1">
                <el-input v-model="item.text" placeholder="参数描述，例如：中速档位" />
              </el-col>
              <el-col :span="2" :offset="1" v-if="index != 0"><a style="color: #f56c6c"
                  @click="removeEnumItem(index)">删除</a></el-col>
            </el-row>
            <div>
              +
              <a style="color: #409eff" @click="addEnumItem()">添加枚举项</a>
            </div>
          </el-form-item>
        </div>

        <div v-if="form.datatype == 'string'">
          <el-form-item label="最大长度" prop="">
            <el-row>
              <el-col :span="9">
                <el-input v-model="form.specs.maxLength" placeholder="例如：1024" type="number" />
              </el-col>
              <el-col :span="14" :offset="1">（字符串的最大长度）</el-col>
            </el-row>
          </el-form-item>
        </div>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <!-- <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button> -->
             <el-button type="primary" @click="submitForm" v-hasPermi="['iot:model:edit']" v-show="form.modelId">
          {{ '修改' }}
        </el-button>
        <el-button type="primary" @click="submitForm" v-hasPermi="['iot:model:add']" v-show="!form.modelId">{{
          '新增'
        }}
        </el-button>
        <el-button @click="cancel">{{ '取 消' }}</el-button>

        </div>
      </template>
    </el-dialog>

</template>

<script setup name="ProductThingsModel">
import { ref, reactive, watch, computed } from 'vue';
import { useDict } from '@/utils/dict';
import { ElMessage, ElMessageBox } from 'element-plus';
// 导入 Vue JSON Pretty 组件
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import ProductSelectTemplate from './ProductSelectTemplate.vue';
import { listModel, getModel, delModel, addModel, updateModel, importModel } from '@/api/iot/model';
const { proxy } = getCurrentInstance();
const { iot_things_type, iot_data_type, iot_yes_no } = proxy.useDict('iot_things_type', 'iot_data_type', 'iot_yes_no');

// 响应式数据
const jsonData = ref({
  name: "Vue JSON Pretty",
  version: "2.0.0",
  author: {
    name: "开发者",
    email: "dev@example.com"
  },
  features: ["语法高亮", "节点折叠", "行号显示", "复制功能"],
  isActive: true,
  stats: {
    downloads: 10000,
    rating: 4.8
  }
});

const props = defineProps({
  product: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits([]);

const loading = ref(false);
const modelList = ref([]);
const total = ref(0);
const title = ref('');
const open = ref(false);
const openSelect = ref(false);
const openThingsModel = ref(false);
const formRef = ref();
const productSelectTemplateRef = ref();

const productInfo = ref({});
const templateIds = ref([]);
const thingsModel = ref({});
const paramData = ref({
  index: -1,
  parameter: {}
});
const isDecimal = ref('');
const isDecimalMax = ref('');

const queryParams = reactive({
  productId: 0,
  pageNum: 1,
  pageSize: 100,
  isModbus: false,
  orderByColumn: '',
  isAsc: 'asc'
});

const form = reactive({
  modelName:null,
  modelId:null,
  templateId: null,
  templateName: null,
  userId: null,
  userName: null,
  tenantId: null,
  tenantName: null,
  identifier: null,
  modelOrder: 0,
  type: '1',
  datatype: 'integer',
  isSys: null,
  isChart: 1,
  isHistory: 1,
  isSharePerm: 1,
  isMonitor: 1,
  isReadonly: 1,
  delFlag: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  remark: null,
  specs: {
    enumList: [
      {
        value: '',
        text: ''
      }
    ],
    arrayType: 'integer',
    arrayCount: 5,
    showWay: 'select',
    params: []
  }
});

const rules = reactive({
  modelName: [
    {
      required: true,
      message: '物模型名称不能为空',
      trigger: 'blur'
    },
    {
      min: 1,
      max: 64,
      message: '物模型名称不能少于1个字符和超过64字符',
      trigger: 'blur'
    }
  ],
  identifier: [
    {
      required: true,
      message: '标识符，产品下唯一不能为空',
      trigger: 'blur'
    },
    {
      min: 1,
      max: 32,
      message: '模型标识不能少于1个字符和超过32字符',
      trigger: 'blur'
    }
  ],
  modelOrder: [
    {
      required: true,
      message: '模型排序不能为空',
      trigger: 'blur'
    },
    {
      type: 'number',
      min: -2147483648,
      max: 2147483647,
      message: '排序不能超过int型的范围值( -2^31——2^31-1)',
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: '模型类别不能为空',
      trigger: 'change'
    }
  ],
  datatype: [
    {
      required: true,
      message: '数据类型不能为空',
      trigger: 'change'
    }
  ]
});

watch(() => props.product, (newVal) => {
  productInfo.value = newVal;
  
  if (productInfo.value && productInfo.value.productId != 0) {
    queryParams.productId = productInfo.value.productId;
    queryParams.isModbus = productInfo.value.isModbus;
    queryParams.id=productInfo.value.id;
    // 重置排序参数，确保按照后端默认顺序显示
    resetSortParams();
    getList();

  }
}, { immediate: true, deep: true });

/** 查询产品物模型列表 */
function getList() {
  if(queryParams.productId == 0 || queryParams.productId == null){

  }else{
    loading.value = true;
  listModel(queryParams).then(response => {
    modelList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
  }
  
}

/** 排序改变 */
function handleSortChange({ prop, order }) {
  queryParams.orderByColumn = prop;
  queryParams.isAsc = order === 'ascending' ? 'asc' : 'desc';
  getList();
}

/** 重置排序参数 */
function resetSortParams() {
  queryParams.orderByColumn = '';
  queryParams.isAsc = 'asc';
}


// 复制JSON内容到剪贴板
const copyJsonContent = () => {
  try {
    // 将JSON对象转换为格式化的字符串（缩进2空格）
    const jsonString = JSON.stringify(jsonData.value, null, 2);
    // 复制到剪贴板
    navigator.clipboard.writeText(jsonString);
    // 提示成功
    ElMessage.success('JSON内容已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage.error('复制失败，请手动复制');
  }
};

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const modelId = row.modelId;
  getModel(modelId).then(response => {
    let tempForm = response.data;
    open.value = true;
    title.value = '产品模型JSON';
    // Json转对象
    tempForm.specs = JSON.parse(tempForm.specs);
    if (!tempForm.specs.enumList) {
      tempForm.specs.showWay = 'select';
      tempForm.specs.enumList = [
        {
          value: '',
          text: ''
        }
      ];
    }
    if (!tempForm.specs.arrayType) {
      tempForm.specs.arrayType = 'integer';
    }
    if (!tempForm.specs.arrayCount) {
      tempForm.specs.arrayCount = 5;
    }
    if (!tempForm.specs.params) {
      tempForm.specs.params = [];
    }
    // 对象和数组中参数删除前缀
    if ((tempForm.specs.type == 'array' && tempForm.specs.arrayType == 'object') || tempForm.specs.type == 'object') {
      for (let i = 0; i < tempForm.specs.params.length; i++) {
        tempForm.specs.params[i].id = String(tempForm.specs.params[i].id).substring(String(tempForm.identifier).length + 1);
      }
    }
    Object.assign(form, tempForm);
  });
}

/** 查看物模型 */
function handleOpenThingsModel() {
  title.value = '产品模型JSON';
  // 生成物模型
  thingsModel.value = {
    properties: [],
    functions: [],
    events: []
  };
  
  for (var i = 0; i < modelList.value.length; i++) {
    let thingsItem = {};
    thingsItem.id = modelList.value[i].identifier;
    thingsItem.name = modelList.value[i].modelName;
    if (modelList.value[i].type == 1) {
      //属性
      thingsItem.isChart = modelList.value[i].isChart;
      thingsItem.isMonitor = modelList.value[i].isMonitor;
      thingsItem.isHistory = modelList.value[i].isHistory;
      thingsItem.isSharePerm = modelList.value[i].isSharePerm;
      thingsItem.isReadonly = modelList.value[i].isReadonly;
      thingsItem.datatype = JSON.parse(modelList.value[i].specs);
      thingsModel.value.properties.push(thingsItem);
    } else if (modelList.value[i].type == 2) {
      // 功能
      thingsItem.isHistory = modelList.value[i].isHistory;
      thingsItem.isSharePerm = modelList.value[i].isSharePerm;
      thingsItem.isReadonly = modelList.value[i].isReadonly;
      thingsItem.datatype = JSON.parse(modelList.value[i].specs);
      thingsModel.value.functions.push(thingsItem);
    } else if (modelList.value[i].type == 3) {
      // 事件
      thingsItem.isHistory = modelList.value[i].isHistory;
      thingsItem.isSharePerm = modelList.value[i].isSharePerm;
      thingsItem.isReadonly = modelList.value[i].isReadonly;
      thingsItem.datatype = JSON.parse(modelList.value[i].specs);
      thingsModel.value.events.push(thingsItem);
    }
  }

  jsonData.value = JSON.parse(JSON.stringify(thingsModel.value));
  openThingsModel.value = true;
}

/** 关闭物模型 */
function handleCloseThingsModel() {
  openThingsModel.value = false;
}

/** 选择物模型 */
function handleSelect() {
  openSelect.value = true;
  title.value = '选择导入模型';
  form.type = '1';
  form.datatype = 'integer';
  form.specs = {
    enumList: []
  };
}

// 取消导入通用物模型按钮
function cancelSelect() {
  openSelect.value = false;
  productSelectTemplateRef.value.$refs.selectTemplateTable.clearSelection();
}

// 获取子组件的值
function getChildData(data) {
  templateIds.value = data;
}

// 导入通用物模型按钮
function importSelect() {
  if (templateIds.value != null && templateIds.value.length > 0) {
    var importData = {
      productId: productInfo.value.productId,
      productName: productInfo.value.productName,
      templateIds: templateIds.value
    };
    importModel(importData).then(response => {
      ElMessage.success(response.msg);
      openSelect.value = false;
      productSelectTemplateRef.value.$refs.selectTemplateTable.clearSelection();
      // 重置排序参数，按照后端默认顺序显示
      resetSortParams();
      getList();
    });
  }
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加模型"
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["TemplateRef"].validate(valid => {


        if (valid) {
          // 验证对象或对象数组中的参数不能为空
          if (form.datatype == 'object' || (form.datatype == 'array' && form.specs.arrayType == 'object')) {
            if (!form.specs.params || form.specs.params == 0) {
              proxy.$modal.msgError('对象的参数不能为空');
              return;
            }
            if (containsUnderscore(form.identifier)) {
              proxy.$modal.msgError('对象类型模型标识输入不能包含下划线，请重新填写模型标识！');
              return;
            }
          }
          // 验证对象参数标识符不能相同
          if (form.specs.params && form.specs.params.length > 0) {
            let arr = form.specs.params.map((item) => item.id).sort();
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] == arr[i + 1]) {
                proxy.$modal.msgError('参数标识 ' + arr[i] + ' 重复');
                return;
              }
            }
          }
          //验证模型特性为图表展示时，数据类型是否为整数或者小数
          if ((form.isChart == 1 && form.datatype != 'integer') && (form.isChart == 1 && form.datatype != 'decimal')) {
            proxy.$modal.msgError('请重新选择数据类型！');
          } else if (form.modelId != null) {
            // 格式化specs
            let tempForm = JSON.parse(JSON.stringify(form));
            tempForm.specs = formatThingsSpecs();
            if (form.type == 2) {
              tempForm.isMonitor = 0;
              tempForm.isChart = 0;
            } else if (form.type == 3) {
              tempForm.isMonitor = 0;
              tempForm.isChart = 0;
            }
            updateModel(tempForm).then((response) => {
              proxy.$modal.msgSuccess('修改成功');
              open.value = false;
              // 重置排序参数，按照后端默认顺序显示
              resetSortParams();
              getList();
            });
          } else {
            // 格式化specs
            let tempForm = JSON.parse(JSON.stringify(form));
            tempForm.specs = formatThingsSpecs();
            tempForm.productId = productInfo.value.productId;
            tempForm.productName = productInfo.value.productName;
            if (form.type == 2) {
              tempForm.isMonitor = 0;
            } else if (form.type == 3) {
              tempForm.isMonitor = 0;
              tempForm.isChart = 0;
            }
            addModel(tempForm).then((response) => {
              proxy.$modal.msgSuccess('新增成功');
              open.value = false;
              // 重置排序参数，按照后端默认顺序显示
              resetSortParams();
              getList();
       
            });
          }
        }


  })
}


/** 删除按钮操作 */
function handleDelete(row) {
  const modelIds = row.modelId;
  ElMessageBox.confirm('是否确认删除物模型编号为"' + modelIds + '"的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delModel(modelIds);
  }).then(() => {
    // 重置排序参数，按照后端默认顺序显示
    resetSortParams();
    getList();
    ElMessage.success('删除成功');
  }).catch(() => { });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  formRef.value?.resetFields();
  Object.assign(form, {
    templateId: null,
    modelName:null,
    modelId:null,
    templateName: null,
    userId: null,
    userName: null,
    tenantId: null,
    tenantName: null,
    identifier: null,
    modelOrder: 0,
    type: '1',
    datatype: 'integer',
    isSys: null,
    isChart: 1,
    isHistory: 1,
    isSharePerm: 1,
    isMonitor: 1,
    isReadonly: 1,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    specs: {
      enumList: [
        {
          value: '',
          text: ''
        }
      ],
      arrayType: 'integer',
      arrayCount: 5,
      showWay: 'select',
      params: []
    }
  });
}

// 类型改变
function typeChange(type) {
  if (type == '1') {
    form.isChart = 1;
    form.isHistory = 1;
    form.isSharePerm = 1;
    form.isMonitor = 1;
    form.isReadonly = 1;
    form.datatype = 'integer';
  } else if (type == '2') {
    form.isChart = 0;
    form.isHistory = 1;
    form.isSharePerm = 1;
    form.isMonitor = 0;
    form.isReadonly = 0;
  } else if (type == '3') {
    form.isChart = 0;
    form.isHistory = 1;
    form.isSharePerm = 0;
    form.isMonitor = 0;
    form.isReadonly = 1;
  }
}

// 是否图表展示改变
function isChartChange() {
  if (form.isChart == 1) {
    form.isReadonly = 1;
  } else {
    form.isMonitor = 0;
  }
}

// 是否实时监测改变
function isMonitorChange() {
  if (form.isMonitor == 1) {
    form.isReadonly = 1;
    form.isChart = 1;
  }
}

// 是否只读数据改变
function isReadonlyChange() {
  if (form.isReadonly == 0) {
    form.isMonitor = 0;
    form.isChart = 0;
  }
}

// 格式化物模型
function formatThingsSpecs() {
  var data = {};
  data.type = form.datatype;
  if (form.datatype == 'integer' || form.datatype == 'decimal') {
    data.min = Number(form.specs.min ? form.specs.min : 0);
    data.max = Number(form.specs.max ? form.specs.max : 100);
    data.unit = form.specs.unit ? form.specs.unit : '';
    data.step = Number(form.specs.step ? form.specs.step : 1);
  } else if (form.datatype == 'string') {
    data.maxLength = Number(form.specs.maxLength ? form.specs.maxLength : 1024);
  } else if (form.datatype == 'bool') {
    data.falseText = form.specs.falseText ? form.specs.falseText : '关闭';
    data.trueText = form.specs.trueText ? form.specs.trueText : '打开';
  } else if (form.datatype == 'enum') {
    data.showWay = form.specs.showWay;
    if (form.specs.enumList && form.specs.enumList[0].text != '') {
      data.enumList = form.specs.enumList;
    } else {
      data.showWay = 'select';
      data.enumList = [
        {
          value: '0',
          text: '低'
        },
        {
          value: '1',
          text: '高'
        }
      ];
    }
  } else if (form.datatype == 'array') {
    data.arrayType = form.specs.arrayType;
    data.arrayCount = form.specs.arrayCount ? form.specs.arrayCount : 5;
    if (data.arrayType == 'object') {
      data.params = form.specs.params;
      // 物模型名称作为参数的标识符前缀
      for (let i = 0; i < data.params.length; i++) {
        data.params[i].id = form.identifier + '_' + data.params[i].id;
      }
    }
  } else if (form.datatype == 'object') {
    data.params = form.specs.params;
    // 物模型名称作为参数的标识符前缀
    for (let i = 0; i < data.params.length; i++) {
      data.params[i].id = form.identifier + '_' + data.params[i].id;
    }
  }
  return JSON.stringify(data);
}

/** 数据类型改变 */
function dataTypeChange(val) { }

/** 添加枚举项 */
function addEnumItem() {
  form.specs.enumList.push({
    value: '',
    text: ''
  });
}

/** 删除枚举项 */
function removeEnumItem(index) {
  form.specs.enumList.splice(index, 1);
}

/** 格式化显示数据定义 */
function formatSpecsDisplay(json) {
  let specs = JSON.parse(json);
  if (specs.type === 'integer' || specs.type === 'decimal' || specs.type === 'INT16' || specs.type === 'INT') {
    return (
      '<span style=\'width:50%;display:inline-block;font-size:14px;\'>最大值：<span style="color:#F56C6C;font-size:14px;">' +
      specs.max +
      '</span></span>最小值：<span style="color:#F56C6C;font-size:14px;">' +
      // specs.min +
      // '</span><br /><span style=\'width:50%;display:inline-block;font-size:14px;\'>步长：<span style="color:#F56C6C;font-size:14px;">' +
      specs.step +
      '</span></span>单位：<span style="color:#F56C6C;font-size:14px;">' +
      specs.unit
    );
  } else if (specs.type === 'string') {
    return '最大长度：<span style="color:#F56C6C;font-size:14px;">' + specs.maxLength + '</span>';
  } else if (specs.type === 'array') {
    return '<span style=\'width:50%;display:inline-block;font-size:14px;\'>数组类型：<span style="color:#F56C6C;font-size:14px;">' + specs.arrayType + '</span></span>元素个数：<span style="color:#F56C6C;font-size:14px;">' + specs.arrayCount;
  } else if (specs.type === 'enum') {
    let items = '';
    for (let i = 0; i < specs.enumList.length; i++) {
      items = items + "<span style='width:50%;display:inline-block;font-size:14px;'>" + specs.enumList[i].value + "：<span style='color:#F56C6C;font-size:14px;'>" + specs.enumList[i].text + '</span></span>';
      if (i > 0 && i % 2 != 0) {
        items = items + '<br />';
      }
    }
    return items;
  } else if (specs.type === 'bool') {
    return '<span style=\'width:50%;display:inline-block;font-size:14px;\'>0：<span style="color:#F56C6C;font-size:14px;">' + specs.falseText + '</span></span>1：<span style="color:#F56C6C;font-size:14px;">' + specs.trueText;
  } else if (specs.type === 'object') {
    let items = '';
    for (let i = 0; i < specs.params.length; i++) {
      items = items + "<span style='width:50%;display:inline-block;font-size:14px;'>" + specs.params[i].name + "：<span style='color:#F56C6C;font-size:14px;'>" + specs.params[i].datatype.type + '</span></span>';
      if (i > 0 && i % 2 != 0) {
        items = items + '<br />';
      }
    }
    return items;
  }
}


/** 格式化显示数据定义 */
function getValue_formatSpecsDisplay(json,name) {
  let specs = JSON.parse(json);
  
  if(name=='最大值'){
    return specs.max;
  }

  if(name=='最小值'){
    return specs.step;
  }

  if(name=='单位'){
    return specs.unit;
  }
  
  if(name=='最大长度' && specs.type === 'string'){
    return specs.maxLength;
  }
  
  if(name=='数组类型'){
    return specs.arrayType;
  }
 
  if(name=='元素个数'){
    return specs.arrayCount;
  }

}


/** 添加参数 */
function addParameter() {
  paramData.value = {
    index: -1,
    parameter: {}
  };
}

/** 编辑参数*/
function editParameter(data, index) {
  paramData.value = null;
  paramData.value = {
    index: index,
    parameter: data
  };
}

/** 删除动作 */
function removeParameter(index) {
  form.specs.params.splice(index, 1);
}

/**获取设置的参数对象*/
function getParamData(data) {
  if (data.index == -1) {
    form.specs.params.push(data.parameter);
  } else {
    form.specs.params[data.index] = data.parameter;
    // 解决数组在界面中不更新问题
    form.specs.params = [...form.specs.params];
  }
}

// 在输入最小值改变时触发
function handleEdit(e) {
  let value = e.replace(/[^\-\d]/g, ""); // 只能输入-和数字
  value = value.replace(/\-{2,}/g, "-"); // -只能保留一个
  value = value.replace(/(\d)\-/g, "$1"); // 数字后面不能接-，不能出现类似-11-2,12-，11-23
  value = value.replace(/(-)0+/g, "$1"); // 不能出现-0,-001,-0001类似
  value = value.replace(/(-\d{10})\d*/, '$1') // 最多保留10位整数
  form.specs.min = value;
}

// 在输入最大值改变时触发
function handleEditmax(e) {
  let value = e.replace(/[^\-\d]/g, ""); // 只能输入-和数字
  value = value.replace(/\-{2,}/g, "-"); // -只能保留一个
  value = value.replace(/(\d)\-/g, "$1"); // 数字后面不能接-，不能出现类似-11-2,12-，11-23
  value = value.replace(/(-)0+/g, "$1"); // 不能出现-0,-001,-0001类似
  value = value.replace(/(-\d{10})\d*/, '$1') // 最多保留10位整数
  form.specs.max = value;
}

//数据类型为小数的校验
function hasDecimalPoint() {
  const regex = /^-?\d+\.\d+$/; // 使用正则表达式匹配小数点格式
  isDecimal.value = regex.test(form.specs.min);
  return isDecimal.value;
}

function hasDecimalPointMax() {
  const regex = /^-?\d+\.\d+$/; // 使用正则表达式匹配小数点格式
  isDecimalMax.value = regex.test(form.specs.max);
  return isDecimalMax.value;
}
</script>

<style scoped>
/* 全局字体大小设置，与参考页面保持一致 */
* {
  font-size: 14px !important;
}

.specsColor {
  background-color: #fcfcfc;
}


/* 表格容器 - 隐藏式滚动条 */
.table-container {
  max-height: 60vh; /* 固定容器高度，超出则滚动 */
  overflow-y: auto;
  position: relative;
}

/* 隐藏式滚动条样式 */
.table-container::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
  height: 6px; /* 滚动条高度 */
}

.table-container::-webkit-scrollbar-track {
  background: transparent; /* 轨道透明 */
}

.table-container::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0); /* 滚动条初始透明 */
  border-radius: 3px; /* 圆角 */
  transition: background-color 0.3s ease; /* 过渡效果 */
}

/* 鼠标 hover 时显示滚动条 */
.table-container:hover::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.6); /* 滚动条显示颜色 */
}

/* JSON 容器滚动条同步样式 */
.json-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}


/* 表格相关样式调整 */
::v-deep .el-table {
  font-size: 14px !important;
}

::v-deep .el-table th > .cell {
  font-size: 14px !important;
  color: #4e5969;
  font-weight: 500;
}

::v-deep .el-table td > .cell {
  font-size: 14px !important;
}

/* 按钮样式调整 */
::v-deep .el-button {
  font-size: 14px !important;
}

/* 对话框样式调整 */
::v-deep .el-dialog__title {
  font-size: 16px !important;
  font-weight: 500;
}

::v-deep .el-dialog__body {
  font-size: 14px !important;
}

/* 下拉框样式调整 */
::v-deep .el-select {
  font-size: 14px !important;
}

::v-deep .el-select-dropdown__item {
  font-size: 14px !important;
}

/* 表单相关样式 */
::v-deep .el-form-item__label {
  font-size: 14px !important;
  color: #4e5969;
  font-weight: 500;
}

::v-deep .el-input__inner {
  font-size: 14px !important;
}

/* 标签样式 */
::v-deep .el-tag {
  font-size: 14px !important;
}
</style>