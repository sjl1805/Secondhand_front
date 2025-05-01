import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { 
  sendMessage, 
  getMessageDetail, 
  getChatHistory, 
  getMessageList, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount, 
  deleteMessage as apiDeleteMessage,
  getContactList,
  getUserBasicInfo
} from '@/api/message'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export const useMessageStore = defineStore('message', () => {
  // 从userStore获取当前用户信息
  const userStore = useUserStore()
  
  // 状态
  const messageList = ref([])
  const chatHistory = ref([])
  const unreadCount = ref(0)
  const currentChatUser = ref(null)
  const loading = ref(false)
  const messageDetail = ref(null)
  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })
  
  // 消息类型常量
  const MESSAGE_TYPES = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    PRODUCT: 'PRODUCT',
    ORDER: 'ORDER'
  }
  
  // 获取消息列表（按联系人分组）
  const fetchMessages = async () => {
    loading.value = true
    try {
      const res = await getMessageList()
      if (res.code === 200) {
        messageList.value = res.data || []
      }
      return res.data
    } catch (error) {
      console.error('获取消息列表失败:', error)
      return []
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
      console.error('获取消息详情失败:', error)
      ElMessage.error('获取消息详情失败')
    } finally {
      loading.value = false
    }
  }
  
  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      if (res.code === 200) {
        unreadCount.value = res.data || 0
      }
      return unreadCount.value
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
      return 0
    }
  }
  
  // 获取与特定用户的聊天历史
  const fetchChatHistory = async (targetUserId) => {
    loading.value = true
    try {
      const params = {
        page: pagination.current,
        size: pagination.size
      }
      const res = await getChatHistory(targetUserId, params)
      if (res.code === 200) {
        // 更新分页信息
        if (res.data) {
          pagination.total = res.data.total || 0
          // 按日期分组处理消息
          const chatData = res.data.records || []
          processChatHistory(chatData)
        }
      }
      return chatHistory.value
    } catch (error) {
      console.error('获取聊天历史失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // 处理聊天历史数据，按日期分组
  const processChatHistory = (data) => {
    // 按日期分组
    const groupedByDate = {}
    
    // 先按时间排序
    data.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));
    
    data.forEach(msg => {
      // 提取日期部分，处理不同的日期格式
      let dateStr = ''
      try {
        // 尝试直接从日期字符串中提取日期部分
        if (typeof msg.createTime === 'string') {
          // 处理可能的格式：2025-04-29T05:34:31.000+00:00 
          if (msg.createTime.includes('T')) {
            dateStr = msg.createTime.split('T')[0].replace(/-/g, '/')
          } else if (msg.createTime.includes(' ')) {
            // 处理可能的格式：2025/04/29 05:34:31
            dateStr = msg.createTime.split(' ')[0]
          } else {
            dateStr = new Date(msg.createTime).toLocaleDateString()
          }
        } else {
          dateStr = new Date(msg.createTime).toLocaleDateString()
        }
      } catch (e) {
        console.error('日期解析错误:', e)
        dateStr = new Date().toLocaleDateString() // 使用当前日期作为后备
      }
      
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = []
      }
      
      // 解析特殊消息内容
      if (msg.type === MESSAGE_TYPES.PRODUCT || msg.type === MESSAGE_TYPES.ORDER) {
        try {
          msg.parsedContent = JSON.parse(msg.content)
        } catch (e) {
          msg.parsedContent = {}
        }
      }
      
      // 标记消息是否为自己发送
      msg.isSelf = msg.senderId === userStore.userId
      
      groupedByDate[dateStr].push(msg)
    })
    
    // 转换为数组格式
    chatHistory.value = Object.keys(groupedByDate).map(date => ({
      date,
      messages: groupedByDate[date]
    }))
  }
  
  // 发送新消息
  const sendNewMessage = async (messageData) => {
    loading.value = true
    try {
      const res = await sendMessage(messageData)
      if (res.code === 200) {
        // 如果正在查看这个聊天，则刷新聊天历史
        if (currentChatUser.value && currentChatUser.value.id === messageData.receiverId) {
          await fetchChatHistory(messageData.receiverId)
        }
        return res.data
      }
      return null
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 标记消息为已读
  const markMessageAsRead = async (messageId) => {
    try {
      const res = await markAsRead(messageId)
      if (res.code === 200) {
        // 更新消息列表中的已读状态
        const message = messageList.value.find(msg => msg.id === messageId)
        if (message) {
          message.isRead = true
        }
        // 更新未读消息计数
        await fetchUnreadCount()
      }
      return res.code === 200
    } catch (error) {
      console.error('标记消息已读失败:', error)
      return false
    }
  }
  
  // 标记与某用户的所有消息为已读
  const markAllMessagesAsRead = async (targetUserId) => {
    try {
      const res = await markAllAsRead(targetUserId)
      if (res.code === 200) {
        // 更新消息列表中的已读状态
        messageList.value.forEach(msg => {
          if (msg.senderId === targetUserId) {
            msg.isRead = true
          }
        })
        // 更新未读消息计数
        await fetchUnreadCount()
      }
      return res.code === 200
    } catch (error) {
      console.error('标记所有消息已读失败:', error)
      return false
    }
  }
  
  // 删除一条消息
  const deleteMessageById = async (messageId) => {
    try {
      const res = await apiDeleteMessage(messageId)
      if (res.code === 200) {
        // 更新消息列表
        messageList.value = messageList.value.filter(msg => msg.id !== messageId)
        // 如果在当前对话中，也需要更新聊天历史
        if (currentChatUser.value) {
          chatHistory.value = chatHistory.value.map(day => ({
            date: day.date,
            messages: day.messages.filter(msg => msg.id !== messageId)
          })).filter(day => day.messages.length > 0)
        }
      }
      return res.code === 200
    } catch (error) {
      console.error('删除消息失败:', error)
      return false
    }
  }
  
  // 获取用户基本信息
  const getUserById = async (userId) => {
    try {
      const res = await getUserBasicInfo(userId)
      if (res.code === 200) {
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
  
  // 获取联系人列表
  const fetchContactList = async () => {
    loading.value = true
    try {
      const res = await getContactList()
      if (res.code === 200) {
        return res.data
      }
      return []
    } catch (error) {
      console.error('获取联系人列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // 设置当前聊天用户
  const setCurrentChatUser = (user) => {
    currentChatUser.value = user
    // 重置分页
    pagination.current = 1
  }
  
  // 获取按联系人分组的最新消息
  const getContactGroups = computed(() => {
    const contactMap = {}
    
    messageList.value.forEach(msg => {
      // 当前用户是发送者时，联系人是接收者
      // 当前用户是接收者时，联系人是发送者
      let contactId, contactName, contactAvatar;
      
      if (msg.senderId === userStore.userId) {
        // 当前用户是发送者，联系人是接收者
        contactId = msg.receiverId;
        contactName = msg.receiverNickname;
        contactAvatar = msg.receiverAvatar;
      } else {
        // 当前用户是接收者，联系人是发送者
        contactId = msg.senderId;
        contactName = msg.senderNickname;
        contactAvatar = msg.senderAvatar;
      }
      
      if (!contactMap[contactId] || new Date(msg.createTime) > new Date(contactMap[contactId].latestMessage.createTime)) {
        contactMap[contactId] = {
          id: contactId,
          name: contactName || `用户${contactId}`,
          avatar: contactAvatar,
          latestMessage: msg,
          unreadCount: contactMap[contactId] ? contactMap[contactId].unreadCount : 0
        }
      }
      
      // 计算未读消息数 - 只有当前用户是接收者且消息未读时才增加
      if (msg.receiverId === userStore.userId && !msg.isRead) {
        contactMap[contactId].unreadCount = (contactMap[contactId].unreadCount || 0) + 1
      }
    })
    
    return Object.values(contactMap).sort((a, b) => {
      return new Date(b.latestMessage.createTime) - new Date(a.latestMessage.createTime)
    })
  })
  
  // 按日期分组的聊天历史
  const groupedChatHistory = computed(() => {
    return chatHistory.value
  })
  
  // 当前聊天中的未读消息数
  const currentChatUnreadCount = computed(() => {
    if (!currentChatUser.value) return 0
    
    return messageList.value.filter(msg => 
      msg.senderId === currentChatUser.value.id && 
      msg.receiverId === userStore.userId &&
      !msg.isRead
    ).length
  })
  
  // 切换页码
  const changePage = (page) => {
    pagination.current = page
    if (currentChatUser.value) {
      fetchChatHistory(currentChatUser.value.id)
    }
  }
  
  // 修改每页数量
  const changePageSize = (size) => {
    pagination.size = size
    pagination.current = 1
    if (currentChatUser.value) {
      fetchChatHistory(currentChatUser.value.id)
    }
  }
  
  // 初始化
  const initialize = async () => {
    await Promise.all([
      fetchMessages(),
      fetchUnreadCount()
    ])
  }
  
  return {
    messageList,
    chatHistory,
    unreadCount,
    messageDetail,
    loading,
    currentChatUser,
    pagination,
    MESSAGE_TYPES,
    groupedChatHistory,
    currentChatUnreadCount,
    getContactGroups,
    fetchMessages,
    fetchMessageDetail,
    fetchUnreadCount,
    fetchChatHistory,
    fetchContactList,
    sendNewMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessageById,
    getUserById,
    changePage,
    changePageSize,
    setCurrentChatUser,
    initialize
  }
}) 