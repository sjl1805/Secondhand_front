import request from '@/utils/request'
import {API_BASE_URL} from './config'

/**
 * 上传商品图片
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} 包含图片路径和URL的响应
 */
export function uploadProductImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    return request({
        url: '/file/upload/product',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 上传用户头像
 * @param {File} file - 头像文件
 * @returns {Promise<Object>} 包含头像路径和URL的响应
 */
export function uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)

    return request({
        url: '/file/upload/avatar',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 删除文件
 * @param {string} path - 文件路径
 * @returns {Promise<Object>} 删除结果
 */
export function deleteFile(path) {
    return request({
        url: '/file/delete',
        method: 'delete',
        params: {path}
    })
}

/**
 * 获取文件预览URL
 * @param {string} type - 文件类型（如products, avatars等）
 * @param {string} filename - 文件名
 * @returns {string} 文件预览URL
 */
export function getPreviewUrl(type, filename) {
    return `${API_BASE_URL}/file/preview/${type}/${filename}`
}

/**
 * 获取文件下载URL
 * @param {string} type - 文件类型（如products, avatars等）
 * @param {string} filename - 文件名
 * @returns {string} 文件下载URL
 */
export function getDownloadUrl(type, filename) {
    return `${API_BASE_URL}/file/download/${type}/${filename}`
}

/**
 * 下载文件（直接触发浏览器下载）
 * @param {string} type - 文件类型（如products, avatars等）
 * @param {string} filename - 文件名
 */
export function downloadFile(type, filename) {
    const url = getDownloadUrl(type, filename)
    window.open(url, '_blank')
}

/**
 * 获取文件信息
 * @param {string} path - 文件路径
 * @returns {Promise<Object>} 文件信息
 */
export function getFileInfo(path) {
    return request({
        url: '/file/info',
        method: 'get',
        params: {path}
    })
} 