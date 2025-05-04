<template>
  <div class="checkout-container">
    <el-card class="checkout-card">
      <template #header>
        <div class="page-header">
          <el-page-header title="确认订单" @back="goBack"/>
        </div>
      </template>

      <div v-loading="loading">
        <template v-if="productDetail">
          <!-- 商品信息 -->
          <div class="section product-section">
            <h3 class="section-title">商品信息</h3>
            <div class="product-info">
              <img :src="productDetail.coverImage" alt="商品图片" class="product-image">
              <div class="product-details">
                <h4 class="product-title">{{ productDetail.title }}</h4>
                <p class="product-price">￥{{ productDetail.price.toFixed(2) }}</p>
                <p class="seller-info">
                  卖家: {{ productDetail.sellerName || '用户' + productDetail.sellerId }}
                </p>
              </div>
            </div>
          </div>

          <!-- 收货地址 -->
          <div class="section address-section">
            <div class="section-header">
              <h3 class="section-title">收货地址</h3>
              <el-button :icon="ArrowRight" link type="primary" @click="showAddressDialog">更多地址</el-button>
            </div>

            <div v-if="selectedAddress" class="selected-address-card" @click="showAddressDialog">
              <div class="address-info">
                <div class="address-header">
                  <span class="address-name">{{ selectedAddress.receiverName }}</span>
                  <span class="address-phone">{{ selectedAddress.receiverPhone }}</span>
                  <el-tag v-if="selectedAddress.isDefault === 1" size="small" type="success">默认</el-tag>
                </div>
                <div class="address-detail">{{ getFullAddress(selectedAddress) }}</div>
              </div>
              <el-icon class="address-select-icon">
                <ArrowRight/>
              </el-icon>
            </div>

            <el-empty v-else description="暂无收货地址">
              <el-button type="primary" @click="showAddNewAddressDialog">添加新地址</el-button>
            </el-empty>
          </div>

          <!-- 支付方式 -->
          <div class="section payment-section">
            <h3 class="section-title">支付方式</h3>
            <el-radio-group v-model="paymentMethod">
              <el-radio :label="1">支付宝</el-radio>
              <el-radio :label="2">微信支付</el-radio>
              <el-radio :label="3">银行卡</el-radio>
            </el-radio-group>
          </div>

          <!-- 买家留言 -->
          <div class="section message-section">
            <h3 class="section-title">买家留言</h3>
            <el-input
                v-model="message"
                :rows="2"
                maxlength="100"
                placeholder="选填：对本次交易的说明"
                show-word-limit
                type="textarea"
            />
          </div>

          <!-- 订单金额 -->
          <div class="section total-section">
            <div class="total-row">
              <span>商品金额</span>
              <span class="price">￥{{ productDetail.price.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>运费</span>
              <span class="price">￥{{ shipping.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>实付款</span>
              <span class="total-price">￥{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 提交订单 -->
          <div class="submit-section">
            <el-button :disabled="!canSubmit" type="primary" @click="submitOrder">提交订单</el-button>
          </div>
        </template>

        <el-empty v-else description="商品信息不存在或已下架"/>
      </div>
    </el-card>

    <!-- 地址选择对话框 -->
    <el-dialog v-model="addressDialogVisible" title="选择收货地址" width="500px">
      <el-empty v-if="addressList.length === 0" description="暂无收货地址">
        <el-button type="primary" @click="showAddNewAddressDialog">添加新地址</el-button>
      </el-empty>

      <div v-else class="address-list">
        <div
            v-for="address in addressList"
            :key="address.id"
            :class="{ 'active': selectedAddressId === address.id }"
            class="address-item"
            @click="selectAddress(address)"
        >
          <div class="address-info">
            <div class="address-header">
              <span class="address-name">{{ address.receiverName }}</span>
              <span class="address-phone">{{ address.receiverPhone }}</span>
              <el-tag v-if="address.isDefault === 1" size="small" type="success">默认</el-tag>
            </div>
            <div class="address-detail">{{ getFullAddress(address) }}</div>
          </div>
          <div class="address-actions">
            <el-button link type="primary" @click.stop="editAddress(address)">编辑</el-button>
            <el-button link type="danger" @click.stop="deleteAddress(address)">删除</el-button>
          </div>
        </div>

        <div class="address-footer">
          <el-button type="primary" @click="showAddNewAddressDialog">添加新地址</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑地址对话框 -->
    <el-dialog v-model="addressFormDialogVisible" :title="isEditingAddress ? '编辑地址' : '新增地址'" width="500px">
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressRules" label-width="80px">
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名"/>
        </el-form-item>
        <el-form-item label="手机号码" prop="receiverPhone">
          <el-input v-model="addressForm.receiverPhone" placeholder="请输入手机号码"/>
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
              v-model="addressForm.region"
              :options="regions"
              :props="{ expandTrigger: 'hover' }"
              placeholder="请选择所在地区"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input v-model="addressForm.addressDetail" :rows="2" placeholder="请输入详细地址" type="textarea"/>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认收货地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 支付确认对话框 -->
    <el-dialog v-model="paymentDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" title="支付确认"
               width="450px">
      <div class="payment-confirm">
        <div class="payment-amount">
          <div>支付金额</div>
          <div class="price">￥{{ totalAmount && !isNaN(totalAmount) ? totalAmount.toFixed(2) : '0.00' }}</div>
        </div>

        <div class="payment-method-info">
          支付方式:
          <el-tag size="small">{{ paymentMethodText }}</el-tag>
        </div>

        <div class="payment-qrcode">
          <img :src="orderQrCode || defaultQrCode" alt="支付二维码"/>
          <div class="qrcode-tip">
            <p>订单号: {{ currentOrderNo }}</p>
            <p>请使用{{ paymentMethodText }}扫描二维码完成支付</p>
          </div>
        </div>

        <div class="payment-status-wrapper">
          <el-tag v-if="paymentStatus > 0"
                  :type="paymentStatus === 2 ? 'success' : paymentStatus === 3 ? 'danger' : 'info'"
                  class="payment-status-tag"
                  size="large">
            {{ paymentStatusText }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="paymentStatus === 1" @click="cancelPayment">取消支付</el-button>
          <el-button :disabled="paymentStatus === 2 || paymentStatus === 3" :loading="paymentStatus === 1"
                     type="primary"
                     @click="confirmPayment">
            {{ paymentStatus === 0 ? '确认支付' : '查询支付状态' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useProductStore} from '@/stores/product'
import {useOrderStore} from '@/stores/order'
import {useAddressStore} from '@/stores/address'
import {useUserStore} from '@/stores/user'
import {ElMessage, ElMessageBox} from 'element-plus'
import {ArrowRight} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()
const userStore = useUserStore()

// 商品ID从路由参数获取
const productId = computed(() => Number(route.params.id))

// 状态
const loading = ref(false)
const productDetail = ref(null)
const addressDialogVisible = ref(false)
const addressFormDialogVisible = ref(false)
const paymentDialogVisible = ref(false)
const paymentStatus = ref(0) // 0-未支付 1-支付中 2-支付成功 3-支付失败
const isEditingAddress = ref(false)
const addressList = ref([])
const selectedAddressId = ref(null)
const paymentMethod = ref(1)
const message = ref('')
const shipping = ref(0) // 运费
const currentOrderId = ref(null) // 当前订单ID
const currentOrderNo = ref('') // 当前订单编号
const orderQrCode = ref('') // 订单支付二维码

// 默认二维码Base64编码（简单的QR码）
const defaultQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAVFSURBVHic7dzRbdswFIZRI5mgG7SDbtJ9O0k36QbdpCN0hI6gBUpABmLYz0l4DkDkJYjEBz8hUjbw8vLvDMDHftr9BICnJhAgCARIBAIkAgESgQCJQIBEIEAiECARCJAIBEgEAiQCAZLXoz/g5eXljz/n+/v7tPc6es+j9zzy3P/rzp+fv29//rzf/L39+Nm8l1//L7vnkcfv3bvTs3n9tX358V4QIBEIkAgESAQCJAIBEoEAiUCAZPo+yCPZsxizndZ1n7Ur45m93P97vSBAIhAgEQiQCARIBAIkAgESgQCJfZCTvdHZrbP3Kc7eJ9jLCwIkAgESgQCJQIBEIEAiECARCJDYB9nAvszZVthPedu91nv2LQQBEoEAiUCAZIsgnvGc4+hrz+zZs3/Oe8+j99n767CTFwRIBAIkAgESgQCJQIBEIEAiECDZYh/EMT8wjxcESAQCJAIBEoEAiUCAZPoq1tEVh7NXLaxGjLHitWfv5+w73hcefX8vCJAIBEgEAiQCARKBAIlAgEQgQDJ9H+SzR+2tWHU5em5Hfc7r7+cFARKBAIlAgEQgQCIQIBEIkAgESLbYB3mmfYx73Ptzzz7Hd/T9n/m7W80LAiQCARKBAIlAgEQgQCIQIBEIkGzxfJBn8sx7MUcdfb7KCp/zs3+WHbwgQCIQIBEIkAgESAQCJAIBki1WsWasJKywYuXl7NWWHSsf9z6/u78DXhAgEQiQCARIBAIkAgESgQCJQIBk+j7I7COAn9mKYz9GuOsYntn8f/GCAIlAgEQgQCIQIBEIkAgESAQCJE+/D3Lvvshnjx4DMuPcjj7z+3t6QYBEIEAiECARCJAIBEgEAiQCARLHnBxk9nEhM85txT7DCl4QIBEIkAgESAQCJAIBEoEAiUCA5On3QXZ45nNZsS9z9P283zwcLwiQCARIBAIkAgESgQCJQIBk+irW7KNXjh71MuPs1YoVR8TM/vrtWBmawQsCJAIBEgEAiUCAZIsgnvGc4+hrz+zZs3/Oe8+j99n767CTFwRIBAIkAgESgQCJQIBEIEAiECDZYh/EMT8wjxcESAQCJAIBEoEAiUCAZPoq1tEVh7NXLaxGjLHitWfv5+w73hcefX8vCJAIBEgEAiQCARKBAIlAgEQgQPIL9+6rqDLM+VsAAAAASUVORK5CYII='

// 计算属性
const selectedAddress = computed(() => {
  if (!selectedAddressId.value) return null
  return addressList.value.find(address => address.id === selectedAddressId.value)
})

const totalAmount = computed(() => {
  if (!productDetail.value) return 0
  return productDetail.value.price + shipping.value
})

const canSubmit = computed(() => {
  return productDetail.value && selectedAddress.value
})

const paymentMethodText = computed(() => {
  const map = {
    1: '支付宝',
    2: '微信',
    3: '银行卡'
  }
  return map[paymentMethod.value] || '支付宝'
})

// 支付状态文本
const paymentStatusText = computed(() => {
  const map = {
    0: '未支付',
    1: '支付处理中',
    2: '支付成功',
    3: '支付失败'
  }
  return map[paymentStatus.value] || '未支付'
})

// 地址表单
const addressFormRef = ref(null)
const addressForm = ref({
  id: null,
  receiverName: '',
  receiverPhone: '',
  region: [],
  addressDetail: '',
  isDefault: false
})

// 表单验证规则
const addressRules = {
  receiverName: [
    {required: true, message: '请输入收货人姓名', trigger: 'blur'},
    {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
  ],
  receiverPhone: [
    {required: true, message: '请输入手机号码', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
  ],
  region: [
    {required: true, message: '请选择所在地区', trigger: 'change'}
  ],
  addressDetail: [
    {required: true, message: '请输入详细地址', trigger: 'blur'},
    {min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur'}
  ]
}

// 省市区数据（简化版示例）
const regions = [
  {
    value: '上海',
    label: '上海',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          {value: '黄浦区', label: '黄浦区'},
          {value: '徐汇区', label: '徐汇区'},
          {value: '长宁区', label: '长宁区'},
          {value: '静安区', label: '静安区'},
          {value: '普陀区', label: '普陀区'},
          {value: '虹口区', label: '虹口区'},
          {value: '杨浦区', label: '杨浦区'},
          {value: '浦东新区', label: '浦东新区'}
        ]
      }
    ]
  },
  {
    value: '北京',
    label: '北京',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          {value: '东城区', label: '东城区'},
          {value: '西城区', label: '西城区'},
          {value: '朝阳区', label: '朝阳区'},
          {value: '海淀区', label: '海淀区'},
          {value: '丰台区', label: '丰台区'}
        ]
      }
    ]
  },
  {
    value: '广东',
    label: '广东',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          {value: '荔湾区', label: '荔湾区'},
          {value: '越秀区', label: '越秀区'},
          {value: '海珠区', label: '海珠区'},
          {value: '天河区', label: '天河区'},
          {value: '白云区', label: '白云区'}
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          {value: '福田区', label: '福田区'},
          {value: '罗湖区', label: '罗湖区'},
          {value: '南山区', label: '南山区'},
          {value: '宝安区', label: '宝安区'},
          {value: '龙岗区', label: '龙岗区'}
        ]
      }
    ]
  }
]

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true
  try {
    const data = await productStore.fetchProductDetail(productId.value)
    if (data) {
      productDetail.value = data
    } else {
      ElMessage.error('商品不存在或已下架')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 获取用户地址列表
const fetchAddressList = async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    console.log('用户未登录，无法获取地址列表')
    return
  }

  loading.value = true
  try {
    await addressStore.fetchAddressList()
    addressList.value = addressStore.addressList || []

    // 处理后端返回的地址数据中的isDefault字段
    addressList.value = addressList.value.map(address => {
      // 如果isDefault是数字类型，保留原值
      // 如果是布尔值，则转换为数字
      if (typeof address.isDefault === 'boolean') {
        return {
          ...address,
          isDefault: address.isDefault ? 1 : 0
        }
      }
      return address
    })

    // 调试输出
    console.log('处理后的地址列表:', addressList.value)

    // 如果有默认地址，自动选择
    const defaultAddress = addressList.value.find(addr => addr.isDefault === 1)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id
    } else if (addressList.value.length > 0) {
      // 否则选择第一个地址
      selectedAddressId.value = addressList.value[0].id
    }

    console.log('选中的地址ID:', selectedAddressId.value)
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 显示地址选择对话框
const showAddressDialog = () => {
  addressDialogVisible.value = true
}

// 显示新增地址对话框
const showAddNewAddressDialog = () => {
  isEditingAddress.value = false
  addressForm.value = {
    id: null,
    receiverName: '',
    receiverPhone: '',
    region: [],
    addressDetail: '',
    isDefault: false
  }
  addressDialogVisible.value = false
  addressFormDialogVisible.value = true
}

// 编辑地址
const editAddress = (address) => {
  isEditingAddress.value = true

  console.log('编辑地址数据:', address)

  // 处理省市区信息
  let region = []
  if (address.province && address.city && address.district) {
    region = [address.province, address.city, address.district]
  } else if (address.region && Array.isArray(address.region)) {
    region = address.region
  } else if (address.regionStr) {
    region = address.regionStr.split(' ')
  }

  addressForm.value = {
    id: address.id,
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    region: region,
    addressDetail: address.detail || address.addressDetail || '',
    isDefault: address.isDefault === 1
  }

  console.log('处理后的地址表单:', addressForm.value)

  addressDialogVisible.value = false
  addressFormDialogVisible.value = true
}

// 删除地址
const deleteAddress = async (address) => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }

  try {
    const result = await ElMessageBox.confirm(
        '确定要删除这个地址吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    if (result) {
      loading.value = true
      try {
        console.log('删除地址ID:', address.id)
        const result = await addressStore.removeAddress(address.id)
        console.log('删除地址结果:', result)

        const success = result !== undefined && result !== null

        if (success) {
          ElMessage.success('地址删除成功')
          await fetchAddressList()

          // 如果删除的是当前选中的地址，重置选择
          if (selectedAddressId.value === address.id) {
            selectedAddressId.value = addressList.value.length > 0 ? addressList.value[0].id : null
          }
        } else {
          ElMessage.error('地址删除失败')
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        ElMessage.error('删除地址失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }
  } catch (error) {
    console.log('用户取消了删除操作')
  }
}

// 选择地址
const selectAddress = (address) => {
  selectedAddressId.value = address.id
  addressDialogVisible.value = false
}

// 保存地址
const saveAddress = async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }

  if (!addressFormRef.value) return

  await addressFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 将省市区数组转换为字符串
        const regionStr = addressForm.value.region.join(' ')

        // 提取省市区信息
        const [province = '', city = '', district = ''] = addressForm.value.region

        const addressData = {
          ...addressForm.value,
          regionStr,
          province,
          city,
          district,
          detail: addressForm.value.addressDetail,
          // 确保isDefault是数值类型
          isDefault: addressForm.value.isDefault ? 1 : 0
        }

        console.log('保存地址数据:', addressData)

        let result
        if (isEditingAddress.value) {
          // 更新地址
          result = await addressStore.updateAddressInfo(addressData)
        } else {
          // 新增地址
          result = await addressStore.createAddress(addressData)
        }

        console.log('保存地址结果:', result)

        const success = result !== undefined && result !== null

        if (success) {
          ElMessage.success(isEditingAddress.value ? '地址更新成功' : '地址添加成功')
          addressFormDialogVisible.value = false
          await fetchAddressList()
        } else {
          ElMessage.error(isEditingAddress.value ? '地址更新失败' : '地址添加失败')
        }
      } catch (error) {
        console.error('保存地址失败:', error)
        ElMessage.error('保存地址失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.warning('请填写完整的地址信息')
    }
  })
}

// 获取完整地址字符串
const getFullAddress = (address) => {
  if (!address) return ''

  // 根据后端返回的数据结构处理
  if (address.province && address.city && address.district) {
    return `${address.province} ${address.city} ${address.district} ${address.detail}`
  }

  // 兼容之前的格式
  let regionStr = ''
  if (address.region && Array.isArray(address.region)) {
    regionStr = address.region.join(' ')
  } else if (address.regionStr) {
    regionStr = address.regionStr
  }

  return `${regionStr} ${address.addressDetail || address.detail || ''}`
}

// 提交订单
const submitOrder = async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }

  // 检查是否选择了收货地址
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  // 确认用户是否提交订单
  try {
    await ElMessageBox.confirm('确认提交订单?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    try {
      // 构建订单数据
      const orderData = {
        productId: productDetail.value.id,
        addressId: selectedAddress.value.id,
        message: message.value || '',
        quantity: 1,  // 默认购买数量为1
        price: productDetail.value.price  // 添加价格字段
      }

      // 创建订单
      const orderResult = await orderStore.submitOrder(orderData)

      if (orderResult && orderResult.id) {
        // 保存订单ID到本地变量
        currentOrderId.value = orderResult.id

        // 生成订单编号（使用时间戳+订单ID）
        currentOrderNo.value = `ORDER${new Date().getTime()}${orderResult.id}`

        console.log('订单创建成功，ID:', currentOrderId.value, '编号:', currentOrderNo.value)

        // 生成支付二维码
        try {
          const qrCode = await orderStore.generateOrderQrCode(
              currentOrderId.value,
              paymentMethod.value,
              totalAmount.value
          )

          if (qrCode) {
            orderQrCode.value = qrCode
            console.log('支付二维码生成成功')
          }
        } catch (error) {
          console.error('生成支付二维码失败:', error)
        }

        // 显示支付对话框
        paymentDialogVisible.value = true
      } else {
        ElMessage.error('订单创建失败：返回的订单数据无效')
        console.error('订单创建失败：无效的订单数据', orderResult)
      }
    } catch (error) {
      console.error('提交订单失败:', error)
      ElMessage.error('提交订单失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  } catch (error) {
    console.log('用户取消了订单提交')
  }
}

// 确认支付
const confirmPayment = async () => {
  // 如果已经支付成功或失败，直接关闭对话框
  if (paymentStatus.value === 2) {
    paymentDialogVisible.value = false
    router.push(`/user/order/${currentOrderId.value}`)
    return
  }

  if (paymentStatus.value === 3) {
    paymentDialogVisible.value = false
    router.push('/user/orders')
    return
  }

  // 如果当前已有订单ID，说明是查询支付状态
  if (currentOrderId.value && paymentStatus.value === 1) {
    await checkPaymentStatus()
    return
  }

  // 检查订单ID是否存在
  if (!currentOrderId.value) {
    console.error('支付失败: 订单ID不存在')
    ElMessage.error('订单ID不存在，请重新提交订单')
    paymentDialogVisible.value = false
    return
  }

  // 创建订单并支付
  paymentStatus.value = 1 // 设置为支付中
  loading.value = true

  try {
    // 确保totalAmount是有效数字
    const amount = totalAmount.value && !isNaN(totalAmount.value) ? Number(totalAmount.value) : 0

    // 构建支付数据
    const paymentData = {
      amount: amount,
      paymentMethod: paymentMethod.value,
      message: message.value || '',
      orderNo: currentOrderNo.value // 添加订单编号
    }

    console.log('支付订单ID:', currentOrderId.value, '类型:', typeof currentOrderId.value)
    console.log('支付数据:', paymentData)

    // 调用支付API
    const paymentResult = await orderStore.submitPayment(currentOrderId.value, paymentData)

    if (paymentResult) {
      paymentStatus.value = 2 // 支付成功
      ElMessage.success('支付成功！')

      // 3秒后自动跳转
      setTimeout(() => {
        paymentDialogVisible.value = false
        router.push(`/user/order/${currentOrderId.value}`)
      }, 3000)
    } else {
      paymentStatus.value = 3 // 支付失败
      ElMessage.error('支付失败，请到订单中心重新支付')
    }
  } catch (error) {
    console.error('支付失败:', error)
    paymentStatus.value = 3 // 支付失败
    ElMessage.error('支付失败，请重试')
  } finally {
    loading.value = false
  }
}

// 查询支付状态
const checkPaymentStatus = async () => {
  if (!currentOrderId.value) return

  paymentStatus.value = 1 // 查询中
  loading.value = true

  try {
    const result = await orderStore.checkPaymentStatus(currentOrderId.value)

    if (result) {
      if (result.paymentStatus === 2) { // 支付成功
        paymentStatus.value = 2
        ElMessage.success('支付已完成！')

        // 3秒后自动跳转
        setTimeout(() => {
          paymentDialogVisible.value = false
          router.push(`/user/order/${currentOrderId.value}`)
        }, 3000)
      } else if (result.paymentStatus === 3) { // 支付失败
        paymentStatus.value = 3
        ElMessage.error('支付失败，请重新支付')
      } else { // 支付中
        paymentStatus.value = 1
        ElMessage.info('支付处理中，请稍候...')
      }
    } else {
      paymentStatus.value = 0
      ElMessage.warning('查询支付状态失败，请重试')
    }
  } catch (error) {
    console.error('查询支付状态失败:', error)
    paymentStatus.value = 0
    ElMessage.error('查询支付状态失败')
  } finally {
    loading.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  // 如果支付中，不允许取消
  if (paymentStatus.value === 1) return

  paymentDialogVisible.value = false
  ElMessage.info('已取消支付')

  // 重置支付状态
  paymentStatus.value = 0
  currentOrderId.value = null
  currentOrderNo.value = ''
  orderQrCode.value = ''

  // 跳转回商品详情页
  if (productDetail.value && productDetail.value.id) {
    router.push(`/product/${productDetail.value.id}`)
  } else if (productId.value) {
    router.push(`/product/${productId.value}`)
  } else {
    // 如果获取不到产品ID，则返回首页
    router.push('/')
  }
}

onMounted(async () => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }

  // 加载商品详情
  await fetchProductDetail()

  // 加载用户地址列表
  await fetchAddressList()
})

// 组件卸载前清理状态
onBeforeUnmount(() => {
  // 重置支付状态
  paymentStatus.value = 0
  currentOrderId.value = null
  currentOrderNo.value = ''
  orderQrCode.value = ''
})
</script>

<style scoped>
.checkout-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.checkout-card {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  margin: 0 0 15px;
  font-size: 16px;
  color: #303133;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* 商品信息 */
.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.4;
  color: #303133;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.seller-info {
  color: #909399;
  font-size: 14px;
  margin: 5px 0;
}

/* 地址信息 */
.address-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.address-info:hover {
  border-color: #409eff;
}

.address-content {
  flex: 1;
}

.address-name {
  font-weight: bold;
  margin: 0 0 5px;
}

.address-detail {
  color: #606266;
  margin: 0;
}

/* 地址列表 */
.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.address-item.active {
  border-color: var(--el-color-primary);
  background-color: rgba(var(--el-color-primary-rgb), 0.05);
}

.address-info {
  flex: 1;
}

.address-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.address-name {
  font-weight: bold;
  font-size: 16px;
  margin-right: 8px;
}

.address-phone {
  color: #606266;
  margin-right: 8px;
}

.address-detail {
  color: #606266;
  line-height: 1.5;
  font-size: 14px;
}

.address-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-footer {
  margin-top: 20px;
  text-align: center;
}

/* 订单金额 */
.total-section {
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

/* 提交按钮 */
.submit-section {
  margin-top: 30px;
  text-align: center;
}

/* 支付确认 */
.payment-confirm {
  text-align: center;
  padding: 20px 0;
}

.payment-amount {
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
}

.payment-amount .price {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: bold;
}

.payment-method-info {
  margin-bottom: 20px;
  text-align: center;
}

.payment-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  max-width: 250px;
  text-align: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.payment-qrcode img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.qrcode-tip p {
  margin: 4px 0;
}

.payment-status-wrapper {
  margin-top: 20px;
  text-align: center;
}

.payment-status-tag {
  font-size: 20px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
  }

  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-bottom: 10px;
    margin-right: 0;
  }

  .address-item {
    flex-direction: column;
  }

  .address-actions {
    margin-top: 10px;
    justify-content: flex-end;
  }
}

.selected-address-card {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-address-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.address-select-icon {
  color: #c0c4cc;
  font-size: 18px;
}
</style> 