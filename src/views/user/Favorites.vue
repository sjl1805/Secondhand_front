<template>
  <div class="favorites-container">
    <h2 class="page-title">我的收藏</h2>

    <div class="favorites-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated/>
      </div>

      <div v-else-if="favoriteList.length === 0" class="empty-container">
        <el-empty description="暂无收藏"/>
        <el-button type="primary" @click="goToProductList">去逛逛</el-button>
      </div>

      <div v-else class="favorites-list">
        <el-card v-for="item in favoriteList" :key="item.id" class="favorite-item">
          <div class="favorite-info">
            <div class="product-image" @click="goToProductDetail(item.id)">
              <el-image
                  :preview-src-list="item.imageUrls ? item.imageUrls.map(img => fileStore.getFullUrl(img)) : []"
                  :src="item.imageUrls && item.imageUrls.length > 0 ? fileStore.getFullUrl(item.imageUrls[0]) : defaultImage"
                  fit="cover"
              />
            </div>

            <div class="product-info">
              <h3 class="product-title" @click="goToProductDetail(item.id)">
                {{ item.title || '商品信息不可用' }}
              </h3>

              <div class="product-price">
                <span class="current-price">¥{{ item.price || '--' }}</span>
              </div>

              <div class="product-meta">
                <span class="publish-time">发布于：{{ formatTime(item.createTime) }}</span>
                <span v-if="item.status === 0" class="sold-tag">已售出</span>
                <span v-else-if="item.status === 2" class="off-shelf-tag">已下架</span>
              </div>

              <div class="product-seller">
                <span>卖家：{{ item.nickname || '--' }}</span>
              </div>

              <div class="product-stat">
                <span>浏览量：{{ item.viewCount || 0 }}</span>
                <span>收藏数：{{ item.favoriteCount || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="favorite-actions">
            <el-button
                :disabled="item.status !== 1"
                size="small"
                type="primary"
                @click="goToProductDetail(item.id)"
            >
              查看详情
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleRemoveFavorite(item.id)"
            >
              取消收藏
            </el-button>
          </div>
        </el-card>

        <div class="pagination-container">
          <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 30, 50]"
              :total="pagination.total"
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
import {computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useFavoriteStore} from '@/stores/favorite'
import {useFileStore} from '@/stores/file'
import {formatDateTime} from '@/utils/format'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const fileStore = useFileStore()

// 默认图片
const defaultImage = '/src/assets/default-product.png'

// 获取状态数据
const loading = computed(() => favoriteStore.loading)
const favoriteList = computed(() => favoriteStore.favoriteList)
const pagination = computed(() => favoriteStore.pagination)

// 格式化时间
const formatTime = (time) => {
  return formatDateTime(time)
}

// 跳转到商品详情
const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 跳转到商品列表
const goToProductList = () => {
  router.push('/products')
}

// 处理移除收藏
const handleRemoveFavorite = (productId) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await favoriteStore.removeFromFavorite(productId)
    if (result) {
      ElMessage.success('取消收藏成功')
    }
  }).catch(() => {
  })
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  favoriteStore.changePageSize(size)
}

// 处理页码变化
const handleCurrentChange = (page) => {
  favoriteStore.changePage(page)
}

// 组件挂载时获取收藏列表
onMounted(() => {
  favoriteStore.fetchFavoriteList()
})
</script>

<style scoped>
.favorites-container {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
}

.favorites-content {
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

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.favorite-item {
  display: flex;
  flex-direction: column;
  position: relative;
}

.favorite-info {
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

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-title {
  font-size: 16px;
  margin: 0;
  color: #303133;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-title:hover {
  color: #409eff;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #909399;
  font-size: 12px;
}

.sold-tag, .off-shelf-tag {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.sold-tag {
  background-color: #e6a23c;
  color: #fff;
}

.off-shelf-tag {
  background-color: #909399;
  color: #fff;
}

.product-seller {
  font-size: 13px;
  color: #606266;
}

.product-stat {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.favorite-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .favorite-info {
    flex-direction: column;
  }

  .product-image {
    width: 100%;
    height: 180px;
  }

  .product-info {
    padding: 10px 0;
  }

  .favorite-actions {
    justify-content: space-between;
  }
}
</style> 