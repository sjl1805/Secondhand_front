<template>
  <div v-loading="store.loading" class="order-detail-container">
    <el-page-header content="订单详情" @back="goBack"/>

    <div v-if="store.currentOrder" class="order-info">
      <!-- 订单基本信息 -->
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <el-tag :type="statusTagType(store.currentOrder.status)">
              {{ store.getOrderStatusText(store.currentOrder.status) }}
            </el-tag>
          </div>
        </template>
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ store.currentOrder.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">交易流水号：</span>
            <span class="value">{{ store.currentOrder.transactionNo || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(store.currentOrder.createTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">付款时间：</span>
            <span class="value">{{ formatDate(store.currentOrder.paymentTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ getPaymentMethodText(store.currentOrder.paymentMethod) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付状态：</span>
            <span class="value">{{ getPaymentStatusText(store.currentOrder.paymentStatus) }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDate(store.currentOrder.updateTime) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 商品信息 -->
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
          </div>
        </template>
        <div class="product-info">
          <el-image
              :src="fileStore.getFullUrl(store.currentOrder.productImage)"
              class="product-image"
              fit="cover"
          >
            <template #error>
              <div class="image-error">
                <el-icon>
                  <picture-filled/>
                </el-icon>
              </div>
            </template>
          </el-image>
          <div class="product-detail">
            <h3>{{ store.currentOrder.productTitle }}</h3>
            <div v-if="store.currentOrder.productQuality" class="product-quality">
              成色：{{ getProductQualityText(store.currentOrder.productQuality) }}
            </div>
            <div class="price">¥{{ store.currentOrder.price }}</div>
          </div>
        </div>
      </el-card>

      <!-- 交易双方信息 -->
      <el-row :gutter="20">
        <!-- 买家信息 -->
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>买家信息</span>
              </div>
            </template>
            <div class="user-info">
              <el-avatar
                  :size="50"
                  :src="fileStore.getFullUrl(store.currentOrder.buyerAvatar)"
              >
                <template #error>
                  <el-icon>
                    <user-filled/>
                  </el-icon>
                </template>
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ store.currentOrder.buyerNickname }}</div>
                <div class="id">用户ID: {{ store.currentOrder.buyerId }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 卖家信息 -->
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>卖家信息</span>
              </div>
            </template>
            <div class="user-info">
              <el-avatar
                  :size="50"
                  :src="fileStore.getFullUrl(store.currentOrder.sellerAvatar)"
              >
                <template #error>
                  <el-icon>
                    <user-filled/>
                  </el-icon>
                </template>
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ store.currentOrder.sellerNickname }}</div>
                <div class="id">用户ID: {{ store.currentOrder.sellerId }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 收货信息 -->
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>收货信息</span>
          </div>
        </template>
        <div class="address-info">
          <div class="info-item">
            <span class="label">收货人：</span>
            <span class="value">{{ store.currentOrder.receiverName }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ store.currentOrder.receiverPhone }}</span>
          </div>
          <div class="info-item">
            <span class="label">收货地址：</span>
            <span class="value">{{ store.currentOrder.address }}</span>
          </div>
          <div v-if="store.currentOrder.message" class="info-item">
            <span class="label">买家留言：</span>
            <span class="value">{{ store.currentOrder.message }}</span>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
            v-if="store.currentOrder.status === 1"
            type="primary"
            @click="changeStatus(2)"
        >
          设为待发货
        </el-button>
        <el-button
            v-if="store.currentOrder.status === 3"
            type="success"
            @click="changeStatus(4)"
        >
          设为已完成
        </el-button>
        <el-button
            type="danger"
            @click="deleteOrder"
        >
          删除订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAdminOrderStore} from '@/stores/adminOrder'
import {useFileStore} from '@/stores/file'
import {ElMessage, ElMessageBox} from 'element-plus'
import {PictureFilled, UserFilled} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const store = useAdminOrderStore()
const fileStore = useFileStore()

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case 1:
      return 'warning'  // 待付款
    case 2:
      return 'info'     // 待发货
    case 3:
      return ''         // 待收货
    case 4:
      return 'success'  // 已完成
    case 5:
      return 'danger'   // 已取消
    default:
      return 'info'
  }
}

// 支付方式文本
const getPaymentMethodText = (method) => {
  const methodMap = {
    1: '支付宝',
    2: '微信支付',
    3: '银行卡'
  }
  return methodMap[method] || '未知'
}

// 支付状态文本
const getPaymentStatusText = (status) => {
  const statusMap = {
    0: '未支付',
    1: '支付中',
    2: '已支付',
    3: '支付失败',
    4: '已退款'
  }
  return statusMap[status] || '未知'
}

// 商品成色文本
const getProductQualityText = (quality) => {
  const qualityMap = {
    1: '全新',
    2: '几乎全新',
    3: '二手良品',
    4: '有使用痕迹',
    5: '功能正常'
  }
  return qualityMap[quality] || '未知'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 返回上一页
const goBack = () => {
  router.push('/admin/orders')
}

// 修改订单状态
const changeStatus = async (status) => {
  try {
    await store.updateOrderStatus(store.currentOrder.id, status)
    ElMessage.success('订单状态更新成功')
  } catch (error) {
    console.error('状态更新失败', error)
    ElMessage.error('状态更新失败')
  }
}

// 删除订单
const deleteOrder = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要删除该订单吗？此操作不可恢复',
        '警告',
        {type: 'error', confirmButtonText: '确认删除'}
    )
    await store.removeOrder(store.currentOrder.id)
    ElMessage.success('订单删除成功')
    goBack()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除订单失败')
    }
  }
}

// 初始化加载
onMounted(() => {
  store.setAdminRole(true)
  store.fetchOrderDetail(route.params.id)
})
</script>

<style scoped>
.order-detail-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.info-item {
  min-width: 300px;
}

.label {
  color: #909399;
}

.value {
  font-weight: 500;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  background-color: #f5f7fa;
  font-size: 24px;
}

.product-detail h3 {
  margin: 0 0 10px 0;
}

.product-quality {
  margin-bottom: 10px;
  color: #606266;
}

.price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-detail .name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.user-detail .id {
  color: #909399;
  font-size: 14px;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
