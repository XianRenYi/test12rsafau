<template>
  <div style="padding: 6px">
    <el-card style="margin-bottom: 6px">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px" style="margin-bottom: -20px">
      
        <el-form-item label="产品名称" prop="productName">
          <el-select
            style="width: 170px"
            v-model="queryParams.productName"
            :placeholder="'请选择产品名称'"
            filterable
            clearable
            @change="handleProductNameChange"
          >
            <el-option
              v-for="(item, index) in productNameList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品型号" prop="productId">
          <el-select
            style="width: 170px"
            v-model="queryParams.productId"
            :placeholder="'请选择产品型号'"
            filterable
            clearable
            @change="handleProductIdChange"
          >
            <el-option
              v-for="(item, index) in filteredProductIdList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品分类" prop="categoryName">
       
          <el-select
            style="width: 170px"
            v-model="queryParams.categoryNames"
            :placeholder="'请选择产品分类'"
            filterable
            multiple
            collapse-tags
            @change="handleCategoryChange"
          >
            <el-option
              v-for="(item, index) in categoryList"
              :key="index"
              :label="item.categoryName"
              :value="item.categoryId"
            ></el-option>
          </el-select>
        </el-form-item>
  
        <el-form-item label="发布状态" prop="status">
          <el-select
            v-model="queryParams.statuss"
            placeholder="请选择发布状态"
            style="width: 150px"
              filterable
                  multiple
                  collapse-tags
          >
            <el-option
              v-for="dict in iot_product_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
  

     
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
     
          <el-button type="primary"    plain icon="Plus"  size="mini"   @click="handleAddProduct(0)" v-hasPermi="['iot:product:add']">新增</el-button>

            <el-button type="primary" plain icon="grid"  @click="handleChangeShowType" v-hasPermi="['iot:product:add']">切换</el-button>
    
     
     
        </el-form-item>
      </el-form>
    </el-card>


    
        <!-- List View -->
        <el-card style="width: 100%;padding-bottom: 100px"   v-if="showType === 'list'">
          <el-table v-loading="loading" :data="productList" border>
            <el-table-column label="产品名称" align="center" prop="productName" min-width="120" />
            <el-table-column label="产品型号" align="center" prop="productId" min-width="120" />
          <el-table-column label="产品分类" align="center" prop="categoryId" >
              <template #default="{row}">
                <!-- 使用 categoryName 字段直接显示分类名称 -->
                <span>{{ row.categoryName }}</span>
              </template>
            </el-table-column>
            
            <!-- <el-table-column label="联网方式" align="center" prop="networkMethod" min-width="120">
              <template #default="{row}">
                <dict-tag :options="iot_network_method" :value="row.networkMethod" />
              </template>
            </el-table-column> -->
        <el-table-column label="发布状态" align="center" prop="status" width="80">
              <template #default="{row}">
                <dict-tag :options="iot_product_status" :value="row.status"  />
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime">
              
              <template #default="{row}">
                <span>{{ row.createTime }}</span>
              </template>
            </el-table-column>
     
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
              <template  #default="{row}" >
                <!-- <el-button link type="primary" icon="odometer"   v-if="row.status == 1"   @click="handleRunDevice(row)" v-hasPermi="['system:category:remove']">详情</el-button>
                <el-button link type="primary" icon="delete"     v-if="row.status == 1" @click="handleDelete(row)" v-hasPermi="['system:category:remove']">删除</el-button>
      -->
     
              <el-button class="el-button--mini"
                    @click="handleEditProduct(row)"
                     v-if="row.status == 1"
                    v-hasPermi="['iot:product:query']"
                    >编辑</el-button>
            
             <el-button class="el-button--mini"
                    @click="handleEditProduct(row)"
                     v-if="row.status == 2"
                    v-hasPermi="['iot:product:query']"
                    >详情</el-button>
                      
                    <el-button  class="el-button--mini"
                    @click="handleDelete(row)"
                    v-hasPermi="['iot:product:remove']"
                    v-if="row.status == 1"
                    >删除</el-button>
          
          <el-button    v-if="row.status == 1"  @click="handleStatusChange(2,row.id,row.productId,row.deviceType)"  v-hasPermi="['iot:product:add']"   class="el-button--mini">
          发布模型
          </el-button>
     
          <el-button    v-if="row.status == 2"  @click="handleStatusChange(1,row.id,row.productId,row.deviceType)"  v-hasPermi="['iot:product:edit']"  class="el-button--mini">
          取消发布
          </el-button>
    
    
    
    
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :pageSizes="[12, 24, 36, 60]" @pagination="getList" />
        </el-card>
    



    <el-card style="width: 100%;padding-bottom: 100px"   v-if="showType === 'card'">
      <el-row :gutter="20" v-loading="loading"  style="min-height: 80vh; ">
        <el-col
          :xs="24"
          :sm="12"
          :md="12"
          :lg="8"
          :xl="6"
          v-for="(item, index) in productList"
          :key="index"
          style="margin-bottom: 30px; text-align: center"
        >
          <el-card :body-style="{ padding: '20px' }" shadow="always" class="card-item">
            <el-row type="flex" :gutter="10" justify="space-between">
              <el-col :span="20" style="text-align: left">
                <el-link
                  type=""
                  :underline="false"
                  @click="handleEditProduct(item)"
                  style="
                    font-weight: bold;
                    font-size: 16px;
                    line-height: 32px;
                    white-space: nowrap;
                  "
                >
                  <svg-icon icon-class="product" />&nbsp;   {{ item.productName }}
                  <el-tag
                    type="info"
                    size="mini"
                    style="margin-left: 5px; font-weight: 200"
                    v-if="item.isSys == 1"
                    >系统</el-tag
                  >
                </el-link>
              </el-col>
              <el-col :span="4">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="取消发布"
                  placement="top-start"
                  v-if="item.status == 2"
                >
                  <el-button
                    type="success"
                    size="mini"
                    style="padding: 5px"
                    @click="handleStatusChange(1,item.id,item.productId,item.deviceType)"
                    >已发布</el-button
                  >
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="现在发布"
                  placement="top-start"
                  v-if="item.status == 1"
                >
                  <el-button
                    type="info"
                    size="mini"
                    style="padding: 5px"
                    @click="handleStatusChange(2,item.id,item.productId,item.deviceType)"
                    >未发布</el-button
                  >
                </el-tooltip>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="14">
                <el-descriptions
                  :column="1"
                  
                  style="margin-top: 10px; white-space: nowrap"
                >
                  <el-descriptions-item label="产品分类">
                    <label>{{item.categoryName}}</label>
                  </el-descriptions-item>
                  <el-descriptions-item label="产品型号">
                    <!-- <el-link type="primary" :underline="false">{{item.deviceType}}</el-link> -->
                    <!-- <dict-tag :options="iot_device_type" :value="item.deviceType" /> -->
                    <label>{{item.productId}}</label>
                  </el-descriptions-item>
                
                  <el-descriptions-item label="联网方式">
                       <!-- <label>   <dict-tag :options="iot_network_method" :value="item.networkMethod" /> </label> -->
                      <label>  4G </label>
                  </el-descriptions-item>
            
                </el-descriptions>
              </el-col>
              <el-col :span="10">
                <div style="margin-top: 10px">
                  <el-image
                    style="width: 100%; height: 100px; border-radius: 10px"
                    lazy
                    :preview-src-list="[baseUrl + item.imgUrl]"
                    :src="baseUrl + item.imgUrl"
                    fit="cover"
                    v-if="item.imgUrl != null && item.imgUrl != ''"
                  ></el-image>
                  <el-image
                    style="width: 100%; height: 100px; border-radius: 10px"
                    :preview-src-list="[gatewayImg]"
                    :src="gatewayImg"
                    fit="cover"
                    v-else-if="item.deviceType == 2"
                  ></el-image>
                  <el-image
                    style="width: 100%; height: 100px; border-radius: 10px"
                    :preview-src-list="[videoImg]"
                    :src="videoImg"
                    fit="cover"
                    v-else-if="item.deviceType == 3"
                  ></el-image>
                  <el-image
                    style="width: 100%; height: 100px; border-radius: 10px"
                    :preview-src-list="[productImg]"
                    :src="productImg"
                    fit="cover"
                    v-else
                  ></el-image>
                </div>
              </el-col>
            </el-row>

             <el-divider />
<!--              
                 <span>Rain</span>
    <el-divider direction="vertical" />
    <span>Home</span> -->

  <div class="mb-4" style="margin-bottom: -16px;
    margin-top: -20px;">
             <el-button class="el-button--mini"
                @click="handleEditProduct(item)"
                 v-if="item.status == 1"
                v-hasPermi="['iot:product:query']"
                >编辑</el-button>
        
         <el-button class="el-button--mini"
                @click="handleEditProduct(item)"
                 v-if="item.status == 2"
                v-hasPermi="['iot:product:query']"
                >详情</el-button>
                  
                <el-button  class="el-button--mini"
                @click="handleDelete(item)"
                v-hasPermi="['iot:product:remove']"
                v-if="item.status == 1"
                >删除</el-button>
      
      <el-button    v-if="item.status == 1"  @click="handleStatusChange(2,item.id,item.productId,item.deviceType)"  v-hasPermi="['iot:product:add']"   class="el-button--mini">
      发布产品
      </el-button>
 
      <el-button    v-if="item.status == 2"  @click="handleStatusChange(1,item.id,item.productId,item.deviceType)"  v-hasPermi="['iot:product:edit']"  class="el-button--mini">
      取消发布
      </el-button>




         
         
  </div>


        
          </el-card>
        </el-col>
      </el-row>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
      <el-empty description="暂无数据，请添加产品" v-if="total == 0"></el-empty>
    </el-card>



    <!-- 添加或修改产品分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入产品分类名称" />
        </el-form-item>
        <el-form-item label="系统通用" prop="isSys">
          <el-select v-model="form.isSys" placeholder="请选择是否系统通用">
            <el-option
              v-for="dict in iot_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入显示顺序" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup>
const { proxy } = getCurrentInstance();
const {
  iot_yes_no,
  iot_product_status,
  iot_device_type,
  iot_network_method,
  iot_vertificate_method,
  iot_device_chip,
} = proxy.useDict(
  "iot_yes_no",
  "iot_product_status",
  "iot_device_type",
  "iot_network_method",
  "iot_vertificate_method",
  "iot_device_chip"
);

import { listProduct,  delProduct,  changeProductStatus,  deviceCount } from "@/api/iot/product";
import {listShortCategory, listCategory, getCategory, delCategory, addCategory, updateCategory } from '@/api/iot/category'

import { checkPermi } from "@/utils/permission";
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus';
const router = useRouter()

import gatewayImg from "@/assets/images/gateway.png";
import videoImg from "@/assets/images/video.png";
import productImg from "@/assets/images/product.png";
const categoryShortList = ref([]);
const showType = ref('list');
const productList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const data = reactive({
  form: {},
  rules: {},
});

const {  form, rules } = toRefs(data);
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 12,
  categoryNames: null,
  deviceName: null,
  productId: null,
  groupId: null,
  productName: null,
  userId: null,
  userName: null,
  tenantId: null,
  tenantName: null,
  serialNumber: null,
  status: null,
  statuss: null,
  networkAddress: null,
  activeTime: null,
});

// 新增：支持下拉框的数据变量
const productNameList = ref([]);
const filteredProductIdList = ref([]);
const categoryList = ref([]);
const devProductList = ref([]); // 存储完整的产品列表
/** 查询产品列表 - 与device/index.vue保持一致 */
function getList() {
  loading.value = true;
  
  // 构建查询参数，移除空值
  const params = { ...queryParams };
  if (!params.productName) delete params.productName;
  if (!params.productId) delete params.productId;
  if (!params.categoryNames) delete params.categoryNames;
  
  listProduct(params).then((response) => {
    productList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    
    // 更新产品型号列表 - 与device/index.vue保持一致
    if (!queryParams.productName) {
      const uniqueProductIds = [...new Set(response.rows.map(item => item.productId))];
      filteredProductIdList.value = uniqueProductIds;
    }
  });
}

/** 获取产品分类列表 - 与device/index.vue保持一致 */
function getCategoryList() {
  const params = {
    pageNum: 1,
    pageSize: 9999,
  };
  
  listCategory(params).then((response) => {
    if (response.code === 200) {
      categoryList.value = response.rows;
    } else {
      console.error('获取产品分类失败:', response.msg);
    }
  }).catch((error) => {
    console.error('获取产品分类出错:', error);
  });
}

// 新增：获取产品名称列表 - 与device/index.vue保持一致
const getProductNameList = async () => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 9999,
    };
    
    return new Promise((resolve) => {
      listProduct(params).then((data) => {
        if (data.code === 200) {
          // 保存完整的产品列表
          devProductList.value = data.rows;
          
          // 提取唯一的产品名称
          const uniqueProductNames = [...new Set(data.rows.map(item => item.productName))];
          productNameList.value = uniqueProductNames;
          
          // 初始化过滤后的产品型号列表 - 让产品型号默认也可以直接选择
          const uniqueProductIds = [...new Set(data.rows.map(item => item.productId))];
          filteredProductIdList.value = uniqueProductIds;
          
          resolve(); // 解析Promise
        } else {
          resolve(); // 即使失败也要解析Promise
        }
      }).catch((error) => {
        console.error("获取产品列表失败", error);
        resolve(); // 即使出错也要解析Promise
      });
    });
  } catch (error) {
    console.error("获取产品列表失败", error);
    return Promise.resolve(); // 返回已解析的Promise
  }
};

// 新增：产品名称变化处理 - 与device/index.vue保持一致
const handleProductNameChange = (val) => {
  queryParams.productId = null;
  if (val) {
    const filteredIds = [...new Set(
      devProductList.value
        .filter(item => item.productName === val)
        .map(item => item.productId)
    )];
    filteredProductIdList.value = filteredIds;
  } else {
    // 当产品名称取消选择时，显示所有可用的产品型号
    const uniqueProductIds = [...new Set(devProductList.value.map(item => item.productId))];
    filteredProductIdList.value = uniqueProductIds;
  }
};

// 新增：产品型号变化处理 - 与device/index.vue保持一致
const handleProductIdChange = (val) => {
  if (val) {
    // 根据选择的产品型号过滤数据
    queryParams.productId = val;
  } else {
    queryParams.productId = null;
  }
};

// 新增：产品分类变化处理 - 与device/index.vue保持一致
function handleCategoryChange(val) {
  if (val) {
    // 根据选择的产品分类过滤数据
    queryParams.categoryNames = val;
  } else {
    queryParams.categoryNames = null;
  }
}

/**同步获取产品下的设备数量 - 与device/index.vue保持一致**/
function getDeviceCountByProductId(productId) {
  return new Promise((resolve, reject) => {
    deviceCount(productId)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
     /** 修改按钮操作 - 与device/index.vue保持一致 */
    function    handleEditProduct(row) {
            let id = 0;
            if (row != 0) {
              id = row.id || this.ids
            }
    router.push({
    path: '/iot/productUpdate',
    query: {
      id: id,
    }
  });
        }

             /** 新增按钮操作 - 与device/index.vue保持一致 */
    function    handleAddProduct(row) {
            let productId = 0;
            if (row != 0) {
                productId = row.id || this.ids
            }
    router.push({
    path: '/iot/productUpdate',
    query: {
  
    }
  });
        }

/** 更新产品状态 - 与device/index.vue保持一致 */
async function changeProductStatusW(productId, status, deviceType) {
  let message = "确定取消发布？";
  if (status == 2) {
    // 发布
    let hasPermission = checkPermi(["iot:product:add"]);
    if (!hasPermission) {
      this.$modal.alertError("没有操作权限");
      return;
    }
    message = "产品发布后，可以创建对应的设备";
  } else if (status == 1) {
    // 取消发布
    let hasPermission = checkPermi(["iot:product:edit"]);
    if (!hasPermission) {
      this.$modal.alertError("没有操作权限");
      return;
    }
    let result = await this.getDeviceCountByProductId(productId);
    if (result.data > 0) {
      message =
        "重要提示：产品下已有 " +
        result.data +
        " 个设备，取消发布可以修改产品信息和模型，重新发布后对应设备状态将会被重置！";
    }
  }
  this.$confirm(message, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      let data = {};
      data.productId = productId;
      data.status = status;
      data.deviceType = deviceType;
      changeProductStatus(data)
        .then((response) => {
          this.getList();
          this.$modal.alertSuccess(response.msg);
        })
        .catch(() => {});
    })
    .catch(() => {});
}
/** 查看设备按钮操作 */
function handleViewDevice(productId) {
  router.push({
    path: "/iot/indexByProductId",
    query: {
      t: Date.now(),
      productId: productId,
    },
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置 - 与device/index.vue保持一致
function reset() {
  form.value = {
    categoryId: null,
    categoryName: null,
    tenantId: null,
    tenantName: null,
    isSys: null,
    parentId: null,
    orderNum: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
  };
  proxy.resetForm("categoryRef");
}

/** 搜索按钮操作 - 与device/index.vue保持一致 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.productName = null;
  queryParams.productId = null;
  queryParams.categoryNames = null;
  
  // 重置过滤后的产品型号列表 - 与device/index.vue保持一致
  const uniqueProductIds = [...new Set(devProductList.value.map(item => item.productId))];
  filteredProductIdList.value = uniqueProductIds;
  
  proxy.resetForm("queryFormRef");
  handleQuery();
}

// 多选框选中数据 - 与device/index.vue保持一致
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.categoryId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 - 与device/index.vue保持一致 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品分类";
}

/** 修改按钮操作 - 与device/index.vue保持一致 */
function handleUpdate(row) {
  reset();
  const _categoryId = row.categoryId || ids.value;
  getCategory(_categoryId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品分类";
  });
}

/** 提交按钮 - 与device/index.vue保持一致 */
function submitForm() {
  proxy.$refs["categoryRef"].validate((valid) => {
    if (valid) {
      if (form.value.categoryId != null) {
        updateCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 - 与device/index.vue保持一致 */
function handleDelete(row) {
  const productIds = row.productId;
  proxy.$modal
    .confirm('是否确认删除产品名称为"' + row.productName + '"的数据项？')
    .then(function () {
      return delProduct(productIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 - 与device/index.vue保持一致 */
function handleExport() {
  proxy.download(
    "system/category/export",
    {
      ...queryParams,
    },
    `category_${new Date().getTime()}.xlsx`
  );
}

// 切换显示方式 - 与device/index.vue保持一致
const handleChangeShowType = () => {
  showType.value = showType.value === 'card' ? 'list' : 'card';
};

// 状态变更处理 - 与device/index.vue保持一致
const handleStatusChange = async (status,id,productId,deviceType) => {
  let confirmMessage = '确定取消发布？';
  
  if (status === 2) {
    confirmMessage = '产品发布后，可以创建对应的设备';
  } else if (status === 1) {
    // 检查设备数量
    const { data: count } = await deviceCount(productId);
    if (count > 0) {
      confirmMessage = `重要提示：产品下已有 ${count} 个设备，取消发布可以修改产品信息和模型，重新发布后对应设备状态将会被重置！`;
    }
  }

  try {
    await ElMessageBox.confirm(confirmMessage, '提示');
    await changeProductStatus({
      id: id,
      productId: productId,
      status,
      deviceType: deviceType
    });
    
    ElMessage.success('修改成功');
    handleQuery();
  } catch (error) {
    ElMessage.success('修改失败');
    handleQuery();
  }
};
// 获取分类列表 - 与device/index.vue保持一致
const fetchShortCategories = async () => {
  try {
    const response = await listShortCategory();
    categoryShortList.value = response.data;
  } catch (error) {
    console.error('获取分类信息失败:', error);
    throw new Error('获取分类列表失败');
  }
};

// 初始化调用 - 与device/index.vue保持一致
fetchShortCategories();
getProductNameList(); // 先获取产品名称和产品型号列表
getCategoryList(); // 再获取产品分类
getList(); // 最后获取产品列表
</script>
<style scoped>
.el-button--mini {
    border: 0 ;
    padding: 7px 15px;
    font-size: 15px;
    border-radius: 3px;
}
</style>