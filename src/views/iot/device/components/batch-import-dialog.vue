<template>
  <!-- 批量导入设备 -->
  <div class="batch-import-container">
    <!-- 导入对话框 -->
    <el-dialog 
      :title="upload.title" 
      v-model="upload.importDeviceDialog" 
      width="550px" 
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <!-- 导入表单 -->
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="100px"
        class="import-form"
      >
        <el-row>
          <el-col :span="24">
            <!-- 所属产品选择 -->
            <el-form-item label="所属产品" prop="productName" required>
              <el-input
                readonly
                v-model="form.productName"
                placeholder="请选择产品"
                class="product-select-input"
              >
                <template #append>
                  <el-button @click="selectProduct" type="primary">
                    选择产品
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 产品型号显示 -->
            <el-form-item label="产品型号" prop="productId" required>
              <el-input
                readonly
                v-model="form.productId"
                placeholder="请先选择产品"
                disabled
              />
            </el-form-item>

            <!-- 文件上传区域 -->
            <el-form-item label="上传文件" prop="fileList" required>
              <el-upload
                ref="uploadRef"
                :limit="1"
                accept=".xlsx, .xls"
                :headers="upload.headers"
                v-model:file-list="form.fileList"
                :action="`${upload.url}?productId=${form.productId}`"
                :disabled="upload.isUploading"
                :on-progress="handleFileUploadProgress"
                :on-success="handleFileSuccess"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                drag
                class="file-uploader"
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                  将文件拖到此处，<em>点击上传</em>
                </div>
                <div class="el-upload__tip">
                  <span>提示: 仅允许导入xls、xlsx格式文件</span>
                </div>
              </el-upload>
            </el-form-item>
            
            <el-form-item label="">
              <!-- 模板下载链接 -->
              <el-link 
                type="primary" 
                :underline="false" 
                class="template-download"
                @click="downloadTemplate"
              >
                <i class="el-icon-download"></i>
                下载设备导入模板
              </el-link>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            @click="closeDialog"
            class="cancel-btn"
          >
            取 消
          </el-button>
          <el-button 
            type="primary" 
            @click="submitImport"
            :loading="upload.isUploading"
            class="confirm-btn"
          >
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 产品选择组件 -->
    <product-list 
      ref="productListRef" 
      :product-id="form.productId" 
      @product-event="handleProductSelect" 
    />
  </div>
</template>

<script>
import { ref, reactive, getCurrentInstance, toRefs } from 'vue';
import { getToken } from '@/utils/auth';
import ProductList from './product-list.vue';
import { ElAlert, ElMessage } from 'element-plus';

export default {
  name: 'BatchImport',
  components: { ProductList },
  props: {
    device: {
      type: Object,
      default: () => null
    }
  },
  emits: ['refresh-list'],
  
  setup() {
    // 获取当前实例用于访问全局属性
    const { proxy } = getCurrentInstance();
    
    // 表单引用
    const formRef = ref(null);
    const uploadRef = ref(null);
    // 产品选择组件引用 - 在setup中定义
    const productListRef = ref(null);

    return {
      formRef,
      uploadRef,
      productListRef, // 导出给模板使用
      proxy
    };
  },

  data() {
    return {
      // 表单数据
      form: {
        productId: null,
        productName: '',
        fileList: []
      },

      // 上传配置
      upload: {
        importDeviceDialog: false,
        title: '批量导入设备',
        isUploading: false,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: ref(import.meta.env.VITE_APP_BASE_API + "/iot/device/importData")
      },

     
      // 表单验证规则
      rules: {
        productName: [
          { required: true, message: '请选择所属产品', trigger: 'blur' }
        ],
        productId: [
          { required: true, message: '请选择所属产品', trigger: 'blur' }
        ],
        fileList: [
          { required: true, message: '请上传导入文件', trigger: 'change' }
        ]
      }
    };
  },

  methods: {
    /** 打开导入对话框 */
    openDialog() {
      this.upload.importDeviceDialog = true;
      // 重置表单
      this.resetForm();
    },

    /** 关闭导入对话框 */
    closeDialog() {
      this.upload.importDeviceDialog = false;
      this.resetForm();
    },

    /** 重置表单 */
    resetForm() {
      this.form = {
        productId: null,
        productName: '',
        fileList: []
      };
      
      if (this.formRef) {
        this.formRef.resetFields();
      }
      
      if (this.uploadRef) {
        this.uploadRef.clearFiles();
      }
    },

    /** 选择产品 - 修复的核心部分 */
    selectProduct() {
      // 确保组件引用正确获取
      if (!this.productListRef) {
        ElMessage.error('产品选择组件加载失败');
        console.error("productListRef is undefined");
        return;
      }
      
      // 调用组件方法打开选择对话框
      try {
        // 先获取产品列表数据
        if (typeof this.productListRef.getList === "function") {
          this.productListRef.getList();
        }
        
        // 再打开对话框
        if (typeof this.productListRef.open === "function") {
          this.productListRef.open();
        } else {
          ElMessage.error('产品选择组件缺少open方法');
          console.warn("productListRef does not have an open method");
        }
      } catch (error) {
        ElMessage.error('打开产品选择失败');
        console.error("Error opening product selection:", error);
      }
    },

    /** 处理产品选择结果 */
    handleProductSelect(product) {
      this.form.productId = product.productId;
      this.form.productName = product.productName;
      // 清除产品名称的验证状态
      this.formRef.clearValidate('productName');
    },

    /** 处理文件选择变化 */
    handleFileChange(file, fileList) {
      this.form.fileList = fileList;
      // 清除文件验证状态
      if (fileList.length > 0) {
        this.formRef.clearValidate('fileList');
      }
    },

    /** 处理文件移除 */
    handleFileRemove(file, fileList) {
      this.form.fileList = fileList;
      // 重新验证文件字段
      this.formRef.validateField('fileList');
    },

    /** 处理文件上传进度 */
    handleFileUploadProgress() {
      this.upload.isUploading = true;
    },

    /** 处理文件上传成功 */
    handleFileSuccess(response) {
      this.upload.isUploading = false;
      this.closeDialog();

      this.proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
      // 通知父组件刷新列表
     getList();
    },

    /** 下载导入模板 */
    downloadTemplate() {
      try {
        this.proxy.download(
          '/iot/device/uploadTemplate?type=1',
          {},
          `批量设备导入模板_${new Date().getTime()}.xlsx`
        );
      } catch (error) {
        ElMessage.error('模板下载失败，请稍后重试');
        console.error('模板下载错误:', error);
      }
    },

    /** 提交导入表单 */
    submitImport() {
      this.formRef.validate(valid => {
        if (valid && this.uploadRef) {
          // 检查产品ID是否存在
          if (!this.form.productId) {
            ElMessage.error('请先选择所属产品');
            return;
          }
          
          // 提交上传
          this.uploadRef.submit();
        }
      });
    }
  }
};
</script>

<style scoped>
.batch-import-container {
  /* 容器样式 */
}

.import-form {
  margin-top: 15px;
}

.product-select-input {
  width: 100%;
}

.file-uploader {
  margin-bottom: 15px;
}

.template-download {
  display: inline-block;
  margin-top: 5px;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 15px;
}

.cancel-btn {
  margin-right: 8px;
}

/* 动画效果 */
::v-deep .el-upload--drag {
  transition: all 0.3s ease;
}

::v-deep .el-upload--drag:hover {
  border-color: var(--el-color-primary);
}

::v-deep .el-button--primary {
  transition: all 0.2s ease;
}
</style>
