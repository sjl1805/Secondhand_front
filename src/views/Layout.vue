<template>
  <div class="layout-container">
    <!-- 头部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="logo">
          <router-link to="/">
            <h1>二手交易平台</h1>
          </router-link>
        </div>

        <div class="search-bar">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索商品"
              @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon>
                  <Search/>
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="nav-menu">
          <el-menu :default-active="activeIndex" :ellipsis="false" mode="horizontal" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/products">全部商品</el-menu-item>
          </el-menu>
        </div>

        <div class="user-actions">
          <!-- 未登录状态 -->
          <template v-if="!isLoggedIn">
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <!-- 通知图标 -->
            <div class="notification-icon" @click="$router.push('/user/notifications')">
              <el-badge :hidden="unreadCount <= 0" :is-dot="unreadCount > 0">
                <el-icon :size="22">
                  <Bell/>
                </el-icon>
              </el-badge>
            </div>

            <el-dropdown trigger="click">
              <div class="user-avatar">
                <el-avatar :size="40" :src="userAvatar"/>
                <span class="nickname">{{ nickname || username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/user/profile')">
                    <el-icon>
                      <UserFilled/>
                    </el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/products')">
                    <el-icon>
                      <Goods/>
                    </el-icon>
                    我发布的
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/favorites')">
                    <el-icon>
                      <Star/>
                    </el-icon>
                    我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/orders')">
                    <el-icon>
                      <List/>
                    </el-icon>
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/messages')">
                    <el-icon>
                      <Message/>
                    </el-icon>
                    消息中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/notifications')">
                    <el-icon>
                      <Bell/>
                    </el-icon>
                    系统通知
                    <el-badge v-if="unreadCount > 0" :value="unreadCount" type="danger"/>
                  </el-dropdown-item>

                  <!-- 管理员入口 -->
                  <el-dropdown-item v-if="hasAdminAccess" @click="$router.push('/admin/dashboard')">
                    <el-icon>
                      <Setting/>
                    </el-icon>
                    管理后台
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

            <el-button type="success" @click="$router.push('/user/publish')">
              <el-icon>
                <Plus/>
              </el-icon>
              发布商品
            </el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition mode="out-in" name="fade">
            <component :is="Component"/>
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-links">
            <div class="footer-section">
              <h3>关于我们</h3>
              <ul>
                <li><a href="#">平台介绍</a></li>
                <li><a href="#">联系我们</a></li>
                <li><a href="#">帮助中心</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>交易指南</h3>
              <ul>
                <li><a href="#">如何购买</a></li>
                <li><a href="#">如何出售</a></li>
                <li><a href="#">安全交易</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>商家服务</h3>
              <ul>
                <li><a href="#">商家入驻</a></li>
                <li><a href="#">商家中心</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-info">
            <p>© 2023 二手交易平台 版权所有</p>
            <p>ICP备案号：XXXXXXXX</p>
          </div>
        </div>
      </div>
    </footer>

    <!-- 回到顶部 -->
    <el-backtop/>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {useCategoryStore} from '@/stores/category'
import {useFileStore} from '@/stores/file'
import {useNotificationStore} from '@/stores/notification'
import {
  Bell,
  Goods,
  List,
  Message,
  Plus,
  Search,
  Setting,
  Star,
  SwitchButton,
  UserFilled
} from '@element-plus/icons-vue'
import {ElMessageBox} from 'element-plus'

// 路由实例
const router = useRouter()

// 用户状态
const userStore = useUserStore()
const {isLoggedIn, username, nickname, avatar, role, logout} = userStore

// 文件存储
const fileStore = useFileStore()

// 通知状态
const notificationStore = useNotificationStore()
const unreadCount = computed(() => notificationStore.unreadCount)

// 处理头像路径
const userAvatar = computed(() => {
  if (!avatar) return defaultAvatar
  return fileStore.getFullUrl(avatar)
})

// 是否有管理后台权限
const hasAdminAccess = computed(() => {
  // 根据数据库中的角色定义：role 9表示管理员
  return isLoggedIn && (role === 9 || role === '9')
})

// 分类状态
const categoryStore = useCategoryStore()
const {topCategories, fetchCategoryTree} = categoryStore

// 搜索关键词
const searchKeyword = ref('')
const activeIndex = ref(window.location.pathname || '/')

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: {keyword: searchKeyword.value.trim()}
    })
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    logout()
  } catch (error) {
    // 取消退出，不做处理
  }
}

// 页面加载时获取分类和未读通知数量
onMounted(async () => {
  try {
    // 初始化激活的菜单项
    activeIndex.value = window.location.pathname || '/'

    // 监听路由变化
    router.afterEach((to) => {
      activeIndex.value = to.path
    })

    // 确保 topCategories 存在且为空数组时才加载分类
    if (!topCategories || !topCategories.value || topCategories.value.length === 0) {
      await fetchCategoryTree()
    }

    // 如果用户已登录，获取未读通知数量
    if (isLoggedIn) {
      await notificationStore.fetchUnreadNotificationCount()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  box-sizing: border-box;
}

/* 头部样式 */
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header .container {
  display: flex;
  align-items: center;
  height: 70px;
  width: 100%;
}

.logo {
  margin-right: 30px;
}

.logo a {
  text-decoration: none;
  color: #409EFF;
}

.logo h1 {
  font-size: 24px;
  margin: 0;
}

.search-bar {
  flex: 1;
  max-width: 450px;
  margin-right: 30px;
}

.nav-menu {
  margin-right: 20px;
  min-width: 200px;
}

.nav-menu .el-menu {
  border-bottom: none;
}

.nav-menu .el-menu-item {
  height: 60px;
  line-height: 60px;
  font-size: 16px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.notification-icon:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.nickname {
  margin-left: 8px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 20px 0;
  background-color: #f5f5f5;
  width: 100%;
}

.main-content .container {
  width: 100%;
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

/* 页脚样式 */
.footer {
  background-color: #545c64;
  color: #eee;
  padding: 40px 0 20px;
  width: 100%;
}

.footer-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.footer-section {
  margin-bottom: 15px;
  min-width: 150px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 500;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #ddd;
  text-decoration: none;
}

.footer-section a:hover {
  color: #fff;
}

.footer-info {
  border-top: 1px solid #666;
  padding-top: 20px;
  text-align: center;
  width: 100%;
}

.footer-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #bbb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header .container {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 15px;
  }

  .logo {
    margin-right: 15px;
  }

  .search-bar {
    order: 3;
    max-width: 100%;
    width: 100%;
    margin: 10px 0;
  }

  .nav-menu {
    margin-right: 0;
    flex: 1;
    min-width: 100%;
    order: 4;
  }

  .nav-menu .el-menu {
    justify-content: space-around;
    width: 100%;
  }

  .user-actions {
    margin-left: auto;
  }

  .footer-links {
    flex-direction: column;
  }

  .footer-section {
    margin-bottom: 20px;
    width: 100%;
  }
}
</style>