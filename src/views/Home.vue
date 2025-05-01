<template>
  <div class="home-container">
    
    <!-- 推荐商品 -->
    <div class="recommend-section container" v-if="isLoggedIn">
      <div class="section-header">
        <h2 class="section-title">为您推荐</h2>
        <el-button 
          type="primary" 
          plain 
          size="small" 
          @click="refreshRecommendations"
          :loading="refreshing"
        >
          <el-icon><Refresh /></el-icon> 刷新推荐
        </el-button>
      </div>
      
      <el-skeleton v-if="recommendLoading" animated :count="4">
        <template #template>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div v-for="i in 4" :key="i" style="width: calc(25% - 15px);">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
              <div style="padding: 10px;">
                <el-skeleton-item variant="p" style="width: 80%; height: 20px;" />
                <el-skeleton-item variant="text" style="width: 60%; margin-top: 10px;" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      
      <div v-else class="product-grid">
        <product-card
          v-for="product in userBasedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <el-empty v-if="!recommendLoading && userBasedProducts.length === 0" description="暂无推荐商品" />
    </div>
    
    <!-- 新品上架 -->
    <div class="new-products-section container">
      <div class="section-header">
        <h2 class="section-title">新品上架</h2>
        <router-link to="/products" class="view-more">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
      
      <el-skeleton v-if="loading" animated :count="4">
        <template #template>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div v-for="i in 4" :key="i" style="width: calc(25% - 15px);">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
              <div style="padding: 10px;">
                <el-skeleton-item variant="p" style="width: 80%; height: 20px;" />
                <el-skeleton-item variant="text" style="width: 60%; margin-top: 10px;" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      
      <div v-else class="product-grid">
        <product-card
          v-for="product in newProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
    
    <!-- 热门商品 -->
    <div class="popular-section container">
      <div class="section-header">
        <h2 class="section-title">热门商品</h2>
        <router-link to="/products?sort=viewCount" class="view-more">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </router-link>
      </div>
      
      <el-skeleton v-if="loading" animated :count="4">
        <template #template>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div v-for="i in 4" :key="i" style="width: calc(25% - 15px);">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
              <div style="padding: 10px;">
                <el-skeleton-item variant="p" style="width: 80%; height: 20px;" />
                <el-skeleton-item variant="text" style="width: 60%; margin-top: 10px;" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
      
      <div v-else class="product-grid">
        <product-card
          v-for="product in popularProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useRecommendationStore } from '@/stores/recommendation'
import { useUserStore } from '@/stores/user'
import { useFileStore } from '@/stores/file'
import ProductCard from '@/components/product/ProductCard.vue'
import { ArrowRight, Refresh } from '@element-plus/icons-vue'

// Store
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const recommendationStore = useRecommendationStore()
const userStore = useUserStore()
const fileStore = useFileStore()

// 用户状态
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 商品列表
const newProducts = ref([])
const popularProducts = ref([])
const categoryProducts = ref({})

// 分类相关
const topCategories = computed(() => categoryStore.topCategories)
const displayCategories = ref([])

// 加载状态
const loading = computed(() => productStore.loading)
const recommendLoading = computed(() => recommendationStore.loading)
const refreshing = computed(() => recommendationStore.refreshing)

// 用户推荐商品
const userBasedProducts = computed(() => recommendationStore.userBasedProducts)

// 轮播图数据
const banners = ref([
  {
    title: '二手图书特卖',
    description: '各类学习资料、文学书籍低至五折',
    buttonText: '立即查看',
    link: '/category/3',
    image: fileStore.getFullUrl('/images/products/banner-books.jpg')
  },
  {
    title: '数码产品',
    description: '精选二手数码设备，品质保障',
    buttonText: '查看详情',
    link: '/category/1',
    image: fileStore.getFullUrl('/images/products/banner-digital.jpg')
  },
  {
    title: '服装鞋帽',
    description: '潮流服装、经典款式，总有你喜欢的',
    buttonText: '浏览商品',
    link: '/category/2',
    image: fileStore.getFullUrl('/images/products/banner-clothing.jpg')
  }
])

// 刷新推荐
const refreshRecommendations = async () => {
  await recommendationStore.refreshUserRecommendations()
}

// 获取新品上架
const fetchNewProducts = async () => {
  const params = {
    page: 1,
    size: 8,
    sort: 'createTime,desc',
    status: 1 // 在售状态
  }
  
  const result = await productStore.fetchProductList(params)
  if (result && result.records) {
    newProducts.value = result.records
  }
}

// 获取热门商品
const fetchPopularProducts = async () => {
  const params = {
    page: 1,
    size: 8,
    sort: 'viewCount,desc',
    status: 1 // 在售状态
  }
  
  const result = await productStore.fetchProductList(params)
  if (result && result.records) {
    popularProducts.value = result.records
  }
}

// 获取分类数据并选择部分展示
const initCategoryDisplay = async () => {
  // 如果没有分类数据，先获取
  if (topCategories.value.length === 0) {
    await categoryStore.fetchCategoryTree()
  }
  
  // 从顶级分类中选择部分进行展示
  if (topCategories.value.length > 0) {
    // 最多显示3个分类
    displayCategories.value = topCategories.value.slice(0, 3)
    
    // 获取每个展示分类的商品
    for (const category of displayCategories.value) {
      fetchCategoryProducts(category.id)
    }
  }
}

// 获取分类商品
const fetchCategoryProducts = async (categoryId) => {
  const params = {
    page: 1,
    size: 4,
    categoryId,
    status: 1 // 在售状态
  }
  
  const result = await productStore.fetchProductList(params)
  if (result && result.records) {
    categoryProducts.value = {
      ...categoryProducts.value,
      [categoryId]: result.records
    }
  }
}

// 页面加载时初始化数据
onMounted(async () => {
  // 并行加载数据
  await Promise.all([
    fetchNewProducts(),
    fetchPopularProducts(),
    initCategoryDisplay()
  ])
  
  // 如果用户已登录，获取推荐
  if (isLoggedIn.value) {
    const recommendations = await recommendationStore.fetchUserBasedRecommendations()
    // 确保推荐商品数据已处理
    if (recommendations && Array.isArray(recommendations)) {
      recommendations.forEach(product => {
        productStore.processProductData(product)
      })
    }
  }
})
</script>

<style scoped>
.home-container {
  padding-bottom: 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 40px;
}

.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 40px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.banner-content {
  max-width: 500px;
}

.banner-content h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.banner-content p {
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
}

/* 分类导航样式 */
.category-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #409EFF;
  border-radius: 2px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 20px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
}

.category-name {
  margin-top: 10px;
  font-size: 14px;
}

/* 商品部分通用样式 */
.recommend-section,
.new-products-section,
.popular-section,
.category-products-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-more {
  display: flex;
  align-items: center;
  color: #409EFF;
  font-size: 14px;
  text-decoration: none;
}

.view-more .el-icon {
  margin-left: 5px;
  transition: transform 0.3s;
}

.view-more:hover .el-icon {
  transform: translateX(3px);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-content h2 {
    font-size: 22px;
  }
  
  .banner-content p {
    font-size: 14px;
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 480px) {
  .banner-content {
    text-align: center;
    max-width: 100%;
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 