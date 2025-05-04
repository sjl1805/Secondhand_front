import {ref} from 'vue'
import {defineStore} from 'pinia'
import {
    getNotificationDetail,
    getNotificationList,
    getUnreadCount,
    getUnreadNotifications,
    markAllAsRead,
    markAsRead
} from '@/api/notification'
import {ElMessage} from 'element-plus'

export const useNotificationStore = defineStore('notification', () => {
    // 状态
    const notifications = ref([])
    const unreadNotifications = ref([])
    const currentNotification = ref(null)
    const loading = ref(false)
    const unreadCount = ref(0)
    const pagination = ref({
        current: 1,
        size: 10,
        total: 0
    })
    const unreadPagination = ref({
        current: 1,
        size: 10,
        total: 0
    })

    // 获取所有通知列表
    const fetchNotificationList = async (params = {}) => {
        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: pagination.value.current,
                size: pagination.value.size,
                ...params
            }

            const res = await getNotificationList(queryParams)
            if (res.code === 200) {
                notifications.value = res.data.records || []
                pagination.value = {
                    current: res.data.current,
                    size: res.data.size,
                    total: res.data.total
                }
                return res.data
            }
        } catch (error) {
            console.error('获取通知列表失败', error)
            ElMessage.error('获取通知列表失败')
        } finally {
            loading.value = false
        }
    }

    // 获取未读通知列表
    const fetchUnreadNotifications = async (params = {}) => {
        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: unreadPagination.value.current,
                size: unreadPagination.value.size,
                ...params
            }

            const res = await getUnreadNotifications(queryParams)
            if (res.code === 200) {
                unreadNotifications.value = res.data.records || []
                unreadPagination.value = {
                    current: res.data.current,
                    size: res.data.size,
                    total: res.data.total
                }
                return res.data
            }
        } catch (error) {
            console.error('获取未读通知失败', error)
            ElMessage.error('获取未读通知失败')
        } finally {
            loading.value = false
        }
    }

    // 获取通知详情
    const fetchNotificationDetail = async (notificationId) => {
        loading.value = true
        try {
            const res = await getNotificationDetail(notificationId)
            if (res.code === 200) {
                currentNotification.value = res.data
                return res.data
            }
        } catch (error) {
            console.error('获取通知详情失败', error)
            ElMessage.error('获取通知详情失败')
        } finally {
            loading.value = false
        }
    }

    // 标记通知为已读
    const readNotification = async (notificationId) => {
        try {
            const res = await markAsRead(notificationId)
            if (res.code === 200) {
                // 更新当前通知状态
                if (currentNotification.value && currentNotification.value.id === notificationId) {
                    currentNotification.value.isRead = 1
                }

                // 更新通知列表中的状态
                updateNotificationReadStatus(notificationId)

                // 更新未读计数
                await fetchUnreadNotificationCount()

                ElMessage.success('已标记为已读')
                return true
            }
        } catch (error) {
            console.error('标记已读失败', error)
            ElMessage.error('标记已读失败')
            return false
        }
    }

    // 标记全部为已读
    const readAllNotifications = async () => {
        try {
            const res = await markAllAsRead()
            if (res.code === 200) {
                // 更新所有通知状态
                notifications.value.forEach(notification => {
                    notification.isRead = 1
                })

                // 清空未读通知
                unreadNotifications.value = []
                unreadCount.value = 0

                ElMessage.success(`已将 ${res.data || 0} 条通知标记为已读`)
                return res.data
            }
        } catch (error) {
            console.error('标记全部已读失败', error)
            ElMessage.error('标记全部已读失败')
            return 0
        }
    }

    // 获取未读通知数量
    const fetchUnreadNotificationCount = async () => {
        try {
            const res = await getUnreadCount()
            if (res.code === 200) {
                unreadCount.value = res.data || 0
                return res.data
            }
        } catch (error) {
            console.error('获取未读数量失败', error)
            return 0
        }
    }

    // 辅助方法：更新通知的已读状态
    const updateNotificationReadStatus = (notificationId) => {
        // 更新通知列表
        const index = notifications.value.findIndex(item => item.id === notificationId)
        if (index !== -1) {
            notifications.value[index].isRead = 1
        }

        // 从未读列表中移除
        unreadNotifications.value = unreadNotifications.value.filter(item => item.id !== notificationId)

        // 更新未读计数
        if (unreadCount.value > 0) {
            unreadCount.value--
        }
    }

    // 切换通知列表页码
    const changeNotificationPage = (page) => {
        pagination.value.current = page
        fetchNotificationList()
    }

    // 切换未读通知列表页码
    const changeUnreadPage = (page) => {
        unreadPagination.value.current = page
        fetchUnreadNotifications()
    }

    // 重置状态
    const resetState = () => {
        notifications.value = []
        unreadNotifications.value = []
        currentNotification.value = null
        unreadCount.value = 0
        pagination.value = {
            current: 1,
            size: 10,
            total: 0
        }
        unreadPagination.value = {
            current: 1,
            size: 10,
            total: 0
        }
    }

    return {
        notifications,
        unreadNotifications,
        currentNotification,
        loading,
        unreadCount,
        pagination,
        unreadPagination,
        fetchNotificationList,
        fetchUnreadNotifications,
        fetchNotificationDetail,
        readNotification,
        readAllNotifications,
        fetchUnreadNotificationCount,
        changeNotificationPage,
        changeUnreadPage,
        resetState
    }
}) 