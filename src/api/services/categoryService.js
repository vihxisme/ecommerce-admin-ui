
import apiClient from '../config';

export const categoryService = {
  getAllCategory: (request) => {
    return apiClient.get(`/product/v1/categorie/info/all/list`, {
      params: {
        page: request.page,
        size: request.size,
      }
    });
  },
  getCategoryAll: () => {
    return apiClient.get(`/product/v1/categorie/info/all`);
  },
  createCategory: (request) => {
    return apiClient.post(`/product/v1/categorie/create`, {
      name: request.name,
      categorieImageUrl: request.categorieImageUrl,
      apparelType: request.apparelType
    });
  },
  updateCategory: (request) => {
    return apiClient.patch(`/product/v1/categorie/update`, {
      id: request.id,
      name: request.name,
      categorieImageUrl: request.categorieImageUrl,
      apparelType: request.apparelType
    });
  },
  deleteCategory: (request) => {
    return apiClient.delete(`/product/v1/categorie/delete/${request}`);
  }
}