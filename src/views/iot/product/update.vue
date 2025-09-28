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
        <i class="el-icon-check mr-1"></i>发布模型
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


          <el-button 
        type="success" 
        size="medium" 
        @click="daoChuWord()"
        v-hasPermi="['iot:product:add']"
        class="operation-btn ml-2"
      >
        <i class="el-icon-check mr-1"></i>导出对接文档
      </el-button>

              <el-button 
        type="success" 
        size="medium" 
        @click="handleViewMqtt"
        v-hasPermi="['iot:product:add']"
        class="operation-btn ml-2"
      >
        <i class="el-icon-check mr-1"></i>MQTT连接信息
      </el-button>
     
    </el-card>

    <!-- 主内容区 -->
    <el-card class="product-card" style="height: 75vh;">
      <el-tabs 
        v-model="activeName" 
        class="demo-tabs"
        @tab-click="handleTabChange"
      >
        <!-- 基本信息标签页 -->
        <el-tab-pane name="basic">
          <template #label>
            <!-- <span style="color:red;font-size:16px;">* </span> -->
            <span style="font-size:16px;">基础信息</span>
          </template>
          
          <!-- 基本信息表单 -->
   <el-form ref="productAddRef" :model="form" :rules="rules" label-width="120px" class="form-container">
            <!-- 第一行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                <el-form-item label="产品名称" prop="productName" class="form-item">
                  <el-input 
                    v-model="form.productName" 
                    placeholder="请输入产品名称" 
                    :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                  <el-form-item label="产品型号" prop="productId" class="form-item">
                  <el-input 
                    v-model="form.productId" 
                    placeholder="请输入产品型号"
                      :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <!-- 第二行 -->
            <el-row :gutter="30">
              <el-col :span="12">
                                <el-form-item label="产品分类" prop="categoryId" class="form-item">
                  <el-select 
                    v-model="form.categoryId" 
                    placeholder="请选择或输入产品分类" 
                    @change="selectCategory"
                    @blur="handleCategoryBlur"
                    :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                    filterable
                    allow-create
                    default-first-option
                    :filter-method="filterCategories"
                    :reserve-keyword="false"
                    @visible-change="handleCategoryVisibleChange"
                  >
                    <el-option 
                      v-for="category in filteredCategoryList" 
                      :key="category.id"
                      :label="category.name" 
                      :value="category.id">
                    </el-option>
                  </el-select>
                </el-form-item>

        
              </el-col>
              <el-col :span="12">
        <el-form-item label="Mqtt账号" prop="mqttAccount" class="form-item">
                  <el-input 
                    v-model="form.mqttAccount" 
                    placeholder="不填自动生成" 
                     :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  />
                </el-form-item>

         
              </el-col>
            </el-row>
            
            <!-- 第三行 -->
            <el-row :gutter="30">
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
              <el-col :span="12">
    <el-form-item label="Mqtt密码" prop="mqttPassword" class="form-item">
                  <el-input 
                    v-model="form.mqttPassword" 
                    placeholder="不填则自动生成" 
                   :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  />
                </el-form-item>

            
              </el-col>
            </el-row>
            
            <!-- 第四行 -->
            <!-- <el-row :gutter="30">
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
            </el-row> -->
            
            <!-- 第五行 -->
            <!-- <el-row :gutter="30">
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
            </el-row> -->
            
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
                      v-if="form.id == null">
                    
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
                  :disabled="form.status == 2"
                    size="large"
                    class="form-control"
                  />
                </el-form-item>

          
              </el-col>
            </el-row>
            
            
            <!-- 按钮区域 -->
            <el-row>
              <el-col :span="24" class="button-group" style="    margin-top: -6vh;">
                  
                  <el-button type="primary" @click="handleSubmit" v-hasPermi="['iot:product:add']"
                  v-show="form.id!=null"  size="large" class="main-btn">
                    <i class="el-icon-plus mr-1"></i>更 新
                  </el-button>

                  <el-button type="primary" @click="handleSubmit" v-hasPermi="['iot:product:add']"
                    v-show=" form.id==null" size="large" class="main-btn">
                    <i class="el-icon-plus mr-1"></i>新 增
                  </el-button>


                  <el-button @click="handleBack()" size="large" class="reset-btn">
                    <i class="el-icon-refresh mr-1"></i>返回列表
                  </el-button>
              </el-col>
            </el-row>
          </el-form>

        </el-tab-pane>

        <!-- 产品模型标签页 -->
        <el-tab-pane name="things" :disabled="!form.id">
          <template #label>
            <!-- <span style="color:red;font-size:16px;">* </span> -->
            <span style="font-size:16px;">监测因子</span>
          </template>
          <ProductThingsModel
            :key="productKey" 
            :product="form" 
            class="things-model-container"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
     <el-dialog
        title="MQTT连接信息"
        v-model="openViewMqtt"
        width="600px"
        append-to-body
        :close-on-click-modal="false"
      >
        <el-form ref="listQueryRef" :model="listQuery" :rules="rules" label-width="150px">
         
         
          <el-form-item label="服务器地址" prop="clientId">
            <el-input v-model="listQuery.fwqdz" readonly style="width: 80%" />
          </el-form-item>
          
          <el-form-item label="端口" prop="clientId">
            <el-input v-model="listQuery.port" readonly style="width: 80%" />
          </el-form-item>
          
          <el-form-item label="Client ID" prop="clientId">
            <el-input v-model="listQuery.ClientID" readonly style="width: 80%" />
          </el-form-item>
                 
          <el-form-item label="Path" prop="clientId">
            <el-input v-model="listQuery.Path" readonly style="width: 80%" />
          </el-form-item>
          <el-form-item label="MQTT用户名" prop="username">
            <el-input v-model="listQuery.mqttAccount" readonly style="width: 80%" />
          </el-form-item>
          <el-form-item label="MQTT密码" prop="passwd">
            <el-input
              clearable
              v-model="listQuery.mqttPassword"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
          <el-form-item label="推送数据主题" prop="reportTopic">
            <el-input
              clearable
              v-model="listQuery.fbzt"
              readonly
              style="width: 80%"
            ></el-input>
          </el-form-item>
    
   
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button class="btns" type="primary" @click="doCopy">一键复制</el-button>
            <el-button @click="closeSummaryDialog">关 闭</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 新增分类对话框 -->
      <el-dialog
        v-model="addCategoryDialogVisible"
        title="新增产品分类"
        width="500px"
        :close-on-click-modal="false"
        @close="resetAddCategoryForm"
      >
        <el-form
          ref="addCategoryFormRef"
          :model="addCategoryForm"
          :rules="addCategoryRules"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="categoryName">
            <el-input
              v-model="addCategoryForm.categoryName"
              placeholder="请输入分类名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="分类描述" prop="description">
            <el-input
              v-model="addCategoryForm.description"
              type="textarea"
              placeholder="请输入分类描述（可选）"
              maxlength="200"
              show-word-limit
              :rows="3"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addCategoryDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleAddCategory" :loading="addCategoryLoading">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
  </div>

  
</template>


<script setup name="ProductEdit">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';

import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDict } from '@/utils/dict';
import mammoth from 'mammoth';
import { saveAs } from "file-saver";

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

const openViewMqtt = ref(false);
const addCategoryDialogVisible = ref(false);
const addCategoryLoading = ref(false);

// mqtt参数查看
const listQuery = reactive({
  fwqdz: "wss://www.cbiet.com",
  port: 8084,
  ClientID: "ClientID",
  Path: "mqttwss",
  mqttAccount: "mqttAccount",
  mqttPassword: "mqttPassword",
  fbzt: "fbzt",
});

// 路由与字典
const route = useRoute();
const router = useRouter();
  const { proxy } = getCurrentInstance();
  const { iot_device_type, iot_network_method, iot_vertificate_method, iot_transport_type } = proxy.useDict('iot_device_type','iot_network_method','iot_vertificate_method','iot_transport_type');
  
// 响应式数据
const activeName = ref('basic');
const categoryShortList = ref([]);
const filteredCategoryList = ref([]);
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
      { required: true, message: '产品分类不能为空', trigger: 'blur' },
      { 
        validator: (rule, value, callback) => {
          if (typeof value === 'string' && value.trim().length > 50) {
            callback(new Error('自定义分类名称不能超过50个字符'));
          } else {
            callback();
          }
        }, 
        trigger: 'blur' 
      }
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
  const id = route.query?.id;
  
  // 如果是编辑模式，获取产品详情
  if (id && id !== '0') {
    form.id = id;
    await fetchProductDetail(id);
  }
  
  // 处理标签页切换
  const activeNameTab = route.query?.activeName;
  debugger
  if (activeNameTab) {
    activeName.value = activeNameTab;
  }
  
  // 加载基础数据
  await Promise.all([
    fetchShortCategories(),
    fetchProtocols()
  ]);
  

};
// 获取产品详情
const fetchProductDetail = async (id) => {
  try {
    const response = await getProduct(id);
    Object.assign(form, response.data);
    handleProtocolChange(form.protocolCode);
  } catch (error) {
    console.error('获取产品信息失败:', error);
    throw new Error('获取产品详情失败');
  }
};
// ... existing code ...

// 获取分类列表
const fetchShortCategories = async () => {
  debugger
  try {
    const response = await listShortCategory();
    categoryShortList.value = response.data;
    filteredCategoryList.value = [...response.data]; // 初始化筛选后的列表
  } catch (error) {
    console.error('获取分类信息失败:', error);
    throw new Error('获取分类列表失败');
  }
};

// 分类筛选方法
const filterCategories = (query) => {
  if (query === '') {
    filteredCategoryList.value = categoryShortList.value;
  } else {
    filteredCategoryList.value = categoryShortList.value.filter(item => {
      return item.name.toLowerCase().includes(query.toLowerCase());
    });
  }
};

// 处理分类选择框显示/隐藏
const handleCategoryVisibleChange = (visible) => {
  if (visible) {
    // 当选择框打开时，重置筛选列表
    filteredCategoryList.value = [...categoryShortList.value];
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

// mqtt参数查看
const handleViewMqtt =  () => {
  const ss= form;

listQuery.fbzt = "/"+  ss.productId +"/"+'自定义ClientID' +"/property/post";
listQuery.ClientID='自定义ClientID';
listQuery.mqttAccount = ss.mqttAccount;
listQuery.mqttPassword = ss.mqttPassword;
  debugger;
  openViewMqtt.value = true;

}

// 新增产品
const handleAddProduct =  () => {
 
  if(form.deviceType === '直连设备'){
     form.deviceType = 1;
  }

if(form.id!=null){

  updateProduct(form).then(res => { 
  ElMessage.success('更新成功');

});
}else{
  addProduct(form).then(res => { 
  debugger;
  ElMessage.success('添加成功,请继续添加产品模型');

  if(res.code==200){
 
    form.status = 1 ;
    form.id = res.data.id;

    activeName.value = 'things';
  }

   
});


}


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
    // query: {
    //   t: Date.now(),
    //   pageNum: route.query.pageNum,
    // },
  });
};
// 关闭物模型
const closeSummaryDialog= () => {
 
  openViewMqtt.value = false;
}
const doCopy = () => {
   const input = document.createElement("input");
    input.value =
      '{"服务器地址":"' +
      listQuery.fwqdz +
      '","端口":"' +
      listQuery.port +
      '","Client ID":"' +
      listQuery.ClientID +
      '","Path":"' +
      listQuery.Path +
      '","MQTT用户名":"' +
      listQuery.mqttAccount +
      '","MQTT密码":"' +
      listQuery.mqttPassword +
      '","推送数据主题":"' +
      listQuery.fbzt +
     
      '"}';
    document.body.appendChild(input);
    input.select(); // 选中输入框
    document.execCommand("Copy"); // 复制当前选中文本到前切板
    document.body.removeChild(input);
    ElMessage.success("复制成功");
}
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
    
    const category = categoryShortList.value.find(item => item.id == val);
    if(category){
      form.categoryName = category.name;
      form.categoryId = category.id;
    }else{
      if (typeof val === 'string' && val.trim() !== '') {
      // 自定义输入的分类
      form.categoryName = val.trim();
      form.categoryId = val.trim(); // 使用名称作为ID
    }
  }

};
  // 处理分类选择框失去焦点事件
  const handleCategoryBlur = (event) => {
    const inputValue = event.target.value;
    if (inputValue && inputValue.trim() !== '') {
      // 如果输入框有值，直接设置为分类名称
      form.categoryName = inputValue.trim();
      form.categoryId = inputValue.trim();
    }
  };
  
  const deviceTypeChange = (type) => {
   form.transport = 'MQTT';
  };
  
  const getImagePath = (data) => {
    form.imgUrl = data;
  };

  
// 替换原有的daoChuWord和convertHtmlToDocx方法
const daoChuWord = () => {
  // 先验证必要的产品信息是否存在
  if (!form.productId || !form.productName) {
    ElMessage.warning('请确保产品信息完整后再导出文档');
    return;
  }
  convertHtmlToDocx();
};

const convertHtmlToDocx = async () => { 
  try {
  proxy.download(
    "iot/product/exportWord",
    { ...form },
    `对接文档_${new Date().getTime()}.docx`
  );

  } catch (error) {
   
    ElMessage.error('文档导出失败，请重试');
  }
};

</script>

<style scoped>
/* 保持原有优化的样式 */


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
  margin-bottom: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #fff;
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

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.form-tip i {
  margin-right: 4px;
  color: #409EFF;
}

::v-deep .el-form-item__label {

  color: #4e5969;
  font-weight: 500;
  padding-right: 15px;
}

.form-control {
  width: 100% !important;
  height: 46px !important;
  border-radius: 6px !important;

  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

::v-deep .el-textarea__inner {

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
  padding: 0px;
  background-color: #fff;
}

::v-deep .el-select-dropdown {
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

::v-deep .el-select-dropdown__item {

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


.things-model-container {
  max-height: 60vh; /* 设置最大高度 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
}
.factor-list-container {
  max-height: 300px; /* 或者您希望设置的最大高度 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
}
</style>
