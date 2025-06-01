<template>
  <div class="report-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Báo cáo thống kê</h1>
          <div>
            <v-btn
              color="primary"
              class="mr-2"
              @click="exportReport"
              :loading="exporting"
            >
              <v-icon left>mdi-file-export</v-icon>
              Xuất báo cáo
            </v-btn>
            <v-btn
              color="success"
              @click="refreshData"
              :loading="loading"
            >
              <v-icon left>mdi-refresh</v-icon>
              Làm mới
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Bộ lọc thời gian -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-select
            v-model="timeRange"
            :items="timeRangeOptions"
            label="Khoảng thời gian"
            @change="handleTimeRangeChange"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRangeText"
                label="Tùy chọn khoảng thời gian"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                clearable
                @click:clear="clearDateRange"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dateRange"
              range
              @input="dateMenu = false"
              @change="handleDateRangeChange"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="groupBy"
            :items="groupByOptions"
            label="Nhóm theo"
            @change="handleGroupByChange"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Thống kê tổng quan -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-card class="mx-auto" color="primary" dark>
            <v-card-text>
              <div class="text-h6">Tổng doanh thu</div>
              <div class="text-h4">{{ formatCurrency(overview.totalRevenue) }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="overview.revenueGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                  {{ overview.revenueGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span>{{ Math.abs(overview.revenueGrowth) }}% so với kỳ trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="mx-auto" color="success" dark>
            <v-card-text>
              <div class="text-h6">Đơn hàng mới</div>
              <div class="text-h4">{{ overview.newOrders }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="overview.ordersGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                  {{ overview.ordersGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span>{{ Math.abs(overview.ordersGrowth) }}% so với kỳ trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="mx-auto" color="info" dark>
            <v-card-text>
              <div class="text-h6">Khách hàng mới</div>
              <div class="text-h4">{{ overview.newCustomers }}</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="overview.customersGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                  {{ overview.customersGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span>{{ Math.abs(overview.customersGrowth) }}% so với kỳ trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="mx-auto" color="warning" dark>
            <v-card-text>
              <div class="text-h6">Tỷ lệ chuyển đổi</div>
              <div class="text-h4">{{ overview.conversionRate }}%</div>
              <div class="d-flex align-center mt-2">
                <v-icon :color="overview.conversionGrowth >= 0 ? 'success' : 'error'" class="mr-1">
                  {{ overview.conversionGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span>{{ Math.abs(overview.conversionGrowth) }}% so với kỳ trước</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Biểu đồ doanh thu -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Biểu đồ doanh thu</span>
              <v-btn-toggle v-model="revenueChartType" mandatory>
                <v-btn small value="line">
                  <v-icon>mdi-chart-line</v-icon>
                </v-btn>
                <v-btn small value="bar">
                  <v-icon>mdi-chart-bar</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text>
              <v-chart
                :option="revenueChartOption"
                :autoresize="true"
                style="height: 400px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Biểu đồ phân bố đơn hàng -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Phân bố đơn hàng theo trạng thái</v-card-title>
            <v-card-text>
              <v-chart
                :option="orderStatusChartOption"
                :autoresize="true"
                style="height: 300px"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Phân bố đơn hàng theo phương thức thanh toán</v-card-title>
            <v-card-text>
              <v-chart
                :option="paymentMethodChartOption"
                :autoresize="true"
                style="height: 300px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Top sản phẩm bán chạy -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Top sản phẩm bán chạy</span>
              <v-btn-toggle v-model="topProductsType" mandatory>
                <v-btn small value="revenue">
                  <v-icon>mdi-currency-usd</v-icon>
                  Doanh thu
                </v-btn>
                <v-btn small value="quantity">
                  <v-icon>mdi-package-variant</v-icon>
                  Số lượng
                </v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="topProductsHeaders"
                :items="topProducts"
                :loading="loading"
                hide-default-footer
              >
                <template v-slot:item.image="{ item }">
                  <v-avatar size="40">
                    <v-img :src="item.image" :alt="item.name"></v-img>
                  </v-avatar>
                </template>
                <template v-slot:item.revenue="{ item }">
                  {{ formatCurrency(item.revenue) }}
                </template>
                <template v-slot:item.growth="{ item }">
                  <div class="d-flex align-center">
                    <v-icon :color="item.growth >= 0 ? 'success' : 'error'" class="mr-1">
                      {{ item.growth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                    </v-icon>
                    <span>{{ Math.abs(item.growth) }}%</span>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Phân tích khách hàng -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Phân bố khách hàng theo khu vực</v-card-title>
            <v-card-text>
              <v-chart
                :option="customerRegionChartOption"
                :autoresize="true"
                style="height: 300px"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Phân bố khách hàng theo độ tuổi</v-card-title>
            <v-card-text>
              <v-chart
                :option="customerAgeChartOption"
                :autoresize="true"
                style="height: 300px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dialog xuất báo cáo -->
      <v-dialog v-model="exportDialog" max-width="500px">
        <v-card>
          <v-card-title>Xuất báo cáo</v-card-title>
          <v-card-text>
            <v-form ref="exportForm" v-model="exportFormValid">
              <v-select
                v-model="exportData.type"
                :items="exportTypeOptions"
                label="Loại báo cáo"
                :rules="[v => !!v || 'Vui lòng chọn loại báo cáo']"
                required
              ></v-select>
              <v-select
                v-model="exportData.format"
                :items="exportFormatOptions"
                label="Định dạng"
                :rules="[v => !!v || 'Vui lòng chọn định dạng']"
                required
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="exportDialog = false">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="confirmExport" :loading="exporting">
              Xuất
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar thông báo -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.text }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar.show = false">
            Đóng
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { reportService } from '@/api/services/reportService';
import { formatDate, formatCurrency } from '@/utils/formatters';

// Đăng ký các components cần thiết
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default {
  name: 'ReportView',
  components: {
    VChart
  },
  setup() {
    // Dữ liệu
    const loading = ref(false);
    const exporting = ref(false);
    const dateMenu = ref(false);
    const exportDialog = ref(false);
    const exportForm = ref(null);
    const exportFormValid = ref(false);

    // Bộ lọc
    const timeRange = ref('week');
    const dateRange = ref([]);
    const groupBy = ref('day');

    // Biểu đồ
    const revenueChartType = ref('line');
    const topProductsType = ref('revenue');

    // Tùy chọn
    const timeRangeOptions = [
      { text: '7 ngày qua', value: 'week' },
      { text: '30 ngày qua', value: 'month' },
      { text: '90 ngày qua', value: 'quarter' },
      { text: '365 ngày qua', value: 'year' },
      { text: 'Tùy chọn', value: 'custom' }
    ];

    const groupByOptions = [
      { text: 'Theo ngày', value: 'day' },
      { text: 'Theo tuần', value: 'week' },
      { text: 'Theo tháng', value: 'month' }
    ];

    const exportTypeOptions = [
      { text: 'Báo cáo tổng quan', value: 'overview' },
      { text: 'Báo cáo doanh thu', value: 'revenue' },
      { text: 'Báo cáo đơn hàng', value: 'orders' },
      { text: 'Báo cáo sản phẩm', value: 'products' },
      { text: 'Báo cáo khách hàng', value: 'customers' }
    ];

    const exportFormatOptions = [
      { text: 'Excel', value: 'xlsx' },
      { text: 'PDF', value: 'pdf' },
      { text: 'CSV', value: 'csv' }
    ];

    // Headers cho bảng top sản phẩm
    const topProductsHeaders = [
      { text: 'Hình ảnh', value: 'image', sortable: false },
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Mã sản phẩm', value: 'code' },
      { text: 'Danh mục', value: 'category' },
      { text: 'Số lượng bán', value: 'quantity' },
      { text: 'Doanh thu', value: 'revenue' },
      { text: 'Tăng trưởng', value: 'growth' }
    ];

    // Dữ liệu thống kê
    const overview = reactive({
      totalRevenue: 0,
      revenueGrowth: 0,
      newOrders: 0,
      ordersGrowth: 0,
      newCustomers: 0,
      customersGrowth: 0,
      conversionRate: 0,
      conversionGrowth: 0
    });

    const topProducts = ref([]);

    // Dữ liệu xuất báo cáo
    const exportData = reactive({
      type: 'overview',
      format: 'xlsx'
    });

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Computed
    const dateRangeText = computed(() => {
      if (!dateRange.value || dateRange.value.length !== 2) return '';
      return `${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`;
    });

    // Cấu hình biểu đồ doanh thu
    const revenueChartOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const date = params[0].axisValue;
          let result = `<div class="font-weight-bold">${date}</div>`;
          params.forEach(param => {
            result += `<div>${param.seriesName}: ${formatCurrency(param.value)}</div>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Doanh thu', 'Đơn hàng']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: revenueChartType.value === 'line',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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
          type: revenueChartType.value,
          data: [15000000, 25000000, 18000000, 22000000, 30000000, 35000000, 28000000],
          itemStyle: {
            color: '#1976D2'
          },
          areaStyle: revenueChartType.value === 'line' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(25, 118, 210, 0.3)' },
                { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
              ]
            }
          } : undefined
        },
        {
          name: 'Đơn hàng',
          type: revenueChartType.value,
          data: [15, 25, 18, 22, 30, 35, 28],
          itemStyle: {
            color: '#4CAF50'
          },
          areaStyle: revenueChartType.value === 'line' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(76, 175, 80, 0.3)' },
                { offset: 1, color: 'rgba(76, 175, 80, 0.1)' }
              ]
            }
          } : undefined
        }
      ]
    }));

    // Cấu hình biểu đồ trạng thái đơn hàng
    const orderStatusChartOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy']
      },
      series: [
        {
          name: 'Trạng thái đơn hàng',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 15, name: 'Chờ xác nhận' },
            { value: 25, name: 'Đã xác nhận' },
            { value: 30, name: 'Đang giao' },
            { value: 20, name: 'Đã giao' },
            { value: 10, name: 'Đã hủy' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }));

    // Cấu hình biểu đồ phương thức thanh toán
    const paymentMethodChartOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['VNPay', 'Momo', 'COD']
      },
      series: [
        {
          name: 'Phương thức thanh toán',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 40, name: 'VNPay' },
            { value: 30, name: 'Momo' },
            { value: 30, name: 'COD' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }));

    // Cấu hình biểu đồ khu vực khách hàng
    const customerRegionChartOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Khác']
      },
      series: [
        {
          name: 'Khu vực',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 35, name: 'Hà Nội' },
            { value: 30, name: 'Hồ Chí Minh' },
            { value: 15, name: 'Đà Nẵng' },
            { value: 10, name: 'Hải Phòng' },
            { value: 10, name: 'Khác' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }));

    // Cấu hình biểu đồ độ tuổi khách hàng
    const customerAgeChartOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Nam', 'Nữ']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['18-24', '25-34', '35-44', '45-54', '55+']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Nam',
          type: 'bar',
          stack: 'total',
          data: [20, 30, 25, 15, 10],
          itemStyle: {
            color: '#1976D2'
          }
        },
        {
          name: 'Nữ',
          type: 'bar',
          stack: 'total',
          data: [25, 35, 20, 20, 15],
          itemStyle: {
            color: '#E91E63'
          }
        }
      ]
    }));

    // Hàm lấy dữ liệu thống kê
    const fetchReportData = async () => {
      loading.value = true;
      try {
        const params = {
          timeRange: timeRange.value,
          startDate: dateRange.value[0],
          endDate: dateRange.value[1],
          groupBy: groupBy.value
        };

        const response = await reportService.getReportData(params);
        
        // Cập nhật dữ liệu tổng quan
        Object.assign(overview, response.overview);
        
        // Cập nhật dữ liệu top sản phẩm
        topProducts.value = response.topProducts;
        
        // Cập nhật dữ liệu biểu đồ
        // TODO: Cập nhật dữ liệu cho các biểu đồ
        
      } catch (error) {
        console.error('Error fetching report data:', error);
        showSnackbar('Không thể tải dữ liệu báo cáo', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Hàm xử lý thay đổi khoảng thời gian
    const handleTimeRangeChange = () => {
      if (timeRange.value === 'custom') {
        dateMenu.value = true;
      } else {
        // Tính toán khoảng thời gian dựa trên lựa chọn
        const end = new Date();
        let start = new Date();
        
        switch (timeRange.value) {
          case 'week':
            start.setDate(start.getDate() - 7);
            break;
          case 'month':
            start.setDate(start.getDate() - 30);
            break;
          case 'quarter':
            start.setDate(start.getDate() - 90);
            break;
          case 'year':
            start.setDate(start.getDate() - 365);
            break;
        }
        
        dateRange.value = [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
        fetchReportData();
      }
    };

    // Hàm xử lý thay đổi khoảng thời gian tùy chọn
    const handleDateRangeChange = () => {
      if (dateRange.value && dateRange.value.length === 2) {
        timeRange.value = 'custom';
        fetchReportData();
      }
    };

    // Hàm xử lý thay đổi nhóm
    const handleGroupByChange = () => {
      fetchReportData();
    };

    // Hàm xóa khoảng thời gian
    const clearDateRange = () => {
      dateRange.value = [];
      timeRange.value = 'week';
      fetchReportData();
    };

    // Hàm làm mới dữ liệu
    const refreshData = () => {
      fetchReportData();
    };

    // Hàm xuất báo cáo
    const exportReport = () => {
      exportDialog.value = true;
    };

    // Hàm xác nhận xuất báo cáo
    const confirmExport = async () => {
      if (!exportForm.value.validate()) return;

      exporting.value = true;
      try {
        await reportService.exportReport({
          type: exportData.type,
          format: exportData.format,
          timeRange: timeRange.value,
          startDate: dateRange.value[0],
          endDate: dateRange.value[1],
          groupBy: groupBy.value
        });
        
        showSnackbar('Xuất báo cáo thành công', 'success');
        exportDialog.value = false;
      } catch (error) {
        console.error('Error exporting report:', error);
        showSnackbar('Không thể xuất báo cáo', 'error');
      } finally {
        exporting.value = false;
      }
    };

    // Hàm hiển thị snackbar
    const showSnackbar = (text, color = 'success') => {
      snackbar.value = {
        show: true,
        text,
        color
      };
    };

    // Theo dõi thay đổi loại biểu đồ
    watch([revenueChartType, topProductsType], () => {
      fetchReportData();
    });

    onMounted(() => {
      fetchReportData();
    });

    return {
      loading,
      exporting,
      dateMenu,
      exportDialog,
      exportForm,
      exportFormValid,
      timeRange,
      dateRange,
      groupBy,
      revenueChartType,
      topProductsType,
      timeRangeOptions,
      groupByOptions,
      exportTypeOptions,
      exportFormatOptions,
      topProductsHeaders,
      overview,
      topProducts,
      exportData,
      snackbar,
      dateRangeText,
      revenueChartOption,
      orderStatusChartOption,
      paymentMethodChartOption,
      customerRegionChartOption,
      customerAgeChartOption,
      handleTimeRangeChange,
      handleDateRangeChange,
      handleGroupByChange,
      clearDateRange,
      refreshData,
      exportReport,
      confirmExport,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.report-view {
  padding: 20px;
}
</style> 