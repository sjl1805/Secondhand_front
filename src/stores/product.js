import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  publishProduct, 
  getProductDetail, 
  getProductList, 
  getUserProducts, 
  updateProductStatus, 
  deleteProduct,
  incrementViewCount as incrementProductView,
  getSellerProducts,
  getProductRatingStatistics
} from '@/api/product'
import { useFileStore } from '@/stores/file'
import { ElMessage } from 'element-plus'
import { useUserStore } from './user'

export const useProductStore = defineStore('product', () => {
  // 引入文件存储
  const fileStore = useFileStore()
  
  // 状态
  const productDetail = ref(null)
  const productList = ref([])
  const userProducts = ref([])
  const loading = ref(false)
  const productPagination = ref({
    current: 1,
    size: 10,
    total: 0
  })
  const userProductPagination = ref({
    current: 1,
    size: 10,
    total: 0
  })
  
  // 商品状态映射
  const productStatusMap = {
    1: '在售',
    2: '已售',
    3: '下架'
  }
  
  // 商品成色映射
  const productQualityMap = {
    1: '全新',
    2: '几乎全新',
    3: '轻微使用痕迹',
    4: '正常使用痕迹',
    5: '明显使用痕迹'
  }
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  
  // 处理商品数据，格式化图片URL等
  const processProductData = (product) => {
    if (!product) return null
    
    // 处理图片URL
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.images = product.imageUrls.map(url => fileStore.getFullUrl(url))
      // 设置封面图
      product.coverImage = product.images[0] || null
    } else {
      product.images = []
      product.coverImage = null
    }
    
    // 处理用户头像
    if (product.avatar) {
      product.sellerAvatar = fileStore.getFullUrl(product.avatar)
    }
    
    // 发布者名称处理，使用昵称代替userId
    if (product.nickname) {
      product.sellerName = product.nickname
    }
    
    // 添加状态文本
    if (product.status && productStatusMap[product.status]) {
      product.statusText = productStatusMap[product.status]
    }
    
    return product
  }
  
  // 处理商品列表数据
  const processProductList = (list) => {
    if (!list || !Array.isArray(list)) return []
    return list.map(item => processProductData(item))
  }
  
  // 发布商品
  const submitProduct = async (productData) => {
    loading.value = true
    try {
      // 确保图片路径格式正确
      if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
        // 只保留路径部分，不需要完整URL
        productData.imageUrls = productData.imageUrls.map(img => {
          // 如果是完整URL，则提取路径部分
          if (typeof img === 'string' && img.startsWith('http')) {
            const url = new URL(img)
            return url.pathname
          }
          return img
        })
      }
      
      const res = await publishProduct(productData)
      if (res.code === 200) {
        ElMessage.success('商品发布成功')
        return res.data // 返回商品ID
      }
    } catch (error) {
      console.error('商品发布失败', error)
      ElMessage.error(error.message || '商品发布失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取商品详情
  const fetchProductDetail = async (productId) => {
    loading.value = true
    try {
      const res = await getProductDetail(productId)
      if (res.code === 200) {
        // 处理商品数据
        productDetail.value = processProductData(res.data)
        return productDetail.value
      }
    } catch (error) {
      console.error('获取商品详情失败', error)
      ElMessage.error('获取商品详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取商品列表
  const fetchProductList = async (params = {}) => {
    loading.value = true
    try {
      // 合并分页参数
      const queryParams = {
        page: productPagination.value.current,
        size: productPagination.value.size,
        ...params
      }
      
      const res = await getProductList(queryParams)
      if (res.code === 200) {
        // 处理商品列表数据
        productList.value = processProductList(res.data.records || [])
        productPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return {
          ...res.data,
          records: productList.value
        }
      }
    } catch (error) {
      console.error('获取商品列表失败', error)
      ElMessage.error('获取商品列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户发布的商品列表
  const fetchUserProducts = async (params = {}) => {
    loading.value = true
    try {
      // 合并分页参数
      const queryParams = {
        page: userProductPagination.value.current,
        size: userProductPagination.value.size,
        ...params
      }
      
      const res = await getUserProducts(queryParams)
      if (res.code === 200) {
        // 处理商品列表数据
        userProducts.value = processProductList(res.data.records || [])
        userProductPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return {
          ...res.data,
          records: userProducts.value
        }
      }
    } catch (error) {
      console.error('获取用户商品失败', error)
      ElMessage.error('获取用户商品失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取指定卖家的商品列表
  const fetchSellerProducts = async (params = {}) => {
    loading.value = true
    try {
      // 确保有userId参数
      if (!params.userId) {
        throw new Error('缺少卖家用户ID')
      }
      
      const res = await getSellerProducts(params)
      if (res.code === 200) {
        // 处理商品列表数据
        const processedProducts = processProductList(res.data.records || [])
        return {
          ...res.data,
          records: processedProducts
        }
      }
    } catch (error) {
      console.error('获取卖家商品失败', error)
      ElMessage.error('获取卖家商品失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 更新商品状态
  const changeProductStatus = async (productId, status) => {
    try {
      const res = await updateProductStatus(productId, status)
      if (res.code === 200) {
        // 更新商品详情
        if (productDetail.value && productDetail.value.id === productId) {
          productDetail.value.status = status
          productDetail.value.statusText = productStatusMap[status]
        }
        
        // 更新商品列表
        updateProductListStatus(productId, status)
        
        ElMessage.success('商品状态已更新')
        return true
      }
    } catch (error) {
      console.error('更新商品状态失败', error)
      ElMessage.error(error.message || '更新商品状态失败')
      return false
    }
  }
  
  // 删除商品
  const removeProduct = async (productId) => {
    try {
      const res = await deleteProduct(productId)
      if (res.code === 200) {
        // 从用户商品列表中移除
        userProducts.value = userProducts.value.filter(p => p.id !== productId)
        
        // 从商品列表中移除
        productList.value = productList.value.filter(p => p.id !== productId)
        
        ElMessage.success('商品已删除')
        return true
      }
    } catch (error) {
      console.error('删除商品失败', error)
      ElMessage.error(error.message || '删除商品失败')
      return false
    }
  }
  
  // 高级搜索商品
  const searchProducts = async (params = {}) => {
    loading.value = true
    try {
      // 导入API中的advancedSearchProducts函数
      const { advancedSearchProducts: searchAPI } = await import('@/api/product')
      
      const res = await searchAPI(params)
      if (res.code === 200) {
        // 处理商品列表数据
        productList.value = processProductList(res.data.records || [])
        productPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return {
          ...res.data,
          records: productList.value
        }
      }
    } catch (error) {
      console.error('高级搜索商品失败', error)
      ElMessage.error(error.message || '高级搜索商品失败')
      return false
    } finally {
      loading.value = false
    }
  }
    
  // 辅助方法：更新商品列表中的状态
  const updateProductListStatus = (productId, status) => {
    // 更新商品列表
    const productIndex = productList.value.findIndex(product => product.id === productId)
    if (productIndex !== -1) {
      productList.value[productIndex].status = status
      productList.value[productIndex].statusText = productStatusMap[status]
    }
    
    // 更新用户商品列表
    const userProductIndex = userProducts.value.findIndex(product => product.id === productId)
    if (userProductIndex !== -1) {
      userProducts.value[userProductIndex].status = status
      userProducts.value[userProductIndex].statusText = productStatusMap[status]
    }
  }
  
  // 切换商品列表页码
  const changeProductPage = (page) => {
    productPagination.value.current = page
    fetchProductList()
  }
  
  // 切换商品每页数量
  const changeProductPageSize = (size) => {
    productPagination.value.size = size
    productPagination.value.current = 1 // 重置到第一页
    fetchProductList()
  }
  
  // 切换用户商品列表页码
  const changeUserProductPage = (page) => {
    userProductPagination.value.current = page
    fetchUserProducts()
  }
  
  // 切换用户商品每页数量
  const changeUserProductPageSize = (size) => {
    userProductPagination.value.size = size
    userProductPagination.value.current = 1 // 重置到第一页
    fetchUserProducts()
  }
  
  // 增加商品浏览次数
  const incrementViewCount = async (productId) => {
    try {
      await incrementProductView(productId)
      return true
    } catch (error) {
      console.error('增加浏览次数失败:', error)
      return false
    }
  }
  
  // 计算属性：按状态分组的用户商品
  const groupedUserProducts = computed(() => {
    const result = {
      1: [], // 在售
      2: [], // 已售
      3: []  // 下架
    }
    
    userProducts.value.forEach(product => {
      if (result[product.status]) {
        result[product.status].push(product)
      }
    })
    
    return result
  })
  
  // 计算属性：各状态商品数量
  const productStatusCounts = computed(() => {
    const counts = {
      1: 0, // 在售
      2: 0, // 已售
      3: 0  // 下架
    }
    
    userProducts.value.forEach(product => {
      if (counts[product.status] !== undefined) {
        counts[product.status]++
      }
    })
    
    return counts
  })
  
  // 获取商品评分统计
  const fetchProductRatingStatistics = async (productId) => {
    try {
      const res = await getProductRatingStatistics(productId)
      if (res.code === 200) {
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取商品评分统计失败', error)
      ElMessage.error('获取商品评分统计失败')
      return null
    }
  }
  
  // 重置状态
  const resetState = () => {
    productDetail.value = null
    productList.value = []
    userProducts.value = []
    productPagination.value = {
      current: 1,
      size: 10,
      total: 0
    }
    userProductPagination.value = {
      current: 1,
      size: 10,
      total: 0
    }
  }
  
  return {
    productDetail,
    productList,
    userProducts,
    loading,
    productPagination,
    userProductPagination,
    productStatusMap,
    productQualityMap,
    groupedUserProducts,
    productStatusCounts,
    submitProduct,
    fetchProductDetail,
    fetchProductList,
    fetchUserProducts,
    fetchSellerProducts,
    changeProductStatus,
    removeProduct,
    changeProductPage,
    changeProductPageSize,
    changeUserProductPage,
    changeUserProductPageSize,
    incrementViewCount,
    fetchProductRatingStatistics,
    resetState,
    advancedSearchProducts: searchProducts,
    processProductData,
    processProductList
  }
})