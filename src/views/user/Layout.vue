<template>
  <div class="user-center-container">
    <el-row :gutter="20">
      <!-- 左侧用户信息和导航 -->
      <el-col :xs="24" :sm="6" :md="5" :lg="4">
        <el-card class="user-info-card">
          <div class="user-profile">
            <el-avatar :size="80" :src="avatarUrl" v-if="userInfo.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-avatar :size="80" v-else>
              <el-icon><User /></el-icon>
            </el-avatar>
            <h3 class="user-nickname">{{ userInfo.nickname || userInfo.username }}</h3>
            <p class="user-id">ID: {{ userInfo.userId }}</p>
          </div>
          
          <!-- 侧边导航菜单 -->
          <el-menu
            class="user-menu"
            :router="true"
            :default-active="activeMenu"
          >
            <el-menu-item index="/user/profile">
              <el-icon><UserFilled /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="/user/password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
            <el-menu-item index="/user/notifications">  
              <el-icon><Bell /></el-icon>
              <span>系统通知</span>
            </el-menu-item>
            <el-menu-item index="/user/products">
              <el-icon><Goods /></el-icon>
              <span>我的商品</span>
            </el-menu-item>
            <el-menu-item index="/user/orders">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </el-menu-item>
            <el-menu-item index="/user/favorites">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="/user/messages">
              <el-icon><ChatDotRound /></el-icon>
              <span>消息中心</span>
            </el-menu-item>
            <el-menu-item index="/user/address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="/user/selling">  
              <el-icon><Lock /></el-icon>
              <span>我卖出的</span>
            </el-menu-item>
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>回到首页</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      
      <!-- 右侧内容区域 -->
      <el-col :xs="24" :sm="18" :md="19" :lg="20">
        <el-card class="content-card">
          <router-view></router-view>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFileStore } from '@/stores/file'
import { User, UserFilled, Goods, List, Star, ChatDotRound, Location, Lock } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const fileStore = useFileStore()

// 用户信息
const userInfo = computed(() => {
  return {
    userId: userStore.userId,
    username: userStore.username,
    nickname: userStore.nickname,
    avatar: userStore.avatar
  }
})

// 头像完整URL
const avatarUrl = computed(() => {
  return userInfo.value.avatar ? fileStore.getFullUrl(userInfo.value.avatar) : ''
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

onMounted(() => {
  // 确保用户信息已加载
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.user-center-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.user-info-card {
  margin-bottom: 20px;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.user-nickname {
  margin: 15px 0 5px;
  font-size: 16px;
  font-weight: 600;
}

.user-id {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.user-menu {
  border-right: none;
}

.content-card {
  min-height: 500px;
}

@media (max-width: 768px) {
  .user-center-container {
    padding: 10px;
  }
  
  .user-info-card,
  .content-card {
    margin-bottom: 15px;
  }
}
</style> 