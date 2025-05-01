<template>
  <div class="pagination-container">
    <el-pagination
      background
      :current-page="current"
      :page-size="size"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="$emit('size-change', $event)"
      @current-change="$emit('change', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  current: {
    type: Number,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

defineEmits(['change', 'size-change'])
</script>

<style scoped>
.pagination-container {
  padding: 20px 0;
  display: flex;
  justify-content: flex-end;
}
</style>
