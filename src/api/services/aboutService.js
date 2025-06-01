import apiClient from '../config';

export const aboutService = {
  updateAboutStore: (request) => {
    return apiClient.patch(`/about/v1/about-store/update`, {
      id: request.id,
      name: request.name,
      phone: request.phone,
      email: request.email,
      address: request.address,
      content: request.content,
      logo: request.logo
    })
  },
  getAboutStore: () => {
    return apiClient.get(`/about/v1/about-store/list-all`);
  },
  getAllBanner: () => {
    return apiClient.get(`/about/v1/banner/list-all`);
  },
  createBanner: (request) => {
    return apiClient.post(`/about/v1/banner/create`,
      request.map(item => ({
        bannerUrl: item.bannerUrl
      }))
    );
  },
  updateBanner: () => {
    return apiClient.patch(`/about/v1/banner/update`,
      request.map(item => ({
        id: item.id,
        bannerUrl: item.bannerUrl
      }))
    );
  },
  deleteBanner: (ids) => {
    return apiClient.delete(`/about/v1/banner/delete/${ids.join(',')}`)
  }
}