import request from '@/utils/request'

/**
 * 管理员获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {number} [params.buyerId] - 买家ID
 * @param {number} [params.sellerId] - 卖家ID
 * @param {number} [params.status] - 订单状态：1-待付款 2-待发货 3-待收货 4-已完成 5-已取消
 * @param {string} [params.orderNo] - 订单号
 * @returns {Promise}
 */
export function getAdminOrderList(params) {
    return request({
        url: '/admin/order/list',
        method: 'get',
        params
    })
}

/**
 * 管理员获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function getAdminOrderDetail(id) {
    return request({
        url: `/admin/order/${id}`,
        method: 'get'
    })
}

/**
 * 管理员更新订单状态
 * @param {number} id - 订单ID
 * @param {number} status - 订单状态：1-待付款 2-待发货 3-待收货 4-已完成 5-已取消
 * @returns {Promise}
 */
export function updateAdminOrderStatus(id, status) {
    return request({
        url: `/admin/order/${id}/status`,
        method: 'put',
        params: {status}
    })
}

/**
 * 管理员删除订单
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function deleteAdminOrder(id) {
    return request({
        url: `/admin/order/${id}`,
        method: 'delete'
    })
}

/**
 * 管理员批量更新订单状态
 * @param {Array<number>} orderIds - 订单ID列表
 * @param {number} status - 订单状态：1-待付款 2-待发货 3-待收货 4-已完成 5-已取消
 * @returns {Promise}
 */
export function batchUpdateAdminOrderStatus(orderIds, status) {
    return request({
        url: '/admin/order/batch/status',
        method: 'put',
        data: orderIds,
        params: {status}
    })
}

/**
 * 管理员批量删除订单
 * @param {Array<number>} orderIds - 订单ID列表
 * @returns {Promise}
 */
export function batchDeleteAdminOrder(orderIds) {
    return request({
        url: '/admin/order/batch',
        method: 'delete',
        data: orderIds
    })
}

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {number} data.productId - 商品ID
 * @param {number} data.quantity - 购买数量
 * @param {number} data.addressId - 收货地址ID
 * @param {string} data.message - 买家留言
 * @returns {Promise}
 */
export function createOrder(data) {
    return request({
        url: '/order',
        method: 'post',
        data
    })
}

/**
 * 获取订单详情
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(orderId) {
    return request({
        url: `/order/${orderId}`,
        method: 'get'
    })
}

/**
 * 更新订单状态
 * @param {number} orderId - 订单ID
 * @param {number} status - 订单状态：1-待付款 2-待发货 3-待收货 4-已完成 5-已取消
 * @returns {Promise}
 */
export function updateOrderStatus(orderId, status) {
    return request({
        url: `/order/${orderId}/status`,
        method: 'put',
        params: {status}
    })
}

/**
 * 取消订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function cancelOrder(orderId) {
    return request({
        url: `/order/${orderId}/cancel`,
        method: 'put'
    })
}

/**
 * 获取买家订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.status] - 订单状态：null-全部 1-待付款 2-待发货 3-待收货 4-已完成 5-已取消
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getBuyerOrders(params) {
    return request({
        url: '/order/buyer',
        method: 'get',
        params
    })
}

/**
 * 获取卖家订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.status] - 订单状态：null-全部 1-待付款 2-待发货 3-待收货 4-已完成 5-已取消
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise}
 */
export function getSellerOrders(params) {
    return request({
        url: '/order/seller',
        method: 'get',
        params
    })
}

/**
 * 卖家发货
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function shipOrder(orderId) {
    return request({
        url: `/order/${orderId}/ship`,
        method: 'put'
    })
}

/**
 * 买家收货
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function receiveOrder(orderId) {
    return request({
        url: `/order/${orderId}/receive`,
        method: 'put'
    })
}

/**
 * 支付订单
 * @param {number} orderId - 订单ID
 * @param {Object} data - 支付数据
 * @param {number} data.amount - 支付金额
 * @param {number} data.paymentMethod - 支付方式: 1-支付宝 2-微信支付 3-银行卡
 * @param {string} [data.paymentAccount] - 支付账号信息（加密后的）
 * @param {string} [data.message] - 订单留言
 * @returns {Promise}
 */
export function payOrder(orderId, data) {
    return request({
        url: `/order/${orderId}/payment`,
        method: 'post',
        data
    })
}

/**
 * 查询支付状态
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function getPaymentStatus(orderId) {
    return request({
        url: `/order/${orderId}/payment/status`,
        method: 'get'
    })
} 