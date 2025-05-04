<template>
  <div class="password-update-container">
    <h2 class="page-title">修改密码</h2>

    <el-card class="password-card">
      <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              placeholder="请输入旧密码"
              show-password
              type="password"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码"
              show-password
              type="password"
          />
          <span class="form-tip">密码长度不少于6位，建议包含字母和数字</span>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
              show-password
              type="password"
          />
        </el-form-item>

        <el-form-item>
          <el-button :loading="loading" type="primary" @click="updatePassword">确认修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import {reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {useUserStore} from '@/stores/user'

const userStore = useUserStore()

// 表单引用
const passwordFormRef = ref(null)
const loading = ref(false)

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义校验方法：确认密码与新密码一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const passwordRules = {
  oldPassword: [
    {required: true, message: '请输入旧密码', trigger: 'blur'}
  ],
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, message: '密码长度不少于6个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请再次输入新密码', trigger: 'blur'},
    {validator: validateConfirmPassword, trigger: 'blur'}
  ]
}

// 修改密码
const updatePassword = async () => {
  try {
    // 表单验证
    await passwordFormRef.value.validate()

    loading.value = true

    // 判断新旧密码是否相同
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      ElMessage.warning('新密码不能与旧密码相同')
      loading.value = false
      return
    }

    // 提交更新
    await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    // 修改成功后由store中的方法自动处理登出和提示
  } catch (error) {
    console.error('修改密码失败', error)
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('修改密码失败，请重试')
    }
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''

  // 清除表单验证结果
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.password-update-container {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
}

.password-card {
  margin-bottom: 20px;
  max-width: 600px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}
</style> 