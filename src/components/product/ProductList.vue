<template>
  <div class="product-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quản lý sản phẩm</span>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Thêm sản phẩm
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="products"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.price="{ item }">
            {{ formatCurrency(item.price) }}
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="viewDetails(item)">
              mdi-eye
            </v-icon>
            <v-icon small @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for creating/editing product -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedIndex === -1 ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.name"
                  label="Tên sản phẩm"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.sku"
                  label="Mã SKU"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.price"
                  label="Giá"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.stockQuantity"
                  label="Số lượng tồn kho"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="Mô tả"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.category"
                  :items="categories"
                  label="Danh mục"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="editedItem.images"
                  label="Hình ảnh sản phẩm"
                  multiple
                  accept="image/*"
                  prepend-icon="mdi-camera"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">
            Hủy
          </v-btn>
          <v-btn color="blue darken-1" text @click="save">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for viewing product details -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Chi tiết sản phẩm</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedProduct">
            <v-row>
              <v-col cols="12" sm="6">
                <h3>{{ selectedProduct.name }}</h3>
                <p>Mã SKU: {{ selectedProduct.sku }}</p>
                <p>Giá: {{ formatCurrency(selectedProduct.price) }}</p>
                <p>Số lượng tồn kho: {{ selectedProduct.stockQuantity }}</p>
                <p>Danh mục: {{ selectedProduct.category }}</p>
              </v-col>
              <v-col cols="12" sm="6">
                <v-img
                  v-if="selectedProduct.images && selectedProduct.images.length > 0"
                  :src="selectedProduct.images[0]"
                  max-height="200"
                  contain
                ></v-img>
              </v-col>
              <v-col cols="12">
                <h4>Mô tả</h4>
                <p>{{ selectedProduct.description }}</p>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h4 class="mb-3">Lịch sử giá</h4>
            <v-data-table
              :headers="priceHistoryHeaders"
              :items="priceHistory"
              :loading="priceHistoryLoading"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.price="{ item }">
                {{ formatCurrency(item.price) }}
              </template>
              <template v-slot:item.changedAt="{ item }">
                {{ formatDate(item.changedAt) }}
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="detailsDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for confirming deletion -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận xóa sản phẩm?</v-card-title>

        <v-card-text>
          Bạn có chắc chắn muốn xóa sản phẩm "{{ selectedProduct?.name }}"?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">
            Hủy
          </v-btn>
          <v-btn color="error" text @click="confirmDelete">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { productService } from '@/api/services/productService';

export default {
  name: 'ProductList',
  setup() {
    const loading = ref(false);
    const priceHistoryLoading = ref(false);
    const products = ref([]);
    const priceHistory = ref([]);
    const dialog = ref(false);
    const detailsDialog = ref(false);
    const deleteDialog = ref(false);
    const editedIndex = ref(-1);
    const selectedProduct = ref(null);

    const defaultItem = {
      name: '',
      sku: '',
      price: 0,
      stockQuantity: 0,
      description: '',
      category: '',
      images: []
    };

    const editedItem = ref({ ...defaultItem });

    const headers = [
      { text: 'Tên sản phẩm', value: 'name' },
      { text: 'Mã SKU', value: 'sku' },
      { text: 'Giá', value: 'price' },
      { text: 'Số lượng tồn kho', value: 'stockQuantity' },
      { text: 'Danh mục', value: 'category' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const priceHistoryHeaders = [
      { text: 'Giá', value: 'price' },
      { text: 'Ngày thay đổi', value: 'changedAt' },
      { text: 'Lý do', value: 'reason' }
    ];

    const categories = [
      'Điện thoại',
      'Laptop',
      'Máy tính bảng',
      'Phụ kiện',
      'Đồ gia dụng',
      'Thời trang',
      'Khác'
    ];

    const getStatusColor = (status) => {
      const colors = {
        ACTIVE: 'success',
        INACTIVE: 'grey',
        OUT_OF_STOCK: 'error'
      };
      return colors[status] || 'grey';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await productService.getAllProducts();
        products.value = response;
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        loading.value = false;
      }
    };

    const openCreateDialog = () => {
      editedItem.value = { ...defaultItem };
      editedIndex.value = -1;
      dialog.value = true;
    };

    const editItem = (item) => {
      editedIndex.value = products.value.indexOf(item);
      editedItem.value = { ...item };
      dialog.value = true;
    };

    const close = () => {
      dialog.value = false;
      editedItem.value = { ...defaultItem };
      editedIndex.value = -1;
    };

    const save = async () => {
      try {
        if (editedIndex.value > -1) {
          await productService.updateProduct(editedItem.value.id, editedItem.value);
        } else {
          await productService.createProduct(editedItem.value);
        }
        await fetchProducts();
        close();
      } catch (error) {
        console.error('Error saving product:', error);
      }
    };

    const deleteItem = (item) => {
      selectedProduct.value = item;
      deleteDialog.value = true;
    };

    const confirmDelete = async () => {
      try {
        await productService.deleteProduct(selectedProduct.value.id);
        await fetchProducts();
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    };

    const viewDetails = async (item) => {
      selectedProduct.value = item;
      priceHistoryLoading.value = true;
      try {
        const response = await productService.getProductPriceHistory(item.id);
        priceHistory.value = response;
        detailsDialog.value = true;
      } catch (error) {
        console.error('Error fetching product price history:', error);
      } finally {
        priceHistoryLoading.value = false;
      }
    };

    onMounted(() => {
      fetchProducts();
    });

    return {
      loading,
      priceHistoryLoading,
      products,
      priceHistory,
      headers,
      priceHistoryHeaders,
      dialog,
      detailsDialog,
      deleteDialog,
      editedIndex,
      editedItem,
      selectedProduct,
      categories,
      getStatusColor,
      formatDate,
      formatCurrency,
      openCreateDialog,
      editItem,
      close,
      save,
      deleteItem,
      confirmDelete,
      viewDetails
    };
  }
};
</script>

<style scoped>
.product-list {
  padding: 20px;
}
</style> 