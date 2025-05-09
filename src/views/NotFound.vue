<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-card class="pa-6">
          <v-img
            src="@/assets/404.svg"
            alt="404 Not Found"
            max-height="200"
            contain
            class="mb-4"
          ></v-img>
          <h1 class="text-h4 font-weight-bold mb-2">404</h1>
          <h2 class="text-h5 mb-4">Không tìm thấy trang</h2>
          <p class="text-body-1 mb-6">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <v-btn
            color="primary"
            large
            block
            @click="$router.push('/dashboard')"
          >
            Quay về trang chủ
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Không cần thêm logic gì
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}
</style> 