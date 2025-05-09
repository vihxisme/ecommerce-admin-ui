// src/api/services/productService.js
import apiClient from '../config';

export const productService = {
  getProductsByPagination: (request) => {
    return apiClient.get(`/product/v1/products/info/all`, {
      params: {
        page: request.page,
        size: request.size,
      }
    });
  },

  getAllProducts: () => {
    return apiClient.get(`/product/v1/products/info/list`);
  },

  getAllColor: () => {
    return apiClient.get(`/product/v1/color/info/all`);
  },

  getAllSize: () => {
    return apiClient.get(`/product/v1/size/info/all`);
  },

  getProductInfoById: (request) => {
    return apiClient.get(`/product/v1/products/by`, {
      params: {
        id: request,
      }
    });
  },

  createProduct: (request) => {
    return apiClient.post(`/product/v1/products/create`, {
      productRequest: {
        categorieId: request.categorieId,
        name: request.name,
        price: request.price,
        brand: request.brand,
        status: request.status,
        productImageUrl: request.productImageUrl
      },
      colorIds: [...request.colorIds],
      sizeIds: [...request.sizeIds],
      colorImageUrls: [...request.colorImageUrls],
      imageUrl: [...request.imageUrl],
      attributeName: [...request.attributeName],
      attributeValue: [...request.attributeValue]
    });
  },

  updateProduct: (request) => {
    return apiClient.patch(`/product/v1/products/update`, {
      id: request.id,
      name: request.name,
      categorieId: request.categorieId,
      price: request.price,
      brand: request.brand,
      status: request.status,
      productImageUrl: request.productImageUrl
    });
  },

  getTopProduct: (request) => {
    return apiClient.get(`/product/v1/products/top-product/by-revenue`, {
      params: {
        limit: request,
      }
    });
  },

  getTopProductWithDiscount: (request) => {
    return apiClient.get(`/product/v1/products/top-product/with-discount`, {
      params: {
        limit: request
      }
    });
  },
  getTopProductByRangeType: (request) => {
    return apiClient.get(`/product/v1/products/top-product/by-rangetype`, {
      params: {
        rangeType: request.rangeType,
        limit: request.limit
      }
    });
  }
};

