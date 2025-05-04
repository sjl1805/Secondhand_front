import request from '@/utils/request'

/**
 * 登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.captchaKey - 验证码key
 * @param {string} data.captchaCode - 验证码
 * @returns {Promise}
 */
export function login(data) {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    })
}

/**
 * 注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.nickname - 昵称
 * @param {string} data.email - 邮箱
 * @param {string} data.captchaKey - 验证码key
 * @param {string} data.captchaCode - 验证码
 * @returns {Promise}
 */
export function register(data) {
    return request({
        url: '/auth/register',
        method: 'post',
        data
    })
}

/**
 * 获取验证码
 * @returns {Promise}
 */
export function getCaptcha() {
    return request({
        url: '/auth/captcha',
        method: 'get'
    })
} 