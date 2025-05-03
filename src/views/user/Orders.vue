<template>
  <div class="orders-container">
    <h2 class="page-title">我的订单</h2>
    
    <!-- 角色切换 -->
    <div class="role-selector">
      <el-radio-group v-model="activeRole" @change="handleRoleChange">
        <el-radio-button :value="'buyer'">我购买的</el-radio-button>
        <el-radio-button :value="'seller'">我出售的</el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- 订单状态标签页 -->
    <el-tabs v-model="activeStatus" @tab-click="handleTabClick">
      <el-tab-pane label="全部订单" name="0">
        <span slot="label">全部订单</span>
      </el-tab-pane>
      <el-tab-pane name="1">
        <template #label>
          待付款
          <el-badge 
            v-if="statusCounts[1] > 0" 
            :value="statusCounts[1]" 
            class="status-badge" 
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="2">
        <template #label>
          待发货
          <el-badge 
            v-if="statusCounts[2] > 0" 
            :value="statusCounts[2]" 
            class="status-badge" 
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="3">
        <template #label>
          待收货
          <el-badge 
            v-if="statusCounts[3] > 0" 
            :value="statusCounts[3]" 
            class="status-badge" 
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="4">
        <template #label>
          已完成
          <el-badge 
            v-if="statusCounts[4] > 0" 
            :value="statusCounts[4]" 
            class="status-badge" 
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="5">
        <template #label>
          已取消
          <el-badge 
            v-if="statusCounts[5] > 0" 
            :value="statusCounts[5]" 
            class="status-badge" 
          />
        </template>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 订单内容区域 -->
    <div class="orders-content" v-loading="orderStore.loading">
      <!-- 无订单提示 -->
      <div v-if="displayOrders.length === 0" class="empty-orders">
        <el-empty description="暂无相关订单">
          <el-button type="primary" @click="goShopping">去购物</el-button>
        </el-empty>
      </div>
      
      <!-- 订单列表 -->
      <div v-else class="order-list">
        <el-card v-for="order in displayOrders" :key="order.id" class="order-card">
          <!-- 订单头部 -->
          <div class="order-header">
            <span class="order-time">{{ formatDate(order.createTime) }}</span>
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <el-tag :type="getStatusType(order.status)" size="small">
              {{ order.statusText }}
            </el-tag>
          </div>
          
          <!-- 订单内容 -->
          <div class="order-content" @click="viewOrderDetail(order.id)">
            <div class="product-info">
              <el-image 
                :src="getProductImageUrl(order)"
                class="product-image"
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
              <div class="product-details">
                <h3 class="product-title">{{ order.product && order.product.title }}</h3>
                <p class="product-price">¥{{ order.product && order.product.price ? order.product.price.toFixed(2) : '0.00' }}</p>
              </div>
            </div>
            <div class="order-summary">
              <div class="order-amount">
                <p class="total-label">实付款</p>
                <p class="total-price">¥{{ order.product && order.product.price ? order.product.price.toFixed(2) : '0.00' }}</p>
              </div>
            </div>
          </div>
          
          <!-- 订单操作 -->
          <div class="order-actions">
            <template v-if="activeRole === 'buyer'">
              <!-- 买家操作 -->
              <el-button 
                v-if="order.status === 1" 
                type="primary" 
                size="small"
                @click="payOrder(order)"
              >
                去支付
              </el-button>
              
              <el-button 
                v-if="order.status === 3" 
                type="success" 
                size="small"
                @click="confirmReceive(order.id)"
              >
                确认收货
              </el-button>
              
              <el-button 
                v-if="order.status === 1" 
                type="danger" 
                size="small"
                @click="cancelOrder(order.id)"
              >
                取消订单
              </el-button>
              
              <el-button 
                v-if="order.status === 4" 
                type="primary" 
                plain
                size="small"
                @click="buyAgain(order)"
              >
                再次购买
              </el-button>
              
              <el-button 
                v-if="order.status === 4 && !order.commented && order.isCommented !== 1" 
                type="success" 
                plain
                size="small"
                @click="openCommentDialog(order)"
              >
                评价
              </el-button>
            </template>
            
            <template v-else>
              <!-- 卖家操作 -->
              <el-button 
                v-if="order.status === 2" 
                type="primary" 
                size="small"
                @click="shipOrder(order.id)"
              >
                发货
              </el-button>
              
              <el-button 
                type="info" 
                plain
                size="small"
                @click="viewOrderDetail(order.id)"
              >
                订单详情
              </el-button>
            </template>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="displayOrders.length > 0">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="pagination.total"
          :page-size="pagination.size"
          :current-page="pagination.current"
          :page-sizes="[5, 10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </div>
    
    <!-- 支付确认对话框 -->
    <el-dialog v-model="paymentDialogVisible" title="支付确认" width="400px" :close-on-click-modal="false" :close-on-press-escape="false">
      <div v-if="currentOrder" class="payment-confirm">
        <div class="payment-amount">
          <div>支付金额</div>
          <div class="price">￥{{ currentOrder && currentOrder.totalAmount ? currentOrder.totalAmount.toFixed(2) : '0.00' }}</div>
        </div>
        
        <!-- 支付方式选择 -->
        <div class="payment-method-info">
          <div>支付方式:</div>
          <el-radio-group v-model="paymentMethod" @change="onPaymentMethodChange" :disabled="paymentStatus > 0">
            <el-radio :label="1">支付宝</el-radio>
            <el-radio :label="2">微信支付</el-radio>
            <el-radio :label="3">银行卡</el-radio>
          </el-radio-group>
        </div>
        
        <div class="payment-qrcode">
          <img :src="orderQrCode || defaultQrCode" alt="支付二维码" />
          <div class="qrcode-tip">
            <p>订单号: {{ currentOrderNo }}</p>
            <p>请使用{{ paymentMethodText }}扫码支付</p>
          </div>
        </div>
        
        <div class="payment-status-wrapper">
          <el-tag v-if="paymentStatus > 0" 
                  :type="paymentStatus === 2 ? 'success' : paymentStatus === 3 ? 'danger' : 'info'"
                  size="large"
                  class="payment-status-tag">
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
    
    <!-- 评价对话框 -->
    <el-dialog v-model="commentDialogVisible" title="评价商品" width="500px" :close-on-click-modal="true">
      <comment-form
        :order-id="currentOrder?.id"
        :product-id="currentOrder?.productId"
        :product="currentOrder?.product"
        v-model:rating="commentForm.rating"
        v-model:content="commentForm.content"
        @update:images="commentForm.images = $event"
        ref="commentFormRef"
      />
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelComment">取消</el-button>
          <el-button type="primary" @click="submitComment" :loading="commentSubmitting">提交评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template> 

<script setup>
import { ref, computed, onMounted, watch, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useFileStore } from '@/stores/file'
import { useCommentStore } from '@/stores/comment'
import { Picture, Plus } from '@element-plus/icons-vue'
import CommentForm from '@/components/CommentForm.vue'
import { formatDateTime } from '@/utils/format'

// 默认图片路径
const DEFAULT_PRODUCT_IMAGE = '/images/default-product.png'
// 使用Base64默认二维码图片
const defaultQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAVFSURBVHic7dzRbdswFIZRI5mgG7SDbtJ9O0k36QbdpCN0hI6gBUpABmLYz0l4DkDkJYjEBz8hUjbw8vLvDMDHftr9BICnJhAgCARIBAIkAgESgQCJQIBEIEAiECARCJAIBEgEAiQCAZLXoz/g5eXljz/n+/v7tPc6es+j9zzy3P/rzp+fv29//rzf/L39+Nm8l1//L7vnkcfv3bvTs3n9tX358V4QIBEIkAgESAQCJAIBEoEAiUCAZPo+yCPZsxizndZ1n7Ur45m93P97vSBAIhAgEQiQCARIBAIkAgESgQCJfZCTvdHZrbP3Kc7eJ9jLCwIkAgESgQCJQIBEIEAiECARCJDYB9nAvszZVthPedu91nv2LQQBEoEAiUCAZIsgnvGc4+hrz+zZs3/Oe8+j99n767CTFwRIBAIkAgESgQCJQIBEIEAiECDZYh/EMT8wjxcESAQCJAIBEoEAiUCAZPoq1tEVh7NXLaxGjLHitWfv5+w73hcefX8vCJAIBEgEAiQCARKBAIlAgEQgQDJ9H+SzR+2tWHU5em5Hfc7r7+cFARKBAIlAgEQgQCIQIBEIkAgESLbYB/ns2fdKnjmOHYbrXr94QYBEIEAiECARCJAIBEgEAiQCAZKn3wfZsTdw9Nzs15/NOcpXeUGARCBAIhAgEQiQCARIBAIkAgESx5wcZIXM6lfzhz94QYBEIEAiECARCJAIBEgEAiQCAZKn3wdZ4RmP+fkqLwiQCARIBAIkAgESgQCJQIBEIEDyNPsgK/YSZvw9uO7sczN3fH8cX+MFARKBAIlAgEQgQCIQIBEIkAgESLbYB3mmfYx73Ptzzz7Hd/T9n/m7W80LAiQCARKBAIlAgEQgQCIQIBEIkGzxfJBn8sx7MUcdfb7KCp/zs3+WHbwgQCIQIBEIkAgESAQCJAIBki1WsWasJKywYuXl7NWWHSsf9z6/u78DXhAgEQiQCARIBAIkAgESgQCJQIDkkZ/xffbeyQr3HoPy/f05zn52nxcESAQCJAIBEoEAiUCAZPovG1f85TMrVk3O/svn7O/B0VWpFX+d3Zt9P7wgQCIQIBEIkAgESAQCJAIBEoEAyd/3foBrK4598XyOe3//2Y7+Hp7x+CMvCJAIBEgEAiQCARKBAIlAgEQgQPIL9+6rqDLM+VsAAAAASUVORK5CYII='

const router = useRouter()
const orderStore = useOrderStore()
const productStore = useProductStore()
const fileStore = useFileStore()
const commentStore = useCommentStore()

// 角色：买家/卖家
const activeRole = ref('buyer')
// 订单状态筛选
const activeStatus = ref('0')
// 加载状态
const loading = ref(false)

// 添加支付相关状态
const paymentDialogVisible = ref(false)
const paymentMethod = ref(1)
const paymentStatus = ref(0) // 0-未支付 1-支付中 2-支付成功 3-支付失败
const currentOrder = ref(null)
const orderQrCode = ref('') // 订单支付二维码
const currentOrderNo = ref('') // 当前订单编号

// 评价相关状态
const commentDialogVisible = ref(false)
const commentSubmitting = ref(false)
const commentForm = reactive({
  orderId: null,
  productId: null,
  rating: 5,
  content: '',
  images: []
})

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

// 评价表单引用
const commentFormRef = ref(null)

// 初始化页面
const initPage = async () => {
  loading.value = true
  try {
    // 根据角色获取订单列表
    if (activeRole.value === 'buyer') {
      await orderStore.fetchBuyerOrders({
        status: activeStatus.value !== '0' ? Number(activeStatus.value) : null
      })
    } else {
      await orderStore.fetchSellerOrders({
        status: activeStatus.value !== '0' ? Number(activeStatus.value) : null
      })
    }
    
    // 处理订单中的商品数据
    await processOrderProductData()
  } catch (error) {
    console.error('获取订单数据失败:', error)
    ElMessage.error('获取订单数据失败')
  } finally {
    loading.value = false
  }
}

// 处理订单中的商品数据
const processOrderProductData = async () => {
  const orders = activeRole.value === 'buyer' ? orderStore.buyerOrders : orderStore.sellerOrders
  
  if (orders && orders.length > 0) {
    for (const order of orders) {
      // 为每个订单添加product对象（如果不存在）
      if (!order.product) {
        order.product = {
          title: order.productTitle || '商品信息不可用',
          price: order.price || 0,
          imageUrl: null
        }
      }
      
      // 如果有productId但没有完整的product数据，尝试从product store获取
      if (order.productId && (!order.product.id)) {
        try {
          const productData = await productStore.fetchProductDetail(order.productId)
          if (productData) {
            order.product = productData
            continue
          }
        } catch (error) {
          console.error('获取商品详情失败:', error)
        }
      }
      
      // 处理商品图片
      // 1. 设置默认图片属性
      if (!order.product.imageUrl && order.productImage) {
        order.product.imageUrl = fileStore.getFullUrl(order.productImage)
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
          console.error('解析商品图片JSON失败:', e, order.product.images)
          order.product.images = []
        }
      }
      
      // 4. 如果只有imageUrl但没有coverImage和images
      if (order.product.imageUrl && !order.product.coverImage && (!order.product.images || order.product.images.length === 0)) {
        order.product.coverImage = order.product.imageUrl
        order.product.images = [order.product.imageUrl]
      }
      
      // 5. 如果是订单商品图片直接赋值
      if (!order.product.coverImage && !order.product.imageUrl && order.productImage) {
        const imageUrl = fileStore.getFullUrl(order.productImage)
        order.product.imageUrl = imageUrl
        order.product.coverImage = imageUrl
        order.product.images = [imageUrl]
      }
      
      // 设置其它默认值
      if (!order.product.title) {
        order.product.title = order.productTitle || '商品信息不完整'
      }
      
      if (!order.product.price && order.price) {
        order.product.price = order.price
      }
      
      // 检查已完成的订单是否已评价
      if (order.status === 4) {
        // 优先使用order对象中的isCommented字段
        if (order.isCommented === 1) {
          order.commented = true
        } else {
          // 如果isCommented字段为0或null，再调用API查询
          try {
            const isCommented = await commentStore.checkOrderCommented(order.id)
            order.commented = isCommented
          } catch (error) {
            console.error('检查订单评价状态失败:', error)
            order.commented = false
          }
        }
      }
    }
  }
}

// 处理角色切换
const handleRoleChange = () => {
  // 重置状态选项
  activeStatus.value = '0'
  initPage()
}

// 处理标签切换
const handleTabClick = () => {
  initPage()
}

// 显示的订单列表
const displayOrders = computed(() => {
  if (activeRole.value === 'buyer') {
    return orderStore.buyerOrders || [];
  } else {
    return orderStore.sellerOrders || [];
  }
})

// 订单状态计数
const statusCounts = computed(() => {
  if (activeRole.value === 'buyer') {
    return orderStore.orderStatusCounts.buyer
  } else {
    return orderStore.orderStatusCounts.seller
  }
})

// 当前分页信息
const pagination = computed(() => {
  if (activeRole.value === 'buyer') {
    return orderStore.buyerPagination
  } else {
    return orderStore.sellerPagination
  }
})

// 处理分页变化
const handlePageChange = (page) => {
  if (activeRole.value === 'buyer') {
    orderStore.changeBuyerPage(page)
  } else {
    orderStore.changeSellerPage(page)
  }
}

// 处理每页条数变化
const handlePageSizeChange = (size) => {
  if (activeRole.value === 'buyer') {
    orderStore.changeBuyerPageSize(size)
  } else {
    orderStore.changeSellerPageSize(size)
  }
}

// 格式化日期
const formatDate = (date) => {
  return formatDateTime(date)
}

// 获取订单状态对应的类型
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
    return DEFAULT_PRODUCT_IMAGE
  }
  return product.imageUrl
}

// 获取商品图片URL，优先级：产品封面 > 产品图片 > 订单商品图片 > 默认图片
const getProductImageUrl = (order) => {
  if (!order) return DEFAULT_PRODUCT_IMAGE
  
  // 检查产品对象
  if (order.product) {
    // 1. 检查封面图片
    if (order.product.coverImage) {
      return order.product.coverImage
    }
    
    // 2. 检查产品图片
    if (order.product.imageUrl) {
      return order.product.imageUrl
    }
    
    // 3. 检查图片数组的第一张
    if (order.product.images && order.product.images.length > 0) {
      if (typeof order.product.images === 'string') {
        try {
          const images = JSON.parse(order.product.images)
          if (images && images.length > 0) {
            return images[0]
          }
        } catch (e) {
          console.error('解析产品图片字符串失败:', e)
        }
      } else if (Array.isArray(order.product.images) && order.product.images.length > 0) {
        return order.product.images[0]
      }
    }
  }
  
  // 4. 检查订单中的商品图片
  if (order.productImage) {
    return fileStore.getFullUrl(order.productImage)
  }
  
  // 5. 返回默认图片
  return DEFAULT_PRODUCT_IMAGE
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/user/order/${orderId}`)
}

// 去支付
const payOrder = (order) => {
  if (!order || !order.id) {
    ElMessage.error('订单数据无效，无法支付')
    return
  }
  
  // 保存当前订单
  currentOrder.value = order
  
  // 确保总金额存在
  if (!currentOrder.value.totalAmount) {
    if (order.product && order.product.price) {
      currentOrder.value.totalAmount = order.product.price
    } else {
      currentOrder.value.totalAmount = 0
    }
  }
  
  // 生成订单编号（如果不存在）
  currentOrderNo.value = order.orderNo || `ORDER${new Date().getTime()}${order.id}`
  
  // 重置支付状态
  paymentStatus.value = 0
  paymentMethod.value = 1
  
  // 显示支付对话框
  paymentDialogVisible.value = true
  
  // 在对话框显示后生成支付二维码
  setTimeout(() => {
    // 生成支付二维码
    generateOrderQrCode(order.id, paymentMethod.value, currentOrder.value.totalAmount)
  }, 100)
}

// 生成订单支付二维码
const generateOrderQrCode = async (orderId, method, amount) => {
  try {
    const qrCode = await orderStore.generateOrderQrCode(orderId, method, amount)
    if (qrCode) {
      orderQrCode.value = qrCode
      console.log('支付二维码生成成功')
    }
  } catch (error) {
    console.error('生成支付二维码失败:', error)
    ElMessage.error('生成支付二维码失败')
  }
}

// 确认支付
const confirmPayment = async () => {
  if (!currentOrder.value) return
  
  // 如果已经支付成功或失败，直接关闭对话框
  if (paymentStatus.value === 2) {
    paymentDialogVisible.value = false
    initPage()
    return
  }
  
  if (paymentStatus.value === 3) {
    paymentDialogVisible.value = false
    return
  }
  
  // 设置为支付中
  paymentStatus.value = 1
  
  try {
    // 构建支付数据
    const paymentData = {
      amount: currentOrder.value.totalAmount || 0,
      paymentMethod: paymentMethod.value,
      message: currentOrder.value.message || '',
      orderNo: currentOrderNo.value // 添加订单编号
    }
    
    console.log('支付数据:', currentOrder.value.id, paymentData)
    
    // 调用支付API
    const paymentResult = await orderStore.submitPayment(currentOrder.value.id, paymentData)
    
    if (paymentResult) {
      paymentStatus.value = 2 // 支付成功
      ElMessage.success('支付成功！')
      
      // 2秒后自动关闭对话框并刷新
      setTimeout(() => {
        paymentDialogVisible.value = false
        orderQrCode.value = ''
        currentOrderNo.value = ''
        initPage()
      }, 2000)
    } else {
      paymentStatus.value = 3 // 支付失败
      ElMessage.error('支付失败，请重试')
    }
  } catch (error) {
    console.error('支付失败:', error)
    paymentStatus.value = 3 // 支付失败
    ElMessage.error('支付失败，请重试')
  }
}

// 取消支付
const cancelPayment = () => {
  // 如果支付中，不允许取消
  if (paymentStatus.value === 1) return
  
  paymentDialogVisible.value = false
  currentOrder.value = null
  orderQrCode.value = ''
  currentOrderNo.value = ''
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
          // 刷新列表
          initPage()
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
          // 刷新列表
          initPage()
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

// 再次购买
const buyAgain = async (order) => {
  if (order.product && order.product.id) {
    router.push(`/product/${order.product.id}`)
  } else if (order.productId) {
    try {
      // 如果没有product.id但有productId，先尝试获取商品信息
      ElMessage.info('正在获取商品信息...')
      const productData = await productStore.fetchProductDetail(order.productId)
      if (productData && productData.id) {
        router.push(`/product/${productData.id}`)
      } else {
        ElMessage.warning('商品信息不可用，无法再次购买')
      }
    } catch (error) {
      console.error('获取商品信息失败:', error)
      ElMessage.warning('商品信息不可用，无法再次购买')
    }
  } else {
    ElMessage.warning('商品信息不可用，无法再次购买')
  }
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
          // 刷新列表
          initPage()
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

// 去购物
const goShopping = () => {
  router.push('/')
}

// 监听URL参数变化
watch(
  () => router.currentRoute.value.query,
  (query) => {
    if (query.role) {
      activeRole.value = query.role === 'seller' ? 'seller' : 'buyer'
    }
    if (query.status) {
      activeStatus.value = query.status
    }
  },
  { immediate: true }
)

// 组件挂载时加载订单
onMounted(() => {
  initPage()
})

// 打开评价对话框
const openCommentDialog = (order) => {
  currentOrder.value = order
  
  // 重置评价表单
  commentForm.orderId = order.id
  commentForm.productId = order.productId
  commentForm.rating = 5
  commentForm.content = ''
  commentForm.images = []
  
  commentDialogVisible.value = true
  
  // 在下一个tick中重置表单
  nextTick(() => {
    if (commentFormRef.value) {
      commentFormRef.value.reset()
    }
  })
}

// 取消评价
const cancelComment = () => {
  commentDialogVisible.value = false
  currentOrder.value = null
}

// 提交评价
const submitComment = async () => {
  if (!commentForm.content || commentForm.content.trim() === '') {
    ElMessage.warning('请输入评价内容')
    return
  }
  
  commentSubmitting.value = true
  
  try {
    // 构建评价数据
    const commentData = {
      orderId: commentForm.orderId,
      productId: commentForm.productId,
      rating: commentForm.rating,
      content: commentForm.content,
      images: commentForm.images
    }
    
    // 调用评价API
    const result = await commentStore.submitComment(commentData)
    
    if (result) {
      ElMessage.success('评价提交成功')
      
      // 更新订单评价状态
      if (currentOrder.value) {
        currentOrder.value.commented = true
        currentOrder.value.isCommented = 1
      }
      
      // 刷新订单列表
      commentDialogVisible.value = false
      currentOrder.value = null
      
      // 重新加载订单
      initPage()
    }
  } catch (error) {
    console.error('评价提交失败:', error)
    ElMessage.error('评价提交失败，请重试')
  } finally {
    commentSubmitting.value = false
  }
}

// 获取商品成色文本
const getConditionText = (productQuality) => {
  return productStore.productQualityMap[productQuality] || '未知'
}

// 组件卸载时清理资源
onBeforeUnmount(() => {
  // 重置支付相关状态
  paymentStatus.value = 0
  currentOrder.value = null
  orderQrCode.value = ''
  currentOrderNo.value = ''
})

// 支付方式变更时重新生成二维码
const onPaymentMethodChange = () => {
  if (!currentOrder.value) return
  // 重新生成二维码
  generateOrderQrCode(currentOrder.value.id, paymentMethod.value, currentOrder.value.totalAmount)
}
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.role-selector {
  margin-bottom: 20px;
}

.status-badge {
  margin-left: 8px;
}

.orders-content {
  margin-top: 20px;
}

.empty-orders {
  padding: 40px 0;
  text-align: center;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  margin-bottom: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #909399;
}

.order-content {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  cursor: pointer;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  color: #909399;
  background-color: #f5f7fa;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.product-price {
  margin: 0;
  font-size: 15px;
  color: #f56c6c;
}

.order-summary {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.order-amount {
  text-align: right;
}

.total-label {
  margin: 0 0 4px;
  font-size: 14px;
  color: #909399;
}

.total-price {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.order-actions .el-button {
  margin-left: 10px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
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

.payment-amount .price {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: bold;
}

.payment-method-info {
  margin-bottom: 20px;
  text-align: center;
}

.payment-method-info div:first-child {
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}

.payment-method-info .el-radio-group {
  display: flex;
  justify-content: center;
  gap: 16px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  max-width: 250px;
}

.payment-qrcode img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
}

.qrcode-tip p {
  margin: 4px 0;
}

.payment-status-wrapper {
  margin-top: 20px;
  text-align: center;
}

.payment-status-tag {
  font-size: 20px;
  font-weight: bold;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

/* 评价表单样式已移至CommentForm组件中 */
</style> 