<template>
  <div class="discount-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center">
          <h1 class="text-h4">Quản lý mã giảm giá</h1>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            Tạo mã giảm giá
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
                  <v-text-field v-model="filters.search" label="Tìm kiếm" prepend-inner-icon="mdi-magnify" clearable
                    @input="handleSearch"></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select v-model="filters.type" :items="discountTypes" label="Loại mã" clearable
                    @change="handleFilter"></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select v-model="filters.status" :items="discountStatuses" label="Trạng thái" clearable
                    @change="handleFilter"></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="dateRangeText" label="Thời gian" prepend-inner-icon="mdi-calendar" readonly
                        clearable v-bind="attrs" v-on="on" @click:clear="clearDateRange"></v-text-field>
                    </template>
                    <v-date-picker v-model="filters.dateRange" range @input="handleDateRangeChange"></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bảng mã giảm giá -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table :headers="headers" :items="discounts" :loading="loading" :options.sync="options"
              :server-items-length="totalDiscounts" :footer-props="{
                'items-per-page-options': [10, 20, 50, 100],
                'items-per-page-text': 'Số mã mỗi trang'
              }">
              <!-- Cột mã giảm giá -->
              <template v-slot:item.code="{ item }">
                <div class="d-flex align-center">
                  <v-chip :color="getDiscountTypeColor(item.type)" small class="mr-2">
                    {{ getDiscountTypeText(item.type) }}
                  </v-chip>
                  <span class="font-weight-bold">{{ item.code }}</span>
                </div>
              </template>

              <!-- Cột giá trị giảm -->
              <template v-slot:item.value="{ item }">
                <span v-if="item.type === 'PERCENTAGE'">{{ item.value }}%</span>
                <span v-else>{{ }}</span>
              </template>

              <!-- Cột điều kiện áp dụng -->
              <template v-slot:item.conditions="{ item }">
                <div>
                  <div v-if="item.minOrderAmount">
                    Đơn tối thiểu: {{ }}
                  </div>
                  <div v-if="item.maxDiscountAmount">
                    Giảm tối đa: {{ }}
                  </div>
                  <div v-if="item.productIds && item.productIds.length">
                    Áp dụng cho {{ item.productIds.length }} sản phẩm
                  </div>
                  <div v-if="item.categoryIds && item.categoryIds.length">
                    Áp dụng cho {{ item.categoryIds.length }} danh mục
                  </div>
                  <div v-if="item.userIds && item.userIds.length">
                    Áp dụng cho {{ item.userIds.length }} người dùng
                  </div>
                </div>
              </template>

              <!-- Cột thời gian -->
              <template v-slot:item.validityPeriod="{ item }">
                <div>
                  <div>Từ: {{ }}</div>
                  <div>Đến: {{ }}</div>
                </div>
              </template>

              <!-- Cột trạng thái -->
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" small>
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>

              <!-- Cột thao tác -->
              <template v-slot:item.actions="{ item }">
                <v-btn icon small class="mr-2" @click="openEditDialog(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small class="mr-2" @click="openDetailsDialog(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="openDeleteDialog(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dialog tạo/chỉnh sửa mã giảm giá -->
      <v-dialog v-model="createEditDialog" max-width="800px" persistent>
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ editedItem.id ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá' }}</span>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="formValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.code" label="Mã giảm giá" :rules="[
                    v => !!v || 'Vui lòng nhập mã giảm giá',
                    v => /^[A-Z0-9]{4,20}$/.test(v) || 'Mã giảm giá chỉ chứa chữ hoa và số, độ dài từ 4-20 ký tự'
                  ]" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="editedItem.type" :items="discountTypes" label="Loại mã"
                    :rules="[v => !!v || 'Vui lòng chọn loại mã']" required></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.value" label="Giá trị giảm" type="number" :rules="[
                    v => !!v || 'Vui lòng nhập giá trị giảm',
                    v => v > 0 || 'Giá trị giảm phải lớn hơn 0',
                    v => editedItem.type === 'PERCENTAGE' ? v <= 100 : true || 'Phần trăm giảm không được vượt quá 100%'
                  ]" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.quantity" label="Số lượng" type="number" :rules="[
                    v => !!v || 'Vui lòng nhập số lượng',
                    v => v > 0 || 'Số lượng phải lớn hơn 0'
                  ]" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.minOrderAmount" label="Đơn tối thiểu" type="number" :rules="[
                    v => !v || v >= 0 || 'Đơn tối thiểu phải lớn hơn hoặc bằng 0'
                  ]"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.maxDiscountAmount" label="Giảm tối đa" type="number" :rules="[
                    v => !v || v >= 0 || 'Giảm tối đa phải lớn hơn hoặc bằng 0'
                  ]"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-menu ref="startDateMenu" v-model="startDateMenu" :close-on-content-click="false"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="editedItem.startDate" label="Ngày bắt đầu"
                        prepend-inner-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                        :rules="[v => !!v || 'Vui lòng chọn ngày bắt đầu']" required></v-text-field>
                    </template>
                    <v-date-picker v-model="editedItem.startDate" @input="startDateMenu = false"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="6">
                  <v-menu ref="endDateMenu" v-model="endDateMenu" :close-on-content-click="false"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="editedItem.endDate" label="Ngày kết thúc" prepend-inner-icon="mdi-calendar"
                        readonly v-bind="attrs" v-on="on" :rules="[
                          v => !!v || 'Vui lòng chọn ngày kết thúc',
                          v => !editedItem.startDate || v >= editedItem.startDate || 'Ngày kết thúc phải sau ngày bắt đầu'
                        ]" required></v-text-field>
                    </template>
                    <v-date-picker v-model="editedItem.endDate" @input="endDateMenu = false"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="editedItem.productIds" :items="products" item-text="name" item-value="id"
                    label="Sản phẩm áp dụng" multiple chips :menu-props="{ maxHeight: '400px' }"></v-select>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="editedItem.categoryIds" :items="categories" item-text="name" item-value="id"
                    label="Danh mục áp dụng" multiple chips :menu-props="{ maxHeight: '400px' }"></v-select>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="editedItem.userIds" :items="users" item-text="name" item-value="id"
                    label="Người dùng áp dụng" multiple chips :menu-props="{ maxHeight: '400px' }"></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="editedItem.description" label="Mô tả" rows="3"></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeCreateEditDialog">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="saveDiscount" :loading="saving" :disabled="!formValid">
              Lưu
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog chi tiết mã giảm giá -->
      <v-dialog v-model="detailsDialog" max-width="800px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Chi tiết mã giảm giá</span>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Mã giảm giá</div>
                <div class="d-flex align-center mt-1">
                  <v-chip :color="getDiscountTypeColor(selectedItem.type)" small class="mr-2">
                    {{ getDiscountTypeText(selectedItem.type) }}
                  </v-chip>
                  <span class="font-weight-bold">{{ selectedItem.code }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Giá trị giảm</div>
                <div class="mt-1">
                  <span v-if="selectedItem.type === 'PERCENTAGE'">{{ selectedItem.value }}%</span>
                  <span v-else>{{ formatCurrency(selectedItem.value) }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Số lượng</div>
                <div class="mt-1">{{ selectedItem.quantity }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Đã sử dụng</div>
                <div class="mt-1">{{ selectedItem.usedCount || 0 }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Đơn tối thiểu</div>
                <div class="mt-1">{{ }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Giảm tối đa</div>
                <div class="mt-1">{{ }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Ngày bắt đầu</div>
                <div class="mt-1">{{ }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-1 font-weight-bold">Ngày kết thúc</div>
                <div class="mt-1">{{ }}</div>
              </v-col>
              <v-col cols="12">
                <div class="subtitle-1 font-weight-bold">Sản phẩm áp dụng</div>
                <div class="mt-1">
                  <v-chip v-for="product in selectedItemProducts" :key="product.id" small class="mr-2 mb-2">
                    {{ product.name }}
                  </v-chip>
                  <span v-if="!selectedItemProducts.length">Tất cả sản phẩm</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="subtitle-1 font-weight-bold">Danh mục áp dụng</div>
                <div class="mt-1">
                  <v-chip v-for="category in selectedItemCategories" :key="category.id" small class="mr-2 mb-2">
                    {{ category.name }}
                  </v-chip>
                  <span v-if="!selectedItemCategories.length">Tất cả danh mục</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="subtitle-1 font-weight-bold">Người dùng áp dụng</div>
                <div class="mt-1">
                  <v-chip v-for="user in selectedItemUsers" :key="user.id" small class="mr-2 mb-2">
                    {{ user.name }}
                  </v-chip>
                  <span v-if="!selectedItemUsers.length">Tất cả người dùng</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="subtitle-1 font-weight-bold">Mô tả</div>
                <div class="mt-1">{{ selectedItem.description || 'Không có' }}</div>
              </v-col>
            </v-row>

            <!-- Lịch sử sử dụng -->
            <v-divider class="my-4"></v-divider>
            <div class="subtitle-1 font-weight-bold mb-2">Lịch sử sử dụng</div>
            <v-data-table :headers="usageHeaders" :items="selectedItemUsageHistory" :loading="loadingUsageHistory"
              :items-per-page="5">
              <template v-slot:item.orderId="{ item }">
                <v-btn text small color="primary" @click="viewOrder(item.orderId)">
                  #{{ item.orderId }}
                </v-btn>
              </template>
              <template v-slot:item.discountAmount="{ item }">
                {{ }}
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ }}
              </template>
            </v-data-table>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="detailsDialog = false">
              Đóng
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xóa mã giảm giá -->
      <v-dialog v-model="deleteDialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Xác nhận xóa</span>
          </v-card-title>

          <v-card-text>
            Bạn có chắc chắn muốn xóa mã giảm giá "{{ selectedItem.code }}"?
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="deleteDialog = false">
              Hủy
            </v-btn>
            <v-btn color="error" @click="deleteDiscount" :loading="deleting">
              Xóa
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

export default {
  name: 'DiscountView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const saving = ref(false);
    const deleting = ref(false);
    const loadingUsageHistory = ref(false);
    const formValid = ref(false);
    const form = ref(null);

    // Dialogs
    const createEditDialog = ref(false);
    const detailsDialog = ref(false);
    const deleteDialog = ref(false);
    const dateMenu = ref(false);
    const startDateMenu = ref(false);
    const endDateMenu = ref(false);

    // Data
    const discounts = ref([]);
    const products = ref([]);
    const categories = ref([]);
    const users = ref([]);
    const selectedItemUsageHistory = ref([]);
    const totalDiscounts = ref(0);

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
      type: null,
      status: null,
      dateRange: []
    });

    // Headers
    const headers = [
      { text: 'Mã giảm giá', value: 'code', width: '200px' },
      { text: 'Giá trị giảm', value: 'value', width: '120px' },
      { text: 'Số lượng', value: 'quantity', width: '100px' },
      { text: 'Đã sử dụng', value: 'usedCount', width: '100px' },
      { text: 'Điều kiện áp dụng', value: 'conditions', width: '200px' },
      { text: 'Thời gian', value: 'validityPeriod', width: '200px' },
      { text: 'Trạng thái', value: 'status', width: '120px' },
      { text: 'Thao tác', value: 'actions', sortable: false, width: '120px' }
    ];

    const usageHeaders = [
      { text: 'Mã đơn hàng', value: 'orderId', width: '120px' },
      { text: 'Khách hàng', value: 'customerName', width: '200px' },
      { text: 'Số tiền giảm', value: 'discountAmount', width: '150px' },
      { text: 'Thời gian', value: 'createdAt', width: '200px' }
    ];

    // Tùy chọn
    const discountTypes = [
      { text: 'Phần trăm', value: 'PERCENTAGE' },
      { text: 'Số tiền cố định', value: 'FIXED_AMOUNT' }
    ];

    const discountStatuses = [
      { text: 'Đang hoạt động', value: 'ACTIVE' },
      { text: 'Đã hết hạn', value: 'EXPIRED' },
      { text: 'Đã hết số lượng', value: 'DEPLETED' },
      { text: 'Đã tạm dừng', value: 'PAUSED' }
    ];

    // Item mặc định
    const defaultItem = {
      code: '',
      type: 'PERCENTAGE',
      value: 0,
      quantity: 1,
      minOrderAmount: null,
      maxDiscountAmount: null,
      startDate: null,
      endDate: null,
      productIds: [],
      categoryIds: [],
      userIds: [],
      description: ''
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

    const formatDate = (date) => {
      if (!date) return '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString('vi-VN', options);
    };

    const selectedItemProducts = computed(() => {
      if (!selectedItem.value.productIds || !selectedItem.value.productIds.length) {
        return [];
      }
      return products.value.filter(product =>
        selectedItem.value.productIds.includes(product.id)
      );
    });

    const selectedItemCategories = computed(() => {
      if (!selectedItem.value.categoryIds || !selectedItem.value.categoryIds.length) {
        return [];
      }
      return categories.value.filter(category =>
        selectedItem.value.categoryIds.includes(category.id)
      );
    });

    const selectedItemUsers = computed(() => {
      if (!selectedItem.value.userIds || !selectedItem.value.userIds.length) {
        return [];
      }
      return users.value.filter(user =>
        selectedItem.value.userIds.includes(user.id)
      );
    });

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Hàm lấy danh sách mã giảm giá
    const fetchDiscounts = async () => {
      loading.value = true;
      // try {
      //   const response = await discountService.getDiscounts({
      //     page: options.value.page,
      //     limit: options.value.itemsPerPage,
      //     sortBy: options.value.sortBy[0],
      //     sortDesc: options.value.sortDesc[0],
      //     search: filters.search,
      //     type: filters.type,
      //     status: filters.status,
      //     startDate: filters.dateRange[0],
      //     endDate: filters.dateRange[1]
      //   });

      //   discounts.value = response.items;
      //   totalDiscounts.value = response.total;
      // } catch (error) {
      //   console.error('Error fetching discounts:', error);
      //   showSnackbar('Không thể tải danh sách mã giảm giá', 'error');
      // } finally {
      //   loading.value = false;
      // }
    };

    // Hàm lấy danh sách sản phẩm
    // const fetchProducts = async () => {
    //   try {
    //     const response = await productService.getProducts({
    //       limit: 100,
    //       sortBy: 'name',
    //       sortDesc: false
    //     });
    //     products.value = response.items;
    //   } catch (error) {
    //     console.error('Error fetching products:', error);
    //   }
    // };

    // Hàm lấy danh sách danh mục
    // const fetchCategories = async () => {
    //   try {
    //     const response = await categoryService.getCategories({
    //       limit: 100,
    //       sortBy: 'name',
    //       sortDesc: false
    //     });
    //     categories.value = response.items;
    //   } catch (error) {
    //     console.error('Error fetching categories:', error);
    //   }
    // };

    // Hàm lấy danh sách người dùng
    // const fetchUsers = async () => {
    //   try {
    //     const response = await userService.getUsers({
    //       limit: 100,
    //       sortBy: 'name',
    //       sortDesc: false
    //     });
    //     users.value = response.items;
    //   } catch (error) {
    //     console.error('Error fetching users:', error);
    //   }
    // };

    // Hàm lấy lịch sử sử dụng mã giảm giá
    // const fetchUsageHistory = async (discountId) => {
    //   loadingUsageHistory.value = true;
    //   try {
    //     const response = await discountService.getDiscountUsageHistory(discountId);
    //     selectedItemUsageHistory.value = response;
    //   } catch (error) {
    //     console.error('Error fetching usage history:', error);
    //     showSnackbar('Không thể tải lịch sử sử dụng', 'error');
    //   } finally {
    //     loadingUsageHistory.value = false;
    //   }
    // };

    // Hàm mở dialog tạo mã giảm giá
    const openCreateDialog = () => {
      editedItem.value = { ...defaultItem };
      createEditDialog.value = true;
    };

    // Hàm mở dialog chỉnh sửa mã giảm giá
    const openEditDialog = (item) => {
      editedItem.value = { ...item };
      createEditDialog.value = true;
    };

    // Hàm mở dialog chi tiết mã giảm giá
    const openDetailsDialog = async (item) => {
      selectedItem.value = { ...item };
      detailsDialog.value = true;
      await fetchUsageHistory(item.id);
    };

    // Hàm mở dialog xóa mã giảm giá
    const openDeleteDialog = (item) => {
      selectedItem.value = { ...item };
      deleteDialog.value = true;
    };

    // Hàm đóng dialog tạo/chỉnh sửa mã giảm giá
    const closeCreateEditDialog = () => {
      createEditDialog.value = false;
      editedItem.value = { ...defaultItem };
      if (form.value) {
        form.value.reset();
      }
    };

    // Hàm lưu mã giảm giá
    const saveDiscount = async () => {
      if (!form.value.validate()) {
        return;
      }

      saving.value = true;
      try {
        if (editedItem.value.id) {
          await discountService.updateDiscount(editedItem.value.id, editedItem.value);
          showSnackbar('Cập nhật mã giảm giá thành công', 'success');
        } else {
          await discountService.createDiscount(editedItem.value);
          showSnackbar('Tạo mã giảm giá thành công', 'success');
        }
        closeCreateEditDialog();
      } catch (error) {
        console.error('Error saving discount:', error);
        showSnackbar('Không thể lưu mã giảm giá', 'error');
      } finally {
        saving.value = false;
      }
    };

    // Hàm xóa mã giảm giá
    const deleteDiscount = async () => {
      deleting.value = true;
      try {
        await discountService.deleteDiscount(selectedItem.value.id);
        showSnackbar('Xóa mã giảm giá thành công', 'success');
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting discount:', error);
        showSnackbar('Không thể xóa mã giảm giá', 'error');
      } finally {
        deleting.value = false;
      }
    };

    // Hàm xem chi tiết đơn hàng
    const viewOrder = (orderId) => {
      router.push(`/orders/${orderId}`);
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
      options.value.page = 1;
    };

    // Hàm xử lý lọc
    const handleFilter = () => {
      options.value.page = 1;
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

    // Hàm lấy màu cho loại mã giảm giá
    const getDiscountTypeColor = (type) => {
      switch (type) {
        case 'PERCENTAGE':
          return 'success';
        case 'FIXED_AMOUNT':
          return 'info';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text cho loại mã giảm giá
    const getDiscountTypeText = (type) => {
      switch (type) {
        case 'PERCENTAGE':
          return '%';
        case 'FIXED_AMOUNT':
          return '₫';
        default:
          return type;
      }
    };

    // Hàm lấy màu cho trạng thái
    const getStatusColor = (status) => {
      switch (status) {
        case 'ACTIVE':
          return 'success';
        case 'EXPIRED':
          return 'error';
        case 'DEPLETED':
          return 'warning';
        case 'PAUSED':
          return 'grey';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text cho trạng thái
    const getStatusText = (status) => {
      switch (status) {
        case 'ACTIVE':
          return 'Đang hoạt động';
        case 'EXPIRED':
          return 'Đã hết hạn';
        case 'DEPLETED':
          return 'Đã hết số lượng';
        case 'PAUSED':
          return 'Đã tạm dừng';
        default:
          return status;
      }
    };

    // Watch
    watch(options, () => {
      fetchDiscounts();
    }, { deep: true });

    // Lifecycle hooks
    onMounted(() => {
      fetchDiscounts();
      fetchProducts();
      fetchCategories();
      fetchUsers();
    });

    return {
      loading,
      saving,
      deleting,
      loadingUsageHistory,
      formValid,
      form,
      createEditDialog,
      detailsDialog,
      deleteDialog,
      dateMenu,
      startDateMenu,
      endDateMenu,
      discounts,
      products,
      categories,
      users,
      selectedItemUsageHistory,
      totalDiscounts,
      options,
      filters,
      headers,
      usageHeaders,
      discountTypes,
      discountStatuses,
      editedItem,
      selectedItem,
      dateRangeText,
      selectedItemProducts,
      selectedItemCategories,
      selectedItemUsers,
      snackbar,
      openCreateDialog,
      openEditDialog,
      openDetailsDialog,
      openDeleteDialog,
      closeCreateEditDialog,
      saveDiscount,
      deleteDiscount,
      viewOrder,
      handleSearch,
      handleFilter,
      handleDateRangeChange,
      clearDateRange,
      getDiscountTypeColor,
      getDiscountTypeText,
      getStatusColor,
      getStatusText,
      formatDate,
    };
  }
};
</script>

<style scoped>
.discount-view {
  padding: 20px;
}
</style>