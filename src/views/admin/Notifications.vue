<template>
  <div class="notifications-container">
    <!-- 搜索和操作区域 -->
    <div class="filter-container">
      <el-input
          v-model="listQuery.keyword"
          class="filter-item"
          clearable
          placeholder="搜索通知内容"
          style="width: 300px"
          @keyup.enter="handleFilter"
      />
      <el-select
          v-model="listQuery.userId"
          :remote-method="searchUser"
          class="filter-item"
          clearable
          filterable
          placeholder="选择用户"
          remote
          style="width: 200px"
      >
        <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
        />
      </el-select>
      <el-date-picker
          v-model="listQuery.dateRange"
          class="filter-item"
          end-placeholder="结束日期"
          range-separator="至"
          start-placeholder="开始日期"
          style="width: 250px"
          type="daterange"
      />
      <el-button
          class="filter-item"
          type="primary"
          @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
          class="filter-item"
          type="success"
          @click="showSendDialog"
      >
        发送通知
      </el-button>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedNotifications.length" class="batch-actions">
      <el-dropdown>
        <el-button type="primary">
          批量操作（已选{{ selectedNotifications.length }}项）<i class="el-icon-arrow-down"/>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="batchDelete">批量删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 通知表格 -->
    <el-table
        v-loading="loading"
        :data="notificationList"
        border
        fit
        highlight-current-row
        @selection-change="handleSelectionChange"
    >
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="通知ID" prop="id" width="80"/>
      <el-table-column label="通知内容" min-width="200">
        <template #default="{ row }">
          <div class="content">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="接收用户" width="150">
        <template #default="{ row }">
          <div v-if="row.userId" class="user-info">
            <el-avatar
                :size="'small'"
                :src="userCache[row.userId]?.avatar ? fileStore.getFullUrl(userCache[row.userId].avatar) : ''"
                @error="() => handleAvatarError(row.userId)"
            />
            <span>{{ getUserNameById(row.userId) || '--' }}</span>
          </div>
          <span v-else>全体用户</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="发送时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isRead ? 'success' : 'info'">
            {{ row.isRead ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row.id)">详情</el-button>
          <el-button size="small" type="danger" @click="deleteNotification(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        :current="pagination.current"
        :size="pagination.size"
        :total="pagination.total"
        @change="handlePageChange"
        @size-change="handleSizeChange"
    />

    <!-- 发送通知对话框 -->
    <el-dialog v-model="sendDialogVisible" title="发送系统通知">
      <el-form :model="sendForm" label-width="80px">
        <el-form-item label="通知内容">
          <el-input
              v-model="sendForm.content"
              :rows="4"
              placeholder="请输入通知内容"
              type="textarea"
          />
        </el-form-item>
        <el-form-item label="接收用户">
          <el-radio-group v-model="sendForm.type">
            <el-radio :label="1">全体用户</el-radio>
            <el-radio :label="2">指定用户</el-radio>
          </el-radio-group>
          <el-select
              v-if="sendForm.type === 2"
              v-model="sendForm.userId"
              :remote-method="searchUser"
              filterable
              placeholder="选择用户"
              remote
              style="width: 100%; margin-top: 10px"
          >
            <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.nickname"
                :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendNotification">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {getUserById, searchUser as apiSearchUser} from '@/api/adminUser'
import Pagination from '@/components/Pagination/index.vue'
import {useFileStore} from '@/stores/file'
import {useAdminNotificationStore} from '@/stores/adminNotification'
import {ElMessage, ElMessageBox} from 'element-plus'
import dayjs from 'dayjs'

const fileStore = useFileStore()
const notificationStore = useAdminNotificationStore()

// 数据状态
const userOptions = ref([])
const sendDialogVisible = ref(false)
const userCache = reactive({}) // 用于缓存用户信息

// 获取Store中的状态
const loading = computed(() => notificationStore.loading)
const notificationList = computed(() => notificationStore.notifications)
const pagination = computed(() => notificationStore.pagination)
const selectedNotifications = ref([])

// 查询条件
const listQuery = ref({
  keyword: '',
  userId: null,
  dateRange: []
})

// 发送表单
const sendForm = ref({
  type: 1,
  content: '',
  userId: null
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 异步加载用户数据
const loadUserData = async (userId) => {
  try {
    const res = await getUserById(userId)
    if (res.code === 200 && res.data) {
      userCache[userId] = {
        name: res.data.nickname || res.data.username || `用户${userId}`,
        avatar: res.data.avatar || null
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 处理头像加载失败
const handleAvatarError = (userId) => {
  if (userCache[userId]) {
    userCache[userId].avatar = null
  }
}

// 根据ID获取用户名
const getUserNameById = (userId) => {
  if (!userId) return '--'

  // 如果缓存中有，直接返回
  if (userCache[userId]?.name) return userCache[userId].name

  // 返回临时文本，异步加载
  loadUserData(userId)
  return `用户${userId}`
}

// 预加载当前页用户数据
const preloadUserData = async () => {
  const userIds = notificationList.value
      .filter(item => item.userId)
      .map(item => item.userId)

  // 去重
  const uniqueUserIds = [...new Set(userIds)]

  // 加载不在缓存中的用户信息
  const promises = uniqueUserIds
      .filter(userId => !userCache[userId])
      .map(loadUserData)

  await Promise.all(promises)
}

// 搜索用户
const searchUser = async (query) => {
  if (!query) {
    userOptions.value = []
    return
  }
  try {
    const res = await apiSearchUser({keyword: query})
    if (res.code === 200) {
      userOptions.value = res.data || []
    }
  } catch (error) {
    console.error('搜索用户失败', error)
  }
}

// 获取通知列表
const fetchNotificationList = async () => {
  const params = {
    ...listQuery.value,
    startTime: listQuery.value.dateRange?.[0] ? dayjs(listQuery.value.dateRange[0]).format('YYYY-MM-DD') : undefined,
    endTime: listQuery.value.dateRange?.[1] ? dayjs(listQuery.value.dateRange[1]).format('YYYY-MM-DD') : undefined
  }
  delete params.dateRange

  await notificationStore.fetchNotificationList(params)

  // 预加载用户数据
  preloadUserData()
}

// 搜索过滤
const handleFilter = () => {
  notificationStore.pagination.current = 1
  fetchNotificationList()
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedNotifications.value = selection.map(item => item.id)
}

// 查看详情
const viewDetail = async (id) => {
  try {
    const detailData = await notificationStore.fetchNotificationDetail(id)
    if (detailData) {
      ElMessageBox.alert(detailData.content, '通知详情', {
        confirmButtonText: '确定'
      })
    }
  } catch (error) {
    console.error('获取通知详情失败', error)
  }
}

// 删除通知
const deleteNotification = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该通知吗？', '提示', {
      type: 'warning'
    })
    const result = await notificationStore.removeNotification(id)
    if (result) {
      ElMessage.success('删除成功')
      fetchNotificationList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedNotifications.value.length === 0) {
    ElMessage.warning('请选择要删除的通知')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedNotifications.value.length}条通知吗？`, '提示', {
      type: 'warning'
    })

    const result = await notificationStore.batchRemoveNotifications(selectedNotifications.value)
    if (result > 0) {
      ElMessage.success(`成功删除${result}条通知`)
      selectedNotifications.value = []
      fetchNotificationList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 显示发送对话框
const showSendDialog = () => {
  sendForm.value = {
    type: 1,
    content: '',
    userId: null
  }
  sendDialogVisible.value = true
}

// 发送通知
const sendNotification = async () => {
  if (!sendForm.value.content) {
    ElMessage.warning('请输入通知内容')
    return
  }

  try {
    let result = false

    if (sendForm.value.type === 1) {
      result = await notificationStore.broadcastToAllUsers(sendForm.value.content)
    } else {
      if (!sendForm.value.userId) {
        ElMessage.warning('请选择接收用户')
        return
      }
      result = await notificationStore.sendUserNotification(sendForm.value.content, sendForm.value.userId)
    }

    if (result) {
      sendDialogVisible.value = false
      fetchNotificationList()
    }
  } catch (error) {
    console.error('发送通知失败', error)
  }
}

// 分页变化
const handlePageChange = (page) => {
  notificationStore.changeNotificationPage(page)
}

// 每页数量变化
const handleSizeChange = (size) => {
  notificationStore.changeNotificationPageSize(size)
}

// 初始化加载
onMounted(() => {
  fetchNotificationList()
})
</script>

<style scoped>
.notifications-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;

  .filter-item {
    margin-right: 10px;
  }
}

.batch-actions {
  margin: 10px 0;
}

.el-table {
  margin-top: 20px;
}

.content {
  line-height: 1.5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 添加头像样式 */
:deep(.el-avatar--small) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
</style>
