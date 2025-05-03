import './assets/main.css'
import './styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import router from './router'

// 创建应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('应用错误:', err)
  // 不显示错误通知，避免循环错误
  if (!err.message?.includes('insertBefore')) {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局自定义指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 图片懒加载指令
app.directive('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.unobserve(el)
        }
      })
    })
    observer.observe(el)
  }
})

// 为应用注册插件 - 只注册一次pinia
const pinia = createPinia()
app.use(pinia)

// 注册路由
app.use(router)

// 注册ElementPlus
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
})

// 确保DOM已准备好后再挂载应用
const mountApp = () => {
  try {
    // 使用try-catch包裹挂载过程
    app.mount('#app')
    console.log('应用挂载成功')
  } catch (err) {
    console.error('应用挂载失败:', err)
    // 如果挂载失败，等待一段时间后重试
    setTimeout(mountApp, 100)
  }
}

// 检查DOM是否已加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(mountApp, 10)
  })
} else {
  // 如果DOM已加载完成，直接挂载
  setTimeout(mountApp, 10)
}
