import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  getAllCategories,
  getCategoryTree,
  addCategory,
  updateCategory,
  deleteCategory,
  checkCategoryNameExists
} from '@/api/category'
import { ElMessage } from 'element-plus'

export const useAdminCategoryStore = defineStore('adminCategory', () => {
  // 状态
  const categoryList = ref([])
  const categoryTree = ref([])
  const loading = ref(false)
  const isAdmin = ref(false)
  
  // 设置管理员权限
  const setAdminRole = (isAdminRole) => {
    isAdmin.value = isAdminRole
  }
  
  // 获取所有分类列表
  const fetchAllCategories = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getAllCategories()
      if (res.code === 200) {
        categoryList.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取分类列表失败', error)
      ElMessage.error('获取分类列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取分类树
  const fetchCategoryTree = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    loading.value = true
    try {
      const res = await getCategoryTree()
      if (res.code === 200) {
        categoryTree.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取分类树失败', error)
      ElMessage.error('获取分类树失败')
    } finally {
      loading.value = false
    }
  }
  
  // 添加分类
  const createCategory = async (categoryData) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      // 先检查分类名称是否存在
      const checkRes = await checkCategoryNameExists(
        categoryData.name, 
        categoryData.parentId || 0
      )
      if (checkRes.code === 200 && checkRes.data) {
        ElMessage.warning('分类名称已存在')
        return false
      }
      
      const res = await addCategory(categoryData)
      if (res.code === 200) {
        ElMessage.success('添加分类成功')
        // 重新获取分类列表
        await Promise.all([fetchAllCategories(), fetchCategoryTree()])
        return true
      }
    } catch (error) {
      console.error('添加分类失败', error)
      ElMessage.error(error.message || '添加分类失败')
      return false
    }
  }
  
  // 更新分类
  const updateCategoryInfo = async (categoryData) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      // 先检查分类名称是否存在（排除自身）
      const checkRes = await checkCategoryNameExists(
        categoryData.name, 
        categoryData.parentId || 0,
        categoryData.id
      )
      if (checkRes.code === 200 && checkRes.data) {
        ElMessage.warning('分类名称已存在')
        return false
      }
      
      const res = await updateCategory(categoryData)
      if (res.code === 200) {
        ElMessage.success('更新分类成功')
        // 重新获取分类列表
        await Promise.all([fetchAllCategories(), fetchCategoryTree()])
        return true
      }
    } catch (error) {
      console.error('更新分类失败', error)
      ElMessage.error(error.message || '更新分类失败')
      return false
    }
  }
  
  // 删除分类
  const removeCategory = async (categoryId) => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    try {
      const res = await deleteCategory(categoryId)
      if (res.code === 200) {
        ElMessage.success('删除分类成功')
        // 重新获取分类列表
        await Promise.all([fetchAllCategories(), fetchCategoryTree()])
        return true
      }
    } catch (error) {
      console.error('删除分类失败', error)
      ElMessage.error(error.message || '删除分类失败')
      return false
    }
  }
  
  // 根据ID查找分类
  const getCategoryById = (categoryId) => {
    return categoryList.value.find(item => item.id === categoryId) || null
  }
  
  // 获取顶级分类
  const topCategories = computed(() => {
    return categoryList.value.filter(item => item.parentId === 0) || []
  })
  
  // 检查分类是否有子分类
  const hasSubCategories = (categoryId) => {
    return categoryList.value.some(item => item.parentId === categoryId)
  }
  
  // 初始化分类
  const initCategories = async () => {
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      return Promise.reject(new Error('没有权限'))
    }
    
    if (categoryList.value.length === 0) {
      await Promise.all([fetchAllCategories(), fetchCategoryTree()])
    }
    return categoryList.value
  }
  
  return {
    categoryList,
    categoryTree,
    loading,
    isAdmin,
    setAdminRole,
    fetchAllCategories,
    fetchCategoryTree,
    createCategory,
    updateCategoryInfo,
    removeCategory,
    getCategoryById,
    topCategories,
    hasSubCategories,
    initCategories
  }
}) 