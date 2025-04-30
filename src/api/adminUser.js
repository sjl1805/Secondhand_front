import request from '@/utils/request'

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} [params.keyword] - 搜索关键词
 * @returns {Promise}
 */
export function getAdminUserList(params) {
  return request({
    url: '/admin/user/users',
    method: 'get',
    params
  })
}

/**
 * 修改用户状态
 * @param {number} userId - 用户ID
 * @param {Object} params - 修改参数
 * @param {number} [params.creditScore] - 信用分
 * @param {number} [params.role] - 角色：0-普通用户 9-管理员
 * @returns {Promise}
 */
export function updateAdminUserStatus(userId, params) {
  return request({
    url: `/admin/user/users/${userId}/status`,
    method: 'put',
    params
  })
}

/**
 * 删除用户
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function deleteAdminUser(userId) {
  return request({
    url: `/admin/user/users/${userId}`,
    method: 'delete'
  })
}

/**
 * 重置用户密码
 * @param {number} userId - 用户ID
 * @param {Object} params - 重置参数
 * @param {string} params.newPassword - 新密码
 * @returns {Promise}
 */
export function resetAdminUserPassword(userId, params) {
  return request({
    url: `/admin/user/users/${userId}/password`,
    method: 'put',
    params
  })
}

/**
 * 获取管理员列表
 * @returns {Promise}
 */
export function getAdminList() {
  return request({
    url: '/admin/user/admins',
    method: 'get'
  })
} 