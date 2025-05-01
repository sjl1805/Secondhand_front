<template>
  <div class="seller-profile">
    <div class="seller-header" v-loading="loading">
      <div class="seller-info">
        <el-avatar 
          :size="80" 
          :src="sellerAvatar" 
          class="seller-avatar"
        >
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="seller-detail">
          <h1 class="seller-name">{{ sellerName }}</h1>
          <p class="seller-bio">{{ sellerBio || '这个卖家很懒，还没有填写个人简介' }}</p>
          <div class="seller-stats">
            <div class="stat-item">
              <span class="stat-value">{{ productsCount }}</span>
              <span class="stat-label">在售商品</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ soldCount }}</span>
              <span class="stat-label">已售商品</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleContact" :disabled="isCurrentUser">
          <el-icon><ChatDotRound /></el-icon>
          联系卖家
        </el-button>
      </div>
    </div>
    
    <el-divider />
    
    <div class="seller-products">
      <h2 class="section-title">{{ sellerName }}的商品</h2>
      
      <div v-loading="productsLoading">
        <div v-if="products.length > 0" class="product-grid">
          <product-card 
            v-for="product in products" 
            :key="product.id" 
            :product="product"
          />
        </div>
        <el-empty v-else-if="!productsLoading" description="暂无商品" />
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { getSellerInfo } from '@/api/user'
import { ElMessage } from 'element-plus'
import { User, ChatDotRound } from '@element-plus/icons-vue'
import ProductCard from '@/components/product/ProductCard.vue'
import { useFileStore } from '@/stores/file'

// 路由和存储
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()
const fileStore = useFileStore()

// 卖家ID
const sellerId = computed(() => {
  return Number(route.params.id) || null
})

// 判断是否是当前用户
const isCurrentUser = computed(() => {
  return userStore.userId && userStore.userId === sellerId.value
})

// 卖家信息
const sellerName = ref('')
const sellerAvatar = ref('')
const sellerBio = ref('')
const loading = ref(false)

// 商品列表
const products = ref([])
const productsLoading = ref(false)
const productsCount = ref(0)
const soldCount = ref(0)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 获取卖家信息
const fetchSellerInfo = async () => {
  if (!sellerId.value) return
  
  loading.value = true
  try {
    const res = await getSellerInfo(sellerId.value)
    if (res.code === 200 && res.data) {
      const seller = res.data
      sellerName.value = seller.nickname || seller.username || '未知用户'
      sellerBio.value = seller.bio || ''
      
      // 处理头像
      if (seller.avatar) {
        sellerAvatar.value = fileStore.getFullUrl(seller.avatar)
      }
      
      // 设置页面标题
      document.title = `${sellerName.value}的店铺 - 二手交易平台`
    }
  } catch (error) {
    console.error('获取卖家信息失败:', error)
    ElMessage.error('获取卖家信息失败')
  } finally {
    loading.value = false
  }
}

// 获取卖家商品统计
const fetchSellerProductsStats = async () => {
  if (!sellerId.value) return
  
  try {
    // 获取在售商品数量
    const onSaleParams = {
      userId: sellerId.value,
      status: 1, // 在售状态
      page: 1,
      size: 1 // 只需要获取统计数据，不需要实际记录
    }
    const onSaleRes = await productStore.fetchSellerProducts(onSaleParams)
    if (onSaleRes) {
      productsCount.value = onSaleRes.total || 0
    }
    
    // 获取已售商品数量
    const soldParams = {
      userId: sellerId.value,
      status: 2, // 已售状态
      page: 1,
      size: 1 // 只需要获取统计数据，不需要实际记录
    }
    const soldRes = await productStore.fetchSellerProducts(soldParams)
    if (soldRes) {
      soldCount.value = soldRes.total || 0
    }
  } catch (error) {
    console.error('获取卖家商品统计失败:', error)
  }
}

// 获取卖家商品
const fetchSellerProducts = async () => {
  if (!sellerId.value) return
  
  productsLoading.value = true
  try {
    const params = {
      userId: sellerId.value,
      page: currentPage.value,
      size: pageSize.value,
      status: 1 // 只显示在售商品
    }
    
    const res = await productStore.fetchSellerProducts(params)
    if (res) {
      products.value = res.records || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('获取卖家商品失败:', error)
    ElMessage.error('获取卖家商品失败')
  } finally {
    productsLoading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchSellerProducts()
}

// 联系卖家
const handleContact = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  // 跳转到聊天页面
  router.push(`/chat/${sellerId.value}`)
}

// 页面加载时
onMounted(() => {
  // 验证是否有卖家ID
  if (!sellerId.value) {
    ElMessage.error('卖家信息不存在')
    router.push('/')
    return
  }
  
  // 获取卖家信息
  fetchSellerInfo()
  
  // 获取卖家商品统计
  fetchSellerProductsStats()
  
  // 获取卖家商品
  fetchSellerProducts()
})
</script>

<style scoped>
.seller-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 15px;
}

.seller-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.seller-info {
  display: flex;
  align-items: center;
}

.seller-avatar {
  margin-right: 20px;
  border: 2px solid #f0f2f5;
}

.seller-name {
  font-size: 24px;
  margin: 0 0 5px 0;
}

.seller-bio {
  color: #606266;
  margin: 0 0 10px 0;
  max-width: 500px;
}

.seller-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.section-title {
  font-size: 20px;
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .seller-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    margin-top: 20px;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style> 