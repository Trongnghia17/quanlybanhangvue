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
          <v-icon left>mdi-shield-key</v-icon>
          Xác thực OTP
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggle()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-subtitle-1 grey--text text--darken-1 mb-4">
          Vui lòng nhập địa chỉ email và mã OTP để xác thực tài khoản của bạn.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
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

          <!-- Gmail Field -->
          <v-text-field
            v-model="gmail"
            label="Địa chỉ email"
            :rules="emailRules"
            prepend-icon="mdi-email-outline"
            outlined
            dense
            auto-focus
            counter="50"
            class="mb-3"
            color="primary"
            hide-details="auto"
            placeholder="example@gmail.com"
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
            class="mb-2"
            color="primary"
            hide-details="auto"
            @keypress="allowOnlyNumbers"
            placeholder="Nhập mã OTP"
            style="text-align: center; font-size: 16px; font-weight: 500; letter-spacing: 2px;"
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
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
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
          @click="submit"
          :loading="loading"
          :disabled="!valid || loading"
          class="px-6"
          elevation="2"
        >
          <v-icon left>mdi-check</v-icon>
          Xác thực OTP
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
    },
    email: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      valid: false,
      loading: false,
      error: null,
      successMessage: null,
      gmail: this.email, // Use gmail instead of email to match payload
      otp: '',
      emailRules: [
        v => !!v || 'Email là bắt buộc',
        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
        v => (v && v.length <= 50) || 'Email không được vượt quá 50 ký tự'
      ],
      otpRules: [
        v => !!v || 'OTP là bắt buộc',
        v => (v && v.length === 6) || 'OTP phải có 6 chữ số',
        v => /^\d+$/.test(v) || 'OTP phải là số'
      ]
    }
  },
  watch: {
    email(newVal) {
      this.gmail = newVal;
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
      this.gmail = this.email;
      this.otp = '';
      this.error = null;
      this.successMessage = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    allowOnlyNumbers(event) {
      // Allow only numeric input for OTP
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },

    async submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const payload = {
          gmail: this.gmail,
          otp: parseInt(this.otp)
        };

        console.log('OTP Verification payload:', payload);

        const response = await authActions.confirmOTP(payload);

        if (response.status === 200) {
          this.successMessage = "Xác thực OTP thành công!";
          
          // Emit success event with response data
          this.$emit('verified', response.data);

          // Close dialog after success
          setTimeout(() => {
            this.toggle();
          }, 2000);
        } else {
          this.error = response.data.message || 'Xác thực OTP thất bại';
        }

      } catch (error) {
        console.error('OTP Verification Error:', error);
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
</style>
