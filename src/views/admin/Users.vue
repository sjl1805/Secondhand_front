<template>
  <div class="users-container">
    <!-- 搜索和过滤区域 -->
    <div class="filter-container">
      <el-input
          v-model="listQuery.keyword"
          class="filter-item"
          clearable
          placeholder="搜索用户"
          style="width: 200px"
          @keyup.enter="handleFilter"
      />
      <el-select
          v-model="listQuery.role"
          class="filter-item"
          clearable
          placeholder="用户角色"
          style="width: 120px"
      >
        <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-button
          class="filter-item"
          type="primary"
          @click="handleFilter"
      >
        搜索
      </el-button>
    </div>

    <!-- 用户表格 -->
    <el-table
        v-loading="store.loading"
        :data="store.userList"
        border
        fit
        highlight-current-row
        style="width: 100%"
    >
      <el-table-column align="center" label="ID" prop="id" width="80"/>
      <el-table-column label="用户名" min-width="120" prop="username"/>
      <el-table-column label="昵称" min-width="120" prop="nickname"/>
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 9 ? 'danger' : 'info'">
            {{ store.getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="信用分" prop="creditScore" width="100"/>
      <el-table-column align="center" label="注册时间" prop="createTime" width="180"/>
      <el-table-column align="center" fixed="right" label="操作" width="240">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-dropdown trigger="click">
            <el-button size="small" type="primary">
              更多操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleAdjustCredit(row)">
                  调整信用分
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="row.role !== 9"
                    @click="handleSetRole(row, 9)"
                >
                  设为管理员
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="row.role === 9"
                    @click="handleSetRole(row, 0)"
                >
                  取消管理员
                </el-dropdown-item>
                <el-dropdown-item
                    divided
                    style="color: #ff4d4f;"
                    @click="handleDelete(row)"
                >
                  删除用户
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-model:current="store.pagination.current"
        v-model:size="store.pagination.size"
        :total="store.pagination.total"
        @change="store.changePage"
        @size-change="store.changePageSize"
    />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="用户信息编辑" width="500px">
      <el-form ref="editForm" :model="currentUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" disabled/>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="currentUser.nickname"/>
        </el-form-item>
        <el-form-item label="信用分">
          <el-input-number
              v-model="currentUser.creditScore"
              :max="100"
              :min="0"
              controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 信用分调整弹窗 -->
    <el-dialog v-model="creditDialogVisible" title="调整信用分" width="400px">
      <el-form>
        <el-form-item label="当前信用分">
          <el-input-number
              v-model="currentCreditScore"
              :max="100"
              :min="0"
              controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreditAdjust">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useAdminUserStore} from '@/stores/adminUser'
import Pagination from '@/components/Pagination/index.vue'

const store = useAdminUserStore()
const dialogVisible = ref(false)
const creditDialogVisible = ref(false)
const currentUser = ref({})
const currentCreditScore = ref(0)
const listQuery = ref({
  keyword: '',
  role: null
})

const roleOptions = [
  {value: 0, label: '普通用户'},
  {value: 9, label: '管理员'}
]

// 初始化加载数据
onMounted(() => {
  store.setAdminRole(true)
  store.fetchUserList()
})

// 搜索过滤
const handleFilter = () => {
  store.fetchUserList(listQuery.value)
}

// 打开编辑弹窗
const handleEdit = (row) => {
  currentUser.value = {...row}
  dialogVisible.value = true
}

// 确认编辑
const handleConfirmEdit = async () => {
  try {
    await store.updateUserStatus(currentUser.value.id, {
      creditScore: currentUser.value.creditScore,
      nickname: currentUser.value.nickname
    })
    dialogVisible.value = false
  } catch (error) {
    console.error('更新用户信息失败', error)
  }
}

// 调整信用分
const handleAdjustCredit = (row) => {
  currentCreditScore.value = row.creditScore
  currentUser.value = {...row}
  creditDialogVisible.value = true
}

// 确认信用分调整
const confirmCreditAdjust = async () => {
  try {
    await store.updateUserStatus(currentUser.value.id, {
      creditScore: currentCreditScore.value
    })
    creditDialogVisible.value = false
  } catch (error) {
    console.error('调整信用分失败', error)
  }
}

// 设置角色
const handleSetRole = async (row, role) => {
  try {
    await store.updateUserStatus(row.id, {role})
  } catch (error) {
    console.error('修改角色失败', error)
  }
}

// 重置密码
const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度需在6-20位之间'
    })
    await store.resetUserPassword(row.id, newPassword)
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败')
    }
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定删除用户 ${row.username} 吗？此操作不可恢复！`,
        '警告',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    await store.removeUser(row.id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败')
    }
  }
}
</script>

<style lang="scss" scoped>
.users-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;

  .filter-item {
    margin-right: 10px;
  }
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.el-dropdown {
  margin-left: 10px;
}
</style>
