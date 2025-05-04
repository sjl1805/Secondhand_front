import request from '@/utils/request'

/**
 * 获取用户地址列表
 * @returns {Promise} - 返回地址列表
 */
export function getAddressList() {
    return request({
        url: '/address/list',
        method: 'get'
    })
}

/**
 * 获取地址详情
 * @param {number} id - 地址ID
 * @returns {Promise} - 返回地址详情
 */
export function getAddressDetail(id) {
    return request({
        url: `/address/${id}`,
        method: 'get'
    })
}

/**
 * 添加地址
 * @param {Object} data - 地址数据
 * @returns {Promise} - 返回添加结果
 */
export function addAddress(data) {
    return request({
        url: '/address',
        method: 'post',
        data
    })
}

/**
 * 更新地址
 * @param {Object} data - 地址数据
 * @returns {Promise} - 返回更新结果
 */
export function updateAddress(data) {
    return request({
        url: '/address',
        method: 'put',
        data
    })
}

/**
 * 删除地址
 * @param {number} id - 地址ID
 * @returns {Promise} - 返回删除结果
 */
export function deleteAddress(id) {
    return request({
        url: `/address/${id}`,
        method: 'delete'
    })
}

/**
 * 设置默认地址
 * @param {number} id - 地址ID
 * @returns {Promise} - 返回设置结果
 */
export function setDefaultAddress(id) {
    return request({
        url: `/address/${id}/default`,
        method: 'put'
    })
} 