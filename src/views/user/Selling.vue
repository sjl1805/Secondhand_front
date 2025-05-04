<template>
  <div class="selling-container">
    <el-card class="selling-card">
      <template #header>
        <div class="card-header">
          <h3>我卖出的商品</h3>
          <el-radio-group v-model="activeStatus" @change="handleStatusChange">
            <el-radio-button :label="0">全部</el-radio-button>
            <el-radio-button :label="1">待付款</el-radio-button>
            <el-radio-button :label="2">待发货</el-radio-button>
            <el-radio-button :label="3">待收货</el-radio-button>
            <el-radio-button :label="4">已完成</el-radio-button>
            <el-radio-button :label="5">已取消</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div v-loading="orderStore.loading">
        <!-- 订单列表为空时的提示 -->
        <el-empty v-if="displayOrders.length === 0" description="暂无相关订单"/>

        <!-- 订单列表 -->
        <div v-else class="order-list">
          <div v-for="order in displayOrders" :key="order.id" class="order-item">
            <el-card shadow="hover">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-time">订单时间：{{ formatDateTime(order.createTime) }}</span>
                  <span class="order-no">订单号：{{ order.orderNo }}</span>
                </div>
                <el-tag :type="getOrderStatusType(order.status)">{{ order.statusText }}</el-tag>
              </div>

              <div class="order-content">
                <div class="product-info" @click="viewOrderDetail(order.id)">
                  <img :src="getImageUrl(order.productImage)" class="product-image">
                  <div class="product-details">
                    <h4 class="product-title">{{ order.productTitle }}</h4>
                    <p class="product-price">￥{{ (order.price || 0).toFixed(2) }}</p>
                  </div>
                </div>

                <div class="buyer-info">
                  <p>买家：{{ order.buyerNickname || '用户' + order.buyerId }}</p>
                  <p v-if="order.receiverPhone">联系电话：{{ order.receiverPhone }}</p>
                  <p v-if="order.address">收货地址：{{ order.address }}</p>
                </div>
              </div>

              <div class="order-footer">
                <div class="action-buttons">
                  <el-button plain size="small" type="info" @click="viewOrderDetail(order.id)">查看详情</el-button>
                  <el-button plain size="small" type="primary" @click="contactBuyer(order.buyerId)">联系买家</el-button>

                  <!-- 待发货状态显示发货按钮 -->
                  <el-button v-if="order.status === 2" size="small" type="success" @click="handleShipOrder(order.id)">
                    发货
                  </el-button>

                  <!-- 待付款状态显示取消按钮 -->
                  <el-button v-if="order.status === 1" plain size="small" type="danger"
                             @click="handleCancelOrder(order.id)">取消订单
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="orderStore.sellerPagination.total > 0" class="pagination-container">
          <el-pagination
              :current-page="orderStore.sellerPagination.current"
              :page-size="orderStore.sellerPagination.size"
              :page-sizes="[5, 10, 20, 50]"
              :total="orderStore.sellerPagination.total"
              background
              layout="prev, pager, next, sizes"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useOrderStore} from '@/stores/order'
import {useFileStore} from '@/stores/file'
import {ElMessage, ElMessageBox} from 'element-plus'
import {formatDateTime} from '@/utils/format'

const router = useRouter()
const orderStore = useOrderStore()
const fileStore = useFileStore()

// 当前激活的订单状态过滤器
const activeStatus = ref(0) // 0表示全部

// 通过状态过滤后的订单列表
const displayOrders = computed(() => {
  if (activeStatus.value === 0) {
    return orderStore.sellerOrders
  } else {
    return orderStore.sellerOrders.filter(order => order.status === activeStatus.value)
  }
})

// 获取图片完整URL
const getImageUrl = (path) => {
  if (!path) return '/images/default-product.png'
  return fileStore.getFullUrl(path)
}

// 获取订单状态对应的类型
const getOrderStatusType = (status) => {
  const statusMap = {
    1: 'warning',   // 待付款
    2: 'info',      // 待发货
    3: 'primary',   // 待收货
    4: 'success',   // 已完成
    5: 'danger'     // 已取消
  }
  return statusMap[status] || 'info'
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/user/selling/${orderId}`)
}

// 联系买家
const contactBuyer = (buyerId) => {
  router.push(`/user/chat/${buyerId}`)
}

// 处理发货操作
const handleShipOrder = async (orderId) => {
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
      }
    }
  } catch (error) {
    // 用户取消操作
    console.log('用户取消了发货操作')
  }
}

// 处理取消订单操作
const handleCancelOrder = async (orderId) => {
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
      }
    }
  } catch (error) {
    // 用户取消操作
    console.log('用户取消了取消订单操作')
  }
}

// 处理状态过滤变化
const handleStatusChange = (value) => {
  activeStatus.value = value
  // 如果需要从服务器根据状态重新加载，可以添加以下代码
  // fetchSellerOrders({ status: value === 0 ? undefined : value })
}

// 处理页码变化
const handlePageChange = (page) => {
  orderStore.changeSellerPage(page)
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  orderStore.changeSellerPageSize(size)
}

// 初始化加载卖家订单数据
const fetchSellerOrders = async (params = {}) => {
  await orderStore.fetchSellerOrders(params)
}

onMounted(() => {
  fetchSellerOrders()
})
</script>

<style scoped>
.selling-container {
  padding: 20px;
}

.selling-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.product-info {
  display: flex;
  cursor: pointer;
  flex: 1;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.4;
  color: #303133;
}

.product-price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

.buyer-info {
  color: #606266;
  font-size: 14px;
  flex: 1;
  text-align: right;
}

.buyer-info p {
  margin: 5px 0;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .order-content {
    flex-direction: column;
  }

  .buyer-info {
    text-align: left;
    margin-top: 10px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
</style> 