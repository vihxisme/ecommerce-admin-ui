import apiClient from '../config';

export const customerService = {
  getCustomerTransaction: (request) => {
    return apiClient.get("/customer/v1/customer/with-transaction", {
      params: {
        page: request.page,
        size: request.size
      }
    })
  },
  getNewCustomerStats: (request) => {
    return apiClient.get(`/customer/v1/customer/statistics/new-customer/by`, {
      params: {
        limit: request.limit,
        rangeType: request.rangeType
      }
    });
  },
  statsNewCustomerByMonth: (request) => {
    return apiClient.get(`/customer/v1/customer/statistics/new-customer`, {
      params: {
        rangeType: request
      }
    });
  },
}