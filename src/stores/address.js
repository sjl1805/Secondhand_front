import {ref} from 'vue'
import {defineStore} from 'pinia'
import {
    addAddress,
    deleteAddress,
    getAddressDetail,
    getAddressList,
    setDefaultAddress,
    updateAddress
} from '@/api/address'
import {ElMessage} from 'element-plus'

export const useAddressStore = defineStore('address', () => {
    // 状态
    const addressList = ref([])
    const currentAddress = ref(null)
    const loading = ref(false)
    const defaultAddressId = ref(null)

    // 获取地址列表
    const fetchAddressList = async () => {
        loading.value = true
        try {
            const res = await getAddressList()
            if (res.code === 200) {
                // 处理后端返回数据，将isDefault数字类型转为布尔值
                addressList.value = (res.data || []).map(item => ({
                    ...item,
                    isDefault: item.isDefault === 1
                }))

                // 更新默认地址ID
                const defaultAddr = addressList.value.find(item => item.isDefault)
                if (defaultAddr) {
                    defaultAddressId.value = defaultAddr.id
                }
            }
        } catch (error) {
            console.error('获取地址列表失败', error)
            ElMessage.error('获取地址列表失败')
        } finally {
            loading.value = false
        }
    }

    // 获取地址详情
    const fetchAddressDetail = async (id) => {
        try {
            const res = await getAddressDetail(id)
            if (res.code === 200) {
                // 处理isDefault字段
                currentAddress.value = {
                    ...res.data,
                    isDefault: res.data.isDefault === 1
                }
                return currentAddress.value
            }
        } catch (error) {
            console.error('获取地址详情失败', error)
            ElMessage.error('获取地址详情失败')
        }
    }

    // 添加新地址
    const createAddress = async (addressData) => {
        try {
            // 转换isDefault为整数
            const formattedData = {
                ...addressData,
                isDefault: addressData.isDefault ? 1 : 0
            }

            const res = await addAddress(formattedData)
            if (res.code === 200) {
                // 如果新增的是默认地址，更新默认地址ID
                if (addressData.isDefault) {
                    defaultAddressId.value = res.data
                }

                // 刷新地址列表
                await fetchAddressList()

                ElMessage.success('添加地址成功')
                return res.data
            }
        } catch (error) {
            console.error('添加地址失败', error)
            ElMessage.error('添加地址失败')
            throw error
        }
    }

    // 更新地址
    const updateAddressInfo = async (addressData) => {
        try {
            // 转换isDefault为整数
            const formattedData = {
                ...addressData,
                isDefault: addressData.isDefault ? 1 : 0
            }

            const res = await updateAddress(formattedData)
            if (res.code === 200) {
                // 如果更新为默认地址，更新默认地址ID
                if (addressData.isDefault) {
                    defaultAddressId.value = addressData.id
                }

                // 刷新地址列表
                await fetchAddressList()

                ElMessage.success('更新地址成功')
            }
        } catch (error) {
            console.error('更新地址失败', error)
            ElMessage.error('更新地址失败')
            throw error
        }
    }

    // 删除地址
    const removeAddress = async (id) => {
        try {
            const res = await deleteAddress(id)
            if (res.code === 200) {
                // 如果删除的是默认地址，重置默认地址ID
                if (id === defaultAddressId.value) {
                    defaultAddressId.value = null
                }

                // 从列表中删除
                addressList.value = addressList.value.filter(item => item.id !== id)

                ElMessage.success('删除地址成功')
            }
        } catch (error) {
            console.error('删除地址失败', error)
            ElMessage.error('删除地址失败')
            throw error
        }
    }

    // 设置默认地址
    const setDefault = async (id) => {
        try {
            const res = await setDefaultAddress(id)
            if (res.code === 200) {
                // 更新默认地址ID
                defaultAddressId.value = id

                // 更新地址列表中的默认状态
                addressList.value = addressList.value.map(item => ({
                    ...item,
                    isDefault: item.id === id
                }))

                ElMessage.success('设置默认地址成功')
            }
        } catch (error) {
            console.error('设置默认地址失败', error)
            ElMessage.error('设置默认地址失败')
            throw error
        }
    }

    // 获取默认地址
    const getDefaultAddress = () => {
        return addressList.value.find(item => item.isDefault) || null
    }

    return {
        addressList,
        currentAddress,
        loading,
        defaultAddressId,
        fetchAddressList,
        fetchAddressDetail,
        createAddress,
        updateAddressInfo,
        removeAddress,
        setDefault,
        getDefaultAddress
    }
}) 