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
    url: '/user/info',
    method: 'put',
    data
  })
} 