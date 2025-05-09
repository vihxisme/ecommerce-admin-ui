<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list class="text-start text-uppercase">
        <v-list-item prepend-icon="mdi-view-dashboard" title="Bảng điều khiển" to="/dashboard" />
        <v-list-item prepend-icon="mdi-package-variant" title="Sản phẩm" to="/products" />
        <v-list-item prepend-icon="mdi-sale" title="Ưu đãi" to="/discounts" />
        <v-list-item prepend-icon="mdi-tag" title="Danh mục" to="/categories" />
        <v-list-item prepend-icon="mdi-cart" title="Đơn hàng" to="/orders" />
        <v-list-item prepend-icon="mdi-currency-usd" title="Thanh toán" to="/payment" />
        <v-list-item prepend-icon="mdi-account-group" title="Khách hàng" to="/customers" />
        <v-list-item prepend-icon="mdi-package-variant-closed" title="Kho hàng" to="/inventory" />
        <v-list-item prepend-icon="mdi-cog" title="Cài đặt" to="/settings/general" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>E-Shop Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon @click="logout">mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
export default {
  name: 'DefaultLayout',
  data: () => ({
    drawer: true,
  }),
  created() {
    this.authStore = useAuthStore(); // OK ở đây
    this.router = useRouter();
  },
  methods: {
    logout() {
      this.authStore.clearAuth();
      this.router.push('/login');
    }
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  background-color: #f5f5f5;
}

.v-list-item {
  margin: 4px 0;
}

.v-list-item:hover {
  background-color: #e0e0e0;
}

.v-app-bar {
  background-color: #1976D2;
  color: white;
}

.v-main {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>