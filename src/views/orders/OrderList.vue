<template>
  <v-container>
    <!-- Header với tìm kiếm và bộ lọc -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm đơn hàng" variant="outlined"
          hide-details placeholder="Mã đơn hàng, tên khách hàng..."></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center justify-end gap-2">
        <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel">
          Xuất Excel
        </v-btn>
        <v-btn color="info" prepend-icon="mdi-filter" @click="showFilterDialog">
          Bộ lọc
        </v-btn>
      </v-col>
    </v-row>

    <!-- Thống kê nhanh -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Tổng đơn hàng</div>
                <div class="text-h5">{{ formatNumber(statistics.totalOrders) }}</div>
              </div>
              <v-icon color="primary" size="40">mdi-shopping</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Doanh thu</div>
                <div class="text-h5">{{ formatCurrency(statistics.totalRevenue) }}</div>
              </div>
              <v-icon color="success" size="40">mdi-currency-usd</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Đơn chờ xử lý</div>
                <div class="text-h5">{{ formatNumber(statistics.pendingOrders) }}</div>
              </div>
              <v-icon color="warning" size="40">mdi-clock-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Đơn hủy</div>
                <div class="text-h5">{{ formatNumber(statistics.cancelledOrders) }}</div>
              </div>
              <v-icon color="error" size="40">mdi-close-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bảng đơn hàng -->
    <v-card>
      <v-data-table-server :headers="headers" :items="filteredOrders" :items-length="totalItems" :search="search"
        :items-per-page="itemsPerPage" :loading="loading" @update:options="updateOptions">
        <template v-slot:item.orderCode="{ item }">
          <div class="font-weight-medium">#{{ item.orderCode }}</div>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex justify-start px-4">
            <v-avatar size="50" class="mr-2">
              <v-img v-if="avatarUrl" :src="avatarUrl" />
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium text-left">{{ item.name }}</div>
              <div class="text-caption text-left">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.totalAmount="{ item }">
          {{ formatCurrency(item.totalAmount) }}
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" :text-color="getStatusTextColor(item.status)" size="small">
            {{ displayStatus(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.createdAt="{ item }">
          <div>{{ formatDate(item.createdAt) }}</div>
          <div class="text-caption">{{ formatTime(item.createdAt) }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Xem chi tiết" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-eye" variant="text" color="primary" size="small" v-bind="props"
                @click="showOrderDetail(item.id)"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="In đơn hàng" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-printer" variant="text" color="info" size="small" v-bind="props"
                @click="handlePrintOrder(item.id)"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Cập nhật trạng thái" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-pencil" variant="text" color="warning" size="small" v-bind="props"
                @click="showUpdateStatus(item)"></v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Dialog chi tiết đơn hàng -->
    <v-dialog v-model="orderDetailDialog" max-width="800">
      <v-card v-if="orderDetails">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Chi tiết đơn hàng #{{ orderDetails.orderCode }}</span>
          <v-btn icon="mdi-close" variant="text" @click="orderDetailDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Thông tin khách hàng</h3>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>{{ orderDetails.shippingAddresses[0].name }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>{{ orderDetails.shippingAddresses[0].email }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title>{{ orderDetails.shippingAddresses[0].phone }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Thông tin giao hàng</h3>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">{{ getIconByStatus(orderDetails.status) }}</v-icon>
                  </template>
                  <v-list-item-title>{{ displayStatus(orderDetails.status) }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-truck-delivery</v-icon>
                  </template>
                  <v-list-item-title>Giao hàng nhanh</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-credit-card</v-icon>
                  </template>
                  <v-list-item-title>Tiền mặt</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title>{{ orderDetails.shippingAddresses[0].fullAddress }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">Sản phẩm</h3>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th class="text-right">Số lượng</th>
                <th class="text-right">Đơn giá</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in orderDetails.orderItem" :key="item.id">
                <td>
                  <div class="d-flex align-center">
                    <v-img :src="fetchCloudinaryUrl(item.imageVariant)" :lazy-src="image_error" width="40" height="40"
                      class="rounded mr-2"></v-img>
                    <div>
                      <div class="font-weight-medium">{{ item.productName }}</div>
                      <div class="text-caption text-xs d-flex justify-space-between align-center">
                        <span>{{ item.productCode }}</span>
                        <span>{{ item.colorName }}/{{ item.sizeName }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-right">{{ item.quantity }}</td>
                <td class="text-right">{{ formatCurrency(item.price) }}</td>
                <td class="text-right">{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold">Tạm tính:</td>
                <td class="text-right">{{ formatCurrency(orderDetails.totalAmount - orderDetails.shippingFee) }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right font-weight-bold">Phí vận chuyển:</td>
                <td class="text-right">{{ formatCurrency(orderDetails.shippingFee) }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right font-weight-bold">Tổng cộng:</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(orderDetails.totalAmount) }}</td>
              </tr>
            </tfoot>
          </v-table>

          <v-divider class="my-4"></v-divider>

          <v-card-text>
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Lịch sử đơn hàng</h3>
            <v-card-text>Cập nhập gần đây: {{ formatTime(orderDetails.updatedAt) }} {{
              formatDate(orderDetails.updatedAt)
            }}</v-card-text>
            <v-timeline density="compact" align="start" direction="horizontal" class="my-4">
              <v-timeline-item v-for="(label, status) in statusMapping" :key="status"
                :dot-color="getStatusColor(+status)" size="small" :elevation="+status === selectedOrder ? 6 : 0"
                :fill-dot="+status === selectedOrder" :class="{ 'active-timeline': +status === selectedOrder }">
                <div class="text-center px-2">
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ label }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>


        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" prepend-icon="mdi-printer" @click="printOrder(orderDetails)">
            In đơn hàng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog cập nhật trạng thái -->
    <v-dialog v-model="updateStatusDialog" max-width="500">
      <v-card>
        <v-card-title>Cập nhật trạng thái đơn hàng</v-card-title>
        <v-card-text>
          <v-select v-model="newStatus" :items="statusOptions" item-title="label" item-value="value"
            label="Trạng thái mới" variant="outlined" class="mb-4"></v-select>
          <v-textarea v-model="statusNote" label="Ghi chú" variant="outlined" rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="updateStatusDialog = false">Hủy</v-btn>
          <v-btn color="primary" @click="updateOrderStatus" :loading="updating">
            Cập nhật
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog bộ lọc -->
    <v-dialog v-model="filterDialog" max-width="600">
      <v-card>
        <v-card-title>Bộ lọc nâng cao</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select v-model="filters.status" :items="statusOptions" item-title="label" item-value="value"
                label="Trạng thái đơn hàng" variant="outlined" clearable></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="filters.dateFrom" label="Từ ngày" type="date" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="filters.dateTo" label="Đến ngày" type="date" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="filters.minTotal" label="Giá trị tối thiểu" type="number" variant="outlined"
                prefix="₫"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="filters.maxTotal" label="Giá trị tối đa" type="number" variant="outlined"
                prefix="₫"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="resetFilters">Đặt lại</v-btn>
          <v-btn color="primary" @click="applyFilters">Áp dụng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx';
import { orderService } from "../../api/services/orderService";
import { getCloudinaryUrl } from "../../utils/cloudinary";
import image_error from "../../assets/image_error.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './../../assets/fonts/roboto/Roboto_Condensed-Light';

export default {
  name: 'OrderList',
  data() {
    return {
      page: 1,
      itemsPerPage: 10,
      search: '',
      loading: false,
      updating: false,
      orderDetailDialog: false,
      updateStatusDialog: false,
      filterDialog: false,
      selectedOrder: null,
      newStatus: '',
      statusNote: '',
      headers: [
        { title: 'Mã đơn hàng', key: 'orderCode', align: 'center', sortable: true },
        { title: 'Khách hàng', key: 'name', align: 'center', sortable: true },
        { title: 'Tổng tiền', key: 'totalAmount', align: 'center', sortable: true },
        { title: 'Trạng thái', key: 'status', align: 'center', sortable: true },
        { title: 'Ngày tạo', key: 'createdAt', align: 'center', sortable: true },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      statistics: {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        cancelledOrders: 0
      },
      filters: {
        status: null,
        paymentStatus: null,
        dateFrom: null,
        dateTo: null,
        minTotal: null,
        maxTotal: null
      },
      orderStatuses: [
        'Chờ xác nhận',
        'Đã xác nhận',
        'Đang xử lý',
        'Đang giao hàng',
        'Đã giao hàng',
        'Đã hủy'
      ],
      statusMapping: {
        1: 'Chờ xử lý',
        2: 'Đã duyệt',
        3: 'Đang giao hàng',
        4: 'Giao hàng thành công',
        5: 'Đã hủy',
      },
      paymentStatuses: [
        'Chưa thanh toán',
        'Đã thanh toán',
        'Hoàn tiền'
      ],
      orders: [],
      orderDetails: null,
    };
  },
  computed: {
    filteredOrders() {
      let result = [...this.orders];

      if (this.filters.status) {
        result = result.filter(order => order.status === this.filters.status);
      }

      if (this.filters.paymentStatus) {
        result = result.filter(order => order.paymentStatus === this.filters.paymentStatus);
      }

      if (this.filters.dateFrom) {
        const fromDate = new Date(this.filters.dateFrom);
        result = result.filter(order => new Date(order.createdAt) >= fromDate);
      }

      if (this.filters.dateTo) {
        const toDate = new Date(this.filters.dateTo);
        result = result.filter(order => new Date(order.createdAt) <= toDate);
      }

      if (this.filters.minTotal) {
        result = result.filter(order => order.total >= this.filters.minTotal);
      }

      if (this.filters.maxTotal) {
        result = result.filter(order => order.total <= this.filters.maxTotal);
      }

      return result;
    },
    statusOptions() {
      return Object.entries(this.statusMapping).map(([key, label]) => ({
        value: parseInt(key), // Key as a number (1, 2, 3, etc.)
        label, // Display label (e.g., "Chờ xử lý")
      }));
    }
  },
  mounted() {
    this.fetchOrder();
    this.fetchOrderStatistics();
  },
  methods: {
    async fetchOrder() {
      try {
        this.loading = true;

        const request = {
          page: this.page - 1,
          size: this.itemsPerPage,
        }

        const res = await orderService.getAllOrders(request);
        const data = res.data.data;
        this.orders = data.content;
        this.totalItems = data.totalElements;

        console.log("FetchOrder: ", res.data);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log("Error FetchOrder: ", error)
      }
    },
    async fetchOrderStatistics() {
      try {
        const res = await orderService.getOrderStatistics();
        const data = res.data.data;

        this.statistics.totalOrders = data.totalOrders;
        this.statistics.totalRevenue = data.totalRevenue;
        this.statistics.pendingOrders = data.pendingOrders;
        this.statistics.cancelledOrders = data.cancelledOrders;

        console.log("statistics: ", this.statistics);
      } catch (error) {
        console.log("Error Statistics: ", error);
      }
    },
    displayStatus(status) {
      return this.statusMapping[status] || 'Không xác định';
    },
    formatNumber(number) {
      return new Intl.NumberFormat('vi-VN').format(number);
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('vi-VN');
    },
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString('vi-VN');
    },
    // getStatusColor(status) {
    //   switch (status) {
    //     case 'Đã giao hàng':
    //       return 'success';
    //     case 'Đang giao hàng':
    //       return 'info';
    //     case 'Đang xử lý':
    //       return 'warning';
    //     case 'Chờ xác nhận':
    //       return 'grey';
    //     case 'Đã hủy':
    //       return 'error';
    //     default:
    //       return 'primary';
    //   }
    // },
    getStatusColor(status) {
      switch (status) {
        case 1: return 'grey';
        case 2: return 'blue';
        case 3: return 'orange';
        case 4: return 'green';
        case 5: return 'red';
        default: return 'grey';
      }
    },
    getStatusTextColor(status) {
      return 'white';
    },
    getPaymentStatusColor(status) {
      switch (status) {
        case 'Đã thanh toán':
          return 'success';
        case 'Chưa thanh toán':
          return 'warning';
        case 'Hoàn tiền':
          return 'error';
        default:
          return 'grey';
      }
    },
    getPaymentStatusTextColor(status) {
      return 'white';
    },
    async showOrderDetail(order) {
      console.log("LogOrderId: ", order);
      await this.fetchOrderDetail(order);
      this.orderDetailDialog = true;
    },
    async fetchOrderDetail(orderId) {
      try {
        const res = await orderService.getOrderById(orderId);
        const data = res.data.data;
        this.orderDetails = data;
        this.selectedOrder = this.orderDetails.status;
        console.log("OrderDetails: ", this.orderDetails);
      } catch (error) {
        console.log("Error OrderDetail: ", error);
      }
    },
    fetchCloudinaryUrl(path) {
      return getCloudinaryUrl(path);
    },
    showUpdateStatus(order) {
      this.selectedOrder = order;
      this.newStatus = order.status;
      this.statusNote = '';
      this.updateStatusDialog = true;
      console.log("Status: ", this.newStatus);
    },
    async updateOrderStatus() {
      this.updating = true;
      try {
        const request = {
          id: this.selectedOrder.id,
          status: this.newStatus
        };
        const res = await orderService.updateOrderStatus(request);
        console.log("Update Order Status: ", res.data);

        this.updateStatusDialog = false;
        this.fetchOrder();
        this.fetchOrderStatistics();
      } catch (error) {
        console.error('Error updating order status:', error);
      } finally {
        this.updating = false;
      }
    },
    updateOptions(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      this.fetchOrder();
    },
    showFilterDialog() {
      this.filterDialog = true;
    },
    resetFilters() {
      this.filters = {
        status: null,
        paymentStatus: null,
        dateFrom: null,
        dateTo: null,
        minTotal: null,
        maxTotal: null
      };
      this.filterDialog = false;
    },
    applyFilters() {
      this.filterDialog = false;
    },
    getIconByStatus(status) {
      switch (status) {
        case 1:
          return 'mdi-clock-outline'; // Đợi xác nhận
        case 2:
          return 'mdi-check-circle-outline'; // Đã duyệt
        case 3:
          return 'mdi-truck-delivery-outline'; // Đang giao hàng
        case 4:
          return 'mdi-package-check'; // Giao thành công
        case 5:
          return 'mdi-cancel'; // Đã hủy
        default:
          return 'mdi-alert-circle-outline'; // Không rõ trạng thái
      }
    },
    // Hàm chuyển trạng thái đơn hàng
    getOrderStatus(status) {
      switch (status) {
        case 1: return 'Chờ xác nhận';
        case 2: return 'Đã duyệt';
        case 3: return 'Đang giao hàng';
        case 4: return 'Giao hàng thành công';
        case 5: return 'Đã hủy';
        default: return 'Không xác định';
      }
    },
    handlePrintOrder(orderId) {
      this.fetchOrderDetail(orderId);
      this.printOrder(this.orderDetails);
    },
    printOrder(order) {
      const doc = new jsPDF();

      doc.setFont("Roboto_Condensed-Light", "normal");
      doc.setFontSize(13);

      // 🧾 Thông tin đơn hàng
      doc.setFontSize(16);
      doc.text('HÓA ĐƠN MUA HÀNG', 14, 20);

      doc.setFontSize(12);
      doc.text(`Mã đơn hàng: ${order.orderCode}`, 14, 30);
      doc.text(`Ngày đặt: ${new Date(order.createdAt).toLocaleString()}`, 14, 37);

      // 📦 Địa chỉ giao hàng
      const address = order.shippingAddresses?.[0];
      if (address) {
        doc.text('Thông tin giao hàng:', 14, 55);
        doc.text(`- Tên: ${address.name}`, 14, 62);
        doc.text(`- SĐT: ${address.phone}`, 14, 69);
        doc.text(`- Địa chỉ: ${address.fullAddress}`, 14, 76);
      }

      // 📄 Bảng sản phẩm
      const itemTable = order.orderItem.map(item => ([
        item.productCode,
        item.productName,
        item.colorName,
        item.sizeName,
        item.quantity,
        item.price.toLocaleString(),
        item.totalPrice.toLocaleString()
      ]));

      autoTable(doc, {
        head: [['Mã sản phẩm', 'Tên', 'Màu', 'Size', 'SL', 'Đơn giá', 'Thành tiền']],
        body: itemTable,
        startY: 85,
        styles: {
          font: 'Roboto_Condensed-Light', // 👈 font đã add
          fontStyle: 'normal',            // hoặc 'bold', 'italic' nếu có
        }
      });

      // 💰 Tổng tiền
      const finalY = doc.lastAutoTable.finalY || 95;
      const caculatate = order.totalAmount - order.shippingFee;
      doc.text(`Tạm tính: ${caculatate.toLocaleString()} VND`, 14, finalY + 10);
      doc.text(`Phí vận chuyển: ${order.shippingFee.toLocaleString()} VND`, 14, finalY + 17);
      doc.text(`Tổng tiền: ${order.totalAmount.toLocaleString()} VND`, 14, finalY + 24);

      // 💾 Lưu file
      doc.save(`hoa-don-${order.orderCode}.pdf`);
    },

    exportToExcel() {
      const data = this.orders.map(order => ({
        'ID': order.id,
        'Mã đơn hàng': order.orderCode,
        'Khách hàng': order.name,
        'Email': order.email,
        'Tổng tiền': order.totalAmount,
        'Trạng thái': this.getOrderStatus(order.status),
        'Ngày tạo': order.createdAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đơn hàng');

      const randomFourDigits = Math.floor(1000 + Math.random() * 9999);

      XLSX.writeFile(workbook, `danh-sach-don-hang_${randomFourDigits}.xlsx`);
    }
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.status-chip {
  min-width: 100px;
  justify-content: center;
}
</style>