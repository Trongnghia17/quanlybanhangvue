<template>
  <div class="register-page">
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="8" lg="6" xl="5">
          <v-card class="rounded-lg elevation-12">
            <!-- Header Section -->
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title class="text-h5 font-weight-medium">
                <v-icon left>{{ showOTPForm ? 'mdi-shield-key' : 'mdi-account-plus' }}</v-icon>
                {{ showOTPForm ? 'Xác thực OTP' : 'Tạo tài khoản mới' }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <v-card-text class="pa-5">
              <!-- Registration Form -->
              <div v-if="!showOTPForm">
                <p class="text-subtitle-1 grey--text text--darken-1 mb-4">
                  Quản lý bán hàng hiệu quả với RetailEase
                </p>

                <v-form ref="form" v-model="valid" @submit.prevent="register">
                  <v-slide-y-transition>
                    <v-alert
                      v-if="error"
                      type="error"
                      dismissible
                      border="left"
                      colored-border
                      elevation="2"
                      class="mb-4"
                    >
                      <v-icon left>mdi-alert-circle</v-icon>
                      {{ error }}
                    </v-alert>
                  </v-slide-y-transition>

                  <!-- Name Field -->
                  <v-text-field
                    v-model="name"
                    :rules="nameRules"
                    label="Họ và tên"
                    prepend-icon="mdi-account"
                    outlined
                    dense
                    counter="255"
                    required
                    autocomplete="name"
                    validate-on-blur
                    color="primary"
                    :error-messages="errors.name"
                  ></v-text-field>

                  <!-- Email Field -->
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    label="Email"
                    prepend-icon="mdi-email-outline"
                    outlined
                    dense
                    counter="50"
                    required
                    autocomplete="email"
                    validate-on-blur
                    color="primary"
                    :error-messages="errors.email"
                  ></v-text-field>

                  <!-- Phone Field -->
                  <v-text-field
                    v-model="phone"
                    :rules="phoneRules"
                    label="Số điện thoại (không bắt buộc)"
                    prepend-icon="mdi-phone"
                    outlined
                    dense
                    autocomplete="tel"
                    validate-on-blur
                    color="primary"
                    :error-messages="errors.phone"
                  ></v-text-field>

                  <!-- Password Field -->
                  <v-text-field
                    v-model="password"
                    :rules="passwordRules"
                    :type="showPassword ? 'text' : 'password'"
                    label="Mật khẩu"
                    prepend-icon="mdi-lock"
                    outlined
                    dense
                    required
                    validate-on-blur
                    color="primary"
                    :error-messages="errors.password"
                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showPassword = !showPassword"
                    autocomplete="new-password"
                  ></v-text-field>

                  <div class="password-strength mb-3" v-if="password">
                    <v-progress-linear
                      :value="passwordStrength"
                      height="5"
                      :color="passwordStrengthColor"
                      class="mb-1"
                    ></v-progress-linear>
                    <span class="caption" :class="passwordStrengthTextColor">
                      {{ passwordStrengthText }}
                    </span>
                  </div>

                  <!-- Confirm Password Field -->
                  <v-text-field
                    v-model="confirmPassword"
                    :rules="confirmPasswordRules"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    label="Xác nhận mật khẩu"
                    prepend-icon="mdi-shield-check"
                    outlined
                    dense
                    required
                    validate-on-blur
                    color="primary"
                    :error-messages="errors.confirmPassword"
                    :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append="showConfirmPassword = !showConfirmPassword"
                    autocomplete="new-password"
                  ></v-text-field>

                  <!-- Terms Checkbox -->
                  <v-checkbox
                    v-model="agreeToTerms"
                    :rules="termsRules"
                    color="primary"
                    class="mt-0"
                    :error-messages="errors.terms"
                  >
                    <template v-slot:label>
                      <div>
                        Tôi đồng ý với
                        <a href="#" @click.stop.prevent="showTerms" class="primary--text text-decoration-none font-weight-medium">Điều khoản dịch vụ</a>
                        và
                        <a href="#" @click.stop.prevent="showPrivacyPolicy" class="primary--text text-decoration-none font-weight-medium">Chính sách bảo mật</a>
                      </div>
                    </template>
                  </v-checkbox>

                  <!-- Submit Button -->
                  <v-btn
                    color="primary"
                    block
                    large
                    type="submit"
                    :loading="loading"
                    :disabled="!valid || loading || !agreeToTerms"
                    class="mt-4"
                    elevation="2"
                  >
                    <v-icon left>mdi-account-plus</v-icon>
                    Đăng ký ngay
                  </v-btn>
                </v-form>

                <div class="text-center mt-5">
                  <span class="grey--text text--darken-1">Đã có tài khoản?</span>
                  <v-btn text color="primary" @click="navigateToLogin" class="ml-1 text-none">
                    <v-icon small left>mdi-login</v-icon>
                    Đăng nhập
                  </v-btn>
                </div>
              </div>

              <!-- OTP Verification Form -->
              <div v-else>
                <div class="text-center mb-4">
                  <v-icon color="primary" size="64">mdi-shield-key</v-icon>
                  <h1 class="text-h6 font-weight-bold mt-3 mb-2">Xác thực tài khoản</h1>
                  <p class="text-subtitle-2 grey--text text--darken-1">
                    Mã OTP đã được gửi đến email <strong>{{ userEmail }}</strong>
                  </p>
                  <p class="text-caption grey--text">
                    Vui lòng kiểm tra hộp thư và nhập mã OTP để hoàn tất đăng ký
                  </p>
                </div>

                <v-form ref="otpForm" v-model="otpValid" @submit.prevent="confirmOTP" lazy-validation>
                  <v-slide-y-transition>
                    <v-alert
                      v-if="error"
                      type="error"
                      dismissible
                      border="left"
                      colored-border
                      elevation="2"
                      class="mb-5"
                    >
                      <v-icon left>mdi-alert-circle</v-icon>
                      {{ error }}
                    </v-alert>
                  </v-slide-y-transition>

                  <!-- User Info Display -->
                  <v-card flat class="grey lighten-5 pa-3 mb-4">
                    <v-card-text class="pa-0">
                      <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                        <div>
                          <div class="text-body-2">Tài khoản: <strong>{{ userName }}</strong></div>
                          <div class="text-caption grey--text">{{ userEmail }}</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>

                  <!-- OTP Input -->
                  <v-text-field
                    v-model="otp"
                    :rules="otpRules"
                    label="Mã OTP (6 chữ số)"
                    prepend-icon="mdi-key-variant"
                    outlined
                    dense
                    maxlength="6"
                    :disabled="loading"
                    class="mb-4"
                    @keypress="allowOnlyNumbers"
                    placeholder="Nhập mã OTP"
                    style="text-align: center; font-size: 18px; font-weight: 500; letter-spacing: 3px;"
                  ></v-text-field>

                  <!-- OTP Submit Button -->
                  <v-btn
                    color="primary"
                    block
                    large
                    type="submit"
                    :loading="loading"
                    :disabled="!otpValid || loading"
                    elevation="2"
                    height="44"
                    class="mb-3"
                  >
                    <v-icon left v-if="!loading">mdi-check</v-icon>
                    {{ loading ? 'Đang xác thực...' : 'Xác thực tài khoản' }}
                  </v-btn>

                  <!-- Back to Registration Button -->
                  <v-btn
                    color="grey"
                    text
                    block
                    :disabled="loading"
                    @click="backToRegistration"
                    class="mb-3"
                  >
                    <v-icon left>mdi-arrow-left</v-icon>
                    Quay lại đăng ký
                  </v-btn>

                  <!-- Resend OTP Button -->
                  <v-btn
                    color="primary"
                    text
                    block
                    :disabled="loading || resendCooldown > 0"
                    @click="resendOTP"
                    class="mb-3"
                  >
                    <v-icon left>mdi-refresh</v-icon>
                    {{ resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP' }}
                  </v-btn>
                </v-form>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import authModule from '@/api/auth'
const authActions = authModule.actions

export default {
  data() {
    return {
      valid: false,
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      agreeToTerms: false,
      loading: false,
      registerError: '',
      error: null,
      errors: {
        name: null,
        email: null,
        phone: null,
        password: null,
        confirmPassword: null,
        terms: null
      },
      // OTP related data
      showOTPForm: false,
      otp: '',
      otpValid: false,
      resendCooldown: 0,
      resendTimer: null,
      userName: '',
      userEmail: '',
      // OTP validation rules
      otpRules: [
        v => !!v || 'Mã OTP không được để trống',
        v => (v && v.length === 6) || 'Mã OTP phải có 6 chữ số',
        v => /^\d+$/.test(v) || 'Mã OTP chỉ được chứa số'
      ],
      nameRules: [
        v => !!v || 'Họ và tên không được để trống',
        v => (v && v.length <= 255) || 'Họ và tên không được quá 255 ký tự'
      ],
      emailRules: [
        v => !!v || 'Email không được để trống',
        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
        v => (v && v.length <= 50) || 'Email không được vượt quá 50 ký tự'
      ],
      phoneRules: [
        v => !v || /^[0-9+\-\s]+$/.test(v) || 'Số điện thoại không hợp lệ'
      ],
      passwordRules: [
        v => !!v || 'Mật khẩu không được để trống',
        v => (v && v.length >= 6) || 'Mật khẩu phải có ít nhất 6 ký tự'
      ],
      confirmPasswordRules: [
        v => !!v || 'Vui lòng xác nhận mật khẩu',
        v => v === this.password || 'Mật khẩu xác nhận không khớp'
      ],
      termsRules: [
        v => !!v || 'Bạn phải đồng ý với điều khoản dịch vụ'
      ]
    }
  },
  computed: {
    passwordStrength() {
      if (!this.password) return 0;

      let strength = 0;

      // Length check
      if (this.password.length > 6) strength += 20;
      if (this.password.length > 10) strength += 10;

      // Complexity checks
      if (/[A-Z]/.test(this.password)) strength += 20; // Has uppercase
      if (/[a-z]/.test(this.password)) strength += 20; // Has lowercase
      if (/[0-9]/.test(this.password)) strength += 20; // Has number
      if (/[^A-Za-z0-9]/.test(this.password)) strength += 20; // Has special char

      return Math.min(100, strength);
    },
    passwordStrengthColor() {
      if (this.passwordStrength < 40) return 'error';
      if (this.passwordStrength < 70) return 'warning';
      return 'success';
    },
    passwordStrengthTextColor() {
      if (this.passwordStrength < 40) return 'error--text';
      if (this.passwordStrength < 70) return 'warning--text';
      return 'success--text';
    },
    passwordStrengthText() {
      if (this.passwordStrength < 40) return 'Yếu';
      if (this.passwordStrength < 70) return 'Trung bình';
      return 'Mạnh';
    }
  },
  methods: {
    async register() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      this.error = null;
      this.errors = {
        name: null,
        email: null,
        phone: null,
        password: null,
        confirmPassword: null,
        terms: null
      };

      try {
        const response = await authActions.register({
          name: this.name,
          email: this.email,
          phone: this.phone,
          password: this.password,
          password_confirmation: this.confirmPassword
        });

        // Store user info for OTP verification
        this.userName = this.name;
        this.userEmail = this.email;

        // Show OTP form instead of navigating to login
        this.showOTPForm = true;
        this.error = null;

        this.$snackbar.success('Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.');
        this.startResendCooldown();

      } catch (error) {
        console.error('Registration error:', error);
        this.error = error.response?.data?.message || 'Đã xảy ra lỗi trong quá trình đăng ký';

        // Handle validation errors
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        }
      } finally {
        this.loading = false;
      }
    },

    async confirmOTP() {
      if (!this.$refs.otpForm.validate()) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await authActions.confirmOTP({
          gmail: this.userEmail,
          otp: this.otp
        });

        this.$snackbar.success('Xác thực thành công! Tài khoản của bạn đã được kích hoạt.');
        this.$router.push('/login');

      } catch (error) {
        console.error('OTP confirmation error:', error);
        this.error = error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn';
      } finally {
        this.loading = false;
      }
    },

    allowOnlyNumbers(event) {
      // Allow only numeric input
      const char = String.fromCharCode(event.which);
      if (!/[0-9]/.test(char)) {
        event.preventDefault();
      }
    },

    backToRegistration() {
      this.showOTPForm = false;
      this.otp = '';
      this.error = null;
      this.clearResendTimer();
    },

    async resendOTP() {
      if (this.resendCooldown > 0) return;

      this.loading = true;
      this.error = null;

      try {
        // Resend registration request to trigger new OTP
        await authActions.register({
          name: this.userName,
          email: this.userEmail,
          phone: this.phone,
          password: this.password,
          password_confirmation: this.confirmPassword
        });

        this.$snackbar.success('Mã OTP mới đã được gửi đến email của bạn!');
        this.startResendCooldown();

      } catch (error) {
        console.error('Resend OTP error:', error);
        this.error = error.response?.data?.message || 'Không thể gửi lại mã OTP';
      } finally {
        this.loading = false;
      }
    },

    startResendCooldown() {
      this.resendCooldown = 60; // 60 seconds cooldown
      this.resendTimer = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          this.clearResendTimer();
        }
      }, 1000);
    },

    clearResendTimer() {
      if (this.resendTimer) {
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
      this.resendCooldown = 0;
    },
    navigateToLogin() {
      this.$router.push('/login');
    },
    showTerms() {
      // Implement terms dialog
      this.$dialog.info({
        title: 'Điều khoản dịch vụ',
        text: 'Nội dung điều khoản dịch vụ sẽ hiển thị ở đây.',
        persistent: true,
        width: 500
      });
    },
    showPrivacyPolicy() {
      // Implement privacy policy dialog
      this.$dialog.info({
        title: 'Chính sách bảo mật',
        text: 'Nội dung chính sách bảo mật sẽ hiển thị ở đây.',
        persistent: true,
        width: 500
      });
    }
  },

  beforeDestroy() {
    // Clean up timer when component is destroyed
    this.clearResendTimer();
  }
}
</script>

<style scoped>
.register-page {
  background:
    url('@/assets/img/background.jpg') no-repeat center center / cover;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.v-card {
  overflow: hidden;
}

.v-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.v-btn {
  text-transform: none !important;
  letter-spacing: 0.5px;
}
</style>
