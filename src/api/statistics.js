import request from '@/utils/request'

/**
 * 获取基本统计数据
 * @returns {Promise}
 */
export function getBasicStatistics() {
  return request({
    url: '/admin/statistics/basic',
    method: 'get'
  })
}

/**
 * 获取用户注册统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeUnit=day] - 时间单位：day-天、week-周、month-月
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
 * @param {string} [params.timeUnit=day] - 时间单位：day-天、week-周、month-月
 * @returns {Promise}
 */
export function getOrderStatistics(params) {
  return request({
    url: '/admin/statistics/order',
    method: 'get',
    params
  })
}

/**
 * 获取交易额统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeUnit=day] - 时间单位：day-天、week-周、month-月
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
 * 获取分类商品统计数据
 * @returns {Promise}
 */
export function getCategoryProductStatistics() {
  return request({
    url: '/admin/statistics/category/product',
    method: 'get'
  })
}

/**
 * 获取用户活跃度统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @param {string} [params.timeUnit=day] - 时间单位：day-天、week-周、month-月
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
 * 获取商品状态统计数据
 * @returns {Promise}
 */
export function getProductStatusStatistics() {
  return request({
    url: '/admin/statistics/product/status',
    method: 'get'
  })
}

/**
 * 获取订单状态统计数据
 * @returns {Promise}
 */
export function getOrderStatusStatistics() {
  return request({
    url: '/admin/statistics/order/status',
    method: 'get'
  })
}

/**
 * 获取平台收入统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期，格式：yyyy-MM-dd
 * @param {string} params.endDate - 结束日期，格式：yyyy-MM-dd
 * @returns {Promise}
 */
export function getPlatformIncome(params) {
  return request({
    url: '/admin/statistics/platform/income',
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
    url: '/admin/statistics/hot/products',
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
    url: '/admin/statistics/active/sellers',
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
    url: '/admin/statistics/active/buyers',
    method: 'get',
    params
  })
} 