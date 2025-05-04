<template>
  <div class="notifications-container">
    <div class="page-header">
      <h1>系统通知</h1>
      <div class="header-actions">
        <el-button :disabled="notificationStore.unreadCount <= 0" type="primary" @click="markAllAsRead">
          全部标为已读
        </el-button>
      </div>
    </div>

    <!-- 切换标签 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部通知" name="all">
        <div v-loading="notificationStore.loading" class="notifications-list">
          <!-- 无通知时显示 -->
          <el-empty v-if="notificationStore.notifications.length === 0" description="暂无通知"/>

          <!-- 通知列表 -->
          <div v-else class="notification-items">
            <div
                v-for="notification in notificationStore.notifications"
                :key="notification.id"
                :class="{ unread: notification.isRead === 0 }"
                class="notification-item"
                @click="viewNotification(notification)"
            >
              <div class="notification-icon">
                <el-badge :is-dot="notification.isRead === 0" type="danger">
                  <el-icon :size="20">
                    <component :is="getNotificationIcon(notification.type)"/>
                  </el-icon>
                </el-badge>
              </div>

              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-brief">{{ notification.content }}</div>
                <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
              </div>

              <div class="notification-action">
                <el-button
                    v-if="notification.isRead === 0"
                    size="small"
                    @click.stop="markAsRead(notification.id)"
                >
                  标记已读
                </el-button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="notificationStore.pagination.total > 0" class="pagination">
            <el-pagination
                v-model:current-page="notificationStore.pagination.current"
                :page-size="notificationStore.pagination.size"
                :total="notificationStore.pagination.total"
                layout="prev, pager, next"
                @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="未读通知" name="unread">
        <div v-loading="notificationStore.loading" class="notifications-list">
          <!-- 无通知时显示 -->
          <el-empty v-if="notificationStore.unreadNotifications.length === 0" description="没有未读通知"/>

          <!-- 未读通知列表 -->
          <div v-else class="notification-items">
            <div
                v-for="notification in notificationStore.unreadNotifications"
                :key="notification.id"
                class="notification-item unread"
                @click="viewNotification(notification)"
            >
              <div class="notification-icon">
                <el-badge is-dot type="danger">
                  <el-icon :size="20">
                    <component :is="getNotificationIcon(notification.type)"/>
                  </el-icon>
                </el-badge>
              </div>

              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-brief">{{ notification.content }}</div>
                <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
              </div>

              <div class="notification-action">
                <el-button size="small" @click.stop="markAsRead(notification.id)">
                  标记已读
                </el-button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="notificationStore.unreadPagination.total > 0" class="pagination">
            <el-pagination
                v-model:current-page="notificationStore.unreadPagination.current"
                :page-size="notificationStore.unreadPagination.size"
                :total="notificationStore.unreadPagination.total"
                layout="prev, pager, next"
                @current-change="handleUnreadPageChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 通知详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        class="notification-detail-dialog"
        title="通知详情"
        width="600px"
    >
      <div v-if="notificationStore.currentNotification" class="notification-detail">
        <h2 class="notification-detail-title">
          {{ notificationStore.currentNotification.title }}
        </h2>
        <div class="notification-detail-meta">
          <span class="notification-detail-time">
            {{ formatTime(notificationStore.currentNotification.createTime) }}
          </span>
          <el-tag
              v-if="notificationStore.currentNotification.isRead === 0"
              size="small"
              type="danger"
          >
            未读
          </el-tag>
          <el-tag
              v-else
              size="small"
              type="info"
          >
            已读
          </el-tag>
        </div>
        <div class="notification-detail-content">
          {{ notificationStore.currentNotification.content }}
        </div>

        <!-- 添加订单/商品等相关链接 -->
        <div v-if="hasRelatedLink" class="notification-related-action">
          <el-button
              type="primary"
              @click="navigateToRelated"
          >
            {{ getRelatedActionText() }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useNotificationStore} from '@/stores/notification'
import {Bell, InfoFilled, ShoppingCart, Warning} from '@element-plus/icons-vue'
import {formatDateTime} from '@/utils/format'

const router = useRouter()
const notificationStore = useNotificationStore()
const activeTab = ref('all')
const detailDialogVisible = ref(false)

// 页面加载时获取通知
onMounted(async () => {
  await notificationStore.fetchUnreadNotificationCount()
  loadNotifications()
})

// 加载通知列表
const loadNotifications = async () => {
  if (activeTab.value === 'all') {
    await notificationStore.fetchNotificationList()
  } else {
    await notificationStore.fetchUnreadNotifications()
  }
}

// 处理标签切换
const handleTabChange = (tabName) => {
  loadNotifications()
}

// 处理页码变化
const handlePageChange = (page) => {
  notificationStore.changeNotificationPage(page)
}

// 处理未读通知页码变化
const handleUnreadPageChange = (page) => {
  notificationStore.changeUnreadPage(page)
}

// 查看通知详情
const viewNotification = async (notification) => {
  try {
    await notificationStore.fetchNotificationDetail(notification.id)
    detailDialogVisible.value = true

    // 如果是未读通知，自动标记为已读
    if (notification.isRead === 0) {
      markAsRead(notification.id)
    }
  } catch (error) {
    console.error('获取通知详情失败', error)
  }
}

// 标记单个通知为已读
const markAsRead = async (notificationId) => {
  await notificationStore.readNotification(notificationId)
  loadNotifications()
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  await notificationStore.readAllNotifications()
  loadNotifications()
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return formatDateTime(timestamp)
}

// 根据通知类型获取图标
const getNotificationIcon = (type) => {
  const iconMap = {
    1: Bell,      // 系统通知
    2: ShoppingCart, // 订单通知
    3: InfoFilled,  // 商品通知
    4: Warning     // 警告通知
  }
  return iconMap[type] || Bell
}

// 是否有相关链接
const hasRelatedLink = computed(() => {
  if (!notificationStore.currentNotification) return false

  const {relatedId, type} = notificationStore.currentNotification
  return relatedId && (type === 2 || type === 3) // 订单或商品通知
})

// 获取操作文本
const getRelatedActionText = () => {
  if (!notificationStore.currentNotification) return ''

  const {type} = notificationStore.currentNotification
  if (type === 2) return '查看订单'
  if (type === 3) return '查看商品'
  return '查看详情'
}

// 跳转到相关页面
const navigateToRelated = () => {
  if (!notificationStore.currentNotification) return

  const {relatedId, type} = notificationStore.currentNotification

  if (type === 2) {
    // 订单通知
    router.push(`/user/order/${relatedId}`)
  } else if (type === 3) {
    // 商品通知
    router.push(`/product/${relatedId}`)
  }

  detailDialogVisible.value = false
}
</script>

<style scoped>
.notifications-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.notifications-list {
  min-height: 300px;
}

.notification-items {
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.notification-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-item.unread:hover {
  background-color: #ecf5ff;
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 16px;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.notification-brief {
  color: #606266;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-action {
  flex-shrink: 0;
  margin-left: 16px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 通知详情样式 */
.notification-detail {
  padding: 0 20px;
}

.notification-detail-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.notification-detail-meta {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.notification-detail-time {
  color: #909399;
  font-size: 14px;
  margin-right: 10px;
}

.notification-detail-content {
  line-height: 1.6;
  color: #606266;
  white-space: pre-line;
  margin-bottom: 20px;
}

.notification-related-action {
  margin-top: 20px;
  text-align: center;
}
</style> 