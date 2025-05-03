<template>
  <div class="chat-container">
    <div class="chat-header">
      <el-page-header @back="goBack" :title="chatTitle" />
    </div>
    
    <div class="chat-content" v-loading="messageStore.loading">
      <!-- 聊天记录为空时的提示 -->
      <div v-if="messageStore.chatHistory.length === 0" class="empty-chat">
        <el-empty description="暂无聊天记录">
          <template #description>
            <p>开始与{{ targetUserNickname }}的对话吧</p>
          </template>
        </el-empty>
      </div>
      
      <!-- 聊天记录区域 -->
      <div v-else class="message-area" ref="messageAreaRef">
        <div v-for="(group, index) in messageStore.groupedChatHistory" :key="index" class="message-group">
          <div class="date-divider">
            <span>{{ formatMessageDate(group.date) }}</span>
          </div>
          
          <template v-for="message in group.messages" :key="message.id">
            <div class="message-bubble"
              :class="{ 'self': message.isSelf, 'other': !message.isSelf }">
              <el-avatar v-if="!message.isSelf" :size="40" :src="getAvatarUrl(message.senderAvatar)" />
              <div class="message-content">
                <div v-if="!message.type || message.type === 'TEXT'" class="text-message">{{ message.content }}</div>
                
                <div v-else-if="message.type === 'IMAGE'" class="image-message">
                  <el-image :src="getImageUrl(message.content)" :preview-src-list="[getImageUrl(message.content)]"></el-image>
                </div>
                
                <div v-else-if="message.type === 'PRODUCT'" class="product-message" @click="viewProduct(message.relatedProductId)">
                  <el-card shadow="hover" class="product-card">
                    <div class="product-info">
                      <img v-if="message.productData && message.productData.coverImage" :src="getImageUrl(message.productData.coverImage)" class="product-image">
                      <div class="product-details">
                        <div class="product-title">{{ message.productData ? message.productData.title : '商品信息' }}</div>
                        <div class="product-price">¥{{ message.productData ? message.productData.price : '0.00' }}</div>
                      </div>
                    </div>
                  </el-card>
                </div>
                
                <div v-else-if="message.type === 'ORDER'" class="order-message" @click="viewOrder(message.relatedOrderId)">
                  <el-card shadow="hover" class="order-card">
                    <div class="order-info">
                      <div class="order-title">订单: {{ message.orderData ? message.orderData.orderNo : '订单信息' }}</div>
                      <div class="order-status">{{ message.orderData ? message.orderData.statusText : '' }}</div>
                    </div>
                  </el-card>
                </div>
                
                <div class="message-time">
                  {{ formatMessageTime(message.createTime) }}
                  <el-icon v-if="message.isSelf" :class="{ 'read': message.isRead }">
                    <Check />
                  </el-icon>
                </div>
              </div>
              <el-avatar v-if="message.isSelf" :size="40" :src="getAvatarUrl(message.senderAvatar)" />
            </div>
          </template>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">

        
        <div class="message-editor">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            resize="none"
            @keydown.enter.prevent="sendMessage"
          ></el-input>
          <el-button type="primary" @click="sendMessage" :disabled="!messageInput.trim()">发送</el-button>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useFileStore } from '@/stores/file'
import { formatDateTime } from '@/utils/format'
import { ElMessage } from 'element-plus'
import { Picture, ShoppingCart, Document, Check, Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()
const productStore = useProductStore()
const orderStore = useOrderStore()
const fileStore = useFileStore()

// 获取目标用户ID
const targetUserId = computed(() => Number(route.params.id))

// 默认头像和图片
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const defaultProductImage = '/images/default-product.png'

// 当前用户信息
const currentUserId = computed(() => userStore.userId)
const currentUserAvatar = computed(() => userStore.avatar)

// 目标用户信息
const targetUserNickname = ref('')
const targetUserAvatar = ref('')

// 调试信息显示开关
const showDebugInfo = ref(false) // 设置为true以显示调试信息

// 聊天标题
const chatTitle = computed(() => `与${targetUserNickname.value || '用户' + targetUserId.value}的聊天`)

// 消息输入
const messageInput = ref('')
const messageAreaRef = ref(null)

// 图片上传
const imageUploadVisible = ref(false)
const imageUrl = ref('')

// 商品选择
const productSelectVisible = ref(false)
const userProducts = ref([])
const productsLoading = ref(false)

// 订单选择
const orderSelectVisible = ref(false)
const userOrders = ref([])
const ordersLoading = ref(false)

// 轮询间隔（毫秒）
const POLL_INTERVAL = 10000
let pollTimer = null

// 获取头像完整URL
const getAvatarUrl = (path) => {
  if (!path) return defaultAvatar
  
  // 检查是否已经是完整URL
  if (path.startsWith('http')) {
    return path
  }
  
  // 使用fileStore处理头像路径
  return fileStore.getFullUrl(path)
}

// 获取图片完整URL
const getImageUrl = (path) => {
  if (!path) return defaultProductImage
  
  // 检查是否已经是完整URL
  if (path.startsWith('http')) {
    return path
  }
  
  // 使用fileStore处理图片路径
  return fileStore.getFullUrl(path)
}

// 返回消息中心
const goBack = () => {
  router.push('/user/messages')
}

// 格式化消息日期
const formatMessageDate = (date) => {
  const today = new Date().toLocaleDateString()
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
  
  if (date === today) return '今天'
  if (date === yesterday) return '昨天'
  return date
}

// 格式化消息时间
const formatMessageTime = (time) => {
  return formatDateTime(time, 'HH:mm')
}

// 发送文本消息
const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  try {
    await messageStore.sendNewMessage({
      receiverId: targetUserId.value,
      content: messageInput.value.trim(),
      type: 'TEXT'
    })
    
    // 清空输入框
    messageInput.value = ''
    
    // 滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  }
}

// 打开图片上传对话框
const openUploadImage = () => {
  imageUrl.value = ''
  imageUploadVisible.value = true
}

// 图片上传前的验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  
  return isImage && isLt2M
}

// 图片上传成功回调
const handleImageSuccess = (response) => {
  if (response.code === 200) {
    imageUrl.value = response.data.url
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 发送图片消息
const sendImageMessage = async () => {
  if (!imageUrl.value) return
  
  try {
    await messageStore.sendNewMessage({
      receiverId: targetUserId.value,
      content: imageUrl.value,
      type: 'IMAGE'
    })
    
    // 关闭对话框
    imageUploadVisible.value = false
    
    // 滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('发送图片消息失败:', error)
    ElMessage.error('发送图片消息失败，请重试')
  }
}

// 打开商品选择对话框
const openProductSelector = async () => {
  productsLoading.value = true
  productSelectVisible.value = true
  
  try {
    const result = await productStore.fetchUserProducts()
    userProducts.value = result?.records || []
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    productsLoading.value = false
  }
}

// 选择商品并发送商品消息
const selectProduct = async (product) => {
  try {
    await messageStore.sendNewMessage({
      receiverId: targetUserId.value,
      content: JSON.stringify({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.coverImage
      }),
      type: 'PRODUCT',
      relatedProductId: product.id
    })
    
    // 关闭对话框
    productSelectVisible.value = false
    
    // 滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('发送商品消息失败:', error)
    ElMessage.error('发送商品消息失败，请重试')
  }
}

// 打开订单选择对话框
const openOrderSelector = async () => {
  ordersLoading.value = true
  orderSelectVisible.value = true
  
  try {
    const result = await orderStore.fetchBuyerOrders()
    userOrders.value = result?.records || []
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    ordersLoading.value = false
  }
}

// 选择订单并发送订单消息
const selectOrder = async (order) => {
  try {
    await messageStore.sendNewMessage({
      receiverId: targetUserId.value,
      content: JSON.stringify({
        orderNo: order.orderNo,
        status: order.status,
        statusText: order.statusText,
        amount: order.totalAmount
      }),
      type: 'ORDER',
      relatedOrderId: order.id
    })
    
    // 关闭对话框
    orderSelectVisible.value = false
    
    // 滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('发送订单消息失败:', error)
    ElMessage.error('发送订单消息失败，请重试')
  }
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

// 查看商品详情
const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 查看订单详情
const viewOrder = (orderId) => {
  router.push(`/user/order/${orderId}`)
}

// 滚动到消息区域底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight
    }
  })
}

// 启动聊天轮询
const startChatPolling = () => {
  // 设置定时器，每隔一段时间刷新聊天记录
  pollTimer = setInterval(() => {
    refreshChatHistory()
  }, POLL_INTERVAL)
}

// 刷新聊天记录
const refreshChatHistory = async () => {
  await messageStore.fetchChatHistory(targetUserId.value);
  scrollToBottom();
}

// 加载目标用户信息
const loadTargetUserInfo = async () => {
  try {
    // 使用messageStore中的方法获取用户信息
    const userInfo = await messageStore.getUserById(targetUserId.value)
    if (userInfo) {
      targetUserNickname.value = userInfo.nickname || `用户${targetUserId.value}`
      targetUserAvatar.value = getAvatarUrl(userInfo.avatar)
    }
  } catch (error) {
    console.error('获取目标用户信息失败:', error)
    targetUserNickname.value = `用户${targetUserId.value}`
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 设置当前聊天用户
  messageStore.setCurrentChatUser({ id: targetUserId.value })
  
  // 加载聊天历史
  await messageStore.fetchChatHistory(targetUserId.value)
  
  // 加载目标用户信息
  await loadTargetUserInfo()
  
  // 标记所有消息为已读
  await messageStore.markAllMessagesAsRead(targetUserId.value)
  
  // 开始轮询聊天记录
  startChatPolling()
  
  // 滚动到底部
  scrollToBottom()
})

// 组件卸载时清理
onUnmounted(() => {
  // 清除定时器
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  
  // 重置当前聊天用户
  messageStore.setCurrentChatUser(null)
})
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 230px);
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.chat-header {
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 15px;
}

.empty-chat {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 15px;
}

.date-divider {
  text-align: center;
  margin: 10px 0;
  position: relative;
}

.date-divider span {
  background-color: #f5f7fa;
  padding: 0 10px;
  font-size: 12px;
  color: #909399;
  position: relative;
  z-index: 1;
}

.date-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #ebeef5;
  z-index: 0;
}

.message-bubble {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.message-bubble.self {
  flex-direction: row-reverse;
}

.message-content {
  margin: 0 10px;
  max-width: 70%;
}

.text-message {
  padding: 10px 15px;
  border-radius: 8px;
  position: relative;
  word-break: break-word;
  white-space: pre-wrap;
}

.self .text-message {
  background-color: #ecf5ff;
  color: #303133;
}

.other .text-message {
  background-color: #f4f4f5;
  color: #303133;
}

.image-message {
  max-width: 250px;
  border-radius: 8px;
  overflow: hidden;
}

.image-message .el-image {
  width: 100%;
  border-radius: 8px;
}

.product-message, .order-message {
  width: 250px;
  cursor: pointer;
}

.product-card, .order-card {
  margin: 0;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.product-details, .order-info {
  flex: 1;
  overflow: hidden;
}

.product-title, .order-title, .order-no {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #f56c6c;
  font-size: 14px;
  font-weight: 500;
}

.order-product {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-price {
  color: #f56c6c;
  font-size: 14px;
  font-weight: 500;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  display: flex;
  align-items: center;
}

.self .message-time {
  justify-content: flex-end;
}

.message-time .el-icon {
  margin-left: 5px;
  font-size: 14px;
  color: #c0c4cc;
}

.message-time .read {
  color: #67c23a;
}

.input-area {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.message-toolbar {
  margin-bottom: 10px;
}

.message-editor {
  display: flex;
  align-items: flex-end;
}

.message-editor .el-textarea {
  flex: 1;
  margin-right: 10px;
}

.image-uploader {
  text-align: center;
}

.preview-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-list, .order-list {
  max-height: 400px;
  overflow-y: auto;
}

.product-items, .order-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.product-item, .order-item {
  cursor: pointer;
  transition: all 0.3s;
}

.product-item:hover, .order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card-content {
  display: flex;
  align-items: center;
}

.order-card-content {
  padding: 5px;
}
</style>