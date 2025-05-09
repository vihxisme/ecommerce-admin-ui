<template>
  <div class="order-detail">
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Chi tiết đơn hàng</h1>
      <v-btn color="primary" @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
        Quay lại
      </v-btn>
    </div>

    <v-card v-if="order" class="mb-4">
      <v-card-title>Thông tin đơn hàng #{{ order.id }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <strong>Khách hàng:</strong> {{ order.customerName }}
            </div>
            <div class="mb-2">
              <strong>Ngày đặt:</strong> {{ new Date(order.orderDate).toLocaleDateString('vi-VN') }}
            </div>
            <div class="mb-2">
              <strong>Trạng thái:</strong>
              <v-chip
                :color="getStatusColor(order.status)"
                size="small"
                class="ml-2"
              >
                {{ getStatusText(order.status) }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <strong>Tổng tiền:</strong> {{ formatCurrency(order.total) }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="loading" class="d-flex justify-center align-center pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/utils/api';

const router = useRouter();
const route = useRoute();
const order = ref(null);
const loading = ref(false);

const API_URL = '/api/order/v1';

const getStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    SHIPPING: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusText = (status) => {
  const texts = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
  };
  return texts[status] || status;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const fetchOrderDetail = async () => {
  try {
    loading.value = true;
    const response = await api.get(`${API_URL}/orders/${route.params.id}`);
    order.value = response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.order-detail {
  padding: 20px;
}
</style> 