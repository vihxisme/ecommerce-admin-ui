<template>
  <div class="category-view">
    <v-container fluid>
      <!-- Header Section -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" md="6">
                  <div class="text-h5 font-weight-bold">Quản lý danh mục</div>
                  <div class="text-subtitle-1 text-medium-emphasis">
                    Quản lý và tổ chức danh mục sản phẩm
                  </div>
                </v-col>
                <v-col cols="12" md="6" class="d-flex justify-end">
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    class="mr-2"
                    @click="openCreateDialog"
                  >
                    Thêm danh mục
                  </v-btn>
                  <v-btn
                    color="success"
                    prepend-icon="mdi-file-tree"
                    class="mr-2"
                    @click="openTreeView"
                  >
                    Sắp xếp
                  </v-btn>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-upload"
                    class="mr-2"
                    @click="openImportDialog"
                  >
                    Nhập Excel
                  </v-btn>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="info"
                        prepend-icon="mdi-export"
                        v-bind="props"
                      >
                        Xuất
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="exportCategories('excel')">
                        <v-list-item-title>
                          <v-icon start>mdi-microsoft-excel</v-icon>
                          Xuất Excel
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="exportCategories('pdf')">
                        <v-list-item-title>
                          <v-icon start>mdi-file-pdf-box</v-icon>
                          Xuất PDF
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-subtitle-1 text-medium-emphasis">Tổng danh mục</div>
                  <div class="text-h4 font-weight-bold">{{ formatNumber(totalCategories) }}</div>
                </div>
                <v-icon size="48" color="primary">mdi-tag-multiple</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-subtitle-1 text-medium-emphasis">Danh mục hoạt động</div>
                  <div class="text-h4 font-weight-bold">{{ formatNumber(activeCategories) }}</div>
                </div>
                <v-icon size="48" color="success">mdi-check-circle</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-subtitle-1 text-medium-emphasis">Danh mục cha</div>
                  <div class="text-h4 font-weight-bold">{{ formatNumber(parentCategoriesCount) }}</div>
                </div>
                <v-icon size="48" color="info">mdi-folder-multiple</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-subtitle-1 text-medium-emphasis">Tổng sản phẩm</div>
                  <div class="text-h4 font-weight-bold">{{ formatNumber(totalProducts) }}</div>
                </div>
                <v-icon size="48" color="warning">mdi-package-variant</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search and Filters -->
      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Tìm kiếm danh mục"
                variant="outlined"
                hide-details
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedStatus"
                :items="statuses"
                label="Trạng thái"
                variant="outlined"
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedParent"
                :items="parentCategories"
                label="Danh mục cha"
                variant="outlined"
                hide-details
                item-title="name"
                item-value="id"
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="searchCode"
                label="Mã danh mục"
                variant="outlined"
                hide-details
                clearable
                @keyup.enter="refreshData"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Categories Table -->
      <v-card>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="categories"
            :loading="loading"
            :search="search"
            :items-per-page="10"
            class="elevation-0"
            :loading-text="'Đang tải dữ liệu...'"
            :no-data-text="'Không có dữ liệu'"
            :no-results-text="'Không tìm thấy kết quả'"
            :footer-props="{
              'items-per-page-text': 'Số dòng mỗi trang',
              'items-per-page-options': [10, 20, 50, 100]
            }"
          >
            <!-- Custom slots for table columns -->
            <template v-slot:item.image="{ item }">
              <v-avatar size="40">
                <v-img
                  :src="item.image || 'https://via.placeholder.com/40'"
                  :alt="item.name"
                  cover
                ></v-img>
              </v-avatar>
            </template>

            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  v-if="item.children && item.children.length"
                  :class="{'rotate-icon': item.expanded}"
                  @click="toggleExpand(item)"
                  class="mr-2"
                >
                  mdi-chevron-right
                </v-icon>
                <span>{{ item.name }}</span>
              </div>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                :text="getStatusText(item.status)"
                size="small"
                label
              ></v-chip>
            </template>

            <template v-slot:item.productCount="{ item }">
              <v-chip
                color="info"
                size="small"
                label
              >
                {{ item.productCount }} sản phẩm
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-tooltip text="Chỉnh sửa" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    color="primary"
                    size="small"
                    v-bind="props"
                    @click="editCategory(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Sao chép" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-content-copy"
                    variant="text"
                    color="info"
                    size="small"
                    v-bind="props"
                    @click="duplicateCategory(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Xem sản phẩm" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-format-list-bulleted"
                    variant="text"
                    color="success"
                    size="small"
                    v-bind="props"
                    @click="viewProducts(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Xóa" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    v-bind="props"
                    @click="confirmDelete(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- Tree View Dialog -->
      <v-dialog v-model="treeDialog" max-width="800">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Sắp xếp danh mục</span>
            <v-btn icon="mdi-close" variant="text" @click="closeTreeDialog"></v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <v-treeview
              v-model="selectedTree"
              :items="categoryTree"
              item-key="id"
              open-on-click
              draggable
              @update:modelValue="handleTreeUpdate"
            >
              <template v-slot:prepend="{ item }">
                <v-icon>{{ item.children ? 'mdi-folder' : 'mdi-tag' }}</v-icon>
              </template>
              <template v-slot:label="{ item }">
                <div class="d-flex align-center">
                  <span>{{ item.name }}</span>
                  <v-chip
                    v-if="item.productCount"
                    size="x-small"
                    class="ml-2"
                  >
                    {{ item.productCount }}
                  </v-chip>
                </div>
              </template>
            </v-treeview>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="closeTreeDialog">Hủy</v-btn>
            <v-btn 
              color="primary" 
              @click="saveTreeOrder"
              :loading="savingTree"
            >
              Lưu thứ tự
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog thêm/sửa danh mục -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}</span>
            <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <v-form ref="form" v-model="formValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.name"
                    label="Tên danh mục"
                    variant="outlined"
                    :rules="[v => !!v || 'Vui lòng nhập tên danh mục']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.code"
                    label="Mã danh mục"
                    variant="outlined"
                    :rules="[v => !!v || 'Vui lòng nhập mã danh mục']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="editedItem.parentId"
                    :items="parentCategories"
                    label="Danh mục cha"
                    variant="outlined"
                    item-title="name"
                    item-value="id"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="editedItem.imageFile"
                    label="Hình ảnh"
                    variant="outlined"
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    :show-size="true"
                  ></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.description"
                    label="Mô tả"
                    variant="outlined"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="closeDialog">Hủy</v-btn>
            <v-btn 
              color="primary" 
              @click="saveCategory" 
              :loading="saving"
              :disabled="!formValid"
            >
              Lưu
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xem sản phẩm trong danh mục -->
      <v-dialog v-model="productsDialog" max-width="800">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Sản phẩm trong danh mục</span>
            <v-btn icon="mdi-close" variant="text" @click="productsDialog = false"></v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <v-data-table
              :headers="productHeaders"
              :items="categoryProducts"
              :loading="loadingProducts"
              :items-per-page="5"
              class="elevation-0"
            >
              <template v-slot:item.image="{ item }">
                <v-img
                  :src="item.image || 'https://via.placeholder.com/40'"
                  width="40"
                  height="40"
                  class="rounded"
                ></v-img>
              </template>

              <template v-slot:item.price="{ item }">
                {{ formatPrice(item.price) }}
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getProductStatusColor(item.status)"
                  size="small"
                >
                  {{ getProductStatusText(item.status) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Dialog xác nhận xóa -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">
            Xác nhận xóa
          </v-card-title>
          <v-card-text>
            Bạn có chắc chắn muốn xóa danh mục này không?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false">
              Hủy
            </v-btn>
            <v-btn color="error" variant="text" @click="deleteCategory" :loading="deleting">
              Xóa
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog nhập danh mục từ Excel -->
      <v-dialog v-model="importDialog" max-width="500">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Nhập danh mục từ Excel</span>
            <v-btn icon="mdi-close" variant="text" @click="closeImportDialog"></v-btn>
          </v-card-title>
          <v-card-text class="pt-4">
            <v-file-input
              v-model="importFile"
              label="Chọn file Excel"
              variant="outlined"
              accept=".xlsx,.xls"
              prepend-icon="mdi-microsoft-excel"
              :show-size="true"
              :rules="[v => !!v || 'Vui lòng chọn file Excel']"
            ></v-file-input>
            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
            >
              Tải xuống <a href="#" @click.prevent="downloadTemplate">mẫu Excel</a> để nhập danh mục
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="closeImportDialog">Hủy</v-btn>
            <v-btn 
              color="primary" 
              @click="importCategories"
              :loading="importing"
              :disabled="!importFile"
            >
              Nhập
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar thông báo -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="snackbar.show = false">
            Đóng
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import categoryService from '@/api/services/categoryService';

const router = useRouter();

// Data
const search = ref('');
const searchCode = ref('');
const selectedStatus = ref(null);
const selectedParent = ref(null);
const categories = ref([]);
const totalCategories = ref(0);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const loadingProducts = ref(false);

// Dialog states
const editDialog = ref(false);
const deleteDialog = ref(false);
const productsDialog = ref(false);
const treeDialog = ref(false);
const importDialog = ref(false);

// Form
const form = ref(null);
const formValid = ref(true);
const editedItem = ref({
  id: null,
  name: '',
  code: '',
  parentId: null,
  description: '',
  imageFile: null,
  status: 'active'
});

// Table data
const headers = [
  { title: 'Hình ảnh', key: 'image', sortable: false },
  { title: 'Tên danh mục', key: 'name' },
  { title: 'Mã', key: 'code' },
  { title: 'Danh mục cha', key: 'parentName' },
  { title: 'Số sản phẩm', key: 'productCount' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Thao tác', key: 'actions', sortable: false }
];

const productHeaders = [
  { title: 'Hình ảnh', key: 'image', sortable: false },
  { title: 'Tên sản phẩm', key: 'name' },
  { title: 'Mã', key: 'code' },
  { title: 'Giá', key: 'price' },
  { title: 'Tồn kho', key: 'stock' },
  { title: 'Trạng thái', key: 'status' }
];

// Options
const statuses = ['Hoạt động', 'Ẩn'];
const parentCategories = ref([]);
const categoryProducts = ref([]);
const selectedItem = ref(null);

// Tree view data
const selectedTree = ref([]);
const savingTree = ref(false);

// New data properties
const importFile = ref(null);
const importing = ref(false);

// Computed
const activeCategories = computed(() => {
  return categories.value.filter(c => c.status === 'active').length;
});

const parentCategoriesCount = computed(() => {
  return categories.value.filter(c => !c.parentId).length;
});

const totalProducts = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
});

const categoryTree = computed(() => {
  return buildCategoryTree(categories.value);
});

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Methods
const refreshData = async () => {
  loading.value = true;
  try {
    const response = await categoryService.getAllCategories();
    categories.value = response.data;
    totalCategories.value = categories.value.length;
  } catch (error) {
    console.error('Error loading categories:', error);
    showSnackbar('Không thể tải danh sách danh mục', 'error');
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  editedItem.value = {
    id: null,
    name: '',
    code: '',
    parentId: null,
    description: '',
    imageFile: null,
    status: 'active'
  };
  editDialog.value = true;
};

const editCategory = (item) => {
  editedItem.value = { ...item };
  editDialog.value = true;
};

const closeDialog = () => {
  editDialog.value = false;
  editedItem.value = {
    id: null,
    name: '',
    code: '',
    parentId: null,
    description: '',
    imageFile: null,
    status: 'active'
  };
  if (form.value) {
    form.value.reset();
  }
};

const saveCategory = async () => {
  if (!formValid.value) return;
  
  saving.value = true;
  try {
    if (editedItem.value.id) {
      await categoryService.updateCategory(editedItem.value.id, editedItem.value);
      showSnackbar('Cập nhật danh mục thành công');
    } else {
      await categoryService.createCategory(editedItem.value);
      showSnackbar('Thêm danh mục thành công');
    }
    closeDialog();
    refreshData();
  } catch (error) {
    console.error('Error saving category:', error);
    showSnackbar('Không thể lưu danh mục', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  selectedItem.value = item;
  deleteDialog.value = true;
};

const deleteCategory = async () => {
  if (!selectedItem.value) return;
  
  deleting.value = true;
  try {
    await categoryService.deleteCategory(selectedItem.value.id);
    showSnackbar('Xóa danh mục thành công');
    deleteDialog.value = false;
    refreshData();
  } catch (error) {
    console.error('Error deleting category:', error);
    showSnackbar('Không thể xóa danh mục', 'error');
  } finally {
    deleting.value = false;
  }
};

const viewProducts = async (item) => {
  selectedItem.value = item;
  loadingProducts.value = true;
  try {
    const response = await categoryService.getProductsByCategory(item.id);
    categoryProducts.value = response.data;
    productsDialog.value = true;
  } catch (error) {
    console.error('Error loading products:', error);
    showSnackbar('Không thể tải danh sách sản phẩm', 'error');
  } finally {
    loadingProducts.value = false;
  }
};

const openTreeView = () => {
  treeDialog.value = true;
};

const closeTreeDialog = () => {
  treeDialog.value = false;
  selectedTree.value = [];
};

const handleTreeUpdate = (items) => {
  selectedTree.value = items;
};

const saveTreeOrder = async () => {
  savingTree.value = true;
  try {
    await categoryService.updateCategoryOrder(selectedTree.value);
    showSnackbar('Cập nhật thứ tự thành công');
    closeTreeDialog();
    refreshData();
  } catch (error) {
    console.error('Error saving tree order:', error);
    showSnackbar('Không thể cập nhật thứ tự', 'error');
  } finally {
    savingTree.value = false;
  }
};

const buildCategoryTree = (categories) => {
  const map = {};
  const roots = [];

  categories.forEach(category => {
    map[category.id] = { ...category, children: [] };
  });

  categories.forEach(category => {
    if (category.parentId) {
      map[category.parentId]?.children.push(map[category.id]);
    } else {
      roots.push(map[category.id]);
    }
  });

  return roots;
};

const getStatusColor = (status) => {
  return status === 'active' ? 'success' : 'grey';
};

const getStatusText = (status) => {
  return status === 'active' ? 'Hoạt động' : 'Ẩn';
};

const getProductStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'outOfStock': return 'error';
    case 'hidden': return 'grey';
    default: return 'info';
  }
};

const getProductStatusText = (status) => {
  switch (status) {
    case 'active': return 'Đang bán';
    case 'outOfStock': return 'Hết hàng';
    case 'hidden': return 'Đã ẩn';
    default: return 'Khác';
  }
};

const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  };
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const openImportDialog = () => {
  importDialog.value = true;
};

const closeImportDialog = () => {
  importDialog.value = false;
  importFile.value = null;
};

const downloadTemplate = async () => {
  try {
    const response = await categoryService.getCategoryTemplate();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'category_template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading template:', error);
    showSnackbar('Không thể tải mẫu Excel', 'error');
  }
};

const importCategories = async () => {
  if (!importFile.value) return;
  
  importing.value = true;
  try {
    await categoryService.importCategories(importFile.value);
    showSnackbar('Nhập danh mục thành công');
    closeImportDialog();
    refreshData();
  } catch (error) {
    console.error('Error importing categories:', error);
    showSnackbar('Không thể nhập danh mục', 'error');
  } finally {
    importing.value = false;
  }
};

const duplicateCategory = async (item) => {
  try {
    await categoryService.duplicateCategory(item.id);
    showSnackbar('Sao chép danh mục thành công');
    refreshData();
  } catch (error) {
    console.error('Error duplicating category:', error);
    showSnackbar('Không thể sao chép danh mục', 'error');
  }
};

const validateCategoryCode = async (code) => {
  if (!code) return true;
  try {
    const response = await categoryService.validateCategoryCode(
      code,
      editedItem.value.id
    );
    return response.isValid || 'Mã danh mục đã tồn tại';
  } catch (error) {
    console.error('Error validating category code:', error);
    return true;
  }
};

const rules = {
  name: [v => !!v || 'Vui lòng nhập tên danh mục'],
  code: [
    v => !!v || 'Vui lòng nhập mã danh mục',
    v => /^[A-Z0-9_-]+$/.test(v) || 'Mã danh mục chỉ chấp nhận chữ hoa, số và dấu gạch ngang',
    validateCategoryCode
  ]
};

const exportCategories = async (format = 'excel') => {
  try {
    const response = await categoryService.exportCategories(format);
    const contentType = format === 'excel' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      : 'application/pdf';
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `categories.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('Xuất danh mục thành công');
  } catch (error) {
    console.error('Error exporting categories:', error);
    showSnackbar('Không thể xuất danh mục', 'error');
  }
};

// Lifecycle hooks
onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.category-view {
  padding: 20px;
}

.v-data-table {
  border-radius: 12px;
  overflow: hidden;
}

.v-card {
  border-radius: 12px;
}

.v-btn {
  text-transform: none;
}

.rotate-icon {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

/* Add smooth transitions */
.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Custom scrollbar for tree view */
.v-treeview {
  max-height: 500px;
  overflow-y: auto;
}

.v-treeview::-webkit-scrollbar {
  width: 8px;
}

.v-treeview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.v-treeview::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.v-treeview::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Stats card hover effect */
.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

/* Animation for loading state */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.v-data-table--loading .v-data-table-header {
  animation: pulse 1.5s infinite;
}
</style> 