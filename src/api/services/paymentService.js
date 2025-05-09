import apiClient from '../config';

export const paymentService = {
  getPagiPayment: (request) => {
    return apiClient.get(`/payment/v1/payment/list`, {
      params: {
        page: request.page,
        size: request.size,
      }
    });
  },
  updatePayment: (request) => {
    return apiClient.patch(`/payment/v1/payment/update`, {
      id: request.id,
      paymentStatus: request.paymentStatus
    });
  },
  statisticsPayment: () => {
    return apiClient.get(`/payment/v1/payment/status-statistics`);
  }
}; 