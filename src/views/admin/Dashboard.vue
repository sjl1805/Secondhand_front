<template>
  <div class="dashboard-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="dashboard-loading">
      <el-icon class="loading-icon">
        <Loading/>
      </el-icon>
      <span>管理面板数据加载中...</span>
    </div>

    <!-- 错误提示 -->
    <el-alert
        v-if="error"
        :closable="false"
        :title="errorMessage"
        show-icon
        type="error"
    />

    <!-- 正常内容 -->
    <div v-if="!loading && !error" v-loading="chartsLoading">
      <!-- 数据概览卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="data-card user-card" shadow="hover">
            <div class="data-header">
              <div class="data-title">
                <el-icon class="icon user-icon">
                  <User/>
                </el-icon>
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
          <el-card class="data-card product-card" shadow="hover">
            <div class="data-header">
              <div class="data-title">
                <el-icon class="icon product-icon">
                  <Goods/>
                </el-icon>
                <span>商品总数</span>
              </div>
              <div class="data-extra">
                <el-tag size="small" type="success">今日新增: +{{
                    statisticsStore.basicStats.todayNewProducts
                  }}
                </el-tag>
              </div>
            </div>
            <div class="data-value">{{ statisticsStore.basicStats.totalProducts }}</div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="data-card order-card" shadow="hover">
            <div class="data-header">
              <div class="data-title">
                <el-icon class="icon order-icon">
                  <List/>
                </el-icon>
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
          <el-card class="data-card sales-card" shadow="hover">
            <div class="data-header">
              <div class="data-title">
                <el-icon class="icon sales-icon">
                  <Money/>
                </el-icon>
                <span>总交易额</span>
              </div>
              <div class="data-extra">
                <el-tag size="small" type="success">今日交易:
                  +¥{{ formatPrice(statisticsStore.basicStats.todayTransaction) }}
                </el-tag>
              </div>
            </div>
            <div class="data-value">¥{{ formatPrice(statisticsStore.basicStats.totalTransaction) }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 统计图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <!-- 左侧图表 -->
        <el-col :span="24">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>近30天数据趋势</span>
                <el-radio-group v-model="chartType" size="small" @change="handleChartTypeChange">
                  <el-radio-button key="user" :value="'user'">用户注册</el-radio-button>
                  <el-radio-button key="order" :value="'order'">订单数量</el-radio-button>
                  <el-radio-button key="transaction" :value="'transaction'">交易金额</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-card-body">
              <div v-if="!loading" ref="trendChartRef" class="chart-container trend-chart-container">
                <div v-if="!trendChartLoaded" class="chart-loading">
                  <el-icon class="loading-icon">
                    <Loading/>
                  </el-icon>
                  <span>正在加载图表...</span>
                </div>
              </div>
              <div v-else class="chart-loading">
                <el-icon class="loading-icon">
                  <Loading/>
                </el-icon>
                <span>数据加载中...</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 状态分析区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>商品状态分布</span>
              </div>
            </template>
            <div class="chart-card-body">
              <div v-if="!loading" ref="productStatusChartRef" class="chart-container product-status-chart-container">
                <div v-if="!productStatusChartLoaded" class="chart-loading">
                  <el-icon class="loading-icon">
                    <Loading/>
                  </el-icon>
                  <span>正在加载图表...</span>
                </div>
              </div>
              <div v-else class="chart-loading">
                <el-icon class="loading-icon">
                  <Loading/>
                </el-icon>
                <span>数据加载中...</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>订单状态分布</span>
              </div>
            </template>
            <div class="chart-card-body">
              <div v-if="!loading" ref="orderStatusChartRef" class="chart-container order-status-chart-container">
                <div v-if="!orderStatusChartLoaded" class="chart-loading">
                  <el-icon class="loading-icon">
                    <Loading/>
                  </el-icon>
                  <span>正在加载图表...</span>
                </div>
              </div>
              <div v-else class="chart-loading">
                <el-icon class="loading-icon">
                  <Loading/>
                </el-icon>
                <span>数据加载中...</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 热门数据列表 -->
      <el-row :gutter="20" class="list-row">
        <el-col :span="8">
          <el-card class="list-card" shadow="hover">
            <template #header>
              <div class="list-header">
                <span class="list-title"><el-icon><House/></el-icon> 热门商品排行</span>
                <el-button size="small" text type="primary" @click="fetchHotProducts">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                  刷新
                </el-button>
              </div>
            </template>
            <div class="table-container">
              <el-table
                  :data="statisticsStore.hotProductsStats"
                  :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
                  :max-height="520"
                  border
                  highlight-current-row
                  stripe
                  style="width: 100%"
              >
                <el-table-column align="center" fixed="left" label="排名" type="index" width="70">
                  <template #default="scope">
                    <div class="rank-cell">
                      <div
                          :class="scope.$index < 3 ? `rank-${scope.$index + 1}` : ''"
                          class="rank-badge"
                      >
                        {{ scope.$index + 1 }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="商品名称" min-width="140" prop="title" show-overflow-tooltip>
                  <template #default="scope">
                    <div class="product-title-cell">{{ scope.row.title }}</div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="价格" prop="price" width="100">
                  <template #default="scope">
                    <span class="price">¥{{ formatPrice(scope.row.price) }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="浏览量" prop="view_count" width="90">
                  <template #default="scope">
                    <el-tag class="stat-tag" effect="light" size="small" type="info">
                      <el-icon>
                        <View/>
                      </el-icon>
                      {{ scope.row.view_count }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="收藏量" prop="favorite_count" width="90">
                  <template #default="scope">
                    <el-tag class="stat-tag" effect="light" size="small" type="warning">
                      <el-icon>
                        <Star/>
                      </el-icon>
                      {{ scope.row.favorite_count }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="状态" prop="status" width="80">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)" effect="light" size="small">
                      {{ getStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="list-card" shadow="hover">
            <template #header>
              <div class="list-header">
                <span class="list-title"><el-icon><Sell/></el-icon> 活跃卖家排行</span>
                <el-button size="small" text type="primary" @click="fetchActiveSellers">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                  刷新
                </el-button>
              </div>
            </template>
            <div class="table-container">
              <el-table
                  :data="statisticsStore.activeSellersStats"
                  :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
                  :max-height="520"
                  border
                  highlight-current-row
                  stripe
                  style="width: 100%"
              >
                <el-table-column align="center" fixed="left" label="排名" type="index" width="70">
                  <template #default="scope">
                    <div class="rank-cell">
                      <div
                          :class="scope.$index < 3 ? `rank-${scope.$index + 1}` : ''"
                          class="rank-badge"
                      >
                        {{ scope.$index + 1 }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="用户信息" min-width="160">
                  <template #default="scope">
                    <div class="user-info">
                      <el-avatar v-if="scope.row.avatar" :size="36" :src="scope.row.avatar">
                        {{ scope.row.nickname ? scope.row.nickname.substring(0, 1) : 'U' }}
                      </el-avatar>
                      <el-avatar v-else :size="36">
                        {{ scope.row.nickname ? scope.row.nickname.substring(0, 1) : 'U' }}
                      </el-avatar>
                      <span class="user-nickname">{{ scope.row.nickname || '匿名用户' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="商品数" prop="product_count" width="90">
                  <template #default="scope">
                    <el-tag class="stat-tag" effect="light" size="small" type="success">
                      <el-icon>
                        <Goods/>
                      </el-icon>
                      {{ scope.row.product_count }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="已售数" prop="completed_order_count" width="90">
                  <template #default="scope">
                    <el-tag class="stat-tag" effect="light" size="small" type="info">
                      <el-icon>
                        <Sold/>
                      </el-icon>
                      {{ scope.row.completed_order_count }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="销售额" prop="total_sales" width="110">
                  <template #default="scope">
                    <span v-if="scope.row.total_sales" class="price">¥{{ formatPrice(scope.row.total_sales) }}</span>
                    <span v-else>¥0.00</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="list-card" shadow="hover">
            <template #header>
              <div class="list-header">
                <span class="list-title"><el-icon><ShoppingBag/></el-icon> 活跃买家排行</span>
                <el-button size="small" text type="primary" @click="fetchActiveBuyers">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                  刷新
                </el-button>
              </div>
            </template>
            <div class="table-container">
              <el-table
                  :data="statisticsStore.activeBuyersStats"
                  :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
                  :max-height="520"
                  border
                  highlight-current-row
                  stripe
                  style="width: 100%"
              >
                <el-table-column align="center" fixed="left" label="排名" type="index" width="70">
                  <template #default="scope">
                    <div class="rank-cell">
                      <div
                          :class="scope.$index < 3 ? `rank-${scope.$index + 1}` : ''"
                          class="rank-badge"
                      >
                        {{ scope.$index + 1 }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="用户信息" min-width="160">
                  <template #default="scope">
                    <div class="user-info">
                      <el-avatar v-if="scope.row.avatar" :size="36" :src="scope.row.avatar">
                        {{ scope.row.nickname ? scope.row.nickname.substring(0, 1) : 'U' }}
                      </el-avatar>
                      <el-avatar v-else :size="36">
                        {{ scope.row.nickname ? scope.row.nickname.substring(0, 1) : 'U' }}
                      </el-avatar>
                      <span class="user-nickname">{{ scope.row.nickname || '匿名用户' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="订单数" prop="order_count" width="90">
                  <template #default="scope">
                    <el-tag class="stat-tag" effect="light" size="small" type="primary">
                      <el-icon>
                        <ShoppingBag/>
                      </el-icon>
                      {{ scope.row.order_count }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="消费额" prop="total_spent" width="110">
                  <template #default="scope">
                    <span v-if="scope.row.total_spent" class="price">¥{{ formatPrice(scope.row.total_spent) }}</span>
                    <span v-else>¥0.00</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {useUserStore} from '@/stores/user'
import {useStatisticsStore} from '@/stores/statistics'
import {useFileStore} from '@/stores/file'
import * as echarts from 'echarts'
import {
  Goods,
  Goods as Sold,
  House,
  List,
  Loading,
  Money,
  Refresh,
  Sell,
  ShoppingBag,
  Star,
  User,
  View
} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

// 初始化store
const userStore = useUserStore()
const statisticsStore = useStatisticsStore()
const fileStore = useFileStore()

// 设置管理员权限
statisticsStore.setAdminRole(userStore.role === 9 || userStore.role === '9')

// 图表引用
const trendChartRef = ref(null)
const productStatusChartRef = ref(null)
const orderStatusChartRef = ref(null)
const trendChart = ref(null)
const productStatusChart = ref(null)
const orderStatusChart = ref(null)

// 图表加载状态
const trendChartLoaded = ref(false)
const productStatusChartLoaded = ref(false)
const orderStatusChartLoaded = ref(false)
const chartsLoading = ref(false)

// 当前选择的图表类型
const chartType = ref('user')

// 组件加载状态和错误状态
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')

// 组件挂载状态
const isMounted = ref(false)

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取当前日期
const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart.value = echarts.init(trendChartRef.value)
  updateTrendChart()
}

// 更新趋势图表
const updateTrendChart = () => {
  try {
    // 检查组件是否已被卸载
    if (!isMounted.value) {
      console.warn('组件已被卸载，取消图表更新')
      return
    }

    // 检查图表实例和DOM是否有效
    if (!trendChart.value || !trendChartRef.value || !document.body.contains(trendChartRef.value)) {
      console.warn('趋势图表实例或容器无效，跳过更新')
      return
    }

    // 准备数据
    let data = []
    let title = ''
    let yAxisName = ''
    let color = ''

    try {
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
    } catch (err) {
      console.error('获取图表数据失败:', err)
      data = []
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

    // 数据转换
    let xAxisData = []
    let seriesData = []

    try {
      // 适配后端API返回数据格式：time_period和count/amount
      xAxisData = data.map(item => {
        if (!item || !item.time_period) return ''
        return item.time_period
      })

      seriesData = data.map(item => {
        if (!item) return 0

        if (chartType.value === 'transaction') {
          return item.amount || 0
        } else {
          return item.count || 0
        }
      })
    } catch (err) {
      console.error('转换图表数据失败:', err)
      xAxisData = []
      seriesData = []
    }

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

    // 构建配置
    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        },
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          try {
            if (!params || !params.length) {
              return '';
            }

            const data = params[0];
            if (!data || typeof data.value === 'undefined') {
              return '';
            }

            let value = data.value;

            // 格式化交易金额，保留两位小数
            if (chartType.value === 'transaction') {
              value = '¥' + parseFloat(value).toFixed(2);
            }

            const name = data.name || '';
            const seriesName = data.seriesName || '';

            return `${name}<br/>${seriesName}: ${value}`;
          } catch (err) {
            console.error('生成tooltip失败:', err)
            return ''
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: color,
            opacity: 0.5
          }
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
          fontSize: 12,
          formatter: function (value) {
            try {
              // 检查日期格式，可能为 yyyy-MM-dd 或 yyyy-MM 或 yyyy-ww(周)
              if (!value) return '';

              if (value.includes('-')) {
                const parts = value.split('-');
                // 如果是年-月-日格式
                if (parts.length === 3) {
                  return `${parts[1]}-${parts[2]}`; // 月-日
                }
                // 如果是年-月格式
                else if (parts.length === 2) {
                  return parts[1]; // 只显示月份
                }
              }
              return value;
            } catch (err) {
              console.error('格式化x轴标签失败:', err)
              return value || ''
            }
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#666',
          padding: [0, 0, 0, 20],
          fontSize: 12
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#ddd'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          formatter: function (value) {
            try {
              // 为交易金额添加¥符号
              if (chartType.value === 'transaction') {
                return '¥' + value.toFixed(0);
              }
              return value;
            } catch (err) {
              console.error('格式化y轴标签失败:', err)
              return value || ''
            }
          }
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
          symbolSize: 8,
          itemStyle: {
            color: color,
            borderWidth: 2,
            borderColor: '#fff',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 5
          },
          lineStyle: {
            width: 4,
            color: color,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 5
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: color + '50'},
              {offset: 0.7, color: color + '20'},
              {offset: 1, color: color + '05'}
            ])
          }
        }
      ],
      grid: {
        left: '5%',
        right: '5%',
        bottom: '8%',
        top: '15%',
        containLabel: true
      }
    }

    // 应用配置
    trendChart.value.setOption(option, true)
  } catch (error) {
    console.error('更新趋势图表失败:', error)
  }
}

// 初始化商品状态图表
const initProductStatusChart = () => {
  if (!productStatusChartRef.value) return

  productStatusChart.value = echarts.init(productStatusChartRef.value)
  updateProductStatusChart()
}

// 更新商品状态图表
const updateProductStatusChart = () => {
  try {
    // 检查组件是否已被卸载
    if (!isMounted.value) {
      console.warn('组件已被卸载，取消图表更新')
      return
    }

    // 检查图表实例和DOM是否有效
    if (!productStatusChart.value || !productStatusChartRef.value || !document.body.contains(productStatusChartRef.value)) {
      console.warn('商品状态图表实例或容器无效，跳过更新')
      return
    }

    // 从后端API获取的数据格式为数组，每个元素包含status和count
    const stats = statisticsStore.productStatusStats || []

    // 状态码映射 - 从数据库status字段的注释获取正确的中文
    const statusMap = {
      1: '在售',
      2: '已售',
      3: '下架'
    }

    // 转换数据格式
    const data = []
    stats.forEach(item => {
      // 处理状态值，确保为数字类型
      let statusValue = null;

      // 尝试从对象中提取status值
      if (item) {
        if (typeof item.status === 'number') {
          statusValue = item.status;
        } else if (typeof item.status === 'string') {
          statusValue = parseInt(item.status);
        } else if (item.status === true) {
          // 处理status为true的情况，默认设置为状态1
          statusValue = 1;
        } else if (item._custom && item._custom.value && typeof item._custom.value.status !== 'undefined') {
          // 尝试从_custom属性中获取
          const customStatus = item._custom.value.status;
          if (typeof customStatus === 'number') {
            statusValue = customStatus;
          } else if (customStatus === true) {
            statusValue = 1;
          }
        }
      }

      // 只添加有效状态的数据
      if (statusValue !== null && typeof item.count !== 'undefined') {
        const countValue = parseInt(item.count) || 0;

        // 查找是否已存在相同状态
        const existingItem = data.find(d => d.statusValue === statusValue);
        if (existingItem) {
          // 合并相同状态的数量
          existingItem.value += countValue;
        } else {
          // 添加新状态
          data.push({
            statusValue: statusValue,
            name: statusMap[statusValue] || `状态${statusValue}`,
            value: countValue
          });
        }
      }
    });

    // 检查是否所有数据都为0，如果是则不显示图表
    const hasData = data.length > 0 && data.some(item => item.value > 0)
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

    // 根据状态设置不同颜色
    const colors = ['#67C23A', '#409EFF', '#F56C6C']

    const option = {
      title: {
        text: '商品状态分布',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        bottom: '5%',
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#666'
        },
        icon: 'circle'
      },
      series: [
        {
          name: '商品状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
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
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: data,
          color: colors
        }
      ]
    }

    productStatusChart.value.setOption(option)
  } catch (error) {
    console.error('更新商品状态图表失败:', error)
  }
}

// 初始化订单状态图表
const initOrderStatusChart = () => {
  if (!orderStatusChartRef.value) return

  orderStatusChart.value = echarts.init(orderStatusChartRef.value)
  updateOrderStatusChart()
}

// 更新订单状态图表
const updateOrderStatusChart = () => {
  try {
    // 检查组件是否已被卸载
    if (!isMounted.value) {
      console.warn('组件已被卸载，取消图表更新')
      return
    }

    // 检查图表实例和DOM是否有效
    if (!orderStatusChart.value || !orderStatusChartRef.value || !document.body.contains(orderStatusChartRef.value)) {
      console.warn('订单状态图表实例或容器无效，跳过更新')
      return
    }

    // 从后端API获取的数据格式为数组，每个元素包含status和count
    const stats = statisticsStore.orderStatusStats || []

    // 状态码映射 - 从数据库status字段的注释获取正确的中文
    const statusMap = {
      1: '待付款',
      2: '待发货',
      3: '待收货',
      4: '已完成',
      5: '已取消'
    }

    // 转换数据格式
    const data = []
    stats.forEach(item => {
      // 处理状态值，确保为数字类型
      let statusValue = null;

      // 尝试从对象中提取status值
      if (item) {
        if (typeof item.status === 'number') {
          statusValue = item.status;
        } else if (typeof item.status === 'string') {
          statusValue = parseInt(item.status);
        } else if (item.status === true) {
          // 处理status为true的情况，默认设置为状态1
          statusValue = 1;
        } else if (item._custom && item._custom.value && typeof item._custom.value.status !== 'undefined') {
          // 尝试从_custom属性中获取
          const customStatus = item._custom.value.status;
          if (typeof customStatus === 'number') {
            statusValue = customStatus;
          } else if (customStatus === true) {
            statusValue = 1;
          }
        }
      }

      // 只添加有效状态的数据
      if (statusValue !== null && typeof item.count !== 'undefined') {
        const countValue = parseInt(item.count) || 0;

        // 查找是否已存在相同状态
        const existingItem = data.find(d => d.statusValue === statusValue);
        if (existingItem) {
          // 合并相同状态的数量
          existingItem.value += countValue;
        } else {
          // 添加新状态
          data.push({
            statusValue: statusValue,
            name: statusMap[statusValue] || `状态${statusValue}`,
            value: countValue
          });
        }
      }
    });

    // 检查是否所有数据都为0，如果是则不显示图表
    const hasData = data.length > 0 && data.some(item => item.value > 0)
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

    // 根据状态设置不同颜色
    const colors = ['#E6A23C', '#409EFF', '#67C23A', '#909399', '#F56C6C']

    const option = {
      title: {
        text: '订单状态分布',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        bottom: '5%',
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#666'
        },
        icon: 'circle'
      },
      series: [
        {
          name: '订单状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
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
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: data,
          color: colors
        }
      ]
    }

    orderStatusChart.value.setOption(option)
  } catch (error) {
    console.error('更新订单状态图表失败:', error)
  }
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
    const sellers = await statisticsStore.fetchActiveSellersStatistics()
    // 处理头像URL
    if (sellers && sellers.length > 0) {
      sellers.forEach(seller => {
        if (seller.avatar && !seller.avatar.startsWith('http')) {
          seller.avatar = fileStore.getFullUrl(seller.avatar)
        }
      })
    }
  } catch (error) {
    console.error('获取活跃卖家失败', error)
  }
}

// 获取活跃买家
const fetchActiveBuyers = async () => {
  try {
    const buyers = await statisticsStore.fetchActiveBuyersStatistics()
    // 处理头像URL
    if (buyers && buyers.length > 0) {
      buyers.forEach(buyer => {
        if (buyer.avatar && !buyer.avatar.startsWith('http')) {
          buyer.avatar = fileStore.getFullUrl(buyer.avatar)
        }
      })
    }
  } catch (error) {
    console.error('获取活跃买家失败', error)
  }
}

// 获取商品状态标签类型
const getStatusTagType = (status) => {
  // 处理各种可能的状态值类型
  let statusValue = null;

  if (typeof status === 'number') {
    statusValue = status;
  } else if (typeof status === 'string') {
    statusValue = parseInt(status);
  } else if (status === true) {
    // 处理status为true的情况
    statusValue = 1;
  } else if (status && typeof status === 'object' && status._custom && status._custom.value && status._custom.value.status) {
    const customStatus = status._custom.value.status;
    if (typeof customStatus === 'number') {
      statusValue = customStatus;
    } else if (customStatus === true) {
      statusValue = 1;
    }
  }

  // 根据状态值返回对应标签类型
  switch (statusValue) {
    case 1:
      return 'success'   // 在售
    case 2:
      return 'info'      // 已售
    case 3:
      return 'danger'    // 下架
    default:
      return 'info'
  }
}

// 获取商品状态文本
const getStatusText = (status) => {
  // 处理各种可能的状态值类型
  let statusValue = null;

  if (typeof status === 'number') {
    statusValue = status;
  } else if (typeof status === 'string') {
    statusValue = parseInt(status);
  } else if (status === true) {
    // 处理status为true的情况
    statusValue = 1;
  } else if (status && typeof status === 'object' && status._custom && status._custom.value && status._custom.value.status) {
    const customStatus = status._custom.value.status;
    if (typeof customStatus === 'number') {
      statusValue = customStatus;
    } else if (customStatus === true) {
      statusValue = 1;
    }
  }

  // 根据状态值返回对应中文文本
  switch (statusValue) {
    case 1:
      return '在售'
    case 2:
      return '已售'
    case 3:
      return '下架'
    default:
      return `状态${statusValue || '未知'}`
  }
}

// 图表类型变化处理
const handleChartTypeChange = (newType) => {
  try {
    // 检查组件是否已被卸载
    if (!isMounted.value) {
      console.warn('组件已被卸载，取消图表类型更新')
      return
    }

    // 检查图表实例和DOM是否存在
    if (!trendChart.value || !trendChartRef.value || !document.body.contains(trendChartRef.value)) {
      console.warn('趋势图表实例或容器无效，跳过更新类型')
      return
    }

    console.log('图表类型变化:', newType)
    // 安全更新图表
    nextTick(() => {
      if (isMounted.value && trendChart.value && document.body.contains(trendChartRef.value)) {
        updateTrendChart()
      }
    })
  } catch (err) {
    console.error('切换图表类型时出错:', err)
  }
}

// 监听图表类型变化
watch(chartType, () => {
  // 不做任何操作，使用handleChartTypeChange代替
}, {immediate: false})

// 处理窗口大小变化
const handleResize = () => {
  try {
    // 检查组件是否已被卸载
    if (!isMounted.value) {
      console.warn('组件已被卸载，取消窗口大小变化处理')
      return
    }

    // 使用防抖动技术，避免频繁刷新
    if (resizeTimeout) clearTimeout(resizeTimeout)

    resizeTimeout = setTimeout(() => {
      // 检查组件是否仍然挂载
      if (!isMounted.value) {
        return
      }

      // 检查图表实例和DOM是否存在并且有效
      if (trendChart.value && trendChartRef.value && document.body.contains(trendChartRef.value)) {
        try {
          trendChart.value.resize()
        } catch (err) {
          console.error('调整趋势图表大小失败:', err)
        }
      }

      if (productStatusChart.value && productStatusChartRef.value && document.body.contains(productStatusChartRef.value)) {
        try {
          productStatusChart.value.resize()
        } catch (err) {
          console.error('调整商品状态图表大小失败:', err)
        }
      }

      if (orderStatusChart.value && orderStatusChartRef.value && document.body.contains(orderStatusChartRef.value)) {
        try {
          orderStatusChart.value.resize()
        } catch (err) {
          console.error('调整订单状态图表大小失败:', err)
        }
      }
    }, 300)
  } catch (error) {
    console.error('调整图表大小时出错:', error)
  }
}

// 用于防抖动的超时变量
let resizeTimeout = null
// 图表初始化的定时器
let chartInitTimer = null

// 使用延迟初始化图表的函数
const initChartsWithDelay = () => {
  try {
    // 检查组件是否已经被卸载
    if (!isMounted.value) {
      console.warn('组件已被卸载，取消图表初始化')
      return
    }

    // 检查组件是否已经被卸载或引用已失效
    if (!trendChartRef.value || !productStatusChartRef.value || !orderStatusChartRef.value ||
        !document.body.contains(trendChartRef.value) ||
        !document.body.contains(productStatusChartRef.value) ||
        !document.body.contains(orderStatusChartRef.value)) {
      console.warn('组件已从DOM中移除或引用失效，取消图表初始化')
      return
    }

    // 检查DOM容器是否有有效尺寸
    if (trendChartRef.value.offsetWidth <= 0 || trendChartRef.value.offsetHeight <= 0 ||
        productStatusChartRef.value.offsetWidth <= 0 || productStatusChartRef.value.offsetHeight <= 0 ||
        orderStatusChartRef.value.offsetWidth <= 0 || orderStatusChartRef.value.offsetHeight <= 0) {
      console.warn('图表容器尺寸无效，500ms后重试...')
      setTimeout(() => {
        // 再次检查是否已卸载
        if (isMounted.value && trendChartRef.value && document.body.contains(trendChartRef.value)) {
          initChartsWithDelay()
        } else {
          console.warn('组件已从DOM中移除，取消图表初始化重试')
        }
      }, 500)
      return
    }

    // 确保统计数据已经加载
    if (!statisticsStore.userRegisterStats || !statisticsStore.productStatusStats) {
      console.warn('等待图表数据加载...500ms后重试')
      setTimeout(() => {
        // 再次检查是否已卸载
        if (isMounted.value && trendChartRef.value && document.body.contains(trendChartRef.value)) {
          initChartsWithDelay()
        } else {
          console.warn('组件已从DOM中移除，取消图表初始化重试')
        }
      }, 500)
      return
    }

    // 安全地初始化图表
    try {
      // 销毁可能存在的实例
      if (trendChart.value) {
        trendChart.value.dispose()
        trendChart.value = null
      }
      if (productStatusChart.value) {
        productStatusChart.value.dispose()
        productStatusChart.value = null
      }
      if (orderStatusChart.value) {
        orderStatusChart.value.dispose()
        orderStatusChart.value = null
      }

      // 再次检查DOM引用是否有效
      if (!trendChartRef.value || !document.body.contains(trendChartRef.value)) {
        console.warn('趋势图表容器已不在DOM中，跳过初始化')
      } else {
        try {
          console.log('初始化趋势图表, 容器尺寸:', trendChartRef.value.offsetWidth, trendChartRef.value.offsetHeight)
          trendChart.value = echarts.init(trendChartRef.value, null, {renderer: 'canvas'})
          trendChartLoaded.value = true
          updateTrendChart() // 立即更新趋势图表
        } catch (err) {
          console.error('初始化趋势图表失败:', err)
        }
      }

      if (!productStatusChartRef.value || !document.body.contains(productStatusChartRef.value)) {
        console.warn('商品状态图表容器已不在DOM中，跳过初始化')
      } else {
        try {
          console.log('初始化商品状态图表, 容器尺寸:', productStatusChartRef.value.offsetWidth, productStatusChartRef.value.offsetHeight)
          productStatusChart.value = echarts.init(productStatusChartRef.value, null, {renderer: 'canvas'})
          productStatusChartLoaded.value = true
          updateProductStatusChart() // 立即更新商品状态图表
        } catch (err) {
          console.error('初始化商品状态图表失败:', err)
        }
      }

      if (!orderStatusChartRef.value || !document.body.contains(orderStatusChartRef.value)) {
        console.warn('订单状态图表容器已不在DOM中，跳过初始化')
      } else {
        try {
          console.log('初始化订单状态图表, 容器尺寸:', orderStatusChartRef.value.offsetWidth, orderStatusChartRef.value.offsetHeight)
          orderStatusChart.value = echarts.init(orderStatusChartRef.value, null, {renderer: 'canvas'})
          orderStatusChartLoaded.value = true
          updateOrderStatusChart() // 立即更新订单状态图表
        } catch (err) {
          console.error('初始化订单状态图表失败:', err)
        }
      }
    } catch (err) {
      console.error('图表初始化过程中出错:', err)
    }

    // 完成所有初始化后关闭加载状态
    chartsLoading.value = false
  } catch (err) {
    console.error('图表初始化过程中出错:', err)
    chartsLoading.value = false
  }
}

// 组件挂载后获取数据并初始化图表
onMounted(async () => {
  loading.value = true
  error.value = false
  errorMessage.value = ''
  isMounted.value = true

  try {
    // 设置管理员角色
    statisticsStore.setAdminRole(true)

    // 尝试使用单独的API调用
    try {
      // 先获取基础统计数据
      await statisticsStore.fetchBasicStatistics()

      // 获取今日统计数据
      await statisticsStore.fetchTodayStatistics()

      // 然后获取详细统计数据
      await Promise.all([
        statisticsStore.fetchUserRegisterStatistics({
          startDate: statisticsStore.getPast30Days().startDate,
          endDate: statisticsStore.getPast30Days().endDate,
          timeGranularity: 'day'
        }),
        statisticsStore.fetchOrderStatistics({
          startDate: statisticsStore.getPast30Days().startDate,
          endDate: statisticsStore.getPast30Days().endDate,
          timeGranularity: 'day'
        }),
        statisticsStore.fetchTransactionStatistics({
          startDate: statisticsStore.getPast30Days().startDate,
          endDate: statisticsStore.getPast30Days().endDate,
          timeGranularity: 'day'
        }),
        statisticsStore.fetchProductStatusStatistics(),
        statisticsStore.fetchOrderStatusStatistics(),
        statisticsStore.fetchActiveSellersStatistics(),
        statisticsStore.fetchActiveBuyersStatistics(),
        statisticsStore.fetchHotProductsStatistics()
      ])
    } catch (error) {
      console.warn('单独API调用失败，尝试使用initDashboardData函数:', error)
      // 如果单独调用失败，使用集成的初始化函数
      await statisticsStore.initDashboardData()
    }

    // 先取消主加载状态
    loading.value = false

    // 设置图表加载状态
    chartsLoading.value = true

    // 等待DOM完全渲染后再初始化图表
    // 使用更长的延迟确保DOM完全稳定
    chartInitTimer = setTimeout(() => {
      // 检查组件是否已被卸载
      if (isMounted.value) {
        initChartsWithDelay()
      }
    }, 1600)

    // 添加窗口调整大小事件监听器
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('初始化管理面板时出错:', error)
    loading.value = false
    error.value = true
    errorMessage.value = `初始化管理面板失败: ${error.message || '未知错误'}`
    ElMessage.error(`管理面板数据加载失败: ${error.message || '未知错误'}`)
  }
})

// 组件卸载前清理资源
onUnmounted(() => {
  // 标记组件已卸载
  isMounted.value = false

  // 移除窗口调整大小事件监听器
  window.removeEventListener('resize', handleResize)

  // 清除所有定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  if (chartInitTimer) {
    clearTimeout(chartInitTimer)
    chartInitTimer = null
  }

  // 销毁所有图表实例，避免内存泄漏
  try {
    if (trendChart.value) {
      trendChart.value.dispose()
      trendChart.value = null
    }
    if (productStatusChart.value) {
      productStatusChart.value.dispose()
      productStatusChart.value = null
    }
    if (orderStatusChart.value) {
      orderStatusChart.value.dispose()
      orderStatusChart.value = null
    }
  } catch (error) {
    console.error('清理图表实例时出错:', error)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.el-row {
  margin-bottom: 20px;
}

.data-card {
  height: 140px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  background: linear-gradient(to right bottom, #fff, #fcfcfc);
  position: relative;
  overflow: hidden;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.data-card::after {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.03), transparent);
  border-radius: 50%;
  right: -20px;
  bottom: -20px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.data-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.data-title .icon {
  margin-right: 8px;
  font-size: 22px;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  padding: 6px;
}

.data-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-top: 10px;
}

.user-card .icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.user-card .data-value {
  color: #409EFF;
}

.product-card .icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.product-card .data-value {
  color: #67C23A;
}

.order-card .icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.order-card .data-value {
  color: #E6A23C;
}

.sales-card .icon {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.sales-card .data-value {
}

.list-row {
  margin-top: 20px;
}

.list-card {
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.list-card .el-card__header {
  padding: 12px 15px;
  border-bottom: 1px solid #ebeef5;
}

.list-card .el-card__body {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.list-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.list-title .icon {
  margin-right: 8px;
  font-size: 22px;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  padding: 6px;
}

.rank-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  background-color: #f0f2f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #e6c200);
  color: #fff;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(230, 194, 0, 0.5);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
  color: #fff;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(169, 169, 169, 0.5);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #b36a1d);
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(179, 106, 29, 0.5);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info .el-avatar {
  margin-right: 8px;
}

.user-info .user-nickname {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-title-cell {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: #303133;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.stat-tag {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.table-container {
  height: 560px;
  padding: 0;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-container .el-table {
  flex: 1;
  height: 100%;
}

/* 自定义滚动条样式 */
.el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 4px;
}

.el-table__body-wrapper::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: #f0f7ff;
}

.table-container {
  height: auto;
  min-height: 520px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 350px;
  position: relative;
}

.chart-loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

/* 确保图表容器在DOM渲染完成前有确定的尺寸 */
.trend-chart-container,
.product-status-chart-container,
.order-status-chart-container {
  min-height: 350px;
  min-width: 100%;
  visibility: visible !important;
  opacity: 1 !important;
}

.loading-icon {
  font-size: 30px;
  color: #409EFF;
  animation: rotating 2s linear infinite;
  margin-bottom: 10px;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  overflow: visible;
  height: 400px;
}

.chart-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
}

.chart-container {
  height: 350px;
  width: 100%;
  padding: 20px;
  min-height: 350px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #fff;
  display: block;
}

.chart-card .el-card__header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.chart-card .el-card__body {
  padding: 0;
  height: calc(100% - 50px);
}

.chart-card-body {
  position: relative;
  height: 100%;
}

.dashboard-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dashboard-loading .loading-icon {
  font-size: 48px;
  color: #409EFF;
  animation: spin 1.5s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 