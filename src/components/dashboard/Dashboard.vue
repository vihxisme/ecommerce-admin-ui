<template>
  <div class="dashboard">
    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="primary" dark>
          <v-card-text>
            <div class="text-h6">Tổng doanh thu</div>
            <div class="text-h4">{{ formatCurrency(statistics.totalRevenue) }}</div>
            <div class="text-subtitle-2">
              <v-icon small>{{ getTrendIcon(statistics.revenueTrend) }}</v-icon>
              {{ statistics.revenueTrend }}% so với tháng trước
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="success" dark>
          <v-card-text>
            <div class="text-h6">Đơn hàng mới</div>
            <div class="text-h4">{{ statistics.newOrders }}</div>
            <div class="text-subtitle-2">
              <v-icon small>{{ getTrendIcon(statistics.ordersTrend) }}</v-icon>
              {{ statistics.ordersTrend }}% so với tháng trước
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="info" dark>
          <v-card-text>
            <div class="text-h6">Khách hàng mới</div>
            <div class="text-h4">{{ statistics.newCustomers }}</div>
            <div class="text-subtitle-2">
              <v-icon small>{{ getTrendIcon(statistics.customersTrend) }}</v-icon>
              {{ statistics.customersTrend }}% so với tháng trước
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="warning" dark>
          <v-card-text>
            <div class="text-h6">Sản phẩm sắp hết</div>
            <div class="text-h4">{{ statistics.lowStockProducts }}</div>
            <div class="text-subtitle-2">
              Cần bổ sung {{ statistics.lowStockProducts }} sản phẩm
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Doanh thu theo thời gian
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="revenueChartPeriod" mandatory>
              <v-btn small value="week">Tuần</v-btn>
              <v-btn small value="month">Tháng</v-btn>
              <v-btn small value="year">Năm</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <canvas ref="revenueChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            Top sản phẩm bán chạy
          </v-card-title>
          <v-card-text>
            <canvas ref="topProductsChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Orders -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Đơn hàng gần đây</span>
            <v-btn text color="primary" to="/orders">
              Xem tất cả
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="orderHeaders"
              :items="recentOrders"
              :loading="loading"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.totalAmount="{ item }">
                {{ formatCurrency(item.totalAmount) }}
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getOrderStatusColor(item.status)"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { orderService } from '@/api/services/orderService';
import { productService } from '@/api/services/productService';
import { customerService } from '@/api/services/customerService';
import { inventoryService } from '@/api/services/inventoryService';

export default {
  name: 'Dashboard',
  setup() {
    const loading = ref(false);
    const revenueChartPeriod = ref('month');
    const revenueChart = ref(null);
    const topProductsChart = ref(null);
    let revenueChartInstance = null;
    let topProductsChartInstance = null;

    const statistics = ref({
      totalRevenue: 0,
      revenueTrend: 0,
      newOrders: 0,
      ordersTrend: 0,
      newCustomers: 0,
      customersTrend: 0,
      lowStockProducts: 0
    });

    const recentOrders = ref([]);

    const orderHeaders = [
      { text: 'Mã đơn hàng', value: 'orderId' },
      { text: 'Khách hàng', value: 'customerName' },
      { text: 'Tổng tiền', value: 'totalAmount' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Ngày tạo', value: 'createdAt' }
    ];

    const getTrendIcon = (trend) => {
      return trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down';
    };

    const getOrderStatusColor = (status) => {
      const colors = {
        PENDING: 'warning',
        PROCESSING: 'info',
        COMPLETED: 'success',
        CANCELLED: 'error'
      };
      return colors[status] || 'grey';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    const initRevenueChart = (data) => {
      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }

      const ctx = revenueChart.value.getContext('2d');
      revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Doanh thu',
            data: data.values,
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => formatCurrency(value)
              }
            }
          }
        }
      });
    };

    const initTopProductsChart = (data) => {
      if (topProductsChartInstance) {
        topProductsChartInstance.destroy();
      }

      const ctx = topProductsChart.value.getContext('2d');
      topProductsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: [
              '#1976D2',
              '#2196F3',
              '#64B5F6',
              '#90CAF9',
              '#BBDEFB'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    };

    const fetchStatistics = async () => {
      loading.value = true;
      try {
        const [orderStats, customerStats, inventoryStats] = await Promise.all([
          orderService.getOrderStatistics(),
          customerService.getCustomerStatistics(),
          inventoryService.getInventoryStatistics()
        ]);

        statistics.value = {
          ...orderStats,
          ...customerStats,
          lowStockProducts: inventoryStats.lowStockCount
        };
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        loading.value = false;
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const response = await orderService.getRecentOrders();
        recentOrders.value = response;
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    const fetchChartData = async () => {
      try {
        const [revenueData, topProductsData] = await Promise.all([
          orderService.getRevenueChartData(revenueChartPeriod.value),
          productService.getTopProductsChartData()
        ]);

        initRevenueChart(revenueData);
        initTopProductsChart(topProductsData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    watch(revenueChartPeriod, () => {
      fetchChartData();
    });

    onMounted(() => {
      fetchStatistics();
      fetchRecentOrders();
      fetchChartData();
    });

    return {
      loading,
      statistics,
      recentOrders,
      revenueChartPeriod,
      revenueChart,
      topProductsChart,
      orderHeaders,
      getTrendIcon,
      getOrderStatusColor,
      formatDate,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

canvas {
  min-height: 300px;
}
</style> 