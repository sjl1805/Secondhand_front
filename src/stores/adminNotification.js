import {ref} from 'vue'
import {defineStore} from 'pinia'
import {
    batchDeleteAdminNotifications,
    broadcastNotification,
    deleteAdminNotification,
    getAdminNotificationDetail,
    getAdminNotificationList,
    sendNotification
} from '@/api/adminNotification'
import {ElMessage} from 'element-plus'

export const useAdminNotificationStore = defineStore('adminNotification', () => {
    // 状态
    const notifications = ref([])
    const currentNotification = ref(null)
    const loading = ref(false)
    const pagination = ref({
        current: 1,
        size: 10,
        total: 0
    })

    // 获取系统通知列表
    const fetchNotificationList = async (params = {}) => {
        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: pagination.value.current,
                size: pagination.value.size,
                ...params
            }

            const res = await getAdminNotificationList(queryParams)
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

    // 获取通知详情
    const fetchNotificationDetail = async (notificationId) => {
        loading.value = true
        try {
            const res = await getAdminNotificationDetail(notificationId)
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

    // 发送通知给指定用户
    const sendUserNotification = async (content, userId) => {
        loading.value = true
        try {
            const res = await sendNotification(content, userId)
            if (res.code === 200) {
                ElMessage.success('通知发送成功')
                return true
            }
        } catch (error) {
            console.error('发送通知失败', error)
            ElMessage.error('发送通知失败')
            return false
        } finally {
            loading.value = false
        }
    }

    // 广播通知给所有用户
    const broadcastToAllUsers = async (content) => {
        loading.value = true
        try {
            const res = await broadcastNotification(content)
            if (res.code === 200) {
                ElMessage.success(`成功向${res.data}个用户发送通知`)
                return res.data
            }
        } catch (error) {
            console.error('广播通知失败', error)
            ElMessage.error('广播通知失败')
            return 0
        } finally {
            loading.value = false
        }
    }

    // 删除通知
    const removeNotification = async (notificationId) => {
        try {
            const res = await deleteAdminNotification(notificationId)
            if (res.code === 200) {
                // 从列表中移除
                notifications.value = notifications.value.filter(item => item.id !== notificationId)

                ElMessage.success('通知已删除')
                return true
            }
        } catch (error) {
            console.error('删除通知失败', error)
            ElMessage.error('删除通知失败')
            return false
        }
    }

    // 批量删除通知
    const batchRemoveNotifications = async (notificationIds) => {
        try {
            const res = await batchDeleteAdminNotifications(notificationIds)
            if (res.code === 200) {
                // 从列表中移除
                notifications.value = notifications.value.filter(item => !notificationIds.includes(item.id))

                ElMessage.success(`成功删除${res.data}条通知`)
                return res.data
            }
        } catch (error) {
            console.error('批量删除通知失败', error)
            ElMessage.error('批量删除通知失败')
            return 0
        }
    }

    // 切换通知列表页码
    const changeNotificationPage = (page) => {
        pagination.value.current = page
        fetchNotificationList()
    }

    // 切换每页显示数量
    const changeNotificationPageSize = (size) => {
        pagination.value.size = size
        pagination.value.current = 1 // 重置到第一页
        fetchNotificationList()
    }

    // 重置状态
    const resetState = () => {
        notifications.value = []
        currentNotification.value = null
        pagination.value = {
            current: 1,
            size: 10,
            total: 0
        }
    }

    return {
        notifications,
        currentNotification,
        loading,
        pagination,
        fetchNotificationList,
        fetchNotificationDetail,
        sendUserNotification,
        broadcastToAllUsers,
        removeNotification,
        batchRemoveNotifications,
        changeNotificationPage,
        changeNotificationPageSize,
        resetState
    }
}) 