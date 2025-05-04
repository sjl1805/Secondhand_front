<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>用户登录</h2>
        <p>欢迎回到二手交易平台</p>
      </div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="loginForm.username"
              clearable
              placeholder="请输入用户名"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              type="password"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="captchaCode">
          <div class="captcha-container">
            <el-input
                v-model="loginForm.captchaCode"
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

        <div class="remember-forgot">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <router-link to="/forgot-password">忘记密码?</router-link>
        </div>

        <el-form-item>
          <el-button
              :loading="loading"
              class="login-button"
              type="primary"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>还没有账号?
          <router-link to="/register">立即注册</router-link>
        </p>
        <p>或者使用以下方式登录</p>
        <div class="other-login">
          <el-button circle>
            <el-icon>
              <HomeFilled/>
            </el-icon>
          </el-button>
          <el-button circle>
            <el-icon>
              <Message/>
            </el-icon>
          </el-button>
          <el-button circle>
            <el-icon>
              <Iphone/>
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {getCaptcha} from '@/api/auth'
import {ElMessage} from 'element-plus'
import {HomeFilled, Iphone, Message} from '@element-plus/icons-vue'

// 路由
const router = useRouter()
const route = useRoute()

// 用户store
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 记住我选项
const rememberMe = ref(false)

// 验证码
const captchaImg = ref('')
const captchaKey = ref('')

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: '',
  captchaKey: ''
})

// 表单验证规则
const loginRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur'}
  ],
  captchaCode: [
    {required: true, message: '请输入验证码', trigger: 'blur'},
    {min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur'}
  ]
}

// 获取验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()
    if (res.code === 200 && res.data) {
      captchaImg.value = `data:image/png;base64,${res.data.image}`
      captchaKey.value = res.data.key
      loginForm.captchaKey = res.data.key
    }
  } catch (error) {
    console.error('获取验证码失败', error)
    ElMessage.error('获取验证码失败，请刷新页面重试')
  }
}

// 登录处理
const handleLogin = () => {
  if (!loginFormRef.value) return

  loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      const result = await userStore.userLogin({
        username: loginForm.username,
        password: loginForm.password,
        captchaKey: loginForm.captchaKey,
        captchaCode: loginForm.captchaCode
      })

      if (result && result.code === 200) {
        ElMessage.success('登录成功')

        // 如果有重定向地址，跳转到重定向地址
        const redirectUrl = route.query.redirect || '/'
        router.push(redirectUrl)
      }
    } catch (error) {
      // 登录失败，刷新验证码
      refreshCaptcha()
      console.error('登录失败', error)
      ElMessage.error(error.message || '登录失败，请重试')
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
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

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.login-footer p {
  margin-bottom: 10px;
  color: #666;
}

.login-footer a {
  color: #409EFF;
  font-weight: bold;
}

.other-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}
</style> 