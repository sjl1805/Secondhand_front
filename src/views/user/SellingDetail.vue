<template>
  <div class="selling-detail-container">
    <div class="page-header">
      <el-page-header @back="goBack" title="卖出详情" />
    </div>
    
    <div v-loading="loading">
      <template v-if="orderDetail">
        <!-- 订单状态卡片 -->
        <el-card class="status-card">
          <div class="status-container">
            <div class="status-icon">
              <el-icon size="40" :color="getStatusColor(orderDetail.status)">
                <component :is="getStatusIcon(orderDetail.status)"></component>
              </el-icon>
            </div>
            <div class="status-info">
              <h2 class="status-text">{{ orderDetail.statusText }}</h2>
              <p class="status-desc">{{ getStatusDescription(orderDetail.status) }}</p>
            </div>
          </div>
        </el-card>
        
        <!-- 订单信息卡片 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>订单信息</h3>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="订单编号">{{ orderDetail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(orderDetail.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间" v-if="orderDetail.payTime">{{ formatDateTime(orderDetail.payTime) }}</el-descriptions-item>
            <el-descriptions-item label="发货时间" v-if="orderDetail.shipTime">{{ formatDateTime(orderDetail.shipTime) }}</el-descriptions-item>
            <el-descriptions-item label="完成时间" v-if="orderDetail.finishTime">{{ formatDateTime(orderDetail.finishTime) }}</el-descriptions-item>
            <el-descriptions-item label="取消时间" v-if="orderDetail.cancelTime">{{ formatDateTime(orderDetail.cancelTime) }}</el-descriptions-item>
            <el-descriptions-item label="订单总额">
              <span class="price">￥{{ (orderDetail.price || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 商品信息卡片 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>商品信息</h3>
              <el-button link type="primary" @click="viewProduct(orderDetail.productId)">查看商品</el-button>
            </div>
          </template>
          
          <div class="product-container">
            <div class="product-info">
              <img :src="getImageUrl(orderDetail.productImage)" class="product-image">
              <div class="product-details">
                <h4 class="product-title">{{ orderDetail.productTitle }}</h4>
                <p class="product-price">￥{{ (orderDetail.price || 0).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 买家信息卡片 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>买家信息</h3>
              <el-button link type="primary" @click="contactBuyer(orderDetail.buyerId)">联系买家</el-button>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="买家昵称">{{ orderDetail.buyerNickname || '用户' + orderDetail.buyerId }}</el-descriptions-item>
            <el-descriptions-item label="联系电话" v-if="orderDetail.receiverPhone">{{ orderDetail.receiverPhone }}</el-descriptions-item>
            <el-descriptions-item label="收货人" v-if="orderDetail.receiverName">{{ orderDetail.receiverName }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" v-if="orderDetail.address">{{ orderDetail.address }}</el-descriptions-item>
            <el-descriptions-item label="买家留言" v-if="orderDetail.message">{{ orderDetail.message }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 操作按钮区域 -->
        <div class="action-container">
          <el-button @click="goBack">返回列表</el-button>
          <el-button type="primary" plain @click="contactBuyer(orderDetail.buyerId)">联系买家</el-button>
          
          <!-- 待发货状态显示发货按钮 -->
          <el-button v-if="orderDetail.status === 2" type="success" @click="handleShipOrder">确认发货</el-button>
          
          <!-- 待付款状态显示取消按钮 -->
          <el-button v-if="orderDetail.status === 1" type="danger" plain @click="handleCancelOrder">取消订单</el-button>
        </div>
      </template>
      
      <el-empty v-else description="订单不存在或已被删除" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useFileStore } from '@/stores/file'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '@/utils/format'
import { 
  Check, 
  Loading, 
  Ship, 
  CircleCheck, 
  CircleClose 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const fileStore = useFileStore()

const loading = ref(false)
const orderId = route.params.id
const orderDetail = ref(null)

// 获取图片完整URL
const getImageUrl = (path) => {
  if (!path) return '/images/default-product.png'
  return fileStore.getFullUrl(path)
}

// 获取订单状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    1: '#E6A23C', // 待付款 - 黄色
    2: '#909399', // 待发货 - 灰色
    3: '#409EFF', // 待收货 - 蓝色
    4: '#67C23A', // 已完成 - 绿色
    5: '#F56C6C'  // 已取消 - 红色
  }
  return colorMap[status] || '#909399'
}

// 获取订单状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    1: Loading,     // 待付款
    2: Loading,     // 待发货
    3: Ship,        // 待收货
    4: CircleCheck, // 已完成
    5: CircleClose  // 已取消
  }
  return iconMap[status] || Loading
}

// 获取订单状态描述
const getStatusDescription = (status) => {
  const descMap = {
    1: '买家尚未支付订单，等待买家付款',
    2: '买家已付款，等待您发货',
    3: '您已发货，等待买家确认收货',
    4: '交易已完成',
    5: '订单已取消'
  }
  return descMap[status] || ''
}

// 返回列表页
const goBack = () => {
  router.push('/user/selling')
}

// 联系买家
const contactBuyer = (buyerId) => {
  router.push(`/user/chat/${buyerId}`)
}

// 查看商品详情
const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 处理发货操作
const handleShipOrder = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '确定已经发货了吗？发货后不可撤销。',
      '发货确认',
      {
        confirmButtonText: '确定发货',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (result) {
      const success = await orderStore.sellerShipOrder(orderId)
      if (success) {
        ElMessage.success('发货成功！买家将收到通知')
        await fetchOrderDetail()
      }
    }
  } catch (error) {
    // 用户取消操作
    console.log('用户取消了发货操作')
  }
}

// 处理取消订单操作
const handleCancelOrder = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要取消这个订单吗？此操作不可撤销。',
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )
    
    if (result) {
      const success = await orderStore.cancelUserOrder(orderId)
      if (success) {
        ElMessage.success('订单已取消')
        await fetchOrderDetail()
      }
    }
  } catch (error) {
    // 用户取消操作
    console.log('用户取消了取消订单操作')
  }
}

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const data = await orderStore.fetchOrderDetail(orderId)
    if (data) {
      orderDetail.value = data
    } else {
      ElMessage.error('订单不存在或已被删除')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.selling-detail-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.status-card {
  margin-bottom: 20px;
}

.status-container {
  display: flex;
  align-items: center;
  padding: 20px;
}

.status-icon {
  margin-right: 20px;
}

.status-info {
  flex: 1;
}

.status-text {
  margin: 0 0 10px;
  font-size: 20px;
}

.status-desc {
  margin: 0;
  color: #606266;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.product-container {
  padding: 10px 0;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 20px;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.4;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.action-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .action-container {
    flex-direction: column;
  }
  
  .action-container .el-button {
    margin-left: 0 !important;
    margin-bottom: 10px;
  }
}
</style> 