import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  getAdminProductList, 
  getAdminProductDetail, 
  updateAdminProductStatus, 
  deleteAdminProduct, 
  batchUpdateAdminProductStatus, 
  batchDeleteAdminProduct 
} from '@/api/product'
import { ElMessage } from 'element-plus'

export const useAdminProductStore = defineStore('adminProduct', () => {
  // 状态
  const productList = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const isAdmin = ref(false)
  const pagination = ref({
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
  
  // 商品状态列表，用于选择筛选
  const productStatusOptions = computed(() => {
    return Object.keys(productStatusMap).map(key => ({
      value: parseInt(key),
      label: productStatusMap[key]
    }))
  })
  
  // 设置管理员权限
  const setAdminRole = (isAdminRole) => {
    isAdmin.value = isAdminRole
  }
  
  // 获取商品列表
  const fetchProductList = async (params = {}) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      // 合并分页参数
      const queryParams = {
        page: pagination.value.current,
        size: pagination.value.size,
        ...params
      }
      
      const res = await getAdminProductList(queryParams)
      if (res.code === 200 && res.data) {
        productList.value = res.data.records || []
        pagination.value = {
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
  
  // 获取商品详情
  const fetchProductDetail = async (id) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getAdminProductDetail(id)
      if (res.code === 200) {
        currentProduct.value = res.data
        return res.data
      }
    } catch (error) {
      console.error('获取商品详情失败', error)
      ElMessage.error('获取商品详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 更新商品状态
  const updateProductStatus = async (id, status) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await updateAdminProductStatus(id, status)
      if (res.code === 200) {
        // 更新列表中的商品状态
        const index = productList.value.findIndex(item => item.id === id)
        if (index !== -1) {
          productList.value[index].status = status
          productList.value[index].statusText = productStatusMap[status]
        }
        
        // 如果当前正在查看的商品是这个商品，也更新它的状态
        if (currentProduct.value && currentProduct.value.id === id) {
          currentProduct.value.status = status
          currentProduct.value.statusText = productStatusMap[status]
        }
        
        ElMessage.success('商品状态更新成功')
      }
    } catch (error) {
      console.error('更新商品状态失败', error)
      ElMessage.error('更新商品状态失败')
      throw error
    }
  }
  
  // 删除商品
  const removeProduct = async (id) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await deleteAdminProduct(id)
      if (res.code === 200) {
        // 从列表中删除
        productList.value = productList.value.filter(item => item.id !== id)
        
        // 如果当前正在查看的商品是这个商品，清空它
        if (currentProduct.value && currentProduct.value.id === id) {
          currentProduct.value = null
        }
        
        ElMessage.success('商品删除成功')
      }
    } catch (error) {
      console.error('删除商品失败', error)
      ElMessage.error('删除商品失败')
      throw error
    }
  }
  
  // 批量更新商品状态
  const batchUpdateStatus = async (productIds, status) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await batchUpdateAdminProductStatus(productIds, status)
      if (res.code === 200) {
        // 更新列表中的商品状态
        productList.value = productList.value.map(item => {
          if (productIds.includes(item.id)) {
            return {
              ...item,
              status,
              statusText: productStatusMap[status]
            }
          }
          return item
        })
        
        ElMessage.success(`成功更新${res.data}个商品状态`)
        return res.data
      }
    } catch (error) {
      console.error('批量更新商品状态失败', error)
      ElMessage.error('批量更新商品状态失败')
      throw error
    }
  }
  
  // 批量删除商品
  const batchRemoveProduct = async (productIds) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await batchDeleteAdminProduct(productIds)
      if (res.code === 200) {
        // 从列表中删除
        productList.value = productList.value.filter(item => !productIds.includes(item.id))
        
        // 如果当前正在查看的商品在这些商品中，清空它
        if (currentProduct.value && productIds.includes(currentProduct.value.id)) {
          currentProduct.value = null
        }
        
        ElMessage.success(`成功删除${res.data}个商品`)
        return res.data
      }
    } catch (error) {
      console.error('批量删除商品失败', error)
      ElMessage.error('批量删除商品失败')
      throw error
    }
  }
  
  // 切换页码
  const changePage = (page) => {
    pagination.value.current = page
    fetchProductList()
  }
  
  // 切换每页数量
  const changePageSize = (size) => {
    pagination.value.size = size
    pagination.value.current = 1 // 重置到第一页
    fetchProductList()
  }
  
  // 获取商品状态文本
  const getProductStatusText = (status) => {
    return productStatusMap[status] || '未知状态'
  }
  
  return {
    productList,
    currentProduct,
    loading,
    isAdmin,
    pagination,
    productStatusOptions,
    productStatusMap,
    setAdminRole,
    fetchProductList,
    fetchProductDetail,
    updateProductStatus,
    removeProduct,
    batchUpdateStatus,
    batchRemoveProduct,
    changePage,
    changePageSize,
    getProductStatusText
  }
}) 