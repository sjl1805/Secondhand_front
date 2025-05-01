<template>
  <div class="messages-container">
    <div class="page-header">
      <h2 class="page-title">消息中心</h2>
      <el-badge :value="messageStore.unreadCount" :hidden="messageStore.unreadCount <= 0" type="danger">
        <span>未读消息</span>
      </el-badge>
    </div>

    <div class="messages-content" v-loading="messageStore.loading">
      <!-- 无消息时的提示 -->
      <el-empty v-if="messageStore.getContactGroups.length === 0" description="暂无消息">
        <template #description>
          <p>您还没有任何消息记录</p>
        </template>
      </el-empty>
      
      <!-- 消息列表 -->
      <div v-else class="message-list">
        <el-card 
          v-for="contact in messageStore.getContactGroups" 
          :key="contact.id" 
          class="message-item"
          :class="{'unread': contact.unreadCount > 0}"
          @click="goToChat(contact)"
        >
          <div class="contact-info">
            <el-avatar :size="50" :src="getAvatarUrl(contact.avatar)"></el-avatar>
            <div class="contact-details">
              <div class="contact-header">
                <span class="contact-name">{{ contact.name }}</span>
                <span class="message-time">{{ formatTime(contact.latestMessage.createTime) }}</span>
              </div>
              <div class="message-preview">
                <p class="message-content">{{ getMessagePreview(contact.latestMessage) }}</p>
                <el-badge v-if="contact.unreadCount > 0" :value="contact.unreadCount" type="danger" />
              </div>
              <!-- 调试信息，用于验证消息数据 -->
              <div v-if="showDebugInfo" class="debug-info">
                <p>发送者ID: {{ contact.latestMessage.senderId }}</p>
                <p>接收者ID: {{ contact.latestMessage.receiverId }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { useFileStore } from '@/stores/file'
import { formatRelativeTime } from '@/utils/format'

const router = useRouter()
const messageStore = useMessageStore()
const fileStore = useFileStore()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 轮询间隔（毫秒）
const POLL_INTERVAL = 30000
let pollTimer = null

// 是否显示调试信息
const showDebugInfo = ref(false) // 设置为true可以显示调试信息

// 跳转到聊天页面
const goToChat = (contact) => {
  router.push(`/user/chat/${contact.id}`)
}

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

// 格式化时间为相对时间
const formatTime = (time) => {
  if (!time) return ''
  return formatRelativeTime(time)
}

// 获取消息预览文本
const getMessagePreview = (message) => {
  if (!message) return '暂无消息'
  
  // 处理不同类型的消息
  switch (message.type) {
    case 'IMAGE':
      return '[图片消息]'
    case 'PRODUCT':
      return '[商品消息]'
    case 'ORDER':
      return '[订单消息]'
    case 'TEXT':
    default:
      return message.content
  }
}

// 开始轮询未读消息和消息列表
const startPolling = () => {
  // 获取未读消息数量与消息列表
  messageStore.fetchUnreadCount()
  
  // 设置定时器，每隔一段时间获取未读消息数量和刷新消息列表
  pollTimer = setInterval(() => {
    messageStore.fetchUnreadCount()
    messageStore.fetchMessages()
  }, POLL_INTERVAL)
}

// 组件挂载时初始化
onMounted(async () => {
  // 初始化消息数据
  await messageStore.initialize()
  
  // 开始轮询未读消息
  startPolling()
})

// 组件卸载时清理
onUnmounted(() => {
  // 清除定时器
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<style scoped>
.messages-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.messages-content {
  min-height: 400px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.message-item.unread {
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
}

.contact-info {
  display: flex;
  align-items: center;
}

.contact-details {
  flex: 1;
  margin-left: 16px;
  overflow: hidden;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.contact-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-content {
  margin: 0;
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
}

/* 调试信息样式 */
.debug-info {
  margin-top: 5px;
  padding: 5px;
  font-size: 12px;
  color: #909399;
  background-color: #f7f7f7;
  border-radius: 4px;
}

.debug-info p {
  margin: 2px 0;
}
</style> 