<template>
  <div class="app-container">
    <!-- 顶部操作区 -->
    <el-card class="product-card" style="    margin-bottom: 20px;"> 
      <el-button type="info" size="medium" @click="handleBack" class="operation-btn">
        <i class="el-icon-arrow-left mr-1"></i>返回列表
      </el-button>
      
      <el-button 
        v-if="form.status === 1" 
        type="success" 
        size="medium" 
        @click="handleStatusChange(2)"
        v-hasPermi="['iot:product:add']"
        class="operation-btn ml-2"
      >
        <i class="el-icon-check mr-1"></i>发布产品
      </el-button>

      <el-button  
        v-if="form.status === 2"
        type="danger" 
        size="medium" 
        @click="handleStatusChange(1)"
        v-hasPermi="['iot:product:edit']"
        class="operation-btn ml-2"
      >
        <i class="el-icon-close mr-1"></i>取消发布
      </el-button>
    </el-card>

    <!-- 主内容区 -->
    <el-card class="product-card">
      <el-tabs 
        v-model="activeName" 
        class="demo-tabs"
        @tab-click="handleTabChange"
      >
        <!-- 基本信息标签页 -->
        <el-tab-pane name="basic">
          <template #label>
            <!-- <span style="color:red;font-size:16px;">* </span> -->
            <span style="font-size:16px;">产品信息</span>
          </template>
          
          <!-- 基本信息表单 -->
          <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="form-container">
            <!-- 第一行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item label="产品名称" prop="productName" class="form-item">
                  <el-input 
                    v-model="form.productName" 
                    placeholder="请输入产品名称" 
                    :readonly="form.status == 2" 
                    size="large"
                    class="form-control"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品分类" prop="categoryId" class="form-item">
                  <el-select 
                    v-model="form.categoryId" 
                    placeholder="请选择产品分类" 
                    @change="selectCategory"
                    :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  >
                    <el-option v-for="category in categoryShortList" :key="category.id"
                      :label="category.name" :value="category.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第二行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item label="产品类型" prop="deviceType" class="form-item">
                  <el-select 
                    v-model="form.deviceType" 
                    placeholder="请选择产品类型" 
                    @change="deviceTypeChange" 
                    :disabled="form.status == 2" 
                    size="large"
                    class="form-control"
                  >
                    <el-option v-for="dict in iot_device_type" :key="dict.value"
                      :label="dict.label" :value="parseInt(dict.value)"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="传输协议" prop="transport" class="form-item">
                  <el-select 
                    v-model="form.transport" 
                    placeholder="请选择传输协议" 
                    :disabled="true"
                    size="large"
                    class="form-control"
                  >
                    <el-option v-for="dict in iot_transport_type" :key="dict.value"
                      :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第三行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item v-if="form.deviceType !== 3" label="编码协议" prop="protocolCode" class="form-item">
                  <el-select 
                    v-model="form.protocolCode" 
                    placeholder="请选择编码协议" 
                    :disabled="form.status == 2" 
                    @change="handleProtocolChange"
                    size="large"
                    class="form-control"
                  >
                    <el-option v-for="p in protocolList" :key="p.protocolCode" :label="p.protocolName"
                      :value="p.protocolCode" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联网方式" prop="networkMethod" class="form-item">
                  <el-select 
                    v-model="form.networkMethod" 
                    placeholder="请选择联网方式" 
                    :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  >
                    <el-option v-for="dict in iot_network_method" :key="dict.value"
                      :label="dict.label" :value="parseInt(dict.value)"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第四行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item label="产品型号" prop="productId" class="form-item">
                  <el-input 
                    v-model="form.productId" 
                    placeholder="请输入产品型号"
                    :disabled="form.deviceType == 3"  
                    size="large"
                    class="form-control"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Mqtt账号" prop="mqttAccount" class="form-item">
                  <el-input 
                    v-model="form.mqttAccount" 
                    placeholder="不填自动生成" 
                    :disabled="form.deviceType == 3" 
                    size="large"
                    class="form-control"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第五行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item label="Mqtt密码" prop="mqttPassword" class="form-item">
                  <el-input 
                    v-model="form.mqttPassword" 
                    placeholder="不填则自动生成" 
                    :disabled="form.deviceType == 3" 
                    size="large"
                    class="form-control"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="认证方式" prop="vertificateMethod" class="form-item">
                  <el-select 
                    v-model="form.vertificateMethod" 
                    placeholder="请选择认证方式" 
                    :disabled="form.status == 2 || form.deviceType == 3"
                    size="large"
                    class="form-control"
                  >
                    <el-option v-for="dict in iot_vertificate_method" :key="dict.value"
                      :label="dict.label" :value="parseInt(dict.value)"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第六行 - 备注和图片 -->
            <el-row :gutter="30">
              <el-col :span="12">
                 <el-form-item label="产品图片" class="form-item">
                  <div class="image-upload-container">
                    <div v-if="form.status == 2 && form.imgUrl == null" class="default-image-container">
                      <el-image 
                        style="height:180px;width:180px;border-radius:8px;"
                        :preview-src-list="[defaultImageUrl]"
                        :src="defaultImageUrl" 
                        fit="cover"
                      ></el-image>
                    </div>
                    <div v-else>
                      <ImageUpload 
                        :disabled="form.status == 2" 
                        :value="form.imgUrl"
                        :limit="form.status == 2 ? 0 : 1" 
                        :fileSize="1" 
                        @input="getImagePath($event)" 
                        class="image-upload"
                      />
                    </div>
                    <div class="el-upload__tip" style="color:#f56c6c;font-size:14px;text-align:center;margin-top:10px"
                      v-if="form.productId == null || form.productId == 0 && form.status != 2">
                      提示：上传后需要提交保存
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
     <el-form-item label="备注信息" prop="remark" class="form-item">
                  <el-input 
                    v-model="form.remark" 
                    type="textarea" 
                    placeholder="请输入产品相关备注信息" 
                    rows="4"
                    :readonly="form.status == 2" 
                    size="large"
                    class="form-control"
                  />
                </el-form-item>

          
              </el-col>
            </el-row>
            
            <!-- 按钮区域 -->
            <el-row>
              <el-col :span="24" class="button-group">
                <el-form-item>
                  <el-button type="primary" @click="handleSubmit" v-hasPermi="['iot:product:edit']"
                    v-show="form.id != 0 && form.status != 2" size="large" class="main-btn">
                    <i class="el-icon-edit mr-1"></i>修 改
                  </el-button>
                  <el-button type="primary" @click="handleSubmit" v-hasPermi="['iot:product:add']"
                    v-show="form.id == 0 && form.status != 2" size="large" class="main-btn">
                    <i class="el-icon-plus mr-1"></i>新 增
                  </el-button>
                  <el-button @click="handleReset" size="large" class="reset-btn">
                    <i class="el-icon-refresh mr-1"></i>重 置
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 产品模型标签页 -->
        <el-tab-pane name="things" :disabled="!form.productId">
          <template #label>
            <!-- <span style="color:red;font-size:16px;">* </span> -->
            <span style="font-size:16px;">产品模型</span>
          </template>
          <ProductThingsModel 
            :key="productKey" 
            :product="form" 
            class="things-model-container"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>


<script setup name="ProductEdit">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDict } from '@/utils/dict';

// 组件导入
import BasicInfo from './components/BasicInfo.vue';
import ProductThingsModel from './components/ProductThingsModel.vue';

// API导入
import { listProtocol } from "@/api/iot/protocol";
import { listShortCategory } from "@/api/iot/category";
import { 
  getProduct, 
  addProduct, 
  updateProduct, 
  changeProductStatus, 
  deviceCount 
} from "@/api/iot/product";

// 路由与字典
const route = useRoute();
const router = useRouter();
  const { proxy } = getCurrentInstance();
  const { iot_device_type, iot_network_method, iot_vertificate_method, iot_transport_type } = proxy.useDict('iot_device_type','iot_network_method','iot_vertificate_method','iot_transport_type');
  
// 响应式数据
const activeName = ref('basic');
const categoryShortList = ref([]);
const protocolList = ref([]);
const productKey = ref(Date.now()); // 用于强制刷新产品模型组件

// 表单数据
const form = reactive({
  productId: null,
  productName: null,
  categoryId: null,
  categoryName: null,
  status: null,
  tslJson: null,
  isAuthorize: 0,
  deviceType: '直连设备',
  networkMethod: 1,
  vertificateMethod: 2,
  transport: 'MQTT',
  mqttAccount: null,
  mqttPassword: null,
  mqttSecret: null,
  protocolCode: 'JSON',
  remark: null,
  imgUrl: '',
  isModbus: false,
});

  const rules = {
    productName: [
      { required: true, message: '产品名称不能为空', trigger: 'blur' },
      { min: 1, max: 64, message: '产品名称不能少于1个字符和超过64字符', trigger: 'blur' },
    ],
    productId: [
      { required: true, message: '产品型号不能为空', trigger: 'blur' },
      { min: 1, max: 64, message: '产品型号不能少于1个字符和超过64字符', trigger: 'blur' },
    ],
    categoryId: [
      { required: true, message: '产品分类ID不能为空', trigger: 'blur' }
    ],
    deviceType: [
      { required: true, message: '请选择产品类型', trigger: 'blur' }
    ],
    protocolCode: [
      { required: true, message: '产品协议不能为空', trigger: 'blur' }
    ],
    transport: [
      { required: true, message: '传输协议不能为空', trigger: 'blur' }
    ]
  };
  
// 计算属性 - 判断产品是否为新创建
const isNewProduct = computed(() => !form.productId || form.productId === 0);

// 生命周期
onMounted(async () => {
  try {
    // 初始化页面数据
    await initPageData();
  } catch (error) {
    ElMessage.error(`页面初始化失败: ${error.message}`);
  }
});

// 初始化页面数据
const initPageData = async () => {
  const productId = route.query?.productId;
  
  // 如果是编辑模式，获取产品详情
  if (productId && productId !== '0') {
    form.productId = productId;
    await fetchProductDetail(productId);
  }
  
  // 处理标签页切换
  const tabPanelName = route.query?.tabPanelName;
  if (tabPanelName) {
    activeName.value = tabPanelName;
  }
  
  // 加载基础数据
  await Promise.all([
    fetchShortCategories(),
    fetchProtocols()
  ]);
};

// 获取产品详情
const fetchProductDetail = async (productId) => {
  try {
    const response = await getProduct(productId);
    Object.assign(form, response.data);
    handleProtocolChange(form.protocolCode);
  } catch (error) {
    console.error('获取产品信息失败:', error);
    throw new Error('获取产品详情失败');
  }
};

// 获取分类列表
const fetchShortCategories = async () => {
  try {
    const response = await listShortCategory();
    categoryShortList.value = response.data;
  } catch (error) {
    console.error('获取分类信息失败:', error);
    throw new Error('获取分类列表失败');
  }
};

// 获取协议列表
const fetchProtocols = async () => {
  try {
    const response = await listProtocol({ protocolStatus: 1 });
    protocolList.value = response.rows;
  } catch (error) {
    console.error('获取协议信息失败:', error);
    throw new Error('获取协议列表失败');
  }
};

// 表单提交处理
const handleSubmit = async () => {
  try {
    // if (isNewProduct.value) {
    //   await handleAddProduct();
    // } else {
    //   await handleUpdateProduct();
    // }
  proxy.$refs["productAddRef"].validate(valid => {
    if (valid) {
     handleAddProduct();
    }
  });



  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`);
  }
};

// 新增产品
const handleAddProduct =  () => {
 
  if(form.deviceType === '直连设备'){
     form.deviceType = 1;
  }

 addProduct(form).then(res => { 
  ElMessage.success('添加成功,请继续添加产品模型');

  handleBack();
});
};

// 状态变更处理
const handleStatusChange = async (status) => {
  let confirmMessage = '确定取消发布？';
  
  if (status === 2) {
    confirmMessage = '产品发布后，可以创建对应的设备';
  } else if (status === 1) {
    // 检查设备数量
    const { data: count } = await deviceCount(form.productId);
    if (count > 0) {
      confirmMessage = `重要提示：产品下已有 ${count} 个设备，取消发布可以修改产品信息和模型，重新发布后对应设备状态将会被重置！`;
    }
  }

  try {
    await ElMessageBox.confirm(confirmMessage, '提示');
    await changeProductStatus({
      id: form.id,
      productId: form.productId,
      status,
      deviceType: form.deviceType
    });
    
    form.status = status;
    ElMessage.success('状态修改成功');
  } catch (error) {
    // 取消操作处理
    if (status === 2) {
      activeName.value = 'basic';
    } else {
      handleBack();
    }
  }
};

// 协议变更处理
const handleProtocolChange = (protocolCode) => {
  if (!protocolCode) return;
  
  form.isModbus = protocolCode.startsWith('MODBUS');
  if (form.isModbus) {
    form.deviceType = 2;
  }
};

// 标签页切换处理
const handleTabChange = (tabItem) => {
  if (tabItem.paneName === 'alert') {
    // 可添加需要的标签页切换逻辑
  }
};

// 返回列表
const handleBack = () => {
  router.push({
    path: '/iot/product',
    query: {
      t: Date.now(),
      pageNum: route.query.pageNum,
    },
  });
};

// 重置表单
const handleReset = () => {
  Object.assign(form, {
    productId: null,
    productName: null,
    categoryId: null,
    categoryName: null,
    status: null,
    tslJson: null,
    isAuthorize: 0,
    deviceType: 1,
    networkMethod: 1,
    vertificateMethod: 3,
    mqttAccount: null,
    mqttPassword: null,
    mqttSecret: null,
    protocolCode: 'JSON',
    remark: null,
    imgUrl: '',
    isModbus: false,
  });
  // 重置组件key，强制刷新
  productKey.value = Date.now();
};



  const selectCategory = (val) => {
    debugger;
    const category = categoryShortList.value.find(item => item.id == val);
    if (category) {
     form.categoryName = category.name;
    }
  };
  
  const deviceTypeChange = (type) => {
   form.transport = 'MQTT';
  };
  
  const getImagePath = (data) => {
    form.imgUrl = data;
  };
  
</script>

<style scoped>
/* 保持原有优化的样式 */
* {
  font-size: 14px;
}

.app-container2 {

  padding-right: 20px;
  padding-left: 20px;
  padding-top: 20px;
  padding-bottom: 2px;
  background-color: #f5f7fa;

}

.product-card-top {
  margin: 0 6px 15px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #fff;
}

.operation-btn {
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.operation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card {

}

.form-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 0;
}

.form-item {
  margin-bottom: 22px;
  transition: all 0.2s;
}

.form-item:hover {
  background-color: rgba(245, 247, 250, 0.5);
}

::v-deep .el-form-item__label {
  font-size: 15px !important;
  color: #4e5969;
  font-weight: 500;
  padding-right: 15px;
}

.form-control {
  width: 100% !important;
  height: 46px !important;
  border-radius: 6px !important;
  font-size: 15px !important;
  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

::v-deep .el-textarea__inner {
  font-size: 15px !important;
  min-height: 120px !important;
  border-radius: 6px !important;
  resize: vertical;
}

.button-group {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding: 20px 0;

}

::v-deep .button-group .el-form-item {
  margin-bottom: 0;
}

.main-btn {
  width: 140px;
  height: 46px;
  font-size: 15px !important;
  border-radius: 6px;
  margin-right: 15px;
  transition: all 0.2s ease;
}

.main-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.reset-btn {
  width: 140px;
  height: 46px;
  font-size: 15px !important;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.default-image-container {
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  padding: 10px;
  transition: all 0.3s;
}

.default-image-container:hover {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

.image-upload {
  width: 180px !important;
  height: 180px !important;
  border-radius: 8px !important;
}

::v-deep .el-tabs {
  border-radius: 6px;
  overflow: hidden;
}

::v-deep .el-tabs__header {
  background-color: #f5f7fa;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

::v-deep .el-tabs__item {
  font-size: 16px !important;
  padding: 0 20px !important;
  height: 50px !important;
  line-height: 50px !important;
  margin-right: 20px !important;
  color: #606266;
}

::v-deep .el-tabs__item.is-active {
  color: #409eff;
  font-weight: 500;
}

::v-deep .el-tabs__content {
  padding: 25px;
  background-color: #fff;
}

::v-deep .el-select-dropdown {
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

::v-deep .el-select-dropdown__item {
  font-size: 15px !important;
  padding: 10px 20px !important;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .product-card {
    padding: 15px;
  }
  
  el-col {
    width: 100% !important;
    margin-bottom: 15px;
  }
  
  .main-btn, .reset-btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
