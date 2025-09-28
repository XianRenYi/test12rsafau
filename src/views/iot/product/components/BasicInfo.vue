<template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="100">
        <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="8">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="form.productName" placeholder="请输入产品名称" :readonly="form.status == 2" />
          </el-form-item>
          <el-form-item label="产品分类" prop="categoryId">
            <el-select v-model="form.categoryId" placeholder="请选择产品分类" @change="selectCategory"
              style="width:100%" :disabled="form.status == 2">
              <el-option v-for="category in categoryShortList" :key="category.id"
                :label="category.name" :value="category.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品类型" prop="deviceType">
            <el-select v-model="form.deviceType" placeholder="请选择产品类型" @change="deviceTypeChange" 
              :disabled="form.status == 2" style="width:100%">
              <el-option v-for="dict in iot_device_type" :key="dict.value"
                :label="dict.label" :value="parseInt(dict.value)"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="传输协议" prop="transport">
            <el-select v-model="form.transport" placeholder="请选择传输协议" style="width: 100%"
              :disabled="true">
              <el-option v-for="dict in iot_transport_type" :key="dict.value"
                :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.deviceType !== 3" label="编码协议" prop="protocolCode">
            <el-select v-model="form.protocolCode" placeholder="请选择编码协议" style="width: 100%"
              :disabled="form.status == 2" @change="$emit('change-product-code', form.protocolCode)">
              <el-option v-for="p in protocolList" :key="p.protocolCode" :label="p.protocolName"
                :value="p.protocolCode" />
            </el-select>
          </el-form-item>
          <el-form-item label="联网方式" prop="networkMethod">
            <el-select v-model="form.networkMethod" placeholder="请选择联网方式" style="width:100%;"
              :disabled="form.status == 2">
              <el-option v-for="dict in iot_network_method" :key="dict.value"
                :label="dict.label" :value="parseInt(dict.value)"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" rows="3"
              :readonly="form.status == 2" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="8">
          <!-- <el-form-item label="启用授权" prop="networkMethod">
            <el-switch v-model="form.isAuthorize" @change="changeIsAuthorize"
              :active-value="1" :inactive-value="0"
              :disabled="form.status == 2 || form.deviceType == 3" />
          </el-form-item> -->
          <el-form-item label="产品型号" prop="productId">
            <el-input v-model="form.productId" placeholder="请输入产品型号"
              :disabled="form.deviceType == 3"  />
          </el-form-item>

          <el-form-item label="Mqtt账号" prop="mqttAccount">
            <el-input v-model="form.mqttAccount" placeholder="不填自动生成" :disabled="form.deviceType == 3"
             >
             
            </el-input>
          </el-form-item>
          <el-form-item label="Mqtt密码" prop="mqttPassword">
            <el-input v-model="form.mqttPassword" placeholder="不填则自动生成" :disabled="form.deviceType == 3"
             >
              
            </el-input>
          </el-form-item>

          <el-form-item label="认证方式" prop="vertificateMethod">
            <el-select v-model="form.vertificateMethod" placeholder="请选择认证方式" style="width:100%"
              :disabled="form.status == 2 || form.deviceType == 3">
              <el-option v-for="dict in iot_vertificate_method" :key="dict.value"
                :label="dict.label" :value="parseInt(dict.value)"></el-option>
            </el-select>
          </el-form-item>
    
                <el-form-item label="产品图片">
            <div v-if="form.status == 2 && form.imgUrl == null">
              <el-image style="height:145px;width:145px;border-radius:10px;"
                :preview-src-list="[require('@/assets/images/gateway.png')]"
                :src="require('@/assets/images/gateway.png')" fit="cover"
                v-if="form.deviceType == 2"></el-image>
              <el-image style="height:145px;width:145px;border-radius:10px;"
                :preview-src-list="[require('@/assets/images/video.png')]"
                :src="require('@/assets/images/video.png')" fit="cover"
                v-else-if="form.deviceType == 3"></el-image>
              <el-image style="height:145px;width:145px;border-radius:10px;"
                :preview-src-list="[require('@/assets/images/product.png')]"
                :src="require('@/assets/images/product.png')" fit="cover" v-else></el-image>
            </div>
            <div v-else>
              <ImageUpload :disabled="true" :value="form.imgUrl"
                :limit="form.status == 2 ? 0 : 1" :fileSize="1" @input="getImagePath($event)" />
            </div>
            <div class="el-upload__tip" style="color:#f56c6c"
              v-if="form.productId == null || form.productId == 0">提示：上传后需要提交保存</div>
          </el-form-item>
          
        </el-col>
   
      </el-row>
  
      <el-col :span="20">
        <el-form-item style="text-align: center;margin:40px 0px;">
          <el-button type="primary" @click="$emit('submit')" v-hasPermi="['iot:product:edit']"
            v-show="form.id != 0 && form.status != 2">修 改</el-button>
          <el-button type="primary" @click="$emit('submit')" v-hasPermi="['iot:product:add']"
            v-show="form.id == 0 && form.status != 2">新 增</el-button>
        </el-form-item>
      </el-col>
    </el-form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { useDict } from '@/utils/dict'
  import ImageUpload from '@/components/ImageUpload/index.vue';
  
  const props = defineProps({
    form: {
      type: Object,
      required: true
    },
    categoryShortList: {
      type: Array,
      required: true
    },
    protocolList: {
      type: Array,
      required: true
    }
  });
  
  const emit = defineEmits(['submit', 'reset', 'change-status', 'change-product-code']);
  const { proxy } = getCurrentInstance();
  const { iot_device_type, iot_network_method, iot_vertificate_method, iot_transport_type } = proxy.useDict('iot_device_type','iot_network_method','iot_vertificate_method','iot_transport_type');
  
  // 输入框类型
  const keyInputType = ref('password');
  const accountInputType = ref('password');
  const passwordInputType = ref('password');
  
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
  
  const selectCategory = (val) => {
    const category = props.categoryShortList.find(item => item.id == val);
    if (category) {
      props.form.categoryName = category.name;
    }
  };
  
  const deviceTypeChange = (type) => {
    if (type === 3) {
      props.form.transport = 'GB28181';
    } else {
      props.form.transport = 'MQTT';
    }
  };
  
  const getImagePath = (data) => {
    props.form.imgUrl = data;
  };
  
 
  

  </script>