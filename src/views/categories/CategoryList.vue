<template>
  <v-container>
    <v-snackbar v-model="notiShow" :timeout="5000" location="top right" :color="notiColor">{{ notiContent
    }}</v-snackbar>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quản lý danh mục</span>
        <div>
          <v-btn color="success" prepend-icon="mdi-file-import" class="mr-2" @click="showImportDialog">
            Import
          </v-btn>
          <v-btn color="info" prepend-icon="mdi-file-export" class="mr-2" @click="exportCategories">
            Export
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog">
            Thêm danh mục
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <!-- Thống kê -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-h6">Tổng số danh mục</div>
                <div class="text-h4">{{ totalCategories }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-h6">Danh mục gốc</div>
                <div class="text-h4">{{ rootCategories }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-h6">Danh mục con</div>
                <div class="text-h4">{{ childCategories }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-h6">Tổng số sản phẩm</div>
                <div class="text-h4">{{ totalProducts }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tìm kiếm và lọc -->
        <v-row>
          <v-col cols="12" md="8" class="mx-auto">
            <v-text-field v-model="search" label="Tìm kiếm danh mục" prepend-inner-icon="mdi-magnify"
              clearable></v-text-field>
          </v-col>
        </v-row>

        <!-- Tìm kiếm nâng cao -->
        <v-expand-transition>
          <v-card v-if="showAdvancedSearch" variant="outlined" class="mb-4">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="advancedSearch.name" label="Tên danh mục" clearable></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select v-model="advancedSearch.parentId" :items="parentCategories" label="Danh mục cha"
                    item-title="name" item-value="id" clearable></v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="advancedSearch.description" label="Mô tả" clearable></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="advancedSearch.minProducts" label="Số sản phẩm tối thiểu" type="number"
                    clearable></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="advancedSearch.maxProducts" label="Số sản phẩm tối đa" type="number"
                    clearable></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                    min-width="auto">
                    <template v-slot:activator="{ props }">
                      <v-text-field v-model="advancedSearch.dateRange" label="Ngày tạo" prepend-icon="mdi-calendar"
                        readonly v-bind="props" clearable></v-text-field>
                    </template>
                    <v-date-picker v-model="advancedSearch.dateRange" range
                      @update:model-value="dateMenu = false"></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="text-right">
                  <v-btn color="primary" prepend-icon="mdi-magnify" @click="applyAdvancedSearch">
                    Tìm kiếm
                  </v-btn>
                  <v-btn class="ml-2" color="grey" @click="resetAdvancedSearch">
                    Đặt lại
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <v-row class="mb-4">
          <v-col cols="12" class="d-flex justify-space-between align-center">
            <v-btn-toggle v-model="viewMode" mandatory color="primary">
              <v-btn value="table" prepend-icon="mdi-table">
                Bảng
              </v-btn>
              <v-btn value="tree" prepend-icon="mdi-file-tree">
                Cây
              </v-btn>
            </v-btn-toggle>
            <div>
              <v-btn variant="text" prepend-icon="mdi-filter-variant" @click="showAdvancedSearch = !showAdvancedSearch">
                {{ showAdvancedSearch ? 'Ẩn tìm kiếm nâng cao' : 'Tìm kiếm nâng cao' }}
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Bảng danh mục -->
        <v-data-table-server v-if="viewMode === 'table'" :headers="headers" :items="filteredCategories" :search="search"
          :loading="loading" :items-per-page="itemsPerPage" :items-length="totalItems" @update:options="updateOptions"
          class="elevation-1">
          <template v-slot:item.categorieImageUrl="{ item }">
            <v-avatar size="40">
              <v-img :src="fetchCloudinaryUrl(item.categorieImageUrl)" @error="(e) => e.target.src = image_error" />
            </v-avatar>
          </template>

          <template v-slot:item.name="{ item }">
            <p>{{ item.name }}</p>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-content-copy" variant="text" color="info" @click="copyItem(item)"></v-btn>
            <v-btn icon="mdi-pencil" variant="text" color="primary" @click="editItem(item)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" color="error" @click="deleteItem(item)"></v-btn>
          </template>
        </v-data-table-server>

        <!-- Hiển thị dạng cây -->
        <v-treeview v-else :items="treeItems" :search="search" :open="openNodes" :active="activeNodes" activatable
          hoverable return-object item-key="id" item-title="name" item-children="children" class="category-tree">
          <template v-slot:prepend="{ item }">
            <v-img :src="item.image" width="24" height="24" class="rounded mr-2"></v-img>
          </template>

          <template v-slot:append="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" class="mr-2">
              {{ item.status }}
            </v-chip>
            <!-- <v-btn icon="mdi-content-copy" variant="text" color="info" size="small" @click="copyItem(item)"></v-btn> -->
            <v-btn icon="mdi-pencil" variant="text" color="primary" size="small" @click="editItem(item)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" color="error" size="small" @click="deleteItem(item)"></v-btn>
          </template>
        </v-treeview>

        <!-- Biểu đồ thống kê -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Phân bố sản phẩm theo danh mục</span>
                <v-btn icon="mdi-download" variant="text" @click="downloadChart('productsChart')"></v-btn>
              </v-card-title>
              <v-card-text>
                <v-chart ref="productsChart" class="chart" :option="productsChartOption" autoresize></v-chart>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Tỷ lệ sản phẩm theo danh mục</span>
                <v-btn icon="mdi-download" variant="text" @click="downloadChart('subcategoriesChart')"></v-btn>
              </v-card-title>
              <v-card-text>
                <v-chart ref="subcategoriesChart" class="chart" :option="subcategoriesChartOption" autoresize></v-chart>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dialog thêm/sửa danh mục -->
    <v-dialog v-model="categoryDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ isEdit ? 'Sửa danh mục' : 'Thêm danh mục' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="categoryDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedItem.name" label="Tên danh mục"
                  :rules="[v => !!v || 'Tên danh mục là bắt buộc']" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select v-model="editedItem.apparelType" :items="apparelTypeMap" label="Phân loại" item-title="type"
                  item-value="key" clearable required return-value></v-select>
              </v-col>
              <v-col cols="12" class="d-flex justify-center">
                <v-file-input v-model="editedItem.imageFile" type="file" ref="fileInput" accept="image/*"
                  style="display: none;" @change="handleImageChange" />

                <!-- Custom image selector -->
                <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200" width="40%"
                  color="grey-lighten-3" style="cursor: pointer; position: relative;" @click="triggerFileInput">
                  <!-- Hiển thị ảnh đã chọn -->
                  <v-img v-if="selectedImage" :src="selectedImage" height="100%" width="100%" cover
                    class="rounded-lg"></v-img>
                  <v-img v-else-if="editedItem.image" :src="fetchCloudinaryUrl(editedItem.image)" height="100%"
                    width="100%" cover class="rounded-lg">
                  </v-img>

                  <!-- Hiện icon khi chưa có ảnh -->
                  <div v-else class="flex flex-col">
                    <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                    <span class="text-xs mx-2">Thêm ảnh</span>
                  </div>

                  <!-- Nút xóa ảnh -->
                  <v-btn v-if="editedItem.image" icon color="error" size="x-small" variant="flat"
                    style="position: absolute; top: 4px; right: 4px; z-index: 2;" @click.stop="removeImage">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="categoryDialog = false">Hủy</v-btn>
          <v-btn color="primary" @click="saveCategory" :loading="loading">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xóa -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa danh mục "{{ editedItem.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="loading">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog import -->
    <v-dialog v-model="importDialog" max-width="500">
      <v-card>
        <v-card-title>Import danh mục</v-card-title>
        <v-card-text>
          <v-file-input v-model="importFile" label="Chọn file Excel" accept=".xlsx,.xls" prepend-icon="mdi-file-excel"
            @change="handleImportFile"></v-file-input>
          <v-alert v-if="importError" type="error" class="mt-2">
            {{ importError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="importDialog = false">Hủy</v-btn>
          <v-btn color="primary" @click="importCategories" :loading="importing" :disabled="!importFile">
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog sản phẩm -->
    <v-dialog v-model="productsDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Sản phẩm trong danh mục "{{ selectedCategory?.name }}"</span>
          <v-btn icon="mdi-close" variant="text" @click="productsDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-data-table :headers="productHeaders" :items="categoryProducts" :loading="loading" :items-per-page="10"
            class="elevation-1">
            <template v-slot:item.image="{ item }">
              <v-img :src="item.image" width="40" height="40" class="rounded"></v-img>
            </template>
            <template v-slot:item.price="{ item }">
              {{ formatPrice(item.price) }}
            </template>
            <template v-slot:item.stock="{ item }">
              <v-chip :color="getStockColor(item.stock)" size="small">
                {{ item.stock }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog sao chép -->
    <v-dialog v-model="copyDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Sao chép danh mục</span>
          <v-btn icon="mdi-close" variant="text" @click="copyDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="copyForm" v-model="copyValid">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="copiedItem.name" label="Tên danh mục mới"
                  :rules="[v => !!v || 'Tên danh mục là bắt buộc']" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select v-model="copiedItem.parentId" :items="parentCategories" label="Danh mục cha" item-title="name"
                  item-value="id" clearable></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch v-model="copiedItem.copyProducts" label="Sao chép sản phẩm" color="primary"></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="copyDialog = false">Hủy</v-btn>
          <v-btn color="primary" @click="confirmCopy" :loading="loading">
            Sao chép
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { categoryService } from '../../api/services/categoryService';
import { filterItems } from 'vuetify/lib/composables/filter.mjs';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { formatCurrency } from '../../utils/api';
import image_error from "../../assets/image_error.png";
import { uploadImageToCloudinary } from '../../api/services/cloudinaryService';
import { color } from 'echarts';

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default {
  name: 'CategoryList',
  components: {
    VChart
  },
  data() {
    return {
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      search: '',
      statusFilter: null,
      loading: false,
      notiShow: false,
      notiColor: null,
      notiContent: null,
      categoryDialog: false,
      deleteDialog: false,
      valid: false,
      isEdit: false,
      editedItem: {
        id: null,
        name: '',
        apparelType: null,
        image: '',
        imageFile: null,
      },
      defaultItem: {
        id: null,
        name: '',
        apparelType: null,
        image: '',
        imageFile: null,
      },
      headers: [
        { title: 'Hình ảnh', key: 'categorieImageUrl', align: 'center', sortable: false },
        { title: 'Tên danh mục', key: 'name', align: 'center', },
        { title: 'Mã danh mục', key: 'categorieCode', align: 'center', },
        { title: 'Số lượng sản phẩm', key: 'productsCount', align: 'center' },
        { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
      ],
      statuses: ['Hoạt động', 'Không hoạt động'],
      categories: [],
      viewMode: 'table',
      openNodes: [],
      activeNodes: [],
      treeItems: [],
      dragOptions: {
        animation: 200,
        group: 'categories',
        disabled: false,
        ghostClass: 'ghost'
      },
      selectedImage: null,
      fileInput: null,
      importDialog: false,
      importFile: null,
      importError: null,
      importing: false,
      productsDialog: false,
      selectedCategory: null,
      categoryProducts: [],
      productHeaders: [
        { title: 'Hình ảnh', key: 'image', align: 'center', sortable: false },
        { title: 'Tên sản phẩm', key: 'name', align: 'center' },
        { title: 'Giá', key: 'price', align: 'center' },
        { title: 'Tồn kho', key: 'stock', align: 'center' },
        { title: 'Trạng thái', key: 'status', align: 'center' }
      ],
      apparelTypeMap: [
        { key: 1, type: "Áo" },
        { key: 2, type: "Quần" }
      ],
      showAdvancedSearch: false,
      dateMenu: false,
      advancedSearch: {
        name: '',
        parentId: null,
        description: '',
        minProducts: null,
        maxProducts: null,
        dateRange: []
      },
      copyDialog: false,
      copyValid: false,
      copiedItem: {
        name: '',
        parentId: null,
        copyProducts: false
      },
      productsChartOption: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: []
        },
        series: [
          {
            name: 'Sản phẩm',
            type: 'pie',
            radius: '50%',
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      subcategoriesChartOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: []
        },
        series: [
          {
            name: 'Số lượng sản phẩm',
            type: 'bar',
            data: []
          }
        ],
      }
    };
  },
  computed: {
    parentCategories() {
      return this.categories.filter(c => !c.parentId);
    },
    filteredCategories() {
      let result = [...this.categories];

      // Basic filters
      if (this.statusFilter) {
        result = result.filter(c => c.status === this.statusFilter);
      }

      // Advanced filters
      if (this.showAdvancedSearch) {
        if (this.advancedSearch.name) {
          result = result.filter(c =>
            c.name.toLowerCase().includes(this.advancedSearch.name.toLowerCase())
          );
        }
        if (this.advancedSearch.parentId) {
          result = result.filter(c => c.parentId === this.advancedSearch.parentId);
        }
        if (this.advancedSearch.description) {
          result = result.filter(c =>
            c.description.toLowerCase().includes(this.advancedSearch.description.toLowerCase())
          );
        }
        if (this.advancedSearch.minProducts) {
          result = result.filter(c => (c.productCount || 0) >= this.advancedSearch.minProducts);
        }
        if (this.advancedSearch.maxProducts) {
          result = result.filter(c => (c.productCount || 0) <= this.advancedSearch.maxProducts);
        }
        if (this.advancedSearch.dateRange?.length === 2) {
          result = result.filter(c => {
            const date = new Date(c.createdAt);
            return date >= new Date(this.advancedSearch.dateRange[0]) &&
              date <= new Date(this.advancedSearch.dateRange[1]);
          });
        }
      }

      return result;
    },
    totalCategories() {
      return this.totalItems;
    },
    rootCategories() {
      return this.categories.filter(c => !c.parentId).length;
    },
    childCategories() {
      return this.categories.filter(c => c.parentId).length;
    },
    totalProducts() {
      return this.categories.reduce((sum, c) => sum + (c.productsCount || 0), 0);
    }
  },
  watch: {
    filteredCategories: {
      handler: 'buildTree',
      immediate: true
    },
    categories: {
      handler: 'updateCharts',
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.fetchCategory()
  },
  methods: {
    updateOptions(options) {
      this.page = options.page;
      this.itemsPerPage = options.itemsPerPage;
      this.fetchCategory();
    },
    fetchCloudinaryUrl(path) {
      return getCloudinaryUrl(path);
    },
    showAddDialog() {
      this.isEdit = false;
      this.editedItem = this.defaultItem;
      this.selectedImage = null;
      this.categoryDialog = true;
    },
    editItem(item) {
      this.isEdit = true;
      const temp = {
        id: item.id,
        name: item.name,
        apparelType: item.apparelType,
        image: item.categorieImageUrl,
        imageFile: null,
      };
      this.selectedImage = getCloudinaryUrl(item.categorieImageUrl);
      this.editedItem = temp;
      console.log("Type: ", this.editedItem.apparelType);
      this.categoryDialog = true;
    },
    deleteItem(item) {
      const temp = {
        id: item.id,
        name: item.name,
        apparelType: item.apparelType,
        image: item.categorieImageUrl,
        imageFile: null,
      };
      this.selectedImage = getCloudinaryUrl(item.categorieImageUrl);
      this.editedItem = temp;
      this.deleteDialog = true;
    },
    async fetchCategory() {
      try {
        this.loading = true;
        const request = {
          page: this.page - 1,
          size: this.itemsPerPage
        }
        const res = await categoryService.getAllCategory(request);
        this.categories = res.data.data.content.map(item => ({
          ...item,
          productsCount: item.products.length
        }))
        this.totalItems = res.data.data.totalElements;

        console.log("categories: ", res.data);
        console.log("new cate: ", this.categories);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error('Error fetching categories:', error);
      }
    },
    async saveCategory() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        const originalImageUrl = this.fetchCloudinaryUrl(this.editedItem.image);
        if (this.editedItem.imageFile && this.selectedImage !== originalImageUrl) {
          const uploadedUrl = await uploadImageToCloudinary(this.editedItem.imageFile);
          const filePath = uploadedUrl.split('/upload/')[1];
          this.editedItem.image = filePath;
          this.editedItem.imageFile = null;
          console.log("uploadedUrl: ", uploadedUrl);
          console.log("filePath: ", filePath);
        }

        if (this.isEdit) {
          // Gọi API cập nhật
          const request = {
            id: this.editedItem.id,
            name: this.editedItem.name,
            categorieImageUrl: this.editedItem.image,
            apparelType: this.editedItem.apparelType,
          };
          const res = await categoryService.updateCategory(request);
          if (res.data.data) {
            this.notiColor = "success";
            this.notiContent = "Cập nhập danh mục thành công!";
          } else {
            this.notiColor = "error";
            this.notiContent = "Cập nhập danh mục thất bại";
          }
        } else {
          const request = {
            name: this.editedItem.name,
            categorieImageUrl: this.editedItem.image,
            apparelType: this.editedItem.apparelType,
          };
          const res = await categoryService.createCategory(request);
          console.log("UpdateCategory: ", res.data);
          if (res.data.data) {
            this.notiColor = "success";
            this.notiContent = "Thêm danh mục thành công!";
          } else {
            this.notiColor = "error";
            this.notiContent = "Thêm danh mục thất bại";
          }
        }
        this.fetchCategory();
        this.categoryDialog = false;
        this.notiShow = true;
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error saving category:', error);
      } finally {
        this.loading = false;
      }
    },
    async confirmDelete() {
      this.loading = true;
      try {
        // Gọi API xóa
        const delCategory = this.categories.find(c => c.id === this.editedItem.id);
        if (delCategory.productsCount > 0) {
          this.notiColor = "warning";
          this.notiContent = "Không thể xóa do ràng buộc dữ liệu!";
        } else {
          const res = categoryService.deleteCategory(delCategory.id);
          this.notiColor = "success";
          this.notiContent = "Xóa danh mục thành công!";
        }
        this.fetchCategory();
        this.deleteDialog = false;
        this.notiShow = true;
      } catch (error) {
        this.notiColor = "error";
        this.notiContent = "Có lỗi xảy ra!";
        this.notiShow = true;
        console.error('Error deleting category:', error);
      } finally {
        this.loading = false;
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      if (!file) {
        this.editedItem.imageFile = null;
        this.editedItem.image = null;
        return;
      }

      if (!this.isImageFile(file)) {
        alert('Vui lòng chọn file hình ảnh');
        this.editedItem.imageFile = null;
        this.editedItem.image = null;
        return;
      }

      this.editedItem.imageFile = file;
      // editedItem.image = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    isImageFile(file) {
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const fileName = file.name.toLowerCase();
      const extensionCheck = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp');

      return acceptedTypes.includes(file.type) || extensionCheck;
    },
    removeImage() {
      this.editedItem.imageFile = null;
      this.editedItem.image = null;
      this.selectedImage = null;
    },
    triggerFileInput() {
      // this.fileInput?.click();
      const fileInputComponent = this.$refs.fileInput;
      const realInput = fileInputComponent?.$el?.querySelector('input[type="file"]');
      realInput?.click();
    },
    getStatusColor(status) {
      return status === 'Hoạt động' ? 'success' : 'error';
    },
    buildTree() {
      const items = this.filteredCategories.filter(c => !c.parentId);
      this.treeItems = this.buildTreeRecursive(items);
    },
    buildTreeRecursive(items) {
      return items.map(item => {
        const children = this.filteredCategories.filter(c => c.parentId === item.id);
        return {
          ...item,
          children: this.buildTreeRecursive(children)
        };
      });
    },
    handleDragEnd(evt) {
      const { newIndex, oldIndex } = evt;
      if (newIndex !== oldIndex) {
        const movedItem = this.categories[oldIndex];
        this.categories.splice(oldIndex, 1);
        this.categories.splice(newIndex, 0, movedItem);
        // Gọi API cập nhật thứ tự
        this.updateCategoryOrder();
      }
    },
    async updateCategoryOrder() {
      this.loading = true;
      try {
        // Gọi API cập nhật thứ tự
        const orderData = this.categories.map((item, index) => ({
          id: item.id,
          order: index
        }));
        // TODO: Gọi API cập nhật thứ tự
        console.log('Updating category order:', orderData);
      } catch (error) {
        console.error('Error updating category order:', error);
      } finally {
        this.loading = false;
      }
    },
    showImportDialog() {
      this.importDialog = true;
      this.importFile = null;
      this.importError = null;
    },
    handleImportFile(file) {
      if (file) {
        this.importError = null;
      }
    },
    async importCategories() {
      if (!this.importFile) return;

      this.importing = true;
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Validate và import dữ liệu
          const validData = jsonData.filter(item => item.name);
          if (validData.length === 0) {
            this.importError = 'Không có dữ liệu hợp lệ trong file';
            return;
          }

          // Thêm danh mục mới
          validData.forEach(item => {
            const newId = Math.max(...this.categories.map(c => c.id)) + 1;
            this.categories.push({
              id: newId,
              name: item.name,
              parentId: item.parentId || null,
              description: item.description || '',
              image: 'https://via.placeholder.com/40',
              status: item.status || 'Hoạt động',
              productCount: 0
            });
          });

          this.importDialog = false;
        };
        reader.readAsArrayBuffer(this.importFile);
      } catch (error) {
        this.importError = 'Lỗi khi đọc file: ' + error.message;
      } finally {
        this.importing = false;
      }
    },
    exportCategories() {
      const typeMap = {
        1: 'Áo',
        2: 'Quần',
        3: 'Phụ kiện'
      };
      const data = this.categories.map(category => ({
        'ID': category.id,
        'Mã code': category.categorieCode,
        'Tên danh mục': category.name,
        'Loại': typeMap[category.apparelType] || 'Khác',
        'Số lượng sản phẩm': category.producstCount || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục');

      XLSX.writeFile(workbook, 'danh-muc.xlsx');
    },
    async showProductsDialog(category) {
      this.selectedCategory = category;
      this.productsDialog = true;
      this.loading = true;

      try {
        // TODO: Gọi API lấy danh sách sản phẩm theo danh mục
        this.categoryProducts = [
          {
            id: 1,
            name: 'iPhone 13',
            price: 20000000,
            stock: 10,
            status: 'Còn hàng',
            image: 'https://via.placeholder.com/40'
          },
          {
            id: 2,
            name: 'iPhone 14',
            price: 25000000,
            stock: 5,
            status: 'Còn hàng',
            image: 'https://via.placeholder.com/40'
          }
        ];
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        this.loading = false;
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    },
    getStockColor(stock) {
      if (stock > 10) return 'success';
      if (stock > 0) return 'warning';
      return 'error';
    },
    applyAdvancedSearch() {
      // Filter will be applied automatically through computed property
    },
    resetAdvancedSearch() {
      this.advancedSearch = {
        name: '',
        parentId: null,
        description: '',
        minProducts: null,
        maxProducts: null,
        dateRange: []
      };
    },
    copyItem(item) {
      this.copiedItem = {
        name: `${item.name} (Bản sao)`,
        parentId: item.parentId,
        copyProducts: false
      };
      this.copyDialog = true;
    },
    async confirmCopy() {
      if (!this.$refs.copyForm.validate()) return;

      this.loading = true;
      try {
        const newId = Math.max(...this.categories.map(c => c.id)) + 1;
        const newCategory = {
          id: newId,
          name: this.copiedItem.name,
          parentId: this.copiedItem.parentId,
          description: this.categories.find(c => c.id === this.copiedItem.id)?.description || '',
          image: 'https://via.placeholder.com/40',
          status: 'Hoạt động',
          productCount: 0
        };

        if (this.copiedItem.copyProducts) {
          // TODO: Gọi API sao chép sản phẩm
          newCategory.productCount = this.categories.find(c => c.id === this.copiedItem.id)?.productCount || 0;
        }

        this.categories.push(newCategory);
        this.copyDialog = false;
      } catch (error) {
        console.error('Error copying category:', error);
      } finally {
        this.loading = false;
      }
    },
    updateCharts() {
      // Cập nhật biểu đồ sản phẩm
      const productsData = this.categories
        .filter(c => c.productsCount > 0)
        .map(c => ({
          value: c.productsCount,
          name: c.name
        }));

      this.productsChartOption.legend.data = productsData.map(d => d.name);
      this.productsChartOption.series[0].data = productsData;

      // Cập nhật biểu đồ danh mục con
      const subcategoriesData = this.categories
        .filter(c => c.productsCount > 0)
        .map(c => ({
          name: c.name,
          value: c.productsCount
        }));
      this.subcategoriesChartOption.yAxis.data = subcategoriesData.map(d => d.name);
      this.subcategoriesChartOption.series[0].data = subcategoriesData.map(d => d.value);
    },
    downloadChart(chartRef) {
      const chart = this.$refs[chartRef];
      if (chart) {
        const dataURL = chart.getDataURL();
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${chartRef}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
};
</script>

<style scoped>
.rounded {
  border-radius: 4px;
}

.category-tree {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 16px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.mr-2 {
  margin-right: 8px;
}

.text-h4 {
  font-size: 2.125rem;
  font-weight: 400;
  line-height: 2.5rem;
  letter-spacing: 0.0073529412em;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ml-2 {
  margin-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.chart {
  height: 300px;
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}
</style>