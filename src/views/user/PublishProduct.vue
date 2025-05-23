<template>
  <div class="publish-container">
    <h2 class="page-title">发布商品</h2>

    <el-card class="publish-form">
      <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          class="product-form"
          label-width="100px"
      >
        <el-form-item label="商品标题" prop="title">
          <el-input v-model="formData.title" maxlength="30" placeholder="请输入商品标题，最多30个字" show-word-limit/>
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
              clearable
              placeholder="请选择商品分类"
          />
        </el-form-item>

        <el-form-item label="商品价格" prop="price">
          <el-input-number
              v-model="formData.price"
              :min="0"
              :precision="2"
              :step="10"
              controls-position="right"
          />
          <span class="input-tip">元</span>
        </el-form-item>

        <el-form-item label="商品成色" prop="productQuality">
          <el-select v-model="formData.productQuality" placeholder="请选择商品成色">
            <el-option
                v-for="(value, key) in productStore.productQualityMap"
                :key="key"
                :label="value"
                :value="Number(key)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品图片" prop="imageUrls">
          <el-upload
              :action="null"
              :auto-upload="false"
              :before-upload="beforeUpload"
              :file-list="fileList"
              :limit="9"
              :on-change="handleImageChange"
              :on-exceed="handleExceed"
              :on-preview="handleImagePreview"
              :on-remove="handleImageRemove"
              list-type="picture-card"
          >
            <el-icon>
              <Plus/>
            </el-icon>
            <template #tip>
              <div class="el-upload__tip">
                最多上传9张图片，第一张将作为封面图，支持jpg/png格式，单张不超过5MB
              </div>
            </template>
          </el-upload>

          <el-dialog v-model="previewVisible" title="图片预览">
            <img :src="previewUrl" alt="Preview Image" style="width: 100%;"/>
          </el-dialog>
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
              v-model="formData.description"
              maxlength="1000"
              placeholder="请详细描述商品的使用情况、新旧程度、有无损坏等信息"
              rows="6"
              show-word-limit
              type="textarea"
          />
        </el-form-item>


        <el-form-item>
          <el-button :loading="submitting" type="primary" @click="submitForm">发布商品</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {useProductStore} from '@/stores/product'
import {useCategoryStore} from '@/stores/category'
import {useFileStore} from '@/stores/file'

const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const fileStore = useFileStore()

const formRef = ref(null)
const fileList = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')
const submitting = ref(false)

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  price: 0,
  categoryId: null,
  productQuality: 1,
  location: '',
  imageUrls: []
})

// 表单验证规则
const rules = {
  title: [
    {required: true, message: '请输入商品标题', trigger: 'blur'},
    {min: 2, max: 30, message: '标题长度为2-30个字符', trigger: 'blur'}
  ],
  price: [
    {required: true, message: '请输入商品价格', trigger: 'change'},
    {type: 'number', min: 0, message: '价格必须大于0', trigger: 'change'}
  ],
  categoryId: [
    {required: true, message: '请选择商品分类', trigger: 'change'}
  ],
  productQuality: [
    {required: true, message: '请选择商品成色', trigger: 'change'}
  ],
  description: [
    {required: true, message: '请输入商品描述', trigger: 'blur'},
    {min: 10, max: 1000, message: '描述长度应在10-1000个字符之间', trigger: 'blur'}
  ],
  imageUrls: [
    {required: true, message: '请上传至少一张商品图片', trigger: 'change'}
  ]
}

// 分类选项
const categoryOptions = computed(() => {
  return categoryStore.categoryTree || []
})

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

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true

        if (formData.imageUrls.length === 0) {
          ElMessage.error('请上传至少一张商品图片')
          submitting.value = false
          return
        }

        // 上传商品数据
        const productData = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
          productQuality: formData.productQuality,
          location: formData.location,
          imageUrls: formData.imageUrls
        }

        // 发布商品
        const productId = await productStore.submitProduct(productData)
        if (productId) {
          ElMessageBox.alert('商品发布成功！', '提示', {
            confirmButtonText: '确定',
            callback: () => {
              router.push(`/product/${productId}`)
            }
          })
        }
      } catch (error) {
        console.error('商品发布失败:', error)
        ElMessage.error('商品发布失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  fileList.value = []
  formData.imageUrls = []
}

// 组件挂载时加载分类数据
onMounted(async () => {
  // 获取分类树
  if (categoryStore.categoryTree.length === 0) {
    await categoryStore.fetchCategoryTree()
  }
})
</script>

<style scoped>
.publish-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.publish-form {
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