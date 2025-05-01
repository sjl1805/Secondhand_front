<template>
  <div class="file-uploader">
    <h3>文件上传</h3>
    
    <!-- 上传区域 -->
    <div class="upload-area">
      <el-upload
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        accept="image/*"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        
        <template #tip>
          <div class="el-upload__tip">
            只能上传 jpg/png/jpeg 文件，且不超过 5MB
          </div>
        </template>
      </el-upload>
      
      <div class="upload-buttons">
        <el-button 
          type="success" 
          @click="uploadProductImage"
          :loading="fileStore.isUploading"
          :disabled="!selectedFile"
        >
          上传商品图片
        </el-button>
        
        <el-button 
          type="primary" 
          @click="uploadAvatar"
          :loading="fileStore.isUploading"
          :disabled="!selectedFile"
        >
          上传头像
        </el-button>
      </div>
      
      <!-- 上传进度 -->
      <div v-if="fileStore.isUploading" class="upload-progress">
        <el-progress 
          :percentage="fileStore.getUploadProgress" 
          :format="percentageFormat"
        />
      </div>
    </div>
    
    <!-- 上传历史 -->
    <div v-if="fileStore.getAllUploadedFiles.length > 0" class="upload-history">
      <h4>上传历史</h4>
      <el-table :data="fileStore.getAllUploadedFiles" style="width: 100%">
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="size" label="大小" :formatter="formatFileSize" />
        <el-table-column prop="uploadTime" label="上传时间" :formatter="formatDate" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="previewFile(scope.row)"
            >
              预览
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="downloadFileAction(scope.row)"
            >
              下载
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteFileAction(scope.row.path)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="clear-history">
        <el-button type="warning" @click="fileStore.clearUploadHistory">
          清除历史记录
        </el-button>
      </div>
    </div>
    
    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="文件预览">
      <div class="preview-content">
        <img 
          v-if="previewUrl" 
          :src="previewUrl" 
          class="preview-image" 
          alt="预览图片"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useFileStore } from '@/stores'
import { FILE_TYPES } from '@/api/config'

// 初始化文件存储
const fileStore = useFileStore()

// 文件上传相关
const fileList = ref([])
const selectedFile = ref(null)
const previewVisible = ref(false)
const previewUrl = ref('')

// 文件选择处理
const handleFileChange = (file) => {
  selectedFile.value = file.raw
  fileList.value = [file]
}

// 文件数量超出限制处理
const handleExceed = () => {
  ElMessage.warning('一次只能上传一个文件')
}

// 上传商品图片
const uploadProductImage = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  try {
    const result = await fileStore.uploadProductImage(selectedFile.value)
    ElMessage.success('商品图片上传成功')
    fileList.value = []
    selectedFile.value = null
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(error.message || '上传失败')
  }
}

// 上传头像
const uploadAvatar = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  try {
    const result = await fileStore.uploadAvatar(selectedFile.value)
    ElMessage.success('头像上传成功')
    fileList.value = []
    selectedFile.value = null
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(error.message || '上传失败')
  }
}

// 预览文件
const previewFile = (file) => {
  previewUrl.value = fileStore.getPreviewUrl(file.path)
  previewVisible.value = true
}

// 下载文件
const downloadFileAction = (file) => {
  fileStore.downloadFile(file.path)
}

// 删除文件
const deleteFileAction = async (path) => {
  try {
    await fileStore.deleteFile(path)
    ElMessage.success('文件删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error(error.message || '删除失败')
  }
}

// 格式化文件大小
const formatFileSize = (row, column, cellValue) => {
  if (!cellValue) return '未知'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = cellValue
  let unitIndex = 0
  
  while (size > 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 格式化日期
const formatDate = (row, column, cellValue) => {
  if (!cellValue) return '未知'
  
  const date = new Date(cellValue)
  return date.toLocaleString()
}

// 格式化百分比
const percentageFormat = (percentage) => {
  return percentage === 100 ? '完成' : `${percentage}%`
}
</script>

<style scoped>
.file-uploader {
  padding: 20px;
}

.upload-area {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.upload-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.upload-progress {
  margin-top: 15px;
}

.upload-history {
  margin-top: 30px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  display: block;
  margin: 0 auto;
}

.clear-history {
  margin-top: 15px;
  text-align: right;
}
</style> 