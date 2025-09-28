<template>
  <div class="app-container">
    <el-card v-show="showSearch" style="margin-bottom: 6px">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
               label-width="68px" style="margin-bottom: -20px">
        <el-form-item label="脚本标识" prop="scriptId">
          <el-input v-model="queryParams.scriptId" placeholder="请输入脚本名" clearable
                   @keyup.enter="handleQuery"/>
        </el-form-item>
        <el-form-item label="脚本名" prop="scriptName">
          <el-input v-model="queryParams.scriptName"   @keyup.enter="handleQuery"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['iot:script:add']">新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="padding-bottom: 100px">
      <el-table v-loading="loading" :data="scriptList" @selection-change="handleSelectionChange">
        <el-table-column label="脚本名称" align="center" prop="scriptName"/>
        <el-table-column label="所属产品" align="center" prop="productName"/>
        <el-table-column label="脚本标识" align="center" prop="scriptId" width="180"/>
        <el-table-column label="脚本事件" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="rule_script_event" :value="scope.row.scriptEvent" size="small"/>
          </template>
        </el-table-column>
        <el-table-column label="脚本动作" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="rule_script_action" :value="scope.row.scriptAction"
                      size="small"/>
          </template>
        </el-table-column>
        <el-table-column label="脚本语言" align="center" prop="scriptLanguage"/>
        <el-table-column label="状态" align="center" prop="enable" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.enable == 1" type="success" size="small">启动</el-tag>
            <el-tag v-if="scope.row.enable == 0" type="danger" size="small">暂停</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行顺序" align="center" prop="scriptOrder"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-button size="small" type="text" icon="el-icon-date" @click="handleLog(scope.row.scriptId)"
                       v-hasPermi="['iot:script:query']">日志
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleUpdate(scope.row)"
                       v-hasPermi="['iot:script:query']">查看
            </el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['iot:script:remove']">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                  v-model:limit="queryParams.pageSize" @pagination="getList"/>

      <!-- 添加或修改规则引擎脚本对话框 -->
      <el-dialog :title="title" v-model="open" width="800px" append-to-body :close-on-click-modal="false"
                 :close-on-press-escape="false">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
          <el-row :gutter="50">
            <el-col :span="12">
              <el-form-item label="脚本名称" prop="scriptName">
                <el-input v-model="form.scriptName" placeholder="请输入脚本名"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执行顺序" prop="scriptOrder">
                <el-input-number v-model="form.scriptOrder" placeholder="请输入脚本名" type="number"
                                controls-position="right" style="width: 100%"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="脚本事件" prop="scriptEvent">
                <el-select v-model="form.scriptEvent" placeholder="请选择脚本事件" style="width: 100%">
                  <el-option v-for="dict in rule_script_event" :key="dict.label"
                             :label="dict.label" :value="Number(dict.value)"
                             :disabled="dict.value !== '1' && dict.value !== '2'"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="脚本动作" prop="scriptAction">
                <el-select v-model="form.scriptAction" placeholder="请选择脚本动作" style="width: 100%">
                  <el-option v-for="dict in rule_script_action" :key="dict.label"
                             :label="dict.label" :value="Number(dict.value)"
                             :disabled="dict.value !== '1'"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="脚本状态" prop="enable">
                <el-switch v-model="form.enable" :active-value="1" :inactive-value="0" disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属产品" prop="productName">
                <el-input readonly v-model="form.productName" size="small" placeholder="请选择产品"
                          style="margin-top: 3px">
                  <template #append>
                    <el-button @click="handleSelectProduct()" size="small">选择产品</el-button>
                    
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" style="float: right"></el-col>
          </el-row>
        </el-form>
        
        <div style="padding: 0px 10px" @click="editClick">
          <AceEditor ref="codeEditor" v-model:content="form.scriptData" lang="groovy" codeStyle="chrome"
                     :read-only="false" width="100%" height="450px"></AceEditor>
        </div>
        <div style="padding: 0 10px; margin: 10px 0">
          <el-alert :title="validateMsg" type="success" show-icon v-if="isValidate && validateMsg"
                    :closable="false"></el-alert>
          <el-alert :title="validateMsg" type="error" show-icon v-if="!isValidate && validateMsg"
                    :closable="false"></el-alert>
        </div>
        <div  class="dialog-footer">
          <span style="float: left">
            <el-link style="line-height: 40px; padding-left: 20px" icon="el-icon-question"
                     :underline="false" type="primary" href=""
                     target="_blank">
              脚本使用Groovy引擎，查看教程>>>
            </el-link>
          </span>
          <el-button type="success" @click="handleValidate">验 证</el-button>
          <el-button type="primary" @click="submitForm" v-hasPermi="['iot:script:edit']"
                     v-show="form.scriptId" :disabled="!isValidate">修 改
          </el-button>
          <el-button type="primary" @click="submitForm" v-hasPermi="['iot:script:add']"
                     v-show="!form.scriptId" :disabled="!isValidate">新 增
          </el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </el-card>

    <el-dialog :title="title" v-model="openLog" width="700px" append-to-body :close-on-click-modal="false"
               :close-on-press-escape="false">
      <div
          ref="logContainer"
          v-loading="logLoading"
          element-loading-text="加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          style="border: 1px solid #ccc; border-radius: 4px; height: 450px; background-color: #181818; color: #fff; padding: 10px; line-height: 20px; overflow: auto"
      >
        <pre>{{ logs }}</pre>
      </div>
      <div class="dialog-footer">
        <el-button @click="cancelLog">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 产品列表 -->
    <ProductList ref="productListRef" @productEvent="getSelectProduct"></ProductList>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElForm, ElMessageBox, ElMessage } from 'element-plus'
import { useDict } from '@/utils/dict'
import AceEditor from '@/views/components/editor/editor.vue'
import ProductList from './components/product-list.vue'
import {
  listScript,
  getScript,
  getScriptLog,
  delScript,
  addScript,
  updateScript,
  validateScript
} from '@/api/iot/script'


const { proxy } = getCurrentInstance()
const { rule_script_action, rule_script_event } = proxy.useDict('rule_script_action', 'rule_script_event')


// 表单引用
const formRef = ref()  // 让TypeScript自动推断类型
const queryFormRef = ref()  // 让TypeScript自动推断类型
const productListRef = ref()
const codeEditor = ref()
const logContainer = ref()

// 数据状态
const loading = ref(true)
const logLoading = ref(false)
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const scriptList = ref([])
const title = ref('')
const open = ref(false)
const openLog = ref(false)
const isValidate = ref(false)
const validateMsg = ref('')
const logs = ref('')
const scriptIds = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  scriptPurpose: 1, // 只展示数据流(1=数据流，2=触发器，3=执行动作)
  scriptId: null,
  scriptName: null,
  scriptData: null,
  scriptType: null,
  scriptLanguage: null,
  enable: null,
})

// 表单数据
const form = reactive({
  id: null,
  applicationName: 'senbe', // 后端配置和规则/脚本需要一致
  scriptId: null,
  productId: null,
  productName: '',
  scriptName: null,
  scriptType: 'script',
  remark: null,
  scriptLanguage: 'groovy',
  enable: 1,
  scriptPurpose: 1, // 脚本用途(1=数据流，2=触发器，3=执行动作)
  scriptOrder: 1, // 脚本执行顺序，数字越大越先执行
  scriptAction: 1, // 脚本动作(1=消息重发，2=消息通知，3=Http推送，4=Mqtt桥接，5=数据库存储)
  scriptEvent: 1, // 脚本事件(1=设备上报，2=平台下发，3=设备上线，4=设备离线)
  sceneId: 0,
  scriptData: `import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.core.util.NumberUtil;

// 1. 获取主题和内容(必要)
String topic = msgContext.getTopic();
String payload = msgContext.getPayload();


// 2. 数据转换(自己处理)
msgContext.logger.debug("数据转换处理")
String NewTopic = topic;
String NewPayload = payload;


// 3. 返回新的数据（必要）
msgContext.setTopic(NewTopic);
msgContext.setPayload(NewPayload);`,
})

// 表单验证规则
const rules = reactive({
  scriptId: [{ required: true, message: '脚本标识不能为空', trigger: 'blur' }],
  productName: [{ required: true, message: '所属产品不能为空', trigger: 'blur' }],
  scriptName: [{ required: true, message: '脚本名不能为空', trigger: 'blur' }],
  scriptType: [{ required: true, message: '脚本类型不能为空', trigger: 'change' }],
  scriptLanguage: [{ required: true, message: '脚本语言不能为空', trigger: 'change' }],
  scriptEvent: [{ required: true, message: '', trigger: 'change' }],
  scriptAction: [{ required: true, message: '', trigger: 'change' }],
  scriptOrder: [{ required: true, message: '', trigger: 'change' }],
  enable: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
})

// 自定义验证规则
const checkScriptId = (rule, value, callback) => {
  const regex = /^[a-zA-Z]+[0-9]*[a-zA-Z]*$/ // 定义只包含字母和数字，且字母开头的正则表达式
  if (!regex.test(value)) {
    callback(new Error('脚本标识只能输入字母和数字，且字母开头'))
  } else {
    callback()
  }
}

/** 查询规则引擎脚本列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await listScript(queryParams)
    scriptList.value = response.rows
    total.value = response.total
  } finally {
    loading.value = false
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 取消日志按钮
const cancelLog = () => {
  logs.value = ''
  openLog.value = false
}

// 表单重置
const reset = () => {
  validateMsg.value = ''
  isValidate.value = false
  formRef.value?.resetFields()
  Object.assign(form, {
    id: null,
    applicationName: 'senbe',
    scriptId: null,
    productId: null,
    productName: '',
    scriptName: null,
    scriptType: 'script',
    remark: null,
    scriptLanguage: 'groovy',
    enable: 1,
    scriptPurpose: 1,
    scriptOrder: 1,
    scriptAction: 1,
    scriptEvent: 1,
    sceneId: 0,
    scriptData: `import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.core.util.NumberUtil;

// 1. 获取主题和内容(必要)
String topic = msgContext.getTopic();
String payload = msgContext.getPayload();


// 2. 数据转换(自己处理)
msgContext.logger.debug("数据转换处理")
String NewTopic = topic;
String NewPayload = payload;


// 3. 返回新的数据（必要）
msgContext.setTopic(NewTopic);
msgContext.setPayload(NewPayload);`,
  })
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  scriptIds.value = selection.map(item => item.scriptId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '编辑规则脚本'
}

/** 修改按钮操作 */
const handleUpdate = async (row) => {
  reset()
  const scriptId = row.scriptId || scriptIds.value[0]
  const response = await getScript(scriptId)
  Object.assign(form, response.data)
  open.value = true
  title.value = '修改规则引擎脚本'
}

/** 日志按钮操作 */
const handleLog = async (scriptId) => {
  logLoading.value = true
  try {
    const response = await getScriptLog(scriptId)
    logs.value = response.msg
    form.scriptId = scriptId
    openLog.value = true
    title.value = "脚本日志"
    
    // 滑动到底部
    nextTick(() => {
      logContainer.value.scrollTo({
        top: logContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    })
  } finally {
    logLoading.value = false
  }
}

/** 日志刷新操作 */
const refreshLog = () => {
  handleLog(form.scriptId)
}

/** 选择产品 */
const handleSelectProduct = () => {

    const productComponent = productListRef.value;

  if (!productComponent) {
    console.error('productListRef.value is undefined');
    return;
  }

  console.log('productListRef.value:', productComponent);
  console.log('typeof productComponent.open:', typeof productComponent.open);

  if (typeof productComponent.open === 'function') {
    productComponent.open();
    productComponent.getList();
  } else {
    console.warn('open is not a function');
  }

}

const getSelectProduct = (data) => {
  form.productId = data.productId
  form.productName = data.productName
}

/** 提交按钮 */
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    if (form.scriptId != null) {
      await updateScript(form)
      ElMessage.success('修改成功')
    } else {
      await addScript(form)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error) {
    console.error(error)
  }
}

/** 删除按钮操作 */
const handleDelete = async (row) => {
  const scriptIds = row.scriptId || scriptIds.value
  try {
    await ElMessageBox.confirm(`是否确认删除规则引擎脚本编号为"${scriptIds}"的数据项？`)
    await delScript(scriptIds)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error(error)
  }
}

/** 验证按钮操作 */
const handleValidate = async () => {
  validateMsg.value = ''
  isValidate.value = false
  const response = await validateScript(form)
  isValidate.value = response.data
  validateMsg.value = response.msg
}

/** 编辑器单机事件 */
const editClick = () => {
  validateMsg.value = ''
  isValidate.value = false
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.el-slider__bar {
  height: 18px;
}

.el-slider__runway {
  height: 18px;
  margin: 5px 0;
}

.el-slider__button {
  height: 18px;
  width: 18px;
  border-radius: 10%;
}

.el-slider__button-wrapper {
  top: -9px;
}
</style>