<template>
  <div class="address-container">
    <div class="page-header">
      <h2 class="page-title">地址管理</h2>
      <el-button type="primary" @click="openAddressDialog()">添加新地址</el-button>
    </div>

    <div v-loading="addressStore.loading" class="address-list">
      <el-empty v-if="addressStore.addressList.length === 0" description="暂无收货地址">
        <el-button type="primary" @click="openAddressDialog()">添加新地址</el-button>
      </el-empty>

      <div v-else class="address-cards">
        <el-card v-for="item in addressStore.addressList" :key="item.id" class="address-card">
          <div class="address-card-content">
            <div class="address-info">
              <div class="address-header">
                <span class="receiver-name">{{ item.receiverName }}</span>
                <span class="receiver-phone">{{ item.receiverPhone }}</span>
                <el-tag v-if="item.isDefault" size="small" type="success">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ formatAddress(item) }}
              </div>
              <div v-if="item.updateTime" class="address-update-time">
                更新时间: {{ formatDateTime(item.updateTime) }}
              </div>
            </div>
            <div class="address-actions">
              <el-button link type="primary" @click="openAddressDialog(item)">
                <el-icon>
                  <Edit/>
                </el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="confirmDelete(item.id)">
                <el-icon>
                  <Delete/>
                </el-icon>
                删除
              </el-button>
              <el-button
                  v-if="!item.isDefault"
                  link
                  type="success"
                  @click="setAsDefault(item.id)"
              >
                设为默认
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        destroy-on-close
        width="500px"
    >
      <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名"/>
        </el-form-item>

        <el-form-item label="手机号码" prop="receiverPhone">
          <el-input v-model="addressForm.receiverPhone" placeholder="请输入手机号码"/>
        </el-form-item>

        <el-form-item label="省份" prop="province">
          <el-input v-model="addressForm.province" placeholder="请输入省份"/>
        </el-form-item>

        <el-form-item label="城市" prop="city">
          <el-input v-model="addressForm.city" placeholder="请输入城市"/>
        </el-form-item>

        <el-form-item label="区/县" prop="district">
          <el-input v-model="addressForm.district" placeholder="请输入区/县"/>
        </el-form-item>

        <el-form-item label="详细地址" prop="detail">
          <el-input
              v-model="addressForm.detail"
              :rows="3"
              placeholder="街道、小区、门牌号等"
              type="textarea"
          />
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button :loading="submitting" type="primary" @click="submitAddress">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useAddressStore} from '@/stores/address'
import {Delete, Edit} from '@element-plus/icons-vue'
import {formatDateTime} from '@/utils/format'

// 初始化地址 store
const addressStore = useAddressStore()

// 表单相关
const addressFormRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('添加地址')
const submitting = ref(false)
const isEdit = ref(false)

// 表单数据
const addressForm = reactive({
  id: null,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

// 表单验证规则
const rules = {
  receiverName: [
    {required: true, message: '请输入收货人姓名', trigger: 'blur'},
    {min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur'}
  ],
  receiverPhone: [
    {required: true, message: '请输入手机号码', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
  ],
  province: [
    {required: true, message: '请输入省份', trigger: 'blur'}
  ],
  city: [
    {required: true, message: '请输入城市', trigger: 'blur'}
  ],
  district: [
    {required: true, message: '请输入区/县', trigger: 'blur'}
  ],
  detail: [
    {required: true, message: '请输入详细地址', trigger: 'blur'},
    {min: 5, max: 100, message: '详细地址长度在 5 到 100 个字符', trigger: 'blur'}
  ]
}

// 打开地址编辑对话框
const openAddressDialog = (address) => {
  resetForm()

  if (address) {
    // 编辑已有地址
    dialogTitle.value = '编辑地址'
    isEdit.value = true

    // 填充表单数据
    Object.keys(addressForm).forEach(key => {
      if (address[key] !== undefined) {
        addressForm[key] = address[key]
      }
    })
  } else {
    // 新增地址
    dialogTitle.value = '添加地址'
    isEdit.value = false

    // 如果没有默认地址，则设置为默认
    if (addressStore.addressList.length === 0) {
      addressForm.isDefault = true
    }
  }

  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  // 重置表单数据
  Object.keys(addressForm).forEach(key => {
    addressForm[key] = key === 'isDefault' ? false : (key === 'id' ? null : '')
  })

  // 重置表单验证状态
  if (addressFormRef.value) {
    addressFormRef.value.resetFields()
  }
}

// 提交地址表单
const submitAddress = async () => {
  if (!addressFormRef.value) return

  try {
    // 表单验证
    await addressFormRef.value.validate()

    submitting.value = true

    if (isEdit.value) {
      // 更新地址
      await addressStore.updateAddressInfo(addressForm)
    } else {
      // 添加地址
      await addressStore.createAddress(addressForm)
    }

    // 关闭对话框
    dialogVisible.value = false
    ElMessage.success(isEdit.value ? '地址更新成功' : '地址添加成功')
  } catch (error) {
    console.error('地址提交失败', error)
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    submitting.value = false
  }
}

// 确认删除地址
const confirmDelete = (id) => {
  ElMessageBox.confirm(
      '确定要删除这个地址吗？',
      '删除地址',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  )
      .then(async () => {
        await addressStore.removeAddress(id)
        ElMessage.success('地址删除成功')
      })
      .catch(() => {
        // 用户取消删除
      })
}

// 设置为默认地址
const setAsDefault = async (id) => {
  try {
    await addressStore.setDefault(id)
    ElMessage.success('默认地址设置成功')
  } catch (error) {
    console.error('设置默认地址失败', error)
  }
}

// 格式化地址显示
const formatAddress = (address) => {
  if (!address) return ''

  return `${address.province} ${address.city} ${address.district} ${address.detail}`
}

// 组件挂载时获取地址列表
onMounted(() => {
  addressStore.fetchAddressList()
})
</script>

<style scoped>
.address-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.address-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.address-card {
  margin-bottom: 0;
  transition: all 0.3s;
}

.address-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.address-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.address-info {
  flex: 1;
}

.address-header {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.receiver-name {
  font-weight: 600;
  font-size: 16px;
  margin-right: 10px;
}

.receiver-phone {
  color: #606266;
}

.address-detail {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 15px;
  word-break: break-all;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.address-actions .el-button {
  padding: 4px 8px;
  margin-left: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.address-update-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>