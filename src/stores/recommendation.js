import {ref} from 'vue'
import {defineStore} from 'pinia'
import {getItemBasedRecommendations, getUserBasedRecommendations, refreshRecommendations} from '@/api/recommendation'
import {ElMessage} from 'element-plus'

export const useRecommendationStore = defineStore('recommendation', () => {
    // 状态
    const userBasedProducts = ref([])
    const itemBasedProducts = ref([])
    const loading = ref(false)
    const refreshing = ref(false)

    // 获取基于用户的推荐商品
    const fetchUserBasedRecommendations = async (limit = 10) => {
        loading.value = true
        try {
            const res = await getUserBasedRecommendations(limit)
            if (res.code === 200) {
                userBasedProducts.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取用户推荐失败', error)
            ElMessage.error('获取用户推荐失败')
        } finally {
            loading.value = false
        }
    }

    // 获取基于商品的推荐商品
    const fetchItemBasedRecommendations = async (limit = 10) => {
        loading.value = true
        try {
            const res = await getItemBasedRecommendations(limit)
            if (res.code === 200) {
                itemBasedProducts.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取商品推荐失败', error)
            ElMessage.error('获取商品推荐失败')
        } finally {
            loading.value = false
        }
    }

    // 刷新推荐
    const refreshUserRecommendations = async () => {
        refreshing.value = true
        try {
            const res = await refreshRecommendations()
            if (res.code === 200) {
                ElMessage.success('推荐已刷新')
                // 刷新后重新获取推荐
                await Promise.all([
                    fetchUserBasedRecommendations(),
                    fetchItemBasedRecommendations()
                ])
                return res.data
            }
        } catch (error) {
            console.error('刷新推荐失败', error)
            ElMessage.error('刷新推荐失败')
        } finally {
            refreshing.value = false
        }
    }

    // 重置状态
    const resetState = () => {
        userBasedProducts.value = []
        itemBasedProducts.value = []
    }

    return {
        userBasedProducts,
        itemBasedProducts,
        loading,
        refreshing,
        fetchUserBasedRecommendations,
        fetchItemBasedRecommendations,
        refreshUserRecommendations,
        resetState
    }
}) 