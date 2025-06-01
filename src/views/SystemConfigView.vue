<template>
  <div class="system-config-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h1 class="text-h4">Cấu hình hệ thống</h1>
        </v-col>
      </v-row>

      <!-- Tabs cấu hình -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-tabs v-model="activeTab" background-color="primary" dark>
              <v-tab>
                <v-icon left>mdi-cog</v-icon>
                Cài đặt chung
              </v-tab>
              <v-tab>
                <v-icon left>mdi-email</v-icon>
                Cài đặt email
              </v-tab>
              <v-tab>
                <v-icon left>mdi-credit-card</v-icon>
                Cài đặt thanh toán
              </v-tab>
              <v-tab>
                <v-icon left>mdi-shield-lock</v-icon>
                Cài đặt bảo mật
              </v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
              <!-- Tab cài đặt chung -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form ref="generalForm" v-model="generalFormValid">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="generalConfig.siteName"
                            label="Tên website"
                            :rules="[v => !!v || 'Vui lòng nhập tên website']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="generalConfig.siteUrl"
                            label="URL website"
                            :rules="[
                              v => !!v || 'Vui lòng nhập URL website',
                              v => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) || 'URL không hợp lệ'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="generalConfig.contactEmail"
                            label="Email liên hệ"
                            :rules="[
                              v => !!v || 'Vui lòng nhập email liên hệ',
                              v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="generalConfig.contactPhone"
                            label="Số điện thoại liên hệ"
                            :rules="[
                              v => !!v || 'Vui lòng nhập số điện thoại liên hệ',
                              v => /^[0-9]{10}$/.test(v) || 'Số điện thoại không hợp lệ'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="generalConfig.address"
                            label="Địa chỉ"
                            :rules="[v => !!v || 'Vui lòng nhập địa chỉ']"
                            required
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="generalConfig.description"
                            label="Mô tả website"
                            rows="3"
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="generalConfig.timezone"
                            :items="timezones"
                            label="Múi giờ"
                            :rules="[v => !!v || 'Vui lòng chọn múi giờ']"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="generalConfig.dateFormat"
                            :items="dateFormats"
                            label="Định dạng ngày tháng"
                            :rules="[v => !!v || 'Vui lòng chọn định dạng ngày tháng']"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="generalConfig.currency"
                            :items="currencies"
                            label="Đơn vị tiền tệ"
                            :rules="[v => !!v || 'Vui lòng chọn đơn vị tiền tệ']"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="generalConfig.language"
                            :items="languages"
                            label="Ngôn ngữ mặc định"
                            :rules="[v => !!v || 'Vui lòng chọn ngôn ngữ mặc định']"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12">
                          <v-file-input
                            v-model="generalConfig.logo"
                            label="Logo website"
                            accept="image/*"
                            prepend-icon="mdi-camera"
                            @change="handleLogoChange"
                          ></v-file-input>
                        </v-col>
                        <v-col cols="12">
                          <v-file-input
                            v-model="generalConfig.favicon"
                            label="Favicon"
                            accept="image/*"
                            prepend-icon="mdi-image"
                            @change="handleFaviconChange"
                          ></v-file-input>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Tab cài đặt email -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form ref="emailForm" v-model="emailFormValid">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="emailConfig.smtpHost"
                            label="SMTP Host"
                            :rules="[v => !!v || 'Vui lòng nhập SMTP Host']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="emailConfig.smtpPort"
                            label="SMTP Port"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập SMTP Port',
                              v => v > 0 || 'Port phải lớn hơn 0'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="emailConfig.smtpUsername"
                            label="SMTP Username"
                            :rules="[v => !!v || 'Vui lòng nhập SMTP Username']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="emailConfig.smtpPassword"
                            label="SMTP Password"
                            type="password"
                            :rules="[v => !!v || 'Vui lòng nhập SMTP Password']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="emailConfig.senderEmail"
                            label="Email người gửi"
                            :rules="[
                              v => !!v || 'Vui lòng nhập email người gửi',
                              v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="emailConfig.senderName"
                            label="Tên người gửi"
                            :rules="[v => !!v || 'Vui lòng nhập tên người gửi']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-switch
                            v-model="emailConfig.enableSsl"
                            label="Bật SSL/TLS"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12">
                          <v-btn
                            color="primary"
                            @click="testEmailConfig"
                            :loading="testingEmail"
                          >
                            Kiểm tra cấu hình email
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Tab cài đặt thanh toán -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form ref="paymentForm" v-model="paymentFormValid">
                      <!-- Cấu hình VNPay -->
                      <div class="text-h6 mb-4">Cấu hình VNPay</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.vnpay.merchantId"
                            label="Merchant ID"
                            :rules="[v => !!v || 'Vui lòng nhập Merchant ID']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.vnpay.secretKey"
                            label="Secret Key"
                            type="password"
                            :rules="[v => !!v || 'Vui lòng nhập Secret Key']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.vnpay.apiUrl"
                            label="API URL"
                            :rules="[
                              v => !!v || 'Vui lòng nhập API URL',
                              v => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) || 'URL không hợp lệ'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="paymentConfig.vnpay.enabled"
                            label="Bật thanh toán qua VNPay"
                            color="primary"
                          ></v-switch>
                        </v-col>
                      </v-row>

                      <!-- Cấu hình Momo -->
                      <div class="text-h6 mb-4 mt-6">Cấu hình Momo</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.momo.partnerCode"
                            label="Partner Code"
                            :rules="[v => !!v || 'Vui lòng nhập Partner Code']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.momo.secretKey"
                            label="Secret Key"
                            type="password"
                            :rules="[v => !!v || 'Vui lòng nhập Secret Key']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.momo.apiUrl"
                            label="API URL"
                            :rules="[
                              v => !!v || 'Vui lòng nhập API URL',
                              v => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) || 'URL không hợp lệ'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="paymentConfig.momo.enabled"
                            label="Bật thanh toán qua Momo"
                            color="primary"
                          ></v-switch>
                        </v-col>
                      </v-row>

                      <!-- Cấu hình COD -->
                      <div class="text-h6 mb-4 mt-6">Cấu hình COD</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.cod.minOrderAmount"
                            label="Giá trị đơn hàng tối thiểu"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập giá trị đơn hàng tối thiểu',
                              v => v >= 0 || 'Giá trị phải lớn hơn hoặc bằng 0'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.cod.maxOrderAmount"
                            label="Giá trị đơn hàng tối đa"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập giá trị đơn hàng tối đa',
                              v => v >= 0 || 'Giá trị phải lớn hơn hoặc bằng 0',
                              v => v >= paymentConfig.cod.minOrderAmount || 'Giá trị tối đa phải lớn hơn hoặc bằng giá trị tối thiểu'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="paymentConfig.cod.enabled"
                            label="Bật thanh toán khi nhận hàng (COD)"
                            color="primary"
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Tab cài đặt bảo mật -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-form ref="securityForm" v-model="securityFormValid">
                      <!-- Xác thực hai yếu tố -->
                      <div class="text-h6 mb-4">Xác thực hai yếu tố</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="securityConfig.twoFactor.enabled"
                            label="Bật xác thực hai yếu tố"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="securityConfig.twoFactor.method"
                            :items="twoFactorMethods"
                            label="Phương thức xác thực"
                            :disabled="!securityConfig.twoFactor.enabled"
                            :rules="[v => !!v || 'Vui lòng chọn phương thức xác thực']"
                            required
                          ></v-select>
                        </v-col>
                      </v-row>

                      <!-- Chính sách mật khẩu -->
                      <div class="text-h6 mb-4 mt-6">Chính sách mật khẩu</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="securityConfig.passwordPolicy.minLength"
                            label="Độ dài tối thiểu"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập độ dài tối thiểu',
                              v => v >= 6 || 'Độ dài tối thiểu phải lớn hơn hoặc bằng 6'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="securityConfig.passwordPolicy.maxLength"
                            label="Độ dài tối đa"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập độ dài tối đa',
                              v => v >= securityConfig.passwordPolicy.minLength || 'Độ dài tối đa phải lớn hơn hoặc bằng độ dài tối thiểu'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="securityConfig.passwordPolicy.requireUppercase"
                            label="Yêu cầu chữ hoa"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="securityConfig.passwordPolicy.requireLowercase"
                            label="Yêu cầu chữ thường"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="securityConfig.passwordPolicy.requireNumbers"
                            label="Yêu cầu số"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="securityConfig.passwordPolicy.requireSpecialChars"
                            label="Yêu cầu ký tự đặc biệt"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="securityConfig.passwordPolicy.expiryDays"
                            label="Số ngày hết hạn mật khẩu"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập số ngày hết hạn mật khẩu',
                              v => v >= 0 || 'Số ngày phải lớn hơn hoặc bằng 0'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <!-- Quản lý phiên đăng nhập -->
                      <div class="text-h6 mb-4 mt-6">Quản lý phiên đăng nhập</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="securityConfig.session.timeout"
                            label="Thời gian chờ (phút)"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập thời gian chờ',
                              v => v > 0 || 'Thời gian chờ phải lớn hơn 0'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="securityConfig.session.allowMultipleDevices"
                            label="Cho phép đăng nhập nhiều thiết bị"
                            color="primary"
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="securityConfig.session.maxConcurrentSessions"
                            label="Số phiên đăng nhập tối đa"
                            type="number"
                            :rules="[
                              v => !!v || 'Vui lòng nhập số phiên đăng nhập tối đa',
                              v => v > 0 || 'Số phiên đăng nhập tối đa phải lớn hơn 0'
                            ]"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="saveConfig"
                :loading="saving"
                :disabled="!isFormValid"
              >
                Lưu cấu hình
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
import { ref, reactive, computed, onMounted } from 'vue';
import { systemConfigService } from '@/api/services/systemConfigService';
import { formatCurrency } from '@/utils/formatters';

export default {
  name: 'SystemConfigView',
  setup() {
    const activeTab = ref(0);
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

    // Computed
    const isFormValid = computed(() => {
      switch (activeTab.value) {
        case 0:
          return generalFormValid.value;
        case 1:
          return emailFormValid.value;
        case 2:
          return paymentFormValid.value;
        case 3:
          return securityFormValid.value;
        default:
          return false;
      }
    });

    // Config data
    const generalConfig = reactive({
      siteName: '',
      siteUrl: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      description: '',
      timezone: 'Asia/Ho_Chi_Minh',
      dateFormat: 'DD/MM/YYYY',
      currency: 'VND',
      language: 'vi',
      logo: null,
      favicon: null
    });

    const emailConfig = reactive({
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      senderEmail: '',
      senderName: '',
      enableSsl: true
    });

    const paymentConfig = reactive({
      vnpay: {
        merchantId: '',
        secretKey: '',
        apiUrl: '',
        enabled: false
      },
      momo: {
        partnerCode: '',
        secretKey: '',
        apiUrl: '',
        enabled: false
      },
      cod: {
        minOrderAmount: 0,
        maxOrderAmount: 0,
        enabled: true
      }
    });

    const securityConfig = reactive({
      twoFactor: {
        enabled: false,
        method: 'APP'
      },
      passwordPolicy: {
        minLength: 8,
        maxLength: 32,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      session: {
        timeout: 30,
        allowMultipleDevices: false,
        maxConcurrentSessions: 1
      }
    });

    // Options
    const timezones = [
      { text: 'Hà Nội (GMT+7)', value: 'Asia/Ho_Chi_Minh' },
      { text: 'Bangkok (GMT+7)', value: 'Asia/Bangkok' },
      { text: 'Singapore (GMT+8)', value: 'Asia/Singapore' },
      { text: 'Tokyo (GMT+9)', value: 'Asia/Tokyo' },
      { text: 'Seoul (GMT+9)', value: 'Asia/Seoul' },
      { text: 'Dubai (GMT+4)', value: 'Asia/Dubai' },
      { text: 'London (GMT+0)', value: 'Europe/London' },
      { text: 'New York (GMT-5)', value: 'America/New_York' }
    ];

    const dateFormats = [
      { text: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
      { text: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
      { text: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
    ];

    const currencies = [
      { text: 'Việt Nam Đồng (VND)', value: 'VND' },
      { text: 'US Dollar (USD)', value: 'USD' },
      { text: 'Euro (EUR)', value: 'EUR' },
      { text: 'British Pound (GBP)', value: 'GBP' },
      { text: 'Japanese Yen (JPY)', value: 'JPY' },
      { text: 'Korean Won (KRW)', value: 'KRW' },
      { text: 'Singapore Dollar (SGD)', value: 'SGD' },
      { text: 'Thai Baht (THB)', value: 'THB' }
    ];

    const languages = [
      { text: 'Tiếng Việt', value: 'vi' },
      { text: 'English', value: 'en' },
      { text: '日本語', value: 'ja' },
      { text: '한국어', value: 'ko' },
      { text: '中文', value: 'zh' }
    ];

    const twoFactorMethods = [
      { text: 'Ứng dụng xác thực', value: 'APP' },
      { text: 'SMS', value: 'SMS' },
      { text: 'Email', value: 'EMAIL' }
    ];

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Hàm lấy cấu hình hệ thống
    const fetchConfig = async () => {
      try {
        const response = await systemConfigService.getConfig();
        
        // Cập nhật cấu hình chung
        Object.assign(generalConfig, response.general);
        
        // Cập nhật cấu hình email
        Object.assign(emailConfig, response.email);
        
        // Cập nhật cấu hình thanh toán
        Object.assign(paymentConfig, response.payment);
        
        // Cập nhật cấu hình bảo mật
        Object.assign(securityConfig, response.security);
      } catch (error) {
        console.error('Error fetching system config:', error);
        showSnackbar('Không thể tải cấu hình hệ thống', 'error');
      }
    };

    // Hàm lưu cấu hình hệ thống
    const saveConfig = async () => {
      // Kiểm tra form hiện tại
      let currentForm;
      switch (activeTab.value) {
        case 0:
          currentForm = generalForm.value;
          break;
        case 1:
          currentForm = emailForm.value;
          break;
        case 2:
          currentForm = paymentForm.value;
          break;
        case 3:
          currentForm = securityForm.value;
          break;
      }

      if (!currentForm.validate()) {
        return;
      }

      saving.value = true;
      try {
        const config = {
          general: generalConfig,
          email: emailConfig,
          payment: paymentConfig,
          security: securityConfig
        };

        await systemConfigService.updateConfig(config);
        showSnackbar('Lưu cấu hình thành công', 'success');
      } catch (error) {
        console.error('Error saving system config:', error);
        showSnackbar('Không thể lưu cấu hình hệ thống', 'error');
      } finally {
        saving.value = false;
      }
    };

    // Hàm kiểm tra cấu hình email
    const testEmailConfig = async () => {
      if (!emailForm.value.validate()) {
        return;
      }

      testingEmail.value = true;
      try {
        await systemConfigService.testEmailConfig(emailConfig);
        showSnackbar('Kiểm tra cấu hình email thành công', 'success');
      } catch (error) {
        console.error('Error testing email config:', error);
        showSnackbar('Không thể kiểm tra cấu hình email', 'error');
      } finally {
        testingEmail.value = false;
      }
    };

    // Hàm xử lý thay đổi logo
    const handleLogoChange = (file) => {
      if (file) {
        // TODO: Upload logo to server
        console.log('Logo changed:', file);
      }
    };

    // Hàm xử lý thay đổi favicon
    const handleFaviconChange = (file) => {
      if (file) {
        // TODO: Upload favicon to server
        console.log('Favicon changed:', file);
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

    // Lifecycle hooks
    onMounted(() => {
      fetchConfig();
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
      isFormValid,
      generalConfig,
      emailConfig,
      paymentConfig,
      securityConfig,
      timezones,
      dateFormats,
      currencies,
      languages,
      twoFactorMethods,
      snackbar,
      saveConfig,
      testEmailConfig,
      handleLogoChange,
      handleFaviconChange
    };
  }
};
</script>

<style scoped>
.system-config-view {
  padding: 20px;
}
</style> 