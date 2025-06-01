<template>
  <v-container>
    <v-snackbar v-model="notiShow" :timeout="5000" location="top right" :color="notiColor">{{ notiContent
    }}</v-snackbar>
    <!-- Header với tìm kiếm và nút thêm mới -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm khách hàng" variant="outlined"
          hide-details placeholder="Tên, email, số điện thoại..."></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center justify-end gap-2">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog">
          Thêm ưu đãi
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
                <div class="text-subtitle-2 mb-1">Tổng số ưu đãi</div>
                <div class="text-h5">{{ formatNumber(statistics.totalDiscounts) }}</div>
              </div>
              <v-icon color="primary" size="40">mdi-tag-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Chương trình đang hoạt động</div>
                <div class="text-h5">{{ formatNumber(statistics.activeDiscounts) }}</div>
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
                <div class="text-subtitle-2 mb-1">Sản phẩm đang giảm giá</div>
                <div class="text-h5">{{ formatNumber(statistics.discountedProducts) }}</div>
              </div>
              <v-icon color="info" size="40">mdi-cube-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">Danh mục đang giảm giá</div>
                <div class="text-h5">{{ formatNumber(statistics.discountedCategories) }}</div>
              </div>
              <v-icon color="warning" size="40">mdi-view-list-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bảng khách hàng -->
    <v-card>
      <v-data-table-server :headers="headers" :items="discounts" :search="search" :loading="loading"
        :items-length="totalItems" :items-per-page="itemsPerPage" @update:options="updateOptions">
        <template v-slot:item.index="{ index }">
          {{ (page - 1) * itemsPerPage + index + 1 }}
        </template>

        <template v-slot:item.imageUrl="{ item }">
          <v-avatar size="45" tile>
            <v-img :src="item.imageUrl" :lazy-src="image_error" :alt="item.name" tile></v-img>
          </v-avatar>
        </template>

        <template v-slot:item.discountTitle="{ item }">
          <div class="text-left">
            {{ item.discountTitle }}
          </div>
        </template>

        <template v-slot:item.discountPercentage="{ item }">
          <v-chip color="blue">
            -{{ item.discountPercentage }}%
          </v-chip>
        </template>

        <template v-slot:item.discountAmount="{ item }">
          <v-chip color="orange">
            {{ formatCurrency(item.discountAmount) }}
          </v-chip>
        </template>

        <template v-slot:item.minOrderValue="{ item }">
          <v-chip color="pink">
            {{ formatCurrency(item.minOrderValue) }}
          </v-chip>
        </template>

        <template v-slot:item.datePeriod="{ item }">
          <div color="pink">
            {{ formatDate(item.startDate) }}->{{ formatDate(item.endDate) }}
          </div>
        </template>


        <template v-slot:item.isActive="{ item }">
          <v-chip :color="getActiveStatusColor(item.isActive)" size="small">
            {{ getActiveStatusLabel(item.isActive) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <!-- <v-tooltip text="Thêm sản phẩm khuyến mãi" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-plus" variant="text" color="primary" size="small" v-bind="props"
                @click="showdiscountDetail(item)"></v-btn>
            </template>
</v-tooltip> -->
          <v-tooltip text="Xem chi tiết" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-eye" variant="text" color="primary" size="small" v-bind="props"
                @click="showdiscountDetail(item)"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Chỉnh sửa" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-pencil" variant="text" color="warning" size="small" v-bind="props"
                @click="showEditDialog(item)"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Xóa" location="top">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-delete" variant="text" color="error" size="small" v-bind="props"
                @click="showDeleteDialog(item)"></v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Dialog thêm/sửa khách hàng -->
    <v-dialog v-model="discountDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="closeDiscountDialog"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <!-- <v-col cols="12" class="text-center">
                <v-avatar size="120" class="mb-4">
                  <v-img :src="editedItem.avatar" :alt="editedItem.name"></v-img>
                </v-avatar>
                <v-file-input v-model="avatarFile" accept="image/*" label="Thay đổi ảnh đại diện"
                  prepend-icon="mdi-camera" hide-details class="mb-4"></v-file-input>
              </v-col> -->
              <v-col cols="12">
                <v-text-field v-model="editedItem.title" label="Tiêu đề" :rules="[v => !!v || 'Tiêu đề là bắt buộc']"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.percentage" type="number" v-min="0" label="Giảm theo %"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.amount" type="number" v-min="0" label="Giảm theo giá"
                  required></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.minOrder" type="number" v-min="0" label="Giá trị tối thiểu"
                  required></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  max-width="290px" min-width="auto">
                  <template v-slot:activator="{ props }">
                    <v-text-field v-model="formattedStartDate" label="Ngày bắt đầu" readonly
                      :rules="[v => !!v || 'Ngày bắt đầu là bắt buộc']" v-bind="props"></v-text-field>
                  </template>

                  <v-date-picker v-model="editedItem.startDate" @update:model-value="() => startDateMenu = false"
                    locale="vi"></v-date-picker>
                </v-menu>
              </v-col>

              <!-- Ngày kết thúc -->
              <v-col cols="12" md="6">
                <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  max-width="290px" min-width="auto">
                  <template v-slot:activator="{ props }">
                    <v-text-field v-model="formattedEndDate" label="Ngày kết thúc" readonly
                      :rules="[v => !!v || 'Ngày kết thúc là bắt buộc']" v-bind="props"></v-text-field>
                  </template>

                  <v-date-picker v-model="editedItem.endDate" @update:model-value="() => endDateMenu = false"
                    :min="editedItem.startDate" locale="vi"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12">
                <v-select v-model="editedItem.status" :items="statusOptions" item-title="label" item-value="value"
                  label="Trạng thái" required return-value></v-select>
              </v-col>

            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="closeDiscountDialog">Hủy</v-btn>
          <v-btn color="primary" @click="saveDiscount" :loading="saving">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog chi tiết khách hàng -->
    <v-dialog v-model="detailDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Chi tiết chương trình ưu đãi</span>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-container fluid>
          <v-tabs v-model="tabIndexDetail" color="primary" class="border-b">
            <v-tab v-for="(tab, index) in tabTitleDetail" :key="index" class="capitalize flex-grow-1">
              {{ tab }}
            </v-tab>
          </v-tabs>
          <v-divider></v-divider>
          <v-container v-if="tabIndexDetail === 0" fluid class="pa-4">
            <v-row>
              <v-col cols="12" md="8">
                <v-list density="compact">
                  <v-list-item>
                    <span class="font-weight-bold">Chủ đề:</span> {{ selectedDiscount.discountTitle }}
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><span class="font-weight-bold">Ưu đãi theo %:</span> -{{
                      selectedDiscount.discountPercentage }}%</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><span class="font-weight-bold">Ưu đãi theo giá:</span> {{
                      formatCurrency(selectedDiscount.discountAmount) }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><span class="font-weight-bold">Giá trị tối thiểu:</span> {{
                      formatCurrency(selectedDiscount.minOrderValue) }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><span class="font-weight-bold">Ngày bắt đầu:</span> {{
                      formatDate(selectedDiscount.startDate) }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><span class="font-weight-bold">Ngày kết thúc:</span> {{
                      formatDate(selectedDiscount.endDate) }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title><span class="font-weight-bold">Trạng thái:</span> {{
                      getActiveStatusLabel(selectedDiscount.isActive) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-container>
          <v-container v-if="tabIndexDetail !== 0" fluid>
            <v-card>
              <v-data-table-server :headers="discountDialogHeader" :items="discountDetailDialog"
                :loading="dialogLoading" :items-length="totalItems" :items-per-page="itemsPerPage"
                @update:options="updateOptionsDetail">
                <template v-slot:item.index="{ index }">
                  {{ (page - 1) * itemsPerPage + index + 1 }}
                </template>

                <template v-slot:item.targetName="{ item }">
                  <div class="">
                    {{ item.targetName }}
                  </div>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-tooltip text="Loại bỏ áp dụng ưu đãi" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="mdi-delete" variant="text" :loading="deleteTargetLoading" color="error" size="small"
                        v-bind="props" @click="handleDeleteTarget(item)"></v-btn>
                    </template>
                  </v-tooltip>
                </template>

              </v-data-table-server>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="handleClickDetail">{{ handleName }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-container>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="handleDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ handleDialogName }}</span>
          <v-btn icon="mdi-close" variant="text" @click="handleDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-container fluid>
          <v-card>
            <v-data-table-server :headers="handleDialogHeader" :items="handleDialogItems" :loading="dialogLoading"
              :items-length="totalItems" :items-per-page="itemsPerPage" @update:options="updateOptionsHandleDialog">
              <template v-slot:item.index="{ index }">
                {{ (page - 1) * itemsPerPage + index + 1 }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-tooltip text="Áp dụng ưu đãi" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-plus" variant="text" :loading="addTargetLoading" color="primary" size="small"
                      v-bind="props" @click="handleAddTarget(item)"></v-btn>
                  </template>
                </v-tooltip>
              </template>

            </v-data-table-server>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="handleDialog = false">Đóng</v-btn>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteTargetDialog" max-width="400">
      <v-card>
        <v-card-title>Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa "{{ selectedDeleteTarget?.targetName }}"?
          Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="deleteTargetDialog = false">Hủy</v-btn>
          <v-btn color="error" @click="deleteTarget" :loading="deleting">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xóa -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa "{{ selectedDiscount?.discountTitle }}"?
          Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="error" @click="deletediscount" :loading="deleting">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { color } from 'echarts';
import { discountService } from '../../api/services/discountService';
import { categoryService } from '../../api/services/categoryService';
import { productService } from '../../api/services/productService';
import image_error from '../../assets/image_error.png';
import { formatPrice } from '../../utils/format';

export default {
  name: 'discountList',
  data() {
    return {
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      search: '',
      loading: false,
      notiShow: false,
      notiColor: null,
      notiContent: null,
      saving: false,
      deleting: false,
      valid: false,
      discountDialog: false,
      detailDialog: false,
      deleteDialog: false,
      isEdit: false,
      avatarFile: null,
      selectedDiscount: null,
      tabIndexDetail: 0,
      tabTitleDetail: ['Thông tin', 'Sản phẩm áp dụng', 'Danh mục áp dụng'],
      headers: [
        { title: 'STT', key: 'index', align: 'center', sortable: true },
        { title: 'Chương trình', key: 'discountTitle', align: 'center', width: '250px', sortable: true },
        { title: 'Theo %', key: 'discountPercentage', align: 'center', sortable: true },
        { title: 'Theo giá', key: 'discountAmount', align: 'center', sortable: true },
        { title: 'Giá trị tối thiểu', key: 'minOrderValue', align: 'center', sortable: true },
        { title: 'Thời gian', key: 'datePeriod', align: 'center', sortable: false },
        { title: 'Trạng thái', key: 'isActive', align: 'center', sortable: true },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      statistics: {
        totalDiscounts: null,
        activeDiscounts: null,
        discountedProducts: null,
        discountedCategories: null
      },
      discountStatuses: [
        'Hoạt động',
        'Không hoạt động',
        'VIP',
        'Chặn'
      ],
      statusMapping: {
        1: 'Hoạt động',
        0: 'Ngừng hoạt động'
      },
      startDateMenu: false,
      endDateMenu: false,
      editedItem: {
        id: null,
        title: '',
        percentage: '',
        amount: '',
        minOrder: '',
        startDate: null,
        endDate: null,
        status: '',
      },
      defaultItem: {
        id: null,
        title: '',
        percentage: '',
        amount: '',
        minOrder: '',
        startDate: null,
        endDate: null,
        status: '',
      },
      discounts: [],
      handleName: null,
      targetType: null,
      dialogLoading: false,
      discountDetailDialog: [],
      discountDialogHeader: [
        { title: 'STT', key: 'index', align: 'center', sortable: true },
        { title: 'Tên sản phẩm', key: 'targetName', align: 'center', sortable: true },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      addTargetLoading: false,
      deleteTargetDialog: false,
      deleteTargetLoading: false,
      selectedDeleteTarget: null,
      seletectAddTarget: null,
      handleDialog: false,
      handleDialogName: null,
      handleDialogItems: [],
      handleDialogHeader: [
        { title: 'STT', key: 'index', align: 'center', sortable: true },
        { title: 'Mã', key: 'code', align: 'center', sortable: true },
        { title: 'Tên', key: 'name', align: 'center', sortable: true },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ]
    };
  },
  computed: {
    filtereddiscounts() {
      return this.discounts;
    },
    formattedStartDate() {
      return this.editedItem.startDate ? new Date(this.editedItem.startDate).toLocaleDateString('vi-VN') : ''
    },
    formattedEndDate() {
      return this.editedItem.endDate ? new Date(this.editedItem.endDate).toLocaleDateString('vi-VN') : ''
    },
    statusOptions() {
      return Object.entries(this.statusMapping).map(([key, label]) => ({
        value: parseInt(key), // Key as a number (1, 2, 3, etc.)
        label, // Display label (e.g., "Chờ xử lý")
      }));
    },
  },
  mounted() {
    this.fetchDiscount();
    this.fetchStatistics();
  },
  methods: {
    async fetchStatistics() {
      try {
        const res = await discountService.statistics();
        const data = res.data.data;

        this.statistics = {
          totalDiscounts: data.totalDiscounts,
          activeDiscounts: data.activeDiscounts,
          discountedProducts: data.discountedProducts,
          discountedCategories: data.discountedCategories
        };


        console.log("fetchStatistics: ", res.data);
      } catch (error) {
        console.log("fetchStatistics Error: ", error);
      }
    },
    async fetchDiscount() {
      try {
        this.loading = true;

        const request = {
          page: this.page - 1,
          size: this.itemsPerPage,
        };

        const res = await discountService.getDiscountList(request);
        const data = res.data.data;

        this.discounts = data.content;
        this.totalItems = data.totalElements;

        console.log("FetchDiscount: ", res.data);
      } catch (error) {
        console.log("Error fetchdiscount: ", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchInfoByDiscountId() {
      try {
        this.dialogLoading = true;

        const request = {
          page: this.page - 1,
          size: this.itemsPerPage,
          discountId: this.selectedDiscount.id,
          targetType: this.targetType
        };

        const res = await discountService.getInfoByDiscountId(request);
        const data = res.data.data;

        this.discountDetailDialog = data.content;
        this.totalItems = data.totalElements;

        console.log("FetchDiscount: ", res.data);
      } catch (error) {
        console.log("Error fetchdiscount: ", error);
      } finally {
        this.dialogLoading = false;
      }
    },
    updateOptions(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      this.fetchDiscount();
    },
    updateOptionsDetail(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      this.fetchInfoByDiscountId();
    },
    updateOptionsHandleDialog(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      if (this.tabIndexDetail === 1)
        this.fetchProducts();
      else if (this.tabIndexDetail === 2)
        this.fetchCategory();
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
    getDiscountColor(field) {

      switch (field) {
        case 'discountPercentage':
          return 'blue';
        case 'discountAmount':
          return 'green';
        case 'minOrderValue':
          return 'orange';
        default:
          return 'grey';
      }
    },
    getActiveStatusColor(isActive) {
      return isActive ? 'green' : 'red';
    },
    getActiveStatusLabel(isActive) {
      return isActive ? 'Hoạt động' : 'Ngừng hoạt động';
    },
    showAddDialog() {
      this.isEdit = false;
      this.editedItem = { ...this.defaultItem };
      this.discountDialog = true;
    },
    showEditDialog(item) {
      this.isEdit = true;
      this.editedItem = {
        ...item,
        title: item.discountTitle,
        percentage: item.discountPercentage,
        amount: item.discountAmount,
        minOrder: item.minOrderValue,
        status: item.isActive ? 1 : 0
      };
      this.discountDialog = true;
    },
    showdiscountDetail(discount) {
      this.selectedDiscount = discount;
      this.detailDialog = true;

      console.log("selectedDiscount: ", this.selectedDiscount);
    },
    showDeleteDialog(discount) {
      this.selectedDiscount = discount;
      this.deleteDialog = true;
    },
    closeDiscountDialog() {
      this.discountDialog = false;
      this.editedItem = { ...this.defaultItem };
      this.$refs.form.reset();
    },
    async saveDiscount() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;
      try {

        if (this.isEdit) {
          const request = {
            id: this.editedItem.id,
            discountTitle: this.editedItem.title,
            discountPercentage: this.editedItem.percentage || 0,
            discountAmount: this.editedItem.amount || 0,
            minOrderValue: this.editedItem.minOrder || 0,
            startDate: this.editedItem.startDate
              ? new Date(this.editedItem.startDate).getTime()
              : null,
            endDate: this.editedItem.endDate
              ? new Date(this.editedItem.endDate).getTime()
              : null,
            isActive: this.editedItem.status
          };

          const res = await discountService.updateDiscount(request);
          if (res.data.data) {
            this.notiColor = "success";
            this.notiContent = "Cập nhập chương trình ưu đãi thành công!";
          } else {
            this.notiColor = "error";
            this.notiContent = "Cập nhập chương trình ưu đãi thất bại!";
          }
          console.log("Edit Discount: ", res.data);
        } else {
          const request = {
            discountTitle: this.editedItem.title,
            discountPercentage: this.editedItem.percentage || 0,
            discountAmount: this.editedItem.amount || 0,
            minOrderValue: this.editedItem.minOrder || 0,
            startDate: this.editedItem.startDate
              ? new Date(this.editedItem.startDate).getTime()
              : null,
            endDate: this.editedItem.endDate
              ? new Date(this.editedItem.endDate).getTime()
              : null,
            isActive: this.editedItem.status
          };

          const res = await discountService.createDiscount(request);
          if (res.data.data) {
            this.notiColor = "success";
            this.notiContent = "Thêm chương trình ưu đãi thành công!";
          } else {
            this.notiColor = "error";
            this.notiContent = "Thêm chương trình ưu đãi thất bại!";
          }
          console.log("Create Discount: ", res.data);
        }

        this.discountDialog = false;
        this.notiShow = true;
        this.fetchDiscount();
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error saving discount:', error);
      } finally {
        this.saving = false;
      }
    },
    async deletediscount() {
      this.deleting = true;
      try {

        const res = await discountService.deleteDiscount(this.selectedDiscount.id);
        if (res.data.data) {
          this.notiColor = "success";
          this.notiContent = "Xóa chương trình ưu đãi thành công!";
        } else {
          this.notiColor = "error";
          this.notiContent = "Xóa chương trình ưu đãi thất bại!";
        }

        this.deleteDialog = false;
        this.notiShow = true;
        this.fetchDiscount();
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error deleting discount:', error);
      } finally {
        this.deleting = false;
      }
    },
    exportToExcel() {
      // Implement export functionality
      console.log('Exporting to Excel');
    },
    handleClickDetail() {
      if (this.tabIndexDetail === 1) {
        this.handleDialogName = "Thêm sản phẩm vào áp dụng chương trình ưu đãi";
        this.fetchProducts();
        this.handleDialog = true;
      }
      if (this.tabIndexDetail === 2) {
        this.handleDialogName = "Thêm danh mục vào áp dụng chương trình ưu đãi";
        this.fetchCategory();
        this.handleDialog = true;
      }
    },
    async fetchCategory() {
      try {
        this.dialogLoading = true;
        const request = {
          page: this.page - 1,
          size: this.itemsPerPage
        }
        const res = await categoryService.getAllCategory(request);
        this.handleDialogItems = res.data.data.content.map(item => ({
          ...item,
          code: item.categorieCode,
          name: item.name
        }));
        this.totalItems = res.data.data.totalElements;
        console.log("handleDialogItems: ", this.handleDialogItems);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        this.dialogLoading = false;
      }
    },
    async fetchProducts() {
      try {
        this.dialogLoading = true;
        const request = {
          page: this.page - 1,
          size: this.itemsPerPage
        };
        const res = await productService.getProductsByPagination(request);
        this.handleDialogItems = res.data.data.content.map(item => ({
          ...item,
          code: item.productCode,
          name: item.name
        }));
        this.totalItems = res.data.data.totalElements;

        console.log("res: ", res.data)
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        this.dialogLoading = false;
      }
    },
    handleAddTarget(item) {
      this.seletectAddTarget = item;
      console.log("SelectedAddTarget: ", this.seletectAddTarget);
      this.createTarget();
    },
    handleDeleteTarget(item) {
      this.selectedDeleteTarget = item;
      console.log("Item: ", item);
      console.log("SelectedDeleteTarget: ", this.selectedDeleteTarget);
      this.deleteTargetDialog = true;
      console.log("deleleTargetDialog: ", this.deleteTargetDialog);
    },
    async deleteTarget() {
      this.deleting = true;
      try {

        const res = await discountService.deleteTarget(this.selectedDeleteTarget.idTarget);
        if (res.data.data) {
          this.notiColor = "success";
          this.notiContent = "Xóa thành công!";
        } else {
          this.notiColor = "error";
          this.notiContent = "Xóa thất bại!";
        }

        this.deleteTargetDialog = false;
        this.notiShow = true;
        this.fetchInfoByDiscountId();
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error deleting Target:', error);
      } finally {
        this.deleting = false;
      }
    },
    async createTarget() {
      this.addTargetLoading = true;
      try {
        const request = {
          discountId: this.selectedDiscount.id,
          targetType: this.targetType,
          targetId: this.seletectAddTarget.id
        };

        const res = await discountService.createTarget(request);
        if (res.data.data) {
          this.notiColor = "success";
          this.notiContent = "Thêm thành công!";
        } else {
          this.notiColor = "error";
          this.notiContent = "Thêm thất bại!";
        }

        this.notiShow = true;
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error deleting Target:', error);
      } finally {
        this.addTargetLoading = false;
      }
    }
  },
  watch: {
    tabIndexDetail(newVal) {
      if (newVal === 1) {
        this.targetType = "PRODUCT";
        this.handleName = "Thêm sản phẩm";
        this.fetchInfoByDiscountId();
      }
      if (newVal === 2) {
        this.targetType = "CATEGORIE";
        this.handleName = "Thêm danh mục";
        this.fetchInfoByDiscountId();
      }
    },
    detailDialog(newVal) {
      if (!newVal) {
        this.itemsPerPage = 10;
        this.tabIndexDetail = 0;
      } else {
        this.page = 1;
        this.itemsPerPage = 10;
      }
    },
    handleDialog(newVal) {
      if (!newVal) {
        this.fetchInfoByDiscountId();
      }
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