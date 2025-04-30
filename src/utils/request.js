import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import Cookies from 'js-cookie'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 与后端的context-path对应
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 如果有token，携带token
    const token = Cookies.get('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 根据后端返回的状态码处理不同情况
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3 * 1000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 清除token并跳转到登录页
        Cookies.remove('token')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误', error)
    ElMessage({
      message: error.message || '网络错误',
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default request