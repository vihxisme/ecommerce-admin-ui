import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import { formatDate } from '@/utils/api'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const showNotifications = ref(false)
  const socket = ref(null)
  const isConnected = ref(false)

  // Getters
  const allNotifications = computed(() => notifications.value)
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.read))
  const unreadCountValue = computed(() => unreadCount.value)
  const isNotificationsVisible = computed(() => showNotifications.value)
  const isSocketConnected = computed(() => isConnected.value)

  // Actions
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      message: notification.message,
      type: notification.type || 'info',
      time: notification.time || new Date(),
      read: false,
      data: notification.data || null
    }
    
    notifications.value.unshift(newNotification)
    unreadCount.value++
  }

  const markAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value--
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      if (!notification.read) {
        notification.read = true
      }
    })
    unreadCount.value = 0
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      if (!notifications.value[index].read) {
        unreadCount.value--
      }
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
  }

  const showNotificationsPanel = () => {
    showNotifications.value = true
  }

  const hideNotificationsPanel = () => {
    showNotifications.value = false
  }

  const connectSocket = () => {
    if (socket.value) return
    
    socket.value = io(import.meta.env.VITE_API_URL)
    
    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('WebSocket connected')
    })
    
    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('WebSocket disconnected')
    })
    
    // Listen for events
    socket.value.on('newOrder', (order) => {
      addNotification({
        message: `Đơn hàng mới: #${order.id}`,
        type: 'success',
        time: new Date(),
        data: { type: 'order', id: order.id }
      })
    })
    
    socket.value.on('lowStock', (product) => {
      addNotification({
        message: `Cảnh báo: ${product.name} sắp hết hàng`,
        type: 'warning',
        time: new Date(),
        data: { type: 'product', id: product.id }
      })
    })
    
    socket.value.on('orderStatusChanged', (data) => {
      addNotification({
        message: `Đơn hàng #${data.orderId} đã được cập nhật trạng thái: ${data.status}`,
        type: 'info',
        time: new Date(),
        data: { type: 'order', id: data.orderId }
      })
    })
    
    socket.value.on('paymentReceived', (data) => {
      addNotification({
        message: `Đã nhận thanh toán cho đơn hàng #${data.orderId}: ${data.amount}đ`,
        type: 'success',
        time: new Date(),
        data: { type: 'payment', id: data.orderId }
      })
    })
    
    socket.value.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      isConnected.value = false
    })
  }

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  const formatNotificationTime = (date) => {
    return formatDate(date)
  }

  return {
    // State
    notifications,
    unreadCount,
    showNotifications,
    socket,
    isConnected,
    
    // Getters
    allNotifications,
    unreadNotifications,
    unreadCountValue,
    isNotificationsVisible,
    isSocketConnected,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    toggleNotifications,
    showNotificationsPanel,
    hideNotificationsPanel,
    connectSocket,
    disconnectSocket,
    formatNotificationTime
  }
}) 