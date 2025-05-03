import { defineStore } from 'pinia'
import * as fileApi from '../api/file'
import { FILE_TYPES, API_BASE_URL } from '../api/config'

export const useFileStore = defineStore('file', {
  state: () => ({
    // 文件上传状态
    uploading: false,
    // 最近上传的文件信息
    uploadedFiles: [],
    // 错误信息
    error: null,
    // 文件预览信息
    previewFile: null,
    // 文件上传进度 (0-100)
    uploadProgress: 0
  }),

  getters: {
    // 获取最近上传的文件URL
    getLatestFileUrl: (state) => {
      if (state.uploadedFiles.length > 0) {
        return state.uploadedFiles[0].url
      }
      return null
    },
    
    // 获取所有上传的文件
    getAllUploadedFiles: (state) => {
      return state.uploadedFiles
    },
    
    // 检查是否正在上传文件
    isUploading: (state) => state.uploading,
    
    // 获取上传进度
    getUploadProgress: (state) => state.uploadProgress
  },

  actions: {
    /**
     * 格式化文件路径，确保符合后端格式
     * @param {string} path - 文件路径
     * @returns {string} 格式化后的路径
     */
    formatFilePath(path) {
      // 如果路径为空，返回空字符串
      if (!path) return ''
      
      // 确保路径以斜杠开头
      if (!path.startsWith('/')) {
        path = '/' + path
      }
      
      return path
    },
    
    /**
     * 从文件路径中提取文件类型和文件名
     * @param {string} path - 文件路径，如 /images/avatars/filename.jpg
     * @returns {Object} 包含类型和文件名的对象
     */
    extractFileInfo(path) {
      if (!path) return { type: null, filename: null }
      
      // 移除开头的斜杠并分割路径
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path
      const parts = normalizedPath.split('/')
      
      // 确保路径格式正确
      if (parts.length < 3 || parts[0] !== 'images') {
        return { type: null, filename: null }
      }
      
      // 获取类型和文件名
      const type = parts[1] // avatars 或 products
      const filename = parts[parts.length - 1]
      
      return { type, filename }
    },
    
    /**
     * 获取完整的文件URL
     * @param {string} path - 文件路径
     * @returns {string} 完整URL
     */
    getFullUrl(path) {
      if (!path) return ''
      
      // 确保路径格式正确
      const formattedPath = this.formatFilePath(path)
      return `${API_BASE_URL}/static${formattedPath}`
    },
    
    /**
     * 上传商品图片
     * @param {File} file - 要上传的图片文件
     * @returns {Promise<Object>} 包含图片信息的Promise对象
     */
    async uploadProductImage(file) {
      try {
        this.uploading = true
        this.error = null
        this.uploadProgress = 0
        
        const response = await fileApi.uploadProductImage(file)
        const fileData = response.data
        
        // 格式化路径
        const path = this.formatFilePath(fileData.path)
        const url = this.getFullUrl(path)
        
        // 添加到已上传文件列表
        this.uploadedFiles.unshift({
          path: path,
          url: url,
          type: FILE_TYPES.PRODUCT,
          name: file.name,
          size: file.size,
          uploadTime: new Date()
        })
        
        this.uploadProgress = 100
        return {
          ...fileData,
          path: path,
          url: url
        }
      } catch (error) {
        this.error = error.message || '上传商品图片失败'
        throw error
      } finally {
        this.uploading = false
      }
    },
    
    /**
     * 上传用户头像
     * @param {File} file - 要上传的头像文件
     * @returns {Promise<Object>} 包含头像信息的Promise对象
     */
    async uploadAvatar(file) {
      try {
        this.uploading = true
        this.error = null
        this.uploadProgress = 0
        
        const response = await fileApi.uploadAvatar(file)
        const fileData = response.data
        
        // 格式化路径
        const path = this.formatFilePath(fileData.path)
        const url = this.getFullUrl(path)
        
        // 添加到已上传文件列表
        this.uploadedFiles.unshift({
          path: path,
          url: url,
          type: FILE_TYPES.AVATAR,
          name: file.name,
          size: file.size,
          uploadTime: new Date()
        })
        
        this.uploadProgress = 100
        return {
          ...fileData,
          path: path,
          url: url
        }
      } catch (error) {
        this.error = error.message || '上传头像失败'
        throw error
      } finally {
        this.uploading = false
      }
    },
    
    /**
     * 删除文件
     * @param {string} path - 文件路径
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteFile(path) {
      try {
        this.error = null
        const formattedPath = this.formatFilePath(path)
        const response = await fileApi.deleteFile(formattedPath)
        
        // 从已上传文件列表中移除
        this.uploadedFiles = this.uploadedFiles.filter(file => file.path !== formattedPath)
        
        return response.code === 200
      } catch (error) {
        this.error = error.message || '删除文件失败'
        throw error
      }
    },
    
    /**
     * 获取文件预览URL
     * @param {string} path - 文件路径
     * @returns {string} 预览URL
     */
    getPreviewUrl(path) {
      return this.getFullUrl(path)
    },
    
    /**
     * 根据类型和文件名获取预览URL
     * @param {string} type - 文件类型
     * @param {string} filename - 文件名
     * @returns {string} 预览URL
     */
    getPreviewUrlByTypeAndName(type, filename) {
      const path = `/images/${type}/${filename}`
      return this.getFullUrl(path)
    },
    
    /**
     * 获取文件下载URL
     * @param {string} path - 文件路径
     * @returns {string} 下载URL
     */
    getDownloadUrl(path) {
      return this.getFullUrl(path)
    },
    
    /**
     * 从完整URL中提取出文件路径
     * @param {string} url - 完整的文件URL
     * @returns {string} 文件路径
     */
    getPathFromUrl(url) {
      if (!url) return ''
      
      try {
        // 如果URL包含API基础路径和/static，则从中提取path部分
        if (url.includes(API_BASE_URL) && url.includes('/static')) {
          const staticPart = url.split('/static')[1]
          console.log('从URL提取路径:', staticPart)
          return staticPart
        }
        
        // 如果URL包含/images/，可能是相对路径
        if (url.includes('/images/')) {
          const parts = url.split('/images/')
          if (parts.length >= 2) {
            const imagePath = '/images/' + parts[1]
            console.log('从URL提取图片路径:', imagePath)
            return imagePath
          }
        }
        
        // 如果不包含基础路径，可能是相对路径，直接返回
        console.log('未能识别URL格式，原样返回:', url)
        return url
      } catch (error) {
        console.error('从URL提取路径时发生错误:', error)
        return url
      }
    },
    
    /**
     * 下载文件
     * @param {string} path - 文件路径
     */
    downloadFile(path) {
      const url = this.getFullUrl(path)
      window.open(url, '_blank')
    },
    
    /**
     * 获取文件信息
     * @param {string} path - 文件路径
     * @returns {Promise<Object>} 文件信息
     */
    async getFileInfo(path) {
      try {
        this.error = null
        const formattedPath = this.formatFilePath(path)
        const response = await fileApi.getFileInfo(formattedPath)
        this.previewFile = response.data
        return this.previewFile
      } catch (error) {
        this.error = error.message || '获取文件信息失败'
        throw error
      }
    },
    
    /**
     * 清除上传历史
     */
    clearUploadHistory() {
      this.uploadedFiles = []
    },
    
    /**
     * 设置上传进度
     * @param {number} progress - 进度值 (0-100)
     */
    setUploadProgress(progress) {
      this.uploadProgress = progress
    },
    
    /**
     * 重置状态
     */
    resetState() {
      this.uploading = false
      this.error = null
      this.uploadProgress = 0
      this.previewFile = null
    }
  }
}) 