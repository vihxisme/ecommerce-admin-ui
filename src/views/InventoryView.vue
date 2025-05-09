<template>
  <v-container>
    <v-snackbar v-model="notiShow" :timeout="5000" location="top right" :color="notiColor">{{ notiContent
    }}</v-snackbar>
    <!-- Header với tìm kiếm và thống kê -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm sản phẩm" variant="outlined"
          hide-details class="search-field"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-2" color="primary" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-2">Tổng sản phẩm</div>
              <div class="text-h6">{{ formatNumber(totalProducts) }}</div>
            </div>
            <v-icon size="large">mdi-package-variant</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bộ lọc -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select v-model="selectedCategory" :items="categories" label="Danh mục" variant="outlined"
          clearable></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="stockStatus" :items="stockStatuses" item-title="status" item-value="key"
          label="Trạng thái tồn kho" variant="outlined" clearable return-value></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="minStock" label="Tồn kho tối thiểu" type="number" variant="outlined"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="maxStock" label="Tồn kho tối đa" type="number" variant="outlined"></v-text-field>
      </v-col>
    </v-row>

    <!-- Bảng danh sách sản phẩm -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Danh sách sản phẩm trong kho</span>
        <div>
          <v-btn color="primary" prepend-icon="mdi-refresh" class="mr-2" @click="refreshData" :loading="loading">
            Làm mới
          </v-btn>
          <v-btn color="success" prepend-icon="mdi-export" @click="exportInventory">
            Xuất Excel
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <v-data-table-server :headers="headers" :items="filterData" :loading="loading" :search="search"
          :items-per-page="itemsPerPage" :items-length="totalItems" :page="page" @update:options="updateOptions"
          class="elevation-0">
          <template v-slot:item.productImageUrl="{ item }">
            <v-avatar size="40">
              <v-img :src="fetchCloudinaryUrl(item.productImageUrl)" :lazy-src="image_error" />
            </v-avatar>
          </template>

          <template v-slot:item.productName="{ item }">
            <p class="text-left">{{ item.productName }}</p>
          </template>

          <template v-slot:item.stockStatus="{ item }">
            <v-chip :color="getStockColor(item.stockStatus)" size="small">
              {{ getStatusByKey(item.stockStatus) }}
            </v-chip>
          </template>


          <template v-slot:item.isAllowed="{ item }">
            <v-chip :color="getStatusColor(item.isAllowed)" size="small">
              {{ exportStatus(item.isAllowed) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-inbox-arrow-down" variant="text" color="input" size="small"
              @click="importStock(item)"></v-btn>
            <!-- <v-btn icon="mdi-pencil" variant="text" color="primary" size="small" @click="editStock(item)"></v-btn> -->
            <v-btn icon="mdi-history" variant="text" color="info" size="small" @click="viewHistory(item)"></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Dialog chỉnh sửa tồn kho -->
    <v-dialog v-model="editDialog" max-width="1000">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Chỉnh sửa - Nhập hàng</span>
          <v-btn icon="mdi-close" variant="text" @click="editDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4 text-h6">
          {{ editedItem.productCode }}\{{ editedItem.productName }}
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col cols="8">
              <v-data-table :headers="itemInventoryHeader" :loading="updateLoading" :items="itemInventory" :page="page"
                :items-per-page="itemsPerPage" :items-length="totalItems" @update:options="updateOptionsDialog">
                <template v-slot:item.actions="{ item }">
                  <v-btn icon="mdi-inbox-arrow-down" variant="text" color="input" size="small"
                    @click="handleImportStock(item)"></v-btn>
                  <v-btn icon="mdi-pencil" variant="text" color="primary" size="small"
                    @click="handleUpdateStock(item)"></v-btn>
                </template>
              </v-data-table>
            </v-col>
            <v-col cols="4">
              <v-tabs v-model="tabIndexUpdate" color="primary" class="border-b">
                <v-tab v-for="(tab, index) in tabTitleUpdate" :key="index" class="capitalize flex-grow-1">
                  {{ tab }}
                </v-tab>
              </v-tabs>
              <v-container v-if="tabIndexUpdate === 0" fluid>
                <v-text-field v-model="updateItem.itemQuantity" label="Sô lượng sản phẩm" type="number" min="0" flat
                  :disabled="!updateItem.id"></v-text-field>
                <v-card-actions class="mt-4 d-flex justify-end">
                  <v-btn color="error" @click="cancelUpdate" :disabled="!updateItem.id">Hủy</v-btn>
                  <v-btn color="primary" :loading="savingUpd" @click="savingUpdate"
                    :disabled="!updateItem.id">Lưu</v-btn>
                </v-card-actions>
              </v-container>
              <v-container v-if="tabIndexUpdate === 1" fluid>
                <v-text-field v-model="importStockItem.itemQuantity" label="Sô lượng hiện có" type="number" min="0" flat
                  readonly></v-text-field>
                <v-text-field v-model="importStockItem.addQuantity" label="Nhập thêm" type="number" min="0" flat
                  :disabled="!importStockItem.id"></v-text-field>
                <v-card-actions class="mt-4 d-flex justify-end">
                  <v-btn color="error" @click="cancelImportStock" :disabled="!importStockItem.id">Hủy</v-btn>
                  <v-btn color="primary" :loading="savingIpStock" @click="savingImportStock"
                    :disabled="!importStockItem.id">Nhập hàng</v-btn>
                </v-card-actions>
              </v-container>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="editDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog lịch sử tồn kho -->
    <v-dialog v-model="historyDialog" max-width="1000">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Lịch sử tồn kho</span>
          <v-btn icon="mdi-close" variant="text" @click="historyDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-tabs v-model="tabIndexHistory" color="primary" class="border-b">
            <v-tab v-for="(tab, index) in tabTitleHistory" :key="index" class="capitalize flex-grow-1">
              {{ tab }}
            </v-tab>
          </v-tabs>
          <v-container fluid>
            <v-data-table :headers="historyHeader" :loading="historyLoading" :items="stockHistory" :page="page"
              :items-per-page="itemsPerPage" :items-length="totalItems" @update:options="updateOptionHistory">
              <template v-slot:item.index="{ index }">
                {{ (page - 1) * itemsPerPage + index + 1 }}
              </template>
              <template v-slot:item.productName="{ item }">
                <p class="text-left">{{ item.productName }}</p>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx';
import { inventoryService } from '../api/services/inventoryService';
import { categoryService } from '../api/services/categoryService';
import { getStatusColor } from '../utils/api';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { color } from 'echarts';
import { ThemeSymbol } from 'vuetify/lib/composables/theme.mjs';
export default {
  name: 'InventoryView',
  data() {
    return {
      search: '',
      loading: false,
      updateLoading: false,
      historyLoading: false,
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      notiShow: false,
      notiColor: null,
      notiColor: null,
      savingUpd: false,
      savingIpStock: false,
      saving: false,
      totalProducts: 0,
      selectedCategory: null,
      stockStatus: null,
      minStock: null,
      maxStock: null,
      editDialog: false,
      historyDialog: false,
      editedItem: null,
      tabIndexUpdate: 0,
      tabTitleUpdate: ['Cập nhập', 'Nhập hàng'],
      tabIndexHistory: 0,
      tabTitleHistory: ['Chung', 'Nhập hàng', 'Xuất hàng', 'Kiểm kê'],
      updateItem: {
        id: null,
        itemQuantity: null,
      },
      importStockItem: {
        id: null,
        itemQuantity: null,
        addQuantity: null
      },
      type: null,
      selectedStockHistory: null,
      stockHistory: [],
      categories: [],
      itemInventory: [],
      selectedItem: null,
      itemInventoryHeader: [
        { title: 'Màu sắc', key: 'colorName', align: 'center' },
        { title: 'Kích cỡ', key: 'sizeName', align: 'center', sortable: false, },
        { title: 'Tồn kho', key: 'itemQuantity', align: 'center', sortable: false },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false },
      ],
      stockStatuses: [
        { key: 'IN_STOCK', status: 'Còn hàng' },
        { key: 'OUT_OF_STOCK', status: 'Hết hàng' },
        { key: 'LOW_STOCK', status: 'Sắp hết hàng' }
      ],
      headers: [
        { title: 'Hình ảnh', key: 'productImageUrl', align: 'center', sortable: false },
        // { title: 'Mã sản phẩm', key: 'productCode', align: 'center' },
        { title: 'Tên', key: 'productName', align: 'center', width: '300px' },
        { title: 'Danh mục', key: 'categoryName', align: 'center' },
        { title: 'Tồn kho', key: 'quantity', align: 'center', color: 'blue' },
        { title: 'Hàng hóa', key: 'stockStatus', align: 'center' },
        { title: 'Trạng thái', key: 'isAllowed', align: 'center' },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      historyHeader: [
        { title: 'STT', key: 'index', align: 'center' },
        { title: 'Mã sản phẩm', key: 'productCode', align: 'center' },
        { title: 'Tên', key: 'productName', align: 'center', width: '300px' },
        { title: 'Màu săc', key: 'colorName', align: 'center' },
        { title: 'Kích cỡ', key: 'sizeName', align: 'center', color: 'blue' },
        { title: 'Sô lượng', key: 'movementQuantity', align: 'center' },
        { title: 'Trạng thái', key: 'movementType', align: 'center' },
      ],
      inventoryItems: [],
    };
  },
  computed: {
    filterData() {
      let result = [...this.inventoryItems];

      if (this.selectedCategory) {
        result = result.filter(item => item.categoryName === this.selectedCategory);
      }

      if (this.stockStatus) {
        result = result.filter(item => item.stockStatus === this.stockStatus);
      }

      if (this.minStock) {
        result = result.filter(item => item.quantity >= this.minStock);
      }

      if (this.maxStock) {
        result = result.filter(item => item.quantity <= this.maxStock);
      }

      return result;
    },
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        // TODO: Gọi API lấy dữ liệu
        const request = {
          page: this.page - 1,
          size: this.itemsPerPage
        }
        const res = await inventoryService.getInventory(request);
        let inventory = res.data.data.content;
        this.inventoryItems = inventory.map(item => {
          let stockStatus = 'IN_STOCK';

          if (item.quantity === 0) {
            stockStatus = 'OUT_OF_STOCK';
          } else if (item.quantity < 20) {
            stockStatus = 'LOW_STOCK';
          }

          return {
            ...item,
            stockStatus
          };
        });

        this.totalItems = res.data.data.totalElements;
        this.totalProducts = res.data.data.totalElements;
        console.log("Inventory: ", res.data);
        console.log("InventoryItem: ", this.inventoryItems);
      } catch (error) {
        console.error('Error loading inventory data:', error);
      } finally {
        this.loading = false;
      }
    },
    fetchCloudinaryUrl(path) {
      return getCloudinaryUrl(path);
    },
    getStatusByKey(key) {
      const status = this.stockStatuses.find(item => item.key === key);
      return status ? status.status : 'Không xác định';
    },
    getStockColor(status) {
      switch (status) {
        case 'IN_STOCK':
          return 'success';
        case 'OUT_OF_STOCK':
          return 'error';
        case 'LOW_STOCK':
          return 'warning';
        default:
          return 'primary';
      }
    },
    getStockStatus(stock, minStock) {
      if (stock <= minStock) return 'Hết hàng';
      if (stock <= minStock * 1.5) return 'Sắp hết hàng';
      return 'Đủ hàng';
    },
    getStockStatusColor(stock, minStock) {
      if (stock <= minStock) return 'error';
      if (stock <= minStock * 1.5) return 'warning';
      return 'success';
    },
    editStock(item) {
      this.editedItem = { ...item };
      this.editDialog = true;
    },
    importStock(item) {
      this.editedItem = { ...item };
      this.fetchInvenItem();
      this.itemsPerPage = 5;
      this.editDialog = true;
    },
    async fetchInvenItem() {
      this.updateLoading = true;
      try {
        const request = {
          inventoryId: this.editedItem.id,
          page: this.page - 1,
          size: this.itemsPerPage
        }
        const res = await inventoryService.getInvenItem(request);
        this.itemInventory = res.data.data.content;
        this.totalItems = res.data.data.totalElements;

        console.log("ItemInventory: ", this.itemInventory);
      } catch (error) {
        console.error('Error loading item inventory data:', error);
      } finally {
        this.updateLoading = false;
      }
    },
    async viewHistory(item) {
      this.selectedStockHistory = item;
      this.historyDialog = true;
    },
    getHistoryColor(type) {
      switch (type) {
        case 'IN':
          return 'success';
        case 'OUT':
          return 'error';
        case 'ADJUSTMENT':
          return 'warning';
        default:
          return 'info';
      }
    },
    formatNumber(value) {
      return new Intl.NumberFormat('vi-VN').format(value);
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    },
    exportInventory() {
      const data = this.inventoryItems.map(inventory => ({
        'ID': inventory.id,
        'ID sản phảm': inventory.productId,
        'Mã code': inventory.productCode,
        'Tên sản phẩm': inventory.productName,
        'Danh mục': inventory.categoryName,
        'Tồn kho': inventory.quantity,
        'Hàng hóa': inventory.stockStatus,
        'Trạng thái': inventory.isAllowed
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách kho hàng');

      const randomFourDigits = Math.floor(1000 + Math.random() * 9999);

      XLSX.writeFile(workbook, `danh-sach-kho-hang_${randomFourDigits}.xlsx`);
    },
    getStatusColor(status) {
      if (status)
        return 'success';
      return 'grey';
    },
    exportStatus(status) {
      if (status)
        return 'Hoạt động';
      return 'Ngừng kinh doanh';
    },
    updateOptions(options) {
      if (options.itemsPerPage === -1) {
        this.itemsPerPage = this.totalItems;
      } else {
        this.itemsPerPage = options.itemsPerPage;
      }
      this.page = options.page;
      this.refreshData();
    },
    updateOptionsDialog(options) {
      if (options.itemsPerPage === -1) {
        this.itemsPerPage = this.totalItems;
      } else {
        this.itemsPerPage = options.itemsPerPage;
      }
      this.page = options.page;
      this.fetchInvenItem();
    },
    updateOptionHistory(options) {
      if (options.itemsPerPage === -1) {
        this.itemsPerPage = this.totalItems;
      } else {
        this.itemsPerPage = options.itemsPerPage;
      }
      this.page = options.page;
      if (this.tabIndexHistory === 0)
        this.getStockHistoryTypeAll();
      else
        this.getStockHistoryType();
    },
    async fetchCategories() {
      try {
        const res = await categoryService.getCategoryAll();
        const data = res.data.data;

        this.categories = data.map(item => item.name);
      } catch (error) {
        console.log("Error fetchCategories: ", error);
      }
    },
    handleImportStock(item) {
      this.importStockItem = {
        id: item.id,
        itemQuantity: item.itemQuantity,
        addQuantity: null,
      };
      this.tabIndexUpdate = 1;
      console.log("ImportStock: ", this.importStockItem);
    },
    handleUpdateStock(item) {
      this.updateItem = {
        id: item.id,
        itemQuantity: item.itemQuantity
      };
      this.tabIndexUpdate = 0;
      console.log("updateItem: ", this.updateItem);
    },
    cancelUpdate() {
      this.updateItem = {
        id: null,
        itemQuantity: null,
      };
    },
    cancelImportStock() {
      this.importStockItem = {
        id: null,
        itemQuantity: null,
        addQuantity: null
      };
    },
    async savingUpdate() {
      //   if (this.updateItem.itemQuantity) {
      //     return;
      //   }
      this.savingUpd = true;
      try {
        const request = {
          id: this.updateItem.id,
          itemQuantity: this.updateItem.itemQuantity
        };
        const res = await inventoryService.updateInventoryItem(request);
        if (res.data.data) {
          this.notiColor = "error";
          this.notiContent = "Cập nhập thành công!";
        } else {
          this.notiColor = "error";
          this.notiContent = "Cập nhập thất bại!";
        }

        this.fetchInvenItem();
        this.refreshData();
        this.notiShow = true;
        console.log("Saving Update: ", res.data);
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.log("Saving Update: ", error);
      } finally {
        this.savingUpd = false;
      }
    },
    async savingImportStock() {
      // if (!this.importStockItem.addQuantity) return;

      this.savingIpStock = true;
      try {
        const request = {
          id: this.importStockItem.id,
          itemQuantity: this.importStockItem.addQuantity
        };
        const res = await inventoryService.inventoryIntake(request);
        if (res.data.data) {
          this.notiColor = "success";
          this.notiContent = "Nhập hàng thành công!";
        } else {
          this.notiColor = "error";
          this.notiContent = "Nhập hàng thất bại!";
        }

        this.fetchInvenItem();
        this.refreshData();
        this.notiShow = true;
        console.log("Saving Update: ", res.data);
      } catch (error) {
        this.notiColor = "success";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.log("Saving ImportStock: ", error);
      } finally {
        this.savingIpStock = false;
      }
    },
    async getStockHistoryTypeAll() {
      this.historyLoading = true;
      try {
        const request = {
          inventoryId: this.selectedStockHistory.id,
          page: this.page,
          size: this.itemsPerPage
        };

        const res = await inventoryService.getHistoryStockTypeAll(request);
        this.stockHistory = res.data.data.content;
        this.totalItems = res.data.data.totalElements;

        console.log("Stock History TypeAll: ", res.data);
      }
      catch (error) {
        console.log("fetch History Stock TypeAll: ", error);
      } finally {
        this.historyLoading = false;
      }
    },
    async getStockHistoryType() {
      this.historyLoading = true;
      try {
        const request = {
          inventoryId: this.selectedStockHistory.id,
          type: this.type,
          page: this.page,
          size: this.itemsPerPage
        };

        const res = await inventoryService.getHistoryStockType(request);
        this.stockHistory = res.data.data.content;
        this.totalItems = res.data.data.totalElements;

        console.log("Stock History TypeAll: ", res.data);
      }
      catch (error) {
        console.log("fetch History Stock TypeAll: ", error);
      } finally {
        this.historyLoading = false;
      }
    },
  },
  mounted() {
    this.refreshData();
    this.fetchCategories();
  },
  watch: {
    editDialog(newVal) {
      if (!newVal) {
        this.itemsPerPage = 10;
      }
    },
    historyDialog(newVal) {
      if (!newVal) {
        this.itemsPerPage = 10;
        this.refreshData();
      } else {
        this.itemsPerPage = 10;
        this.getStockHistoryTypeAll();
      }
    },
    tabIndexHistory(newVal) {
      switch (newVal) {
        case 1:
          this.type = 'IN';
          this.getStockHistoryType();
          return;
        case 2:
          this.type = 'OUT';
          this.getStockHistoryType();
          return;
        case 3:
          this.type = 'ADJUSTMENT';
          this.getStockHistoryType();
          return;
        default:
          this.getStockHistoryTypeAll();
          return;
      }
    }
  }
};
</script>

<style scoped>
.v-data-table {
  border-radius: 12px;
  overflow: hidden;
}

.v-progress-linear {
  border-radius: 4px;
}

.v-chip {
  font-weight: 600;
}

.v-timeline-item {
  min-height: 60px;
}

.v-timeline-item__body {
  padding: 8px 0;
}
</style>;