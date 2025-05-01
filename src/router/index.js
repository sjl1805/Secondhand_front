import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 公共路由
const publicRoutes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/',
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: '/product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: { title: '商品详情' }
      },
      {
        path: '/products',
        name: 'ProductList',
        component: () => import('@/views/ProductList.vue'),
        meta: { title: '商品列表' }
      },
      {
        path: '/search',
        name: 'SearchResults',
        component: () => import('@/views/SearchResults.vue'),
        meta: { title: '搜索结果' }
      },
      {
        path: '/seller/:id',
        name: 'SellerProfile',
        component: () => import('@/views/SellerProfile.vue'),
        meta: { title: '卖家主页' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 需要登录的路由
const userRoutes = [
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/Layout.vue'),
    redirect: '/user/profile',
    meta: { title: '用户中心', requireAuth: true },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人资料' }
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        component: () => import('@/views/user/Favorites.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'products',
        name: 'UserProducts',
        component: () => import('@/views/user/Products.vue'),
        meta: { title: '我发布的' }
      },
      {
        path: 'publish',
        name: 'PublishProduct',
        component: () => import('@/views/user/PublishProduct.vue'),
        meta: { title: '发布商品' }
      },
      {
        path: 'edit-product/:id',
        name: 'EditProduct',
        component: () => import('@/views/user/EditProduct.vue'),
        meta: { title: '编辑商品' }
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('@/views/user/Orders.vue'),
        meta: { title: '我的订单' }
      },
      {
        path: 'order/:id',
        name: 'UserOrderDetail',
        component: () => import('@/views/user/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'selling',
        name: 'UserSelling',
        component: () => import('@/views/user/Selling.vue'),
        meta: { title: '我卖出的' }
      },
      {
        path: 'selling/:id',
        name: 'UserSellingDetail',
        component: () => import('@/views/user/SellingDetail.vue'),
        meta: { title: '卖出详情' }
      },
      {
        path: 'address',
        name: 'UserAddress',
        component: () => import('@/views/user/Address.vue'),
        meta: { title: '地址管理' }
      },
      {
        path: 'messages',
        name: 'UserMessages',
        component: () => import('@/views/user/Messages.vue'),
        meta: { title: '消息中心' }
      },
      {
        path: 'chat/:id',
        name: 'UserChat',
        component: () => import('@/views/user/Chat.vue'),
        meta: { title: '聊天详情' }
      },
      {
        path: 'notifications',
        name: 'UserNotifications',
        component: () => import('@/views/user/Notifications.vue'),
        meta: { title: '系统通知' }
      }
    ]
  },
  {
    path: '/checkout/:id',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: '确认订单', requireAuth: true }
  }
]

// 管理员路由
const adminRoutes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Layout.vue'),
    redirect: '/admin/dashboard',
    meta: { title: '管理后台', requireAuth: true, requireAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '控制面板' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/Products.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'product/:id',
        name: 'AdminProductDetail',
        component: () => import('@/views/admin/ProductDetail.vue'),
        meta: { title: '商品详情' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'order/:id',
        name: 'AdminOrderDetail',
        component: () => import('@/views/admin/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/Categories.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'notifications',
        name: 'AdminNotifications',
        component: () => import('@/views/admin/Notifications.vue'),
        meta: { title: '系统通知管理' }
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/Statistics.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

// 创建路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...userRoutes, ...adminRoutes],
  scrollBehavior() {
    return { top: 0 }
  }
})

// 前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 二手交易平台` : '二手交易平台'
  
  // 获取用户状态
  const userStore = useUserStore()
  const { isLoggedIn, role } = userStore
  
  // 需要登录但用户未登录
  if (to.meta.requireAuth && !isLoggedIn) {
    ElMessage.warning('请先登录')
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  
  // 需要管理员权限但用户不是管理员
  if (to.meta.requireAdmin && role !== 'admin') {
    ElMessage.error('没有访问权限')
    next({ path: '/' })
    return
  }
  
  // 已登录用户访问登录/注册页面
  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next({ path: '/' })
    return
  }
  
  next()
})

export default router
