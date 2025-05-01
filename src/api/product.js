import request from '@/utils/request'

/**
 * 管理员获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {number} [params.categoryId] - 分类ID
 * @param {number} [params.status] - 商品状态：1-在售 2-已售 3-下架
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number} [params.userId] - 发布者ID
 * @returns {Promise}
 */
export function getAdminProductList(params) {
  return request({
    url: '/admin/product/list',
    method: 'get',
    params
  })
}

/**
 * 管理员获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise}
 */
export function getAdminProductDetail(id) {
  return request({
    url: `/admin/product/${id}`,
    method: 'get'
  })
}

/**
 * 管理员更新商品状态
 * @param {number} id - 商品ID
 * @param {number} status - 商品状态：1-在售 2-已售 3-下架
 * @returns {Promise}
 */
export function updateAdminProductStatus(id, status) {
  return request({
    url: `/admin/product/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 管理员删除商品
 * @param {number} id - 商品ID
 * @returns {Promise}
 */
export function deleteAdminProduct(id) {
  return request({
    url: `/admin/product/${id}`,
    method: 'delete'
  })
}

/**
 * 管理员批量更新商品状态
 * @param {Array<number>} productIds - 商品ID列表
 * @param {number} status - 商品状态：1-在售 2-已售 3-下架
 * @returns {Promise}
 */
export function batchUpdateAdminProductStatus(productIds, status) {
  return request({
    url: '/admin/product/batch/status',
    method: 'put',
    data: productIds,
    params: { status }
  })
}

/**
 * 管理员批量删除商品
 * @param {Array<number>} productIds - 商品ID列表
 * @returns {Promise}
 */
export function batchDeleteAdminProduct(productIds) {
  return request({
    url: '/admin/product/batch',
    method: 'delete',
    data: productIds
  })
}

/**
 * 发布商品
 * @param {Object} data - 商品数据
 * @param {string} data.name - 商品名称
 * @param {string} data.description - 商品描述
 * @param {number} data.price - 商品价格（元）
 * @param {number} data.categoryId - 分类ID
 * @param {Array} data.images - 商品图片列表
 * @param {number} data.condition - 商品成色：1-全新 2-几乎全新 3-轻微使用痕迹 4-正常使用痕迹 5-明显使用痕迹
 * @param {string} [data.location] - 地理位置
 * @returns {Promise}
 */
export function publishProduct(data) {
  return request({
    url: '/product',
    method: 'post',
    data
  })
}

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {number} params.categoryId - 分类ID
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise}
 */
export function getProductList(params) {
  return request({
    url: '/product/list',
    method: 'get',
    params
  })
}

/**
 * 获取指定卖家的商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.userId - 卖家用户ID
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {number} params.status - 商品状态：1-在售 2-已售 3-下架
 * @returns {Promise}
 */
export function getSellerProducts(params) {
  return request({
    url: `/product/seller/${params.userId}`,
    method: 'get',
    params: {
      page: params.page,
      size: params.size,
      status: params.status
    }
  })
}

/**
 * 获取商品详情
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function getProductDetail(productId) {
  return request({
    url: `/product/${productId}`,
    method: 'get'
  })
}

/**
 * 获取用户发布的商品
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getUserProducts(params) {
  return request({
    url: '/product/user',
    method: 'get',
    params
  })
}

/**
 * 更新商品状态
 * @param {number} productId - 商品ID
 * @param {number} status - 商品状态：1-在售 2-已售 3-下架
 * @returns {Promise}
 */
export function updateProductStatus(productId, status) {
  return request({
    url: `/product/${productId}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 删除商品
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function deleteProduct(productId) {
  return request({
    url: `/product/${productId}`,
    method: 'delete'
  })
}

/**
 * 高级搜索商品
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number} [params.categoryId] - 分类ID
 * @param {number} [params.minPrice] - 最低价格
 * @param {number} [params.maxPrice] - 最高价格
 * @param {string} [params.sortField] - 排序字段
 * @param {string} [params.sortOrder] - 排序方式
 * @returns {Promise}
 */
export function advancedSearchProducts(params) {
  return request({
    url: '/product/advanced-search',
    method: 'get',
    params
  })
}

/**
 * 增加商品浏览次数
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function incrementViewCount(productId) {
  return request({
    url: `/product/${productId}/view`,
    method: 'put'
  })
}
