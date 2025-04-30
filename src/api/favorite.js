import request from '@/utils/request'

/**
 * 收藏商品
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function addFavorite(productId) {
  return request({
    url: `/favorite/${productId}`,
    method: 'post'
  })
}

/**
 * 取消收藏
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function cancelFavorite(productId) {
  return request({
    url: `/favorite/${productId}`,
    method: 'delete'
  })
}

/**
 * 检查是否已收藏
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function checkFavorite(productId) {
  return request({
    url: `/favorite/check/${productId}`,
    method: 'get'
  })
}

/**
 * 获取收藏列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getFavoriteList(params) {
  return request({
    url: '/favorite/list',
    method: 'get',
    params
  })
}

/**
 * 获取商品收藏数量
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function getFavoriteCount(productId) {
  return request({
    url: `/favorite/count/${productId}`,
    method: 'get'
  })
} 