import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import {
    addComment,
    deleteComment,
    getCommentDetail,
    getProductComments,
    getProductRating,
    getUserComments,
    isOrderCommented
} from '@/api/comment'
import {ElMessage} from 'element-plus'

export const useCommentStore = defineStore('comment', () => {
    // 状态
    const commentDetail = ref(null)
    const productComments = ref([])
    const userComments = ref([])
    const productRating = ref(0)
    const loading = ref(false)
    const pagination = ref({
        current: 1,
        size: 10,
        total: 0
    })

    // 添加评论
    const submitComment = async (commentData) => {
        loading.value = true
        try {
            const res = await addComment(commentData)
            if (res.code === 200) {
                ElMessage.success('评论提交成功')
                return res.data
            }
        } catch (error) {
            console.error('评论提交失败', error)
            ElMessage.error(error.message || '评论提交失败')
        } finally {
            loading.value = false
        }
    }

    // 获取评论详情
    const fetchCommentDetail = async (commentId) => {
        loading.value = true
        try {
            const res = await getCommentDetail(commentId)
            if (res.code === 200) {
                commentDetail.value = res.data
                return res.data
            }
        } catch (error) {
            console.error('获取评论详情失败', error)
            ElMessage.error('获取评论详情失败')
        } finally {
            loading.value = false
        }
    }

    // 获取商品评论列表
    const fetchProductComments = async (productId, params = {}) => {
        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: pagination.value.current,
                size: pagination.value.size,
                ...params
            }

            const res = await getProductComments(productId, queryParams)
            if (res.code === 200) {
                productComments.value = res.data.records || []
                pagination.value = {
                    current: res.data.current,
                    size: res.data.size,
                    total: res.data.total
                }
                return res.data
            }
        } catch (error) {
            console.error('获取商品评论列表失败', error)
            ElMessage.error('获取商品评论列表失败')
        } finally {
            loading.value = false
        }
    }

    // 获取用户评论列表
    const fetchUserComments = async (userId, params = {}) => {
        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: pagination.value.current,
                size: pagination.value.size,
                ...params
            }

            const res = await getUserComments(userId, queryParams)
            if (res.code === 200) {
                userComments.value = res.data.records || []
                pagination.value = {
                    current: res.data.current,
                    size: res.data.size,
                    total: res.data.total
                }
                return res.data
            }
        } catch (error) {
            console.error('获取用户评论列表失败', error)
            ElMessage.error('获取用户评论列表失败')
        } finally {
            loading.value = false
        }
    }

    // 删除评论
    const removeComment = async (commentId) => {
        try {
            const res = await deleteComment(commentId)
            if (res.code === 200) {
                // 从列表中删除该评论
                productComments.value = productComments.value.filter(item => item.id !== commentId)
                userComments.value = userComments.value.filter(item => item.id !== commentId)

                ElMessage.success('评论删除成功')
                return true
            }
        } catch (error) {
            console.error('删除评论失败', error)
            ElMessage.error(error.message || '删除评论失败')
            return false
        }
    }

    // 获取商品评分
    const fetchProductRating = async (productId) => {
        try {
            const res = await getProductRating(productId)
            if (res.code === 200) {
                productRating.value = res.data || 0
                return res.data
            }
        } catch (error) {
            console.error('获取商品评分失败', error)
            // 这里不显示错误信息，避免影响用户体验
            return 0
        }
    }

    // 检查订单是否已评论
    const checkOrderCommented = async (orderId) => {
        try {
            const res = await isOrderCommented(orderId)
            if (res.code === 200) {
                return res.data
            }
            return false
        } catch (error) {
            console.error('检查订单评论状态失败', error)
            return false
        }
    }

    // 切换页码
    const changePage = (page, currentProductId, currentUserId) => {
        pagination.value.current = page

        // 根据当前查询的是商品评论还是用户评论来重新加载数据
        if (currentProductId) {
            fetchProductComments(currentProductId)
        } else if (currentUserId) {
            fetchUserComments(currentUserId)
        }
    }

    // 切换每页数量
    const changePageSize = (size, currentProductId, currentUserId) => {
        pagination.value.size = size
        pagination.value.current = 1 // 重置到第一页

        // 根据当前查询的是商品评论还是用户评论来重新加载数据
        if (currentProductId) {
            fetchProductComments(currentProductId)
        } else if (currentUserId) {
            fetchUserComments(currentUserId)
        }
    }

    // 计算属性：商品评分文本（将数字评分转为文字描述）
    const ratingText = computed(() => {
        const rating = productRating.value
        if (rating >= 4.5) return '非常好'
        if (rating >= 4) return '很好'
        if (rating >= 3.5) return '较好'
        if (rating >= 3) return '一般'
        if (rating >= 2) return '较差'
        return '很差'
    })

    // 计算属性：评分星级样式（用于显示星级）
    const ratingStars = computed(() => {
        const rating = productRating.value
        const fullStars = Math.floor(rating)
        const halfStar = rating - fullStars >= 0.5 ? 1 : 0
        const emptyStars = 5 - fullStars - halfStar

        return {
            full: fullStars,
            half: halfStar,
            empty: emptyStars
        }
    })

    // 重置状态
    const resetState = () => {
        commentDetail.value = null
        productComments.value = []
        userComments.value = []
        productRating.value = 0
        pagination.value = {
            current: 1,
            size: 10,
            total: 0
        }
    }

    return {
        commentDetail,
        productComments,
        userComments,
        productRating,
        loading,
        pagination,
        ratingText,
        ratingStars,
        submitComment,
        fetchCommentDetail,
        fetchProductComments,
        fetchUserComments,
        removeComment,
        fetchProductRating,
        checkOrderCommented,
        changePage,
        changePageSize,
        resetState
    }
}) 