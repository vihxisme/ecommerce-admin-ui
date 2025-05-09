import { defineStore } from 'pinia';
import { authService } from '../api/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Uncomment để bật lại chức năng xác thực
    user: null,
    token: null,
    loading: false,
    error: null,
    permissions: [],
    roles: [],
    isAuthenticated: false

  }),

  getters: {
    currentUser: (state) => state.user,
    hasPermission: (state) => (permission) => state.permissions.includes(permission),
    hasRole: (state) => (role) => state.roles.includes(role),
    isAdmin: (state) => state.roles.includes('ADMIN')
  },

  actions: {
    // Thêm hàm initializeAuth để khởi tạo trạng thái xác thực
    async initializeAuth() {
      // Bypass authentication - comment dòng dưới để bật lại chức năng xác thực
      //return true;

      // Uncomment để bật lại chức năng xác thực
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return false;
        }

        return await this.checkAuth();
      } catch (error) {
        this.clearAuth();
        return false;
      }

    },

    async login(credentials) {
      // Bypass authentication - comment dòng dưới để bật lại chức năng xác thực
      //return true;

      // Uncomment để bật lại chức năng xác thực
      try {
        this.loading = true;
        this.error = null;

        const response = await authService.login(credentials);
        const data = response.data.data;

        if (data.loginDTO.role === "ADMIN") {
          this.token = data.token;
          this.user = data.loginDTO;

          console.log("pass");

          // this.permissions = user.permissions || [];
          this.roles = this.user.role || [];
          this.isAuthenticated = true;

          localStorage.setItem('token', this.token);

          return true;
        } else {
          return false;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Đăng nhập thất bại';
        return false;
      } finally {
        this.loading = false;
      }

    },

    async checkAuth() {
      // Bypass authentication - comment dòng dưới để bật lại chức năng xác thực
      // return true;

      // Uncomment để bật lại chức năng xác thực
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.isAuthenticated = false;
          return false;
        }

        // const request = { token: `Bearer ${this.token}` };

        // console.log("token: ", token);

        // const response = await axios.post(`/identity/authenticated/validate`, request);

        // console.log("data: ", response.data);
        // if (response.data.data.valid) {
        //   this.isAuthenticated = true;
        //   return true;
        // } else {
        //   this.clearAuth();
        //   return false;
        // }

      } catch (error) {
        this.clearAuth();
        return false;
      }

    },

    clearAuth() {
      // Bypass authentication - comment các dòng dưới để bật lại chức năng xác thực
      // return;

      // Uncomment để bật lại chức năng xác thực
      this.user = null;
      this.token = null;
      this.roles = [];
      this.isAuthenticated = false;
      localStorage.removeItem('token');

    }
  }
});