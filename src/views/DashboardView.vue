<template>
  <div class="dashboard">
    <v-container fluid>
      <!-- Thống kê tổng quan -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="primary" dark>
            <v-card-text>
              <div class="text-h6">Tổng doanh thu</div>
              <div class="text-h4">{{ formatCurrency(statistics.totalRevenue) }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="statistics.revenueGrowth >= 0 ? 'success' : 'error'">
                  {{ statistics.revenueGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span class="ml-1">{{ Math.abs(statistics.revenueGrowth) }}% so với tháng trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="success" dark>
            <v-card-text>
              <div class="text-h6">Đơn hàng mới</div>
              <div class="text-h4">{{ statistics.newOrders }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="statistics.orderGrowth >= 0 ? 'success' : 'error'">
                  {{ statistics.orderGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span class="ml-1">{{ Math.abs(statistics.orderGrowth) }}% so với tháng trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="info" dark>
            <v-card-text>
              <div class="text-h6">Khách hàng mới</div>
              <div class="text-h4">{{ statistics.newCustomers }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="statistics.customerGrowth >= 0 ? 'success' : 'error'">
                  {{ statistics.customerGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span class="ml-1">{{ Math.abs(statistics.customerGrowth) }}% so với tháng trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="mx-auto" color="warning" dark>
            <v-card-text>
              <div class="text-h6">Sản phẩm sắp hết</div>
              <div class="text-h4">{{ statistics.lowStockProducts }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="statistics.lowStockGrowth >= 0 ? 'error' : 'success'">
                  {{ statistics.lowStockGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span class="ml-1">{{ Math.abs(statistics.lowStockGrowth) }}% so với tháng trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Biểu đồ doanh thu -->
      <v-row class="mt-4">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Doanh thu theo thời gian</span>
              <v-btn-toggle v-model="revenueChart.period" mandatory>
                <v-btn small value="week">Tuần</v-btn>
                <v-btn small value="month">Tháng</v-btn>
                <v-btn small value="year">Năm</v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text>
              <v-chart class="chart" :option="revenueChart.option" autoresize />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Sản phẩm bán chạy</v-card-title>
            <v-card-text>
              <v-chart class="chart" :option="topProductsChart.option" autoresize />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Đơn hàng gần đây -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Đơn hàng gần đây</span>
              <v-btn color="primary" text @click="viewAllOrders">
                Xem tất cả
                <v-icon right>mdi-chevron-right</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="recentOrders.headers"
                :items="recentOrders.items"
                :loading="recentOrders.loading"
                :items-per-page="5"
                class="elevation-1"
              >
                <!-- Cột trạng thái -->
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getOrderStatusColor(item.status)"
                    small
                    label
                  >
                    {{ getOrderStatusText(item.status) }}
                  </v-chip>
                </template>

                <!-- Cột ngày tạo -->
                <template v-slot:item.createdAt="{ item }">
                  {{ formatDate(item.createdAt) }}
                </template>

                <!-- Cột tổng tiền -->
                <template v-slot:item.totalAmount="{ item }">
                  {{ formatCurrency(item.totalAmount) }}
                </template>

                <!-- Cột thao tác -->
                <template v-slot:item.actions="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        v-bind="attrs"
                        v-on="on"
                        @click="viewOrderDetails(item)"
                      >
                        <v-icon>mdi-eye</v-icon>
                      </v-btn>
                    </template>
                    <span>Xem chi tiết</span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { statisticsService } from '@/api/services/statisticsService';
import { orderService } from '@/api/services/orderService';
import { formatDate, formatCurrency } from '@/utils/formatters';

// Đăng ký các components cần thiết cho ECharts
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default {
  name: 'DashboardView',
  components: {
    VChart
  },
  setup() {
    const router = useRouter();

    // Thống kê tổng quan
    const statistics = reactive({
      totalRevenue: 0,
      revenueGrowth: 0,
      newOrders: 0,
      orderGrowth: 0,
      newCustomers: 0,
      customerGrowth: 0,
      lowStockProducts: 0,
      lowStockGrowth: 0
    });

    // Biểu đồ doanh thu
    const revenueChart = reactive({
      period: 'month',
      option: {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const data = params[0];
            return `${data.name}<br/>${formatCurrency(data.value)}`;
          }
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => formatCurrency(value)
          }
        },
        series: [
          {
            name: 'Doanh thu',
            type: 'line',
            data: [],
            smooth: true,
            areaStyle: {
              opacity: 0.3
            }
          }
        ]
      }
    });

    // Biểu đồ sản phẩm bán chạy
    const topProductsChart = reactive({
      option: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          type: 'scroll'
        },
        series: [
          {
            name: 'Sản phẩm bán chạy',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      }
    });

    // Đơn hàng gần đây
    const recentOrders = reactive({
      loading: false,
      headers: [
        { text: 'Mã đơn hàng', value: 'orderNumber' },
        { text: 'Khách hàng', value: 'customerName' },
        { text: 'Tổng tiền', value: 'totalAmount' },
        { text: 'Trạng thái', value: 'status' },
        { text: 'Ngày tạo', value: 'createdAt' },
        { text: 'Thao tác', value: 'actions', sortable: false }
      ],
      items: []
    });

    // Hàm lấy thống kê tổng quan
    const fetchStatistics = async () => {
      try {
        const response = await statisticsService.getOverview();
        Object.assign(statistics, response);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    // Hàm lấy dữ liệu biểu đồ doanh thu
    const fetchRevenueData = async () => {
      try {
        const response = await statisticsService.getRevenueChart(revenueChart.period);
        revenueChart.option.xAxis.data = response.labels;
        revenueChart.option.series[0].data = response.data;
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    // Hàm lấy dữ liệu sản phẩm bán chạy
    const fetchTopProducts = async () => {
      try {
        const response = await statisticsService.getTopProducts();
        topProductsChart.option.series[0].data = response.map(item => ({
          name: item.name,
          value: item.soldCount
        }));
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    // Hàm lấy đơn hàng gần đây
    const fetchRecentOrders = async () => {
      recentOrders.loading = true;
      try {
        const response = await orderService.getRecentOrders();
        recentOrders.items = response;
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        recentOrders.loading = false;
      }
    };

    // Hàm lấy màu trạng thái đơn hàng
    const getOrderStatusColor = (status) => {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'processing':
          return 'info';
        case 'shipped':
          return 'primary';
        case 'delivered':
          return 'success';
        case 'cancelled':
          return 'error';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text trạng thái đơn hàng
    const getOrderStatusText = (status) => {
      switch (status) {
        case 'pending':
          return 'Chờ xác nhận';
        case 'processing':
          return 'Đang xử lý';
        case 'shipped':
          return 'Đã giao hàng';
        case 'delivered':
          return 'Đã nhận hàng';
        case 'cancelled':
          return 'Đã hủy';
        default:
          return 'Không xác định';
      }
    };

    // Hàm xem chi tiết đơn hàng
    const viewOrderDetails = (order) => {
      router.push(`/orders/${order.id}`);
    };

    // Hàm xem tất cả đơn hàng
    const viewAllOrders = () => {
      router.push('/orders');
    };

    // Theo dõi thay đổi khoảng thời gian biểu đồ doanh thu
    watch(() => revenueChart.period, () => {
      fetchRevenueData();
    });

    onMounted(() => {
      fetchStatistics();
      fetchRevenueData();
      fetchTopProducts();
      fetchRecentOrders();
    });

    return {
      statistics,
      revenueChart,
      topProductsChart,
      recentOrders,
      getOrderStatusColor,
      getOrderStatusText,
      viewOrderDetails,
      viewAllOrders,
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

.chart {
  height: 400px;
}
</style> 