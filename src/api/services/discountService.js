import { api } from '../../utils/api';
import apiClient from '../config';

export const discountService = {
  getDiscountList: (request) => {
    return apiClient.get(`/discount/v1/discount/info/all`, {
      params: {
        page: request.page,
        size: request.size
      }
    });
  },
  createDiscount: (request) => {
    return apiClient.post(`/discount/v1/discount/create`, {
      discountTitle: request.discountTitle,
      discountPercentage: request.discountPercentage,
      discountAmount: request.discountAmount,
      minOrderValue: request.minOrderValue,
      startDate: request.startDate,
      endDate: request.endDate,
      isActive: request.isActive
    });
  },
  updateDiscount: (request) => {
    return apiClient.patch(`/discount/v1/discount/update`, {
      id: request.id,
      discountTitle: request.discountTitle,
      discountPercentage: request.discountPercentage,
      discountAmount: request.discountAmount,
      minOrderValue: request.minOrderValue,
      startDate: request.startDate,
      endDate: request.endDate,
      isActive: request.isActive
    });
  },
  deleteDiscount: (id) => {
    return apiClient.delete(`/discount/v1/discount/delete/${id}`);
  },
  getInfoByDiscountId: (request) => {
    return apiClient.get(`/discount/v1/discount-target/info/target-names/by`, {
      params: {
        page: request.page,
        size: request.size,
        discountId: request.discountId,
        targetType: request.targetType
      }
    });
  },
  createTarget: (request) => {
    return apiClient.post(`/discount/v1/discount-target/create`, {
      discountId: request.discountId,
      targetType: request.targetType,
      targetId: request.targetId
    });
  },
  deleteTarget: (id) => {
    return apiClient.delete(`/discount/v1/discount-target/delete/${id}`);
  },
  statistics: () => {
    return apiClient.get(`/discount/v1/discount/statistics`);
  }

}; 