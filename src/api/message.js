import request from '@/utils/request'

/**
 * 发送消息
 * @param {Object} data - 消息内容
 * @param {number} data.receiverId - 接收者ID
 * @param {string} data.content - 消息内容
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
 * 获取聊天记录
 * @param {number} targetUserId - 目标用户ID
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=20] - 每页数量
 * @returns {Promise}
 */
export function getChatHistory(targetUserId, params) {
  return request({
    url: `/message/chat/${targetUserId}`,
    method: 'get',
    params
  })
}

/**
 * 获取消息列表
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
 * 标记所有消息为已读
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