<template>
  <div v-loading="store.loading" class="detail-container">
    <el-page-header content="商品详情" @back="goBack"/>

    <el-card v-if="product" class="detail-card">
      <!-- 基本信息 -->
      <div class="section">
        <h3>基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品ID">{{ product.id }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ product.title }}</el-descriptions-item>
          <el-descriptions-item label="价格">￥{{ product.price }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ product.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="成色">{{ getProductQualityText(product.productQuality) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(product.status)">
              {{ store.getProductStatusText(product.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="卖家">{{ product.nickname || `用户${product.userId}` }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(product.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品图片 -->
      <div v-if="product.imageUrls && product.imageUrls.length" class="section">
        <h3>商品图片</h3>
        <div class="images-container">
          <el-image
              v-for="(url, index) in product.imageUrls"
              :key="index"
              :preview-src-list="product.imageUrls.map(img => fileStore.getFullUrl(img))"
              :src="fileStore.getFullUrl(url)"
              class="product-image"
              fit="cover"
          />
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="section">
        <h3>商品描述</h3>
        <div class="description-content">{{ product.description }}</div>
      </div>

      <!-- 操作区 -->
      <div class="action-bar">
        <el-button :type="product.status === 3 ? 'success' : 'danger'" @click="toggleStatus">
          {{ product.status === 3 ? '重新上架' : '下架商品' }}
        </el-button>
        <el-button type="danger" @click="handleDelete">删除商品</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAdminProductStore} from '@/stores/adminProduct'
import {useFileStore} from '@/stores/file'
import {ElMessage, ElMessageBox} from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const store = useAdminProductStore()
const fileStore = useFileStore()
const productId = ref(null)
const product = ref(null)

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '--'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

// 获取商品成色文本
const getProductQualityText = (quality) => {
  const qualityMap = {
    1: '全新',
    2: '几乎全新',
    3: '二手良品',
    4: '有使用痕迹',
    5: '功能正常'
  }
  return qualityMap[quality] || '未知'
}

// 初始化加载数据
onMounted(async () => {
  try {
    // 设置管理员角色并确保权限
    store.setAdminRole(true)

    productId.value = route.params.id
    if (!productId.value) {
      ElMessage.error('商品ID不能为空')
      goBack()
      return
    }

    const result = await store.fetchProductDetail(productId.value)
    if (result) {
      product.value = result
    } else {
      ElMessage.error('获取商品详情失败')
      goBack()
    }
  } catch (error) {
    console.error('加载商品详情失败', error)
    ElMessage.error('加载商品详情失败，请稍后重试')
    goBack()
  }
})

// 返回列表
const goBack = () => {
  router.push({name: 'AdminProducts'})
}

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case 1:
      return 'success'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

// 切换商品状态
const toggleStatus = async () => {
  const newStatus = product.value.status === 3 ? 1 : 3
  try {
    await store.updateProductStatus(productId.value, newStatus)
    product.value.status = newStatus
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败', error)
  }
}

// 删除商品
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要永久删除该商品吗？此操作不可恢复！',
        '警告',
        {type: 'error', confirmButtonText: '确认删除'}
    )
    await store.removeProduct(productId.value)
    ElMessage.success('商品已删除')
    goBack()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 20px;
}

.detail-card {
  margin-top: 20px;
}

.section {
  margin-bottom: 30px;

  h3 {
    margin-bottom: 15px;
    color: #606266;
  }
}

.description-content {
  padding: 15px;
  line-height: 1.6;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.product-image {
  width: 150px;
  height: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-bar {
  margin-top: 30px;
  text-align: right;

  .el-button {
    margin-left: 15px;
  }
}
</style>
