<template>
  <div class="category-container">
    <h1>分类管理</h1>
    
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      <el-button type="success" @click="refreshCategories">刷新列表</el-button>
    </div>
    
    <!-- 分类表格 -->
    <el-table 
      v-loading="categoryStore.loading"
      :data="categoryStore.categoryList" 
      style="width: 100%"
      border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="父级分类">
        <template #default="scope">
          <span v-if="scope.row.parentId === 0">顶级分类</span>
          <span v-else>{{ getCategoryName(scope.row.parentId) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="level" label="层级" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleEdit(scope.row)"
            :disabled="!userStore.isLoggedIn || userStore.role !== 'admin'">
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(scope.row)"
            :disabled="!userStore.isLoggedIn || userStore.role !== 'admin' || categoryStore.hasSubCategories(scope.row.id)">
            删除
          </el-button>
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAdminCategoryStore } from '@/stores/adminCategory'

// 初始化store
const userStore = useUserStore()
const categoryStore = useAdminCategoryStore()

// 设置管理员权限
categoryStore.setAdminRole(userStore.role === 'admin')

// 表单相关
const categoryFormRef = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const categoryForm = ref({
  id: null,
  name: '',
  parentId: 0,
  sort: 0,
  status: 1
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
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
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

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  categoryForm.value = {
    id: null,
    name: '',
    parentId: 0,
    sort: 0,
    status: 1
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
    sort: row.sort,
    status: row.status
  }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
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
  if (!userStore.isLoggedIn || userStore.role !== 'admin') {
    ElMessage.warning('您需要管理员权限才能管理分类')
    return
  }
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