<template>
  <div style="padding: 6px">
    <el-card v-show="showSearch" style="margin-bottom: 5px">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px" style="margin-bottom: -20px">
        <el-form-item label="模型名称" prop="templateName">
          <el-input v-model="queryParams.templateName" placeholder="请输入模型名称" clearable 
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="模型类别" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择模型类别" clearable >
            <el-option v-for="dict in dict.iot_things_type" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search"  @click="handleQuery">搜索</el-button>
          <el-button icon="refresh"  @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" plain icon="plus"  @click="handleAdd"
            v-hasPermi="['iot:template:add']">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="padding-bottom: 100px">
      <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange" border>
        <el-table-column label="模型名称" align="center" prop="templateName" />
        <el-table-column label="标识符" align="center" prop="identifier" />
        <el-table-column label="图表展示" align="center" width="75">
          <template #default="{ row }">
            <dict-tag :options="dict.iot_yes_no" :value="row.isChart" />
          </template>
        </el-table-column>
        <el-table-column label="只读" align="center" width="75">
          <template #default="{ row }">
            <dict-tag :options="dict.iot_yes_no" :value="row.isReadonly" />
          </template>
        </el-table-column>
        <el-table-column label="历史存储" align="center" width="75">
          <template #default="{ row }">
            <dict-tag :options="dict.iot_yes_no" :value="row.isHistory" />
          </template>
        </el-table-column>
        <el-table-column label="系统定义" align="center" width="80">
          <template #default="{ row }">
            <dict-tag :options="dict.iot_yes_no" :value="row.isSys" />
          </template>
        </el-table-column>
        <el-table-column label="物模型类别" align="center" width="100">
          <template #default="{ row }">
            <dict-tag :options="dict.iot_things_type" :value="row.type" />
          </template>
        </el-table-column>
        <el-table-column label="数据类型" align="center" width="80">
          <template #default="{ row }">
            <dict-tag :options="dict.iot_data_type" :value="row.datatype" />
          </template>
        </el-table-column>
        <el-table-column label="数据定义" align="left" header-align="center" min-width="150" class-name="specsColor">
          <template #default="{ row }">
            <div v-html="formatSpecsDisplay(row.specs)"></div>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="modelOrder" width="80" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
          <template #default="{ row }">
            <el-button  type="text" style="padding: 5px" icon="edit"
              @click="handleUpdate(row)" v-hasPermi="['iot:template:query']"
              v-if="row.isSys == '0' ? true : !isTenant">
              修改
            </el-button>
            <el-button  type="text" style="padding: 5px" icon="delete"
              @click="handleDelete(row)" v-hasPermi="['iot:template:remove']"
              v-if="row.isSys == '0' ? true : !isTenant">
              删除
            </el-button>
            <span style="font-size: 10px; color: #999" v-if="row.isSys == '1' && isTenant">系统定义，不能修改</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" 
        v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 添加或修改通用物模型对话框 -->
      <el-dialog v-model="open" :title="title" width="600px" append-to-body :close-on-click-modal="false">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="模型名称" prop="templateName">
            <el-input v-model="form.templateName" placeholder="请输入模型名称，例如：温度" style="width: 385px" />
          </el-form-item>
          <el-form-item label="模型标识" prop="identifier">
            <el-input v-model="form.identifier" placeholder="请输入标识符，例如：temperature" style="width: 385px" />
          </el-form-item>
          <el-form-item label="模型排序" prop="modelOrder">
            <el-input-number controls-position="right" v-model="form.modelOrder" placeholder="请输入排序"
              style="width: 386px" />
          </el-form-item>
          <el-form-item label="模型类别" prop="type">
            <el-radio-group v-model="form.type" @change="typeChange(form.type)">
              <el-radio-button label="1">属性</el-radio-button>
              <el-radio-button label="2">功能</el-radio-button>
              <el-radio-button label="3">事件</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="模型特性" prop="property">
            <el-row>
              <el-col :span="6">
                <el-tooltip effect="dark" content="设备详情中以图表方式展示" placement="top">
                  <el-checkbox name="isChart" label="图表展示" @change="isChartChange" v-show="form.type == 1"
                    v-model="form.isChart" :true-value="1" :false-value="0"></el-checkbox>
                </el-tooltip>
              </el-col>
              <el-col :span="6">
                <el-tooltip effect="dark" content="实时显示监测数据，但是不会存储到数据库" placement="top">
                  <el-checkbox name="isMonitor" label="实时监测" @change="isMonitorChange" v-show="form.type == 1"
                    v-model="form.isMonitor" :true-value="1" :false-value="0"></el-checkbox>
                </el-tooltip>
              </el-col>
              <el-col :span="6">
                <el-tooltip effect="dark" content="设备上报数据，但是平台不能下发指令" placement="top">
                  <el-checkbox name="isReadonly" label="只读数据" @change="isReadonlyChange" :disabled="form.type == 3"
                    v-model="form.isReadonly" :true-value="1" :false-value="0"></el-checkbox>
                </el-tooltip>
              </el-col>
              <el-col :span="6">
                <el-tooltip effect="dark" content="设备上报的数据会存储到数据库作为历史数据" placement="top">
                  <el-checkbox name="isHistory" label="历史存储" v-model="form.isHistory" :true-value="1"
                    :false-value="0"></el-checkbox>
                </el-tooltip>
              </el-col>
              <el-col :span="6">
                <el-tooltip effect="dark" content="设备分享时需要指定是否拥有该权限" placement="top">
                  <el-checkbox name="isSharePerm" label="分享权限" v-model="form.isSharePerm" :true-value="1"
                    :false-value="0"></el-checkbox>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-form-item>

          <el-divider></el-divider>
          <el-form-item label="数据类型" prop="datatype">
            <el-select v-model="form.datatype" placeholder="请选择数据类型" @change="dataTypeChange" style="width: 175px">
              <el-option key="integer" label="整数" value="integer"></el-option>
              <el-option key="decimal" label="小数" value="decimal"></el-option>
              <el-option key="bool" label="布尔" value="bool" :disabled="form.isChart == 1"></el-option>
              <el-option key="enum" label="枚举" value="enum" :disabled="form.isChart == 1"></el-option>
              <el-option key="string" label="字符串" value="string" :disabled="form.isChart == 1"></el-option>
              <el-option key="array" label="数组" value="array" :disabled="form.isChart == 1"></el-option>
              <el-option key="object" label="对象" value="object" :disabled="form.isChart == 1"></el-option>
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
            <el-form-item label="步长" prop="step" v-if="form.datatype == 'integer' || form.datatype == 'decimal'">
              <el-input controls-position="right" v-model="form.specs.step" placeholder="请输入步长，例如：1" type="number"
                style="width: 386px" />
            </el-form-item>
          </div>
          <div v-if="form.datatype == 'bool'">
            <el-form-item label="布尔值">
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
            <el-form-item label="枚举项">
              <el-row v-for="(item, index) in form.specs.enumList" :key="'enum' + index" style="margin-bottom: 10px">
                <el-col :span="9">
                  <el-input v-model="item.value" placeholder="参数值，例如：0" />
                </el-col>
                <el-col :span="11" :offset="1">
                  <el-input v-model="item.text" placeholder="参数描述，例如：中速档位" />
                </el-col>
                <el-col :span="2" :offset="1" v-if="index != 0">
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
                <el-col :span="9">
                  <el-input v-model="form.specs.maxLength" placeholder="例如：1024" type="number" />
                </el-col>
                <el-col :span="14" :offset="1">（字符串的最大长度）</el-col>
              </el-row>
            </el-form-item>
          </div>
          <div v-if="form.datatype == 'array'">
            <el-form-item label="元素个数">
              <el-row>
                <el-col :span="9">
                  <el-input v-model="form.specs.arrayCount" placeholder="例如：5" type="number" />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="数组类型">
              <el-radio-group v-model="form.specs.arrayType">
                <el-radio label="integer">整数</el-radio>
                <el-radio label="decimal">小数</el-radio>
                <el-radio label="string">字符串</el-radio>
                <el-radio label="object">对象</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="对象参数" v-if="form.specs.arrayType == 'object'">
              <div style="background-color: #f8f8f8; border-radius: 5px">
                <el-row style="padding: 0 10px 5px" v-for="(item, index) in form.specs.params" :key="index">
                  <div style="margin-top: 5px" v-if="index == 0"></div>
                  <el-col :span="18">
                    <el-input readonly v-model="item.name"  placeholder="请选择设备" style="margin-top: 3px">
                      <template #prepend>
                        <el-tag  effect="dark" style="margin-left: -21px; height: 26px; line-height: 26px">
                          {{ item.order }}
                        </el-tag>
                        {{ form.identifier + '_' + item.id }}
                      </template>
                      <template #append>
                        <el-button @click="editParameter(item, index)" >编辑</el-button>
                      </template>
                    </el-input>
                  </el-col>
                  <el-col :span="2" :offset="2">
                    <el-button  plain type="danger" style="padding: 5px" icon="delete"
                      @click="removeParameter(index)">删除</el-button>
                  </el-col>
                </el-row>
              </div>
              <div>
                +
                <a style="color: #409eff" @click="addParameter()">添加参数</a>
              </div>
            </el-form-item>
          </div>
          <div v-if="form.datatype == 'object'">
            <el-form-item label="对象参数">
              <div style="background-color: #f8f8f8; border-radius: 5px">
                <el-row style="padding: 0 10px 5px" v-for="(item, index) in form.specs.params" :key="index">
                  <div style="margin-top: 5px" v-if="index == 0"></div>
                  <el-col :span="18">
                    <el-input readonly v-model="item.name"  placeholder="请选择设备" style="margin-top: 3px">
                      <template #prepend>
                        <el-tag  effect="dark" style="margin-left: -21px; height: 26px; line-height: 26px">
                          {{ item.order }}
                        </el-tag>
                        {{ form.identifier + '_' + item.id }}
                      </template>
                      <template #append>
                        <el-button @click="editParameter(item, index)">编辑</el-button>
                      </template>
                    </el-input>
                  </el-col>
                  <el-col :span="2" :offset="2">
                    <el-button  plain type="danger" style="padding: 5px" icon="delete"
                      @click="removeParameter(index)">删除</el-button>
                  </el-col>
                </el-row>
              </div>
              <div>
                +
                <a style="color: #409eff" @click="addParameter()">添加参数</a>
              </div>
            </el-form-item>
          </div>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm" v-hasPermi="['iot:template:edit']" v-show="form.templateId">修 改</el-button>
            <el-button type="primary" @click="submitForm" v-hasPermi="['iot:template:add']" v-show="!form.templateId">新 增</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useDict } from '@/utils/dict';
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate } from '@/api/iot/template';


const dict = useDict(['iot_things_type', 'iot_data_type', 'iot_yes_no']);

// 数据状态
const loading = ref(true);
const showSearch = ref(true);
const open = ref(false);
const title = ref('');
const isTenant = ref(false);
const isDecimal = ref(false);
const isDecimalMax = ref(false);
const queryFormRef = ref();
const formRef = ref();

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  templateName: null,
  type: null,
});

// 表单数据
const form = reactive({
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
  isMonitor: 1,
  isReadonly: 1,
  isSharePerm: 1,
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
        text: '',
      },
    ],
    arrayType: 'integer',
    arrayCount: 5,
    showWay: 'select',
    params: [],
  },
});

// 表格数据
const templateList = ref([]);
const total = ref(0);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);

// 对象类型参数
const paramData = reactive({
  index: -1,
  parameter: {},
});

// 表单验证
const rules = reactive({
  templateName: [
    {
      required: true,
      message: '模型名称不能为空',
      trigger: 'blur',
    },
    {
      min: 1,
      max: 64,
      message: '模型名称不能少于1个字符和超过64字符',
      trigger: 'blur',
    },
  ],
  identifier: [
    {
      required: true,
      message: '标识符，产品下唯一不能为空',
      trigger: 'blur',
    },
    {
      min: 1,
      max: 32,
      message: '标识符不能少于1个字符和超过32字符',
      trigger: 'blur',
    },
  ],
  modelOrder: [
    {
      required: true,
      message: '模型排序不能为空',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: -2147483648,
      max: 2147483647,
      message: '排序不能超过int型的范围值( -2^31——2^31-1)',
      trigger: 'blur',
    },
  ],
  type: [
    {
      required: true,
      message: '模型类别不能为空',
      trigger: 'change',
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

/** 查询通用物模型列表 */
function getList() {
  loading.value = true;
  listTemplate(queryParams).then((response) => {
    templateList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.templateId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加通用物模型';
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const templateId = row.templateId || ids.value;
  getTemplate(templateId).then((response) => {
    const tempForm = response.data;
    open.value = true;
    title.value = '修改通用物模型';
    
    // Json转对象
    tempForm.specs = JSON.parse(tempForm.specs);
    if (!tempForm.specs.enumList) {
      tempForm.specs.showWay = 'select';
      tempForm.specs.enumList = [
        {
          value: '',
          text: '',
        },
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

/** 提交按钮 */
function submitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证对象或对象数组中的参数不能为空
      if (form.datatype == 'object' || (form.datatype == 'array' && form.specs.arrayType == 'object')) {
        if (!form.specs.params || form.specs.params.length == 0) {
          ElMessage.error('对象的参数不能为空');
          return;
        }
      }
      
      // 验证输入的取值范围最大值不能小于最小值
      if (form.datatype == 'integer' || form.datatype == 'decimal') {
        if (parseFloat(form.specs.min) > parseFloat(form.specs.max)) {
          ElMessage.error('请重新输入取值范围,最大值不能比最小值小!');
          return;
        }
      }
      
      if (form.datatype == 'decimal') {
        hasDecimalPoint();
        hasDecimalPointMax();
        if (isDecimal.value === false || isDecimalMax.value === false) {
          ElMessage.error('取值范围必须输入小数,请重新输入!');
          return;
        }
      }
      
      // 验证对象参数标识符不能相同
      if (form.specs.params && form.specs.params.length > 0) {
        const arr = form.specs.params.map((item) => item.id).sort();
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] == arr[i + 1]) {
            ElMessage.error('参数标识 ' + arr[i] + ' 重复');
            return;
          }
        }
      }
      
      // 验证模型特性为图表展示时，数据类型是否为整数或者小数
      if (form.isChart == 1 && form.datatype != 'integer' && form.datatype != 'decimal') {
        ElMessage.error('请重新选择数据类型！');
        return;
      }
      
      // 格式化specs
      const tempForm = JSON.parse(JSON.stringify(form));
      tempForm.specs = formatThingsSpecs();
      
      if (form.type == 2) {
        tempForm.isMonitor = 0;
        tempForm.isChart = 0;
      } else if (form.type == 3) {
        tempForm.isMonitor = 0;
        tempForm.isChart = 0;
      }
      
      if (form.templateId != null) {
        // 修改
        updateTemplate(tempForm).then(() => {
          ElMessage.success('修改成功');
          open.value = false;
          getList();
        });
      } else {
        // 新增
        addTemplate(tempForm).then(() => {
          ElMessage.success('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const templateIds = row.templateId || ids.value;
  ElMessageBox.confirm('是否确认删除通用物模型编号为"' + templateIds + '"的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    return delTemplate(templateIds);
  }).then(() => {
    getList();
    ElMessage.success('删除成功');
  }).catch(() => {});
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
    isMonitor: 1,
    isReadonly: 1,
    isSharePerm: 1,
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
          text: '',
        },
      ],
      arrayType: 'integer',
      arrayCount: 5,
      showWay: 'select',
      params: [],
    },
  });
}

// 类型改变
function typeChange(type) {
  if (type == 1) {
    form.isChart = 1;
    form.isHistory = 1;
    form.isMonitor = 1;
    form.isReadonly = 1;
    form.isSharePerm = 1;
    form.datatype = 'integer';
  } else if (type == 2) {
    form.isChart = 0;
    form.isHistory = 1;
    form.isSharePerm = 1;
    form.isMonitor = 0;
    form.isReadonly = 0;
  } else if (type == 3) {
    form.isChart = 0;
    form.isHistory = 1;
    form.isMonitor = 0;
    form.isReadonly = 1;
    form.isSharePerm = 0;
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

// 数据类型改变
function dataTypeChange(val) {
  form.specs = {};
}

/** 格式化物模型 */
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
    case 'array':
      data.arrayType = form.specs.arrayType;
      data.arrayCount = form.specs.arrayCount ?? 5;
      if (data.arrayType == 'object') {
        data.params = form.specs.params;
        // 物模型名称作为参数的标识符前缀
        for (let i = 0; i < data.params.length; i++) {
          data.params[i].id = form.identifier + '_' + data.params[i].id;
        }
      }
      break;
    case 'object':
      data.params = form.specs.params;
      // 物模型名称作为参数的标识符前缀
      for (let i = 0; i < data.params.length; i++) {
        data.params[i].id = form.identifier + '_' + data.params[i].id;
      }
      break;
  }
  
  return JSON.stringify(data);
}

/** 格式化显示数据定义 */
function formatSpecsDisplay(json) {
  if (!json) return;
  
  const specs = JSON.parse(json);
  let html = '';
  
  switch (specs.type) {
    case 'integer':
    case 'decimal':
      html = `
        <span style='width:50%;display:inline-block;'>最大值：<span style="color:#F56C6C">${specs.max}</span></span>
        最小值：<span style="color:#F56C6C">${specs.min}</span><br />
        <span style='width:50%;display:inline-block;'>步长：<span style="color:#F56C6C">${specs.step}</span></span>
        单位：<span style="color:#F56C6C">${specs.unit || ''}</span>
      `;
      break;
    case 'string':
      html = `最大长度：<span style="color:#F56C6C">${specs.maxLength}</span>`;
      break;
    case 'array':
      html = `
        <span style='width:50%;display:inline-block;'>数组类型：<span style="color:#F56C6C">${specs.arrayType}</span></span>
        元素个数：<span style="color:#F56C6C">${specs.arrayCount}</span>
      `;
      break;
    case 'enum':
      let enumItems = '';
      specs.enumList.forEach((item, i) => {
        enumItems += `<span style='width:50%;display:inline-block;'>${item.value}：<span style='color:#F56C6C'>${item.text}</span></span>`;
        if (i > 0 && i % 2 != 0) {
          enumItems += '<br />';
        }
      });
      html = enumItems;
      break;
    case 'bool':
      html = `
        <span style='width:50%;display:inline-block;'>0：<span style="color:#F56C6C">${specs.falseText}</span></span>
        1：<span style="color:#F56C6C">${specs.trueText}</span>
      `;
      break;
    case 'object':
      let objectItems = '';
      specs.params.forEach((item, i) => {
        objectItems += `<span style='width:50%;display:inline-block;'>${item.name}：<span style='color:#F56C6C'>${item.datatype.type}</span></span>`;
        if (i > 0 && i % 2 != 0) {
          objectItems += '<br />';
        }
      });
      html = objectItems;
      break;
  }
  
  return html;
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

/** 添加参数 */
function addParameter() {
  paramData.index = -1;
  paramData.parameter = {};
}

/** 编辑参数 */
function editParameter(data, index) {
  paramData.index = index;
  paramData.parameter = { ...data };
}

/** 删除参数 */
function removeParameter(index) {
  form.specs.params.splice(index, 1);
}

/** 获取设置的参数对象 */
function getParamData(data) {
  if (data.index == -1) {
    form.specs.params.push(data.parameter);
  } else {
    form.specs.params[data.index] = data.parameter;
  }
}

// 在输入最小值改变时触发
function handleEdit(e) {
  let value = e.replace(/[^\-\d]/g, ""); // 只能输入-和数字
  value = value.replace(/\-{2,}/g, "-"); // -只能保留一个
  value = value.replace(/(\d)\-/g, "$1"); // 数字后面不能接-，不能出现类似-11-2,12-，11-23
  value = value.replace(/(-)0+/g, "$1"); // 不能出现-0,-001,-0001类似
  value = value.replace(/(-\d{10})\d*/, '$1'); // 最多保留10位整数
  form.specs.min = value;
}

// 在输入最大值改变时触发
function handleEditmax(e) {
  let value = e.replace(/[^\-\d]/g, ""); // 只能输入-和数字
  value = value.replace(/\-{2,}/g, "-"); // -只能保留一个
  value = value.replace(/(\d)\-/g, "$1"); // 数字后面不能接-，不能出现类似-11-2,12-，11-23
  value = value.replace(/(-)0+/g, "$1"); // 不能出现-0,-001,-0001类似
  value = value.replace(/(-\d{10})\d*/, '$1'); // 最多保留10位整数
  form.specs.max = value;
}

// 数据类型为小数的校验
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

// 初始化加载
getList();
</script>

<style scoped>
.specsColor {
  background-color: #fcfcfc;
}
</style>