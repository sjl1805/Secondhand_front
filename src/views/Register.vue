<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>加入二手交易平台，开始您的交易之旅</p>
      </div>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          @keyup.enter="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="registerForm.username"
              clearable
              placeholder="请输入用户名（3-20个字符）"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="registerForm.password"
              placeholder="请输入密码（6-20个字符）"
              prefix-icon="Lock"
              show-password
              type="password"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              prefix-icon="Lock"
              show-password
              type="password"
          />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input
              v-model="registerForm.nickname"
              clearable
              placeholder="请输入昵称（2-20个字符）"
              prefix-icon="UserFilled"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="registerForm.email"
              clearable
              placeholder="请输入邮箱地址"
              prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="captchaCode">
          <div class="captcha-container">
            <el-input
                v-model="registerForm.captchaCode"
                clearable
                placeholder="请输入验证码"
            />
            <div class="captcha-img" title="点击刷新验证码" @click="refreshCaptcha">
              <template v-if="captchaImg">
                <img :src="captchaImg" alt="验证码">
              </template>
              <el-button v-else type="primary" @click.stop="refreshCaptcha">
                获取验证码
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意 <a href="#" @click.prevent="showAgreement">用户协议</a> 和 <a href="#"
                                                                                         @click.prevent="showPrivacy">隐私政策</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
              :loading="loading"
              class="register-button"
              type="primary"
              @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <p>已有账号?
          <router-link to="/login">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {getCaptcha} from '@/api/auth'
import {ElMessage, ElMessageBox} from 'element-plus'

// 路由
const router = useRouter()

// 用户store
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 验证码
const captchaImg = ref('')
const captchaKey = ref('')

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  captchaCode: '',
  captchaKey: '',
  agreement: false
})

// 校验密码是否一致
const validatePass = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 校验协议是否勾选
const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请再次输入密码', trigger: 'blur'},
    {validator: validatePass, trigger: 'blur'}
  ],
  nickname: [
    {required: true, message: '请输入昵称', trigger: 'blur'},
    {min: 2, max: 20, message: '昵称长度在2到20个字符之间', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱地址', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
  ],
  captchaCode: [
    {required: true, message: '请输入验证码', trigger: 'blur'},
    {min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur'}
  ],
  agreement: [
    {validator: validateAgreement, trigger: 'change'}
  ]
}

// 获取验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()
    if (res.code === 200 && res.data) {
      captchaImg.value = `data:image/png;base64,${res.data.image}`
      captchaKey.value = res.data.key
      registerForm.captchaKey = res.data.key
    }
  } catch (error) {
    console.error('获取验证码失败', error)
    ElMessage.error('获取验证码失败，请刷新页面重试')
  }
}

// 显示用户协议
const showAgreement = () => {
  ElMessageBox.alert(
      '欢迎使用二手交易平台，本协议是您与平台之间关于使用平台服务所订立的协议。使用本平台，您需要遵守本协议的全部条款。',
      '用户协议',
      {
        confirmButtonText: '我已阅读',
        center: true
      }
  )
}

// 显示隐私政策
const showPrivacy = () => {
  ElMessageBox.alert(
      '本平台非常重视用户隐私，我们会依据相关法律法规保护您的个人信息和数据安全。在使用平台过程中，我们会收集必要的信息以提供更好的服务体验。',
      '隐私政策',
      {
        confirmButtonText: '我已阅读',
        center: true
      }
  )
}

// 注册处理
const handleRegister = () => {
  if (!registerFormRef.value) return

  registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      const result = await userStore.userRegister({
        username: registerForm.username,
        password: registerForm.password,
        nickname: registerForm.nickname,
        email: registerForm.email,
        captchaKey: registerForm.captchaKey,
        captchaCode: registerForm.captchaCode
      })

      if (result && result.code === 200) {
        ElMessage.success('注册成功')
        router.push('/')
      }
    } catch (error) {
      // 注册失败，刷新验证码
      refreshCaptcha()
      console.error('注册失败', error)
      ElMessage.error(error.message || '注册失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

// 页面加载时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.register-header p {
  color: #999;
  font-size: 14px;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-img {
  width: 130px;
  height: 48px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.register-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.register-footer {
  margin-top: 20px;
  text-align: center;
}

.register-footer p {
  color: #666;
}

.register-footer a {
  color: #409EFF;
  font-weight: bold;
}

a {
  color: #409EFF;
  text-decoration: none;
}
</style> 