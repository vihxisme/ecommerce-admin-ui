<template>
  <div class="inventory-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quản lý kho hàng</span>
        <v-btn color="primary" @click="refreshInventory">
          <v-icon left>mdi-refresh</v-icon>
          Làm mới
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="inventoryItems"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.stockLevel="{ item }">
            <v-chip
              :color="getStockLevelColor(item.stockLevel, item.minStockLevel)"
              small
            >
              {{ item.stockLevel }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="viewInventoryDetails(item)">
              mdi-eye
            </v-icon>
            <v-icon small class="mr-2" @click="updateStock(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="viewStockHistory(item)">
              mdi-history
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for inventory details -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Chi tiết sản phẩm trong kho</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedItem">
            <v-row>
              <v-col cols="6">
                <strong>Mã sản phẩm:</strong> {{ selectedItem.productId }}
              </v-col>
              <v-col cols="6">
                <strong>Tên sản phẩm:</strong> {{ selectedItem.productName }}
              </v-col>
              <v-col cols="6">
                <strong>Số lượng tồn:</strong>
                <v-chip
                  :color="getStockLevelColor(selectedItem.stockLevel, selectedItem.minStockLevel)"
                  small
                  class="ml-2"
                >
                  {{ selectedItem.stockLevel }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <strong>Số lượng tối thiểu:</strong> {{ selectedItem.minStockLevel }}
              </v-col>
              <v-col cols="6">
                <strong>Vị trí kho:</strong> {{ selectedItem.location || 'Chưa xác định' }}
              </v-col>
              <v-col cols="6">
                <strong>Trạng thái:</strong>
                <v-chip
                  :color="getStatusColor(selectedItem.status)"
                  small
                  class="ml-2"
                >
                  {{ selectedItem.status }}
                </v-chip>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h3 class="mb-3">Thông tin bổ sung</h3>
            <v-row>
              <v-col cols="12">
                <strong>Ghi chú:</strong> {{ selectedItem.notes || 'Không có' }}
              </v-col>
              <v-col cols="6">
                <strong>Ngày nhập lần cuối:</strong> {{ formatDate(selectedItem.lastRestocked) }}
              </v-col>
              <v-col cols="6">
                <strong>Cập nhật lần cuối:</strong> {{ formatDate(selectedItem.updatedAt) }}
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

    <!-- Dialog for updating stock -->
    <v-dialog v-model="updateDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cập nhật số lượng tồn kho</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="stockUpdate.quantity"
                  label="Số lượng"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="stockUpdate.type"
                  :items="updateTypes"
                  label="Loại cập nhật"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="stockUpdate.notes"
                  label="Ghi chú"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="updateDialog = false">
            Hủy
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveStockUpdate">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for stock history -->
    <v-dialog v-model="historyDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Lịch sử tồn kho</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedItem">
            <h3 class="mb-3">{{ selectedItem.productName }}</h3>
            <v-data-table
              :headers="historyHeaders"
              :items="stockHistory"
              :loading="historyLoading"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getUpdateTypeColor(item.type)"
                  small
                >
                  {{ item.type }}
                </v-chip>
              </template>
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="historyDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { inventoryService } from '@/api/services/inventoryService';

export default {
  name: 'InventoryList',
  setup() {
    const loading = ref(false);
    const historyLoading = ref(false);
    const inventoryItems = ref([]);
    const stockHistory = ref([]);
    const detailsDialog = ref(false);
    const updateDialog = ref(false);
    const historyDialog = ref(false);
    const selectedItem = ref(null);
    const stockUpdate = ref({
      quantity: 0,
      type: '',
      notes: ''
    });

    const headers = [
      { text: 'Mã sản phẩm', value: 'productId' },
      { text: 'Tên sản phẩm', value: 'productName' },
      { text: 'Số lượng tồn', value: 'stockLevel' },
      { text: 'Số lượng tối thiểu', value: 'minStockLevel' },
      { text: 'Vị trí kho', value: 'location' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const historyHeaders = [
      { text: 'Ngày', value: 'date' },
      { text: 'Loại', value: 'type' },
      { text: 'Số lượng', value: 'quantity' },
      { text: 'Số lượng trước', value: 'previousStock' },
      { text: 'Số lượng sau', value: 'newStock' },
      { text: 'Ghi chú', value: 'notes' }
    ];

    const updateTypes = [
      'RESTOCK',
      'ADJUSTMENT',
      'RETURN',
      'DAMAGE',
      'OTHER'
    ];

    const getStockLevelColor = (stockLevel, minStockLevel) => {
      if (stockLevel <= 0) return 'error';
      if (stockLevel <= minStockLevel) return 'warning';
      return 'success';
    };

    const getStatusColor = (status) => {
      const colors = {
        IN_STOCK: 'success',
        LOW_STOCK: 'warning',
        OUT_OF_STOCK: 'error',
        DISCONTINUED: 'grey'
      };
      return colors[status] || 'grey';
    };

    const getUpdateTypeColor = (type) => {
      const colors = {
        RESTOCK: 'success',
        ADJUSTMENT: 'info',
        RETURN: 'primary',
        DAMAGE: 'error',
        OTHER: 'grey'
      };
      return colors[type] || 'grey';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    const fetchInventory = async () => {
      loading.value = true;
      try {
        const response = await inventoryService.getAllInventoryItems();
        inventoryItems.value = response;
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        loading.value = false;
      }
    };

    const viewInventoryDetails = (item) => {
      selectedItem.value = item;
      detailsDialog.value = true;
    };

    const updateStock = (item) => {
      selectedItem.value = item;
      stockUpdate.value = {
        quantity: 0,
        type: 'RESTOCK',
        notes: ''
      };
      updateDialog.value = true;
    };

    const saveStockUpdate = async () => {
      try {
        await inventoryService.updateStock(
          selectedItem.value.productId,
          stockUpdate.value.quantity,
          stockUpdate.value.type,
          stockUpdate.value.notes
        );
        
        // Refresh inventory data
        await fetchInventory();
        updateDialog.value = false;
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    };

    const viewStockHistory = async (item) => {
      selectedItem.value = item;
      historyLoading.value = true;
      try {
        const response = await inventoryService.getStockHistory(item.productId);
        stockHistory.value = response;
        historyDialog.value = true;
      } catch (error) {
        console.error('Error fetching stock history:', error);
      } finally {
        historyLoading.value = false;
      }
    };

    const refreshInventory = () => {
      fetchInventory();
    };

    onMounted(() => {
      fetchInventory();
    });

    return {
      loading,
      historyLoading,
      inventoryItems,
      stockHistory,
      headers,
      historyHeaders,
      detailsDialog,
      updateDialog,
      historyDialog,
      selectedItem,
      stockUpdate,
      updateTypes,
      getStockLevelColor,
      getStatusColor,
      getUpdateTypeColor,
      formatDate,
      viewInventoryDetails,
      updateStock,
      saveStockUpdate,
      viewStockHistory,
      refreshInventory
    };
  }
};
</script>

<style scoped>
.inventory-list {
  padding: 20px;
}
</style> 