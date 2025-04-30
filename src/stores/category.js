import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  getAllCategories, 
  getCategoryTree, 
  getSubCategories 
} from '@/api/category'
import { ElMessage } from 'element-plus'

export const useCategoryStore = defineStore('category', () => {
  // 状态
  const categories = ref([])
  const categoryTree = ref([])
  const loading = ref(false)
  
  // 计算属性：顶级分类
  const topCategories = computed(() => {
    return categories.value.filter(item => item.parentId === 0 || !item.parentId)
  })
  
  // 获取所有分类（扁平结构）
  const fetchAllCategories = async () => {
    loading.value = true
    try {
      const res = await getAllCategories()
      if (res.code === 200) {
        categories.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取分类列表失败', error)
      ElMessage.error('获取分类列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取分类树形结构
  const fetchCategoryTree = async () => {
    loading.value = true
    try {
      const res = await getCategoryTree()
      if (res.code === 200) {
        categoryTree.value = res.data || []
        // 同时更新扁平分类列表
        let flatCategories = []
        const flattenCategories = (items) => {
          items.forEach(item => {
            const { children, ...rest } = item
            flatCategories.push(rest)
            if (children && children.length) {
              flattenCategories(children)
            }
          })
        }
        flattenCategories(res.data || [])
        categories.value = flatCategories
        return res.data
      }
    } catch (error) {
      console.error('获取分类树失败', error)
      ElMessage.error('获取分类树失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取子分类
  const fetchSubCategories = async (parentId) => {
    loading.value = true
    try {
      const res = await getSubCategories(parentId)
      if (res.code === 200) {
        return res.data || []
      }
    } catch (error) {
      console.error('获取子分类失败', error)
      ElMessage.error('获取子分类失败')
      return []
    } finally {
      loading.value = false
    }
  }
  
  // 根据ID获取分类信息
  const getCategoryById = (id) => {
    return categories.value.find(item => item.id === id) || null
  }
  
  // 获取分类的完整路径（面包屑）
  const getCategoryPath = (categoryId) => {
    const path = []
    const findPath = (id) => {
      const category = getCategoryById(id)
      if (category) {
        path.unshift(category)
        if (category.parentId && category.parentId !== 0) {
          findPath(category.parentId)
        }
      }
    }
    findPath(categoryId)
    return path
  }
  
  return {
    categories,
    categoryTree,
    loading,
    topCategories,
    fetchAllCategories,
    fetchCategoryTree,
    fetchSubCategories,
    getCategoryById,
    getCategoryPath
  }
}) 