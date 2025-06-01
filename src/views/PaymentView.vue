<template>
  <v-container>
    <v-snackbar v-model="notiShow" :timeout="5000" location="top right" :color="notiColor">{{ notiContent
    }}</v-snackbar>
    <!-- Header với tìm kiếm và bộ lọc -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm đơn hàng" variant="outlined"
          hide-details placeholder="Mã đơn hàng, tên khách hàng..."></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center justify-end gap-2">
        <!-- <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel">
          Xuất Excel
        </v-btn> -->
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
                <div class="text-subtitle-2 mb-1">Chờ xử lý</div>
                <div class="text-h5">{{ formatNumber(statistics.pending) }}</div>
              </div>
              <v-icon color="primary" size="40">mdi-clock-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Thành công</div>
                <div class="text-h5">{{ formatNumber(statistics.success) }}</div>
              </div>
              <v-icon color="success" size="40">mdi-check-circle-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Đã hủy</div>
                <div class="text-h5">{{ formatNumber(statistics.failed) }}</div>
              </div>
              <v-icon color="error" size="40">mdi-close-circle-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Hoàn tiền</div>
                <div class="text-h5">{{ formatNumber(statistics.refunded) }}</div>
              </div>
              <v-icon color="green" size="40">mdi-cash-refund</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bảng đơn hàng -->
    <v-card>
      <v-data-table-server :headers="headers" :items="filteredPayments" :items-length="totalItems" :search="search"
        :items-per-page="itemsPerPage" :loading="loading" @update:options="updateOptions">
        <template v-slot:item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template v-slot:item.paymentCode="{ item }">
          <div class="font-weight-medium">#{{ item.paymentCode }}</div>
        </template>

        <template v-slot:item.orderCode="{ item }">
          <div class="font-weight-medium">#{{ item.orderCode }}</div>
        </template>

        <template v-slot:item.paymentMethod="{ item }">
          <v-chip :color="getPaymentMethodColor(item.paymentMethod)" size="small">
            {{ getPaymentMethodLabel(item.paymentMethod) }}
          </v-chip>
        </template>


        <template v-slot:item.paymentStatus="{ item }">
          <v-chip :color="getPaymentStatusColor(item.paymentStatus)" size="small">
            {{ getPaymentStatusLabel(item.paymentStatus) }}
          </v-chip>
        </template>



        <template v-slot:item.updateAt="{ item }">
          <div class="text-caption">{{ formatTime(item.updateAt) }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Cập nhật trạng thái" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-pencil" variant="text" color="warning" size="small" v-bind="props"
                @click="showUpdateStatus(item)"></v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-server>
    </v-card>

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
                label="Trạng thái thanh toán" variant="outlined" clearable></v-select>
            </v-col>
            <v-col cols="12">
              <v-select v-model="filters.method" :items="methodOptions" item-title="label" item-value="value"
                label="Phương thức thanh toán" variant="outlined" clearable></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="filters.dateFrom" label="Từ ngày" type="date" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="filters.dateTo" label="Đến ngày" type="date" variant="outlined"></v-text-field>
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
import { paymentService } from '../api/services/paymentService';


export default {
  name: 'OrderList',
  data() {
    return {
      page: 1,
      itemsPerPage: 10,
      search: '',
      notiShow: false,
      notiColor: null,
      notiContent: null,
      loading: false,
      updating: false,
      orderDetailDialog: false,
      updateStatusDialog: false,
      filterDialog: false,
      selectedPayment: null,
      newStatus: '',
      statusNote: '',
      headers: [
        { title: 'STT', key: 'index', align: 'center', sortable: true },
        { title: 'Mã giao dịch', key: 'paymentCode', align: 'center', sortable: true },
        { title: 'Mã đơn hàng', key: 'orderCode', align: 'center', sortable: true },
        { title: 'Phương thức thanh toán', key: 'paymentMethod', align: 'center', sortable: true },
        { title: 'Trạng thái', key: 'paymentStatus', align: 'center', sortable: true },
        { title: 'Thời gian', key: 'updatedAt', align: 'center', sortable: true },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      statistics: {
        pending: 0,
        success: 0,
        failed: 0,
        refunded: 0
      },
      filters: {
        status: null,
        method: null,
        dateFrom: null,
        dateTo: null,
      },
      methodMapping: {
        1: 'Thẻ tín dụng',
        2: 'Chuyển khoản ngân hàng',
        3: 'Tiền mặt'
      },
      statusMapping: {
        1: 'Chờ xử lý',
        2: 'Thanh toán thành công',
        3: 'Đã hủy',
        4: 'Hoàn tiền',
      },
      paymentStatuses: [
        'Chưa thanh toán',
        'Đã thanh toán',
        'Hoàn tiền'
      ],
      payments: [],
      orderDetails: null,
    };
  },
  computed: {
    filteredPayments() {
      let result = [...this.payments];

      if (this.filters.status) {
        result = result.filter(payment => payment.paymentStatus === this.filters.status);
      }

      if (this.filters.method) {
        result = result.filter(payment => payment.paymentMethod === this.filters.method);
      }

      if (this.filters.dateFrom) {
        const fromDate = new Date(this.filters.dateFrom);
        result = result.filter(payment => new Date(payment.updateAt) >= fromDate);
      }

      if (this.filters.dateTo) {
        const toDate = new Date(this.filters.dateTo);
        result = result.filter(payment => new Date(payment.updateAt) <= toDate);
      }

      return result;
    },
    statusOptions() {
      return Object.entries(this.statusMapping).map(([key, label]) => ({
        value: parseInt(key), // Key as a number (1, 2, 3, etc.)
        label, // Display label (e.g., "Chờ xử lý")
      }));
    },
    methodOptions() {
      return Object.entries(this.methodMapping).map(([key, label]) => ({
        value: parseInt(key), // Key as a number (1, 2, 3, etc.)
        label, // Display label (e.g., "Chờ xử lý")
      }));
    }
  },
  mounted() {
    this.fetchPayment();
    this.fetchStatisticsPayment();
  },
  methods: {
    async fetchPayment() {
      this.loading = true;
      try {

        const request = {
          page: this.page - 1,
          size: this.itemsPerPage,
        }

        const res = await paymentService.getPagiPayment(request);
        const data = res.data.data;
        this.payments = data.content;
        this.totalItems = data.totalElements;

        console.log("fetchPayment: ", res.data);
        this.loading = false;
      } catch (error) {
        console.log("Error fetchPayment: ", error)
      } finally {
        this.loading = false;
      }
    },
    async fetchStatisticsPayment() {
      try {
        const res = await paymentService.statisticsPayment();
        const data = res.data.data;

        this.statistics.pending = data.PENDING ?? 0;
        this.statistics.success = data.SUCCESS ?? 0;
        this.statistics.failed = data.FAILED ?? 0;
        this.statistics.refunded = data.REFUNDED ?? 0;


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
      return new Date(dateString).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false
      });
    },
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
        this.selectedPayment = this.orderDetails.status;
        console.log("OrderDetails: ", this.orderDetails);
      } catch (error) {
        console.log("Error OrderDetail: ", error);
      }
    },
    showUpdateStatus(payment) {
      this.selectedPayment = payment;
      this.newStatus = payment.paymentStatus;
      this.statusNote = '';
      this.updateStatusDialog = true;
      console.log("Status: ", this.newStatus);
    },
    async updateOrderStatus() {
      this.updating = true;
      try {
        const request = {
          id: this.selectedPayment.id,
          paymentStatus: this.newStatus
        };
        const res = await paymentService.updatePayment(request);
        console.log("Update Order Status: ", res.data);

        if (res.data.data) {
          this.notiColor = "success";
          this.notiContent = "Cập nhập trạng thái thành công!";
        } else {
          this.notiColor = "error";
          this.notiContent = "Cập nhập trạng thái thất bại!";
        }


        this.updateStatusDialog = false;
        this.notiShow = true;
        this.fetchPayment();
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error updating payment status:', error);
      } finally {
        this.updating = false;
      }
    },
    updateOptions(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      this.fetchPayment();
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
      };
      this.filterDialog = false;
    },
    applyFilters() {
      this.filterDialog = false;
    },
    getPaymentMethodLabel(method) {
      switch (method) {
        case 1: return 'Thẻ tín dụng';
        case 2: return 'Chuyển khoản ngân hàng';
        case 3: return 'Tiền mặt';
        default: return 'Không xác định';
      }
    },

    getPaymentMethodColor(method) {
      switch (method) {
        case 1: return 'blue';      // CREDIT_CARD
        case 2: return 'indigo';    // BANK_TRANSFER
        case 3: return 'green';     // CASH
        default: return 'grey';
      }
    },

    getPaymentStatusLabel(status) {
      switch (status) {
        case 1: return 'Chờ xử lý';
        case 2: return 'Thành công';
        case 3: return 'Thất bại';
        case 4: return 'Hoàn tiền';
        default: return 'Không rõ';
      }
    },

    getPaymentStatusColor(status) {
      switch (status) {
        case 1: return 'warning';    // PENDING
        case 2: return 'success';     // SUCCESS
        case 3: return 'error';       // FAILED
        case 4: return 'purple';    // REFUNDED
        default: return 'grey';
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