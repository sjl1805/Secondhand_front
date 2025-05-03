<template>
  <div class="products-container">
    <!-- 搜索过滤 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索商品名称"
        class="filter-item"
        style="width: 200px"
        clearable
        @keyup.enter="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="商品状态"
        clearable
        class="filter-item"
        style="width: 120px"
      >
        <el-option
          v-for="item in store.productStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        type="primary"
        class="filter-item"
        @click="handleFilter"
      >
        搜索
      </el-button>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedProducts.length" class="batch-actions">
      <el-dropdown>
        <el-button type="primary">
          批量操作（已选{{ selectedProducts.length }}项）<i class="el-icon-arrow-down" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="batchUpdateStatus(1)">设为在售</el-dropdown-item>
            <el-dropdown-item @click="batchUpdateStatus(3)">设为下架</el-dropdown-item>
            <el-dropdown-item divided @click="batchDelete">批量删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 商品表格 -->
    <el-table
      v-loading="store.loading"
      :data="store.productList"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="商品图片" width="120" align="center">
        <template #default="{ row }">
          <el-image 
            :src="fileStore.getFullUrl(row.imageUrls?.[0])"
            :preview-src-list="row.imageUrls?.map(url => fileStore.getFullUrl(url))"
            fit="cover"
            class="product-image"
            :hide-on-click-modal="true"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="title" min-width="180" />
      <el-table-column label="卖家" width="120">
        <template #default="{ row }">
          <div class="seller-info">
            <el-avatar 
              :size="'small'" 
              :src="row.avatar ? fileStore.getFullUrl(row.avatar) : ''"
              @error="() => handleAvatarError(row)"
            />
            <span class="seller-name">{{ row.nickname || `用户${row.userId}` }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="categoryName" width="90" align="center" />
      <el-table-column label="价格" prop="price" width="90" align="center">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column label="成色" width="90" align="center">
        <template #default="{ row }">
          {{ getProductQualityText(row.productQuality) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">
            {{ store.getProductStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row.id)">详情</el-button>
          <el-dropdown trigger="click">
            <el-button size="small" type="primary">
              更多<i class="el-icon-arrow-down" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="changeStatus(row, 1)">设为在售</el-dropdown-item>
                <el-dropdown-item @click="changeStatus(row, 3)">设为下架</el-dropdown-item>
                <el-dropdown-item divided @click="deleteProduct(row.id)">
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-model:current="store.pagination.current"
      v-model:size="store.pagination.size"
      :total="store.pagination.total"
      @change="store.changePage"
      @size-change="store.changePageSize"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminProductStore } from '@/stores/adminProduct'
import { useFileStore } from '@/stores/file'
import { Picture } from '@element-plus/icons-vue'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const store = useAdminProductStore()
const fileStore = useFileStore()
const listQuery = ref({
  keyword: '',
  status: null
})
const selectedProducts = ref([])

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case 1: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

// 初始化加载
onMounted(() => {
  try {
    // 设置并持久化管理员权限
    store.setAdminRole(true)
    // 加载商品列表
    store.fetchProductList()
  } catch (error) {
    console.error('加载商品列表失败', error)
    ElMessage.error('加载商品列表失败，请稍后重试')
  }
})

// 处理头像加载失败
const handleAvatarError = (row) => {
  row.avatar = null
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

// 搜索过滤
const handleFilter = () => {
  store.fetchProductList(listQuery.value)
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection.map(item => item.id)
}

// 批量状态更新
const batchUpdateStatus = async (status) => {
  try {
    await ElMessageBox.confirm(
      `确定要批量修改${selectedProducts.value.length}个商品状态吗？`,
      '确认操作',
      { type: 'warning' }
    )
    await store.batchUpdateStatus(selectedProducts.value, status)
    selectedProducts.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作已取消')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要永久删除${selectedProducts.value.length}个商品吗？`,
      '警告',
      { type: 'error', confirmButtonText: '确认删除' }
    )
    await store.batchRemoveProduct(selectedProducts.value)
    selectedProducts.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作已取消')
    }
  }
}

// 单个商品状态修改
const changeStatus = async (row, status) => {
  try {
    await store.updateProductStatus(row.id, status)
  } catch (error) {
    console.error('状态更新失败', error)
  }
}

// 查看详情
const viewDetail = (id) => {
  // 先检查管理员权限
  if (store.checkAdminRole()) {
    router.push(`/admin/product/${id}`)
  } else {
    ElMessage.error('您没有管理员权限')
  }
}

// 删除单个商品
const deleteProduct = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要永久删除该商品吗？',
      '警告',
      { type: 'error', confirmButtonText: '确认删除' }
    )
    await store.removeProduct(id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作已取消')
    }
  }
}
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  .filter-item {
    margin-right: 10px;
  }
}

.batch-actions {
  margin: 10px 0;
}

.el-table {
  margin-top: 20px;
}
.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.image-error {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seller-name {
  font-size: 13px;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 支持深度选择器修改el-avatar样式 */
:deep(.el-avatar--small) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
</style>
