<template>
  <v-dialog
    :value="open"
    :width="500"
    :max-width="1200"
    :min-width="320"
    fullscreen-breakpoint="sm"
    @keydown="$event.key === 'Escape' && toggle()"
    scrollable
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-lg elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium">
          <v-icon left>{{ step === 1 ? 'mdi-lock-reset' : 'mdi-shield-key' }}</v-icon>
          {{ step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggle()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <!-- Step 1: Email Input -->
        <div v-if="step === 1">
          <p class="text-subtitle-1 grey--text text--darken-1 mb-4">
            Vui lòng nhập địa chỉ email để nhận mã OTP đặt lại mật khẩu.
          </p>

          <v-form @submit.prevent="sendOTP" ref="emailForm" v-model="emailValid">
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
                {{ error }}
              </v-alert>
            </v-slide-y-transition>

            <v-text-field
              v-model="email"
              label="Địa chỉ email"
              :rules="emailRules"
              prepend-icon="mdi-email-outline"
              outlined
              dense
              auto-focus
              counter="50"
              class="mb-2"
              color="primary"
              hide-details="auto"
              placeholder="example@domain.com"
            ></v-text-field>

            <v-scale-transition>
              <v-alert
                v-if="successMessage"
                type="success"
                border="left"
                colored-border
                class="mt-4"
                icon="mdi-check-circle-outline"
              >
                {{ successMessage }}
              </v-alert>
            </v-scale-transition>
          </v-form>
        </div>

        <!-- Step 2: OTP & New Password -->
        <div v-if="step === 2">
          <div class="text-center mb-4">
            <v-icon color="primary" size="64">mdi-shield-key</v-icon>
            <p class="text-subtitle-1 grey--text text--darken-1 mt-3">
              Nhập mã OTP đã được gửi đến <strong>{{ email }}</strong> và mật khẩu mới.
            </p>
          </div>

          <v-form @submit.prevent="resetPassword" ref="resetForm" v-model="resetValid">
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
                {{ error }}
              </v-alert>
            </v-slide-y-transition>

            <!-- Email Display (Read Only) -->
            <v-text-field
              :value="email"
              label="Email"
              prepend-icon="mdi-email-outline"
              outlined
              dense
              readonly
              class="mb-3"
              color="primary"
            ></v-text-field>

            <!-- OTP Field -->
            <v-text-field
              v-model="otp"
              label="Mã OTP (6 chữ số)"
              :rules="otpRules"
              prepend-icon="mdi-key-variant"
              outlined
              dense
              maxlength="6"
              class="mb-3"
              color="primary"
              @keypress="allowOnlyNumbers"
              placeholder="Nhập mã OTP"
              style="text-align: center; font-size: 16px; font-weight: 500; letter-spacing: 2px;"
            ></v-text-field>

            <!-- New Password Field -->
            <v-text-field
              v-model="newPassword"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              label="Mật khẩu mới"
              prepend-icon="mdi-lock-outline"
              outlined
              dense
              class="mb-3"
              color="primary"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              placeholder="Nhập mật khẩu mới"
            ></v-text-field>

            <!-- Confirm Password Field -->
            <v-text-field
              v-model="confirmPassword"
              :rules="confirmPasswordRules"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Xác nhận mật khẩu mới"
              prepend-icon="mdi-lock-check-outline"
              outlined
              dense
              class="mb-2"
              color="primary"
              :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showConfirmPassword = !showConfirmPassword"
              placeholder="Nhập lại mật khẩu mới"
            ></v-text-field>

            <v-scale-transition>
              <v-alert
                v-if="successMessage"
                type="success"
                border="left"
                colored-border
                class="mt-4"
                icon="mdi-check-circle-outline"
              >
                {{ successMessage }}
              </v-alert>
            </v-scale-transition>
          </v-form>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          v-if="step === 2"
          text
          color="grey darken-1"
          @click="backToStep1"
          :disabled="loading"
          class="px-4"
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Quay lại
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="grey darken-1"
          @click="toggle()"
          :disabled="loading"
          class="px-4"
        >
          Hủy bỏ
        </v-btn>
        <v-btn
          color="primary"
          @click="step === 1 ? sendOTP() : resetPassword()"
          :loading="loading"
          :disabled="step === 1 ? !emailValid || loading : !resetValid || loading"
          class="px-6"
          elevation="2"
        >
          <v-icon left>{{ step === 1 ? 'mdi-send' : 'mdi-check' }}</v-icon>
          {{ step === 1 ? 'Gửi mã OTP' : 'Đặt lại mật khẩu' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import authModule from '@/api/auth';
const authActions = authModule.actions;

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      step: 1, // 1: Email input, 2: OTP & Password
      emailValid: false,
      resetValid: false,
      loading: false,
      error: null,
      successMessage: null,
      showPassword: false,
      showConfirmPassword: false,

      // Form fields
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',

      // Validation rules
      emailRules: [
        v => !!v || 'Email là bắt buộc',
        v => /.+@.+\..+/.test(v) || 'Email phải là một địa chỉ email hợp lệ',
        v => (v && v.length <= 50) || 'Email không được vượt quá 50 ký tự'
      ],
      otpRules: [
        v => !!v || 'Mã OTP là bắt buộc',
        v => (v && v.length === 6) || 'Mã OTP phải có 6 chữ số',
        v => /^\d+$/.test(v) || 'Mã OTP chỉ được chứa số'
      ],
      passwordRules: [
        v => !!v || 'Mật khẩu mới là bắt buộc',
        v => (v && v.length >= 8) || 'Mật khẩu mới phải có ít nhất 8 ký tự'
      ],
      confirmPasswordRules: [
        v => !!v || 'Xác nhận mật khẩu là bắt buộc',
        v => v === this.newPassword || 'Mật khẩu xác nhận không khớp'
      ]
    }
  },
  methods: {
    toggle() {
      if (!this.loading) {
        this.resetForm();
        this.$emit('toggle');
      }
    },

    resetForm() {
      this.step = 1;
      this.email = '';
      this.otp = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.error = null;
      this.successMessage = null;
      this.showPassword = false;
      this.showConfirmPassword = false;

      if (this.$refs.emailForm) {
        this.$refs.emailForm.resetValidation();
      }
      if (this.$refs.resetForm) {
        this.$refs.resetForm.resetValidation();
      }
    },

    backToStep1() {
      this.step = 1;
      this.otp = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.error = null;
      this.successMessage = null;
    },

    allowOnlyNumbers(event) {
      // Allow only numeric input for OTP
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },

    async sendOTP() {
      if (!this.$refs.emailForm.validate()) return;

      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const payload = {
          email: this.email
        };

        console.log('Sending OTP request:', payload);

        const response = await authActions.resetPassword(payload);

        if (response.status === 200) {
          this.successMessage = "Mã OTP đã được gửi đến email của bạn!";

          // Move to step 2 after a short delay
          setTimeout(() => {
            this.step = 2;
            this.successMessage = null;
          }, 2000);
        } else {
          this.error = response.data.message || 'Không thể gửi mã OTP';
        }

      } catch (error) {
        console.error('Send OTP Error:', error);
        if (error.response) {
          this.error = error.response.data.message || 'Email không tồn tại trong hệ thống';
        } else {
          this.error = 'Có lỗi xảy ra. Vui lòng thử lại';
        }
      } finally {
        this.loading = false;
      }
    },

    async resetPassword() {
      if (!this.$refs.resetForm.validate()) return;

      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const payload = {
          email: this.email,
          otp: this.otp,
          new_password: this.newPassword
        };

        console.log('Reset password request:', payload);

        const response = await authActions.resetPassword(payload);

        if (response.status === 200) {
          this.successMessage = "Đặt lại mật khẩu thành công!";

          // Emit success event
          this.$emit('password-reset', response.data);

          // Close dialog after success
          setTimeout(() => {
            this.toggle();
          }, 2000);
        } else {
          this.error = response.data.message || 'Đặt lại mật khẩu thất bại';
        }

      } catch (error) {
        console.error('Reset Password Error:', error);
        if (error.response) {
          this.error = error.response.data.message || 'Mã OTP không chính xác hoặc đã hết hạn';
        } else {
          this.error = 'Có lỗi xảy ra. Vui lòng thử lại';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.v-card {
  overflow: hidden;
}

.v-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* OTP Input styling */
.v-text-field >>> input {
  text-align: center !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  letter-spacing: 2px !important;
}

/* Step transition */
.v-card-text {
  transition: all 0.3s ease;
}
</style>
