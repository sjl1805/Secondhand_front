<template>
  <div class="dashboard-container" v-loading="statisticsStore.loading">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="data-title">
              <el-icon class="icon"><User /></el-icon>
              <span>用户总数</span>
            </div>
            <div class="data-extra">
              <el-tag size="small" type="success">今日新增: +{{ statisticsStore.basicStats.todayNewUsers }}</el-tag>
            </div>
          </div>
          <div class="data-value">{{ statisticsStore.basicStats.totalUsers }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="data-title">
              <el-icon class="icon"><Goods /></el-icon>
              <span>商品总数</span>
            </div>
            <div class="data-extra">
              <el-tag size="small" type="success">今日新增: +{{ statisticsStore.basicStats.todayNewProducts }}</el-tag>
            </div>
          </div>
          <div class="data-value">{{ statisticsStore.basicStats.totalProducts }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="data-title">
              <el-icon class="icon"><List /></el-icon>
              <span>订单总数</span>
            </div>
            <div class="data-extra">
              <el-tag size="small" type="success">今日新增: +{{ statisticsStore.basicStats.todayNewOrders }}</el-tag>
            </div>
          </div>
          <div class="data-value">{{ statisticsStore.basicStats.totalOrders }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="data-title">
              <el-icon class="icon"><Money /></el-icon>
              <span>总交易额</span>
            </div>
            <div class="data-extra">
              <el-tag size="small" type="success">今日交易: +¥{{ formatPrice(statisticsStore.basicStats.todayRevenue) }}</el-tag>
            </div>
          </div>
          <div class="data-value">¥{{ formatPrice(statisticsStore.basicStats.totalRevenue) }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 统计图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 左侧图表 -->
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>近30天数据趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button :value="'user'">用户注册</el-radio-button>
                <el-radio-button :value="'order'">订单数量</el-radio-button>
                <el-radio-button :value="'transaction'">交易金额</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="trendChartRef"></div>
        </el-card>
      </el-col>
      
      <!-- 右侧图表 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>商品分类统计</span>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 状态分析区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>商品状态分布</span>
            </div>
          </template>
          <div class="chart-container" ref="productStatusChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div class="chart-container" ref="orderStatusChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 热门数据列表 -->
    <el-row :gutter="20" class="list-row">
      <el-col :span="12">
        <el-card shadow="hover" class="list-card">
          <template #header>
            <div class="list-header">
              <span>热门商品排行</span>
              <el-button type="primary" size="small" text @click="fetchHotProducts">刷新</el-button>
            </div>
          </template>
          <el-table :data="statisticsStore.hotProductsStats" style="width: 100%" :header-cell-style="{ background: '#f5f7fa' }">
            <el-table-column prop="rank" label="排名" width="60" />
            <el-table-column prop="title" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="scope">
                ¥{{ formatPrice(scope.row.price) }}
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="浏览量" width="90" />
            <el-table-column prop="saleCount" label="销量" width="80" />
            <el-table-column label="评分" width="120">
              <template #default="scope">
                <div v-if="scope.row.rating" class="product-rating-cell">
                  <el-rate
                    v-model="scope.row.rating"
                    disabled
                    text-color="#ff9900"
                    :show-score="false"
                    :max="5"
                  />
                  <span>{{ scope.row.rating.toFixed(1) }}</span>
                </div>
                <span v-else>暂无评分</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover" class="list-card">
          <template #header>
            <div class="list-header">
              <span>活跃卖家排行</span>
              <el-button type="primary" size="small" text @click="fetchActiveSellers">刷新</el-button>
            </div>
          </template>
          <el-table :data="statisticsStore.activeSellersStats" style="width: 100%" :header-cell-style="{ background: '#f5f7fa' }">
            <el-table-column prop="rank" label="排名" width="60" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="nickname" label="昵称" />
            <el-table-column prop="productCount" label="发布商品数" width="100" />
            <el-table-column prop="saleCount" label="售出数量" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { useStatisticsStore } from '@/stores/statistics'
import * as echarts from 'echarts'
import { User, Goods, List, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 初始化store
const userStore = useUserStore()
const statisticsStore = useStatisticsStore()

// 设置管理员权限
statisticsStore.setAdminRole(userStore.role === 9 || userStore.role === '9')

// 图表引用
const trendChartRef = ref(null)
const categoryChartRef = ref(null)
const productStatusChartRef = ref(null)
const orderStatusChartRef = ref(null)
const ratingChartRef = ref(null)
const trendChart = ref(null)
const categoryChart = ref(null)
const productStatusChart = ref(null)
const orderStatusChart = ref(null)
const ratingChart = ref(null)

// 当前选择的图表类型
const chartType = ref('user')

// 选择的商品
const selectedProduct = ref(null)
const productRatingStats = ref(null)

// 格式化价格
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart.value = echarts.init(trendChartRef.value)
  updateTrendChart()
}

// 更新趋势图表
const updateTrendChart = () => {
  if (!trendChart.value) return
  
  let data = []
  let title = ''
  let yAxisName = ''
  let color = ''
  
  if (chartType.value === 'user') {
    data = statisticsStore.userRegisterStats || []
    title = '用户注册趋势'
    yAxisName = '注册人数'
    color = '#409EFF'
  } else if (chartType.value === 'order') {
    data = statisticsStore.orderStats || []
    title = '订单数量趋势'
    yAxisName = '订单数量'
    color = '#67C23A'
  } else if (chartType.value === 'transaction') {
    data = statisticsStore.transactionStats || []
    title = '交易金额趋势'
    yAxisName = '交易金额(元)'
    color = '#E6A23C'
  }
  
  // 检查是否有数据
  if (!data || data.length === 0) {
    trendChart.value.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  } else {
    trendChart.value.hideLoading()
  }
  
  const xAxisData = data.map(item => item.date || '')
  const seriesData = data.map(item => item.value || 0)
  
  // 检查是否有有效数据
  const hasData = seriesData.some(value => value > 0)
  if (!hasData) {
    trendChart.value.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  }
  
  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}: ${data.value}`
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        color: '#666',
        formatter: function(value) {
          return value ? value.substring(5) : ''  // 只显示月-日
        }
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: yAxisName,
        type: 'line',
        data: seriesData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: color
        },
        lineStyle: {
          width: 3,
          color: color
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '50' },
            { offset: 1, color: color + '10' }
          ])
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '60',
      containLabel: true
    }
  }
  
  trendChart.value.setOption(option)
}

// 初始化分类图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  
  categoryChart.value = echarts.init(categoryChartRef.value)
  updateCategoryChart()
}

// 更新分类图表
const updateCategoryChart = () => {
  if (!categoryChart.value) return
  
  // 添加错误处理
  if (!statisticsStore.categoryProductStats || !statisticsStore.categoryProductStats.length) {
    categoryChart.value.showLoading({
      text: '暂无分类数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  } else {
    categoryChart.value.hideLoading()
  }
  
  const data = statisticsStore.categoryProductStats.map(item => ({
    name: item.categoryName || '未分类',
    value: item.productCount || 0
  }))
  
  // 检查是否有有效数据
  const hasData = data.some(item => item.value > 0)
  if (!hasData) {
    categoryChart.value.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      type: 'scroll',
      textStyle: {
        color: '#666'
      }
    },
    series: [
      {
        name: '商品分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  categoryChart.value.setOption(option)
}

// 初始化商品状态图表
const initProductStatusChart = () => {
  if (!productStatusChartRef.value) return
  
  productStatusChart.value = echarts.init(productStatusChartRef.value)
  updateProductStatusChart()
}

// 更新商品状态图表
const updateProductStatusChart = () => {
  if (!productStatusChart.value) return
  
  const stats = statisticsStore.productStatusStats || {}
  
  const data = [
    { name: '在售', value: stats.onSale || 0 },
    { name: '已售', value: stats.sold || 0 },
    { name: '下架', value: stats.offShelf || 0 }
  ]
  
  // 检查是否所有数据都为0，如果是则不显示图表
  const hasData = data.some(item => item.value > 0)
  if (!hasData) {
    // 没有数据时显示无数据提示
    productStatusChart.value.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  } else {
    productStatusChart.value.hideLoading()
  }
  
  const colors = ['#67C23A', '#409EFF', '#F56C6C']
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '商品状态',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: data,
        color: colors,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  productStatusChart.value.setOption(option)
}

// 初始化订单状态图表
const initOrderStatusChart = () => {
  if (!orderStatusChartRef.value) return
  
  orderStatusChart.value = echarts.init(orderStatusChartRef.value)
  updateOrderStatusChart()
}

// 更新订单状态图表
const updateOrderStatusChart = () => {
  if (!orderStatusChart.value) return
  
  const stats = statisticsStore.orderStatusStats || {}
  
  const data = [
    { name: '待付款', value: stats.pendingPayment || 0 },
    { name: '待发货', value: stats.pendingShipment || 0 },
    { name: '待收货', value: stats.pendingReceipt || 0 },
    { name: '已完成', value: stats.completed || 0 },
    { name: '已取消', value: stats.cancelled || 0 }
  ]
  
  // 检查是否所有数据都为0，如果是则不显示图表
  const hasData = data.some(item => item.value > 0)
  if (!hasData) {
    // 没有数据时显示无数据提示
    orderStatusChart.value.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  } else {
    orderStatusChart.value.hideLoading()
  }
  
  const colors = ['#E6A23C', '#409EFF', '#67C23A', '#909399', '#F56C6C']
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: data,
        color: colors,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  orderStatusChart.value.setOption(option)
}

// 获取热门商品
const fetchHotProducts = async () => {
  try {
    await statisticsStore.fetchHotProductsStatistics()
  } catch (error) {
    console.error('获取热门商品失败', error)
  }
}

// 获取活跃卖家
const fetchActiveSellers = async () => {
  try {
    await statisticsStore.fetchActiveSellersStatistics()
  } catch (error) {
    console.error('获取活跃卖家失败', error)
  }
}

// 获取商品评分统计
const fetchProductRating = async () => {
  if (!selectedProduct.value) return
  
  try {
    const data = await statisticsStore.fetchProductRatingStatistics(selectedProduct.value)
    if (data) {
      productRatingStats.value = data
      nextTick(() => {
        initRatingChart()
      })
    }
  } catch (error) {
    console.error('获取商品评分统计失败', error)
    ElMessage.error('获取商品评分统计失败')
  }
}

// 初始化评分分布图表
const initRatingChart = () => {
  if (!ratingChartRef.value || !productRatingStats.value) return
  
  // 初始化图表
  if (!ratingChart.value) {
    ratingChart.value = echarts.init(ratingChartRef.value)
  }
  
  // 准备数据
  const data = []
  for (let i = 5; i >= 1; i--) {
    data.push({
      value: productRatingStats.value[i] || 0,
      name: `${i}星`
    })
  }
  
  // 计算评价总数
  const totalCount = data.reduce((sum, item) => sum + item.value, 0)
  
  // 如果没有数据显示提示
  if (totalCount === 0) {
    ratingChart.value.showLoading({
      text: '暂无评分数据',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 1
    })
    return
  } else {
    ratingChart.value.hideLoading()
  }
  
  // 设置颜色
  const colors = ['#ff9900', '#67c23a', '#409eff', '#e6a23c', '#f56c6c']
  
  // 配置图表
  const option = {
    title: {
      text: '商品评分分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '评分分布',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '50%'],
        data: data,
        color: colors,
        label: {
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  ratingChart.value.setOption(option)
}

// 监听图表类型变化
watch(chartType, () => {
  nextTick(() => {
    updateTrendChart()
  })
})

// 调整窗口大小时重绘图表
const resizeCharts = () => {
  trendChart.value && trendChart.value.resize()
  categoryChart.value && categoryChart.value.resize()
  productStatusChart.value && productStatusChart.value.resize()
  orderStatusChart.value && orderStatusChart.value.resize()
  ratingChart.value && ratingChart.value.resize()
}

// 组件挂载后初始化
onMounted(async () => {
  try {
    // 检查是否有管理员权限
    if (!(userStore.role === 9 || userStore.role === '9')) {
      ElMessage.warning('您需要管理员权限才能访问控制面板')
      return
    }
    
    // 初始化仪表盘数据
    await statisticsStore.initDashboardData()
    
    // 等待DOM更新后初始化图表
    nextTick(() => {
      initTrendChart()
      initCategoryChart()
      initProductStatusChart()
      initOrderStatusChart()
      
      // 监听窗口大小变化
      window.addEventListener('resize', resizeCharts)
    })
  } catch (error) {
    console.error('初始化控制面板失败', error)
    ElMessage.error('加载控制面板数据失败')
  }
})

// 组件卸载前清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  
  // 销毁图表实例
  trendChart.value && trendChart.value.dispose()
  categoryChart.value && categoryChart.value.dispose()
  productStatusChart.value && productStatusChart.value.dispose()
  orderStatusChart.value && orderStatusChart.value.dispose()
  ratingChart.value && ratingChart.value.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.data-card {
  height: 120px;
  margin-bottom: 20px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.data-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #606266;
}

.data-title .icon {
  margin-right: 8px;
  font-size: 20px;
  color: #409EFF;
}

.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.list-row {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-rating-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.empty-chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 