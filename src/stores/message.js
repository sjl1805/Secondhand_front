import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  sendMessage, 
  getMessageDetail, 
  getChatHistory, 
  getMessageList, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount, 
  deleteMessage 
} from '@/api/message'
import { ElMessage } from 'element-plus'

export const useMessageStore = defineStore('message', () => {
  // 状态
  const messageDetail = ref(null)
  const chatHistory = ref([])
  const messageList = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const currentChatUser = ref(null)
  const pagination = ref({
    current: 1,
    size: 20,
    total: 0
  })
  
  // 发送消息
  const sendNewMessage = async (messageData) => {
    loading.value = true
    try {
      const res = await sendMessage(messageData)
      if (res.code === 200) {
        ElMessage.success('消息发送成功')
        
        // 如果当前正在与该用户聊天，更新聊天记录
        if (currentChatUser.value && currentChatUser.value.id === messageData.receiverId) {
          await fetchChatHistory(messageData.receiverId)
        }
        
        return res.data
      }
    } catch (error) {
      console.error('消息发送失败', error)
      ElMessage.error(error.message || '消息发送失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取消息详情
  const fetchMessageDetail = async (messageId) => {
    loading.value = true
    try {
      const res = await getMessageDetail(messageId)
      if (res.code === 200) {
        messageDetail.value = res.data
        return res.data
      }
    } catch (error) {
      console.error('获取消息详情失败', error)
      ElMessage.error('获取消息详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取聊天记录
  const fetchChatHistory = async (targetUserId, params = {}) => {
    loading.value = true
    try {
      // 设置当前聊天用户
      if (targetUserId) {
        currentChatUser.value = { id: targetUserId }
      }
      
      // 合并分页参数
      const queryParams = {
        page: pagination.value.current,
        size: pagination.value.size,
        ...params
      }
      
      const res = await getChatHistory(targetUserId, queryParams)
      if (res.code === 200) {
        chatHistory.value = res.data.records || []
        pagination.value = {
          current: res.data.current,
          size: res.data.size,
          total: res.data.total
        }
        return res.data
      }
    } catch (error) {
      console.error('获取聊天记录失败', error)
      ElMessage.error('获取聊天记录失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取消息列表
  const fetchMessageList = async () => {
    loading.value = true
    try {
      const res = await getMessageList()
      if (res.code === 200) {
        messageList.value = res.data || []
        return res.data
      }
    } catch (error) {
      console.error('获取消息列表失败', error)
      ElMessage.error('获取消息列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 标记消息为已读
  const markMessageAsRead = async (messageId) => {
    try {
      const res = await markAsRead(messageId)
      if (res.code === 200) {
        // 更新消息详情中的已读状态
        if (messageDetail.value && messageDetail.value.id === messageId) {
          messageDetail.value.isRead = true
        }
        
        // 更新聊天记录中的已读状态
        const index = chatHistory.value.findIndex(item => item.id === messageId)
        if (index !== -1) {
          chatHistory.value[index].isRead = true
        }
        
        // 更新消息列表中的已读状态
        updateMessageListReadStatus(messageId)
        
        // 更新未读消息数
        if (unreadCount.value > 0) {
          unreadCount.value--
        }
        
        return true
      }
    } catch (error) {
      console.error('标记消息已读失败', error)
      return false
    }
  }
  
  // 标记所有消息为已读
  const markAllMessagesAsRead = async (targetUserId) => {
    try {
      const res = await markAllAsRead(targetUserId)
      if (res.code === 200) {
        // 更新聊天记录中的已读状态
        chatHistory.value.forEach(message => {
          if (message.senderId === targetUserId && !message.isRead) {
            message.isRead = true
          }
        })
        
        // 更新消息列表中的已读状态
        updateMessageListReadStatusByUser(targetUserId)
        
        // 获取新的未读消息数
        await fetchUnreadCount()
        
        ElMessage.success('已将所有消息标记为已读')
        return res.data
      }
    } catch (error) {
      console.error('标记所有消息已读失败', error)
      ElMessage.error('标记所有消息已读失败')
      return 0
    }
  }
  
  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      if (res.code === 200) {
        unreadCount.value = res.data
        return res.data
      }
      return 0
    } catch (error) {
      console.error('获取未读消息数量失败', error)
      return 0
    }
  }
  
  // 删除消息
  const removeMessage = async (messageId) => {
    try {
      const res = await deleteMessage(messageId)
      if (res.code === 200) {
        // 从聊天记录中删除该消息
        chatHistory.value = chatHistory.value.filter(message => message.id !== messageId)
        
        // 更新消息列表
        updateMessageListAfterDelete(messageId)
        
        ElMessage.success('消息已删除')
        return true
      }
    } catch (error) {
      console.error('删除消息失败', error)
      ElMessage.error('删除消息失败')
      return false
    }
  }
  
  // 辅助方法：更新消息列表中的已读状态
  const updateMessageListReadStatus = (messageId) => {
    messageList.value.forEach(contact => {
      if (contact.lastMessage && contact.lastMessage.id === messageId) {
        contact.lastMessage.isRead = true
        if (contact.unreadCount > 0) {
          contact.unreadCount--
        }
      }
    })
  }
  
  // 辅助方法：按用户更新消息列表中的已读状态
  const updateMessageListReadStatusByUser = (targetUserId) => {
    messageList.value.forEach(contact => {
      if (contact.userId === targetUserId) {
        if (contact.lastMessage) {
          contact.lastMessage.isRead = true
        }
        contact.unreadCount = 0
      }
    })
  }
  
  // 辅助方法：删除消息后更新消息列表
  const updateMessageListAfterDelete = (messageId) => {
    messageList.value.forEach(contact => {
      if (contact.lastMessage && contact.lastMessage.id === messageId) {
        // 找到新的最后一条消息
        const newLastMessage = chatHistory.value
          .filter(message => 
            (message.senderId === contact.userId && message.receiverId === currentChatUser.value.id) || 
            (message.receiverId === contact.userId && message.senderId === currentChatUser.value.id)
          )
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0]
        
        if (newLastMessage) {
          contact.lastMessage = newLastMessage
        } else {
          // 如果没有聊天记录了，可以考虑从列表中移除该联系人
          messageList.value = messageList.value.filter(item => item.userId !== contact.userId)
        }
      }
    })
  }
  
  // 切换页码
  const changePage = (page) => {
    pagination.value.current = page
    if (currentChatUser.value) {
      fetchChatHistory(currentChatUser.value.id)
    }
  }
  
  // 切换每页数量
  const changePageSize = (size) => {
    pagination.value.size = size
    pagination.value.current = 1 // 重置到第一页
    if (currentChatUser.value) {
      fetchChatHistory(currentChatUser.value.id)
    }
  }
  
  // 设置当前聊天用户
  const setCurrentChatUser = (user) => {
    currentChatUser.value = user
    // 重置分页
    pagination.value = {
      current: 1,
      size: 20,
      total: 0
    }
  }
  
  // 计算属性：当前聊天用户的未读消息数
  const currentChatUnreadCount = computed(() => {
    if (!currentChatUser.value) return 0
    
    const contact = messageList.value.find(item => item.userId === currentChatUser.value.id)
    return contact ? contact.unreadCount : 0
  })
  
  // 计算属性：按时间分组的聊天记录
  const groupedChatHistory = computed(() => {
    const grouped = {}
    
    chatHistory.value.forEach(message => {
      const date = new Date(message.createTime).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(message)
    })
    
    return Object.entries(grouped).map(([date, messages]) => ({
      date,
      messages
    }))
  })
  
  // 初始化
  const initialize = async () => {
    await Promise.all([
      fetchMessageList(),
      fetchUnreadCount()
    ])
  }
  
  // 重置状态
  const resetState = () => {
    messageDetail.value = null
    chatHistory.value = []
    messageList.value = []
    unreadCount.value = 0
    currentChatUser.value = null
    pagination.value = {
      current: 1,
      size: 20,
      total: 0
    }
  }
  
  return {
    messageDetail,
    chatHistory,
    messageList,
    unreadCount,
    loading,
    currentChatUser,
    pagination,
    groupedChatHistory,
    currentChatUnreadCount,
    sendNewMessage,
    fetchMessageDetail,
    fetchChatHistory,
    fetchMessageList,
    markMessageAsRead,
    markAllMessagesAsRead,
    fetchUnreadCount,
    removeMessage,
    changePage,
    changePageSize,
    setCurrentChatUser,
    initialize,
    resetState
  }
}) 