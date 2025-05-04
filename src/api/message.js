import request from '@/utils/request'

/**
 * 发送消息
 * @param {Object} data - 消息内容
 * @param {number} data.receiverId - 接收者ID
 * @param {string} data.content - 消息内容
 * @param {string} data.type - 消息类型 (TEXT, IMAGE, PRODUCT, ORDER)
 * @param {number} [data.relatedProductId] - 相关商品ID
 * @param {number} [data.relatedOrderId] - 相关订单ID
 * @returns {Promise}
 */
export function sendMessage(data) {
    return request({
        url: '/message',
        method: 'post',
        data
    })
}

/**
 * 获取消息详情
 * @param {number} messageId - 消息ID
 * @returns {Promise}
 */
export function getMessageDetail(messageId) {
    return request({
        url: `/message/${messageId}`,
        method: 'get'
    })
}

/**
 * 获取与特定用户的聊天历史
 * @param {number} targetUserId - 目标用户ID
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=20] - 每页数量
 * @returns {Promise}
 */
export function getChatHistory(targetUserId, params = {}) {
    return request({
        url: `/message/chat/${targetUserId}`,
        method: 'get',
        params
    })
}

/**
 * 获取消息列表（按联系人分组）
 * @returns {Promise}
 */
export function getMessageList() {
    return request({
        url: '/message/list',
        method: 'get'
    })
}

/**
 * 标记消息为已读
 * @param {number} messageId - 消息ID
 * @returns {Promise}
 */
export function markAsRead(messageId) {
    return request({
        url: `/message/${messageId}/read`,
        method: 'put'
    })
}

/**
 * 标记与某用户的所有消息为已读
 * @param {number} targetUserId - 目标用户ID
 * @returns {Promise}
 */
export function markAllAsRead(targetUserId) {
    return request({
        url: `/message/read/all/${targetUserId}`,
        method: 'put'
    })
}

/**
 * 获取未读消息数量
 * @returns {Promise}
 */
export function getUnreadCount() {
    return request({
        url: '/message/unread/count',
        method: 'get'
    })
}

/**
 * 删除消息
 * @param {number} messageId - 消息ID
 * @returns {Promise}
 */
export function deleteMessage(messageId) {
    return request({
        url: `/message/${messageId}`,
        method: 'delete'
    })
}

/**
 * 获取最新联系人列表
 * @returns {Promise}
 */
export function getContactList() {
    return request({
        url: '/message/contacts',
        method: 'get'
    })
}

/**
 * 获取用户基本信息
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUserBasicInfo(userId) {
    return request({
        url: `/user/basic/${userId}`,
        method: 'get'
    })
}