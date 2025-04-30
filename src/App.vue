<script setup>
import { RouterView } from 'vue-router'
import { ref, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElLoading } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCategoryStore } from '@/stores/category'

// 路由实例
const router = useRouter()

// 全局加载状态
const isLoading = ref(false)
provide('isLoading', isLoading)

// 全局错误处理
const handleError = (error) => {
  console.error('应用发生错误:', error)
}
provide('handleError', handleError)

// 初始化时加载全局数据
onMounted(async () => {
  isLoading.value = true
  
  try {
    // 预加载分类数据
    const categoryStore = useCategoryStore()
    await categoryStore.fetchCategoryTree()
    
    // 初始化用户信息（如果有）
    const userStore = useUserStore()
    if (userStore.token) {
      await userStore.fetchUserInfo()
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="app-wrapper">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #333;
  background-color: #f5f7fa;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
  color: #409EFF;
}

ul, li {
  list-style: none;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式断点 */
.app-wrapper {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* Element Plus 自定义样式 */
.el-button--primary {
  --el-button-hover-bg-color: #3a8ee6;
  --el-button-hover-border-color: #3a8ee6;
}

/* 确保页面内容铺满全宽 */
.el-container {
  width: 100%;
  max-width: 100%;
}

.el-main {
  width: 100%;
  max-width: 100%;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

@media (max-width: 1200px) {
  .container {
    max-width: 100%;
    padding: 0 10px;
  }
}
</style>
