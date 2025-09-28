<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="协议编码" prop="protocolCode">
          <el-input
            v-model="queryParams.protocolCode"
            placeholder="请输入协议编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="协议名称" prop="protocolName">
          <el-input
            v-model="queryParams.protocolName"
            placeholder="请输入协议名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
 
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <!-- <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['protocol:protocol:export']"
        >导出</el-button> -->
        </el-form-item>
      </el-form>
  
  
      <el-table v-loading="loading" :data="protocolList" >
        <el-table-column label="协议编码" align="center" prop="protocolCode" />
        <el-table-column label="协议名称" align="center" prop="protocolName" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['protocol:protocol:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['protocol:protocol:remove']">删除</el-button>
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
  
          <!-- 添加或修改协议对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
        <el-form ref="protocolRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="协议编码" prop="protocolCode">
            <el-input v-model="form.protocolCode" placeholder="请输入协议编码" />
          </el-form-item>
          <el-form-item label="协议名称" prop="protocolName">
            <el-input v-model="form.protocolName" placeholder="请输入协议名称" />
          </el-form-item>
          <el-form-item label="数据格式" prop="dataFormat">
            <el-input v-model="form.dataFormat" type="textarea" placeholder="请输入内容" />
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
  
  <script setup name="Protocol">
  import { listProtocol, getProtocol, delProtocol, addProtocol, updateProtocol } from '@/api/iot/protocol';
  const { proxy } = getCurrentInstance()
  
  const protocolList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref("")
  
  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      protocolCode: null,
      protocolName: null,
      protocolFileUrl: null,
      protocolType: null,
      jarSign: null,
      protocolStatus: null,
      dataFormat: null
    },
    rules: {
      protocolCode: [
        { required: true, message: "协议编码不能为空", trigger: "blur" }
      ],
      protocolName: [
        { required: true, message: "协议名称不能为空", trigger: "blur" }
      ],
      protocolFileUrl: [
        { required: true, message: "协议jar包,js包，c程序上传地址不能为空", trigger: "blur" }
      ],
      protocolType: [
        { required: true, message: "协议类型 0:未知 1:jar，2.js,3.c不能为空", trigger: "change" }
      ],
      jarSign: [
        { required: true, message: "协议文件摘要(文件的md5)不能为空", trigger: "blur" }
      ],
      createTime: [
        { required: true, message: "创建时间不能为空", trigger: "blur" }
      ],
      updateTime: [
        { required: true, message: "更新时间不能为空", trigger: "blur" }
      ],
      protocolStatus: [
        { required: true, message: "0:草稿 1:启用 2:停用不能为空", trigger: "change" }
      ],
      delFlag: [
        { required: true, message: "0:正常 1:删除不能为空", trigger: "blur" }
      ],
    }
  })
  
  const { queryParams, form, rules } = toRefs(data)
  
  /** 查询协议列表 */
  function getList() {
    loading.value = true
    listProtocol(queryParams.value).then(response => {
      protocolList.value = response.rows
      total.value = response.total
      loading.value = false
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
      protocolCode: null,
      protocolName: null,
      protocolFileUrl: null,
      protocolType: null,
      jarSign: null,
      createTime: null,
      updateTime: null,
      protocolStatus: null,
      delFlag: null,
      dataFormat: null
    }
    proxy.resetForm("protocolRef")
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
    title.value = "添加协议"
  }
  
  /** 修改按钮操作 */
  function handleUpdate(row) {
    reset()
    const _id = row.id || ids.value
    getProtocol(_id).then(response => {
      form.value = response.data
      open.value = true
      title.value = "修改协议"
    })
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["protocolRef"].validate(valid => {
      if (valid) {
        if (form.value.id != null) {
          updateProtocol(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            getList()
          })
        } else {
          addProtocol(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除协议编号为"' + _ids + '"的数据项？').then(function() {
      return delProtocol(_ids)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {})
  }
  
  /** 导出按钮操作 */
  function handleExport() {
    proxy.download('protocol/protocol/export', {
      ...queryParams.value
    }, `protocol_${new Date().getTime()}.xlsx`)
  }
  
  getList()
  </script>
  