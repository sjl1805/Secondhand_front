import {reactive, ref} from 'vue'
import {defineStore} from 'pinia'
import {
    getActiveBuyersStatistics,
    getActiveSellersStatistics,
    getBasicStatistics,
    getHotProductsStatistics,
    getOrderStatistics,
    getOrderStatusStatistics,
    getProductStatusStatistics,
    getTodayStatistics,
    getTransactionStatistics,
    getUserActivityStatistics,
    getUserRegisterStatistics
} from '@/api/statistics'
import {useFileStore} from '@/stores/file'
import {ElMessage} from 'element-plus'

export const useStatisticsStore = defineStore('statistics', () => {
    // 状态
    const loading = ref(false)
    const isAdmin = ref(false)

    // 文件处理
    const fileStore = useFileStore()

    // 基本统计数据
    const basicStats = reactive({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalTransaction: 0,
        todayNewUsers: 0,
        todayNewProducts: 0,
        todayNewOrders: 0,
        todayTransaction: 0
    })

    // 时间单位选项
    const timeUnitOptions = [
        {value: 'day', label: '按天'},
        {value: 'week', label: '按周'},
        {value: 'month', label: '按月'}
    ]

    // 用户注册统计
    const userRegisterStats = ref([])

    // 订单统计
    const orderStats = ref([])

    // 交易额统计
    const transactionStats = ref([])

    // 用户活跃度统计
    const userActivityStats = ref([])

    // 商品状态统计
    const productStatusStats = ref([])

    // 订单状态统计
    const orderStatusStats = ref([])

    // 热门商品统计
    const hotProductsStats = ref([])

    // 活跃卖家统计
    const activeSellersStats = ref([])

    // 活跃买家统计
    const activeBuyersStats = ref([])

    // 设置管理员权限
    const setAdminRole = (isAdminRole) => {
        isAdmin.value = isAdminRole
    }

    // 获取仪表盘概览统计数据
    const fetchBasicStatistics = async () => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getBasicStatistics()
            if (res.code === 200 && res.data) {
                // 更新基本统计数据
                Object.assign(basicStats, res.data)
                return res.data
            }
        } catch (error) {
            console.error('获取仪表盘概览数据失败', error)
            ElMessage.error('获取仪表盘概览数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取今日数据统计
    const fetchTodayStatistics = async () => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getTodayStatistics()
            if (res.code === 200 && res.data) {
                // 更新今日统计数据
                basicStats.todayNewUsers = res.data.todayNewUsers || 0
                basicStats.todayNewProducts = res.data.todayNewProducts || 0
                basicStats.todayNewOrders = res.data.todayNewOrders || 0
                basicStats.todayTransaction = res.data.todayTransaction || 0
                return res.data
            }
        } catch (error) {
            console.error('获取今日数据统计失败', error)
            ElMessage.error('获取今日数据统计失败')
        } finally {
            loading.value = false
        }
    }

    // 获取用户注册统计数据
    const fetchUserRegisterStatistics = async (params) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getUserRegisterStatistics(params)
            if (res.code === 200) {
                userRegisterStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取用户注册统计数据失败', error)
            ElMessage.error('获取用户注册统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取订单统计数据
    const fetchOrderStatistics = async (params) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getOrderStatistics(params)
            if (res.code === 200) {
                orderStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取订单统计数据失败', error)
            ElMessage.error('获取订单统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取交易额统计数据
    const fetchTransactionStatistics = async (params) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getTransactionStatistics(params)
            if (res.code === 200) {
                transactionStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取交易额统计数据失败', error)
            ElMessage.error('获取交易额统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取用户活跃度统计数据
    const fetchUserActivityStatistics = async (params) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getUserActivityStatistics(params)
            if (res.code === 200) {
                userActivityStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取用户活跃度统计数据失败', error)
            ElMessage.error('获取用户活跃度统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取商品状态统计数据
    const fetchProductStatusStatistics = async () => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getProductStatusStatistics()
            if (res.code === 200) {
                productStatusStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取商品状态统计数据失败', error)
            ElMessage.error('获取商品状态统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取订单状态统计数据
    const fetchOrderStatusStatistics = async () => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getOrderStatusStatistics()
            if (res.code === 200) {
                orderStatusStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取订单状态统计数据失败', error)
            ElMessage.error('获取订单状态统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取热门商品统计数据
    const fetchHotProductsStatistics = async (params = {limit: 10}) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getHotProductsStatistics(params)
            if (res.code === 200) {
                hotProductsStats.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取热门商品统计数据失败', error)
            ElMessage.error('获取热门商品统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取活跃卖家统计数据
    const fetchActiveSellersStatistics = async (params = {limit: 10}) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getActiveSellersStatistics(params)
            if (res.code === 200) {
                // 处理头像URL
                const data = res.data || []
                data.forEach(seller => {
                    if (seller.avatar && !seller.avatar.startsWith('http')) {
                        seller.avatar = fileStore.getFullUrl(seller.avatar)
                    }
                })

                activeSellersStats.value = data
                return data
            }
        } catch (error) {
            console.error('获取活跃卖家统计数据失败', error)
            ElMessage.error('获取活跃卖家统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取活跃买家统计数据
    const fetchActiveBuyersStatistics = async (params = {limit: 10}) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getActiveBuyersStatistics(params)
            if (res.code === 200) {
                // 处理头像URL
                const data = res.data || []
                data.forEach(buyer => {
                    if (buyer.avatar && !buyer.avatar.startsWith('http')) {
                        buyer.avatar = fileStore.getFullUrl(buyer.avatar)
                    }
                })

                activeBuyersStats.value = data
                return data
            }
        } catch (error) {
            console.error('获取活跃买家统计数据失败', error)
            ElMessage.error('获取活跃买家统计数据失败')
        } finally {
            loading.value = false
        }
    }

    // 获取当前日期
    const getCurrentDate = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // 获取前30天的日期
    const getPast30Days = () => {
        // 创建今天的日期对象
        const today = new Date()

        // 创建结束日期为明天（今天+1天），确保包含今天的完整数据
        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() + 1)

        // 创建开始日期为31天前（这样能包含30天的数据区间）
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 30)

        const formatDate = (date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        return {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
        }
    }

    // 初始化统计数据（仪表盘用）
    const initDashboardData = async () => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        try {
            // 获取基本统计数据
            await fetchBasicStatistics()

            // 获取今日统计数据
            await fetchTodayStatistics()

            // 获取最近30天数据
            const dateRange = getPast30Days()
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                timeGranularity: 'day'
            }

            // 分别获取各种统计数据，避免一个失败导致所有失败
            try {
                await fetchUserRegisterStatistics(params)
            } catch (error) {
                console.error('获取用户注册统计失败', error)
            }

            try {
                await fetchOrderStatistics(params)
            } catch (error) {
                console.error('获取订单统计失败', error)
            }

            try {
                await fetchTransactionStatistics(params)
            } catch (error) {
                console.error('获取交易额统计失败', error)
            }

            try {
                await fetchUserActivityStatistics(params)
            } catch (error) {
                console.error('获取用户活跃度统计失败', error)
            }

            try {
                await fetchProductStatusStatistics()
            } catch (error) {
                console.error('获取商品状态统计失败', error)
            }

            try {
                await fetchOrderStatusStatistics()
            } catch (error) {
                console.error('获取订单状态统计失败', error)
            }

            try {
                await fetchHotProductsStatistics()
            } catch (error) {
                console.error('获取热门商品统计失败', error)
            }

            try {
                await fetchActiveSellersStatistics()
            } catch (error) {
                console.error('获取活跃卖家统计失败', error)
            }

            try {
                await fetchActiveBuyersStatistics()
            } catch (error) {
                console.error('获取活跃买家统计失败', error)
            }

            return true
        } catch (error) {
            console.error('初始化仪表盘数据失败', error)
            ElMessage.error('初始化仪表盘数据失败')
            return false
        }
    }

    return {
        loading,
        isAdmin,
        basicStats,
        timeUnitOptions,
        userRegisterStats,
        orderStats,
        transactionStats,
        userActivityStats,
        productStatusStats,
        orderStatusStats,
        hotProductsStats,
        activeSellersStats,
        activeBuyersStats,
        setAdminRole,
        fetchBasicStatistics,
        fetchTodayStatistics,
        fetchUserRegisterStatistics,
        fetchOrderStatistics,
        fetchTransactionStatistics,
        fetchUserActivityStatistics,
        fetchProductStatusStatistics,
        fetchOrderStatusStatistics,
        fetchHotProductsStatistics,
        fetchActiveSellersStatistics,
        fetchActiveBuyersStatistics,
        getCurrentDate,
        getPast30Days,
        initDashboardData
    }
}) 