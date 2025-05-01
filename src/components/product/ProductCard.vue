<template>
  <div class="product-card" @click="navigateToDetail">
    <div class="product-image">
      <el-image 
        :src="product.coverImage || defaultImage" 
        fit="cover"
        lazy
        :preview-src-list="product.images || []"
        :initial-index="0"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
      <div class="product-price">￥{{ formatPrice(product.price) }}</div>
      <div v-if="product.originalPrice" class="original-price">￥{{ formatPrice(product.originalPrice) }}</div>
    </div>
    <div class="product-info">
      <h3 class="product-title">{{ product.title }}</h3>
      <div class="product-meta">
        <span class="product-condition">{{ getConditionText(product.condition) }}</span>
        <span class="product-views">
          <el-icon><View /></el-icon> {{ formatNumber(product.viewCount || 0) }}
        </span>
      </div>
      <div class="seller-info">
        <el-avatar :size="20" :src="product.sellerAvatar || defaultAvatar"></el-avatar>
        <span class="seller-name">{{ product.sellerName || product.nickname }}</span>
        <span class="publish-time">{{ formatTime(product.createTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useFileStore } from '@/stores/file'
import { Picture, View } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 路由实例
const router = useRouter()

// 商品Store
const productStore = useProductStore()
const fileStore = useFileStore()

// 接收商品数据
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// 默认图片
const defaultImage = 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 确保商品数据已处理
const ensureProductProcessed = () => {
  try {
    if (!props.product) return
    
    // 检查图片数据是否已处理
    if (!props.product.coverImage && props.product.imageUrls) {
      productStore.processProductData(props.product)
    }
    
    // 检查直接的 JSON 情况，images 属性已存在但可能格式不正确
    if (props.product.images && typeof props.product.images === 'string') {
      try {
        props.product.images = JSON.parse(props.product.images)
      } catch (e) {
        // 如果不能解析为数组，则设置为空数组
        props.product.images = []
      }
    }
    
    // 确保 viewCount 有效
    if (props.product.viewCount === undefined || props.product.viewCount === null) {
      props.product.viewCount = 0
    }
    
    // 确保 condition 有效
    if (props.product.condition === undefined || props.product.condition === null) {
      props.product.condition = 1 // 默认为全新
    }
  } catch (error) {
    console.error('处理商品数据时出错:', error)
  }
}

// 监视商品数据变化
watch(() => props.product, () => {
  ensureProductProcessed()
}, { immediate: true, deep: true })

// 在组件挂载后处理当前商品数据
onMounted(() => {
  ensureProductProcessed()
})

// 格式化价格
const formatPrice = (price) => {
  if (!price && price !== 0) return '--'
  return Number(price).toFixed(2)
}

// 格式化数字（上千显示k）
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

// 获取商品成色文本
const getConditionText = (condition) => {
  return productStore.conditionMap[condition] || '未知'
}

// 格式化时间为相对时间
const formatTime = (time) => {
  if (!time) return ''
  return dayjs(time).fromNow()
}

// 导航到商品详情页
const navigateToDetail = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
}

.product-card:hover .el-image {
  transform: scale(1.05);
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  background-color: #f5f7fa;
}

.image-error .el-icon {
  font-size: 30px;
  margin-bottom: 10px;
}

.product-price {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(64, 158, 255, 0.9);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
}

.original-price {
  position: absolute;
  bottom: 10px;
  left: 80px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-decoration: line-through;
  opacity: 0.7;
}

.product-info {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 14px;
  margin: 0 0 8px;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.product-condition {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 0 6px;
  border-radius: 2px;
}

.product-views {
  display: flex;
  align-items: center;
}

.product-views .el-icon {
  margin-right: 2px;
  font-size: 14px;
}

.seller-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-top: auto;
}

.seller-name {
  margin: 0 4px 0 6px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publish-time {
  margin-left: auto;
}
</style> 