<template>
  <v-container fluid class="fill-height bg-grey-lighten-3">
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-lg">
          <v-row no-gutters>
            <!-- Logo và branding -->
            <v-col cols="12" class="bg-primary rounded-t-lg pa-8">
              <div class="d-flex align-center justify-center">
                <v-icon icon="mdi-shopping" size="48" color="white" class="mr-2" />
                <h1 class="text-h4 font-weight-bold white--text mb-0">Shop Admin</h1>
              </div>
              <div class="text-center white--text text-body-1 mt-2">
                Hệ thống quản lý bán hàng
              </div>
            </v-col>

            <!-- Form đăng nhập -->
            <v-col cols="12">
              <v-form @submit.prevent="handleLogin" ref="form" class="pa-8">
                <v-card-text class="pa-0">
                  <v-alert v-if="error" type="error" variant="tonal" class="mb-6" closable @click:close="error = ''">
                    {{ error }}
                  </v-alert>

                  <v-text-field v-model="username" label="Tên đăng nhập" prepend-icon="mdi-account"
                    :rules="[rules.required]" required variant="outlined" density="comfortable" class="mb-2"
                    :disabled="loading" :error-messages="usernameError" @update:model-value="usernameError = ''" />

                  <v-text-field v-model="password" label="Mật khẩu" prepend-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
                    :rules="[rules.required, rules.minLength]" required variant="outlined" density="comfortable"
                    class="mb-4" :disabled="loading" :error-messages="passwordError"
                    @update:model-value="passwordError = ''" @click:append="showPassword = !showPassword"
                    @keyup.enter="handleLogin" />

                  <div class="d-flex justify-space-between align-center mb-6">
                    <v-checkbox v-model="rememberMe" label="Ghi nhớ đăng nhập" color="primary" hide-details
                      :disabled="loading" />
                    <v-btn variant="text" color="primary" class="text-none px-0" :disabled="loading"
                      @click="handleForgotPassword">
                      Quên mật khẩu?
                    </v-btn>
                  </div>
                </v-card-text>

                <v-card-actions class="pa-0">
                  <v-btn color="primary" size="large" type="submit" :loading="loading" block
                    class="text-none text-subtitle-1">
                    {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card>

        <!-- Footer -->
        <div class="text-center mt-4 text-grey">
          <p class="mb-0">&copy; {{ new Date().getFullYear() }} Shop Admin. All rights reserved.</p>
          <p class="text-caption mt-1">Version 1.0.0</p>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog quên mật khẩu -->
    <v-dialog v-model="showForgotDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          Khôi phục mật khẩu
        </v-card-title>

        <v-card-text class="pa-6 pt-0">
          <p class="mb-4">Vui lòng nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
          <v-text-field v-model="forgotEmail" label="Email" type="email" variant="outlined" density="comfortable"
            :rules="[rules.required, rules.email]" :error-messages="forgotEmailError"
            @update:model-value="forgotEmailError = ''" />
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="showForgotDialog = false" :disabled="forgotLoading">
            Hủy
          </v-btn>
          <v-btn color="primary" @click="handleResetPassword" :loading="forgotLoading">
            Gửi yêu cầu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar thông báo -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSnackbar = false">
          Đóng
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const form = ref(null);

// Form fields
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const error = ref('');
const usernameError = ref('');
const passwordError = ref('');

// Forgot password
const showForgotDialog = ref(false);
const forgotEmail = ref('');
const forgotEmailError = ref('');
const forgotLoading = ref(false);

// Snackbar
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// Validation rules
const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  minLength: v => (v && v.length >= 4) || 'Mật khẩu phải có ít nhất 4 ký tự',
  email: v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
};

// Handle login
const handleLogin = async () => {
  const { valid } = await form.value.validate();

  if (!valid) return;

  try {
    loading.value = true;
    error.value = '';
    usernameError.value = '';
    passwordError.value = '';

    const success = await authStore.login({
      identifier: username.value,
      password: password.value,
      // rememberMe: rememberMe.value
    });

    console.log("success: ", success);

    if (success) {
      showSuccessSnackbar('Đăng nhập thành công');
      router.push('/dashboard');
    } else {
      error.value = 'Tên đăng nhập hoặc mật khẩu không đúng';
    }
  } catch (err) {
    console.error('Login error:', err);
    if (err.response?.status === 401) {
      error.value = 'Tên đăng nhập hoặc mật khẩu không đúng';
    } else if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      usernameError.value = errors.username?.[0] || '';
      passwordError.value = errors.password?.[0] || '';
    } else {
      error.value = 'Có lỗi xảy ra khi đăng nhập';
    }
  } finally {
    loading.value = false;
  }
};

// Handle forgot password
const handleForgotPassword = () => {
  showForgotDialog.value = true;
  forgotEmail.value = '';
  forgotEmailError.value = '';
};

// Handle reset password
const handleResetPassword = async () => {
  if (!forgotEmail.value || !rules.email(forgotEmail.value)) {
    forgotEmailError.value = 'Email không hợp lệ';
    return;
  }

  try {
    forgotLoading.value = true;
    forgotEmailError.value = '';

    // TODO: Call API to send reset password email
    await new Promise(resolve => setTimeout(resolve, 1000));

    showForgotDialog.value = false;
    showSuccessSnackbar('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn');
  } catch (err) {
    console.error('Reset password error:', err);
    if (err.response?.data?.message) {
      forgotEmailError.value = err.response.data.message;
    } else {
      forgotEmailError.value = 'Có lỗi xảy ra khi gửi yêu cầu';
    }
  } finally {
    forgotLoading.value = false;
  }
};

// Show success snackbar
const showSuccessSnackbar = (text) => {
  snackbarText.value = text;
  snackbarColor.value = 'success';
  showSnackbar.value = true;
};
</script>

<style scoped>
.v-card {
  max-width: 100%;
  width: 100%;
}

.v-card-title {
  color: rgb(var(--v-theme-primary));
}

@media (min-width: 600px) {
  .v-card {
    min-width: 400px;
  }
}

/* Custom styles for primary background */
.bg-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
}

/* Smooth transitions */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}
</style>