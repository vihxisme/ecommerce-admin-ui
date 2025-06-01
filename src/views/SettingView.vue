<template>
  <div class="setting-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h1 class="text-h4">Cài đặt hệ thống</h1>
        </v-col>
      </v-row>

      <!-- Tabs điều hướng -->
      <v-tabs v-model="activeTab" color="primary" class="mb-6">
        <v-tab value="general">
          <v-icon start>mdi-cog</v-icon>
          Cài đặt chung
        </v-tab>
        <v-tab value="notification">
          <v-icon start>mdi-bell</v-icon>
          Thông báo
        </v-tab>
        <v-tab value="payment">
          <v-icon start>mdi-credit-card</v-icon>
          Thanh toán
        </v-tab>
        <v-tab value="shipping">
          <v-icon start>mdi-truck</v-icon>
          Vận chuyển
        </v-tab>
        <v-tab value="security">
          <v-icon start>mdi-shield</v-icon>
          Bảo mật
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Cài đặt chung -->
        <v-window-item value="general">
          <v-card>
            <v-card-text>
              <v-form ref="generalForm" v-model="forms.general.valid">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.storeName"
                      label="Tên cửa hàng"
                      :rules="[v => !!v || 'Vui lòng nhập tên cửa hàng']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.email"
                      label="Email liên hệ"
                      type="email"
                      :rules="[
                        v => !!v || 'Vui lòng nhập email',
                        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                      ]"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.phone"
                      label="Số điện thoại"
                      :rules="[v => !!v || 'Vui lòng nhập số điện thoại']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="settings.general.timezone"
                      :items="timezones"
                      label="Múi giờ"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="settings.general.address"
                      label="Địa chỉ"
                      rows="3"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Cài đặt thông báo -->
        <v-window-item value="notification">
          <v-card>
            <v-card-text>
              <v-form ref="notificationForm" v-model="forms.notification.valid">
                <v-row>
                  <v-col cols="12">
                    <v-switch
                      v-model="settings.notification.emailNotification"
                      label="Gửi thông báo qua email"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-switch
                      v-model="settings.notification.smsNotification"
                      label="Gửi thông báo qua SMS"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-switch
                      v-model="settings.notification.orderConfirmation"
                      label="Thông báo xác nhận đơn hàng"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-switch
                      v-model="settings.notification.orderShipping"
                      label="Thông báo trạng thái vận chuyển"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-switch
                      v-model="settings.notification.orderDelivered"
                      label="Thông báo giao hàng thành công"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Cài đặt thanh toán -->
        <v-window-item value="payment">
          <v-card>
            <v-card-text>
              <v-form ref="paymentForm" v-model="forms.payment.valid">
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">Phương thức thanh toán</h3>
                    <v-switch
                      v-model="settings.payment.cashOnDelivery"
                      label="Thanh toán khi nhận hàng (COD)"
                    />
                    <v-switch
                      v-model="settings.payment.bankTransfer"
                      label="Chuyển khoản ngân hàng"
                    />
                    <v-switch
                      v-model="settings.payment.creditCard"
                      label="Thẻ tín dụng"
                    />
                    <v-switch
                      v-model="settings.payment.eWallet"
                      label="Ví điện tử"
                    />
                  </v-col>
                  
                  <v-col cols="12" v-if="settings.payment.bankTransfer">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 mb-4">Thông tin tài khoản ngân hàng</h3>
                    <v-text-field
                      v-model="settings.payment.bankName"
                      label="Tên ngân hàng"
                    />
                    <v-text-field
                      v-model="settings.payment.bankAccount"
                      label="Số tài khoản"
                    />
                    <v-text-field
                      v-model="settings.payment.bankAccountName"
                      label="Tên chủ tài khoản"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Cài đặt vận chuyển -->
        <v-window-item value="shipping">
          <v-card>
            <v-card-text>
              <v-form ref="shippingForm" v-model="forms.shipping.valid">
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">Đơn vị vận chuyển</h3>
                    <v-checkbox
                      v-model="settings.shipping.providers"
                      label="Giao hàng nhanh"
                      value="ghn"
                    />
                    <v-checkbox
                      v-model="settings.shipping.providers"
                      label="Giao hàng tiết kiệm"
                      value="ghtk"
                    />
                    <v-checkbox
                      v-model="settings.shipping.providers"
                      label="Viettel Post"
                      value="viettel"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 mb-4">Cài đặt phí vận chuyển</h3>
                    <v-radio-group v-model="settings.shipping.feeType">
                      <v-radio label="Phí cố định" value="fixed" />
                      <v-radio label="Tính theo khoảng cách" value="distance" />
                      <v-radio label="Tính theo khối lượng" value="weight" />
                    </v-radio-group>

                    <v-text-field
                      v-if="settings.shipping.feeType === 'fixed'"
                      v-model.number="settings.shipping.fixedFee"
                      label="Phí vận chuyển cố định"
                      type="number"
                      suffix="VNĐ"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Cài đặt bảo mật -->
        <v-window-item value="security">
          <v-card>
            <v-card-text>
              <v-form ref="securityForm" v-model="forms.security.valid">
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">Cài đặt mật khẩu</h3>
                    <v-text-field
                      v-model="settings.security.minPasswordLength"
                      label="Độ dài tối thiểu của mật khẩu"
                      type="number"
                      min="6"
                    />
                    <v-switch
                      v-model="settings.security.requireSpecialChar"
                      label="Yêu cầu ký tự đặc biệt"
                    />
                    <v-switch
                      v-model="settings.security.requireNumber"
                      label="Yêu cầu chữ số"
                    />
                    <v-switch
                      v-model="settings.security.requireUppercase"
                      label="Yêu cầu chữ hoa"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 mb-4">Xác thực hai lớp</h3>
                    <v-switch
                      v-model="settings.security.twoFactorAuth"
                      label="Bật xác thực hai lớp"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 mb-4">Giới hạn đăng nhập</h3>
                    <v-text-field
                      v-model="settings.security.maxLoginAttempts"
                      label="Số lần đăng nhập thất bại tối đa"
                      type="number"
                      min="3"
                    />
                    <v-text-field
                      v-model="settings.security.lockoutDuration"
                      label="Thời gian khóa tài khoản (phút)"
                      type="number"
                      min="5"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>

      <!-- Nút lưu cài đặt -->
      <v-row class="mt-4">
        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveSettings"
          >
            <v-icon start>mdi-content-save</v-icon>
            Lưu cài đặt
          </v-btn>
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
    </v-container>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  name: 'SettingView',
  setup() {
    const activeTab = ref('general');
    const saving = ref(false);

    // Form refs
    const generalForm = ref(null);
    const notificationForm = ref(null);
    const paymentForm = ref(null);
    const shippingForm = ref(null);
    const securityForm = ref(null);

    // Form validation states
    const forms = reactive({
      general: { valid: true },
      notification: { valid: true },
      payment: { valid: true },
      shipping: { valid: true },
      security: { valid: true }
    });

    // Settings data
    const settings = reactive({
      general: {
        storeName: 'Shop Admin',
        email: 'admin@example.com',
        phone: '0123456789',
        timezone: 'Asia/Ho_Chi_Minh',
        address: ''
      },
      notification: {
        emailNotification: true,
        smsNotification: false,
        orderConfirmation: true,
        orderShipping: true,
        orderDelivered: true
      },
      payment: {
        cashOnDelivery: true,
        bankTransfer: true,
        creditCard: false,
        eWallet: false,
        bankName: '',
        bankAccount: '',
        bankAccountName: ''
      },
      shipping: {
        providers: ['ghn'],
        feeType: 'fixed',
        fixedFee: 30000
      },
      security: {
        minPasswordLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        requireUppercase: true,
        twoFactorAuth: false,
        maxLoginAttempts: 5,
        lockoutDuration: 30
      }
    });

    // Snackbar state
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Danh sách múi giờ
    const timezones = [
      'Asia/Ho_Chi_Minh',
      'Asia/Bangkok',
      'Asia/Singapore',
      'Asia/Tokyo'
    ];

    // Hàm lưu cài đặt
    const saveSettings = async () => {
      // Validate all forms
      const forms = [
        generalForm.value,
        notificationForm.value,
        paymentForm.value,
        shippingForm.value,
        securityForm.value
      ];

      const isValid = forms.every(form => !form || form.validate());
      if (!isValid) {
        showSnackbar('Vui lòng kiểm tra lại thông tin', 'error');
        return;
      }

      saving.value = true;
      try {
        // TODO: Call API to save settings
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSnackbar('Lưu cài đặt thành công');
      } catch (error) {
        console.error('Error saving settings:', error);
        showSnackbar('Không thể lưu cài đặt', 'error');
      } finally {
        saving.value = false;
      }
    };

    // Hàm hiển thị snackbar
    const showSnackbar = (text, color = 'success') => {
      snackbar.value = {
        show: true,
        text,
        color
      };
    };

    return {
      activeTab,
      saving,
      generalForm,
      notificationForm,
      paymentForm,
      shippingForm,
      securityForm,
      forms,
      settings,
      snackbar,
      timezones,
      saveSettings
    };
  }
};
</script>

<style scoped>
.setting-view {
  min-height: 100%;
}
</style> 