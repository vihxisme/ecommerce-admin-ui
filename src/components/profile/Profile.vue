<template>
  <div class="profile">
    <v-row>
      <!-- Thông tin cá nhân -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Thông tin cá nhân</v-card-title>
          <v-card-text>
            <v-avatar size="120" class="mb-4">
              <v-img :src="user.avatar || '/default-avatar.png'" alt="Avatar"></v-img>
            </v-avatar>
            <v-form ref="profileForm" v-model="profileFormValid">
              <v-text-field
                v-model="user.fullName"
                label="Họ và tên"
                :rules="[v => !!v || 'Họ và tên là bắt buộc']"
                required
              ></v-text-field>
              <v-text-field
                v-model="user.email"
                label="Email"
                :rules="[
                  v => !!v || 'Email là bắt buộc',
                  v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                ]"
                required
              ></v-text-field>
              <v-text-field
                v-model="user.phone"
                label="Số điện thoại"
                :rules="[v => !!v || 'Số điện thoại là bắt buộc']"
                required
              ></v-text-field>
              <v-textarea
                v-model="user.address"
                label="Địa chỉ"
                rows="3"
              ></v-textarea>
              <v-file-input
                v-model="avatarFile"
                label="Ảnh đại diện"
                accept="image/*"
                prepend-icon="mdi-camera"
                @change="handleAvatarChange"
              ></v-file-input>
              <v-btn
                color="primary"
                block
                @click="updateProfile"
                :loading="updating"
              >
                Cập nhật thông tin
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Đổi mật khẩu -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Đổi mật khẩu</v-card-title>
          <v-card-text>
            <v-form ref="passwordForm" v-model="passwordFormValid">
              <v-text-field
                v-model="passwordData.currentPassword"
                label="Mật khẩu hiện tại"
                type="password"
                :rules="[v => !!v || 'Mật khẩu hiện tại là bắt buộc']"
                required
              ></v-text-field>
              <v-text-field
                v-model="passwordData.newPassword"
                label="Mật khẩu mới"
                type="password"
                :rules="[
                  v => !!v || 'Mật khẩu mới là bắt buộc',
                  v => v.length >= 8 || 'Mật khẩu phải có ít nhất 8 ký tự'
                ]"
                required
              ></v-text-field>
              <v-text-field
                v-model="passwordData.confirmPassword"
                label="Xác nhận mật khẩu mới"
                type="password"
                :rules="[
                  v => !!v || 'Xác nhận mật khẩu là bắt buộc',
                  v => v === passwordData.newPassword || 'Mật khẩu không khớp'
                ]"
                required
              ></v-text-field>
              <v-btn
                color="primary"
                block
                @click="changePassword"
                :loading="changingPassword"
              >
                Đổi mật khẩu
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cài đặt tài khoản -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Cài đặt tài khoản</v-card-title>
          <v-card-text>
            <v-form ref="settingsForm" v-model="settingsFormValid">
              <v-switch
                v-model="accountSettings.emailNotifications"
                label="Nhận thông báo qua email"
                color="primary"
              ></v-switch>
              <v-switch
                v-model="accountSettings.smsNotifications"
                label="Nhận thông báo qua SMS"
                color="primary"
              ></v-switch>
              <v-switch
                v-model="accountSettings.twoFactorAuth"
                label="Xác thực 2 lớp"
                color="primary"
                @change="handleTwoFactorChange"
              ></v-switch>
              <v-btn
                color="primary"
                block
                @click="updateSettings"
                :loading="updatingSettings"
              >
                Lưu cài đặt
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Xác thực 2 lớp -->
        <v-card v-if="showTwoFactorSetup" class="mt-4">
          <v-card-title>Thiết lập xác thực 2 lớp</v-card-title>
          <v-card-text>
            <div class="text-center mb-4">
              <v-img
                :src="twoFactorData.qrCode"
                max-width="200"
                class="mx-auto"
              ></v-img>
              <div class="mt-2">
                Mã khôi phục: <strong>{{ twoFactorData.backupCodes.join(', ') }}</strong>
              </div>
            </div>
            <v-text-field
              v-model="twoFactorData.code"
              label="Mã xác thực"
              :rules="[v => !!v || 'Mã xác thực là bắt buộc']"
              required
            ></v-text-field>
            <v-btn
              color="primary"
              block
              @click="verifyTwoFactor"
              :loading="verifyingTwoFactor"
            >
              Xác nhận
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar thông báo -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Đóng
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { userService } from '@/api/services/userService';

export default {
  name: 'Profile',
  setup() {
    // Form validation
    const profileForm = ref(null);
    const profileFormValid = ref(false);
    const passwordForm = ref(null);
    const passwordFormValid = ref(false);
    const settingsForm = ref(null);
    const settingsFormValid = ref(false);

    // Loading states
    const updating = ref(false);
    const changingPassword = ref(false);
    const updatingSettings = ref(false);
    const verifyingTwoFactor = ref(false);

    // User data
    const user = ref({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      avatar: null
    });

    // Password data
    const passwordData = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Account settings
    const accountSettings = ref({
      emailNotifications: true,
      smsNotifications: false,
      twoFactorAuth: false
    });

    // Two factor data
    const showTwoFactorSetup = ref(false);
    const twoFactorData = ref({
      qrCode: '',
      backupCodes: [],
      code: ''
    });

    // Avatar file
    const avatarFile = ref(null);

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getProfile();
        user.value = {
          ...user.value,
          ...profile
        };
        accountSettings.value = profile.settings || accountSettings.value;
      } catch (error) {
        console.error('Error fetching profile:', error);
        showSnackbar('Không thể tải thông tin người dùng', 'error');
      }
    };

    const updateProfile = async () => {
      if (!profileForm.value.validate()) {
        showSnackbar('Vui lòng kiểm tra lại thông tin', 'error');
        return;
      }

      updating.value = true;
      try {
        const formData = new FormData();
        formData.append('fullName', user.value.fullName);
        formData.append('email', user.value.email);
        formData.append('phone', user.value.phone);
        formData.append('address', user.value.address);
        if (avatarFile.value) {
          formData.append('avatar', avatarFile.value);
        }

        await userService.updateProfile(formData);
        showSnackbar('Cập nhật thông tin thành công', 'success');
      } catch (error) {
        console.error('Error updating profile:', error);
        showSnackbar('Không thể cập nhật thông tin', 'error');
      } finally {
        updating.value = false;
      }
    };

    const changePassword = async () => {
      if (!passwordForm.value.validate()) {
        showSnackbar('Vui lòng kiểm tra lại thông tin', 'error');
        return;
      }

      changingPassword.value = true;
      try {
        await userService.changePassword(passwordData.value);
        showSnackbar('Đổi mật khẩu thành công', 'success');
        passwordData.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        console.error('Error changing password:', error);
        showSnackbar('Không thể đổi mật khẩu', 'error');
      } finally {
        changingPassword.value = false;
      }
    };

    const updateSettings = async () => {
      if (!settingsForm.value.validate()) {
        showSnackbar('Vui lòng kiểm tra lại thông tin', 'error');
        return;
      }

      updatingSettings.value = true;
      try {
        await userService.updateSettings(accountSettings.value);
        showSnackbar('Cập nhật cài đặt thành công', 'success');
      } catch (error) {
        console.error('Error updating settings:', error);
        showSnackbar('Không thể cập nhật cài đặt', 'error');
      } finally {
        updatingSettings.value = false;
      }
    };

    const handleTwoFactorChange = async (value) => {
      if (value) {
        try {
          const data = await userService.setupTwoFactor();
          twoFactorData.value = {
            qrCode: data.qrCode,
            backupCodes: data.backupCodes,
            code: ''
          };
          showTwoFactorSetup.value = true;
        } catch (error) {
          console.error('Error setting up two factor:', error);
          showSnackbar('Không thể thiết lập xác thực 2 lớp', 'error');
          accountSettings.value.twoFactorAuth = false;
        }
      } else {
        try {
          await userService.disableTwoFactor();
          showTwoFactorSetup.value = false;
          showSnackbar('Đã tắt xác thực 2 lớp', 'success');
        } catch (error) {
          console.error('Error disabling two factor:', error);
          showSnackbar('Không thể tắt xác thực 2 lớp', 'error');
          accountSettings.value.twoFactorAuth = true;
        }
      }
    };

    const verifyTwoFactor = async () => {
      if (!twoFactorData.value.code) {
        showSnackbar('Vui lòng nhập mã xác thực', 'error');
        return;
      }

      verifyingTwoFactor.value = true;
      try {
        await userService.verifyTwoFactor(twoFactorData.value.code);
        showTwoFactorSetup.value = false;
        showSnackbar('Thiết lập xác thực 2 lớp thành công', 'success');
      } catch (error) {
        console.error('Error verifying two factor:', error);
        showSnackbar('Không thể xác thực mã', 'error');
      } finally {
        verifyingTwoFactor.value = false;
      }
    };

    const handleAvatarChange = (file) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          user.value.avatar = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const showSnackbar = (text, color = 'success') => {
      snackbar.value = {
        show: true,
        text,
        color
      };
    };

    onMounted(() => {
      fetchUserProfile();
    });

    return {
      profileForm,
      profileFormValid,
      passwordForm,
      passwordFormValid,
      settingsForm,
      settingsFormValid,
      updating,
      changingPassword,
      updatingSettings,
      verifyingTwoFactor,
      user,
      passwordData,
      accountSettings,
      showTwoFactorSetup,
      twoFactorData,
      avatarFile,
      snackbar,
      updateProfile,
      changePassword,
      updateSettings,
      handleTwoFactorChange,
      verifyTwoFactor,
      handleAvatarChange
    };
  }
};
</script>

<style scoped>
.profile {
  padding: 20px;
}
</style> 