import {ref} from 'vue'
import {defineStore} from 'pinia'
import {
    deleteAdminUser,
    getAdminList,
    getAdminUserList,
    resetAdminUserPassword,
    updateAdminUserStatus
} from '@/api/adminUser'
import {ElMessage} from 'element-plus'

export const useAdminUserStore = defineStore('adminUser', () => {
    // 状态
    const userList = ref([])
    const adminList = ref([])
    const loading = ref(false)
    const isAdmin = ref(false)
    const pagination = ref({
        current: 1,
        size: 10,
        total: 0
    })

    // 角色映射
    const roleMap = {
        0: '普通用户',
        9: '管理员'
    }

    // 设置管理员权限
    const setAdminRole = (isAdminRole) => {
        isAdmin.value = isAdminRole
    }

    // 获取用户列表
    const fetchUserList = async (params = {}) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            // 合并分页参数
            const queryParams = {
                page: pagination.value.current,
                size: pagination.value.size,
                ...params
            }

            const res = await getAdminUserList(queryParams)
            if (res.code === 200 && res.data) {
                userList.value = res.data.records || []
                pagination.value = {
                    current: res.data.current,
                    size: res.data.size,
                    total: res.data.total
                }
                return res.data
            }
        } catch (error) {
            console.error('获取用户列表失败', error)
            ElMessage.error('获取用户列表失败')
        } finally {
            loading.value = false
        }
    }

    // 获取管理员列表
    const fetchAdminList = async () => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        loading.value = true
        try {
            const res = await getAdminList()
            if (res.code === 200) {
                adminList.value = res.data || []
                return res.data
            }
        } catch (error) {
            console.error('获取管理员列表失败', error)
            ElMessage.error('获取管理员列表失败')
        } finally {
            loading.value = false
        }
    }

    // 更新用户状态
    const updateUserStatus = async (userId, params) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        try {
            const res = await updateAdminUserStatus(userId, params)
            if (res.code === 200) {
                // 更新用户列表中的用户状态
                const index = userList.value.findIndex(item => item.id === userId)
                if (index !== -1) {
                    if (params.creditScore !== undefined) {
                        userList.value[index].creditScore = params.creditScore
                    }
                    if (params.role !== undefined) {
                        userList.value[index].role = params.role
                        userList.value[index].roleText = roleMap[params.role]
                    }
                }

                ElMessage.success('用户状态更新成功')

                // 如果修改了角色，可能需要刷新管理员列表
                if (params.role !== undefined) {
                    fetchAdminList()
                }

                return true
            }
        } catch (error) {
            console.error('更新用户状态失败', error)
            ElMessage.error(error.message || '更新用户状态失败')
            return false
        }
    }

    // 删除用户
    const removeUser = async (userId) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        try {
            const res = await deleteAdminUser(userId)
            if (res.code === 200) {
                // 从列表中删除
                userList.value = userList.value.filter(item => item.id !== userId)

                // 同时从管理员列表中删除（如果存在）
                adminList.value = adminList.value.filter(item => item.id !== userId)

                ElMessage.success('用户删除成功')
                return true
            }
        } catch (error) {
            console.error('删除用户失败', error)
            ElMessage.error(error.message || '删除用户失败')
            return false
        }
    }

    // 重置用户密码
    const resetUserPassword = async (userId, newPassword) => {
        if (!isAdmin.value) {
            ElMessage.error('您没有管理员权限')
            return Promise.reject(new Error('没有权限'))
        }

        try {
            const res = await resetAdminUserPassword(userId, {newPassword})
            if (res.code === 200) {
                ElMessage.success('密码重置成功')
                return true
            }
        } catch (error) {
            console.error('重置密码失败', error)
            ElMessage.error(error.message || '重置密码失败')
            return false
        }
    }

    // 切换页码
    const changePage = (page) => {
        pagination.value.current = page
        fetchUserList()
    }

    // 切换每页数量
    const changePageSize = (size) => {
        pagination.value.size = size
        pagination.value.current = 1 // 重置到第一页
        fetchUserList()
    }

    // 根据角色获取角色文本
    const getRoleText = (role) => {
        return roleMap[role] || '未知角色'
    }

    return {
        userList,
        adminList,
        loading,
        isAdmin,
        pagination,
        roleMap,
        setAdminRole,
        fetchUserList,
        fetchAdminList,
        updateUserStatus,
        removeUser,
        resetUserPassword,
        changePage,
        changePageSize,
        getRoleText
    }
}) 