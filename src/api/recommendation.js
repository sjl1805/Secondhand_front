import request from '@/utils/request'

/**
 * 获取基于用户的商品推荐
 * @param {number} [limit=10] - 推荐数量
 * @returns {Promise}
 */
export function getUserBasedRecommendations(limit = 10) {
    return request({
        url: '/recommendations/user-based',
        method: 'get',
        params: {limit}
    })
}

/**
 * 获取基于商品的商品推荐
 * @param {number} [limit=10] - 推荐数量
 * @returns {Promise}
 */
export function getItemBasedRecommendations(limit = 10) {
    return request({
        url: '/recommendations/item-based',
        method: 'get',
        params: {limit}
    })
}

/**
 * 刷新当前用户的商品推荐
 * @returns {Promise}
 */
export function refreshRecommendations() {
    return request({
        url: '/recommendations/refresh',
        method: 'post'
    })
} 