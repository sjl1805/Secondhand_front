<template>
  <div class="comment-form">
    <div v-if="product" class="product-brief">
      <el-image 
        :src="product.coverImage || product.imageUrl || defaultImage" 
        class="product-image"
        fit="cover"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
      <div class="product-info">
        <h4>{{ product.title }}</h4>
        <p>¥{{ product.price ? product.price.toFixed(2) : '0.00' }}</p>
      </div>
    </div>
    
    <div class="rating-section">
      <span class="rating-label">商品评分：</span>
      <el-rate v-model="localRating" :colors="['#FF9900', '#FF9900', '#FF9900']" :show-text="false" @change="updateRating" />
      <span class="rating-text">{{ ratingText }}</span>
    </div>
    
    <div class="content-section">
      <el-input
        v-model="localContent"
        type="textarea"
        :rows="4"
        placeholder="请输入评价内容，分享您的使用体验"
        maxlength="500"
        show-word-limit
        @input="updateContent"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Picture, Plus } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
  orderId: {
    type: [Number, String],
    required: true
  },
  productId: {
    type: [Number, String],
    required: true
  },
  product: {
    type: Object,
    default: null
  },
  rating: {
    type: Number,
    default: 5
  },
  content: {
    type: String,
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['update:rating', 'update:content', 'update:images'])

// 本地状态
const localRating = ref(props.rating)
const localContent = ref(props.content)
const localImages = ref([])
const defaultImage = '/images/default-product.png'

// 监听属性变化
watch(() => props.rating, (newVal) => {
  localRating.value = newVal
})

watch(() => props.content, (newVal) => {
  localContent.value = newVal
})

// 评分文本
const ratingText = computed(() => {
  const rating = localRating.value
  if (rating >= 5) return '非常满意'
  if (rating >= 4) return '满意'
  if (rating >= 3) return '一般'
  if (rating >= 2) return '不满意'
  return '非常不满意'
})

// 更新评分
const updateRating = (value) => {
  emit('update:rating', value)
}

// 更新内容
const updateContent = (value) => {
  emit('update:content', value)
}

// 处理图片上传变化
const handleImageChange = (file, fileList) => {
  if (fileList.length <= 6) {
    localImages.value = fileList.map(item => item.raw)
    emit('update:images', localImages.value)
  }
}

// 处理图片移除
const handleImageRemove = (file, fileList) => {
  localImages.value = fileList.map(item => item.raw)
  emit('update:images', localImages.value)
}

// 暴露给父组件的方法
defineExpose({
  getRating: () => localRating.value,
  getContent: () => localContent.value,
  getImages: () => localImages.value,
  reset: () => {
    localRating.value = 5
    localContent.value = ''
    localImages.value = []
  }
})
</script>

<style scoped>
.comment-form {
  padding: 10px 0;
}

.product-brief {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 15px;
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  color: #909399;
  background-color: #f5f7fa;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.product-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.product-info p {
  margin: 0;
  color: #f56c6c;
  font-weight: 500;
}

.rating-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.rating-label {
  margin-right: 10px;
  font-size: 14px;
}

.rating-text {
  margin-left: 10px;
  color: #ff9900;
  font-size: 14px;
}

.content-section {
  margin-bottom: 20px;
}

.images-section {
  margin-bottom: 10px;
}

.upload-label {
  margin: 0 0 10px;
  font-size: 14px;
}

.upload-images {
  display: flex;
  flex-wrap: wrap;
}

:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
  line-height: 80px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}
</style> 