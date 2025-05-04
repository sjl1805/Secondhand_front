/**
 * 时间格式化工具函数
 */

/**
 * 格式化日期时间
 * @param {string|number|Date} time - 时间
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 格式化模板
 * @returns {string} 格式化后的时间字符串
 */
export function formatDateTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!time) return ''

    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if (typeof time === 'string') {
            if (/^[0-9]+$/.test(time)) {
                time = parseInt(time)
            }
        }

        if (typeof time === 'number' && time.toString().length === 10) {
            time = time * 1000
        }
        date = new Date(time)
    }

    const formatObj = {
        YYYY: date.getFullYear(),
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        DD: String(date.getDate()).padStart(2, '0'),
        HH: String(date.getHours()).padStart(2, '0'),
        mm: String(date.getMinutes()).padStart(2, '0'),
        ss: String(date.getSeconds()).padStart(2, '0')
    }

    return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => {
        return formatObj[match]
    })
}

/**
 * 格式化为相对时间
 * @param {string|number|Date} time - 时间
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(time) {
    if (!time) return ''

    const now = new Date()
    const date = new Date(time)
    const diff = now.getTime() - date.getTime()

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day

    if (diff < minute) {
        return '刚刚'
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前'
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前'
    } else if (diff < week) {
        return Math.floor(diff / day) + '天前'
    } else if (diff < month) {
        return Math.floor(diff / week) + '周前'
    } else if (diff < year) {
        return Math.floor(diff / month) + '个月前'
    } else {
        return Math.floor(diff / year) + '年前'
    }
}

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {number} [decimals=2] - 小数位数
 * @param {string} [currency='¥'] - 货币符号
 * @returns {string} 格式化后的价格
 */
export function formatPrice(price, decimals = 2, currency = '¥') {
    if (price === undefined || price === null) return ''

    const formatted = Number(price).toFixed(decimals)
    return `${currency}${formatted}`
} 