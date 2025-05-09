// src/api/services/orderService.js
import apiClient from '../config';

export const orderService = {
  getAllOrders: (request) => {
    return apiClient.get(`/order/v1/order/info/list`, {
      params: {
        page: request.page,
        size: request.size
      }
    });
  },
  getOrderStatistics: () => {
    return apiClient.get("/order/v1/order/statistics");
  },
  updateOrderStatus: (request) => {
    return apiClient.patch("/order/v1/order/update", {
      id: request.id,
      status: request.status
    })
  },
  getOrderById: (request) => {
    return apiClient.get("/order/v1/order/detail", {
      params: {
        id: request
      }
    });
  }
};