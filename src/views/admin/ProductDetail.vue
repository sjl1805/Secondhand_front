<template>
  <div class="detail-container" v-loading="store.loading">
    <el-page-header @back="goBack" content="商品详情" />
    
    <el-card class="detail-card" v-if="product">
      <!-- 基本信息 -->
      <div class="section">
        <h3>基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品ID">{{ product.id }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ product.name }}</el-descriptions-item>
          <el-descriptions-item label="价格">￥{{ product.price }}</el-descriptions-item>
          <el-descriptions-item label="库存">{{ product.stock }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(product.status)">
              {{ store.getProductStatusText(product.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ product.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品描述 -->
      <div class="section">
        <h3>商品描述</h3>
        <div class="description-content">{{ product.description }}</div>
      </div>

      <!-- 操作区 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleEdit">编辑信息</el-button>
        <el-button :type="product.status === 3 ? 'success' : 'danger'" @click="toggleStatus">
          {{ product.status === 3 ? '重新上架' : '下架商品' }}
        </el-button>
        <el-button type="danger" @click="handleDelete">删除商品</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminProductStore } from '@/stores/adminProduct'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useAdminProductStore()
const productId = ref(null)
const product = ref(null)

// 初始化加载数据
onMounted(async () => {
  productId.value = route.params.id
  await store.fetchProductDetail(productId.value)
  product.value = store.currentProduct
})

// 返回列表
const goBack = () => {
  router.push({ name: 'AdminProducts' })
}

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case 1: return 'success'
    case 3: return 'danger'
    default: return 'info'
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
      { type: 'error', confirmButtonText: '确认删除' }
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

// 编辑商品
const handleEdit = () => {
  // 预留编辑功能入口
  ElMessage.info('编辑功能开发中')
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

.action-bar {
  margin-top: 30px;
  text-align: right;
  
  .el-button {
    margin-left: 15px;
  }
}
</style>
