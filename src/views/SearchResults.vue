<template>
  <div class="search-results">
    <div class="search-header">
      <h1 class="search-title">搜索结果: "{{ keyword }}"</h1>
      <p v-if="total > 0" class="search-count">找到 {{ total }} 个相关商品</p>
      <p v-else-if="!loading" class="search-empty">未找到相关商品，请尝试其他关键词</p>
    </div>
    
    <product-list ref="productListRef" :is-search-result="true" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductList from '@/views/ProductList.vue'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const productStore = useProductStore()
const productListRef = ref(null)

// 搜索关键词
const keyword = computed(() => route.query.keyword || '')

// 搜索结果数量
const total = computed(() => productStore.productPagination.total || 0)

// 加载状态
const loading = computed(() => productStore.loading)

// 监听搜索关键词变化
watch(
  () => keyword.value,
  (newKeyword) => {
    // 更新页面标题
    document.title = `搜索: ${newKeyword} - 二手交易平台`
  },
  { immediate: true }
)

onMounted(() => {
  document.title = `搜索: ${keyword.value} - 二手交易平台`
})
</script>

<style scoped>
.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 15px;
}

.search-header {
  margin-bottom: 20px;
}

.search-title {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.search-count {
  color: #606266;
  margin: 0;
}

.search-empty {
  color: #909399;
  margin: 0;
}
</style>