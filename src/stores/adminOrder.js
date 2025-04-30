import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  getAdminOrderList, 
  getAdminOrderDetail, 
  updateAdminOrderStatus, 
  deleteAdminOrder, 
  batchUpdateAdminOrderStatus, 
  batchDeleteAdminOrder 
} from '@/api/order'
import { ElMessage } from 'element-plus'

export const useAdminOrderStore = defineStore('adminOrder', () => {
  // 状态
  const orderList = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const isAdmin = ref(false)
  const pagination = ref({
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
  
  // 订单状态列表，用于选择筛选
  const orderStatusOptions = computed(() => {
    return Object.keys(orderStatusMap).map(key => ({
      value: parseInt(key),
      label: orderStatusMap[key]
    }))
  })
  
  // 设置管理员权限
  const setAdminRole = (isAdminRole) => {
    isAdmin.value = isAdminRole
  }
  
  // 获取订单列表
  const fetchOrderList = async (params = {}) => {
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
      
      const res = await getAdminOrderList(queryParams)
      if (res.code === 200 && res.data) {
        orderList.value = res.data.records || []
        pagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return res.data
      }
    } catch (error) {
      console.error('获取订单列表失败', error)
      ElMessage.error('获取订单列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取订单详情
  const fetchOrderDetail = async (id) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getAdminOrderDetail(id)
      if (res.code === 200) {
        currentOrder.value = res.data
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
  const updateOrderStatus = async (id, status) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await updateAdminOrderStatus(id, status)
      if (res.code === 200) {
        // 更新列表中的订单状态
        const index = orderList.value.findIndex(item => item.id === id)
        if (index !== -1) {
          orderList.value[index].status = status
          orderList.value[index].statusText = orderStatusMap[status]
        }
        
        // 如果当前正在查看的订单是这个订单，也更新它的状态
        if (currentOrder.value && currentOrder.value.id === id) {
          currentOrder.value.status = status
          currentOrder.value.statusText = orderStatusMap[status]
        }
        
        ElMessage.success('订单状态更新成功')
      }
    } catch (error) {
      console.error('更新订单状态失败', error)
      ElMessage.error('更新订单状态失败')
      throw error
    }
  }
  
  // 删除订单
  const removeOrder = async (id) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await deleteAdminOrder(id)
      if (res.code === 200) {
        // 从列表中删除
        orderList.value = orderList.value.filter(item => item.id !== id)
        
        // 如果当前正在查看的订单是这个订单，清空它
        if (currentOrder.value && currentOrder.value.id === id) {
          currentOrder.value = null
        }
        
        ElMessage.success('订单删除成功')
      }
    } catch (error) {
      console.error('删除订单失败', error)
      ElMessage.error('删除订单失败')
      throw error
    }
  }
  
  // 批量更新订单状态
  const batchUpdateStatus = async (orderIds, status) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await batchUpdateAdminOrderStatus(orderIds, status)
      if (res.code === 200) {
        // 更新列表中的订单状态
        orderList.value = orderList.value.map(item => {
          if (orderIds.includes(item.id)) {
            return {
              ...item,
              status,
              statusText: orderStatusMap[status]
            }
          }
          return item
        })
        
        ElMessage.success(`成功更新${res.data}个订单状态`)
        return res.data
      }
    } catch (error) {
      console.error('批量更新订单状态失败', error)
      ElMessage.error('批量更新订单状态失败')
      throw error
    }
  }
  
  // 批量删除订单
  const batchRemoveOrder = async (orderIds) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await batchDeleteAdminOrder(orderIds)
      if (res.code === 200) {
        // 从列表中删除
        orderList.value = orderList.value.filter(item => !orderIds.includes(item.id))
        
        // 如果当前正在查看的订单在这些订单中，清空它
        if (currentOrder.value && orderIds.includes(currentOrder.value.id)) {
          currentOrder.value = null
        }
        
        ElMessage.success(`成功删除${res.data}个订单`)
        return res.data
      }
    } catch (error) {
      console.error('批量删除订单失败', error)
      ElMessage.error('批量删除订单失败')
      throw error
    }
  }
  
  // 切换页码
  const changePage = (page) => {
    pagination.value.current = page
    fetchOrderList()
  }
  
  // 切换每页数量
  const changePageSize = (size) => {
    pagination.value.size = size
    pagination.value.current = 1 // 重置到第一页
    fetchOrderList()
  }
  
  // 获取订单状态文本
  const getOrderStatusText = (status) => {
    return orderStatusMap[status] || '未知状态'
  }
  
  return {
    orderList,
    currentOrder,
    loading,
    isAdmin,
    pagination,
    orderStatusOptions,
    orderStatusMap,
    setAdminRole,
    fetchOrderList,
    fetchOrderDetail,
    updateOrderStatus,
    removeOrder,
    batchUpdateStatus,
    batchRemoveOrder,
    changePage,
    changePageSize,
    getOrderStatusText
  }
}) 