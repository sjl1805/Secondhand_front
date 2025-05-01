import request from '@/utils/request'

/**
 * 获取当前登录用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @param {string} data.nickname - 昵称
 * @param {string} data.avatar - 头像
 * @param {string} data.email - 邮箱
 * @param {string} data.phone - 电话
 * @param {string} data.bio - 个人简介
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

/**
 * 获取卖家信息
 * @param {number} sellerId - 卖家ID
 * @returns {Promise}
 */
export function getSellerInfo(sellerId) {
  return request({
    url: `/user/seller/${sellerId}`,
    method: 'get'
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码信息
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise}
 */
export function updatePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}

/**
 * 绑定手机号
 * @param {Object} data - 手机信息
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @returns {Promise}
 */
export function bindPhone(data) {
  return request({
    url: '/user/bind/phone',
    method: 'post',
    data
  })
}

/**
 * 绑定邮箱
 * @param {Object} data - 邮箱信息
 * @param {string} data.email - 邮箱
 * @param {string} data.code - 验证码
 * @returns {Promise}
 */
export function bindEmail(data) {
  return request({
    url: '/user/bind/email',
    method: 'post',
    data
  })
}
