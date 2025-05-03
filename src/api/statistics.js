import request from '@/utils/request'

/**
 * 获取仪表盘概览数据
 * @returns {Promise}
 */
export function getBasicStatistics() {
  return request({
    url: '/admin/statistics/dashboard/overview',
    method: 'get'
  })
}

/**
 * 获取今日数据统计
 * @returns {Promise}
 */
export function getTodayStatistics() {
  return request({
    url: '/admin/statistics/today',
    method: 'get'
  })
}

/**
 * 获取用户注册统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeGranularity=day] - 时间粒度：day-天、week-周、month-月
 * @returns {Promise}
 */
export function getUserRegisterStatistics(params) {
  return request({
    url: '/admin/statistics/user/register',
    method: 'get',
    params
  })
}

/**
 * 获取订单统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeGranularity=day] - 时间粒度：day-天、week-周、month-月
 * @returns {Promise}
 */
export function getOrderStatistics(params) {
  return request({
    url: '/admin/statistics/order/count',
    method: 'get',
    params
  })
}

/**
 * 获取交易额统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeGranularity=day] - 时间粒度：day-天、week-周、month-月
 * @returns {Promise}
 */
export function getTransactionStatistics(params) {
  return request({
    url: '/admin/statistics/transaction',
    method: 'get',
    params
  })
}

/**
 * 获取商品状态统计
 * @returns {Promise}
 */
export function getProductStatusStatistics() {
  return request({
    url: '/admin/statistics/product/status',
    method: 'get'
  })
}

/**
 * 获取订单状态统计
 * @returns {Promise}
 */
export function getOrderStatusStatistics() {
  return request({
    url: '/admin/statistics/order/status',
    method: 'get'
  })
}

/**
 * 获取用户活跃度统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeGranularity=day] - 时间粒度：day-天、week-周、month-月
 * @returns {Promise}
 */
export function getUserActivityStatistics(params) {
  return request({
    url: '/admin/statistics/user/activity',
    method: 'get',
    params
  })
}

/**
 * 获取热门商品统计数据
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise}
 */
export function getHotProductsStatistics(params) {
  return request({
    url: '/admin/statistics/product/hot',
    method: 'get',
    params
  })
}

/**
 * 获取活跃卖家统计数据
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise}
 */
export function getActiveSellersStatistics(params) {
  return request({
    url: '/admin/statistics/seller/active',
    method: 'get',
    params
  })
}

/**
 * 获取活跃买家统计数据
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise}
 */
export function getActiveBuyersStatistics(params) {
  return request({
    url: '/admin/statistics/buyer/active',
    method: 'get',
    params
  })
}

/**
 * 获取商品评分统计数据
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function getProductRatingStatistics(productId) {
  return request({
    url: `/admin/statistics/product/rating`,
    method: 'get',
    params: { productId }
  })
} 