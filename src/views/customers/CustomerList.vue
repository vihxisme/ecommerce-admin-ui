<template>
  <v-container>
    <!-- Header với tìm kiếm và nút thêm mới -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm khách hàng" variant="outlined"
          hide-details placeholder="Tên, email, số điện thoại..."></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center justify-end gap-2">
        <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel">
          Xuất Excel
        </v-btn>
        <!-- <v-btn color="primary" prepend-icon="mdi-account-plus" @click="showAddDialog">
          Thêm khách hàng
        </v-btn> -->
      </v-col>
    </v-row>

    <!-- Thống kê nhanh -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Tổng khách hàng</div>
                <div class="text-h5">{{ formatNumber(statistics.totalCustomers) }}</div>
              </div>
              <v-icon color="primary" size="40">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Khách hàng mới</div>
                <div class="text-h5">{{ formatNumber(statistics.newCustomers) }}/tháng</div>
                <!-- <div class="text-caption">Trong tháng</div> -->
              </div>
              <v-icon color="success" size="40">mdi-account-plus</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Tổng chi tiêu</div>
                <div class="text-h5">{{ formatCurrency(statistics.totalSpent) }}</div>
              </div>
              <v-icon color="info" size="40">mdi-currency-usd</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Khách hàng VIP</div>
                <div class="text-h5">{{ formatNumber(statistics.vipCustomers) }}</div>
              </div>
              <v-icon color="warning" size="40">mdi-star</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col> -->
    </v-row>

    <!-- Bảng khách hàng -->
    <v-card>
      <v-data-table-server :headers="headers" :items="filteredCustomers" :search="search" :loading="loading"
        :items-length="totalItems" :items-per-page="itemsPerPage" @update:options="updateOptions"
        loading-text="Đang tải dữ liệu...">
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="40">
            <v-img v-if="item.avatar" :src="item.avatar" :alt="item.name"></v-img>
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex text-left">
            <div>
              <div class="font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="text-caption">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.totalSpent="{ item }">
          {{ formatCurrency(item.totalSpent || 0) }}
        </template>

        <template v-slot:item.successfulTransactions="{ item }">
          <div>{{ formatNumber(item.successfulTransactions) }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Xem chi tiết" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-eye" variant="text" color="primary" size="small" v-bind="props"
                @click="showCustomerDetail(item)"></v-btn>
            </template>
          </v-tooltip>
          <!-- <v-tooltip text="Chỉnh sửa" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-pencil" variant="text" color="warning" size="small" v-bind="props"
                @click="showEditDialog(item)"></v-btn>
            </template>
          </v-tooltip> -->
          <!-- <v-tooltip text="Xóa" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-delete" variant="text" color="error" size="small" v-bind="props"
                @click="showDeleteDialog(item)"></v-btn>
            </template>
          </v-tooltip> -->
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Dialog thêm/sửa khách hàng -->
    <v-dialog v-model="customerDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="closeCustomerDialog"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" class="text-center">
                <v-avatar size="120" class="mb-4">
                  <v-img v-if="editedItem.avatar" :src="editedItem.avatar"></v-img>
                  <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
                <v-file-input v-model="avatarFile" accept="image/*" label="Thay đổi ảnh đại diện"
                  prepend-icon="mdi-camera" hide-details class="mb-4"></v-file-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.name" label="Họ tên" :rules="[v => !!v || 'Họ tên là bắt buộc']"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.email" label="Email" type="email" :rules="[
                  v => !!v || 'Email là bắt buộc',
                  v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                ]" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.phone" label="Số điện thoại"
                  :rules="[v => !!v || 'Số điện thoại là bắt buộc']" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editedItem.status" :items="customerStatuses" label="Trạng thái" required></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.address" label="Địa chỉ"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedItem.note" label="Ghi chú" rows="3"></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="closeCustomerDialog">Hủy</v-btn>
          <v-btn color="primary" @click="saveCustomer" :loading="saving">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog chi tiết khách hàng -->
    <v-dialog v-model="detailDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Chi tiết khách hàng</span>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="4" class="text-center">
              <v-avatar size="150" class="mb-4">
                <v-img v-if="selectedCustomer.avatar" :src="selectedCustomer?.avatar"
                  :alt="selectedCustomer?.name"></v-img>
                <v-icon v-else size="6rem">mdi-account</v-icon>
              </v-avatar>
              <h2 class="text-h6">{{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</h2>
              <v-chip :color="getStatusColor(selectedCustomer?.status)" class="mt-2">
                {{ selectedCustomer?.status }}
              </v-chip>
            </v-col>
            <v-col cols="12" md="8">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>{{ selectedCustomer?.email }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title>{{ selectedCustomer?.phone }}</v-list-item-title>
                </v-list-item>
                <!-- <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title>{{ selectedCustomer?.address }}</v-list-item-title>
                </v-list-item> -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title>Tổng chi tiêu: {{ formatCurrency(selectedCustomer?.totalSpent || 0)
                  }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-cart</v-icon>
                  </template>
                  <v-list-item-title>Số đơn hàng: {{ selectedCustomer?.successfulTransactions || 0
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h6 mb-4">Lịch sử đơn hàng</h3>
          <v-table>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in selectedCustomer?.orders" :key="order.id">
                <td>{{ order.orderNumber }}</td>
                <td>
                  {{ formatDate(order.date) }}
                  <div class="text-caption">{{ formatTime(order.date) }}</div>
                </td>
                <td>{{ formatCurrency(order.total) }}</td>
                <td>
                  <v-chip :color="getOrderStatusColor(order.status)" size="small">
                    {{ order.status }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog xóa -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa khách hàng "{{ selectedCustomer?.name }}"?
          Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="error" @click="deleteCustomer" :loading="deleting">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { customerService } from '../../api/services/customerService';
import { statisticsService } from '../../api/services/statisticsService';
import * as XLSX from 'xlsx';

export default {
  name: 'CustomerList',
  data() {
    return {
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      search: '',
      loading: false,
      saving: false,
      deleting: false,
      valid: false,
      customerDialog: false,
      detailDialog: false,
      deleteDialog: false,
      isEdit: false,
      avatarFile: null,
      selectedCustomer: null,
      headers: [
        { title: 'Ảnh', key: 'avatar', align: 'center', sortable: false },
        { title: 'Thông tin', key: 'name', align: 'center', sortable: true },
        { title: 'Số điện thoại', key: 'phone', align: 'center', sortable: true },
        { title: 'Tổng chi tiêu', key: 'totalSpent', align: 'center', sortable: true },
        { title: 'Số lượng đơn hàng', key: 'successfulTransactions', align: 'center', sortable: true },
        // { title: 'Đơn hàng cuối', key: 'lastOrder', sortable: true },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      statistics: {
        totalCustomers: 0,
        newCustomers: 0,
        totalSpent: 0,
        vipCustomers: 0
      },
      customerStatuses: [
        'Hoạt động',
        'Không hoạt động',
        'VIP',
        'Chặn'
      ],
      editedItem: {
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Hoạt động',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        note: ''
      },
      defaultItem: {
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Hoạt động',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        note: ''
      },
      customers: []
    };
  },
  computed: {
    filteredCustomers() {
      return this.customers;
    }
  },
  mounted() {
    this.fetchCustomer();
    this.fetchStatsNewCustomer();
    this.fetchTotalSpent();
  },
  methods: {
    async fetchCustomer() {
      try {
        this.loading = true;

        const request = {
          page: this.page - 1,
          size: this.itemsPerPage,
        };

        const res = await customerService.getCustomerTransaction(request);
        const data = res.data.data;

        this.customers = data.content;
        this.totalItems = data.totalElements;
        this.statistics.totalCustomers = data.totalElements;

        console.log("FetchCustomer: ", res.data);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log("Error fetchCustomer: ", error);
      }
    },
    async fetchStatsNewCustomer() {
      try {
        const res = await customerService.statsNewCustomerByMonth("month");
        const data = res.data.data;

        this.statistics.newCustomers = data.current.totalCustomers;

        console.log("FetchCustomer: ", res.data);
      } catch (error) {
        console.log("Error fetchCustomer: ", error);
      }
    },
    async fetchTotalSpent() {
      try {
        const res = await statisticsService.totalRevenueByUserId();
        const data = res.data.data;

        this.statistics.totalSpent = data;

        console.log("fetchTotalSpent: ", res.data);
      } catch (error) {
        console.log("Error fetchTotalSpent: ", error);
      }
    },
    updateOptions(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      this.fetchCustomer();
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
    getStatusColor(status) {
      switch (status) {
        case 'VIP':
          return 'warning';
        case 'Hoạt động':
          return 'success';
        case 'Không hoạt động':
          return 'grey';
        case 'Chặn':
          return 'error';
        default:
          return 'primary';
      }
    },
    getOrderStatusColor(status) {
      switch (status) {
        case 'Đã giao hàng':
          return 'success';
        case 'Đang giao hàng':
          return 'info';
        case 'Đang xử lý':
          return 'warning';
        case 'Đã hủy':
          return 'error';
        default:
          return 'grey';
      }
    },
    showAddDialog() {
      this.isEdit = false;
      this.editedItem = { ...this.defaultItem };
      this.customerDialog = true;
    },
    showEditDialog(item) {
      this.isEdit = true;
      this.editedItem = { ...item };
      this.customerDialog = true;
    },
    showCustomerDetail(customer) {
      this.selectedCustomer = customer;
      this.detailDialog = true;
    },
    showDeleteDialog(customer) {
      this.selectedCustomer = customer;
      this.deleteDialog = true;
    },
    closeCustomerDialog() {
      this.customerDialog = false;
      this.editedItem = { ...this.defaultItem };
      this.$refs.form.reset();
    },
    async saveCustomer() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;
      try {
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (this.isEdit) {
          const index = this.customers.findIndex(c => c.id === this.editedItem.id);
          if (index !== -1) {
            this.customers[index] = { ...this.editedItem };
          }
        } else {
          const newId = Math.max(...this.customers.map(c => c.id)) + 1;
          this.customers.push({
            ...this.editedItem,
            id: newId,
            totalSpent: 0,
            lastOrder: null,
            orderCount: 0,
            orders: []
          });
        }

        this.customerDialog = false;
      } catch (error) {
        console.error('Error saving customer:', error);
      } finally {
        this.saving = false;
      }
    },
    async deleteCustomer() {
      this.deleting = true;
      try {
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const index = this.customers.findIndex(c => c.id === this.selectedCustomer.id);
        if (index !== -1) {
          this.customers.splice(index, 1);
        }

        this.deleteDialog = false;
      } catch (error) {
        console.error('Error deleting customer:', error);
      } finally {
        this.deleting = false;
      }
    },
    exportToExcel() {
      const data = this.customers.map(customer => ({
        'Mã khách hàng': customer.customerCode,
        'Tên': customer.firstName + " " + customer.lastName,
        'Email': customer.email,
        'Sđt': customer.phone,
        'Tổng chi tiêu': customer.totalSpent,
        'Số lượng đơn hàng': customer.successfulTransactions
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách khách hàng');

      const randomFourDigits = Math.floor(1000 + Math.random() * 9999);

      XLSX.writeFile(workbook, `danh-sach-khach-hang_${randomFourDigits}.xlsx`);
    }
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-avatar {
  border: 2px solid #eee;
}
</style>