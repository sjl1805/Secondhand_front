import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  publishProduct, 
  getProductDetail, 
  getProductList, 
  getUserProducts, 
  updateProductStatus, 
  deleteProduct 
} from '@/api/product'
import { ElMessage } from 'element-plus'

export const useProductStore = defineStore('product', () => {
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
  const conditionMap = {
    1: '全新',
    2: '几乎全新',
    3: '轻微使用痕迹',
    4: '正常使用痕迹',
    5: '明显使用痕迹'
  }
  
  // 发布商品
  const submitProduct = async (productData) => {
    loading.value = true
    try {
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
        productDetail.value = res.data
        return res.data
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
        productList.value = res.data.records || []
        productPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return res.data
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
        userProducts.value = res.data.records || []
        userProductPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return res.data
      }
    } catch (error) {
      console.error('获取用户商品失败', error)
      ElMessage.error('获取用户商品失败')
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
  const advancedSearchProducts = async (params = {}) => {
    try {
      const res = await advancedSearchProducts(params)
      if (res.code === 200) {
        productList.value = res.data.records || []
        productPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
      }
    } catch (error) {
      console.error('高级搜索商品失败', error)
      ElMessage.error(error.message || '高级搜索商品失败')
      return false
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
    conditionMap,
    groupedUserProducts,
    productStatusCounts,
    submitProduct,
    fetchProductDetail,
    fetchProductList,
    fetchUserProducts,
    changeProductStatus,
    removeProduct,
    changeProductPage,
    changeProductPageSize,
    changeUserProductPage,
    changeUserProductPageSize,
    resetState,
    advancedSearchProducts
  }
})