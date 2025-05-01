<template>
  <div class="orders-container">
    <!-- 搜索过滤 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.orderNo"
        placeholder="订单编号"
        class="filter-item"
        style="width: 200px"
        clearable
        @keyup.enter="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="订单状态"
        clearable
        class="filter-item"
        style="width: 120px"
      >
        <el-option
          v-for="item in store.orderStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-date-picker
        v-model="listQuery.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
        style="width: 250px"
      />
      <el-button
        type="primary"
        class="filter-item"
        @click="handleFilter"
      >
        搜索
      </el-button>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedOrders.length" class="batch-actions">
      <el-dropdown>
        <el-button type="primary">
          批量操作（已选{{ selectedOrders.length }}项）<i class="el-icon-arrow-down" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="batchUpdateStatus(2)">设为待发货</el-dropdown-item>
            <el-dropdown-item @click="batchUpdateStatus(3)">设为待收货</el-dropdown-item>
            <el-dropdown-item @click="batchUpdateStatus(4)">设为已完成</el-dropdown-item>
            <el-dropdown-item divided @click="batchDelete">批量删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 订单表格 -->
    <el-table
      v-loading="store.loading"
      :data="store.orderList"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" prop="orderNo" width="180" />
      <el-table-column label="商品信息" min-width="200">
        <template #default="{ row }">
          <div class="product-info">
            <el-image 
              :src="fileStore.getFullUrl(row.productImage)"
              fit="cover"
              class="product-image"
            />
            <div class="product-detail">
              <div class="product-title">{{ row.productTitle }}</div>
              <div class="product-price">¥{{ row.price }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="买家" width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :src="fileStore.getFullUrl(row.buyerAvatar)" size="small" />
            <span>{{ row.buyerNickname || '--' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总金额" width="120" align="center">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">
            {{ store.getOrderStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row.id)">详情</el-button>
          <el-dropdown trigger="click">
            <el-button size="small" type="primary">
              更多<i class="el-icon-arrow-down" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="changeStatus(row, 2)">设为待发货</el-dropdown-item>
                <el-dropdown-item @click="changeStatus(row, 3)">设为待收货</el-dropdown-item>
                <el-dropdown-item @click="changeStatus(row, 4)">设为已完成</el-dropdown-item>
                <el-dropdown-item divided @click="deleteOrder(row.id)">
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
import { useAdminOrderStore } from '@/stores/adminOrder'
import { useFileStore } from '@/stores/file'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const store = useAdminOrderStore()
const fileStore = useFileStore()

const listQuery = ref({
  orderNo: '',
  status: null,
  dateRange: []
})
const selectedOrders = ref([])

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case 1: return 'warning'  // 待付款
    case 2: return 'info'     // 待发货
    case 3: return ''         // 待收货
    case 4: return 'success'  // 已完成
    case 5: return 'danger'   // 已取消
    default: return 'info'
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 初始化加载
onMounted(() => {
  store.setAdminRole(true)
  store.fetchOrderList()
})

// 搜索过滤
const handleFilter = () => {
  const params = {
    ...listQuery.value,
    startTime: listQuery.value.dateRange?.[0] ? dayjs(listQuery.value.dateRange[0]).format('YYYY-MM-DD') : undefined,
    endTime: listQuery.value.dateRange?.[1] ? dayjs(listQuery.value.dateRange[1]).format('YYYY-MM-DD') : undefined
  }
  delete params.dateRange
  store.fetchOrderList(params)
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection.map(item => item.id)
}

// 批量状态更新
const batchUpdateStatus = async (status) => {
  try {
    await store.batchUpdateStatus(selectedOrders.value, status)
    selectedOrders.value = []
  } catch (error) {
    console.error('批量更新状态失败', error)
  }
}

// 批量删除
const batchDelete = async () => {
  try {
    await store.batchRemoveOrder(selectedOrders.value)
    selectedOrders.value = []
  } catch (error) {
    console.error('批量删除失败', error)
  }
}

// 单个订单状态修改
const changeStatus = async (row, status) => {
  try {
    await store.updateOrderStatus(row.id, status)
  } catch (error) {
    console.error('状态更新失败', error)
  }
}

// 查看详情
const viewDetail = (id) => {
  router.push(`/admin/order/${id}`)
}

// 删除单个订单
const deleteOrder = async (id) => {
  try {
    await store.removeOrder(id)
  } catch (error) {
    console.error('删除订单失败', error)
  }
}
</script>

<style scoped>
.orders-container {
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

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 4px;
}

.product-detail {
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-title {
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 1.4;
}

.product-price {
  font-size: 12px;
  color: #f56c6c;
}
</style>
