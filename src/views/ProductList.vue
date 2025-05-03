<template>
  <div class="product-list-container">
    <!-- 非搜索结果页面时显示面包屑 -->
    <el-breadcrumb class="breadcrumb" v-if="!isSearchResult">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="categoryId">{{ categoryName || '分类商品' }}</el-breadcrumb-item>
      <el-breadcrumb-item v-else>全部商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 非搜索结果页面时显示标题 -->
    <div class="product-list-header" v-if="!isSearchResult">
      <h1 class="page-title">{{ categoryName || (categoryId ? '分类商品' : '全部商品') }}</h1>
      
      <div class="filter-toolbar">
        <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryChange">
          <el-option label="全部分类" value="" />
          <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
        </el-select>
      
        <el-select v-model="sortOrder" placeholder="排序方式" @change="handleSortChange">
          <el-option label="最新发布" value="createTime,desc" />
          <el-option label="价格从低到高" value="price,asc" />
          <el-option label="价格从高到低" value="price,desc" />
          <el-option label="浏览量最高" value="viewCount,desc" />
        </el-select>
        
        <el-select v-model="priceRange" placeholder="价格区间" @change="handlePriceChange">
          <el-option label="全部价格" value="" />
          <el-option label="0-100元" value="0,100" />
          <el-option label="100-500元" value="100,500" />
          <el-option label="500-1000元" value="500,1000" />
          <el-option label="1000-5000元" value="1000,5000" />
          <el-option label="5000元以上" value="5000," />
        </el-select>
      </div>
    </div>

    <!-- 搜索结果页面时也显示筛选工具 -->
    <div class="filter-toolbar-search" v-if="isSearchResult">
      <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryChange">
        <el-option label="全部分类" value="" />
        <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
      </el-select>
    
      <el-select v-model="sortOrder" placeholder="排序方式" @change="handleSortChange">
        <el-option label="最新发布" value="createTime,desc" />
        <el-option label="价格从低到高" value="price,asc" />
        <el-option label="价格从高到低" value="price,desc" />
        <el-option label="浏览量最高" value="viewCount,desc" />
      </el-select>
      
      <el-select v-model="priceRange" placeholder="价格区间" @change="handlePriceChange">
        <el-option label="全部价格" value="" />
        <el-option label="0-100元" value="0,100" />
        <el-option label="100-500元" value="100,500" />
        <el-option label="500-1000元" value="500,1000" />
        <el-option label="1000-5000元" value="1000,5000" />
        <el-option label="5000元以上" value="5000," />
      </el-select>
    </div>

    <div class="product-list-body" v-loading="loading">
      <!-- 商品列表 -->
      <div v-if="products.length > 0" class="product-grid">
        <product-card 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
        />
      </div>
      
      <!-- 空状态 -->
      <el-empty v-else-if="!loading" description="暂无商品" />
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[12, 24, 36, 48]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import ProductCard from '@/components/product/ProductCard.vue'
import { ElMessage } from 'element-plus'

// 定义props
const props = defineProps({
  isSearchResult: {
    type: Boolean,
    default: false
  }
})

// 获取路由信息和 store
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

// 分类ID
const categoryId = computed(() => {
  // 如果是分类页面，从路径获取分类ID
  if (route.name === 'CategoryProducts' && route.params.id) {
    return Number(route.params.id)
  }
  // 如果是商品列表页面，从查询参数获取
  return route.query.categoryId ? Number(route.query.categoryId) : null
})

// 搜索关键词
const keyword = computed(() => route.query.keyword || '')

// 分类名称
const categoryName = ref('')

// 排序方式
const sortOrder = ref('createTime,desc')
// 价格区间
const priceRange = ref('')
// 价格筛选
const minPrice = ref(null)
const maxPrice = ref(null)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 商品列表
const products = ref([])
const loading = ref(false)

// 选中的分类
const selectedCategory = ref('')

// 分类列表
const categories = ref([])

// 获取分类名称
const fetchCategoryName = async () => {
  if (!categoryId.value) return
  
  try {
    const category = await categoryStore.getCategoryById(categoryId.value)
    if (category) {
      categoryName.value = category.name
      if (!props.isSearchResult) {
        document.title = `${category.name} - 二手交易平台`
      }
    }
  } catch (error) {
    console.error('获取分类信息失败:', error)
  }
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      status: 1 // 只显示在售商品
    }
    
    // 添加分类ID
    if (categoryId.value) {
      params.categoryId = categoryId.value
    }
    
    // 添加关键词
    if (keyword.value) {
      params.keyword = keyword.value
    }
    
    // 添加排序
    if (sortOrder.value) {
      const [field, order] = sortOrder.value.split(',')
      params.sortField = field
      params.sortOrder = order
    }
    
    // 添加价格区间
    if (minPrice.value !== null) {
      params.minPrice = minPrice.value
    }
    if (maxPrice.value !== null) {
      params.maxPrice = maxPrice.value
    }
    
    // 发起请求
    const result = await productStore.fetchProductList(params)
    if (result) {
      products.value = result.records || []
      total.value = result.total || 0
      
      // 更新URL参数
      updateUrlParams()
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  fetchProducts()
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1 // 重置到第一页
  fetchProducts()
}

// 处理价格区间变化
const handlePriceChange = () => {
  if (!priceRange.value) {
    // 全部价格
    minPrice.value = null
    maxPrice.value = null
  } else {
    // 解析价格范围
    const [min, max] = priceRange.value.split(',')
    minPrice.value = min ? Number(min) : null
    maxPrice.value = max ? Number(max) : null
  }
  
  currentPage.value = 1 // 重置到第一页
  fetchProducts()
}

// 更新URL查询参数
const updateUrlParams = () => {
  const query = { ...route.query }
  
  // 更新分页参数
  query.page = currentPage.value
  query.size = pageSize.value
  
  // 更新排序参数
  if (sortOrder.value) {
    query.sort = sortOrder.value
  } else {
    delete query.sort
  }
  
  // 更新价格参数
  if (minPrice.value !== null) {
    query.minPrice = minPrice.value
  } else {
    delete query.minPrice
  }
  
  if (maxPrice.value !== null) {
    query.maxPrice = maxPrice.value
  } else {
    delete query.maxPrice
  }
  
  // 更新路由
  router.push({
    path: route.path,
    query
  })
}

// 从URL参数恢复筛选条件
const restoreFiltersFromUrl = () => {
  // 恢复页码
  if (route.query.page) {
    currentPage.value = Number(route.query.page)
  }
  
  // 恢复每页数量
  if (route.query.size) {
    pageSize.value = Number(route.query.size)
  }
  
  // 恢复排序
  if (route.query.sort) {
    sortOrder.value = route.query.sort
  }
  
  // 恢复价格区间
  if (route.query.minPrice || route.query.maxPrice) {
    const min = route.query.minPrice || ''
    const max = route.query.maxPrice || ''
    priceRange.value = `${min},${max}`
    minPrice.value = min ? Number(min) : null
    maxPrice.value = max ? Number(max) : null
  }
  
  // 恢复分类ID
  if (route.query.categoryId) {
    selectedCategory.value = Number(route.query.categoryId)
  }
}

// 获取所有分类
const fetchCategories = async () => {
  try {
    await categoryStore.fetchAllCategories()
    categories.value = categoryStore.categories
    
    // 如果当前有分类ID，则设置选中状态
    if (categoryId.value) {
      selectedCategory.value = categoryId.value
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 处理分类变化
const handleCategoryChange = () => {
  currentPage.value = 1 // 重置到第一页
  
  // 更新URL中的分类参数
  if (selectedCategory.value) {
    router.push({
      query: {
        ...route.query,
        categoryId: selectedCategory.value
      }
    })
  } else {
    // 如果选择了"全部分类"，则移除分类参数
    const query = { ...route.query }
    delete query.categoryId
    router.push({ query })
  }
  
  // 获取商品数据
  fetchProducts()
}

// 监听路由变化
watch(
  () => [route.params.id, route.query.categoryId, route.query.keyword],
  () => {
    // 重置页码
    currentPage.value = 1
    
    // 从URL同步分类ID
    if (route.query.categoryId) {
      selectedCategory.value = Number(route.query.categoryId)
    } else if (route.name === 'CategoryProducts' && route.params.id) {
      selectedCategory.value = Number(route.params.id)
    } else {
      selectedCategory.value = ''
    }
    
    // 获取分类名称
    fetchCategoryName()
    // 获取商品
    fetchProducts()
  },
  { immediate: true }
)

// 页面加载时
onMounted(() => {
  // 获取所有分类
  fetchCategories()
  
  // 从URL恢复筛选条件
  restoreFiltersFromUrl()
  // 获取分类名称
  fetchCategoryName()
  // 获取商品
  fetchProducts()
  
  // 设置页面标题（非搜索结果页面）
  if (!props.isSearchResult) {
    document.title = categoryId.value 
      ? `${categoryName.value || '分类商品'} - 二手交易平台` 
      : '全部商品 - 二手交易平台'
  }
})
</script>

<style scoped>
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 15px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.filter-toolbar, .filter-toolbar-search {
  display: flex;
  gap: 15px;
}

.filter-toolbar-search {
  margin-bottom: 20px;
}

.product-list-body {
  min-height: 300px;
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
  .product-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filter-toolbar, .filter-toolbar-search {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style> 