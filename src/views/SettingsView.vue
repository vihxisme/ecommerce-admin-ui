<template>
  <div class="settings-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h1 class="text-h4">Cài đặt hệ thống</h1>
        </v-col>
      </v-row>

      <!-- Tabs cài đặt -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-tabs v-model="activeTab" background-color="primary" dark grow>
              <v-tab value="general">
                <v-icon left>mdi-cog</v-icon>
                Cài đặt chung
              </v-tab>
              <v-tab value="email">
                <v-icon left>mdi-email</v-icon>
                Cài đặt email
              </v-tab>
              <v-tab value="payment">
                <v-icon left>mdi-credit-card</v-icon>
                Cài đặt thanh toán
              </v-tab>
              <v-tab value="security">
                <v-icon left>mdi-shield-lock</v-icon>
                Cài đặt bảo mật
              </v-tab>
            </v-tabs>

            <v-card-text>
              <!-- Cài đặt chung -->
              <v-window-item value="general">
                <v-form ref="generalForm" v-model="generalFormValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="generalSettings.siteName" label="Tên website"
                        :rules="[v => !!v || 'Vui lòng nhập tên website']" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="generalSettings.siteUrl" label="URL website" :rules="[
                        v => !!v || 'Vui lòng nhập URL website',
                        v => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) || 'URL không hợp lệ'
                      ]" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="generalSettings.contactEmail" label="Email liên hệ" :rules="[
                        v => !!v || 'Vui lòng nhập email liên hệ',
                        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                      ]" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="generalSettings.contactPhone" label="Số điện thoại liên hệ" :rules="[
                        v => !!v || 'Vui lòng nhập số điện thoại',
                        v => /^[0-9]{10,11}$/.test(v) || 'Số điện thoại không hợp lệ'
                      ]" required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea v-model="generalSettings.address" label="Địa chỉ"
                        :rules="[v => !!v || 'Vui lòng nhập địa chỉ']" required></v-textarea>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea v-model="generalSettings.description" label="Mô tả website"
                        :rules="[v => !!v || 'Vui lòng nhập mô tả website']" required></v-textarea>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="generalSettings.timezone" :items="timezoneOptions" label="Múi giờ"
                        :rules="[v => !!v || 'Vui lòng chọn múi giờ']" required></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="generalSettings.dateFormat" :items="dateFormatOptions"
                        label="Định dạng ngày tháng" :rules="[v => !!v || 'Vui lòng chọn định dạng ngày tháng']"
                        required></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="generalSettings.currency" :items="currencyOptions" label="Tiền tệ"
                        :rules="[v => !!v || 'Vui lòng chọn tiền tệ']" required></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="generalSettings.language" :items="languageOptions" label="Ngôn ngữ"
                        :rules="[v => !!v || 'Vui lòng chọn ngôn ngữ']" required></v-select>
                    </v-col>
                  </v-row>
                </v-form>
              </v-window-item>

              <!-- Cài đặt email -->
              <v-window-item value="email">
                <v-form ref="emailForm" v-model="emailFormValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="emailSettings.smtpHost" label="SMTP Host"
                        :rules="[v => !!v || 'Vui lòng nhập SMTP Host']" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="emailSettings.smtpPort" label="SMTP Port" type="number" :rules="[
                        v => !!v || 'Vui lòng nhập SMTP Port',
                        v => v > 0 || 'Port phải lớn hơn 0'
                      ]" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="emailSettings.smtpUsername" label="SMTP Username"
                        :rules="[v => !!v || 'Vui lòng nhập SMTP Username']" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="emailSettings.smtpPassword" label="SMTP Password" type="password"
                        :rules="[v => !!v || 'Vui lòng nhập SMTP Password']" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="emailSettings.fromEmail" label="Email gửi" :rules="[
                        v => !!v || 'Vui lòng nhập email gửi',
                        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                      ]" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="emailSettings.fromName" label="Tên người gửi"
                        :rules="[v => !!v || 'Vui lòng nhập tên người gửi']" required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-switch v-model="emailSettings.enableSsl" label="Bật SSL/TLS" color="primary"></v-switch>
                    </v-col>
                    <v-col cols="12">
                      <v-btn color="primary" @click="testEmailSettings" :loading="testingEmail">
                        Kiểm tra cài đặt email
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-window-item>

              <!-- Cài đặt thanh toán -->
              <v-window-item value="payment">
                <v-form ref="paymentForm" v-model="paymentFormValid">
                  <!-- VNPay -->
                  <v-card class="mb-4">
                    <v-card-title>VNPay</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.vnpay.tmnCode" label="TMN Code"
                            :rules="[v => !!v || 'Vui lòng nhập TMN Code']" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.vnpay.hashSecret" label="Hash Secret" type="password"
                            :rules="[v => !!v || 'Vui lòng nhập Hash Secret']" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.vnpay.apiUrl" label="API URL"
                            :rules="[v => !!v || 'Vui lòng nhập API URL']" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-switch v-model="paymentSettings.vnpay.enabled" label="Bật thanh toán qua VNPay"
                            color="primary"></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- Momo -->
                  <v-card class="mb-4">
                    <v-card-title>Momo</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.momo.partnerCode" label="Partner Code"
                            :rules="[v => !!v || 'Vui lòng nhập Partner Code']" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.momo.accessKey" label="Access Key"
                            :rules="[v => !!v || 'Vui lòng nhập Access Key']" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.momo.secretKey" label="Secret Key" type="password"
                            :rules="[v => !!v || 'Vui lòng nhập Secret Key']" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.momo.apiUrl" label="API URL"
                            :rules="[v => !!v || 'Vui lòng nhập API URL']" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-switch v-model="paymentSettings.momo.enabled" label="Bật thanh toán qua Momo"
                            color="primary"></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- COD -->
                  <v-card>
                    <v-card-title>Thanh toán khi nhận hàng (COD)</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-switch v-model="paymentSettings.cod.enabled" label="Bật thanh toán khi nhận hàng"
                            color="primary"></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.cod.minAmount" label="Số tiền tối thiểu" type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập số tiền tối thiểu',
                              v => v >= 0 || 'Số tiền phải lớn hơn hoặc bằng 0'
                            ]" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="paymentSettings.cod.maxAmount" label="Số tiền tối đa" type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập số tiền tối đa',
                              v => v >= 0 || 'Số tiền phải lớn hơn hoặc bằng 0'
                            ]" required></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-form>
              </v-window-item>

              <!-- Cài đặt bảo mật -->
              <v-window-item value="security">
                <v-form ref="securityForm" v-model="securityFormValid">
                  <v-row>
                    <v-col cols="12">
                      <v-card class="mb-4">
                        <v-card-title>Xác thực hai yếu tố</v-card-title>
                        <v-card-text>
                          <v-switch v-model="securitySettings.twoFactor.enabled" label="Bật xác thực hai yếu tố"
                            color="primary"></v-switch>
                          <v-select v-model="securitySettings.twoFactor.method" :items="twoFactorMethods"
                            label="Phương thức xác thực" :disabled="!securitySettings.twoFactor.enabled"></v-select>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12">
                      <v-card class="mb-4">
                        <v-card-title>Chính sách mật khẩu</v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" md="6">
                              <v-text-field v-model="securitySettings.password.minLength" label="Độ dài tối thiểu"
                                type="number" :rules="[
                                  v => !!v || 'Vui lòng nhập độ dài tối thiểu',
                                  v => v >= 6 || 'Độ dài tối thiểu phải lớn hơn hoặc bằng 6'
                                ]" required></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field v-model="securitySettings.password.maxLength" label="Độ dài tối đa"
                                type="number" :rules="[
                                  v => !!v || 'Vui lòng nhập độ dài tối đa',
                                  v => v >= securitySettings.password.minLength || 'Độ dài tối đa phải lớn hơn độ dài tối thiểu'
                                ]" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                              <v-checkbox v-model="securitySettings.password.requireUppercase"
                                label="Yêu cầu chữ hoa"></v-checkbox>
                            </v-col>
                            <v-col cols="12">
                              <v-checkbox v-model="securitySettings.password.requireLowercase"
                                label="Yêu cầu chữ thường"></v-checkbox>
                            </v-col>
                            <v-col cols="12">
                              <v-checkbox v-model="securitySettings.password.requireNumbers"
                                label="Yêu cầu số"></v-checkbox>
                            </v-col>
                            <v-col cols="12">
                              <v-checkbox v-model="securitySettings.password.requireSpecialChars"
                                label="Yêu cầu ký tự đặc biệt"></v-checkbox>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12">
                      <v-card>
                        <v-card-title>Phiên đăng nhập</v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12" md="6">
                              <v-text-field v-model="securitySettings.session.timeout" label="Thời gian timeout (phút)"
                                type="number" :rules="[
                                  v => !!v || 'Vui lòng nhập thời gian timeout',
                                  v => v > 0 || 'Thời gian timeout phải lớn hơn 0'
                                ]" required></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-text-field v-model="securitySettings.session.maxConcurrent"
                                label="Số phiên đăng nhập tối đa" type="number" :rules="[
                                  v => !!v || 'Vui lòng nhập số phiên tối đa',
                                  v => v > 0 || 'Số phiên tối đa phải lớn hơn 0'
                                ]" required></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-form>
              </v-window-item>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="saveSettings" :loading="saving">
                Lưu cài đặt
              </v-btn>
            </v-card-actions>
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
    </v-container>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
// import { settingsService } from '@/api/services/settingsService';

export default {
  name: 'SettingsView',
  setup() {
    // Dữ liệu
    const activeTab = ref('general');
    const saving = ref(false);
    const testingEmail = ref(false);

    // Form refs
    const generalForm = ref(null);
    const emailForm = ref(null);
    const paymentForm = ref(null);
    const securityForm = ref(null);

    // Form validation
    const generalFormValid = ref(false);
    const emailFormValid = ref(false);
    const paymentFormValid = ref(false);
    const securityFormValid = ref(false);

    // Tùy chọn
    const timezoneOptions = [
      { text: 'Asia/Ho_Chi_Minh (GMT+7)', value: 'Asia/Ho_Chi_Minh' },
      { text: 'Asia/Bangkok (GMT+7)', value: 'Asia/Bangkok' },
      { text: 'Asia/Singapore (GMT+8)', value: 'Asia/Singapore' },
      { text: 'Asia/Tokyo (GMT+9)', value: 'Asia/Tokyo' }
    ];

    const dateFormatOptions = [
      { text: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
      { text: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
      { text: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
    ];

    const currencyOptions = [
      { text: 'VND (₫)', value: 'VND' },
      { text: 'USD ($)', value: 'USD' },
      { text: 'EUR (€)', value: 'EUR' }
    ];

    const languageOptions = [
      { text: 'Tiếng Việt', value: 'vi' },
      { text: 'English', value: 'en' }
    ];

    const twoFactorMethods = [
      { text: 'SMS', value: 'sms' },
      { text: 'Email', value: 'email' },
      { text: 'Google Authenticator', value: 'google' }
    ];

    // Cài đặt chung
    const generalSettings = reactive({
      siteName: '',
      siteUrl: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      description: '',
      timezone: 'Asia/Ho_Chi_Minh',
      dateFormat: 'DD/MM/YYYY',
      currency: 'VND',
      language: 'vi'
    });

    // Cài đặt email
    const emailSettings = reactive({
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enableSsl: true
    });

    // Cài đặt thanh toán
    const paymentSettings = reactive({
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
      },
      cod: {
        enabled: true,
        minAmount: 0,
        maxAmount: 10000000
      }
    });

    // Cài đặt bảo mật
    const securitySettings = reactive({
      twoFactor: {
        enabled: false,
        method: 'sms'
      },
      password: {
        minLength: 8,
        maxLength: 32,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      session: {
        timeout: 30,
        maxConcurrent: 3
      }
    });

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Hàm lấy cài đặt
    const fetchSettings = async () => {
      try {
        // const response = await settingsService.getSettings();

        // // Cập nhật cài đặt chung
        // Object.assign(generalSettings, response.general);

        // // Cập nhật cài đặt email
        // Object.assign(emailSettings, response.email);

        // // Cập nhật cài đặt thanh toán
        // Object.assign(paymentSettings, response.payment);

        // // Cập nhật cài đặt bảo mật
        // Object.assign(securitySettings, response.security);

      } catch (error) {
        console.error('Error fetching settings:', error);
        showSnackbar('Không thể tải cài đặt', 'error');
      }
    };

    // Hàm lưu cài đặt
    const saveSettings = async () => {
      // Kiểm tra form hiện tại
      let currentForm = null;
      let currentFormValid = false;

      switch (activeTab.value) {
        case 'general':
          currentForm = generalForm.value;
          currentFormValid = generalFormValid.value;
          break;
        case 'email':
          currentForm = emailForm.value;
          currentFormValid = emailFormValid.value;
          break;
        case 'payment':
          currentForm = paymentForm.value;
          currentFormValid = paymentFormValid.value;
          break;
        case 'security':
          currentForm = securityForm.value;
          currentFormValid = securityFormValid.value;
          break;
      }

      if (!currentFormValid) {
        currentForm.validate();
        return;
      }

      saving.value = true;
      try {
        // await settingsService.updateSettings({
        //   general: generalSettings,
        //   email: emailSettings,
        //   payment: paymentSettings,
        //   security: securitySettings
        // });

        showSnackbar('Lưu cài đặt thành công', 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        showSnackbar('Không thể lưu cài đặt', 'error');
      } finally {
        saving.value = false;
      }
    };

    // Hàm kiểm tra cài đặt email
    const testEmailSettings = async () => {
      if (!emailFormValid.value) {
        emailForm.value.validate();
        return;
      }

      testingEmail.value = true;
      try {
        // await settingsService.testEmailSettings(emailSettings);
        showSnackbar('Gửi email kiểm tra thành công', 'success');
      } catch (error) {
        console.error('Error testing email settings:', error);
        showSnackbar('Không thể gửi email kiểm tra', 'error');
      } finally {
        testingEmail.value = false;
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

    onMounted(() => {
      fetchSettings();
    });

    return {
      activeTab,
      saving,
      testingEmail,
      generalForm,
      emailForm,
      paymentForm,
      securityForm,
      generalFormValid,
      emailFormValid,
      paymentFormValid,
      securityFormValid,
      timezoneOptions,
      dateFormatOptions,
      currencyOptions,
      languageOptions,
      twoFactorMethods,
      generalSettings,
      emailSettings,
      paymentSettings,
      securitySettings,
      snackbar,
      saveSettings,
      testEmailSettings
    };
  }
};
</script>

<style scoped>
.settings-view {
  padding: 20px;
}
</style>