<template>
  <div class="report-list">
    <!-- Thống kê tổng quan -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="primary" dark>
          <v-card-text>
            <div class="text-h6">Tổng doanh thu</div>
            <div class="text-h4">{{ formatCurrency(totalRevenue) }}</div>
            <div class="d-flex align-center">
              <v-icon :color="revenueGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                {{ revenueGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
              <span>{{ Math.abs(revenueGrowth) }}% so với tháng trước</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="success" dark>
          <v-card-text>
            <div class="text-h6">Đơn hàng mới</div>
            <div class="text-h4">{{ newOrders }}</div>
            <div class="d-flex align-center">
              <v-icon :color="orderGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                {{ orderGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
              <span>{{ Math.abs(orderGrowth) }}% so với tháng trước</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="info" dark>
          <v-card-text>
            <div class="text-h6">Khách hàng mới</div>
            <div class="text-h4">{{ newCustomers }}</div>
            <div class="d-flex align-center">
              <v-icon :color="customerGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                {{ customerGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
              <span>{{ Math.abs(customerGrowth) }}% so với tháng trước</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="warning" dark>
          <v-card-text>
            <div class="text-h6">Sản phẩm sắp hết</div>
            <div class="text-h4">{{ lowStockProducts }}</div>
            <div>Cần bổ sung</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Biểu đồ doanh thu -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Doanh thu theo thời gian</span>
            <v-btn-toggle v-model="revenueTimeRange" mandatory>
              <v-btn small value="week">Tuần</v-btn>
              <v-btn small value="month">Tháng</v-btn>
              <v-btn small value="year">Năm</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <canvas ref="revenueChart" height="300"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Biểu đồ sản phẩm bán chạy -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Sản phẩm bán chạy</v-card-title>
          <v-card-text>
            <canvas ref="topProductsChart" height="300"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Phân bố đơn hàng theo trạng thái</v-card-title>
          <v-card-text>
            <canvas ref="orderStatusChart" height="300"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bảng thống kê chi tiết -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Thống kê chi tiết</span>
            <v-btn color="primary" @click="exportReport">
              <v-icon left>mdi-download</v-icon>
              Xuất báo cáo
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab">
              <v-tab value="revenue">Doanh thu</v-tab>
              <v-tab value="products">Sản phẩm</v-tab>
              <v-tab value="customers">Khách hàng</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item value="revenue">
                <v-data-table
                  :headers="revenueHeaders"
                  :items="revenueData"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.amount="{ item }">
                    {{ formatCurrency(item.amount) }}
                  </template>
                  <template v-slot:item.growth="{ item }">
                    <span :class="item.growth >= 0 ? 'success--text' : 'error--text'">
                      {{ item.growth >= 0 ? '+' : '' }}{{ item.growth }}%
                    </span>
                  </template>
                </v-data-table>
              </v-window-item>

              <v-window-item value="products">
                <v-data-table
                  :headers="productHeaders"
                  :items="productData"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.revenue="{ item }">
                    {{ formatCurrency(item.revenue) }}
                  </template>
                </v-data-table>
              </v-window-item>

              <v-window-item value="customers">
                <v-data-table
                  :headers="customerHeaders"
                  :items="customerData"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.totalSpent="{ item }">
                    {{ formatCurrency(item.totalSpent) }}
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { reportService } from '@/api/services/reportService';

export default {
  name: 'ReportList',
  setup() {
    const loading = ref(false);
    const activeTab = ref('revenue');
    const revenueTimeRange = ref('month');
    const revenueChart = ref(null);
    const topProductsChart = ref(null);
    const orderStatusChart = ref(null);

    // Thống kê tổng quan
    const totalRevenue = ref(0);
    const revenueGrowth = ref(0);
    const newOrders = ref(0);
    const orderGrowth = ref(0);
    const newCustomers = ref(0);
    const customerGrowth = ref(0);
    const lowStockProducts = ref(0);

    // Dữ liệu bảng
    const revenueData = ref([]);
    const productData = ref([]);
    const customerData = ref([]);

    // Headers cho các bảng
    const revenueHeaders = [
      { text: 'Thời gian', value: 'period' },
      { text: 'Doanh thu', value: 'amount' },
      { text: 'Tăng trưởng', value: 'growth' },
      { text: 'Số đơn hàng', value: 'orderCount' }
    ];

    const productHeaders = [
      { text: 'Sản phẩm', value: 'name' },
      { text: 'Đã bán', value: 'soldCount' },
      { text: 'Doanh thu', value: 'revenue' },
      { text: 'Tỷ lệ', value: 'percentage' }
    ];

    const customerHeaders = [
      { text: 'Khách hàng', value: 'name' },
      { text: 'Số đơn hàng', value: 'orderCount' },
      { text: 'Tổng chi tiêu', value: 'totalSpent' },
      { text: 'Đơn hàng cuối', value: 'lastOrder' }
    ];

    // Khởi tạo biểu đồ
    let revenueChartInstance = null;
    let topProductsChartInstance = null;
    let orderStatusChartInstance = null;

    const initCharts = () => {
      // Biểu đồ doanh thu
      const revenueCtx = revenueChart.value.getContext('2d');
      revenueChartInstance = new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Doanh thu',
            data: [],
            borderColor: '#1976D2',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      // Biểu đồ sản phẩm bán chạy
      const productsCtx = topProductsChart.value.getContext('2d');
      topProductsChartInstance = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
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

      // Biểu đồ trạng thái đơn hàng
      const statusCtx = orderStatusChart.value.getContext('2d');
      orderStatusChartInstance = new Chart(statusCtx, {
        type: 'pie',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [
              '#FFA726',
              '#66BB6A',
              '#42A5F5',
              '#EC407A',
              '#7E57C2',
              '#26A69A'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    };

    const updateCharts = async () => {
      try {
        // Cập nhật dữ liệu biểu đồ doanh thu
        const revenueData = await reportService.getRevenueData(revenueTimeRange.value);
        revenueChartInstance.data.labels = revenueData.labels;
        revenueChartInstance.data.datasets[0].data = revenueData.values;
        revenueChartInstance.update();

        // Cập nhật dữ liệu biểu đồ sản phẩm bán chạy
        const topProductsData = await reportService.getTopProducts();
        topProductsChartInstance.data.labels = topProductsData.labels;
        topProductsChartInstance.data.datasets[0].data = topProductsData.values;
        topProductsChartInstance.update();

        // Cập nhật dữ liệu biểu đồ trạng thái đơn hàng
        const orderStatusData = await reportService.getOrderStatusDistribution();
        orderStatusChartInstance.data.labels = orderStatusData.labels;
        orderStatusChartInstance.data.datasets[0].data = orderStatusData.values;
        orderStatusChartInstance.update();
      } catch (error) {
        console.error('Error updating charts:', error);
      }
    };

    const fetchReportData = async () => {
      loading.value = true;
      try {
        // Lấy thống kê tổng quan
        const overview = await reportService.getOverview();
        totalRevenue.value = overview.totalRevenue;
        revenueGrowth.value = overview.revenueGrowth;
        newOrders.value = overview.newOrders;
        orderGrowth.value = overview.orderGrowth;
        newCustomers.value = overview.newCustomers;
        customerGrowth.value = overview.customerGrowth;
        lowStockProducts.value = overview.lowStockProducts;

        // Lấy dữ liệu chi tiết
        revenueData.value = await reportService.getRevenueDetails();
        productData.value = await reportService.getProductDetails();
        customerData.value = await reportService.getCustomerDetails();

        // Cập nhật biểu đồ
        updateCharts();
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    const exportReport = async () => {
      try {
        await reportService.exportReport({
          timeRange: revenueTimeRange.value,
          type: activeTab.value
        });
      } catch (error) {
        console.error('Error exporting report:', error);
      }
    };

    // Theo dõi thay đổi khoảng thời gian
    watch(revenueTimeRange, () => {
      updateCharts();
    });

    onMounted(() => {
      initCharts();
      fetchReportData();
    });

    return {
      loading,
      activeTab,
      revenueTimeRange,
      revenueChart,
      topProductsChart,
      orderStatusChart,
      totalRevenue,
      revenueGrowth,
      newOrders,
      orderGrowth,
      newCustomers,
      customerGrowth,
      lowStockProducts,
      revenueData,
      productData,
      customerData,
      revenueHeaders,
      productHeaders,
      customerHeaders,
      formatCurrency,
      exportReport
    };
  }
};
</script>

<style scoped>
.report-list {
  padding: 20px;
}
</style> 