<template>
  <div class="order-detail-container">
    <div class="page-header">
      <el-page-header @back="goBack" content="订单详情" />
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else-if="order">
      <!-- 订单状态进度条 -->
      <el-card class="order-status-card">
        <div class="order-status-header">
          <div class="status-info">
            <span class="status-label">订单状态：</span>
            <el-tag :type="getStatusType(order.status)" size="large">
              {{ order.statusText }}
            </el-tag>
          </div>
          
          <div class="order-actions">
            <!-- 买家操作 -->
            <el-button 
              v-if="isBuyer && order.status === 1" 
              type="primary"
              @click="payOrder(order)"
            >
              立即支付
            </el-button>
            
            <el-button 
              v-if="isBuyer && order.status === 3" 
              type="success"
              @click="confirmReceive(order.id)"
            >
              确认收货
            </el-button>
            
            <el-button 
              v-if="isBuyer && order.status === 1" 
              type="danger"
              @click="cancelOrder(order.id)"
            >
              取消订单
            </el-button>
            
            <!-- 卖家操作 -->
            <el-button 
              v-if="!isBuyer && order.status === 2" 
              type="primary"
              @click="shipOrder(order.id)"
            >
              确认发货
            </el-button>
          </div>
        </div>
        
        <el-steps 
          :active="getStatusStep(order.status)" 
          finish-status="success"
          class="order-steps"
        >
          <el-step title="提交订单" :description="formatDate(order.createTime)" />
          <el-step title="付款成功" :description="getStatusTime(2)" />
          <el-step title="商品发货" :description="getStatusTime(3)" />
          <el-step title="交易完成" :description="getStatusTime(4)" />
        </el-steps>
      </el-card>
      
      <!-- 订单基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(order.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ order.buyer?.username || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="卖家">{{ order.seller?.username || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="交易方式" :span="2">线下交易</el-descriptions-item>
          <el-descriptions-item label="买家留言" :span="2">{{ order.message || '无留言' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 商品信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
          </div>
        </template>
        
        <div class="product-card">
          <div class="product-info">
            <el-image 
              :src="order.product && order.product.coverImage ? order.product.coverImage : (order.product && order.product.imageUrl ? order.product.imageUrl : getProductImage(order.product))" 
              class="product-image"
              fit="cover"
              :preview-src-list="order.product && order.product.images ? order.product.images : []"
              @click="viewProduct(order.product && order.product.id)"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
            <div class="product-details" @click="viewProduct(order.product && order.product.id)">
              <h3 class="product-title">{{ order.product && order.product.title }}</h3>
              <p class="product-condition">
                成色：{{ getConditionText(order.product && order.product.condition) }}
              </p>
              <p class="product-desc">{{ truncateDesc(order.product && order.product.description) }}</p>
            </div>
          </div>
          <div class="product-price-info">
            <div class="price-item">
              <span class="price-label">单价</span>
              <span class="price-value">¥{{ order.product && order.product.price ? order.product.price.toFixed(2) : '0.00' }}</span>
            </div>
            <div class="price-item">
              <span class="price-label">数量</span>
              <span class="price-value">1</span>
            </div>
            <div class="price-item total-price">
              <span class="price-label">小计</span>
              <span class="price-value">¥{{ order.totalAmount ? order.totalAmount.toFixed(2) : '0.00' }}</span>
            </div>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="summary-item">
            <span class="summary-label">商品金额：</span>
            <span class="summary-value">¥{{ order.totalAmount ? order.totalAmount.toFixed(2) : '0.00' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">实付款：</span>
            <span class="summary-value highlight">¥{{ order.totalAmount ? order.totalAmount.toFixed(2) : '0.00' }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- 交易地点 -->
      <el-card class="info-card" v-if="order.product.location">
        <template #header>
          <div class="card-header">
            <span>交易地点</span>
          </div>
        </template>
        
        <p class="location-text">{{ order.product.location }}</p>
      </el-card>
      
      <!-- 联系信息 -->
      <el-card class="info-card contact-card">
        <template #header>
          <div class="card-header">
            <span>联系方式</span>
          </div>
        </template>
        
        <div class="contact-info">
          <div class="contact-item" v-if="isBuyer">
            <h4>卖家联系方式</h4>
            <p>
              <el-tag size="small" type="info">联系人</el-tag>
              {{ order.seller?.username || '未知' }}
            </p>
            <p v-if="order.seller?.phone">
              <el-tag size="small" type="info">电话</el-tag>
              {{ order.seller.phone }}
            </p>
            <p v-else class="no-contact">订单完成后可查看联系方式</p>
          </div>
          
          <div class="contact-item" v-else>
            <h4>买家联系方式</h4>
            <p>
              <el-tag size="small" type="info">联系人</el-tag>
              {{ order.buyer?.username || '未知' }}
            </p>
            <p v-if="order.buyer?.phone">
              <el-tag size="small" type="info">电话</el-tag>
              {{ order.buyer.phone }}
            </p>
            <p v-else class="no-contact">订单完成后可查看联系方式</p>
          </div>
        </div>
      </el-card>
    </template>
    
    <div v-else-if="!loading" class="error-container">
      <el-empty description="订单不存在或已被删除">
        <el-button type="primary" @click="goBack">返回订单列表</el-button>
      </el-empty>
    </div>
    
    <!-- 支付确认对话框 -->
    <el-dialog v-model="paymentDialogVisible" title="支付确认" width="400px" :close-on-click-modal="false" :close-on-press-escape="false">
      <div v-if="order" class="payment-confirm">
        <p class="payment-amount">支付订单: <span class="price">￥{{ order.totalAmount.toFixed(2) }}</span></p>
        
        <!-- 支付方式选择 -->
        <div class="payment-methods">
          <h4>选择支付方式</h4>
          <el-radio-group v-model="paymentMethod" :disabled="paymentStatus > 0">
            <el-radio :label="1">支付宝</el-radio>
            <el-radio :label="2">微信支付</el-radio>
            <el-radio :label="3">银行卡</el-radio>
          </el-radio-group>
        </div>
        
        <div class="payment-qrcode">
          <img src="../../assets/images/qr-code-placeholder.png" alt="支付二维码" />
          <p>请使用{{ paymentMethodText }}扫码支付</p>
        </div>
        
        <div class="payment-status" :class="{'success': paymentStatus === 2, 'error': paymentStatus === 3}">
          <el-tag v-if="paymentStatus > 0" :type="paymentStatus === 2 ? 'success' : paymentStatus === 3 ? 'danger' : 'info'">
            {{ paymentStatusText }}
          </el-tag>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelPayment" :disabled="paymentStatus === 1">取消支付</el-button>
          <el-button type="primary" @click="confirmPayment" :loading="paymentStatus === 1" :disabled="paymentStatus === 2 || paymentStatus === 3">
            {{ paymentStatus === 0 ? '确认支付' : '查询支付状态' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useFileStore } from '@/stores/file'
import { formatDateTime } from '@/utils/format'
import { Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()
const productStore = useProductStore()
const fileStore = useFileStore()

const loading = ref(true)
const order = computed(() => orderStore.orderDetail)

// 是否是买家
const isBuyer = computed(() => {
  if (!order.value || !userStore.currentUser) return false
  return order.value.buyerId === userStore.currentUser.id
})

// 根据状态获取步骤条激活状态
const getStatusStep = (status) => {
  const statusStepMap = {
    1: 1, // 待付款，第一步（提交订单）完成
    2: 2, // 待发货，第二步（付款）完成
    3: 3, // 待收货，第三步（发货）完成
    4: 4, // 已完成，第四步（确认收货）完成
    5: 0  // 已取消，返回第一步
  }
  return statusStepMap[status] || 0
}

// 获取订单状态变更时间
const getStatusTime = (status) => {
  if (!order.value) return ''
  
  // 这里假设存在statusLogs字段记录了状态变更历史
  // 实际项目中可能需要从后端获取状态变更日志
  if (status === 2 && order.value.payTime) {
    return formatDate(order.value.payTime)
  } else if (status === 3 && order.value.shipTime) {
    return formatDate(order.value.shipTime)
  } else if (status === 4 && order.value.completeTime) {
    return formatDate(order.value.completeTime)
  }
  
  // 根据当前订单状态推断
  if (order.value.status >= status) {
    if (status === 2) return formatDate(order.value.updateTime)
    if (status === 3 && order.value.status >= 3) return formatDate(order.value.updateTime)
    if (status === 4 && order.value.status === 4) return formatDate(order.value.updateTime)
  }
  
  return '未完成'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return formatDateTime(date)
}

// 获取状态对应的类型
const getStatusType = (status) => {
  const statusMap = {
    1: 'warning',   // 待付款
    2: 'info',      // 待发货
    3: 'primary',   // 待收货
    4: 'success',   // 已完成
    5: 'danger'     // 已取消
  }
  return statusMap[status] || 'info'
}

// 获取商品图片
const getProductImage = (product) => {
  if (!product || !product.imageUrl) {
    // 如果订单中有商品图片路径但product对象中没有
    if (order.value && order.value.productImage) {
      return fileStore.getFullUrl(order.value.productImage)
    }
    return '/images/default-product.png'
  }
  return product.imageUrl
}

// 获取商品成色文本
const getConditionText = (condition) => {
  const conditionMap = {
    1: '全新',
    2: '几乎全新',
    3: '轻微使用痕迹',
    4: '正常使用痕迹',
    5: '明显使用痕迹'
  }
  return conditionMap[condition] || '未知'
}

// 截断描述文本
const truncateDesc = (desc) => {
  if (!desc) return ''
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载订单详情
const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = Number(route.params.id)
    if (!orderId) {
      ElMessage.error('订单ID无效')
      goBack()
      return
    }
    
    await orderStore.fetchOrderDetail(orderId)
    if (!orderStore.orderDetail) {
      ElMessage.error('订单不存在')
    } else {
      // 处理商品数据
      await processOrderProductData()
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 处理订单中的商品数据
const processOrderProductData = async () => {
  const order = orderStore.orderDetail
  
  if (!order) return
  
  // 如果有productId但没有完整的product数据，尝试从product store获取
  if (order.productId && (!order.product || !order.product.id)) {
    try {
      const productData = await productStore.fetchProductDetail(order.productId)
      if (productData) {
        order.product = productData
        return
      }
    } catch (error) {
      console.error('获取商品详情失败:', error)
    }
  }
  
  // 确保商品数据存在
  if (!order.product) {
    order.product = {
      title: order.productTitle || '商品信息不可用',
      price: order.price || 0,
      condition: 1,
      description: '暂无描述',
      imageUrl: order.productImage ? fileStore.getFullUrl(order.productImage) : '/images/default-product.png'
    }
  } 
  
  // 处理商品图片
  if (order.product) {
    // 1. 设置默认图片属性
    if (!order.product.imageUrl && order.productImage) {
      order.product.imageUrl = fileStore.getFullUrl(order.productImage)
    } else if (!order.product.imageUrl) {
      order.product.imageUrl = '/images/default-product.png'
    }
    
    // 2. 处理图片URL数组
    if (order.product.imageUrls && Array.isArray(order.product.imageUrls) && !order.product.images) {
      order.product.images = order.product.imageUrls.map(url => fileStore.getFullUrl(url))
      order.product.coverImage = order.product.images[0] || null
    }
    
    // 3. 确保 JSON 字符串形式的 images 被解析
    if (order.product.images && typeof order.product.images === 'string') {
      try {
        order.product.images = JSON.parse(order.product.images)
        order.product.coverImage = order.product.images[0] || null
      } catch (e) {
        order.product.images = []
      }
    }
    
    // 4. 如果只有imageUrl但没有coverImage和images
    if (order.product.imageUrl && !order.product.coverImage && (!order.product.images || order.product.images.length === 0)) {
      order.product.coverImage = order.product.imageUrl
      order.product.images = [order.product.imageUrl]
    }
    
    // 设置其它默认值
    if (!order.product.title) {
      order.product.title = order.productTitle || '商品信息不完整'
    }
    
    if (!order.product.price) {
      order.product.price = order.price || 0
    }
    
    if (!order.product.condition) {
      order.product.condition = 1
    }
    
    if (!order.product.description) {
      order.product.description = '暂无描述'
    }
  }
}

// 查看商品详情
const viewProduct = async (productId) => {
  // 如果没有productId，但订单有productId
  if (!productId && order.value && order.value.productId) {
    productId = order.value.productId
  }
  
  if (!productId) {
    ElMessage.warning('商品信息不可用')
    return
  }
  
  router.push(`/product/${productId}`)
}

// 添加支付相关状态和对话框
const paymentDialogVisible = ref(false)
const paymentMethod = ref(1)
const paymentStatus = ref(0) // 0-未支付 1-支付中 2-支付成功 3-支付失败

// 支付方式文本
const paymentMethodText = computed(() => {
  const map = {
    1: '支付宝',
    2: '微信支付',
    3: '银行卡'
  }
  return map[paymentMethod.value] || '支付宝'
})

// 支付状态文本
const paymentStatusText = computed(() => {
  const map = {
    0: '未支付',
    1: '支付处理中',
    2: '支付成功',
    3: '支付失败'
  }
  return map[paymentStatus.value] || '未支付'
})

// 支付订单
const payOrder = (order) => {
  // 重置支付状态
  paymentStatus.value = 0
  paymentMethod.value = 1
  
  // 显示支付对话框
  paymentDialogVisible.value = true
}

// 确认支付
const confirmPayment = async () => {
  if (!order.value) return
  
  // 如果已经支付成功或失败，直接关闭对话框
  if (paymentStatus.value === 2) {
    paymentDialogVisible.value = false
    loadOrderDetail()
    return
  }
  
  if (paymentStatus.value === 3) {
    paymentDialogVisible.value = false
    return
  }
  
  // 设置为支付中
  paymentStatus.value = 1
  loading.value = true
  
  try {
    // 构建支付数据
    const paymentData = {
      amount: order.value.totalAmount,
      paymentMethod: paymentMethod.value,
      message: order.value.message || ''
    }
    
    // 调用支付API
    const paymentResult = await orderStore.submitPayment(order.value.id, paymentData)
    
    if (paymentResult) {
      paymentStatus.value = 2 // 支付成功
      ElMessage.success('支付成功！')
      
      // 3秒后自动关闭对话框并刷新
      setTimeout(() => {
        paymentDialogVisible.value = false
        loadOrderDetail()
      }, 2000)
    } else {
      paymentStatus.value = 3 // 支付失败
      ElMessage.error('支付失败，请重试')
    }
  } catch (error) {
    console.error('支付失败:', error)
    paymentStatus.value = 3 // 支付失败
    ElMessage.error('支付失败，请重试')
  } finally {
    loading.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  // 如果支付中，不允许取消
  if (paymentStatus.value === 1) return
  
  paymentDialogVisible.value = false
  ElMessage.info('已取消支付')
}

// 确认收货
const confirmReceive = (orderId) => {
  ElMessageBox.confirm(
    '确认已收到商品吗？',
    '确认收货',
    {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(async () => {
      try {
        const success = await orderStore.buyerReceiveOrder(orderId)
        if (success) {
          // 重新加载订单详情
          loadOrderDetail()
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 取消订单
const cancelOrder = (orderId) => {
  ElMessageBox.confirm(
    '确认取消此订单吗？',
    '取消订单',
    {
      confirmButtonText: '确认取消',
      cancelButtonText: '返回',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const success = await orderStore.cancelUserOrder(orderId)
        if (success) {
          // 重新加载订单详情
          loadOrderDetail()
        }
      } catch (error) {
        console.error('取消订单失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 发货
const shipOrder = (orderId) => {
  ElMessageBox.confirm(
    '确认商品已发货吗？',
    '确认发货',
    {
      confirmButtonText: '确认发货',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(async () => {
      try {
        const success = await orderStore.sellerShipOrder(orderId)
        if (success) {
          // 重新加载订单详情
          loadOrderDetail()
        }
      } catch (error) {
        console.error('发货失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadOrderDetail()
    }
  }
)

// 组件挂载时加载订单详情
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.loading-container,
.error-container {
  padding: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-status-card,
.info-card {
  margin-bottom: 20px;
}

.order-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-info {
  display: flex;
  align-items: center;
}

.status-label {
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.order-steps {
  padding: 20px 0;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.product-card {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.product-info {
  display: flex;
  flex: 1;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 20px;
  cursor: pointer;
}

.product-details {
  flex: 1;
  cursor: pointer;
}

.product-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.product-condition {
  margin: 0 0 5px;
  font-size: 14px;
  color: #606266;
}

.product-desc {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.product-price-info {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}

.price-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.price-label {
  color: #909399;
}

.price-value {
  font-weight: 500;
  color: #606266;
}

.total-price .price-value {
  color: #f56c6c;
  font-weight: 600;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px 0;
}

.summary-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.summary-label {
  color: #909399;
}

.summary-value {
  margin-left: 10px;
  font-weight: 500;
}

.summary-value.highlight {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.location-text {
  font-size: 14px;
  color: #606266;
}

.contact-info {
  display: flex;
  justify-content: space-between;
}

.contact-item {
  width: 48%;
}

.contact-item h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.contact-item p {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
}

.contact-item .el-tag {
  margin-right: 10px;
}

.no-contact {
  color: #909399;
  font-style: italic;
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  color: #909399;
  background-color: #f5f7fa;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 30px;
  margin-bottom: 5px;
}

/* 支付确认样式 */
.payment-confirm {
  text-align: center;
  padding: 20px 0;
}

.payment-amount {
  font-size: 18px;
  margin-bottom: 20px;
}

.payment-methods {
  margin-bottom: 20px;
}

.payment-methods h4 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
}

.payment-qrcode {
  margin: 0 auto;
  max-width: 200px;
}

.payment-qrcode img {
  width: 100%;
  height: auto;
}

.payment-status {
  margin-top: 20px;
  text-align: center;
}

.payment-status.success {
  color: #67c23a;
}

.payment-status.error {
  color: #f56c6c;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}
</style> 