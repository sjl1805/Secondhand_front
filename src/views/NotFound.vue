<template>
  <h1>页面未找到</h1>
  <el-button type="primary" @click="goBack">返回首页</el-button>
</template>

<script setup>
import {useRouter} from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>

