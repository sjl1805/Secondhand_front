<template>
  <div class="profile-container">
    <h2 class="page-title">个人资料</h2>
    
    <el-card class="profile-card">
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="100px"
      >
        <div class="avatar-upload">
          <el-avatar 
            :size="100" 
            :src="avatarUrl || defaultAvatar" 
            class="user-avatar"
          />
          <el-upload
            class="avatar-uploader"
            :http-request="uploadAvatar"
            :show-file-list="false"
            accept="image/jpeg,image/png,image/gif"
            :before-upload="beforeAvatarUpload"
          >
            <el-button type="primary" class="upload-button">更换头像</el-button>
          </el-upload>
        </div>
        
        <el-form-item label="用户名">
          <el-input v-model="username" disabled />
          <span class="form-tip">用户名不可修改</span>
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
          <span class="form-tip">手机号用于接收重要通知</span>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="profileForm.bio"
            type="textarea"
            :rows="4"
            placeholder="介绍一下自己吧"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveProfile" :loading="loading">保存修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useFileStore } from '@/stores/file'

const userStore = useUserStore()
const fileStore = useFileStore()

// 用户信息
const username = computed(() => userStore.username)
const avatarUrl = computed(() => {
  if (userStore.avatar) {
    return fileStore.getFullUrl(userStore.avatar)
  }
  return ''
})
const defaultAvatar = '/src/assets/default-avatar.png'

// 表单引用
const profileFormRef = ref(null)
const loading = ref(false)

// 表单数据
const profileForm = reactive({
  nickname: userStore.nickname || '',
  email: userStore.email || '',
  phone: userStore.phone || '',
  bio: userStore.bio || '',
  avatar: userStore.avatar || ''
})

// 表单验证规则
const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
  ]
}

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

// 自定义上传头像
const uploadAvatar = async (options) => {
  try {
    const file = options.file
    const result = await fileStore.uploadAvatar(file)
    
    if (result && result.path) {
      profileForm.avatar = result.path
      ElMessage.success('头像上传成功')
    }
  } catch (error) {
    console.error('上传头像失败', error)
    ElMessage.error('上传头像失败，请重试')
  }
}

// 保存个人资料
const saveProfile = async () => {
  try {
    // 表单验证
    await profileFormRef.value.validate()
    
    loading.value = true
    const result = await userStore.updateProfile(profileForm)
    
    if (result.code === 200) {
      ElMessage.success('个人资料更新成功')
    }
  } catch (error) {
    console.error('保存个人资料失败', error)
    ElMessage.error('保存个人资料失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  profileForm.nickname = userStore.nickname || ''
  profileForm.email = userStore.email || ''
  profileForm.phone = userStore.phone || ''
  profileForm.bio = userStore.bio || ''
  profileForm.avatar = userStore.avatar || ''
  
  // 清除表单验证结果
  if (profileFormRef.value) {
    profileFormRef.value.resetFields()
  }
}

// 组件挂载时加载用户信息
onMounted(async () => {
  await userStore.fetchUserInfo()
  resetForm()
})
</script>

<style scoped>
.profile-container {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
}

.profile-card {
  margin-bottom: 20px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.user-avatar {
  margin-bottom: 15px;
}

.upload-button {
  font-size: 14px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style> 