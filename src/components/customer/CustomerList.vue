<template>
  <div class="customer-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quản lý khách hàng</span>
        <v-btn color="primary" @click="exportCustomers">
          <v-icon left>mdi-download</v-icon>
          Xuất danh sách
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Bộ lọc -->
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="Tìm kiếm"
              prepend-icon="mdi-magnify"
              clearable
              @input="handleSearch"
              placeholder="Tên, email, số điện thoại..."
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Trạng thái"
              clearable
              @change="handleFilter"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Sắp xếp theo"
              @change="handleSort"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.dateRange"
              :items="dateRangeOptions"
              label="Khoảng thời gian"
              clearable
              @change="handleFilter"
            ></v-select>
          </v-col>
        </v-row>

        <!-- Bảng danh sách khách hàng -->
        <v-data-table
          :headers="headers"
          :items="customers"
          :loading="loading"
          :options.sync="tableOptions"
          :server-items-length="totalCustomers"
          :footer-props="{
            'items-per-page-options': [10, 20, 50, 100],
            'items-per-page-text': 'Số khách hàng mỗi trang'
          }"
          class="elevation-1"
        >
          <!-- Cột trạng thái -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
              label
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- Cột ngày tạo -->
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <!-- Cột tổng chi tiêu -->
          <template v-slot:item.totalSpent="{ item }">
            {{ formatCurrency(item.totalSpent) }}
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
                  @click="viewCustomerDetails(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>Xem chi tiết</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="viewCustomerOrders(item)"
                >
                  <v-icon>mdi-cart</v-icon>
                </v-btn>
              </template>
              <span>Xem đơn hàng</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="toggleCustomerStatus(item)"
                >
                  <v-icon>{{ item.status === 'active' ? 'mdi-close-circle' : 'mdi-check-circle' }}</v-icon>
                </v-btn>
              </template>
              <span>{{ item.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt' }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog xem chi tiết khách hàng -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card v-if="selectedCustomer">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Chi tiết khách hàng</span>
          <v-btn icon @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Họ và tên</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedCustomer.fullName }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Email</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedCustomer.email }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Số điện thoại</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedCustomer.phone }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Địa chỉ</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedCustomer.address }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Ngày tham gia</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(selectedCustomer.createdAt) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Trạng thái</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        :color="getStatusColor(selectedCustomer.status)"
                        small
                        label
                      >
                        {{ getStatusText(selectedCustomer.status) }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Tổng số đơn hàng</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedCustomer.orderCount }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Tổng chi tiêu</v-list-item-title>
                    <v-list-item-subtitle>{{ formatCurrency(selectedCustomer.totalSpent) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <!-- Lịch sử hoạt động -->
          <v-divider class="my-4"></v-divider>
          <h3 class="mb-3">Lịch sử hoạt động</h3>
          <v-timeline dense>
            <v-timeline-item
              v-for="(activity, index) in selectedCustomer.activities"
              :key="index"
              :color="getActivityColor(activity.type)"
              small
            >
              <div class="d-flex justify-space-between">
                <div>
                  <strong>{{ activity.description }}</strong>
                  <div class="text-caption">{{ formatDate(activity.createdAt) }}</div>
                </div>
                <v-chip
                  :color="getActivityColor(activity.type)"
                  small
                  label
                >
                  {{ getActivityText(activity.type) }}
                </v-chip>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="viewCustomerOrders(selectedCustomer)"
          >
            Xem đơn hàng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xem đơn hàng của khách hàng -->
    <v-dialog v-model="ordersDialog" max-width="1000px">
      <v-card v-if="selectedCustomer">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Đơn hàng của {{ selectedCustomer.fullName }}</span>
          <v-btn icon @click="ordersDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-data-table
            :headers="orderHeaders"
            :items="customerOrders"
            :loading="loadingOrders"
            :options.sync="orderTableOptions"
            :server-items-length="totalOrders"
            :footer-props="{
              'items-per-page-options': [10, 20, 50],
              'items-per-page-text': 'Số đơn hàng mỗi trang'
            }"
            class="elevation-1"
          >
            <!-- Cột trạng thái đơn hàng -->
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
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { customerService } from '@/api/services/customerService';
import { orderService } from '@/api/services/orderService';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default {
  name: 'CustomerList',
  setup() {
    // Bảng khách hàng
    const headers = [
      { text: 'Họ và tên', value: 'fullName' },
      { text: 'Email', value: 'email' },
      { text: 'Số điện thoại', value: 'phone' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Ngày tham gia', value: 'createdAt' },
      { text: 'Tổng chi tiêu', value: 'totalSpent' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    // Bảng đơn hàng
    const orderHeaders = [
      { text: 'Mã đơn hàng', value: 'orderNumber' },
      { text: 'Ngày đặt', value: 'createdAt' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Tổng tiền', value: 'totalAmount' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    // Dữ liệu
    const customers = ref([]);
    const customerOrders = ref([]);
    const selectedCustomer = ref(null);
    const totalCustomers = ref(0);
    const totalOrders = ref(0);
    const loading = ref(false);
    const loadingOrders = ref(false);

    // Dialog
    const detailsDialog = ref(false);
    const ordersDialog = ref(false);

    // Bộ lọc
    const filters = reactive({
      search: '',
      status: null,
      sortBy: 'createdAt',
      dateRange: null
    });

    // Tùy chọn bảng
    const tableOptions = ref({
      page: 1,
      itemsPerPage: 10,
      sortBy: ['createdAt'],
      sortDesc: [true]
    });

    const orderTableOptions = ref({
      page: 1,
      itemsPerPage: 10,
      sortBy: ['createdAt'],
      sortDesc: [true]
    });

    // Tùy chọn lọc
    const statusOptions = [
      { text: 'Đang hoạt động', value: 'active' },
      { text: 'Đã khóa', value: 'inactive' }
    ];

    const sortOptions = [
      { text: 'Ngày tham gia (mới nhất)', value: 'createdAt' },
      { text: 'Ngày tham gia (cũ nhất)', value: '-createdAt' },
      { text: 'Tên (A-Z)', value: 'fullName' },
      { text: 'Tên (Z-A)', value: '-fullName' },
      { text: 'Tổng chi tiêu (cao nhất)', value: '-totalSpent' },
      { text: 'Tổng chi tiêu (thấp nhất)', value: 'totalSpent' }
    ];

    const dateRangeOptions = [
      { text: '7 ngày qua', value: '7days' },
      { text: '30 ngày qua', value: '30days' },
      { text: '3 tháng qua', value: '3months' },
      { text: '6 tháng qua', value: '6months' },
      { text: '1 năm qua', value: '1year' }
    ];

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Hàm lấy danh sách khách hàng
    const fetchCustomers = async () => {
      loading.value = true;
      try {
        const params = {
          page: tableOptions.value.page,
          limit: tableOptions.value.itemsPerPage,
          sortBy: tableOptions.value.sortBy[0],
          sortDesc: tableOptions.value.sortDesc[0],
          search: filters.search,
          status: filters.status,
          dateRange: filters.dateRange
        };

        const response = await customerService.getCustomers(params);
        customers.value = response.data;
        totalCustomers.value = response.total;
      } catch (error) {
        console.error('Error fetching customers:', error);
        showSnackbar('Không thể tải danh sách khách hàng', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Hàm lấy đơn hàng của khách hàng
    const fetchCustomerOrders = async () => {
      if (!selectedCustomer.value) return;

      loadingOrders.value = true;
      try {
        const params = {
          page: orderTableOptions.value.page,
          limit: orderTableOptions.value.itemsPerPage,
          sortBy: orderTableOptions.value.sortBy[0],
          sortDesc: orderTableOptions.value.sortDesc[0],
          customerId: selectedCustomer.value.id
        };

        const response = await orderService.getCustomerOrders(params);
        customerOrders.value = response.data;
        totalOrders.value = response.total;
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        showSnackbar('Không thể tải danh sách đơn hàng', 'error');
      } finally {
        loadingOrders.value = false;
      }
    };

    // Hàm xem chi tiết khách hàng
    const viewCustomerDetails = async (customer) => {
      selectedCustomer.value = customer;
      detailsDialog.value = true;
    };

    // Hàm xem đơn hàng của khách hàng
    const viewCustomerOrders = async (customer) => {
      selectedCustomer.value = customer;
      ordersDialog.value = true;
      await fetchCustomerOrders();
    };

    // Hàm xem chi tiết đơn hàng
    const viewOrderDetails = (order) => {
      // Chuyển đến trang chi tiết đơn hàng
      // this.$router.push(`/orders/${order.id}`);
    };

    // Hàm thay đổi trạng thái khách hàng
    const toggleCustomerStatus = async (customer) => {
      try {
        const newStatus = customer.status === 'active' ? 'inactive' : 'active';
        await customerService.updateCustomerStatus(customer.id, newStatus);
        
        // Cập nhật trạng thái trong danh sách
        customer.status = newStatus;
        
        showSnackbar(
          `Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} khách hàng`,
          'success'
        );
      } catch (error) {
        console.error('Error updating customer status:', error);
        showSnackbar('Không thể cập nhật trạng thái khách hàng', 'error');
      }
    };

    // Hàm xuất danh sách khách hàng
    const exportCustomers = async () => {
      try {
        await customerService.exportCustomers(filters);
        showSnackbar('Xuất danh sách khách hàng thành công', 'success');
      } catch (error) {
        console.error('Error exporting customers:', error);
        showSnackbar('Không thể xuất danh sách khách hàng', 'error');
      }
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
      tableOptions.value.page = 1;
      fetchCustomers();
    };

    // Hàm xử lý lọc
    const handleFilter = () => {
      tableOptions.value.page = 1;
      fetchCustomers();
    };

    // Hàm xử lý sắp xếp
    const handleSort = () => {
      fetchCustomers();
    };

    // Hàm lấy màu trạng thái
    const getStatusColor = (status) => {
      switch (status) {
        case 'active':
          return 'success';
        case 'inactive':
          return 'error';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text trạng thái
    const getStatusText = (status) => {
      switch (status) {
        case 'active':
          return 'Đang hoạt động';
        case 'inactive':
          return 'Đã khóa';
        default:
          return 'Không xác định';
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

    // Hàm lấy màu hoạt động
    const getActivityColor = (type) => {
      switch (type) {
        case 'login':
          return 'info';
        case 'order':
          return 'success';
        case 'profile':
          return 'primary';
        case 'password':
          return 'warning';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text hoạt động
    const getActivityText = (type) => {
      switch (type) {
        case 'login':
          return 'Đăng nhập';
        case 'order':
          return 'Đặt hàng';
        case 'profile':
          return 'Cập nhật thông tin';
        case 'password':
          return 'Đổi mật khẩu';
        default:
          return 'Không xác định';
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

    // Theo dõi thay đổi tùy chọn bảng
    watch(tableOptions, () => {
      fetchCustomers();
    }, { deep: true });

    // Theo dõi thay đổi tùy chọn bảng đơn hàng
    watch(orderTableOptions, () => {
      fetchCustomerOrders();
    }, { deep: true });

    // Theo dõi thay đổi dialog đơn hàng
    watch(ordersDialog, (value) => {
      if (!value) {
        customerOrders.value = [];
        totalOrders.value = 0;
      }
    });

    onMounted(() => {
      fetchCustomers();
    });

    return {
      headers,
      orderHeaders,
      customers,
      customerOrders,
      selectedCustomer,
      totalCustomers,
      totalOrders,
      loading,
      loadingOrders,
      detailsDialog,
      ordersDialog,
      filters,
      tableOptions,
      orderTableOptions,
      statusOptions,
      sortOptions,
      dateRangeOptions,
      snackbar,
      viewCustomerDetails,
      viewCustomerOrders,
      viewOrderDetails,
      toggleCustomerStatus,
      exportCustomers,
      handleSearch,
      handleFilter,
      handleSort,
      getStatusColor,
      getStatusText,
      getOrderStatusColor,
      getOrderStatusText,
      getActivityColor,
      getActivityText,
      formatDate,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.customer-list {
  padding: 20px;
}
</style> 