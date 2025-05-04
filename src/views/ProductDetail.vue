<template>
  <div v-loading="loading" class="product-detail-container">
    <div v-if="product" class="product-detail-wrapper">
      <!-- 商品图片与基本信息 -->
      <div class="product-main">
        <!-- 商品图片展示 -->
        <div class="product-gallery">
          <el-carousel v-if="product.images && product.images.length > 0" :interval="4000" height="400px" indicator-position="outside"
                       type="card">
            <el-carousel-item v-for="(image, index) in product.images" :key="index">
              <el-image
                  :initial-index="index"
                  :preview-src-list="product.images"
                  :src="image"
                  class="carousel-image"
                  fit="contain"
              />
            </el-carousel-item>
          </el-carousel>
          <div v-else class="no-image">
            <el-icon size="48">
              <Picture/>
            </el-icon>
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
                  :type="getStatusTagType(product.status)"
                  size="small"
              >
                {{ product.statusText || getStatusText(product.status) }}
              </el-tag>
            </div>
            <div class="meta-item">
              <span class="meta-label">商品成色：</span>
              <el-tag size="small" type="success">{{ getConditionText(product.productQuality) }}</el-tag>
            </div>
            <div class="meta-item">
              <span class="meta-label">浏览次数：</span>
              <span class="meta-value">{{ product.viewCount }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">商品评分：</span>
              <span class="meta-value rating-with-stars">
                {{ averageRating.toFixed(1) }}
                <el-rate
                    v-model="averageRating"
                    :colors="['#ffd21e', '#ffd21e', '#ffd21e']"
                    :max="5"
                    :show-score="false"
                    :show-text="false"
                    disabled
                    style="display: inline-flex; margin-left: 5px;"
                />
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">发布时间：</span>
              <span class="meta-value">{{ formatDate(product.createTime) }}</span>
            </div>
          </div>

          <!-- 卖家信息 -->
          <div v-loading="sellerLoading" class="seller-info">
            <div class="seller-profile" @click="goToSellerPage(product.userId)">
              <el-avatar :size="40" :src="product.sellerAvatar || defaultAvatar"></el-avatar>
              <div class="seller-detail">
                <span class="seller-name">{{ product.sellerName || product.nickname }}</span>
                <span class="seller-date">注册于 {{
                    sellerInfo?.createTime ? formatDate(sellerInfo.createTime, 'YYYY-MM-DD') : '--'
                  }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <el-button
                  :icon="product.isFavorite ? 'Star' : 'StarFilled'"
                  :loading="favoriteLoading"
                  :type="product.isFavorite ? 'danger' : 'default'"
                  @click="toggleFavorite"
              >
                {{ product.isFavorite ? '已收藏' : '收藏' }} ({{ product.favoriteCount || 0 }})
              </el-button>

              <el-button v-if="product.status === 1" type="primary" @click="contactSeller">
                <el-icon>
                  <ChatDotRound/>
                </el-icon>
                联系卖家
              </el-button>

              <el-button v-if="isLoggedIn && product.status === 1 && product.userId !== userId" type="success"
                         @click="buyProduct">
                <el-icon>
                  <ShoppingCart/>
                </el-icon>
                立即购买
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
                <el-empty v-else description="暂无详细描述"/>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="评价">
            <!-- 评论列表 -->
            <div v-loading="commentLoading" class="product-comments">
              <h3>用户评价 ({{ commentPagination.total || 0 }})</h3>

              <div v-if="productComments && productComments.length > 0" class="comment-list">
                <div v-for="comment in productComments" :key="comment.id" class="comment-item">
                  <div class="comment-header">
                    <div class="comment-user">
                      <el-avatar :size="40" :src="comment.userAvatar || defaultAvatar"></el-avatar>
                      <div class="comment-user-info">
                        <div class="comment-username">{{ comment.nickname || '匿名用户' }}</div>
                        <div class="comment-time">{{ formatDate(comment.createTime) }}</div>
                      </div>
                    </div>
                    <div class="comment-rating">
                      <el-rate v-model="comment.rating" disabled/>
                    </div>
                  </div>

                  <div class="comment-content">
                    {{ comment.content }}
                  </div>
                </div>

                <!-- 分页 -->
                <div v-if="commentPagination.total > commentPagination.size" class="pagination-container">
                  <el-pagination
                      :current-page="commentPagination.current"
                      :page-size="commentPagination.size"
                      :total="commentPagination.total"
                      background
                      layout="prev, pager, next"
                      @current-change="handleCommentPageChange"
                  />
                </div>
              </div>

              <el-empty v-else description="暂无评价"/>
            </div>
          </el-tab-pane>

          <el-tab-pane label="同类商品">
            <div v-loading="similarLoading" class="similar-products">
              <div v-if="similarProducts.length > 0" class="product-grid">
                <product-card
                    v-for="item in similarProducts"
                    :key="item.id"
                    :product="item"
                />
              </div>
              <el-empty v-else description="暂无同类商品推荐"/>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-empty v-else-if="!loading" description="商品不存在或已下架"/>
  </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useProductStore} from '@/stores/product'
import {useFavoriteStore} from '@/stores/favorite'
import {useUserStore} from '@/stores/user'
import {useFileStore} from '@/stores/file'
import {useCommentStore} from '@/stores/comment'
import {getProductDetail} from '@/api/product'
import {getSellerInfo} from '@/api/user'
import {getProductRating} from '@/api/comment'
import {ChatDotRound, Picture, ShoppingCart} from '@element-plus/icons-vue'
import ProductCard from '@/components/product/ProductCard.vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import dayjs from 'dayjs'

// 获取路由信息和 store
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const fileStore = useFileStore()
const commentStore = useCommentStore()

// 默认图片
const defaultImage = 'http://localhost:8080/api/static/images/products/b2a22df3bee54c04bdba66a51059948a.jpg'
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 商品 ID
const productId = computed(() => Number(route.params.id))

// 状态
const loading = ref(false)
const similarLoading = ref(false)
const favoriteLoading = ref(false)
const sellerLoading = ref(false)
const product = ref(null)
const similarProducts = ref([])
const sellerInfo = ref(null)

// 用户状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userId = computed(() => userStore.userId)

// 评分相关
const averageRating = ref(0)
const ratingLoading = ref(false)
const ratingStats = ref(null)

// 评论相关
const commentLoading = ref(false)
const productComments = ref([])
const commentPagination = ref({
  current: 1,
  size: 5,
  total: 0
})

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

// 获取商品成色文本
const getConditionText = (productQuality) => {
  return productStore.productQualityMap[productQuality] || '未知'
}

// 获取商品平均评分
const fetchAverageRating = async () => {
  if (!productId.value) return

  try {
    const res = await getProductRating(productId.value)
    if (res.code === 200) {
      averageRating.value = res.data || 0
    }
  } catch (error) {
    console.error('获取商品平均评分失败:', error)
  }
}

// 获取商品详情
const fetchProductDetail = async () => {
  if (!productId.value) return

  loading.value = true
  try {
    // 获取详情
    const res = await getProductDetail(productId.value)
    if (res.code === 200 && res.data) {
      // 处理商品数据
      product.value = productStore.processProductData(res.data)

      // 确保productQuality字段存在（向后兼容）
      if (product.value && !product.value.productQuality && product.value.conditions) {
        product.value.productQuality = product.value.conditions
      }

      document.title = `${product.value.title} - 二手交易平台`

      // 如果用户已登录，检查收藏状态
      if (isLoggedIn.value) {
        checkFavoriteStatus()
      }

      // 获取卖家信息
      if (product.value.userId) {
        fetchSellerInfo(product.value.userId)
      }

      // 加载同类商品
      fetchSimilarProducts()

      // 获取商品评分统计
      fetchProductRating()

      // 获取商品平均评分
      fetchAverageRating()

      // 获取商品评论列表
      fetchProductComments()
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
    router.push({path: '/login', query: {redirect: route.fullPath}})
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
      // 处理商品数据并过滤当前商品（确保完整处理）
      similarProducts.value = result.records
          .filter(p => p.id !== productId.value)
          .map(p => {
            const processed = productStore.processProductData(p)

            // 确保图片数据存在
            if (!processed.images && processed.imageUrls) {
              processed.images = processed.imageUrls.map(url => fileStore.getFullUrl(url))
            } else if (!processed.images) {
              processed.images = []
            }

            // 确保封面图片存在
            if (!processed.coverImage && processed.images && processed.images.length > 0) {
              processed.coverImage = processed.images[0]
            } else if (!processed.coverImage) {
              processed.coverImage = defaultImage
            }

            // 确保卖家头像存在
            if (processed.avatar && !processed.sellerAvatar) {
              processed.sellerAvatar = fileStore.getFullUrl(processed.avatar)
            }

            // 确保productQuality字段存在（向后兼容）
            if (!processed.productQuality && processed.conditions) {
              processed.productQuality = processed.conditions
            }

            console.log('处理后的同类商品:', processed)
            return processed
          })
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
    router.push({path: '/login', query: {redirect: route.fullPath}})
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
    router.push({path: '/login', query: {redirect: route.fullPath}})
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

// 获取卖家信息
const fetchSellerInfo = async (sellerId) => {
  if (!sellerId) return

  sellerLoading.value = true
  try {
    const res = await getSellerInfo(sellerId)
    if (res.code === 200 && res.data) {
      sellerInfo.value = res.data

      // 处理注册时间格式
      if (sellerInfo.value.createTime) {
        sellerInfo.value.registerTime = sellerInfo.value.createTime
      }

      // 如果商品数据中没有卖家头像，使用卖家信息中的头像
      if (product.value && !product.value.sellerAvatar && sellerInfo.value.avatar) {
        product.value.sellerAvatar = fileStore.getFullUrl(sellerInfo.value.avatar)
      }
      console.log('获取到卖家信息:', sellerInfo.value)
    }
  } catch (error) {
    console.error('获取卖家信息失败:', error)
  } finally {
    sellerLoading.value = false
  }
}

// 获取商品评分统计
const fetchProductRating = async () => {
  if (!productId.value) return

  ratingLoading.value = true
  try {
    const data = await productStore.fetchProductRatingStatistics(productId.value)
    if (data) {
      ratingStats.value = data
    }
  } catch (error) {
    console.error('获取商品评分统计失败:', error)
  } finally {
    ratingLoading.value = false
  }
}

// 计算评分百分比
const calculateRatingPercentage = (rating) => {
  if (!ratingStats.value) return 0

  const totalCount = Object.values(ratingStats.value).reduce((sum, val) => sum + Number(val), 0)
  if (totalCount === 0) return 0

  const ratingCount = Number(ratingStats.value[rating] || 0)
  return Math.round((ratingCount / totalCount) * 100)
}

// 获取评分对应的颜色
const getRatingColor = (rating) => {
  const colors = {
    5: '#ff9900',
    4: '#67c23a',
    3: '#409eff',
    2: '#e6a23c',
    1: '#f56c6c'
  }
  return colors[rating] || '#909399'
}

// 获取商品评论
const fetchProductComments = async () => {
  if (!productId.value) return

  commentLoading.value = true
  try {
    const params = {
      page: commentPagination.value.current,
      size: commentPagination.value.size
    }

    const result = await commentStore.fetchProductComments(productId.value, params)
    if (result) {
      // 处理评论数据，确保头像URL正确
      productComments.value = result.records.map(comment => {
        // 处理用户头像路径
        if (comment.avatar && !comment.userAvatar) {
          comment.userAvatar = fileStore.getFullUrl(comment.avatar)
        }
        return comment
      })

      commentPagination.value = {
        current: result.current,
        size: result.size,
        total: result.total
      }
    }
  } catch (error) {
    console.error('获取商品评论失败:', error)
  } finally {
    commentLoading.value = false
  }
}

// 切换评论分页
const handleCommentPageChange = (page) => {
  commentPagination.value.current = page
  fetchProductComments()
}

// 监听路由变化
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
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

.product-rating {
  padding: 20px 0;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.rating-number {
  font-size: 48px;
  font-weight: bold;
  color: #ff9900;
  line-height: 1;
}

.rating-stars {
  margin-top: 10px;
}

.rating-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.rating-stats {
  margin-top: 20px;
}

.rating-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.rating-overview {
  display: flex;
  gap: 40px;
  align-items: center;
}

.rating-progress {
  flex: 1;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating-count {
  width: 40px;
  margin-left: 10px;
  text-align: left;
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

/* 评论样式 */
.product-comments {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 20px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-user-info {
  display: flex;
  flex-direction: column;
}

.comment-username {
  font-weight: bold;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
}

.pagination-container {
  display: flex;
  justify-content: center;
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

  .rating-overview {
    flex-direction: column;
    gap: 20px;
  }

  .rating-average {
    min-width: auto;
  }

  .comment-header {
    flex-direction: column;
    gap: 10px;
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

.rating-with-stars {
  display: flex;
  align-items: center;
}
</style>
