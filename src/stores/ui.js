import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(true)
  const darkMode = ref(localStorage.getItem('darkMode') === 'true')
  const breadcrumbs = ref([])
  const pageTitle = ref('')
  const loading = ref(false)
  const loadingText = ref('')
  const dialog = ref({
    show: false,
    title: '',
    content: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: null,
    onCancel: null
  })
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000
  })
  const tableOptions = ref({
    itemsPerPage: 10,
    sortBy: [],
    sortDesc: []
  })

  // Getters
  const isSidebarOpen = computed(() => sidebarOpen.value)
  const isDarkMode = computed(() => darkMode.value)
  const currentBreadcrumbs = computed(() => breadcrumbs.value)
  const currentPageTitle = computed(() => pageTitle.value)
  const isLoading = computed(() => loading.value)
  const loadingMessage = computed(() => loadingText.value)
  const isDialogOpen = computed(() => dialog.value.show)
  const dialogTitle = computed(() => dialog.value.title)
  const dialogContent = computed(() => dialog.value.content)
  const dialogConfirmText = computed(() => dialog.value.confirmText)
  const dialogCancelText = computed(() => dialog.value.cancelText)
  const isSnackbarOpen = computed(() => snackbar.value.show)
  const snackbarText = computed(() => snackbar.value.text)
  const snackbarColor = computed(() => snackbar.value.color)
  const currentTableOptions = computed(() => tableOptions.value)

  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const setSidebarOpen = (value) => {
    sidebarOpen.value = value
  }

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    localStorage.setItem('darkMode', darkMode.value)
    applyTheme()
  }

  const setDarkMode = (value) => {
    darkMode.value = value
    localStorage.setItem('darkMode', value)
    applyTheme()
  }

  const applyTheme = () => {
    if (darkMode.value) {
      document.documentElement.classList.add('v-theme--dark')
    } else {
      document.documentElement.classList.remove('v-theme--dark')
    }
  }

  const setBreadcrumbs = (items) => {
    breadcrumbs.value = items
  }

  const setPageTitle = (title) => {
    pageTitle.value = title
    document.title = title ? `${title} | E-Shop Admin` : 'E-Shop Admin'
  }

  const startLoading = (text = 'Đang tải...') => {
    loading.value = true
    loadingText.value = text
  }

  const stopLoading = () => {
    loading.value = false
    loadingText.value = ''
  }

  const showDialog = (options) => {
    dialog.value = {
      show: true,
      title: options.title || 'Xác nhận',
      content: options.content || '',
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    }
  }

  const hideDialog = () => {
    dialog.value.show = false
  }

  const confirmDialog = () => {
    if (dialog.value.onConfirm) {
      dialog.value.onConfirm()
    }
    hideDialog()
  }

  const cancelDialog = () => {
    if (dialog.value.onCancel) {
      dialog.value.onCancel()
    }
    hideDialog()
  }

  const showSnackbar = (options) => {
    snackbar.value = {
      show: true,
      text: options.text || '',
      color: options.color || 'success',
      timeout: options.timeout || 3000
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  const setTableOptions = (options) => {
    tableOptions.value = {
      ...tableOptions.value,
      ...options
    }
  }

  // Initialize theme
  const initTheme = () => {
    applyTheme()
  }

  return {
    // State
    sidebarOpen,
    darkMode,
    breadcrumbs,
    pageTitle,
    loading,
    loadingText,
    dialog,
    snackbar,
    tableOptions,
    
    // Getters
    isSidebarOpen,
    isDarkMode,
    currentBreadcrumbs,
    currentPageTitle,
    isLoading,
    loadingMessage,
    isDialogOpen,
    dialogTitle,
    dialogContent,
    dialogConfirmText,
    dialogCancelText,
    isSnackbarOpen,
    snackbarText,
    snackbarColor,
    currentTableOptions,
    
    // Actions
    toggleSidebar,
    setSidebarOpen,
    toggleDarkMode,
    setDarkMode,
    applyTheme,
    setBreadcrumbs,
    setPageTitle,
    startLoading,
    stopLoading,
    showDialog,
    hideDialog,
    confirmDialog,
    cancelDialog,
    showSnackbar,
    hideSnackbar,
    setTableOptions,
    initTheme
  }
}) 