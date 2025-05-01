import { defineStore } from 'pinia'
import * as fileApi from '../api/file'
import { FILE_TYPES } from '../api/config'

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
        
        // 添加到已上传文件列表
        this.uploadedFiles.unshift({
          path: fileData.path,
          url: fileData.url,
          type: FILE_TYPES.PRODUCT,
          name: file.name,
          size: file.size,
          uploadTime: new Date()
        })
        
        this.uploadProgress = 100
        return fileData
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
        
        // 添加到已上传文件列表
        this.uploadedFiles.unshift({
          path: fileData.path,
          url: fileData.url,
          type: FILE_TYPES.AVATAR,
          name: file.name,
          size: file.size,
          uploadTime: new Date()
        })
        
        this.uploadProgress = 100
        return fileData
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
        const response = await fileApi.deleteFile(path)
        
        // 从已上传文件列表中移除
        this.uploadedFiles = this.uploadedFiles.filter(file => file.path !== path)
        
        return response.code === 200
      } catch (error) {
        this.error = error.message || '删除文件失败'
        throw error
      }
    },
    
    /**
     * 获取文件预览URL
     * @param {string} type - 文件类型
     * @param {string} filename - 文件名
     * @returns {string} 预览URL
     */
    getPreviewUrl(type, filename) {
      return fileApi.getPreviewUrl(type, filename)
    },
    
    /**
     * 获取文件下载URL
     * @param {string} type - 文件类型
     * @param {string} filename - 文件名
     * @returns {string} 下载URL
     */
    getDownloadUrl(type, filename) {
      return fileApi.getDownloadUrl(type, filename)
    },
    
    /**
     * 下载文件
     * @param {string} type - 文件类型
     * @param {string} filename - 文件名
     */
    downloadFile(type, filename) {
      fileApi.downloadFile(type, filename)
    },
    
    /**
     * 获取文件信息
     * @param {string} path - 文件路径
     * @returns {Promise<Object>} 文件信息
     */
    async getFileInfo(path) {
      try {
        this.error = null
        const response = await fileApi.getFileInfo(path)
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