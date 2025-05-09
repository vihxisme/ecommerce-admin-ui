<template>
  <div class="settings">
    <v-card>
      <v-card-title>Cài đặt hệ thống</v-card-title>
      <v-card-text>
        <v-tabs v-model="activeTab">
          <v-tab value="general">Cài đặt chung</v-tab>
          <v-tab value="email">Cài đặt email</v-tab>
          <v-tab value="payment">Cài đặt thanh toán</v-tab>
          <v-tab value="notification">Cài đặt thông báo</v-tab>
          <v-tab value="security">Bảo mật</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Cài đặt chung -->
          <v-window-item value="general">
            <v-form ref="generalForm" v-model="generalFormValid">
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="generalSettings.siteName"
                      label="Tên website"
                      :rules="[v => !!v || 'Tên website là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="generalSettings.siteUrl"
                      label="URL website"
                      :rules="[v => !!v || 'URL website là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="generalSettings.contactEmail"
                      label="Email liên hệ"
                      :rules="[
                        v => !!v || 'Email liên hệ là bắt buộc',
                        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="generalSettings.contactPhone"
                      label="Số điện thoại liên hệ"
                      :rules="[v => !!v || 'Số điện thoại liên hệ là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="generalSettings.address"
                      label="Địa chỉ"
                      :rules="[v => !!v || 'Địa chỉ là bắt buộc']"
                      required
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="generalSettings.description"
                      label="Mô tả website"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-window-item>

          <!-- Cài đặt email -->
          <v-window-item value="email">
            <v-form ref="emailForm" v-model="emailFormValid">
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="emailSettings.smtpHost"
                      label="SMTP Host"
                      :rules="[v => !!v || 'SMTP Host là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="emailSettings.smtpPort"
                      label="SMTP Port"
                      type="number"
                      :rules="[v => !!v || 'SMTP Port là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="emailSettings.smtpUsername"
                      label="SMTP Username"
                      :rules="[v => !!v || 'SMTP Username là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="emailSettings.smtpPassword"
                      label="SMTP Password"
                      type="password"
                      :rules="[v => !!v || 'SMTP Password là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="emailSettings.fromEmail"
                      label="Email gửi"
                      :rules="[
                        v => !!v || 'Email gửi là bắt buộc',
                        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="emailSettings.fromName"
                      label="Tên người gửi"
                      :rules="[v => !!v || 'Tên người gửi là bắt buộc']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-btn color="primary" @click="testEmailSettings">
                      Kiểm tra cài đặt email
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-window-item>

          <!-- Cài đặt thanh toán -->
          <v-window-item value="payment">
            <v-form ref="paymentForm" v-model="paymentFormValid">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>VNPay</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.vnpay.tmnCode"
                              label="TMN Code"
                              :rules="[v => !!v || 'TMN Code là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.vnpay.hashSecret"
                              label="Hash Secret"
                              type="password"
                              :rules="[v => !!v || 'Hash Secret là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.vnpay.apiUrl"
                              label="API URL"
                              :rules="[v => !!v || 'API URL là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="paymentSettings.vnpay.enabled"
                              label="Kích hoạt"
                              color="primary"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>Momo</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.momo.partnerCode"
                              label="Partner Code"
                              :rules="[v => !!v || 'Partner Code là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.momo.accessKey"
                              label="Access Key"
                              :rules="[v => !!v || 'Access Key là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.momo.secretKey"
                              label="Secret Key"
                              type="password"
                              :rules="[v => !!v || 'Secret Key là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="paymentSettings.momo.apiUrl"
                              label="API URL"
                              :rules="[v => !!v || 'API URL là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="paymentSettings.momo.enabled"
                              label="Kích hoạt"
                              color="primary"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-window-item>

          <!-- Cài đặt thông báo -->
          <v-window-item value="notification">
            <v-form ref="notificationForm" v-model="notificationFormValid">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>Thông báo đơn hàng</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.order.newOrder"
                              label="Thông báo đơn hàng mới"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.order.orderStatus"
                              label="Thông báo thay đổi trạng thái đơn hàng"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.order.payment"
                              label="Thông báo thanh toán"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.order.refund"
                              label="Thông báo hoàn tiền"
                              color="primary"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>Thông báo sản phẩm</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.product.lowStock"
                              label="Thông báo sản phẩm sắp hết"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.product.outOfStock"
                              label="Thông báo sản phẩm hết hàng"
                              color="primary"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>Thông báo khách hàng</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.customer.newCustomer"
                              label="Thông báo khách hàng mới"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="notificationSettings.customer.login"
                              label="Thông báo đăng nhập"
                              color="primary"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-window-item>

          <!-- Bảo mật -->
          <v-window-item value="security">
            <v-form ref="securityForm" v-model="securityFormValid">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>Đăng nhập</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="securitySettings.login.requireCaptcha"
                              label="Yêu cầu CAPTCHA"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="securitySettings.login.requireTwoFactor"
                              label="Yêu cầu xác thực 2 lớp"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="securitySettings.login.maxAttempts"
                              label="Số lần đăng nhập tối đa"
                              type="number"
                              :rules="[v => !!v || 'Số lần đăng nhập tối đa là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="securitySettings.login.lockoutDuration"
                              label="Thời gian khóa (phút)"
                              type="number"
                              :rules="[v => !!v || 'Thời gian khóa là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card>
                      <v-card-title>Mật khẩu</v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="securitySettings.password.minLength"
                              label="Độ dài tối thiểu"
                              type="number"
                              :rules="[v => !!v || 'Độ dài tối thiểu là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="securitySettings.password.expiryDays"
                              label="Số ngày hết hạn"
                              type="number"
                              :rules="[v => !!v || 'Số ngày hết hạn là bắt buộc']"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="securitySettings.password.requireUppercase"
                              label="Yêu cầu chữ hoa"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="securitySettings.password.requireLowercase"
                              label="Yêu cầu chữ thường"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="securitySettings.password.requireNumbers"
                              label="Yêu cầu số"
                              color="primary"
                            ></v-switch>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="securitySettings.password.requireSpecialChars"
                              label="Yêu cầu ký tự đặc biệt"
                              color="primary"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="saveSettings" :loading="saving">
          Lưu cài đặt
        </v-btn>
      </v-card-actions>
    </v-card>

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
import { settingsService } from '@/api/services/settingsService';

export default {
  name: 'Settings',
  setup() {
    const activeTab = ref('general');
    const saving = ref(false);
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Form validation
    const generalForm = ref(null);
    const generalFormValid = ref(false);
    const emailForm = ref(null);
    const emailFormValid = ref(false);
    const paymentForm = ref(null);
    const paymentFormValid = ref(false);
    const notificationForm = ref(null);
    const notificationFormValid = ref(false);
    const securityForm = ref(null);
    const securityFormValid = ref(false);

    // Settings data
    const generalSettings = ref({
      siteName: '',
      siteUrl: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      description: ''
    });

    const emailSettings = ref({
      smtpHost: '',
      smtpPort: '',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: ''
    });

    const paymentSettings = ref({
      vnpay: {
        tmnCode: '',
        hashSecret: '',
        apiUrl: '',
        enabled: false
      },
      momo: {
        partnerCode: '',
        accessKey: '',
        secretKey: '',
        apiUrl: '',
        enabled: false
      }
    });

    const notificationSettings = ref({
      order: {
        newOrder: false,
        orderStatus: false,
        payment: false,
        refund: false
      },
      product: {
        lowStock: false,
        outOfStock: false
      },
      customer: {
        newCustomer: false,
        login: false
      }
    });

    const securitySettings = ref({
      login: {
        requireCaptcha: false,
        requireTwoFactor: false,
        maxAttempts: 5,
        lockoutDuration: 30
      },
      password: {
        minLength: 8,
        expiryDays: 90,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    });

    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        generalSettings.value = settings.general || generalSettings.value;
        emailSettings.value = settings.email || emailSettings.value;
        paymentSettings.value = settings.payment || paymentSettings.value;
        notificationSettings.value = settings.notification || notificationSettings.value;
        securitySettings.value = settings.security || securitySettings.value;
      } catch (error) {
        console.error('Error fetching settings:', error);
        showSnackbar('Không thể tải cài đặt', 'error');
      }
    };

    const saveSettings = async () => {
      // Validate form based on active tab
      let isValid = false;
      switch (activeTab.value) {
        case 'general':
          isValid = await generalForm.value.validate();
          break;
        case 'email':
          isValid = await emailForm.value.validate();
          break;
        case 'payment':
          isValid = await paymentForm.value.validate();
          break;
        case 'notification':
          isValid = await notificationForm.value.validate();
          break;
        case 'security':
          isValid = await securityForm.value.validate();
          break;
      }

      if (!isValid) {
        showSnackbar('Vui lòng kiểm tra lại thông tin', 'error');
        return;
      }

      saving.value = true;
      try {
        await settingsService.updateSettings({
          general: generalSettings.value,
          email: emailSettings.value,
          payment: paymentSettings.value,
          notification: notificationSettings.value,
          security: securitySettings.value
        });
        showSnackbar('Lưu cài đặt thành công', 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        showSnackbar('Không thể lưu cài đặt', 'error');
      } finally {
        saving.value = false;
      }
    };

    const testEmailSettings = async () => {
      try {
        await settingsService.testEmailSettings(emailSettings.value);
        showSnackbar('Gửi email kiểm tra thành công', 'success');
      } catch (error) {
        console.error('Error testing email settings:', error);
        showSnackbar('Không thể gửi email kiểm tra', 'error');
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
      fetchSettings();
    });

    return {
      activeTab,
      saving,
      snackbar,
      generalForm,
      generalFormValid,
      emailForm,
      emailFormValid,
      paymentForm,
      paymentFormValid,
      notificationForm,
      notificationFormValid,
      securityForm,
      securityFormValid,
      generalSettings,
      emailSettings,
      paymentSettings,
      notificationSettings,
      securitySettings,
      saveSettings,
      testEmailSettings
    };
  }
};
</script>

<style scoped>
.settings {
  padding: 20px;
}
</style> 