<template>
  <div class="app-container">
 
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Refresh"
          @click="refreshPage"
          v-hasPermi="['IotDeviceModbusRtu:IotDeviceModbusRtu:listTasks']"
        >刷新一次任务状态</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          :type="isAutoRefresh ? 'danger' : 'primary'"
          plain
          :icon="isAutoRefresh ? 'VideoPause' : 'VideoPlay'"
          @click="toggleAutoRefresh"
          v-hasPermi="['IotDeviceModbusRtu:IotDeviceModbusRtu:listTasks']"
        >{{ isAutoRefresh ? '结束定时刷新' : '开始定时刷新' }}</el-button>
      </el-col>
   
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="IotDeviceModbusRtuList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="产品名称" align="center" prop="productName" />
      <el-table-column label="序列号" align="center" prop="serialNumber" />
      <el-table-column label="modbus执行指令" width="180"  align="center" prop="modbusCommand" />
      <el-table-column label="模型标识" align="center" prop="modelIdentifier" />
      <el-table-column label="轮询间隔(ms)" align="center" prop="pollInterval" />
      <el-table-column label="任务状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getTaskStatusType(scope.row)" size="small">
            {{ getTaskStatusText(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="读取结果" align="center" prop="statusRead" /> -->
      <el-table-column label="实时值" align="center" prop="readValue" />
        <el-table-column label="显示值" align="center" prop="displayValue" />
          <el-table-column label="倍率" align="center" prop="displayValueMagnification" />
      <el-table-column label="读取时间" align="center" prop="readTime"  width="100" />

      <el-table-column label="操作" align="center" width="255"  class-name="small-padding fixed-width">
        <template #default="scope">
             <el-button link type="primary" icon="VideoPlay" @click="handleStartTask(scope.row)" v-hasPermi="['IotDeviceModbusRtu:IotDeviceModbusRtu:startTask']" :loading="getTaskLoading(scope.row)">开始任务</el-button>
             <el-button link type="primary" icon="VideoPause" @click="handleStopTask(scope.row)" v-hasPermi="['IotDeviceModbusRtu:IotDeviceModbusRtu:stopTask']" :loading="getStopTaskLoading(scope.row)">结束任务</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改设备modbus维护对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="IotDeviceModbusRtuRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="模型标识:对于模型的参数名称" prop="modelIdentifier">
          <el-input v-model="form.modelIdentifier" placeholder="请输入模型标识:对于模型的参数名称" />
        </el-form-item>
        <el-form-item label="位数:读取第几位" prop="whichNumber">
          <el-input v-model="form.whichNumber" placeholder="请输入位数:读取第几位" />
        </el-form-item>
        <el-form-item label="modbus执行指令" prop="modbusCommand">
          <el-input v-model="form.modbusCommand" placeholder="请输入modbus执行指令" />
        </el-form-item>
        <el-form-item label="波特率" prop="baudRate">
          <el-input v-model="form.baudRate" placeholder="请输入波特率" />
        </el-form-item>
        <el-form-item label="数据位" prop="dataBits">
          <el-input v-model="form.dataBits" placeholder="请输入数据位" />
        </el-form-item>
        <el-form-item label="停止位" prop="stopBits">
          <el-input v-model="form.stopBits" placeholder="请输入停止位" />
        </el-form-item>
        <el-form-item label="校验位" prop="parity">
          <el-input v-model="form.parity" placeholder="请输入校验位" />
        </el-form-item>
        <el-form-item label="字节序" prop="byteOrder">
          <el-input v-model="form.byteOrder" placeholder="请输入字节序" />
        </el-form-item>
        <el-form-item label="超时时间" prop="timeout">
          <el-input v-model="form.timeout" placeholder="请输入超时时间" />
        </el-form-item>
        <el-form-item label="轮询间隔" prop="pollInterval">
          <el-input v-model="form.pollInterval" placeholder="请输入轮询间隔" />
        </el-form-item>
        <el-form-item label="串口名称" prop="portName">
          <el-input v-model="form.portName" placeholder="请输入串口名称" />
        </el-form-item>
        <el-form-item label="重试次数" prop="retryCount">
          <el-input v-model="form.retryCount" placeholder="请输入重试次数" />
        </el-form-item>
        <el-form-item label="服务器地址" prop="mqttAddress">
          <el-input v-model="form.mqttAddress" placeholder="请输入服务器地址" />
        </el-form-item>
        <el-form-item label="端口" prop="mqttPort">
          <el-input v-model="form.mqttPort" placeholder="请输入端口" />
        </el-form-item>
        <el-form-item label="ClientID" prop="mqttClientId">
          <el-input v-model="form.mqttClientId" placeholder="请输入ClientID" />
        </el-form-item>
        <el-form-item label="账户" prop="mqttUser">
          <el-input v-model="form.mqttUser" placeholder="请输入账户" />
        </el-form-item>
        <el-form-item label="密码" prop="mqttPassword">
          <el-input v-model="form.mqttPassword" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="Path" prop="mqttPath">
          <el-input v-model="form.mqttPath" placeholder="请输入Path" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="设备编号(序列号)" prop="serialNumber">
          <el-input v-model="form.serialNumber" placeholder="请输入设备编号(序列号)" />
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item label="租户名称" prop="tenantName">
          <el-input v-model="form.tenantName" placeholder="请输入租户名称" />
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

<script setup name="IotDeviceModbusRtu">
import { listIotDeviceModbusRtu, getIotDeviceModbusRtu, delIotDeviceModbusRtu, addIotDeviceModbusRtu, updateIotDeviceModbusRtu } from "@/api/iot/IotDeviceModbusRtu"
import { startModbusTask, stopModbusTask, listModbusTasks, runModbusTask } from "@/api/iot/modbusTask"

const { proxy } = getCurrentInstance()

const IotDeviceModbusRtuList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const runningTasks = ref(new Set()) // 存储正在运行的任务名称
const taskLoadingMap = ref(new Map()) // 存储任务loading状态
const stopTaskLoadingMap = ref(new Map()) // 存储停止任务loading状态
const timerId = ref(null) // 用于存储定时器ID
const isAutoRefresh = ref(false) // 自动刷新状态

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    modelIdentifier: null,
    whichNumber: null,
    modbusCommand: null,
    baudRate: null,
    dataBits: null,
    stopBits: null,
    parity: null,
    byteOrder: null,
    timeout: null,
    pollInterval: null,
    portName: null,
    retryCount: null,
    mqttAddress: null,
    mqttPort: null,
    mqttClientId: null,
    mqttUser: null,
    mqttPassword: null,
    mqttPath: null,
    productName: null,
    serialNumber: null,
    tenantId: null,
    tenantName: null
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询设备modbus维护列表 */
function getList() {
  loading.value = true
  listIotDeviceModbusRtu(queryParams.value).then(response => {
    IotDeviceModbusRtuList.value = response.rows
    total.value = response.total
    loading.value = false
    // 刷新任务状态
    refreshTaskStatus()
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    modelIdentifier: null,
    whichNumber: null,
    modbusCommand: null,
    baudRate: null,
    dataBits: null,
    stopBits: null,
    parity: null,
    byteOrder: null,
    timeout: null,
    pollInterval: null,
    portName: null,
    retryCount: null,
    mqttAddress: null,
    mqttPort: null,
    mqttClientId: null,
    mqttUser: null,
    mqttPassword: null,
    mqttPath: null,
    productName: null,
    serialNumber: null,
    tenantId: null,
    tenantName: null
  }
  proxy.resetForm("IotDeviceModbusRtuRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加设备modbus维护"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getIotDeviceModbusRtu(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改设备modbus维护"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["IotDeviceModbusRtuRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateIotDeviceModbusRtu(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addIotDeviceModbusRtu(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除设备modbus维护编号为"' + _ids + '"的数据项？').then(function() {
    return delIotDeviceModbusRtu(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 开始任务操作 */
function handleStartTask(row) {
  // 生成任务名称：产品名称+序列号+modbus执行指令（去掉空格和特殊字符）
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  
  // 验证必要字段
  if (!row.productName || !row.serialNumber || !row.modbusCommand) {
    proxy.$modal.msgError("产品名称、序列号和modbus执行指令不能为空")
    return
  }
  
  // 验证轮询间隔
  if (!row.pollInterval || row.pollInterval <= 0) {
    proxy.$modal.msgError("轮询间隔必须大于0")
    return
  }
  
  // 检查任务是否已经在运行
  if (runningTasks.value.has(taskName)) {
    proxy.$modal.msgInfo("任务已在运行中，无需重复启动")
    return
  }
  
  proxy.$modal.confirm(`是否确认开始任务"${taskName}"？`).then(function() {
    // 设置loading状态
    taskLoadingMap.value.set(taskName, true)
    
    // 将毫秒转换为秒，并生成cron表达式
    const pollIntervalSeconds = Math.max(1, Math.floor(row.pollInterval / 1000))
    const cronExpression = `0/${pollIntervalSeconds} * * * * ?`
    
    const taskData = {
      deviceId: row.id, // 添加设备ID
      taskName: taskName,
      taskType: "MODBUS_RTU",
      cronExpression: cronExpression,
      portName: row.portName || "COM5",
      command: row.modbusCommand,
      baudRate: row.baudRate || 9600,
      dataBits: row.dataBits || 8,
      stopBits: row.stopBits || 1,
      parity: row.parity || 0,
      startAddress: row.whichNumber || 0,
      quantity: 1
    }
    
    return startModbusTask(taskData)
  }).then(() => {
    // 添加到运行任务集合中
    runningTasks.value.add(taskName)
    proxy.$modal.msgSuccess("任务启动成功，已立即执行一次")
    // 刷新任务状态，确保显示最新状态
    refreshTaskStatus()
  }).catch((error) => {
    console.error("启动任务失败:", error)
    proxy.$modal.msgError("任务启动失败，请检查配置")
  }).finally(() => {
    // 清除loading状态
    taskLoadingMap.value.delete(taskName)
  })
}

/** 结束任务操作 */
function handleStopTask(row) {
  // 生成任务名称：产品名称+序列号+modbus执行指令（去掉空格和特殊字符）
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  
  // 验证必要字段
  if (!row.productName || !row.serialNumber || !row.modbusCommand) {
    proxy.$modal.msgError("产品名称、序列号和modbus执行指令不能为空")
    return
  }
  
  proxy.$modal.confirm(`是否确认停止任务"${taskName}"？`).then(function() {
    // 设置loading状态
    stopTaskLoadingMap.value.set(taskName, true)
    
    return stopModbusTask({ taskName: taskName })
  }).then(() => {
    // 从运行任务集合中移除
    runningTasks.value.delete(taskName)
    proxy.$modal.msgSuccess("任务已停止")
  }).catch((error) => {
    console.error("停止任务失败:", error)
    proxy.$modal.msgError("任务停止失败，请检查任务状态")
  }).finally(() => {
    // 清除loading状态
    stopTaskLoadingMap.value.delete(taskName)
  })
}

/** 获取任务状态类型 */
function getTaskStatusType(row) {
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  return runningTasks.value.has(taskName) ? 'success' : 'info'
}

/** 获取任务状态文本 */
function getTaskStatusText(row) {
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  return runningTasks.value.has(taskName) ? '运行中' : '未运行'
}

/** 刷新任务状态 */
function refreshTaskStatus() {
  // 这里可以调用后端接口获取所有运行中的任务
  // 暂时使用本地状态管理
  listModbusTasks().then(response => {
    if (response.code === 200) {
      const tasks = response.data || []
      runningTasks.value.clear()
      tasks.forEach(task => {
        if (task.status === '0') { // 0表示正常状态（运行中）
          runningTasks.value.add(task.jobName)
        }
      })
    }
  }).catch(error => {
    console.error("获取任务状态失败:", error)
  })
}

/** 刷新整个页面 */
function refreshPage() {
  // 重新获取列表数据和任务状态
  getList()
  refreshTaskStatus()
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('IotDeviceModbusRtu/IotDeviceModbusRtu/export', {
    ...queryParams.value
  }, `IotDeviceModbusRtu_${new Date().getTime()}.xlsx`)
}

/** 执行一次操作 */
function handleExecuteOnce(row) {
  // 生成任务名称：产品名称+序列号+modbus执行指令（去掉空格和特殊字符）
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  
  // 验证必要字段
  if (!row.productName || !row.serialNumber || !row.modbusCommand) {
    proxy.$modal.msgError("产品名称、序列号和modbus执行指令不能为空")
    return
  }
  
  proxy.$modal.confirm(`是否确认执行一次任务"${taskName}"？`).then(function() {
    const taskData = {
      taskName: taskName
    }
    
    return runModbusTask(taskData)
  }).then(() => {
    proxy.$modal.msgSuccess("任务执行成功")
  }).catch((error) => {
    console.error("执行一次任务失败:", error)
    proxy.$modal.msgError("任务执行失败，请检查配置")
  })
}

/** 生成任务名称（去掉空格和特殊字符） */
function generateTaskName(productName, serialNumber, modbusCommand) {
  // 去掉空格、换行符等特殊字符，只保留字母、数字、下划线、连字符
  const cleanProductName = productName
  const cleanSerialNumber = (serialNumber || '').replace(/[^\w\-]/g, '')
  const cleanModbusCommand = (modbusCommand || '').replace(/[^\w\-]/g, '')
  
  return `${cleanProductName}_${cleanSerialNumber}_${cleanModbusCommand}`
}

/** 获取开始任务loading状态 */
function getTaskLoading(row) {
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  return taskLoadingMap.value.get(taskName) || false
}

/** 获取停止任务loading状态 */
function getStopTaskLoading(row) {
  const taskName = generateTaskName(row.productName, row.serialNumber, row.modbusCommand)
  return stopTaskLoadingMap.value.get(taskName) || false
}

// 切换自动刷新状态
function toggleAutoRefresh() {
  if (isAutoRefresh.value) {
    stopAutoRefresh()
  } else {
    startAutoRefresh()
  }
}

// 启动定时刷新
function startAutoRefresh() {
  if (timerId.value) {
    clearInterval(timerId.value)
  }
  timerId.value = setInterval(() => {
    refreshPage()
  }, 1000) // 每秒刷新一次
  isAutoRefresh.value = true
  proxy.$modal.msgSuccess("已开启任务状态自动刷新")
}

// 停止定时刷新
function stopAutoRefresh() {
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
  isAutoRefresh.value = false
  //proxy.$modal.msgSuccess("已停止任务状态自动刷新")
}

onUnmounted(() => {
  stopAutoRefresh()
})

getList()
refreshTaskStatus()
</script>
