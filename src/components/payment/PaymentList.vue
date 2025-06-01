<template>
  <div class="payment-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Danh sách thanh toán</span>
        <v-btn color="primary" @click="refreshPayments">
          <v-icon left>mdi-refresh</v-icon>
          Làm mới
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="payments"
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

          <template v-slot:item.amount="{ item }">
            {{ formatCurrency(item.amount) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="viewPaymentDetails(item)">
              mdi-eye
            </v-icon>
            <v-icon small class="mr-2" @click="updatePaymentStatus(item)">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for payment details -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Chi tiết thanh toán</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedPayment">
            <v-row>
              <v-col cols="6">
                <strong>Mã thanh toán:</strong> {{ selectedPayment.id }}
              </v-col>
              <v-col cols="6">
                <strong>Trạng thái:</strong>
                <v-chip
                  :color="getStatusColor(selectedPayment.status)"
                  small
                  class="ml-2"
                >
                  {{ selectedPayment.status }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <strong>Đơn hàng:</strong> {{ selectedPayment.orderId }}
              </v-col>
              <v-col cols="6">
                <strong>Số tiền:</strong> {{ formatCurrency(selectedPayment.amount) }}
              </v-col>
              <v-col cols="6">
                <strong>Phương thức:</strong> {{ selectedPayment.paymentMethod }}
              </v-col>
              <v-col cols="6">
                <strong>Ngày tạo:</strong> {{ formatDate(selectedPayment.createdAt) }}
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h3 class="mb-3">Thông tin giao dịch</h3>
            <v-row>
              <v-col cols="12">
                <strong>Mã giao dịch:</strong> {{ selectedPayment.transactionId }}
              </v-col>
              <v-col cols="12">
                <strong>Ghi chú:</strong> {{ selectedPayment.notes || 'Không có' }}
              </v-col>
            </v-row>
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

    <!-- Dialog for updating payment status -->
    <v-dialog v-model="statusDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cập nhật trạng thái thanh toán</span>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { paymentService } from '@/api/services/paymentService';

export default {
  name: 'PaymentList',
  setup() {
    const loading = ref(false);
    const payments = ref([]);
    const detailsDialog = ref(false);
    const statusDialog = ref(false);
    const selectedPayment = ref(null);
    const selectedStatus = ref('');

    const headers = [
      { text: 'Mã thanh toán', value: 'id' },
      { text: 'Đơn hàng', value: 'orderId' },
      { text: 'Số tiền', value: 'amount' },
      { text: 'Phương thức', value: 'paymentMethod' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Ngày tạo', value: 'createdAt' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const statusOptions = [
      'PENDING',
      'COMPLETED',
      'FAILED',
      'REFUNDED',
      'CANCELLED'
    ];

    const getStatusColor = (status) => {
      const colors = {
        PENDING: 'warning',
        COMPLETED: 'success',
        FAILED: 'error',
        REFUNDED: 'info',
        CANCELLED: 'grey'
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

    const fetchPayments = async () => {
      loading.value = true;
      try {
        const response = await paymentService.getAllPayments();
        payments.value = response;
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        loading.value = false;
      }
    };

    const viewPaymentDetails = (payment) => {
      selectedPayment.value = payment;
      detailsDialog.value = true;
    };

    const updatePaymentStatus = (payment) => {
      selectedPayment.value = payment;
      selectedStatus.value = payment.status;
      statusDialog.value = true;
    };

    const saveStatus = async () => {
      try {
        await paymentService.updatePaymentStatus(selectedPayment.value.id, selectedStatus.value);
        const index = payments.value.findIndex(p => p.id === selectedPayment.value.id);
        if (index !== -1) {
          payments.value[index].status = selectedStatus.value;
        }
        statusDialog.value = false;
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    };

    const refreshPayments = () => {
      fetchPayments();
    };

    onMounted(() => {
      fetchPayments();
    });

    return {
      loading,
      payments,
      headers,
      detailsDialog,
      statusDialog,
      selectedPayment,
      selectedStatus,
      statusOptions,
      getStatusColor,
      formatCurrency,
      formatDate,
      viewPaymentDetails,
      updatePaymentStatus,
      saveStatus,
      refreshPayments
    };
  }
};
</script>

<style scoped>
.payment-list {
  padding: 20px;
}
</style> 