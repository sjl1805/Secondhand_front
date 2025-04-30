import request from '@/utils/request'

/**
 * 添加评论
 * @param {Object} data - 评论信息
 * @param {number} data.productId - 商品ID
 * @param {number} data.orderId - 订单ID
 * @param {number} data.rating - 评分(1-5)
 * @param {string} data.content - 评论内容
 * @param {Array} [data.images] - 评论图片
 * @returns {Promise}
 */
export function addComment(data) {
  return request({
    url: '/comment/add',
    method: 'post',
    data
  })
}

/**
 * 获取评论详情
 * @param {number} commentId - 评论ID
 * @returns {Promise}
 */
export function getCommentDetail(commentId) {
  return request({
    url: `/comment/detail/${commentId}`,
    method: 'get'
  })
}

/**
 * 获取商品评论列表
 * @param {number} productId - 商品ID
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getProductComments(productId, params) {
  return request({
    url: `/comment/product/${productId}`,
    method: 'get',
    params
  })
}

/**
 * 获取用户评论列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getUserComments(userId, params) {
  return request({
    url: `/comment/user/${userId}`,
    method: 'get',
    params
  })
}

/**
 * 删除评论
 * @param {number} commentId - 评论ID
 * @returns {Promise}
 */
export function deleteComment(commentId) {
  return request({
    url: `/comment/delete/${commentId}`,
    method: 'post'
  })
}

/**
 * 获取商品评分
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function getProductRating(productId) {
  return request({
    url: `/comment/rating/${productId}`,
    method: 'get'
  })
}

/**
 * 检查订单是否已评论
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function isOrderCommented(orderId) {
  return request({
    url: `/comment/check/${orderId}`,
    method: 'get'
  })
} 