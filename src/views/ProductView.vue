<template>
  <div class="product-view">
    <v-container fluid>
      <!-- Tiêu đề và nút thêm sản phẩm -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Quản lý sản phẩm</h1>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            Thêm sản phẩm
          </v-btn>
        </v-col>
      </v-row>

      <!-- Bộ lọc và tìm kiếm -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field v-model="filters.search" label="Tìm kiếm" prepend-icon="mdi-magnify" clearable
            @input="handleSearch" placeholder="Tên sản phẩm, mã sản phẩm..."></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filters.category" :items="categories" item-text="name" item-value="id" label="Danh mục"
            clearable @change="handleFilter"></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filters.status" :items="statusOptions" label="Trạng thái" clearable
            @change="handleFilter"></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filters.stockStatus" :items="stockStatusOptions" label="Tình trạng kho" clearable
            @change="handleFilter"></v-select>
        </v-col>
      </v-row>

      <!-- Bảng danh sách sản phẩm -->
      <v-card>
        <v-data-table :headers="headers" :items="products" :loading="loading" :options.sync="tableOptions"
          :server-items-length="totalProducts" :footer-props="{
            'items-per-page-options': [10, 20, 50, 100],
            'items-per-page-text': 'Số sản phẩm mỗi trang'
          }" class="elevation-1">
          <!-- Cột hình ảnh -->
          <template v-slot:item.image="{ item }">
            <v-avatar size="40">
              <v-img :src="item.image || 'https://via.placeholder.com/40'" :alt="item.name" cover></v-img>
            </v-avatar>
          </template>

          <!-- Cột giá -->
          <template v-slot:item.price="{ item }">
            {{ formatCurrency(item.price) }}
          </template>

          <!-- Cột giảm giá -->
          <template v-slot:item.discount="{ item }">
            <v-chip v-if="item.discount > 0" color="error" small label>
              -{{ item.discount }}%
            </v-chip>
            <span v-else>-</span>
          </template>

          <!-- Cột tồn kho -->
          <template v-slot:item.stock="{ item }">
            <v-chip :color="getStockColor(item.stock)" small label>
              {{ item.stock }}
            </v-chip>
          </template>

          <!-- Cột trạng thái -->
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" small label>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- Cột thao tác -->
          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on" @click="viewProductDetails(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>Xem chi tiết</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on" @click="editProduct(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Sửa</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on" @click="openStockDialog(item)">
                  <v-icon>mdi-package-variant</v-icon>
                </v-btn>
              </template>
              <span>Quản lý kho</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" v-on="on" @click="deleteProduct(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Xóa</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card>

      <!-- Dialog thêm/sửa sản phẩm -->
      <v-dialog v-model="productDialog" max-width="800px">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ editedIndex === -1 ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm' }}</span>
            <v-btn icon @click="closeProductDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="productForm" v-model="productFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.name" label="Tên sản phẩm"
                    :rules="[v => !!v || 'Tên sản phẩm là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.sku" label="Mã sản phẩm"
                    :rules="[v => !!v || 'Mã sản phẩm là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="editedItem.categoryId" :items="categories" item-text="name" item-value="id"
                    label="Danh mục" :rules="[v => !!v || 'Danh mục là bắt buộc']" required></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model.number="editedItem.price" label="Giá" type="number" prefix="₫" :rules="[
                    v => !!v || 'Giá là bắt buộc',
                    v => v > 0 || 'Giá phải lớn hơn 0'
                  ]" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model.number="editedItem.discount" label="Giảm giá (%)" type="number" suffix="%"
                    :rules="[
                      v => v >= 0 || 'Giảm giá không được âm',
                      v => v <= 100 || 'Giảm giá không được vượt quá 100%'
                    ]"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model.number="editedItem.stock" label="Số lượng tồn kho" type="number" :rules="[
                    v => !!v || 'Số lượng tồn kho là bắt buộc',
                    v => v >= 0 || 'Số lượng tồn kho không được âm'
                  ]" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="editedItem.description" label="Mô tả" rows="3"></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-file-input v-model="editedItem.imageFile" label="Hình ảnh sản phẩm" accept="image/*"
                    prepend-icon="mdi-camera" :rules="[
                      v => !v || v.size < 2000000 || 'Kích thước hình ảnh không được vượt quá 2MB'
                    ]" @change="handleImageChange"></v-file-input>
                  <v-img v-if="imagePreview" :src="imagePreview" height="200" contain class="mt-2"></v-img>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="editedItem.status" :items="statusOptions" label="Trạng thái"
                    :rules="[v => !!v || 'Trạng thái là bắt buộc']" required></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch v-model="editedItem.featured" label="Sản phẩm nổi bật" color="primary"></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeProductDialog">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="saveProduct" :loading="saving">
              Lưu
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog quản lý kho -->
      <v-dialog v-model="stockDialog" max-width="500px">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Quản lý kho - {{ selectedProduct?.name }}</span>
            <v-btn icon @click="closeStockDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="stockForm" v-model="stockFormValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model.number="stockData.quantity" label="Số lượng" type="number" :rules="[
                    v => !!v || 'Số lượng là bắt buộc',
                    v => v !== 0 || 'Số lượng không được bằng 0'
                  ]" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="stockData.type" :items="stockActionOptions" label="Loại thao tác"
                    :rules="[v => !!v || 'Loại thao tác là bắt buộc']" required></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="stockData.note" label="Ghi chú" rows="3"></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeStockDialog">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="updateStock" :loading="updatingStock">
              Cập nhật
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xem chi tiết sản phẩm -->
      <v-dialog v-model="detailsDialog" max-width="800px">
        <v-card v-if="selectedProduct">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Chi tiết sản phẩm</span>
            <v-btn icon @click="detailsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-img :src="selectedProduct.image || 'https://via.placeholder.com/40'" :alt="selectedProduct.name"
                  height="200" contain class="rounded"></v-img>
              </v-col>
              <v-col cols="12" md="8">
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Tên sản phẩm</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedProduct.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Mã sản phẩm</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedProduct.sku }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Danh mục</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ getCategoryName(selectedProduct.categoryId) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Giá</v-list-item-title>
                      <v-list-item-subtitle>{{ formatCurrency(selectedProduct.price) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item v-if="selectedProduct.discount > 0">
                    <v-list-item-content>
                      <v-list-item-title>Giảm giá</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedProduct.discount }}%</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Số lượng tồn kho</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedProduct.stock }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Trạng thái</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="getStatusColor(selectedProduct.status)" small label>
                          {{ getStatusText(selectedProduct.status) }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12">
                <v-divider class="my-2"></v-divider>
                <h3 class="text-h6 mb-2">Mô tả</h3>
                <p>{{ selectedProduct.description || 'Không có mô tả' }}</p>
              </v-col>
            </v-row>

            <!-- Lịch sử tồn kho -->
            <v-divider class="my-4"></v-divider>
            <h3 class="text-h6 mb-3">Lịch sử tồn kho</h3>
            <v-timeline dense>
              <v-timeline-item v-for="(history, index) in selectedProduct.stockHistory" :key="index"
                :color="getStockHistoryColor(history.type)" small>
                <div class="d-flex justify-space-between">
                  <div>
                    <strong>{{ history.type === 'add' ? 'Nhập kho' : 'Xuất kho' }}</strong>
                    <div class="text-caption">
                      Số lượng: {{ history.quantity }}
                      <span v-if="history.note"> - {{ history.note }}</span>
                    </div>
                  </div>
                  <div class="text-caption">{{ formatDate(history.createdAt) }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="editProduct(selectedProduct)">
              Chỉnh sửa
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xác nhận xóa -->
      <v-dialog v-model="deleteDialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">Xác nhận xóa sản phẩm</v-card-title>
          <v-card-text>
            Bạn có chắc chắn muốn xóa sản phẩm "{{ selectedProduct?.name }}"?
            Hành động này không thể hoàn tác.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="deleteDialog = false">
              Hủy
            </v-btn>
            <v-btn color="error" @click="confirmDelete" :loading="deleting">
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
import { ref, reactive, onMounted, watch } from 'vue';
import { productService } from '@/api/services/productService';
import { categoryService } from '@/api/services/categoryService';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default {
  name: 'ProductView',
  setup() {
    // Bảng sản phẩm
    const headers = [
      { text: 'Hình ảnh', value: 'image', sortable: false },
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Mã sản phẩm', value: 'sku' },
      { text: 'Giá', value: 'price' },
      { text: 'Giảm giá', value: 'discount' },
      { text: 'Tồn kho', value: 'stock' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    // Dữ liệu
    const products = ref([]);
    const categories = ref([]);
    const selectedProduct = ref(null);
    const totalProducts = ref(0);
    const loading = ref(false);
    const saving = ref(false);
    const deleting = ref(false);
    const updatingStock = ref(false);

    // Dialog
    const productDialog = ref(false);
    const stockDialog = ref(false);
    const detailsDialog = ref(false);
    const deleteDialog = ref(false);
    const editedIndex = ref(-1);

    // Form
    const productForm = ref(null);
    const productFormValid = ref(false);
    const stockForm = ref(null);
    const stockFormValid = ref(false);

    // Bộ lọc
    const filters = reactive({
      search: '',
      category: null,
      status: null,
      stockStatus: null
    });

    // Tùy chọn bảng
    const tableOptions = ref({
      page: 1,
      itemsPerPage: 10,
      sortBy: ['createdAt'],
      sortDesc: [true]
    });

    // Tùy chọn lọc
    const statusOptions = [
      { text: 'Đang bán', value: 'active' },
      { text: 'Ngừng bán', value: 'inactive' },
      { text: 'Hết hàng', value: 'outOfStock' }
    ];

    const stockStatusOptions = [
      { text: 'Còn hàng', value: 'inStock' },
      { text: 'Sắp hết', value: 'lowStock' },
      { text: 'Hết hàng', value: 'outOfStock' }
    ];

    const stockActionOptions = [
      { text: 'Nhập kho', value: 'add' },
      { text: 'Xuất kho', value: 'minus' }
    ];

    // Dữ liệu sản phẩm đang chỉnh sửa
    const editedItem = reactive({
      name: '',
      sku: '',
      categoryId: null,
      price: 0,
      discount: 0,
      stock: 0,
      description: '',
      imageFile: null,
      status: 'active',
      featured: false
    });

    // Dữ liệu quản lý kho
    const stockData = reactive({
      quantity: 0,
      type: 'add',
      note: ''
    });

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Hàm lấy danh sách sản phẩm
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const params = {
          page: tableOptions.value.page,
          limit: tableOptions.value.itemsPerPage,
          sortBy: tableOptions.value.sortBy[0],
          sortDesc: tableOptions.value.sortDesc[0],
          search: filters.search,
          category: filters.category,
          status: filters.status,
          stockStatus: filters.stockStatus
        };

        const request = {
          page: tableOptions.value.page,
          size: tableOptions.value.itemsPerPage,
        };

        const response = await productService.getAllProducts(request);
        products.value = response.data.content;
        console.log("all_product: ", response);
      } catch (error) {
        console.error('Error fetching products:', error);
        showSnackbar('Không thể tải danh sách sản phẩm', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Hàm lấy danh sách danh mục
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        categories.value = response;
      } catch (error) {
        console.error('Error fetching categories:', error);
        showSnackbar('Không thể tải danh sách danh mục', 'error');
      }
    };

    // Hàm lấy tên danh mục
    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId);
      return category ? category.name : 'Không xác định';
    };

    // Hàm mở dialog thêm sản phẩm
    const openCreateDialog = () => {
      editedIndex.value = -1;
      Object.assign(editedItem, {
        name: '',
        sku: '',
        categoryId: null,
        price: 0,
        discount: 0,
        stock: 0,
        description: '',
        imageFile: null,
        status: 'active',
        featured: false
      });
      productDialog.value = true;
    };

    // Hàm mở dialog sửa sản phẩm
    const editProduct = (item) => {
      editedIndex.value = products.value.indexOf(item);
      Object.assign(editedItem, {
        id: item.id,
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        price: item.price,
        discount: item.discount,
        stock: item.stock,
        description: item.description,
        imageFile: null,
        status: item.status,
        featured: item.featured
      });
      productDialog.value = true;
    };

    // Hàm đóng dialog sản phẩm
    const closeProductDialog = () => {
      productDialog.value = false;
      editedIndex.value = -1;
      imagePreview.value = null;
      if (productForm.value) {
        productForm.value.reset();
      }
    };

    // Hàm lưu sản phẩm
    const saveProduct = async () => {
      if (!productForm.value.validate()) return;

      saving.value = true;
      try {
        const formData = new FormData();
        Object.keys(editedItem).forEach(key => {
          if (key === 'imageFile' && editedItem[key]) {
            formData.append('image', editedItem[key]);
          } else if (editedItem[key] !== null && editedItem[key] !== undefined) {
            formData.append(key, editedItem[key]);
          }
        });

        let response;
        if (editedIndex.value > -1) {
          response = await productService.updateProduct(editedItem.id, formData);
          // Cập nhật lại ảnh trong danh sách sản phẩm
          if (response.image) {
            products.value[editedIndex.value].image = response.image;
          }
          showSnackbar('Cập nhật sản phẩm thành công', 'success');
        } else {
          response = await productService.createProduct(formData);
          if (response.image) {
            response.image = response.image; // Đảm bảo có đường dẫn ảnh
          }
          products.value.push(response);
          showSnackbar('Thêm sản phẩm thành công', 'success');
        }
        closeProductDialog();
      } catch (error) {
        console.error('Error saving product:', error);
        showSnackbar('Không thể lưu sản phẩm', 'error');
      } finally {
        saving.value = false;
        // Xóa preview ảnh
        imagePreview.value = null;
      }
    };

    // Hàm xem chi tiết sản phẩm
    const viewProductDetails = async (product) => {
      try {
        const response = await productService.getProductDetails(product.id);
        selectedProduct.value = response;
        detailsDialog.value = true;
      } catch (error) {
        console.error('Error fetching product details:', error);
        showSnackbar('Không thể tải thông tin sản phẩm', 'error');
      }
    };

    // Hàm mở dialog quản lý kho
    const openStockDialog = (product) => {
      selectedProduct.value = product;
      Object.assign(stockData, {
        quantity: 0,
        type: 'add',
        note: ''
      });
      stockDialog.value = true;
    };

    // Hàm đóng dialog quản lý kho
    const closeStockDialog = () => {
      stockDialog.value = false;
      selectedProduct.value = null;
      if (stockForm.value) {
        stockForm.value.reset();
      }
    };

    // Hàm cập nhật tồn kho
    const updateStock = async () => {
      if (!stockForm.value.validate()) return;

      updatingStock.value = true;
      try {
        await productService.updateStock(selectedProduct.value.id, stockData);

        // Cập nhật số lượng tồn kho trong danh sách
        const index = products.value.findIndex(p => p.id === selectedProduct.value.id);
        if (index !== -1) {
          products.value[index].stock += stockData.type === 'add' ? stockData.quantity : -stockData.quantity;
        }

        showSnackbar('Cập nhật tồn kho thành công', 'success');
        closeStockDialog();
      } catch (error) {
        console.error('Error updating stock:', error);
        showSnackbar('Không thể cập nhật tồn kho', 'error');
      } finally {
        updatingStock.value = false;
      }
    };

    // Hàm xóa sản phẩm
    const deleteProduct = (product) => {
      selectedProduct.value = product;
      deleteDialog.value = true;
    };

    // Hàm xác nhận xóa sản phẩm
    const confirmDelete = async () => {
      deleting.value = true;
      try {
        await productService.deleteProduct(selectedProduct.value.id);
        const index = products.value.indexOf(selectedProduct.value);
        products.value.splice(index, 1);
        showSnackbar('Xóa sản phẩm thành công', 'success');
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting product:', error);
        showSnackbar('Không thể xóa sản phẩm', 'error');
      } finally {
        deleting.value = false;
      }
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
      tableOptions.value.page = 1;
      fetchProducts();
    };

    // Hàm xử lý lọc
    const handleFilter = () => {
      tableOptions.value.page = 1;
      fetchProducts();
    };

    // Hàm lấy màu trạng thái
    const getStatusColor = (status) => {
      switch (status) {
        case 'active':
          return 'success';
        case 'inactive':
          return 'grey';
        case 'outOfStock':
          return 'error';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text trạng thái
    const getStatusText = (status) => {
      switch (status) {
        case 'active':
          return 'Đang bán';
        case 'inactive':
          return 'Ngừng bán';
        case 'outOfStock':
          return 'Hết hàng';
        default:
          return 'Không xác định';
      }
    };

    // Hàm lấy màu tồn kho
    const getStockColor = (stock) => {
      if (stock <= 0) return 'error';
      if (stock <= 10) return 'warning';
      return 'success';
    };

    // Hàm lấy màu lịch sử tồn kho
    const getStockHistoryColor = (type) => {
      return type === 'add' ? 'success' : 'error';
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
      fetchProducts();
    }, { deep: true });

    // Trong phần script, thêm vào setup()
    const imagePreview = ref(null);

    const handleImageChange = (file) => {
      if (file) {
        // Tạo URL preview cho ảnh
        imagePreview.value = URL.createObjectURL(file);
      } else {
        imagePreview.value = null;
      }
    };

    onMounted(() => {
      fetchProducts();
      fetchCategories();
    });

    return {
      headers,
      products,
      categories,
      selectedProduct,
      totalProducts,
      loading,
      saving,
      deleting,
      updatingStock,
      productDialog,
      stockDialog,
      detailsDialog,
      deleteDialog,
      editedIndex,
      productForm,
      productFormValid,
      stockForm,
      stockFormValid,
      filters,
      tableOptions,
      statusOptions,
      stockStatusOptions,
      stockActionOptions,
      editedItem,
      stockData,
      snackbar,
      openCreateDialog,
      editProduct,
      closeProductDialog,
      saveProduct,
      viewProductDetails,
      openStockDialog,
      closeStockDialog,
      updateStock,
      deleteProduct,
      confirmDelete,
      handleSearch,
      handleFilter,
      getCategoryName,
      getStatusColor,
      getStatusText,
      getStockColor,
      getStockHistoryColor,
      formatDate,
      formatCurrency,
      imagePreview,
      handleImageChange
    };
  }
};
</script>

<style scoped>
.product-view {
  padding: 20px;
}
</style>