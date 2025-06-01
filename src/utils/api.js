import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Spring Boot specific utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocalString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'PAID':
      return 'success';
    case 'PENDING':
    case 'PROCESSING':
      return 'warning';
    case 'INACTIVE':
    case 'CANCELLED':
    case 'FAILED':
      return 'error';
    default:
      return 'grey';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'Hoạt động';
    case 'INACTIVE':
      return 'Không hoạt động';
    case 'PENDING':
      return 'Đang chờ';
    case 'PROCESSING':
      return 'Đang xử lý';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'PAID':
      return 'Đã thanh toán';
    case 'FAILED':
      return 'Thất bại';
    default:
      return status;
  }
};

export const getPaymentMethodText = (method) => {
  switch (method) {
    case 'COD':
      return 'Thanh toán khi nhận hàng';
    case 'VNPAY':
      return 'VNPay';
    case 'MOMO':
      return 'Momo';
    default:
      return method;
  }
};

export const getMembershipLevelText = (level) => {
  switch (level) {
    case 'BRONZE':
      return 'Đồng';
    case 'SILVER':
      return 'Bạc';
    case 'GOLD':
      return 'Vàng';
    case 'PLATINUM':
      return 'Bạch kim';
    default:
      return level;
  }
};

export { api };