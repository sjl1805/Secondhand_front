<template>
  <div v-if="isAdmin" class="admin-layout">
    <!-- 顶部导航栏 -->
    <el-header class="admin-header">
      <div class="header-left">
        <div class="logo-container">
          <el-icon class="toggle-icon" @click="toggleSidebar">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
          <div class="logo">二手交易平台 · 管理后台</div>
        </div>
      </div>
      <div class="header-right">
        <div class="admin-actions">
          <el-tooltip content="返回前台" placement="bottom">
            <el-button circle text type="primary" @click="$router.push('/')">
              <el-icon>
                <HomeFilled/>
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="通知中心" placement="bottom">
            <el-badge :hidden="unreadCount <= 0" :is-dot="unreadCount > 0">
              <el-button circle text type="primary" @click="$router.push('/user/notifications')">
                <el-icon>
                  <Bell/>
                </el-icon>
              </el-button>
            </el-badge>
          </el-tooltip>
        </div>

        <el-dropdown trigger="click">
          <div class="avatar-container">
            <el-avatar :size="36" :src="userAvatar"></el-avatar>
            <span class="admin-username">{{ nickname || username }} <el-icon><ArrowDown/></el-icon></span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/')">
                <el-icon>
                  <HomeFilled/>
                </el-icon>
                返回前台
              </el-dropdown-item>
              <el-dropdown-item @click="$router.push('/user/profile')">
                <el-icon>
                  <UserFilled/>
                </el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="$router.push('/user/notifications')">
                <el-icon>
                  <Bell/>
                </el-icon>
                系统通知
                <el-badge v-if="unreadCount > 0" :value="unreadCount" type="danger"/>
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon>
                  <SwitchButton/>
                </el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="admin-container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-sidebar">
        <el-menu
            :collapse="isCollapse"
            :default-active="activeMenu"
            active-text-color="#409EFF"
            background-color="#304156"
            class="admin-menu"
            router
            text-color="#bfcbd9"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon>
              <Grid/>
            </el-icon>
            <template #title>控制面板</template>
          </el-menu-item>

          <el-menu-item index="/admin/users">
            <el-icon>
              <User/>
            </el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <el-sub-menu index="product-menu">
            <template #title>
              <el-icon>
                <Goods/>
              </el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/admin/products">商品列表</el-menu-item>
            <el-menu-item index="/admin/categories">分类管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/orders">
            <el-icon>
              <List/>
            </el-icon>
            <template #title>订单管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/notifications">
            <el-icon>
              <Bell/>
            </el-icon>
            <template #title>通知管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="admin-main">
        <el-breadcrumb v-if="breadcrumbs.length > 0" class="admin-breadcrumb">
          <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <div ref="contentRef" class="admin-content">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" v-if="isAdmin && !isRouteChanging"/>
            </keep-alive>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </div>

  <!-- 非管理员重定向 -->
  <div v-else class="unauthorized">
    <el-result
        icon="error"
        sub-title="您没有权限访问管理后台"
        title="访问受限"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {useFileStore} from '@/stores/file'
import {useNotificationStore} from '@/stores/notification'
import {
  ArrowDown,
  Bell,
  Expand,
  Fold,
  Goods,
  Grid,
  HomeFilled,
  List,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import {ElMessageBox} from 'element-plus'

// 路由实例
const router = useRouter()
const route = useRoute()

// 用户状态
const userStore = useUserStore()
const {isLoggedIn, username, nickname, avatar, role, logout} = userStore

// 文件存储
const fileStore = useFileStore()

// 通知状态
const notificationStore = useNotificationStore()
const unreadCount = computed(() => notificationStore.unreadCount)

// 侧边栏折叠状态
const isCollapse = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 当前活动菜单
const activeMenu = computed(() => {
  return route.path
})

// 面包屑
const breadcrumbs = computed(() => {
  // 根据路由生成面包屑
  const paths = route.path.split('/').filter(Boolean)
  const result = []

  if (paths.length > 0) {
    result.push({title: '管理后台', path: '/admin/dashboard'})

    // 根据路径生成面包屑
    let currentPath = ''
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i]
      currentPath += `/${paths[i - 1]}/${path}`

      // 根据路径设置标题
      let title = path.charAt(0).toUpperCase() + path.slice(1)

      // 特殊处理一些路径
      if (path === 'dashboard') title = '控制面板'
      else if (path === 'users') title = '用户管理'
      else if (path === 'products') title = '商品管理'
      else if (path === 'product') title = '商品详情'
      else if (path === 'orders') title = '订单管理'
      else if (path === 'order') title = '订单详情'
      else if (path === 'categories') title = '分类管理'
      else if (path === 'notifications') title = '通知管理'

      result.push({title, path: currentPath})
    }
  }

  return result
})

// 是否为管理员
const isAdmin = computed(() => {
  // 根据数据库中的角色定义：role 9表示管理员
  return isLoggedIn && (role === 9 || role === '9')
})

// 处理头像路径
const userAvatar = computed(() => {
  if (!avatar) return defaultAvatar
  return fileStore.getFullUrl(avatar)
})

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    logout()
    router.push('/login')
  } catch (error) {
    // 取消退出，不做处理
  }
}

// 加载通知数据
const loadNotifications = async () => {
  if (isLoggedIn) {
    await notificationStore.fetchUnreadNotificationCount()
  }
}

// 检查权限
onMounted(() => {
  if (!isAdmin.value) {
    ElMessageBox.alert('您没有权限访问管理后台', '访问受限', {
      confirmButtonText: '返回首页',
      callback: () => {
        router.push('/')
      }
    })
  } else {
    // 加载通知数据
    loadNotifications()
  }
})

// 路由变化状态
const isRouteChanging = ref(false)
const contentRef = ref(null)

// 监听路由变化
watch(() => route.path, (newPath, oldPath) => {
  // 处理路由变化时的过渡
  if (newPath !== oldPath) {
    isRouteChanging.value = true

    // 短暂延迟后重新显示视图
    setTimeout(() => {
      nextTick(() => {
        isRouteChanging.value = false
      })
    }, 50)
  }
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background-color: #ffffff;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
  color: #606266;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-right: 20px;
  background-image: linear-gradient(to right, #409EFF, #606266);
  -webkit-background-clip: text;
  color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.avatar-container:hover {
  background-color: #f5f7fa;
}

.admin-username {
  margin-left: 8px;
  color: #606266;
  display: flex;
  align-items: center;
}

.admin-username .el-icon {
  margin-left: 4px;
  font-size: 12px;
}

.admin-container {
  flex: 1;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.admin-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  height: 100%;
  overflow-y: auto;
}

.admin-menu {
  border-right: none;
  height: 100%;
}

.admin-main {
  background-color: #f5f7fa;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.admin-breadcrumb {
  margin-bottom: 20px;
  padding: 10px 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.admin-content {
  flex: 1;
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  overflow: auto; /* 允许内容滚动 */
  display: flex;
  flex-direction: column;
}

.unauthorized {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
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
</style>