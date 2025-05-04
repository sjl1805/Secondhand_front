import {ref} from 'vue'
import {defineStore} from 'pinia'
import {addFavorite, cancelFavorite, checkFavorite, getFavoriteCount, getFavoriteList} from '@/api/favorite'
import {ElMessage} from 'element-plus'

export const useFavoriteStore = defineStore('favorite', () => {
    // 状态
    const favoriteList = ref([])
    const loading = ref(false)
    const pagination = ref({
        current: 1,
        size: 10,
        total: 0
    })

    // 收藏状态缓存，避免频繁请求
    // 格式：{ productId: boolean }
    const favoriteStatus = ref({})

    // 收藏数量缓存
    // 格式：{ productId: number }
    const favoriteCountMap = ref({})

    // 收藏商品
    const addToFavorite = async (productId) => {
        try {
            const res = await addFavorite(productId)
            if (res.code === 200) {
                // 更新缓存
                favoriteStatus.value[productId] = true

                // 更新收藏数量
                if (favoriteCountMap.value[productId] !== undefined) {
                    favoriteCountMap.value[productId]++
                }

                ElMessage.success('收藏成功')
                return res.data
            }
        } catch (error) {
            console.error('收藏失败', error)
            ElMessage.error(error.message || '收藏失败')
        }
    }

    // 取消收藏
    const removeFromFavorite = async (productId) => {
        try {
            const res = await cancelFavorite(productId)
            if (res.code === 200) {
                // 更新缓存
                favoriteStatus.value[productId] = false

                // 从列表中移除
                favoriteList.value = favoriteList.value.filter(item => item.id !== productId)

                // 更新收藏数量
                if (favoriteCountMap.value[productId] !== undefined && favoriteCountMap.value[productId] > 0) {
                    favoriteCountMap.value[productId]--
                }

                ElMessage.success('已取消收藏')
                return true
            }
        } catch (error) {
            console.error('取消收藏失败', error)
            ElMessage.error(error.message || '取消收藏失败')
            return false
        }
    }

    // 检查是否已收藏
    const checkIsFavorite = async (productId) => {
        // 如果缓存中有，直接使用缓存
        if (favoriteStatus.value[productId] !== undefined) {
            return favoriteStatus.value[productId]
        }

        try {
            const res = await checkFavorite(productId)
            if (res.code === 200) {
                // 更新缓存
                favoriteStatus.value[productId] = res.data
                return res.data
            }
            return false
        } catch (error) {
            console.error('检查收藏状态失败', error)
            return false
        }
    }

    // 获取收藏列表
    const fetchFavoriteList = async (params = {}) => {
        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: pagination.value.current,
                size: pagination.value.size,
                ...params
            }

            const res = await getFavoriteList(queryParams)
            if (res.code === 200) {
                // 直接使用返回的数据作为收藏列表
                favoriteList.value = res.data.records || []
                pagination.value = {
                    current: res.data.current,
                    size: res.data.size,
                    total: res.data.total
                }

                // 更新缓存
                favoriteList.value.forEach(item => {
                    favoriteStatus.value[item.id] = true
                })

                return res.data
            }
        } catch (error) {
            console.error('获取收藏列表失败', error)
            ElMessage.error('获取收藏列表失败')
        } finally {
            loading.value = false
        }
    }

    // 获取商品收藏数量
    const fetchFavoriteCount = async (productId) => {
        // 如果缓存中有，直接使用缓存
        if (favoriteCountMap.value[productId] !== undefined) {
            return favoriteCountMap.value[productId]
        }

        try {
            const res = await getFavoriteCount(productId)
            if (res.code === 200) {
                // 更新缓存
                favoriteCountMap.value[productId] = res.data
                return res.data
            }
            return 0
        } catch (error) {
            console.error('获取收藏数量失败', error)
            return 0
        }
    }

    // 切换收藏状态
    const toggleFavorite = async (productId) => {
        const isFavorite = await checkIsFavorite(productId)
        if (isFavorite) {
            return await removeFromFavorite(productId)
        } else {
            return await addToFavorite(productId)
        }
    }

    // 切换页码
    const changePage = (page) => {
        pagination.value.current = page
        fetchFavoriteList()
    }

    // 切换每页数量
    const changePageSize = (size) => {
        pagination.value.size = size
        pagination.value.current = 1 // 重置到第一页
        fetchFavoriteList()
    }

    // 清除缓存
    const clearCache = () => {
        favoriteStatus.value = {}
        favoriteCountMap.value = {}
    }

    // 重置状态
    const resetState = () => {
        favoriteList.value = []
        pagination.value = {
            current: 1,
            size: 10,
            total: 0
        }
        clearCache()
    }

    return {
        favoriteList,
        loading,
        pagination,
        favoriteStatus,
        favoriteCountMap,
        addToFavorite,
        removeFromFavorite,
        checkIsFavorite,
        fetchFavoriteList,
        fetchFavoriteCount,
        toggleFavorite,
        changePage,
        changePageSize,
        clearCache,
        resetState
    }
}) 