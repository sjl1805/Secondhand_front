import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  getBasicStatistics,
  getUserRegisterStatistics,
  getOrderStatistics,
  getTransactionStatistics,
  getCategoryProductStatistics,
  getUserActivityStatistics,
  getProductStatusStatistics,
  getOrderStatusStatistics,
  getPlatformIncome,
  getHotProductsStatistics,
  getActiveSellersStatistics,
  getActiveBuyersStatistics,
  getProductRatingStatistics
} from '@/api/statistics'
import { ElMessage } from 'element-plus'

export const useStatisticsStore = defineStore('statistics', () => {
  // 状态
  const loading = ref(false)
  const isAdmin = ref(false)
  
  // 基本统计数据
  const basicStats = reactive({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayNewUsers: 0,
    todayNewProducts: 0,
    todayNewOrders: 0,
    todayRevenue: 0
  })
  
  // 时间单位选项
  const timeUnitOptions = [
    { value: 'day', label: '按天' },
    { value: 'week', label: '按周' },
    { value: 'month', label: '按月' }
  ]
  
  // 用户注册统计
  const userRegisterStats = ref([])
  
  // 订单统计
  const orderStats = ref([])
  
  // 交易额统计
  const transactionStats = ref([])
  
  // 分类商品统计
  const categoryProductStats = ref([])
  
  // 用户活跃度统计
  const userActivityStats = ref([])
  
  // 商品状态统计
  const productStatusStats = ref({})
  
  // 订单状态统计
  const orderStatusStats = ref({})
  
  // 平台收入
  const platformIncome = ref(0)
  
  // 热门商品统计
  const hotProductsStats = ref([])
  
  // 活跃卖家统计
  const activeSellersStats = ref([])
  
  // 活跃买家统计
  const activeBuyersStats = ref([])
  
  // 设置管理员权限
  const setAdminRole = (isAdminRole) => {
    isAdmin.value = isAdminRole
  }
  
  // 获取基本统计数据
  const fetchBasicStatistics = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getBasicStatistics()
      if (res.code === 200 && res.data) {
        // 更新基本统计数据
        Object.assign(basicStats, res.data)
        return res.data
      }
    } catch (error) {
      console.error('获取基本统计数据失败', error)
      ElMessage.error('获取基本统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户注册统计数据
  const fetchUserRegisterStatistics = async (params) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getUserRegisterStatistics(params)
      if (res.code === 200) {
        userRegisterStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取用户注册统计数据失败', error)
      ElMessage.error('获取用户注册统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取订单统计数据
  const fetchOrderStatistics = async (params) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getOrderStatistics(params)
      if (res.code === 200) {
        orderStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取订单统计数据失败', error)
      ElMessage.error('获取订单统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取交易额统计数据
  const fetchTransactionStatistics = async (params) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getTransactionStatistics(params)
      if (res.code === 200) {
        transactionStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取交易额统计数据失败', error)
      ElMessage.error('获取交易额统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取分类商品统计数据
  const fetchCategoryProductStatistics = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getCategoryProductStatistics()
      if (res.code === 200) {
        categoryProductStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取分类商品统计数据失败', error)
      ElMessage.error('获取分类商品统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户活跃度统计数据
  const fetchUserActivityStatistics = async (params) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getUserActivityStatistics(params)
      if (res.code === 200) {
        userActivityStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取用户活跃度统计数据失败', error)
      ElMessage.error('获取用户活跃度统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取商品状态统计数据
  const fetchProductStatusStatistics = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getProductStatusStatistics()
      if (res.code === 200) {
        productStatusStats.value = res.data || {}
        return res.data
      }
    } catch (error) {
      console.error('获取商品状态统计数据失败', error)
      ElMessage.error('获取商品状态统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取订单状态统计数据
  const fetchOrderStatusStatistics = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getOrderStatusStatistics()
      if (res.code === 200) {
        orderStatusStats.value = res.data || {}
        return res.data
      }
    } catch (error) {
      console.error('获取订单状态统计数据失败', error)
      ElMessage.error('获取订单状态统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取平台收入统计数据
  const fetchPlatformIncome = async (params) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getPlatformIncome(params)
      if (res.code === 200) {
        platformIncome.value = res.data || 0
        return res.data
      }
    } catch (error) {
      console.error('获取平台收入统计数据失败', error)
      ElMessage.error('获取平台收入统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取热门商品统计数据
  const fetchHotProductsStatistics = async (params = { limit: 10 }) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getHotProductsStatistics(params)
      if (res.code === 200) {
        hotProductsStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取热门商品统计数据失败', error)
      ElMessage.error('获取热门商品统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取活跃卖家统计数据
  const fetchActiveSellersStatistics = async (params = { limit: 10 }) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getActiveSellersStatistics(params)
      if (res.code === 200) {
        activeSellersStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取活跃卖家统计数据失败', error)
      ElMessage.error('获取活跃卖家统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取活跃买家统计数据
  const fetchActiveBuyersStatistics = async (params = { limit: 10 }) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getActiveBuyersStatistics(params)
      if (res.code === 200) {
        activeBuyersStats.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取活跃买家统计数据失败', error)
      ElMessage.error('获取活跃买家统计数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取商品评分统计
  const fetchProductRatingStatistics = async (productId) => {
    loading.value = true
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
    } finally {
      loading.value = false
    }
  }
  
  // 获取当前日期
  const getCurrentDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 获取前30天的日期
  const getPast30Days = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    }
  }
  
  // 初始化统计数据（仪表盘用）
  const initDashboardData = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      // 获取基本统计数据
      await fetchBasicStatistics()
      
      // 获取最近30天数据
      const dateRange = getPast30Days()
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        timeUnit: 'day'
      }
      
      // 分别获取各种统计数据，避免一个失败导致所有失败
      try {
        await fetchUserRegisterStatistics(params)
      } catch (error) {
        console.error('获取用户注册统计失败', error)
      }
      
      try {
        await fetchOrderStatistics(params)
      } catch (error) {
        console.error('获取订单统计失败', error)
      }
      
      try {
        await fetchTransactionStatistics(params)
      } catch (error) {
        console.error('获取交易额统计失败', error)
      }
      
      try {
        await fetchCategoryProductStatistics()
      } catch (error) {
        console.error('获取分类商品统计失败', error)
      }
      
      try {
        await fetchProductStatusStatistics()
      } catch (error) {
        console.error('获取商品状态统计失败', error)
      }
      
      try {
        await fetchOrderStatusStatistics()
      } catch (error) {
        console.error('获取订单状态统计失败', error)
      }
      
      try {
        await fetchHotProductsStatistics()
      } catch (error) {
        console.error('获取热门商品统计失败', error)
      }
      
      try {
        await fetchActiveSellersStatistics()
      } catch (error) {
        console.error('获取活跃卖家统计失败', error)
      }
      
      try {
        await fetchActiveBuyersStatistics()
      } catch (error) {
        console.error('获取活跃买家统计失败', error)
      }
      
      return true
    } catch (error) {
      console.error('初始化仪表盘数据失败', error)
      ElMessage.error('初始化仪表盘数据失败')
      return false
    }
  }
  
  return {
    loading,
    isAdmin,
    basicStats,
    timeUnitOptions,
    userRegisterStats,
    orderStats,
    transactionStats,
    categoryProductStats,
    userActivityStats,
    productStatusStats,
    orderStatusStats,
    platformIncome,
    hotProductsStats,
    activeSellersStats,
    activeBuyersStats,
    setAdminRole,
    fetchBasicStatistics,
    fetchUserRegisterStatistics,
    fetchOrderStatistics,
    fetchTransactionStatistics,
    fetchCategoryProductStatistics,
    fetchUserActivityStatistics,
    fetchProductStatusStatistics,
    fetchOrderStatusStatistics,
    fetchPlatformIncome,
    fetchHotProductsStatistics,
    fetchActiveSellersStatistics,
    fetchActiveBuyersStatistics,
    fetchProductRatingStatistics,
    getCurrentDate,
    getPast30Days,
    initDashboardData
  }
}) 