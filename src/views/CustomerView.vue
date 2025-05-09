<template>
  <div class="customer-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center">
          <h1 class="text-h4">Quản lý khách hàng</h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="exportCustomers"
          >
            <v-icon left>mdi-download</v-icon>
            Xuất danh sách
          </v-btn>
        </v-col>
      </v-row>

      <!-- Bộ lọc -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filters.search"
                    label="Tìm kiếm"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    @input="handleSearch"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.status"
                    :items="customerStatuses"
                    label="Trạng thái"
                    clearable
                    @change="handleFilter"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.membershipLevel"
                    :items="membershipLevels"
                    label="Cấp độ thành viên"
                    clearable
                    @change="handleFilter"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-menu
                    ref="dateMenu"
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="dateRangeText"
                        label="Ngày tham gia"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        clearable
                        v-bind="attrs"
                        v-on="on"
                        @click:clear="clearDateRange"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="filters.dateRange"
                      range
                      @input="handleDateRangeChange"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bảng khách hàng -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :headers="headers"
              :items="customers"
              :loading="loading"
              :options.sync="options"
              :server-items-length="totalCustomers"
              :footer-props="{
                'items-per-page-options': [10, 20, 50, 100],
                'items-per-page-text': 'Số khách hàng mỗi trang'
              }"
            >
              <!-- Cột thông tin khách hàng -->
              <template v-slot:item.customer="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="40" class="mr-3">
                    <v-img :src="item.avatar || '/images/default-avatar.png'"></v-img>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold">{{ item.name }}</div>
                    <div class="text-caption">{{ item.email }}</div>
                    <div class="text-caption">{{ item.phone }}</div>
                  </div>
                </div>
              </template>

              <!-- Cột địa chỉ -->
              <template v-slot:item.address="{ item }">
                <div>
                  <div>{{ item.address }}</div>
                  <div class="text-caption">{{ item.city }}, {{ item.district }}, {{ item.ward }}</div>
                </div>
              </template>

              <!-- Cột cấp độ thành viên -->
              <template v-slot:item.membershipLevel="{ item }">
                <v-chip
                  :color="getMembershipLevelColor(item.membershipLevel)"
                  small
                >
                  {{ getMembershipLevelText(item.membershipLevel) }}
                </v-chip>
              </template>

              <!-- Cột điểm thưởng -->
              <template v-slot:item.rewardPoints="{ item }">
                <div class="d-flex align-center">
                  <v-icon small color="warning" class="mr-1">mdi-star</v-icon>
                  {{ item.rewardPoints }}
                </div>
              </template>

              <!-- Cột trạng thái -->
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  small
                >
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>

              <!-- Cột thao tác -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  class="mr-2"
                  @click="openDetailsDialog(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  class="mr-2"
                  @click="openEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  :color="item.status === 'ACTIVE' ? 'error' : 'success'"
                  @click="toggleCustomerStatus(item)"
                >
                  <v-icon>{{ item.status === 'ACTIVE' ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dialog chi tiết khách hàng -->
      <v-dialog
        v-model="detailsDialog"
        max-width="1000px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">Chi tiết khách hàng</span>
          </v-card-title>

          <v-card-text>
            <v-tabs v-model="activeTab">
              <v-tab>Thông tin cơ bản</v-tab>
              <v-tab>Lịch sử mua hàng</v-tab>
              <v-tab>Lịch sử điểm thưởng</v-tab>
              <v-tab>Ghi chú</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
              <!-- Tab thông tin cơ bản -->
              <v-tab-item>
                <v-row class="mt-4">
                  <v-col cols="12" md="4" class="text-center">
                    <v-avatar size="120" class="mb-4">
                      <v-img :src="selectedItem.avatar || '/images/default-avatar.png'"></v-img>
                    </v-avatar>
                    <div class="text-h6">{{ selectedItem.name }}</div>
                    <div class="text-subtitle-1">{{ selectedItem.email }}</div>
                    <div class="text-subtitle-1">{{ selectedItem.phone }}</div>
                    <v-chip
                      :color="getMembershipLevelColor(selectedItem.membershipLevel)"
                      class="mt-2"
                    >
                      {{ getMembershipLevelText(selectedItem.membershipLevel) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" md="8">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="subtitle-1 font-weight-bold">Địa chỉ</div>
                        <div class="mt-1">
                          {{ selectedItem.address }}
                          <div class="text-caption">
                            {{ selectedItem.ward }}, {{ selectedItem.district }}, {{ selectedItem.city }}
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="subtitle-1 font-weight-bold">Ngày tham gia</div>
                        <div class="mt-1">{{ formatDateTime(selectedItem.createdAt) }}</div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="subtitle-1 font-weight-bold">Điểm thưởng</div>
                        <div class="mt-1 d-flex align-center">
                          <v-icon color="warning" class="mr-1">mdi-star</v-icon>
                          {{ selectedItem.rewardPoints }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="subtitle-1 font-weight-bold">Trạng thái</div>
                        <div class="mt-1">
                          <v-chip
                            :color="getStatusColor(selectedItem.status)"
                            small
                          >
                            {{ getStatusText(selectedItem.status) }}
                          </v-chip>
                        </div>
                      </v-col>
                      <v-col cols="12">
                        <div class="subtitle-1 font-weight-bold">Thống kê</div>
                        <v-row class="mt-2">
                          <v-col cols="12" md="4">
                            <v-card outlined>
                              <v-card-text class="text-center">
                                <div class="text-h6">{{ selectedItem.totalOrders || 0 }}</div>
                                <div class="text-caption">Tổng đơn hàng</div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-card outlined>
                              <v-card-text class="text-center">
                                <div class="text-h6">{{ formatCurrency(selectedItem.totalSpent || 0) }}</div>
                                <div class="text-caption">Tổng chi tiêu</div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-card outlined>
                              <v-card-text class="text-center">
                                <div class="text-h6">{{ formatCurrency(selectedItem.averageOrderValue || 0) }}</div>
                                <div class="text-caption">Trung bình/đơn</div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-tab-item>

              <!-- Tab lịch sử mua hàng -->
              <v-tab-item>
                <v-data-table
                  :headers="orderHeaders"
                  :items="selectedItemOrders"
                  :loading="loadingOrders"
                  :items-per-page="5"
                  class="mt-4"
                >
                  <template v-slot:item.orderNumber="{ item }">
                    <v-btn
                      text
                      small
                      color="primary"
                      @click="viewOrder(item.id)"
                    >
                      #{{ item.orderNumber }}
                    </v-btn>
                  </template>
                  <template v-slot:item.totalAmount="{ item }">
                    {{ formatCurrency(item.totalAmount) }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getOrderStatusColor(item.status)"
                      small
                    >
                      {{ getOrderStatusText(item.status) }}
                    </v-chip>
                  </template>
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDateTime(item.createdAt) }}
                  </template>
                </v-data-table>
              </v-tab-item>

              <!-- Tab lịch sử điểm thưởng -->
              <v-tab-item>
                <v-data-table
                  :headers="rewardHeaders"
                  :items="selectedItemRewardHistory"
                  :loading="loadingRewardHistory"
                  :items-per-page="5"
                  class="mt-4"
                >
                  <template v-slot:item.points="{ item }">
                    <span :class="item.points > 0 ? 'success--text' : 'error--text'">
                      {{ item.points > 0 ? '+' : '' }}{{ item.points }}
                    </span>
                  </template>
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDateTime(item.createdAt) }}
                  </template>
                </v-data-table>
              </v-tab-item>

              <!-- Tab ghi chú -->
              <v-tab-item>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <v-textarea
                      v-model="selectedItem.notes"
                      label="Ghi chú"
                      rows="3"
                      @change="saveNotes"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <div class="subtitle-1 font-weight-bold mb-2">Lịch sử ghi chú</div>
                    <v-timeline dense>
                      <v-timeline-item
                        v-for="note in selectedItemNoteHistory"
                        :key="note.id"
                        small
                        :color="note.type === 'SYSTEM' ? 'grey' : 'primary'"
                      >
                        <div class="d-flex justify-space-between">
                          <div>
                            <div class="font-weight-bold">{{ note.content }}</div>
                            <div class="text-caption">{{ formatDateTime(note.createdAt) }}</div>
                          </div>
                          <div class="text-caption">{{ note.createdBy }}</div>
                        </div>
                      </v-timeline-item>
                    </v-timeline>
                  </v-col>
                </v-row>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="detailsDialog = false"
            >
              Đóng
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog chỉnh sửa khách hàng -->
      <v-dialog
        v-model="editDialog"
        max-width="800px"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">Chỉnh sửa thông tin khách hàng</span>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="formValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.name"
                    label="Họ tên"
                    :rules="[v => !!v || 'Vui lòng nhập họ tên']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email"
                    :rules="[
                      v => !!v || 'Vui lòng nhập email',
                      v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.phone"
                    label="Số điện thoại"
                    :rules="[
                      v => !!v || 'Vui lòng nhập số điện thoại',
                      v => /^[0-9]{10}$/.test(v) || 'Số điện thoại không hợp lệ'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.membershipLevel"
                    :items="membershipLevels"
                    label="Cấp độ thành viên"
                    :rules="[v => !!v || 'Vui lòng chọn cấp độ thành viên']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.address"
                    label="Địa chỉ"
                    :rules="[v => !!v || 'Vui lòng nhập địa chỉ']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="editedItem.city"
                    :items="cities"
                    label="Tỉnh/Thành phố"
                    :rules="[v => !!v || 'Vui lòng chọn tỉnh/thành phố']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="editedItem.district"
                    :items="districts"
                    label="Quận/Huyện"
                    :rules="[v => !!v || 'Vui lòng chọn quận/huyện']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="editedItem.ward"
                    :items="wards"
                    label="Phường/Xã"
                    :rules="[v => !!v || 'Vui lòng chọn phường/xã']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.notes"
                    label="Ghi chú"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey darken-1"
              text
              @click="closeEditDialog"
            >
              Hủy
            </v-btn>
            <v-btn
              color="primary"
              @click="saveCustomer"
              :loading="saving"
              :disabled="!formValid"
            >
              Lưu
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xác nhận khóa/mở khóa tài khoản -->
      <v-dialog
        v-model="statusDialog"
        max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ selectedItem.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản' }}</span>
          </v-card-title>

          <v-card-text>
            <p>Bạn có chắc chắn muốn {{ selectedItem.status === 'ACTIVE' ? 'khóa' : 'mở khóa' }} tài khoản của khách hàng "{{ selectedItem.name }}"?</p>
            <v-textarea
              v-if="selectedItem.status === 'ACTIVE'"
              v-model="statusReason"
              label="Lý do khóa tài khoản"
              :rules="[v => !!v || 'Vui lòng nhập lý do khóa tài khoản']"
              required
            ></v-textarea>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey darken-1"
              text
              @click="statusDialog = false"
            >
              Hủy
            </v-btn>
            <v-btn
              :color="selectedItem.status === 'ACTIVE' ? 'error' : 'success'"
              @click="confirmToggleStatus"
              :loading="togglingStatus"
              :disabled="selectedItem.status === 'ACTIVE' && !statusReason"
            >
              {{ selectedItem.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa' }}
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
import { useRouter } from 'vue-router';
import customerService from '@/api/services/customerService';
import { orderService } from '@/api/services/orderService';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';

export default {
  name: 'CustomerView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const saving = ref(false);
    const togglingStatus = ref(false);
    const loadingOrders = ref(false);
    const loadingRewardHistory = ref(false);
    const formValid = ref(false);
    const form = ref(null);

    // Dialogs
    const detailsDialog = ref(false);
    const editDialog = ref(false);
    const statusDialog = ref(false);
    const dateMenu = ref(false);
    const activeTab = ref(0);

    // Data
    const customers = ref([]);
    const selectedItemOrders = ref([]);
    const selectedItemRewardHistory = ref([]);
    const selectedItemNoteHistory = ref([]);
    const totalCustomers = ref(0);
    const statusReason = ref('');

    // Options
    const options = ref({
      page: 1,
      itemsPerPage: 10,
      sortBy: ['createdAt'],
      sortDesc: [true]
    });

    // Filters
    const filters = reactive({
      search: '',
      status: null,
      membershipLevel: null,
      dateRange: []
    });

    // Headers
    const headers = [
      { text: 'Khách hàng', value: 'customer', width: '300px' },
      { text: 'Địa chỉ', value: 'address', width: '250px' },
      { text: 'Cấp độ thành viên', value: 'membershipLevel', width: '150px' },
      { text: 'Điểm thưởng', value: 'rewardPoints', width: '120px' },
      { text: 'Ngày tham gia', value: 'createdAt', width: '150px' },
      { text: 'Trạng thái', value: 'status', width: '120px' },
      { text: 'Thao tác', value: 'actions', sortable: false, width: '120px' }
    ];

    const orderHeaders = [
      { text: 'Mã đơn hàng', value: 'orderNumber', width: '120px' },
      { text: 'Tổng tiền', value: 'totalAmount', width: '150px' },
      { text: 'Trạng thái', value: 'status', width: '120px' },
      { text: 'Phương thức thanh toán', value: 'paymentMethod', width: '150px' },
      { text: 'Ngày tạo', value: 'createdAt', width: '150px' }
    ];

    const rewardHeaders = [
      { text: 'Điểm', value: 'points', width: '100px' },
      { text: 'Lý do', value: 'reason', width: '300px' },
      { text: 'Ngày', value: 'createdAt', width: '150px' }
    ];

    // Tùy chọn
    const customerStatuses = [
      { text: 'Đang hoạt động', value: 'ACTIVE' },
      { text: 'Đã khóa', value: 'LOCKED' }
    ];

    const membershipLevels = [
      { text: 'Thành viên thường', value: 'REGULAR' },
      { text: 'Thành viên bạc', value: 'SILVER' },
      { text: 'Thành viên vàng', value: 'GOLD' },
      { text: 'Thành viên kim cương', value: 'DIAMOND' }
    ];

    const cities = [
      'Hà Nội',
      'Hồ Chí Minh',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'An Giang',
      'Bà Rịa - Vũng Tàu',
      'Bắc Giang',
      'Bắc Kạn',
      'Bạc Liêu',
      'Bắc Ninh',
      'Bến Tre',
      'Bình Định',
      'Bình Dương',
      'Bình Phước',
      'Bình Thuận',
      'Cà Mau',
      'Cao Bằng',
      'Đắk Lắk',
      'Đắk Nông',
      'Điện Biên',
      'Đồng Nai',
      'Đồng Tháp',
      'Gia Lai',
      'Hà Giang',
      'Hà Nam',
      'Hà Tĩnh',
      'Hải Dương',
      'Hậu Giang',
      'Hòa Bình',
      'Hưng Yên',
      'Khánh Hòa',
      'Kiên Giang',
      'Kon Tum',
      'Lai Châu',
      'Lâm Đồng',
      'Lạng Sơn',
      'Lào Cai',
      'Long An',
      'Nam Định',
      'Nghệ An',
      'Ninh Bình',
      'Ninh Thuận',
      'Phú Thọ',
      'Phú Yên',
      'Quảng Bình',
      'Quảng Nam',
      'Quảng Ngãi',
      'Quảng Ninh',
      'Quảng Trị',
      'Sóc Trăng',
      'Sơn La',
      'Tây Ninh',
      'Thái Bình',
      'Thái Nguyên',
      'Thanh Hóa',
      'Thừa Thiên Huế',
      'Tiền Giang',
      'Trà Vinh',
      'Tuyên Quang',
      'Vĩnh Long',
      'Vĩnh Phúc',
      'Yên Bái'
    ];

    const districts = ref([]);
    const wards = ref([]);

    // Item mặc định
    const defaultItem = {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      ward: '',
      membershipLevel: 'REGULAR',
      notes: ''
    };

    // Item đang chỉnh sửa
    const editedItem = ref({ ...defaultItem });
    const selectedItem = ref({ ...defaultItem });

    // Computed
    const dateRangeText = computed(() => {
      if (!filters.dateRange || filters.dateRange.length !== 2) {
        return '';
      }
      return `${formatDate(filters.dateRange[0])} - ${formatDate(filters.dateRange[1])}`;
    });

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
        const response = await customerService.getCustomers({
          page: options.value.page,
          limit: options.value.itemsPerPage,
          sortBy: options.value.sortBy[0],
          sortDesc: options.value.sortDesc[0],
          search: filters.search,
          status: filters.status,
          membershipLevel: filters.membershipLevel,
          startDate: filters.dateRange[0],
          endDate: filters.dateRange[1]
        });
        
        customers.value = response.items;
        totalCustomers.value = response.total;
      } catch (error) {
        console.error('Error fetching customers:', error);
        showSnackbar('Không thể tải danh sách khách hàng', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Hàm lấy danh sách đơn hàng của khách hàng
    const fetchCustomerOrders = async (customerId) => {
      loadingOrders.value = true;
      try {
        const response = await orderService.getCustomerOrders(customerId);
        selectedItemOrders.value = response;
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        showSnackbar('Không thể tải danh sách đơn hàng', 'error');
      } finally {
        loadingOrders.value = false;
      }
    };

    // Hàm lấy lịch sử điểm thưởng của khách hàng
    const fetchRewardHistory = async (customerId) => {
      loadingRewardHistory.value = true;
      try {
        const response = await customerService.getRewardHistory(customerId);
        selectedItemRewardHistory.value = response;
      } catch (error) {
        console.error('Error fetching reward history:', error);
        showSnackbar('Không thể tải lịch sử điểm thưởng', 'error');
      } finally {
        loadingRewardHistory.value = false;
      }
    };

    // Hàm lấy lịch sử ghi chú của khách hàng
    const fetchNoteHistory = async (customerId) => {
      try {
        const response = await customerService.getNoteHistory(customerId);
        selectedItemNoteHistory.value = response;
      } catch (error) {
        console.error('Error fetching note history:', error);
      }
    };

    // Hàm mở dialog chi tiết khách hàng
    const openDetailsDialog = async (item) => {
      selectedItem.value = { ...item };
      detailsDialog.value = true;
      activeTab.value = 0;
      await fetchCustomerOrders(item.id);
      await fetchRewardHistory(item.id);
      await fetchNoteHistory(item.id);
    };

    // Hàm mở dialog chỉnh sửa khách hàng
    const openEditDialog = (item) => {
      editedItem.value = { ...item };
      editDialog.value = true;
      // TODO: Load districts and wards based on city
    };

    // Hàm đóng dialog chỉnh sửa khách hàng
    const closeEditDialog = () => {
      editDialog.value = false;
      editedItem.value = { ...defaultItem };
      if (form.value) {
        form.value.reset();
      }
    };

    // Hàm lưu thông tin khách hàng
    const saveCustomer = async () => {
      if (!form.value.validate()) {
        return;
      }

      saving.value = true;
      try {
        await customerService.updateCustomer(editedItem.value.id, editedItem.value);
        showSnackbar('Cập nhật thông tin khách hàng thành công', 'success');
        closeEditDialog();
        fetchCustomers();
      } catch (error) {
        console.error('Error saving customer:', error);
        showSnackbar('Không thể lưu thông tin khách hàng', 'error');
      } finally {
        saving.value = false;
      }
    };

    // Hàm lưu ghi chú
    const saveNotes = async () => {
      try {
        await customerService.updateNotes(selectedItem.value.id, selectedItem.value.notes);
        showSnackbar('Cập nhật ghi chú thành công', 'success');
        await fetchNoteHistory(selectedItem.value.id);
      } catch (error) {
        console.error('Error saving notes:', error);
        showSnackbar('Không thể lưu ghi chú', 'error');
      }
    };

    // Hàm mở dialog khóa/mở khóa tài khoản
    const toggleCustomerStatus = (item) => {
      selectedItem.value = { ...item };
      statusReason.value = '';
      statusDialog.value = true;
    };

    // Hàm xác nhận khóa/mở khóa tài khoản
    const confirmToggleStatus = async () => {
      if (selectedItem.value.status === 'ACTIVE' && !statusReason.value) {
        return;
      }

      togglingStatus.value = true;
      try {
        const newStatus = selectedItem.value.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        await customerService.updateStatus(selectedItem.value.id, {
          status: newStatus,
          reason: statusReason.value
        });
        showSnackbar(
          `${newStatus === 'LOCKED' ? 'Khóa' : 'Mở khóa'} tài khoản thành công`,
          'success'
        );
        statusDialog.value = false;
        fetchCustomers();
      } catch (error) {
        console.error('Error toggling customer status:', error);
        showSnackbar('Không thể thay đổi trạng thái tài khoản', 'error');
      } finally {
        togglingStatus.value = false;
      }
    };

    // Hàm xem chi tiết đơn hàng
    const viewOrder = (orderId) => {
      router.push(`/orders/${orderId}`);
    };

    // Hàm xuất danh sách khách hàng
    const exportCustomers = async () => {
      try {
        await customerService.exportCustomers({
          search: filters.search,
          status: filters.status,
          membershipLevel: filters.membershipLevel,
          startDate: filters.dateRange[0],
          endDate: filters.dateRange[1]
        });
        showSnackbar('Xuất danh sách khách hàng thành công', 'success');
      } catch (error) {
        console.error('Error exporting customers:', error);
        showSnackbar('Không thể xuất danh sách khách hàng', 'error');
      }
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
      options.value.page = 1;
      fetchCustomers();
    };

    // Hàm xử lý lọc
    const handleFilter = () => {
      options.value.page = 1;
      fetchCustomers();
    };

    // Hàm xử lý thay đổi khoảng thời gian
    const handleDateRangeChange = () => {
      dateMenu.value = false;
      handleFilter();
    };

    // Hàm xóa khoảng thời gian
    const clearDateRange = () => {
      filters.dateRange = [];
      handleFilter();
    };

    // Hàm hiển thị snackbar
    const showSnackbar = (text, color = 'success') => {
      snackbar.value = {
        show: true,
        text,
        color
      };
    };

    // Hàm lấy màu cho cấp độ thành viên
    const getMembershipLevelColor = (level) => {
      switch (level) {
        case 'REGULAR':
          return 'grey';
        case 'SILVER':
          return 'blue-grey';
        case 'GOLD':
          return 'amber';
        case 'DIAMOND':
          return 'purple';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text cho cấp độ thành viên
    const getMembershipLevelText = (level) => {
      switch (level) {
        case 'REGULAR':
          return 'Thường';
        case 'SILVER':
          return 'Bạc';
        case 'GOLD':
          return 'Vàng';
        case 'DIAMOND':
          return 'Kim cương';
        default:
          return level;
      }
    };

    // Hàm lấy màu cho trạng thái
    const getStatusColor = (status) => {
      switch (status) {
        case 'ACTIVE':
          return 'success';
        case 'LOCKED':
          return 'error';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text cho trạng thái
    const getStatusText = (status) => {
      switch (status) {
        case 'ACTIVE':
          return 'Đang hoạt động';
        case 'LOCKED':
          return 'Đã khóa';
        default:
          return status;
      }
    };

    // Hàm lấy màu cho trạng thái đơn hàng
    const getOrderStatusColor = (status) => {
      switch (status) {
        case 'PENDING':
          return 'warning';
        case 'PROCESSING':
          return 'info';
        case 'COMPLETED':
          return 'success';
        case 'CANCELLED':
          return 'error';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text cho trạng thái đơn hàng
    const getOrderStatusText = (status) => {
      switch (status) {
        case 'PENDING':
          return 'Chờ xử lý';
        case 'PROCESSING':
          return 'Đang xử lý';
        case 'COMPLETED':
          return 'Hoàn thành';
        case 'CANCELLED':
          return 'Đã hủy';
        default:
          return status;
      }
    };

    // Watch
    watch(options, () => {
      fetchCustomers();
    }, { deep: true });

    // Lifecycle hooks
    onMounted(() => {
      fetchCustomers();
    });

    return {
      loading,
      saving,
      togglingStatus,
      loadingOrders,
      loadingRewardHistory,
      formValid,
      form,
      detailsDialog,
      editDialog,
      statusDialog,
      dateMenu,
      activeTab,
      customers,
      selectedItemOrders,
      selectedItemRewardHistory,
      selectedItemNoteHistory,
      totalCustomers,
      statusReason,
      options,
      filters,
      headers,
      orderHeaders,
      rewardHeaders,
      customerStatuses,
      membershipLevels,
      cities,
      districts,
      wards,
      editedItem,
      selectedItem,
      dateRangeText,
      openDetailsDialog,
      openEditDialog,
      closeEditDialog,
      saveCustomer,
      saveNotes,
      toggleCustomerStatus,
      confirmToggleStatus,
      viewOrder,
      exportCustomers,
      handleSearch,
      handleFilter,
      handleDateRangeChange,
      clearDateRange,
      getMembershipLevelColor,
      getMembershipLevelText,
      getStatusColor,
      getStatusText,
      getOrderStatusColor,
      getOrderStatusText,
      formatCurrency,
      formatDate,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.customer-view {
  padding: 20px;
}
</style> 