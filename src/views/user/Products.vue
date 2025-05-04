<template>
  <div class="products-container">
    <h2 class="page-title">我发布的商品</h2>

    <div class="products-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated/>
      </div>

      <div v-else-if="userProducts.length === 0" class="empty-container">
        <el-empty description="您还没有发布任何商品"/>
        <el-button type="primary" @click="goToPublish">发布商品</el-button>
      </div>

      <div v-else>
        <div class="status-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabChange">
            <el-tab-pane label="全部" name="all">
              <el-badge :hidden="userProducts.length === 0" :value="userProducts.length" class="tab-badge"/>
            </el-tab-pane>
            <el-tab-pane label="在售" name="1">
              <el-badge :hidden="productStatusCounts[1] === 0" :value="productStatusCounts[1]" class="tab-badge"/>
            </el-tab-pane>
            <el-tab-pane label="已售" name="2">
              <el-badge :hidden="productStatusCounts[2] === 0" :value="productStatusCounts[2]" class="tab-badge"/>
            </el-tab-pane>
            <el-tab-pane label="已下架" name="3">
              <el-badge :hidden="productStatusCounts[3] === 0" :value="productStatusCounts[3]" class="tab-badge"/>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="products-list">
          <el-card v-for="product in filteredProducts" :key="product.id" class="product-item">
            <div class="product-info">
              <div class="product-image" @click="goToProductDetail(product.id)">
                <el-image
                    :preview-src-list="product.imageUrls ? product.imageUrls.map(img => fileStore.getFullUrl(img)) : []"
                    :src="product.imageUrls && product.imageUrls.length > 0 ? fileStore.getFullUrl(product.imageUrls[0]) : defaultImage"
                    fit="cover"
                />
              </div>

              <div class="product-detail">
                <h3 class="product-title" @click="goToProductDetail(product.id)">
                  {{ product.title }}
                </h3>

                <div class="product-price">
                  <span class="current-price">¥{{ product.price }}</span>
                </div>

                <div class="product-meta">
                  <div class="meta-item">
                    <i class="el-icon-view"></i>
                    <span>浏览 {{ product.viewCount || 0 }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="el-icon-star-on"></i>
                    <span>收藏 {{ product.favoriteCount || 0 }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="el-icon-time"></i>
                    <span>{{ formatTime(product.createTime) }}</span>
                  </div>
                </div>

                <div class="product-status">
                  <el-tag :type="getStatusType(product.status)">{{ productStatusMap[product.status] }}</el-tag>
                </div>
              </div>
            </div>

            <div class="product-actions">
              <el-button
                  size="small"
                  type="primary"
                  @click="goToProductDetail(product.id)"
              >
                查看详情
              </el-button>

              <el-button
                  v-if="product.status === 1 || product.status === 3"
                  size="small"
                  type="success"
                  @click="goToEditProduct(product.id)"
              >
                编辑商品
              </el-button>

              <el-dropdown @command="handleCommand($event, product)">
                <el-button size="small" type="default">
                  更多操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="product.status === 1" command="sold">标记为已售</el-dropdown-item>
                    <el-dropdown-item v-if="product.status === 1" command="offShelf">下架商品</el-dropdown-item>
                    <el-dropdown-item v-if="product.status === 3" command="reOnShelf">重新上架</el-dropdown-item>
                    <el-dropdown-item v-if="product.status === 3" command="delete" divided>删除商品</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-card>
        </div>

        <div class="pagination-container">
          <el-pagination
              v-model:current-page="userProductPagination.current"
              v-model:page-size="userProductPagination.size"
              :page-sizes="[10, 20, 30, 50]"
              :total="userProductPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useProductStore} from '@/stores/product'
import {useFileStore} from '@/stores/file'
import {formatDateTime} from '@/utils/format'

const router = useRouter()
const productStore = useProductStore()
const fileStore = useFileStore()

// 默认图片
const defaultImage = '/src/assets/default-product.png'

// 定义当前选中的标签页
const activeTab = ref('all')

// 获取状态数据
const loading = computed(() => productStore.loading)
const userProducts = computed(() => productStore.userProducts)
const userProductPagination = computed(() => productStore.userProductPagination)
const productStatusMap = computed(() => productStore.productStatusMap)
const productStatusCounts = computed(() => productStore.productStatusCounts)

// 根据选中的标签过滤商品
const filteredProducts = computed(() => {
  if (activeTab.value === 'all') {
    return userProducts.value
  } else {
    return userProducts.value.filter(product => product.status === parseInt(activeTab.value))
  }
})

// 格式化时间
const formatTime = (time) => {
  return formatDateTime(time)
}

// 获取状态对应的类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'success',
    2: 'info',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 处理标签页变化
const handleTabChange = (tab) => {
  // 重新加载数据或者过滤现有数据
  console.log('切换到标签页:', tab.props.name)
}

// 跳转到商品详情
const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 跳转到发布商品页面
const goToPublish = () => {
  router.push('/publish')
}

// 跳转到编辑商品页面
const goToEditProduct = (productId) => {
  router.push(`/user/edit-product/${productId}`)
}

// 处理更多操作命令
const handleCommand = (command, product) => {
  switch (command) {
    case 'sold':
      markAsSold(product)
      break
    case 'offShelf':
      markAsOffShelf(product)
      break
    case 'reOnShelf':
      markAsOnShelf(product)
      break
    case 'delete':
      deleteProduct(product)
      break
  }
}

// 标记为已售
const markAsSold = (product) => {
  ElMessageBox.confirm('确定要将商品标记为已售出吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await productStore.changeProductStatus(product.id, 2)
    if (result) {
      ElMessage.success('商品已标记为已售出')
    }
  }).catch(() => {
  })
}

// 下架商品
const markAsOffShelf = (product) => {
  ElMessageBox.confirm('确定要下架该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await productStore.changeProductStatus(product.id, 3)
    if (result) {
      ElMessage.success('商品已下架')
    }
  }).catch(() => {
  })
}

// 重新上架
const markAsOnShelf = (product) => {
  ElMessageBox.confirm('确定要重新上架该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await productStore.changeProductStatus(product.id, 1)
    if (result) {
      ElMessage.success('商品已重新上架')
    }
  }).catch(() => {
  })
}

// 删除商品
const deleteProduct = (product) => {
  ElMessageBox.confirm('确定要删除该商品吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const result = await productStore.removeProduct(product.id)
    if (result) {
      ElMessage.success('商品已删除')
    }
  }).catch(() => {
  })
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  productStore.changeUserProductPageSize(size)
}

// 处理页码变化
const handleCurrentChange = (page) => {
  productStore.changeUserProductPage(page)
}

// 组件挂载时获取用户商品列表
onMounted(() => {
  productStore.fetchUserProducts()
})
</script>

<style scoped>
.products-container {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
}

.products-content {
  min-height: 400px;
}

.loading-container {
  padding: 20px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.status-tabs {
  margin-bottom: 20px;
}

.tab-badge {
  margin-top: 10px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-item {
  position: relative;
  margin-bottom: 15px;
}

.product-info {
  display: flex;
  gap: 15px;
}

.product-image {
  width: 120px;
  height: 120px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-title {
  margin: 0;
  font-size: 16px;
  cursor: pointer;
  color: #303133;
}

.product-title:hover {
  color: #409EFF;
}

.product-price {
  font-weight: bold;
  color: #f56c6c;
  margin: 5px 0;
}

.current-price {
  font-size: 18px;
}

.product-meta {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-status {
  margin-top: 10px;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 