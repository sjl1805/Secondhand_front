import request from '@/utils/request'

/**
 * 获取系统通知列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @param {number} [params.userId] - 用户ID（可选）
 * @returns {Promise}
 */
export function getAdminNotificationList(params) {
    return request({
        url: '/admin/notification/list',
        method: 'get',
        params
    })
}

/**
 * 获取通知详情
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function getAdminNotificationDetail(notificationId) {
    return request({
        url: `/admin/notification/${notificationId}`,
        method: 'get'
    })
}

/**
 * 发送系统通知给指定用户
 * @param {string} content - 通知内容
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function sendNotification(content, userId) {
    return request({
        url: '/admin/notification/send',
        method: 'post',
        params: {
            content,
            userId
        }
    })
}

/**
 * 向所有用户广播系统通知
 * @param {string} content - 通知内容
 * @returns {Promise}
 */
export function broadcastNotification(content) {
    return request({
        url: '/admin/notification/broadcast',
        method: 'post',
        params: {
            content
        }
    })
}

/**
 * 删除系统通知
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function deleteAdminNotification(notificationId) {
    return request({
        url: `/admin/notification/${notificationId}`,
        method: 'delete'
    })
}

/**
 * 批量删除系统通知
 * @param {Array<number>} notificationIds - 通知ID列表
 * @returns {Promise}
 */
export function batchDeleteAdminNotifications(notificationIds) {
    return request({
        url: '/admin/notification/batch',
        method: 'delete',
        data: notificationIds
    })
} 