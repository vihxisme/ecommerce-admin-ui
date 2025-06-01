<template>
  <div class="discount-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quản lý mã giảm giá</span>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Thêm mã giảm giá
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="discounts"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.discountType="{ item }">
            <v-chip
              :color="getDiscountTypeColor(item.discountType)"
              small
            >
              {{ item.discountType }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.validFrom="{ item }">
            {{ formatDate(item.validFrom) }}
          </template>

          <template v-slot:item.validTo="{ item }">
            {{ formatDate(item.validTo) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="viewUsage(item)">
              mdi-chart-bar
            </v-icon>
            <v-icon small @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for creating/editing discount -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedIndex === -1 ? 'Thêm mã giảm giá' : 'Chỉnh sửa mã giảm giá' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.code"
                  label="Mã giảm giá"
                  :disabled="editedIndex !== -1"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.discountType"
                  :items="discountTypes"
                  label="Loại giảm giá"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.value"
                  label="Giá trị giảm"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.minOrderValue"
                  label="Giá trị đơn hàng tối thiểu"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.maxDiscount"
                  label="Giảm giá tối đa"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.usageLimit"
                  label="Giới hạn sử dụng"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.validFrom"
                  label="Ngày bắt đầu"
                  type="datetime-local"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.validTo"
                  label="Ngày kết thúc"
                  type="datetime-local"
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

    <!-- Dialog for viewing usage statistics -->
    <v-dialog v-model="usageDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Thống kê sử dụng mã giảm giá</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedDiscount">
            <v-row>
              <v-col cols="12">
                <h3>Mã: {{ selectedDiscount.code }}</h3>
                <p>Số lần sử dụng: {{ selectedDiscount.usageCount || 0 }}</p>
                <p>Tổng giá trị giảm: {{ formatCurrency(selectedDiscount.totalDiscount || 0) }}</p>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h3 class="mb-3">Lịch sử sử dụng</h3>
            <v-data-table
              :headers="usageHeaders"
              :items="usageHistory"
              :loading="usageLoading"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.usedAt="{ item }">
                {{ formatDate(item.usedAt) }}
              </template>
              <template v-slot:item.discountAmount="{ item }">
                {{ formatCurrency(item.discountAmount) }}
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="usageDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for confirming deletion -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận xóa mã giảm giá?</v-card-title>

        <v-card-text>
          Bạn có chắc chắn muốn xóa mã giảm giá "{{ selectedDiscount?.code }}"?
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
import { discountService } from '@/api/services/discountService';

export default {
  name: 'DiscountList',
  setup() {
    const loading = ref(false);
    const usageLoading = ref(false);
    const discounts = ref([]);
    const usageHistory = ref([]);
    const dialog = ref(false);
    const usageDialog = ref(false);
    const deleteDialog = ref(false);
    const editedIndex = ref(-1);
    const selectedDiscount = ref(null);

    const defaultItem = {
      code: '',
      discountType: 'PERCENTAGE',
      value: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: '',
      validTo: '',
      description: ''
    };

    const editedItem = ref({ ...defaultItem });

    const headers = [
      { text: 'Mã giảm giá', value: 'code' },
      { text: 'Loại', value: 'discountType' },
      { text: 'Giá trị', value: 'value' },
      { text: 'Giá trị đơn hàng tối thiểu', value: 'minOrderValue' },
      { text: 'Giảm giá tối đa', value: 'maxDiscount' },
      { text: 'Giới hạn sử dụng', value: 'usageLimit' },
      { text: 'Ngày bắt đầu', value: 'validFrom' },
      { text: 'Ngày kết thúc', value: 'validTo' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const usageHeaders = [
      { text: 'Ngày sử dụng', value: 'usedAt' },
      { text: 'Mã đơn hàng', value: 'orderId' },
      { text: 'Giá trị đơn hàng', value: 'orderAmount' },
      { text: 'Số tiền giảm', value: 'discountAmount' }
    ];

    const discountTypes = [
      { text: 'Phần trăm', value: 'PERCENTAGE' },
      { text: 'Số tiền cố định', value: 'FIXED_AMOUNT' }
    ];

    const getDiscountTypeColor = (type) => {
      return type === 'PERCENTAGE' ? 'primary' : 'success';
    };

    const getStatusColor = (status) => {
      const colors = {
        ACTIVE: 'success',
        INACTIVE: 'grey',
        EXPIRED: 'error'
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

    const fetchDiscounts = async () => {
      loading.value = true;
      try {
        const response = await discountService.getAllDiscounts();
        discounts.value = response;
      } catch (error) {
        console.error('Error fetching discounts:', error);
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
      editedIndex.value = discounts.value.indexOf(item);
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
          await discountService.updateDiscount(editedItem.value.id, editedItem.value);
        } else {
          await discountService.createDiscount(editedItem.value);
        }
        await fetchDiscounts();
        close();
      } catch (error) {
        console.error('Error saving discount:', error);
      }
    };

    const deleteItem = (item) => {
      selectedDiscount.value = item;
      deleteDialog.value = true;
    };

    const confirmDelete = async () => {
      try {
        await discountService.deleteDiscount(selectedDiscount.value.id);
        await fetchDiscounts();
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting discount:', error);
      }
    };

    const viewUsage = async (item) => {
      selectedDiscount.value = item;
      usageLoading.value = true;
      try {
        const response = await discountService.getDiscountUsage(item.id);
        usageHistory.value = response;
        usageDialog.value = true;
      } catch (error) {
        console.error('Error fetching discount usage:', error);
      } finally {
        usageLoading.value = false;
      }
    };

    onMounted(() => {
      fetchDiscounts();
    });

    return {
      loading,
      usageLoading,
      discounts,
      usageHistory,
      headers,
      usageHeaders,
      dialog,
      usageDialog,
      deleteDialog,
      editedIndex,
      editedItem,
      selectedDiscount,
      discountTypes,
      getDiscountTypeColor,
      getStatusColor,
      formatDate,
      formatCurrency,
      openCreateDialog,
      editItem,
      close,
      save,
      deleteItem,
      confirmDelete,
      viewUsage
    };
  }
};
</script>

<style scoped>
.discount-list {
  padding: 20px;
}
</style> 