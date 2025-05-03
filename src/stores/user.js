import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login, register } from '@/api/auth'
import { getUserInfo, updateUserInfo, updatePassword } from '@/api/user'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(Cookies.get('token') || '')
  const userId = ref('')
  const username = ref('')
  const nickname = ref('')
  const avatar = ref('')
  const role = ref('')
  const email = ref('')
  const phone = ref('')
  const bio = ref('')
  
  // 判断是否已登录
  const isLoggedIn = ref(!!token.value)
  
  // 初始化用户信息
  const initUserInfo = () => {
    if (token.value) {
      try {
        // 从token中解析用户信息
        const decoded = jwtDecode(token.value)
        userId.value = decoded.userId || ''
        role.value = decoded.role || 'user'
        
        // 如果还有存储的用户信息，也一并加载
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        username.value = userInfo.username || ''
        nickname.value = userInfo.nickname || ''
        avatar.value = userInfo.avatar || ''
        
        // 获取最新的用户信息
        fetchUserInfo()
      } catch (error) {
        console.error('解析token失败', error)
        logout()
      }
    }
  }
  
  // 登录
  const userLogin = async (loginForm) => {
    try {
      const data = {
        username: loginForm.username,
        password: loginForm.password,
        captcha: loginForm.captchaCode,
        captchaKey: loginForm.captchaKey
      }
      
      const res = await login(data)
      if (res.code === 200 && res.data) {
        setUserInfo(res.data)
        return res
      }
    } catch (error) {
      console.error('登录失败', error)
      throw error
    }
  }
  
  // 注册
  const userRegister = async (registerForm) => {
    try {
      const data = {
        username: registerForm.username,
        password: registerForm.password,
        nickname: registerForm.nickname,
        email: registerForm.email,
        captcha: registerForm.captchaCode,
        captchaKey: registerForm.captchaKey
      }
      
      const res = await register(data)
      if (res.code === 200 && res.data) {
        setUserInfo(res.data)
        return res
      }
    } catch (error) {
      console.error('注册失败', error)
      throw error
    }
  }
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return
    
    try {
      const res = await getUserInfo()
      if (res.code === 200 && res.data) {
        // 更新用户信息
        const data = res.data
        username.value = data.username || username.value
        nickname.value = data.nickname || nickname.value
        avatar.value = data.avatar || avatar.value
        email.value = data.email || ''
        phone.value = data.phone || ''
        bio.value = data.bio || ''
        
        // 更新localStorage
        updateLocalStorage()
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }
  
  // 更新用户信息
  const updateProfile = async (profileData) => {
    try {
      const res = await updateUserInfo(profileData)
      if (res.code === 200) {
        // 更新本地用户数据
        if (profileData.nickname) nickname.value = profileData.nickname
        if (profileData.avatar) avatar.value = profileData.avatar
        if (profileData.email) email.value = profileData.email
        if (profileData.phone) phone.value = profileData.phone
        if (profileData.bio) bio.value = profileData.bio
        
        // 更新localStorage
        updateLocalStorage()
        
        return res
      }
    } catch (error) {
      console.error('更新用户信息失败', error)
      throw error
    }
  }
  
  // 修改密码
  const changePassword = async (data) => {
    try {
      const res = await updatePassword(data)
      if (res.code === 200) {
        ElMessage.success('密码修改成功，请重新登录')
        
        // 修改密码成功后需要重新登录
        setTimeout(() => {
          logout()
        }, 1500)
        
        return res
      }
    } catch (error) {
      console.error('修改密码失败', error)
      throw error
    }
  }
  
  // 更新localStorage中的用户信息
  const updateLocalStorage = () => {
    localStorage.setItem('userInfo', JSON.stringify({
      username: username.value,
      nickname: nickname.value,
      avatar: avatar.value
    }))
  }
  
  // 设置用户信息
  const setUserInfo = (data) => {
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    nickname.value = data.nickname
    avatar.value = data.avatar
    role.value = data.role
    isLoggedIn.value = true
    
    // 保存token到cookie
    Cookies.set('token', data.token, { expires: 7 }) // 7天过期
    
    // 保存用户信息到localStorage
    updateLocalStorage()
  }
  
  // 登出
  const logout = () => {
    token.value = ''
    userId.value = ''
    username.value = ''
    nickname.value = ''
    avatar.value = ''
    role.value = ''
    email.value = ''
    phone.value = ''
    bio.value = ''
    isLoggedIn.value = false
    
    // 清除token和用户信息
    Cookies.remove('token')
    localStorage.removeItem('userInfo')
    
    // 跳转到登录页
    router.push('/login')
  }
  
  // 初始化用户信息
  initUserInfo()
  
  return {
    token,
    userId,
    username,
    nickname,
    avatar,
    role,
    email,
    phone,
    bio,
    isLoggedIn,
    userLogin,
    userRegister,
    fetchUserInfo,
    updateProfile,
    changePassword,
    logout,
    setUserInfo
  }
}) 