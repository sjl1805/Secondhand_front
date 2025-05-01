<template>
  <div class="notifications-container">
    <!-- 搜索和操作区域 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索通知内容"
        class="filter-item"
        style="width: 300px"
        clearable
        @keyup.enter="handleFilter"
      />
      <el-select
        v-model="listQuery.userId"
        placeholder="选择用户"
        clearable
        filterable
        remote
        :remote-method="searchUser"
        class="filter-item"
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
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
        style="width: 250px"
      />
      <el-button
        type="primary"
        class="filter-item"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        type="success"
        class="filter-item"
        @click="showSendDialog"
      >
        发送通知
      </el-button>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedNotifications.length" class="batch-actions">
      <el-dropdown>
        <el-button type="primary">
          批量操作（已选{{ selectedNotifications.length }}项）<i class="el-icon-arrow-down" />
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
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="通知ID" prop="id" width="80" align="center" />
      <el-table-column label="通知内容" min-width="200">
        <template #default="{ row }">
          <div class="content">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="接收用户" width="150">
        <template #default="{ row }">
          <div v-if="row.userId" class="user-info">
            <el-avatar :src="getFullUrl(row.userAvatar)" size="small" />
            <span>{{ row.userNickname }}</span>
          </div>
          <span v-else>全体用户</span>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isRead ? 'success' : 'info'">
            {{ row.isRead ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
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
      v-model:current="pagination.current"
      v-model:size="pagination.size"
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
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
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
            placeholder="选择用户"
            filterable
            remote
            :remote-method="searchUser"
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
import { ref, onMounted } from 'vue'
import { 
  getAdminNotificationList,
  getAdminNotificationDetail,
  sendNotification as apiSendNotification,
  broadcastNotification,
  deleteAdminNotification,
  batchDeleteAdminNotifications
} from '@/api/adminNotification'
import { searchUser as apiSearchUser } from '@/api/adminUser'
import Pagination from '@/components/Pagination/index.vue'
import { useFileStore } from '@/stores/file'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const fileStore = useFileStore()

// 数据状态
const loading = ref(false)
const notificationList = ref([])
const selectedNotifications = ref([])
const userOptions = ref([])
const sendDialogVisible = ref(false)

// 分页
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

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

// 获取完整URL
const getFullUrl = (url) => {
  return fileStore.getFullUrl(url)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 搜索用户
const searchUser = async (query) => {
  if (!query) {
    userOptions.value = []
    return
  }
  try {
    const res = await apiSearchUser({ keyword: query })
    if (res.code === 200) {
      userOptions.value = res.data.records || []
    }
  } catch (error) {
    console.error('搜索用户失败', error)
  }
}

// 获取通知列表
const fetchNotificationList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      size: pagination.value.size,
      ...listQuery.value,
      startTime: listQuery.value.dateRange?.[0] ? dayjs(listQuery.value.dateRange[0]).format('YYYY-MM-DD') : undefined,
      endTime: listQuery.value.dateRange?.[1] ? dayjs(listQuery.value.dateRange[1]).format('YYYY-MM-DD') : undefined
    }
    delete params.dateRange

    const res = await getAdminNotificationList(params)
    if (res.code === 200) {
      notificationList.value = res.data.records || []
      pagination.value = {
        current: res.data.current,
        size: res.data.size,
        total: res.data.total
      }
    }
  } catch (error) {
    console.error('获取通知列表失败', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索过滤
const handleFilter = () => {
  pagination.value.current = 1
  fetchNotificationList()
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedNotifications.value = selection.map(item => item.id)
}

// 查看详情
const viewDetail = async (id) => {
  try {
    const res = await getAdminNotificationDetail(id)
    if (res.code === 200) {
      ElMessageBox.alert(res.data.content, '通知详情', {
        confirmButtonText: '确定'
      })
    }
  } catch (error) {
    console.error('获取通知详情失败', error)
    ElMessage.error('获取通知详情失败')
  }
}

// 删除通知
const deleteNotification = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该通知吗？', '提示', {
      type: 'warning'
    })
    await deleteAdminNotification(id)
    ElMessage.success('删除成功')
    fetchNotificationList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedNotifications.value.length}条通知吗？`, '提示', {
      type: 'warning'
    })
    await batchDeleteAdminNotifications(selectedNotifications.value)
    ElMessage.success('批量删除成功')
    selectedNotifications.value = []
    fetchNotificationList()
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
    if (sendForm.value.type === 1) {
      await broadcastNotification(sendForm.value.content)
    } else {
      if (!sendForm.value.userId) {
        ElMessage.warning('请选择接收用户')
        return
      }
      await apiSendNotification(sendForm.value.content, sendForm.value.userId)
    }
    ElMessage.success('发送成功')
    sendDialogVisible.value = false
    fetchNotificationList()
  } catch (error) {
    console.error('发送通知失败', error)
    ElMessage.error('发送通知失败')
  }
}

// 分页变化
const handlePageChange = (page) => {
  pagination.value.current = page
  fetchNotificationList()
}

// 每页数量变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  fetchNotificationList()
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
</style>
