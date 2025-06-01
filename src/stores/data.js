import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'

export const useDataStore = defineStore('data', () => {
  // Products
  const products = ref([])
  const product = ref(null)
  const productLoading = ref(false)
  const productError = ref(null)
  const productTotal = ref(0)
  const productFilters = ref({
    search: '',
    category: null,
    status: null,
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDesc: true
  })

  // Categories
  const categories = ref([])
  const category = ref(null)
  const categoryLoading = ref(false)
  const categoryError = ref(null)
  const categoryTotal = ref(0)
  const categoryFilters = ref({
    search: '',
    status: null,
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDesc: true
  })

  // Orders
  const orders = ref([])
  const order = ref(null)
  const orderLoading = ref(false)
  const orderError = ref(null)
  const orderTotal = ref(0)
  const orderFilters = ref({
    search: '',
    status: null,
    paymentMethod: null,
    startDate: null,
    endDate: null,
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDesc: true
  })

  // Customers
  const customers = ref([])
  const customer = ref(null)
  const customerLoading = ref(false)
  const customerError = ref(null)
  const customerTotal = ref(0)
  const customerFilters = ref({
    search: '',
    status: null,
    membershipLevel: null,
    startDate: null,
    endDate: null,
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDesc: true
  })

  // Products Actions
  const fetchProducts = async () => {
    productLoading.value = true
    try {
      const response = await api.get('/products', { params: productFilters.value })
      products.value = response.data.content
      productTotal.value = response.data.totalElements
    } catch (error) {
      productError.value = error.message
    } finally {
      productLoading.value = false
    }
  }

  const fetchProduct = async (id) => {
    productLoading.value = true
    try {
      const response = await api.get(`/products/${id}`)
      product.value = response.data
    } catch (error) {
      productError.value = error.message
    } finally {
      productLoading.value = false
    }
  }

  const createProduct = async (productData) => {
    productLoading.value = true
    try {
      const response = await api.post('/products', productData)
      products.value.unshift(response.data)
      return response.data
    } catch (error) {
      productError.value = error.message
      throw error
    } finally {
      productLoading.value = false
    }
  }

  const updateProduct = async (id, productData) => {
    productLoading.value = true
    try {
      const response = await api.put(`/products/${id}`, productData)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (error) {
      productError.value = error.message
      throw error
    } finally {
      productLoading.value = false
    }
  }

  const deleteProduct = async (id) => {
    productLoading.value = true
    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
    } catch (error) {
      productError.value = error.message
      throw error
    } finally {
      productLoading.value = false
    }
  }

  // Categories Actions
  const fetchCategories = async () => {
    categoryLoading.value = true
    try {
      const response = await api.get('/categories', { params: categoryFilters.value })
      categories.value = response.data.content
      categoryTotal.value = response.data.totalElements
    } catch (error) {
      categoryError.value = error.message
    } finally {
      categoryLoading.value = false
    }
  }

  const fetchCategory = async (id) => {
    categoryLoading.value = true
    try {
      const response = await api.get(`/categories/${id}`)
      category.value = response.data
    } catch (error) {
      categoryError.value = error.message
    } finally {
      categoryLoading.value = false
    }
  }

  const createCategory = async (categoryData) => {
    categoryLoading.value = true
    try {
      const response = await api.post('/categories', categoryData)
      categories.value.unshift(response.data)
      return response.data
    } catch (error) {
      categoryError.value = error.message
      throw error
    } finally {
      categoryLoading.value = false
    }
  }

  const updateCategory = async (id, categoryData) => {
    categoryLoading.value = true
    try {
      const response = await api.put(`/categories/${id}`, categoryData)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (error) {
      categoryError.value = error.message
      throw error
    } finally {
      categoryLoading.value = false
    }
  }

  const deleteCategory = async (id) => {
    categoryLoading.value = true
    try {
      await api.delete(`/categories/${id}`)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (error) {
      categoryError.value = error.message
      throw error
    } finally {
      categoryLoading.value = false
    }
  }

  // Orders Actions
  const fetchOrders = async () => {
    orderLoading.value = true
    try {
      const response = await api.get('/orders', { params: orderFilters.value })
      orders.value = response.data.content
      orderTotal.value = response.data.totalElements
    } catch (error) {
      orderError.value = error.message
    } finally {
      orderLoading.value = false
    }
  }

  const fetchOrder = async (id) => {
    orderLoading.value = true
    try {
      const response = await api.get(`/orders/${id}`)
      order.value = response.data
    } catch (error) {
      orderError.value = error.message
    } finally {
      orderLoading.value = false
    }
  }

  const updateOrderStatus = async (id, status) => {
    orderLoading.value = true
    try {
      const response = await api.put(`/orders/${id}/status`, { status })
      const index = orders.value.findIndex(o => o.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      return response.data
    } catch (error) {
      orderError.value = error.message
      throw error
    } finally {
      orderLoading.value = false
    }
  }

  // Customers Actions
  const fetchCustomers = async () => {
    customerLoading.value = true
    try {
      const response = await api.get('/customers', { params: customerFilters.value })
      customers.value = response.data.content
      customerTotal.value = response.data.totalElements
    } catch (error) {
      customerError.value = error.message
    } finally {
      customerLoading.value = false
    }
  }

  const fetchCustomer = async (id) => {
    customerLoading.value = true
    try {
      const response = await api.get(`/customers/${id}`)
      customer.value = response.data
    } catch (error) {
      customerError.value = error.message
    } finally {
      customerLoading.value = false
    }
  }

  const updateCustomer = async (id, customerData) => {
    customerLoading.value = true
    try {
      const response = await api.put(`/customers/${id}`, customerData)
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = response.data
      }
      return response.data
    } catch (error) {
      customerError.value = error.message
      throw error
    } finally {
      customerLoading.value = false
    }
  }

  const updateCustomerStatus = async (id, status) => {
    customerLoading.value = true
    try {
      const response = await api.put(`/customers/${id}/status`, { status })
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = response.data
      }
      return response.data
    } catch (error) {
      customerError.value = error.message
      throw error
    } finally {
      customerLoading.value = false
    }
  }

  return {
    // Products
    products,
    product,
    productLoading,
    productError,
    productTotal,
    productFilters,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,

    // Categories
    categories,
    category,
    categoryLoading,
    categoryError,
    categoryTotal,
    categoryFilters,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,

    // Orders
    orders,
    order,
    orderLoading,
    orderError,
    orderTotal,
    orderFilters,
    fetchOrders,
    fetchOrder,
    updateOrderStatus,

    // Customers
    customers,
    customer,
    customerLoading,
    customerError,
    customerTotal,
    customerFilters,
    fetchCustomers,
    fetchCustomer,
    updateCustomer,
    updateCustomerStatus
  }
}) 