import apiClient from "../config";

export const statisticsService = {
  totalRevenue: () => {
    return apiClient.get(`/order/v1/statistics/total-revenue`);
  },
  totalRevenueByUserId: () => {
    return apiClient.get(`/order/v1/statistics/total-revenue/by-userid`);
  },
  countProduct: () => {
    return apiClient.get(`/product/v1/products/count/product`);
  },
  countNewOrder: () => {
    return apiClient.get(`/order/v1/statistics/count/new-order`);
  },
  countCustomerFromOrder: () => {
    return apiClient.get(`/order/v1/statistics/count/customer`);
  },
  countCustomerFromCustomer: () => {
    return apiClient.get(`/customer/v1/customer/count/customer`);
  },
  revenueStats: () => {
    return apiClient.get(`/order/v1/statistics/anal-revenue`);
  },
  revenueChart: (request) => {
    return apiClient.get(`/order/v1/statistics/revenue/by`, {
      params: {
        rangeType: request
      }
    });
  },
  orderChart: (request) => {
    return apiClient.get(`/order/v1/statistics/order/by-status`, {
      params: {
        rangeType: request
      }
    });
  },
  statsRevenue: (request) => {
    return apiClient.get(`/order/v1/statistics/stats-revenue/by`, {
      params: {
        rangeType: request
      }
    });
  },
  statsOrder: (request) => {
    return apiClient.get(`/order/v1/statistics/stats-order/by`, {
      params: {
        rangeType: request
      }
    });
  },
  statsTopProduct: (request) => {
    return apiClient.get(`/order/v1/statistics/stats-revenue/top-product`, {
      params: {
        rangeType: request
      }
    })
  },
  statsNewCustomerFrOrder: (request) => {
    return apiClient.get(`/order/v1/statistics/stats/new-customer`, {
      params: {
        rangeType: request
      }
    });
  },
  statsNewCustomerFrCustomer: (request) => {
    return apiClient.get(`/customer/v1/customer/statistics/new-customer`, {
      params: {
        rangeType: request
      }
    });
  },
  statsNewCustomer: (request) => {
    return apiClient.get(`/order/v1/statistics/list/order/by`, {
      params: {
        page: request.page,
        size: request.size,
        rangeType: request.rangeType
      }
    });
  }
}