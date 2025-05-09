<template>
  <div class="cart-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Danh sách giỏ hàng</span>
        <v-btn color="primary" @click="refreshCarts">
          <v-icon left>mdi-refresh</v-icon>
          Làm mới
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="carts"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.totalAmount="{ item }">
            {{ formatCurrency(item.totalAmount) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="viewCartDetails(item)">
              mdi-eye
            </v-icon>
            <v-icon small class="mr-2" @click="updateCartStatus(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteCart(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for cart details -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Chi tiết giỏ hàng</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedCart">
            <v-row>
              <v-col cols="6">
                <strong>Mã giỏ hàng:</strong> {{ selectedCart.id }}
              </v-col>
              <v-col cols="6">
                <strong>Trạng thái:</strong>
                <v-chip
                  :color="getStatusColor(selectedCart.status)"
                  small
                  class="ml-2"
                >
                  {{ selectedCart.status }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <strong>Khách hàng:</strong> {{ selectedCart.customerName }}
              </v-col>
              <v-col cols="6">
                <strong>Tổng tiền:</strong> {{ formatCurrency(selectedCart.totalAmount) }}
              </v-col>
              <v-col cols="6">
                <strong>Ngày tạo:</strong> {{ formatDate(selectedCart.createdAt) }}
              </v-col>
              <v-col cols="6">
                <strong>Cập nhật lần cuối:</strong> {{ formatDate(selectedCart.updatedAt) }}
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h3 class="mb-3">Sản phẩm trong giỏ hàng</h3>
            <v-data-table
              :headers="productHeaders"
              :items="selectedCart.items"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.price="{ item }">
                {{ formatCurrency(item.price) }}
              </template>
              <template v-slot:item.total="{ item }">
                {{ formatCurrency(item.price * item.quantity) }}
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

    <!-- Dialog for updating cart status -->
    <v-dialog v-model="statusDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cập nhật trạng thái giỏ hàng</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Trạng thái"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="statusDialog = false">
            Hủy
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveStatus">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for delete confirmation -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Bạn có chắc chắn muốn xóa giỏ hàng này?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="blue darken-1" text @click="deleteCartConfirm">Xóa</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { cartService } from '@/api/services/cartService';

export default {
  name: 'CartList',
  setup() {
    const loading = ref(false);
    const carts = ref([]);
    const detailsDialog = ref(false);
    const statusDialog = ref(false);
    const deleteDialog = ref(false);
    const selectedCart = ref(null);
    const selectedStatus = ref('');

    const headers = [
      { text: 'Mã giỏ hàng', value: 'id' },
      { text: 'Khách hàng', value: 'customerName' },
      { text: 'Số sản phẩm', value: 'itemCount' },
      { text: 'Tổng tiền', value: 'totalAmount' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Ngày tạo', value: 'createdAt' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const productHeaders = [
      { text: 'Sản phẩm', value: 'name' },
      { text: 'Đơn giá', value: 'price' },
      { text: 'Số lượng', value: 'quantity' },
      { text: 'Thành tiền', value: 'total' }
    ];

    const statusOptions = [
      'ACTIVE',
      'ABANDONED',
      'CONVERTED',
      'EXPIRED'
    ];

    const getStatusColor = (status) => {
      const colors = {
        ACTIVE: 'success',
        ABANDONED: 'error',
        CONVERTED: 'info',
        EXPIRED: 'grey'
      };
      return colors[status] || 'grey';
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    const fetchCarts = async () => {
      loading.value = true;
      try {
        const response = await cartService.getAllCarts();
        carts.value = response;
      } catch (error) {
        console.error('Error fetching carts:', error);
      } finally {
        loading.value = false;
      }
    };

    const viewCartDetails = (cart) => {
      selectedCart.value = cart;
      detailsDialog.value = true;
    };

    const updateCartStatus = (cart) => {
      selectedCart.value = cart;
      selectedStatus.value = cart.status;
      statusDialog.value = true;
    };

    const saveStatus = async () => {
      try {
        await cartService.updateCartStatus(selectedCart.value.id, selectedStatus.value);
        const index = carts.value.findIndex(c => c.id === selectedCart.value.id);
        if (index !== -1) {
          carts.value[index].status = selectedStatus.value;
        }
        statusDialog.value = false;
      } catch (error) {
        console.error('Error updating cart status:', error);
      }
    };

    const deleteCart = (cart) => {
      selectedCart.value = cart;
      deleteDialog.value = true;
    };

    const deleteCartConfirm = async () => {
      try {
        await cartService.deleteCart(selectedCart.value.id);
        const index = carts.value.findIndex(c => c.id === selectedCart.value.id);
        if (index !== -1) {
          carts.value.splice(index, 1);
        }
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting cart:', error);
      }
    };

    const refreshCarts = () => {
      fetchCarts();
    };

    onMounted(() => {
      fetchCarts();
    });

    return {
      loading,
      carts,
      headers,
      productHeaders,
      detailsDialog,
      statusDialog,
      deleteDialog,
      selectedCart,
      selectedStatus,
      statusOptions,
      getStatusColor,
      formatCurrency,
      formatDate,
      viewCartDetails,
      updateCartStatus,
      saveStatus,
      deleteCart,
      deleteCartConfirm,
      refreshCarts
    };
  }
};
</script>

<style scoped>
.cart-list {
  padding: 20px;
}
</style> 