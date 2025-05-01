<template>
  <div class="edit-container">
    <h2 class="page-title">编辑商品</h2>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <el-card v-else class="edit-form">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="product-form"
      >
        <el-form-item label="商品标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入商品标题，最多30个字" maxlength="30" show-word-limit />
        </el-form-item>
        
        <el-form-item label="商品分类" prop="categoryId">
          <el-cascader
            v-model="formData.categoryId"
            :options="categoryOptions"
            :props="{ 
              value: 'id',
              label: 'name',
              children: 'children',
              checkStrictly: true,
              emitPath: false
            }"
            placeholder="请选择商品分类"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="formData.price" 
            :precision="2" 
            :step="10" 
            :min="0"
            controls-position="right"
          />
          <span class="input-tip">元</span>
        </el-form-item>
        
        <el-form-item label="商品成色" prop="condition">
          <el-select v-model="formData.condition" placeholder="请选择商品成色">
            <el-option 
              v-for="(value, key) in productStore.conditionMap" 
              :key="key" 
              :label="value" 
              :value="Number(key)" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片" prop="imageUrls">
          <el-upload
            list-type="picture-card"
            :action="null"
            :auto-upload="false"
            :file-list="fileList"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :on-preview="handleImagePreview"
            :limit="9"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                最多上传9张图片，第一张将作为封面图，支持jpg/png格式，单张不超过5MB
              </div>
            </template>
          </el-upload>
          
          <el-dialog v-model="previewVisible" title="图片预览">
            <img :src="previewUrl" alt="Preview Image" style="width: 100%;" />
          </el-dialog>
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="6" 
            placeholder="请详细描述商品的使用情况、新旧程度、有无损坏等信息"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="交易地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入交易地点，例如：北京市海淀区" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">保存修改</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useFileStore } from '@/stores/file'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const fileStore = useFileStore()

const formRef = ref(null)
const fileList = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')
const submitting = ref(false)
const loading = ref(true)
const productId = ref(0)

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  price: 0,
  categoryId: null,
  condition: 1,
  location: '',
  imageUrls: []
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入商品标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度为2-30个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'change' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'change' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择商品成色', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度应在10-1000个字符之间', trigger: 'blur' }
  ],
  imageUrls: [
    { required: true, message: '请上传至少一张商品图片', trigger: 'change' }
  ]
}

// 分类选项
const categoryOptions = computed(() => {
  return categoryStore.categoryTree || []
})

// 加载商品数据
const loadProductData = async () => {
  try {
    loading.value = true
    
    // 从路由获取商品ID
    productId.value = parseInt(route.params.id)
    if (!productId.value) {
      ElMessage.error('商品ID无效')
      goBack()
      return
    }
    
    // 获取商品详情
    const product = await productStore.fetchProductDetail(productId.value)
    if (!product) {
      ElMessage.error('获取商品详情失败')
      goBack()
      return
    }
    
    // 填充表单数据
    formData.title = product.title
    formData.description = product.description
    formData.price = product.price
    formData.categoryId = product.categoryId
    formData.condition = product.condition
    formData.location = product.location || ''
    formData.imageUrls = product.imageUrls || []
    
    // 初始化文件列表
    if (product.imageUrls && product.imageUrls.length > 0) {
      fileList.value = product.imageUrls.map((url, index) => ({
        name: `商品图片${index + 1}`,
        url: fileStore.getFullUrl(url),
        uid: Date.now() + index,
        status: 'success'
      }))
    }
  } catch (error) {
    console.error('加载商品数据失败:', error)
    ElMessage.error('加载商品数据失败')
    goBack()
  } finally {
    loading.value = false
  }
}

// 图片上传前的验证
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG或PNG格式的图片！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB！')
    return false
  }
  return true
}

// 处理图片变更
const handleImageChange = async (uploadFile) => {
  if (!beforeUpload(uploadFile.raw)) {
    return
  }
  
  try {
    // 上传图片到服务器
    const result = await fileStore.uploadProductImage(uploadFile.raw)
    
    // 保存图片路径
    if (!formData.imageUrls.includes(result.path)) {
      formData.imageUrls.push(result.path)
    }
    
    // 更新上传列表 - 替换URL
    const index = fileList.value.findIndex(item => item.uid === uploadFile.uid)
    if (index !== -1) {
      fileList.value[index].url = result.url
      fileList.value[index].status = 'success'
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
  }
}

// 处理图片删除
const handleImageRemove = (uploadFile) => {
  // 从文件列表中删除
  fileList.value = fileList.value.filter(file => file.uid !== uploadFile.uid)
  
  // 如果已上传到服务器，则从imageUrls中也移除
  if (uploadFile.url) {
    const path = fileStore.getPathFromUrl(uploadFile.url)
    formData.imageUrls = formData.imageUrls.filter(url => url !== path)
  }
}

// 处理图片预览
const handleImagePreview = (uploadFile) => {
  previewUrl.value = uploadFile.url
  previewVisible.value = true
}

// 处理超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传9张图片')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        submitting.value = true
        
        // 确保至少上传了一张图片
        if (formData.imageUrls.length === 0) {
          ElMessage.error('请上传至少一张商品图片')
          return
        }
        
        // 导入更新商品的API
        const { updateProduct } = await import('@/api/product')
        
        // 提交商品数据
        const res = await updateProduct(productId.value, {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
          condition: formData.condition,
          location: formData.location,
          imageUrls: formData.imageUrls
        })
        
        if (res.code === 200) {
          ElMessage.success('商品更新成功')
          
          // 确认是查看商品还是返回列表
          ElMessageBox.confirm(
            '商品更新成功，是否查看商品详情？',
            '提示',
            {
              confirmButtonText: '查看商品',
              cancelButtonText: '返回列表',
              type: 'success',
            }
          ).then(() => {
            router.push(`/product/${productId.value}`)
          }).catch(() => {
            router.push('/user/products')
          })
        }
      } catch (error) {
        console.error('更新商品失败:', error)
        ElMessage.error(error.message || '更新商品失败，请重试')
      } finally {
        submitting.value = false
      }
    } else {
      console.log('表单验证失败:', fields)
      ElMessage.error('请完善表单信息')
    }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听formData.imageUrls变化
watch(() => formData.imageUrls, (newValue) => {
  formRef.value?.validateField('imageUrls')
}, { deep: true })

// 组件挂载时加载分类数据和商品数据
onMounted(async () => {
  // 获取分类树
  if (categoryStore.categoryTree.length === 0) {
    await categoryStore.fetchCategoryTree()
  }
  
  // 加载商品数据
  await loadProductData()
})
</script>

<style scoped>
.edit-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.loading-container {
  padding: 20px;
}

.edit-form {
  margin-bottom: 20px;
}

.product-form {
  padding: 10px;
}

.input-tip {
  margin-left: 10px;
  color: #909399;
}

:deep(.el-textarea__inner) {
  font-family: Arial, sans-serif;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}
</style> 