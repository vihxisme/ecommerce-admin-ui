// src/api/services/authService.js

import apiClient from '../config';

export const authService = {
    login: (credentials) => {
        return apiClient.post('/identity/auth/login', {
            identifier: credentials.identifier,
            password: credentials.password
        });
    },

    register: async (userData) => {
        const response = await apiClient.post(`${services.auth}/register`, userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

