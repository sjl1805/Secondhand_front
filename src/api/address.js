import request from '@/utils/request'

/**
 * 获取用户地址列表
 * @returns {Promise}
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
 * @returns {Promise}
 */
export function getAddressDetail(id) {
  return request({
    url: `/address/${id}`,
    method: 'get'
  })
}

/**
 * 添加新地址
 * @param {Object} data - 地址信息
 * @param {string} data.name - 收货人姓名
 * @param {string} data.phone - 联系电话
 * @param {string} data.province - 省份
 * @param {string} data.city - 城市
 * @param {string} data.district - 区/县
 * @param {string} data.detailAddress - 详细地址
 * @param {boolean} data.isDefault - 是否默认地址
 * @returns {Promise}
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
 * @param {Object} data - 地址信息
 * @param {number} data.id - 地址ID
 * @param {string} data.name - 收货人姓名
 * @param {string} data.phone - 联系电话
 * @param {string} data.province - 省份
 * @param {string} data.city - 城市
 * @param {string} data.district - 区/县
 * @param {string} data.detailAddress - 详细地址
 * @param {boolean} data.isDefault - 是否默认地址
 * @returns {Promise}
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
 * @returns {Promise}
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
 * @returns {Promise}
 */
export function setDefaultAddress(id) {
  return request({
    url: `/address/${id}/default`,
    method: 'put'
  })
} 