import apiClient, { services } from '../config';

export const cartService = {
  getAllCarts: async (params) => {
    const response = await apiClient.get(`${services.cart}/carts`, { params });
    return response.data;
  },

  getCartById: async (id) => {
    const response = await apiClient.get(`${services.cart}/carts/${id}`);
    return response.data;
  },

  createCart: async (cartData) => {
    const response = await apiClient.post(`${services.cart}/carts`, cartData);
    return response.data;
  },

  updateCart: async (id, cartData) => {
    const response = await apiClient.put(`${services.cart}/carts/${id}`, cartData);
    return response.data;
  },

  deleteCart: async (id) => {
    const response = await apiClient.delete(`${services.cart}/carts/${id}`);
    return response.data;
  },

  addItemToCart: async (cartId, itemData) => {
    const response = await apiClient.post(`${services.cart}/carts/${cartId}/items`, itemData);
    return response.data;
  },

  removeItemFromCart: async (cartId, itemId) => {
    const response = await apiClient.delete(`${services.cart}/carts/${cartId}/items/${itemId}`);
    return response.data;
  },

  getCartStatistics: async () => {
    const response = await apiClient.get(`${services.cart}/carts/statistics`);
    return response.data;
  }
}; 