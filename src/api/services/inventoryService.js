import apiClient from '../config';

export const inventoryService = {
  getInventory: (request) => {
    return apiClient.get(`/inventory/v1/inventory/with-product`, {
      params: {
        page: request.page,
        size: request.size
      }
    });
  },
  updateInventoryItem: (request) => {
    return apiClient.patch(`/inventory/v1/inventory-items/update`, {
      id: request.id,
      itemQuantity: request.itemQuantity
    });
  },
  inventoryIntake: (request) => {
    return apiClient.post(`/inventory/v1/inventory-items/inventory-intake`, {
      id: request.id,
      itemQuantity: request.itemQuantity
    });
  },
  getInvenItem: (request) => {
    return apiClient.get(`/inventory/v1/inventory-items/with-variant`, {
      params: {
        inventoryId: request.inventoryId,
        page: request.page,
        size: request.size
      }
    });
  },
  getHistoryStockTypeAll: (request) => {
    return apiClient.get(`/inventory/v1/stock-movement/type-all`, {
      params: {
        inventoryId: request.inventoryId,
        page: request.page,
        size: request.size
      }
    });
  },
  getHistoryStockType: (request) => {
    return apiClient.get(`/inventory/v1/stock-movement/type`, {
      params: {
        inventoryId: request.inventoryId,
        type: request.type,
        page: request.page,
        size: request.size
      }
    });
  },
}