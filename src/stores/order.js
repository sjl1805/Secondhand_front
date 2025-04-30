import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  createOrder, 
  getOrderDetail, 
  updateOrderStatus, 
  cancelOrder, 
  getBuyerOrders, 
  getSellerOrders, 
  shipOrder, 
  receiveOrder 
} from '@/api/order'
import { ElMessage } from 'element-plus'

export const useOrderStore = defineStore('order', () => {
  // 状态
  const orderDetail = ref(null)
  const buyerOrders = ref([])
  const sellerOrders = ref([])
  const loading = ref(false)
  const buyerPagination = ref({
    current: 1,
    size: 10,
    total: 0
  })
  const sellerPagination = ref({
    current: 1,
    size: 10,
    total: 0
  })
  
  // 订单状态映射
  const orderStatusMap = {
    1: '待付款',
    2: '待发货',
    3: '待收货',
    4: '已完成',
    5: '已取消'
  }
  
  // 创建订单
  const submitOrder = async (orderData) => {
    loading.value = true
    try {
      const res = await createOrder(orderData)
      if (res.code === 200) {
        ElMessage.success('订单创建成功')
        return res.data
      }
    } catch (error) {
      console.error('订单创建失败', error)
      ElMessage.error(error.message || '订单创建失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取订单详情
  const fetchOrderDetail = async (orderId) => {
    loading.value = true
    try {
      const res = await getOrderDetail(orderId)
      if (res.code === 200) {
        orderDetail.value = res.data
        return res.data
      }
    } catch (error) {
      console.error('获取订单详情失败', error)
      ElMessage.error('获取订单详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 更新订单状态
  const changeOrderStatus = async (orderId, status) => {
    try {
      const res = await updateOrderStatus(orderId, status)
      if (res.code === 200) {
        // 更新订单详情
        if (orderDetail.value && orderDetail.value.id === orderId) {
          orderDetail.value.status = status
          orderDetail.value.statusText = orderStatusMap[status]
        }
        
        // 更新订单列表
        updateOrderListStatus(orderId, status)
        
        ElMessage.success('订单状态已更新')
        return true
      }
    } catch (error) {
      console.error('更新订单状态失败', error)
      ElMessage.error(error.message || '更新订单状态失败')
      return false
    }
  }
  
  // 取消订单
  const cancelUserOrder = async (orderId) => {
    try {
      const res = await cancelOrder(orderId)
      if (res.code === 200) {
        // 更新订单详情
        if (orderDetail.value && orderDetail.value.id === orderId) {
          orderDetail.value.status = 5 // 已取消
          orderDetail.value.statusText = orderStatusMap[5]
        }
        
        // 更新订单列表
        updateOrderListStatus(orderId, 5)
        
        ElMessage.success('订单已取消')
        return true
      }
    } catch (error) {
      console.error('取消订单失败', error)
      ElMessage.error(error.message || '取消订单失败')
      return false
    }
  }
  
  // 获取买家订单列表
  const fetchBuyerOrders = async (params = {}) => {
    loading.value = true
    try {
      // 合并分页参数
      const queryParams = {
        page: buyerPagination.value.current,
        size: buyerPagination.value.size,
        ...params
      }
      
      const res = await getBuyerOrders(queryParams)
      if (res.code === 200) {
        buyerOrders.value = res.data.records || []
        buyerPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return res.data
      }
    } catch (error) {
      console.error('获取买家订单列表失败', error)
      ElMessage.error('获取买家订单列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取卖家订单列表
  const fetchSellerOrders = async (params = {}) => {
    loading.value = true
    try {
      // 合并分页参数
      const queryParams = {
        page: sellerPagination.value.current,
        size: sellerPagination.value.size,
        ...params
      }
      
      const res = await getSellerOrders(queryParams)
      if (res.code === 200) {
        sellerOrders.value = res.data.records || []
        sellerPagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return res.data
      }
    } catch (error) {
      console.error('获取卖家订单列表失败', error)
      ElMessage.error('获取卖家订单列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 卖家发货
  const sellerShipOrder = async (orderId) => {
    try {
      const res = await shipOrder(orderId)
      if (res.code === 200) {
        // 更新订单详情
        if (orderDetail.value && orderDetail.value.id === orderId) {
          orderDetail.value.status = 3 // 待收货
          orderDetail.value.statusText = orderStatusMap[3]
        }
        
        // 更新订单列表
        updateOrderListStatus(orderId, 3)
        
        ElMessage.success('发货成功')
        return true
      }
    } catch (error) {
      console.error('发货失败', error)
      ElMessage.error(error.message || '发货失败')
      return false
    }
  }
  
  // 买家收货
  const buyerReceiveOrder = async (orderId) => {
    try {
      const res = await receiveOrder(orderId)
      if (res.code === 200) {
        // 更新订单详情
        if (orderDetail.value && orderDetail.value.id === orderId) {
          orderDetail.value.status = 4 // 已完成
          orderDetail.value.statusText = orderStatusMap[4]
        }
        
        // 更新订单列表
        updateOrderListStatus(orderId, 4)
        
        ElMessage.success('确认收货成功')
        return true
      }
    } catch (error) {
      console.error('确认收货失败', error)
      ElMessage.error(error.message || '确认收货失败')
      return false
    }
  }
  
  // 辅助方法：更新订单列表中的状态
  const updateOrderListStatus = (orderId, status) => {
    // 更新买家订单列表
    const buyerIndex = buyerOrders.value.findIndex(order => order.id === orderId)
    if (buyerIndex !== -1) {
      buyerOrders.value[buyerIndex].status = status
      buyerOrders.value[buyerIndex].statusText = orderStatusMap[status]
    }
    
    // 更新卖家订单列表
    const sellerIndex = sellerOrders.value.findIndex(order => order.id === orderId)
    if (sellerIndex !== -1) {
      sellerOrders.value[sellerIndex].status = status
      sellerOrders.value[sellerIndex].statusText = orderStatusMap[status]
    }
  }
  
  // 切换买家订单页码
  const changeBuyerPage = (page) => {
    buyerPagination.value.current = page
    fetchBuyerOrders()
  }
  
  // 切换买家每页数量
  const changeBuyerPageSize = (size) => {
    buyerPagination.value.size = size
    buyerPagination.value.current = 1 // 重置到第一页
    fetchBuyerOrders()
  }
  
  // 切换卖家订单页码
  const changeSellerPage = (page) => {
    sellerPagination.value.current = page
    fetchSellerOrders()
  }
  
  // 切换卖家每页数量
  const changeSellerPageSize = (size) => {
    sellerPagination.value.size = size
    sellerPagination.value.current = 1 // 重置到第一页
    fetchSellerOrders()
  }
  
  // 计算属性：按状态分组的买家订单
  const groupedBuyerOrders = computed(() => {
    const result = {
      1: [], // 待付款
      2: [], // 待发货
      3: [], // 待收货
      4: [], // 已完成
      5: []  // 已取消
    }
    
    buyerOrders.value.forEach(order => {
      if (result[order.status]) {
        result[order.status].push(order)
      }
    })
    
    return result
  })
  
  // 计算属性：按状态分组的卖家订单
  const groupedSellerOrders = computed(() => {
    const result = {
      1: [], // 待付款
      2: [], // 待发货
      3: [], // 待收货
      4: [], // 已完成
      5: []  // 已取消
    }
    
    sellerOrders.value.forEach(order => {
      if (result[order.status]) {
        result[order.status].push(order)
      }
    })
    
    return result
  })
  
  // 计算属性：各状态订单数量
  const orderStatusCounts = computed(() => {
    const counts = {
      buyer: {
        1: 0, // 待付款
        2: 0, // 待发货
        3: 0, // 待收货
        4: 0, // 已完成
        5: 0  // 已取消
      },
      seller: {
        1: 0, // 待付款
        2: 0, // 待发货
        3: 0, // 待收货
        4: 0, // 已完成
        5: 0  // 已取消
      }
    }
    
    buyerOrders.value.forEach(order => {
      if (counts.buyer[order.status] !== undefined) {
        counts.buyer[order.status]++
      }
    })
    
    sellerOrders.value.forEach(order => {
      if (counts.seller[order.status] !== undefined) {
        counts.seller[order.status]++
      }
    })
    
    return counts
  })
  
  // 重置状态
  const resetState = () => {
    orderDetail.value = null
    buyerOrders.value = []
    sellerOrders.value = []
    buyerPagination.value = {
      current: 1,
      size: 10,
      total: 0
    }
    sellerPagination.value = {
      current: 1,
      size: 10,
      total: 0
    }
  }
  
  return {
    orderDetail,
    buyerOrders,
    sellerOrders,
    loading,
    buyerPagination,
    sellerPagination,
    orderStatusMap,
    groupedBuyerOrders,
    groupedSellerOrders,
    orderStatusCounts,
    submitOrder,
    fetchOrderDetail,
    changeOrderStatus,
    cancelUserOrder,
    fetchBuyerOrders,
    fetchSellerOrders,
    sellerShipOrder,
    buyerReceiveOrder,
    changeBuyerPage,
    changeBuyerPageSize,
    changeSellerPage,
    changeSellerPageSize,
    resetState
  }
}) 