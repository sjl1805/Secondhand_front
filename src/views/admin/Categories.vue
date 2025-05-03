<template>
  <div class="category-container">
    <h1>分类管理</h1>
    
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <el-button type="primary" @click="showAddDialog" :disabled="!isAdmin">添加分类</el-button>
      <el-button type="success" @click="refreshCategories">刷新列表</el-button>
      <el-tag v-if="!isAdmin" type="warning">您需要管理员权限才能执行添加、编辑和删除操作</el-tag>
    </div>
    
    <!-- 分类表格 -->
    <el-table 
      v-loading="categoryStore.loading"
      :data="categoryStore.categoryList" 
      style="width: 100%"
      border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" min-width="180" />
      <el-table-column label="父级分类" min-width="180">
        <template #default="scope">
          <span v-if="scope.row.parentId === 0">顶级分类</span>
          <span v-else>{{ getCategoryName(scope.row.parentId) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleEdit(scope.row)"
            :disabled="!isAdmin">
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(scope.row)"
            :disabled="!isAdmin || categoryStore.hasSubCategories(scope.row.id)">
            删除
          </el-button>
          <el-tooltip v-if="categoryStore.hasSubCategories(scope.row.id)" content="此分类包含子分类，无法删除" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑分类' : '添加分类'" 
      width="500px">
      <el-form 
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类" prop="parentId">
          <el-select 
            v-model="categoryForm.parentId" 
            placeholder="请选择父级分类"
            style="width: 100%">
            <el-option :value="0" label="顶级分类" />
            <el-option 
              v-for="item in availableParentCategories" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAdminCategoryStore } from '@/stores/adminCategory'
import { InfoFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 初始化store
const userStore = useUserStore()
const categoryStore = useAdminCategoryStore()

// 管理员权限检查
const isAdmin = computed(() => {
  return userStore.isLoggedIn && (userStore.role === '9' || userStore.role === 9)
})

// 设置管理员权限
categoryStore.setAdminRole(isAdmin.value)

// 监听登录状态和角色变化
watch(() => [userStore.isLoggedIn, userStore.role], () => {
  const newIsAdmin = userStore.isLoggedIn && (userStore.role === '9' || userStore.role === 9)
  categoryStore.setAdminRole(newIsAdmin)
})

// 表单相关
const categoryFormRef = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const categoryForm = ref({
  id: null,
  name: '',
  parentId: 0,
  sort: 0
})

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在2-20个字符之间', trigger: 'blur' }
  ],
  parentId: [
    { required: true, message: '请选择父级分类', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 可选的父类（不包括自己和自己的子类，防止循环引用）
const availableParentCategories = computed(() => {
  if (!isEdit.value) {
    return categoryStore.categoryList
  }
  
  // 编辑时，需要过滤掉自己和自己的子类
  return categoryStore.categoryList.filter(item => {
    return item.id !== categoryForm.value.id && !isChildCategory(categoryForm.value.id, item.id)
  })
})

// 判断是否是子分类（防止循环引用）
const isChildCategory = (parentId, categoryId) => {
  const children = categoryStore.categoryList.filter(item => item.parentId === parentId)
  if (children.some(child => child.id === categoryId)) {
    return true
  }
  
  for (const child of children) {
    if (isChildCategory(child.id, categoryId)) {
      return true
    }
  }
  return false
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categoryStore.getCategoryById(categoryId)
  return category ? category.name : '未知分类'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  categoryForm.value = {
    id: null,
    name: '',
    parentId: 0,
    sort: 0
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isEdit.value = true
  categoryForm.value = {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    sort: row.sort
  }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  // 检查权限
  if (!isAdmin.value) {
    ElMessage.warning('您没有管理员权限，无法执行此操作')
    return
  }
  
  // 检查是否有子分类
  if (categoryStore.hasSubCategories(row.id)) {
    ElMessage.warning('该分类下有子分类，不能删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await categoryStore.removeCategory(row.id)
    if (result) {
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 提交表单
const submitForm = async () => {
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      let result
      if (isEdit.value) {
        result = await categoryStore.updateCategoryInfo(categoryForm.value)
      } else {
        result = await categoryStore.createCategory(categoryForm.value)
      }
      
      if (result) {
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      }
    }
  })
}

// 刷新分类列表
const refreshCategories = async () => {
  await Promise.all([
    categoryStore.fetchAllCategories(),
    categoryStore.fetchCategoryTree()
  ])
  ElMessage.success('刷新成功')
}

// 页面加载时获取分类列表
onMounted(async () => {
  await categoryStore.initCategories()
})
</script>

<style scoped>
.category-container {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.el-input-number {
  width: 180px;
}
</style> 