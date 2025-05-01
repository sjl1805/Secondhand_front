<template>
  <div class="address-container">
    <div class="page-header">
      <h2 class="page-title">地址管理</h2>
      <el-button type="primary" @click="openAddressDialog()">添加新地址</el-button>
    </div>

    <div class="address-list" v-loading="addressStore.loading">
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
                <el-tag v-if="item.tag" size="small" type="info" class="address-tag">{{ item.tag }}</el-tag>
              </div>
              <div class="address-detail">
                {{ formatAddress(item) }}
                <span v-if="item.postcode" class="address-postcode">邮编: {{ item.postcode }}</span>
              </div>
              <div class="address-update-time" v-if="item.updateTime">
                更新时间: {{ formatDateTime(item.updateTime) }}
              </div>
            </div>
            <div class="address-actions">
              <el-button type="primary" link @click="openAddressDialog(item)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="confirmDelete(item.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
              <el-button 
                v-if="!item.isDefault" 
                type="success" 
                link 
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
      width="500px"
      destroy-on-close
    >
      <el-form 
        ref="addressFormRef" 
        :model="addressForm" 
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="receiverPhone">
          <el-input v-model="addressForm.receiverPhone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="selectedRegion"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            @change="handleRegionChange"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input 
            v-model="addressForm.addressDetail" 
            type="textarea" 
            placeholder="街道、小区、门牌号等" 
            rows="3"
          />
        </el-form-item>
        
        <el-form-item label="邮政编码" prop="postcode">
          <el-input v-model="addressForm.postcode" placeholder="请输入6位邮政编码" />
        </el-form-item>
        
        <el-form-item label="地址标签">
          <el-select v-model="addressForm.tag" placeholder="选择标签" allow-create filterable>
            <el-option
              v-for="tag in addressTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddress" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAddressStore } from '@/stores/address'
import { Edit, Delete } from '@element-plus/icons-vue'
import regionData from '@/utils/region-data'
import { formatDateTime } from '@/utils/format'

// 初始化地址 store
const addressStore = useAddressStore()

// 表单相关
const addressFormRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('添加地址')
const submitting = ref(false)
const isEdit = ref(false)
const selectedRegion = ref([])

// 表单数据
const addressForm = reactive({
  id: null,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  addressDetail: '',
  postcode: '',
  tag: '',
  isDefault: false
})

// 表单验证规则
const rules = {
  receiverName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  addressDetail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '详细地址长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  postcode: [
    { pattern: /^\d{6}$/, message: '请输入正确的邮政编码', trigger: 'blur' }
  ]
}

// 地区选项
const regionOptions = ref(regionData)

// 预设地址标签
const addressTags = ref(['家', '公司', '学校', '其他'])

// 处理地区变更
const handleRegionChange = (value) => {
  if (value && value.length === 3) {
    addressForm.province = value[0]
    addressForm.city = value[1]
    addressForm.district = value[2]
  }
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
    
    // 设置地区级联选择器的值
    selectedRegion.value = [
      addressForm.province,
      addressForm.city,
      addressForm.district
    ]
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
  
  // 重置地区选择
  selectedRegion.value = []
  
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
    
    // 检查地区选择
    if (!addressForm.province || !addressForm.city || !addressForm.district) {
      ElMessage.warning('请选择完整的地区信息')
      return
    }
    
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
  
  return `${address.province} ${address.city} ${address.district} ${address.addressDetail}`
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

.address-tag {
  margin-left: 5px;
}

.address-postcode {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}
</style>