<template>
    <div class="order-list">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Quản lý đơn hàng</span>
          <v-btn color="primary" @click="refreshOrders">
            <v-icon left>mdi-refresh</v-icon>
            Làm mới
          </v-btn>
        </v-card-title>
  
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="orders"
            :loading="loading"
            :search="search"
            class="elevation-1"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Tìm kiếm"
                  single-line
                  hide-details
                  class="mx-4"
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  label="Lọc theo trạng thái"
                  class="mx-4"
                  style="max-width: 200px"
                  clearable
                ></v-select>
              </v-toolbar>
            </template>
  
            <template v-slot:item.totalAmount="{ item }">
              {{ formatCurrency(item.totalAmount) }}
            </template>
  
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                small
              >
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>
  
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
  
            <template v-slot:item.actions="{ item }">
              <v-icon small class="mr-2" @click="viewOrderDetails(item)">
                mdi-eye
              </v-icon>
              <v-icon small class="mr-2" @click="openUpdateStatusDialog(item)">
                mdi-pencil
              </v-icon>
              <v-icon small @click="printOrder(item)">
                mdi-printer
              </v-icon>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
  
      <!-- Dialog for viewing order details -->
      <v-dialog v-model="detailsDialog" max-width="800px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Chi tiết đơn hàng #{{ selectedOrder?.orderNumber }}</span>
          </v-card-title>
  
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <h3>Thông tin khách hàng</h3>
                  <p><strong>Tên:</strong> {{ selectedOrder?.customerName }}</p>
                  <p><strong>Email:</strong> {{ selectedOrder?.customerEmail }}</p>
                  <p><strong>Số điện thoại:</strong> {{ selectedOrder?.customerPhone }}</p>
                  <p><strong>Địa chỉ:</strong> {{ selectedOrder?.shippingAddress }}</p>
                </v-col>
                <v-col cols="6">
                  <h3>Thông tin đơn hàng</h3>
                  <p><strong>Mã đơn hàng:</strong> {{ selectedOrder?.orderNumber }}</p>
                  <p><strong>Ngày đặt:</strong> {{ formatDate(selectedOrder?.createdAt) }}</p>
                  <p><strong>Trạng thái:</strong> {{ getStatusText(selectedOrder?.status) }}</p>
                  <p><strong>Phương thức thanh toán:</strong> {{ selectedOrder?.paymentMethod }}</p>
                </v-col>
              </v-row>
  
              <v-row>
                <v-col cols="12">
                  <h3>Danh sách sản phẩm</h3>
                  <v-data-table
                    :headers="productHeaders"
                    :items="selectedOrder?.items || []"
                    hide-default-footer
                  >
                    <template v-slot:item.price="{ item }">
                      {{ formatCurrency(item.price) }}
                    </template>
                    <template v-slot:item.total="{ item }">
                      {{ formatCurrency(item.price * item.quantity) }}
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
  
              <v-row>
                <v-col cols="12" class="text-right">
                  <h3>Tổng cộng: {{ formatCurrency(selectedOrder?.totalAmount) }}</h3>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="detailsDialog = false">
              Đóng
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Dialog for updating order status -->
      <v-dialog v-model="statusDialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Cập nhật trạng thái đơn hàng</span>
          </v-card-title>
  
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="editedStatus"
                    :items="statusOptions"
                    label="Trạng thái"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="statusNote"
                    label="Ghi chú"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="statusDialog = false">
              Hủy
            </v-btn>
            <v-btn color="primary" text @click="updateOrderStatus">
              Cập nhật
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { orderService } from '@/api/services/orderService';
  
  export default {
    name: 'OrderList',
    setup() {
      const loading = ref(false);
      const search = ref('');
      const statusFilter = ref(null);
      const detailsDialog = ref(false);
      const statusDialog = ref(false);
      const orders = ref([]);
      const selectedOrder = ref(null);
      const editedStatus = ref('');
      const statusNote = ref('');
  
      const headers = [
        { text: 'Mã đơn hàng', value: 'orderNumber' },
        { text: 'Khách hàng', value: 'customerName' },
        { text: 'Tổng tiền', value: 'totalAmount' },
        { text: 'Trạng thái', value: 'status' },
        { text: 'Ngày đặt', value: 'createdAt' },
        { text: 'Thao tác', value: 'actions', sortable: false }
      ];
  
      const productHeaders = [
        { text: 'Sản phẩm', value: 'productName' },
        { text: 'Số lượng', value: 'quantity' },
        { text: 'Đơn giá', value: 'price' },
        { text: 'Thành tiền', value: 'total' }
      ];
  
      const statusOptions = [
        { text: 'Chờ xác nhận', value: 'PENDING' },
        { text: 'Đã xác nhận', value: 'CONFIRMED' },
        { text: 'Đang giao hàng', value: 'SHIPPING' },
        { text: 'Đã giao hàng', value: 'DELIVERED' },
        { text: 'Đã hủy', value: 'CANCELLED' },
        { text: 'Hoàn trả', value: 'REFUNDED' }
      ];
  
      const getStatusColor = (status) => {
        const colors = {
          PENDING: 'warning',
          CONFIRMED: 'info',
          SHIPPING: 'primary',
          DELIVERED: 'success',
          CANCELLED: 'error',
          REFUNDED: 'grey'
        };
        return colors[status] || 'grey';
      };
  
      const getStatusText = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.text : status;
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
  
      const fetchOrders = async () => {
        loading.value = true;
        try {
          const response = await orderService.getOrders();
          orders.value = response;
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          loading.value = false;
        }
      };
  
      const viewOrderDetails = (order) => {
        selectedOrder.value = order;
        detailsDialog.value = true;
      };
  
      const openUpdateStatusDialog = (order) => {
        selectedOrder.value = order;
        editedStatus.value = order.status;
        statusNote.value = '';
        statusDialog.value = true;
      };
  
      const updateOrderStatus = async () => {
        try {
          await orderService.updateOrderStatus(selectedOrder.value.id, {
            status: editedStatus.value,
            note: statusNote.value
          });
          const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
          if (index !== -1) {
            orders.value[index].status = editedStatus.value;
          }
          statusDialog.value = false;
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      };
  
      const printOrder = (order) => {
        // Implement print functionality
        console.log('Printing order:', order);
      };
  
      const refreshOrders = () => {
        fetchOrders();
      };
  
      // Fetch orders when component is mounted
      fetchOrders();
  
      return {
        loading,
        search,
        statusFilter,
        detailsDialog,
        statusDialog,
        headers,
        productHeaders,
        orders,
        selectedOrder,
        editedStatus,
        statusNote,
        statusOptions,
        getStatusColor,
        getStatusText,
        formatDate,
        formatCurrency,
        viewOrderDetails,
        openUpdateStatusDialog,
        updateOrderStatus,
        printOrder,
        refreshOrders
      };
    }
  };
  </script>
  
  <style scoped>
  .order-list {
    padding: 20px;
  }
  </style>