<template>
  <div class="product-detail-container" v-loading="loading">
    <div v-if="product" class="product-detail-wrapper">
      <!-- 商品图片与基本信息 -->
      <div class="product-main">
        <!-- 商品图片展示 -->
        <div class="product-gallery">
          <el-carousel :interval="4000" type="card" height="400px" indicator-position="outside" v-if="product.images && product.images.length > 0">
            <el-carousel-item v-for="(image, index) in product.images" :key="index">
              <el-image 
                :src="image" 
                fit="contain"
                :preview-src-list="product.images"
                :initial-index="index"
                class="carousel-image"
              />
            </el-carousel-item>
          </el-carousel>
          <div v-else class="no-image">
            <el-icon size="48"><Picture /></el-icon>
            <p>暂无图片</p>
          </div>
        </div>
        
        <!-- 商品基本信息 -->
        <div class="product-info">
          <h1 class="product-title">{{ product.title }}</h1>
          
          <div class="product-price-wrapper">
            <span class="product-price">¥{{ formatPrice(product.price) }}</span>
          </div>
          
          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">商品分类：</span>
              <el-tag size="small">{{ product.categoryName }}</el-tag>
            </div>
            <div class="meta-item">
              <span class="meta-label">商品状态：</span>
              <el-tag 
                size="small" 
                :type="getStatusTagType(product.status)"
              >
                {{ product.statusText || getStatusText(product.status) }}
              </el-tag>
            </div>
            <div class="meta-item">
              <span class="meta-label">浏览次数：</span>
              <span class="meta-value">{{ product.viewCount }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">发布时间：</span>
              <span class="meta-value">{{ formatDate(product.createTime) }}</span>
            </div>
          </div>
          
          <!-- 卖家信息 -->
          <div class="seller-info">
            <div class="seller-profile" @click="goToSellerPage(product.userId)">
              <el-avatar :size="40" :src="product.sellerAvatar || defaultAvatar"></el-avatar>
              <div class="seller-detail">
                <span class="seller-name">{{ product.sellerName || product.nickname }}</span>
                <span class="seller-date">注册于 {{ formatDate(product.sellerRegisterTime, 'YYYY-MM-DD') }}</span>
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button 
                :type="product.isFavorite ? 'danger' : 'default'"
                :icon="product.isFavorite ? 'Star' : 'StarFilled'"
                @click="toggleFavorite"
                :loading="favoriteLoading"
              >
                {{ product.isFavorite ? '已收藏' : '收藏' }} ({{ product.favoriteCount || 0 }})
              </el-button>
              
              <el-button type="primary" @click="contactSeller" v-if="product.status === 1">
                <el-icon><ChatDotRound /></el-icon> 联系卖家
              </el-button>
              
              <el-button type="success" @click="buyProduct" v-if="isLoggedIn && product.status === 1 && product.userId !== userId">
                <el-icon><ShoppingCart /></el-icon> 立即购买
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 商品详情和推荐 -->
      <div class="product-content">
        <el-tabs>
          <el-tab-pane label="商品详情">
            <div class="product-description">
              <h3>商品详情</h3>
              <div class="description-content">
                <p v-if="product.description">{{ product.description }}</p>
                <el-empty v-else description="暂无详细描述" />
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="同类商品">
            <div class="similar-products" v-loading="similarLoading">
              <div class="product-grid" v-if="similarProducts.length > 0">
                <product-card 
                  v-for="item in similarProducts" 
                  :key="item.id" 
                  :product="item"
                />
              </div>
              <el-empty v-else description="暂无同类商品推荐" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <el-empty v-else-if="!loading" description="商品不存在或已下架" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { useFileStore } from '@/stores/file'
import { getProductDetail, incrementViewCount } from '@/api/product'
import { 
  Picture, 
  Star, 
  StarFilled, 
  ChatDotRound, 
  ShoppingCart
} from '@element-plus/icons-vue'
import ProductCard from '@/components/product/ProductCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 获取路由信息和 store
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const fileStore = useFileStore()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 商品 ID
const productId = computed(() => Number(route.params.id))

// 状态
const loading = ref(false)
const similarLoading = ref(false)
const favoriteLoading = ref(false)
const product = ref(null)
const similarProducts = ref([])

// 用户状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userId = computed(() => userStore.userId)

// 状态类型映射
const statusTypeMap = {
  1: 'success', // 在售
  2: 'info',    // 已售
  3: 'danger'   // 下架
}

// 格式化价格
const formatPrice = (price) => {
  if (!price && price !== 0) return '--'
  return Number(price).toFixed(2)
}

// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return '--'
  return dayjs(date).format(format)
}

// 获取状态文本
const getStatusText = (status) => {
  return productStore.productStatusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  return statusTypeMap[status] || 'info'
}

// 获取商品详情
const fetchProductDetail = async () => {
  if (!productId.value) return
  
  loading.value = true
  try {
    // 增加浏览次数
    await incrementViewCount(productId.value)
    
    // 获取详情
    const res = await getProductDetail(productId.value)
    if (res.code === 200 && res.data) {
      // 处理商品数据
      product.value = productStore.processProductData(res.data)
      document.title = `${product.value.title} - 二手交易平台`
      
      // 如果用户已登录，检查收藏状态
      if (isLoggedIn.value) {
        checkFavoriteStatus()
      }
      
      // 加载同类商品
      fetchSimilarProducts()
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!isLoggedIn.value || !productId.value) return
  
  try {
    const isFavorite = await favoriteStore.checkIsFavorite(productId.value)
    if (product.value) {
      product.value.isFavorite = isFavorite
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  
  favoriteLoading.value = true
  try {
    const result = await favoriteStore.toggleFavorite(productId.value)
    if (product.value) {
      product.value.isFavorite = !product.value.isFavorite
      // 更新收藏数量
      if (product.value.isFavorite) {
        product.value.favoriteCount = (product.value.favoriteCount || 0) + 1
      } else if (product.value.favoriteCount > 0) {
        product.value.favoriteCount -= 1
      }
    }
  } catch (error) {
    console.error('操作收藏失败:', error)
  } finally {
    favoriteLoading.value = false
  }
}

// 获取同类商品
const fetchSimilarProducts = async () => {
  if (!product.value || !product.value.categoryId) return
  
  similarLoading.value = true
  try {
    const params = {
      page: 1,
      size: 4,
      categoryId: product.value.categoryId,
      status: 1 // 在售状态
    }
    
    const result = await productStore.fetchProductList(params)
    if (result && result.records) {
      // 过滤掉当前商品
      similarProducts.value = result.records.filter(p => p.id !== productId.value)
    }
  } catch (error) {
    console.error('获取同类商品失败:', error)
  } finally {
    similarLoading.value = false
  }
}

// 跳转到卖家主页
const goToSellerPage = (sellerId) => {
  if (!sellerId) return
  router.push(`/seller/${sellerId}`)
}

// 联系卖家
const contactSeller = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  
  if (!product.value || !product.value.userId) return
  
  // 如果是自己的商品
  if (product.value.userId === userId.value) {
    ElMessage.warning('不能给自己发消息')
    return
  }
  
  // 跳转到聊天页面
  router.push(`/user/chat/${product.value.userId}?productId=${productId.value}`)
}

// 购买商品
const buyProduct = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  
  // 确认购买
  ElMessageBox.confirm(
    `确定要购买商品 "${product.value.title}" 吗？`,
    '购买确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 跳转到结算页
      router.push(`/checkout/${productId.value}`)
    })
    .catch(() => {
      // 取消操作
    })
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchProductDetail()
  }
})

// 页面加载时获取商品详情
onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 15px;
}

.product-detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.product-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.product-gallery {
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 8px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #303133;
  line-height: 1.4;
}

.product-price-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.product-price {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b6b;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  width: 90px;
  color: #606266;
}

.meta-value {
  color: #303133;
}

.seller-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.seller-detail {
  display: flex;
  flex-direction: column;
}

.seller-name {
  font-weight: bold;
  color: #303133;
}

.seller-date {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.product-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.product-description {
  padding: 10px 0;
}

.description-content {
  margin-top: 15px;
  white-space: pre-line;
  line-height: 1.6;
  color: #606266;
}

.similar-products {
  padding: 10px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .product-main {
    grid-template-columns: 1fr;
  }
  
  .product-gallery {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .product-gallery {
    height: 280px;
  }
  
  .product-title {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 24px;
  }
}
</style> 