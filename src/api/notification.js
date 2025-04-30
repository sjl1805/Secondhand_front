import request from '@/utils/request'

/**
 * 获取系统通知列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getNotificationList(params = { page: 1, size: 10 }) {
  return request({
    url: '/notification/list',
    method: 'get',
    params
  })
}

/**
 * 获取未读系统通知
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getUnreadNotifications(params = { page: 1, size: 10 }) {
  return request({
    url: '/notification/unread',
    method: 'get',
    params
  })
}

/**
 * 获取通知详情
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function getNotificationDetail(notificationId) {
  return request({
    url: `/notification/${notificationId}`,
    method: 'get'
  })
}

/**
 * 标记通知为已读
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function markAsRead(notificationId) {
  return request({
    url: `/notification/${notificationId}/read`,
    method: 'put'
  })
}

/**
 * 标记所有通知为已读
 * @returns {Promise}
 */
export function markAllAsRead() {
  return request({
    url: '/notification/read/all',
    method: 'put'
  })
}

/**
 * 获取未读通知数量
 * @returns {Promise}
 */
export function getUnreadCount() {
  return request({
    url: '/notification/unread/count',
    method: 'get'
  })
} 