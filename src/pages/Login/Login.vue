<template>
  <div class="login-page">
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <v-card class="rounded-lg elevation-12 login-card">
            <!-- Header Section -->
            <v-toolbar color="primary" dark flat class="login-toolbar">
              <v-toolbar-title class="text-h5 font-weight-medium text-center mx-auto">
                <v-icon size="28" class="mr-2">mdi-store</v-icon>
                RetailEase
              </v-toolbar-title>
            </v-toolbar>

            <v-card-text class="pa-6 pt-8">
              <h1 class="text-h6 font-weight-bold text-center mb-2">Đăng nhập</h1>
              <p class="text-subtitle-2 grey--text text--darken-1 text-center mb-6">
                Quản lý bán hàng hiệu quả với RetailEase
              </p>

              <v-form ref="form" v-model="valid" @submit.prevent="login" lazy-validation>
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

                <!-- Email Field -->
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  prepend-icon="mdi-email-outline"
                  outlined
                  dense
                  required
                  autocomplete="email"
                  color="primary"
                  :error-messages="errors.email"
                  class="mb-2"
                  placeholder="example@domain.com"
                ></v-text-field>

                <!-- Password Field -->
                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  :type="showPassword ? 'text' : 'password'"
                  label="Mật khẩu"
                  prepend-icon="mdi-lock-outline"
                  outlined
                  dense
                  required
                  autocomplete="current-password"
                  color="primary"
                  :error-messages="errors.password"
                  :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append="showPassword = !showPassword"
                ></v-text-field>

                <!-- Remember Me & Forgot Password -->
                <div class="d-flex justify-space-between align-center mb-6 mt-2">


                  <v-btn
                    text
                    small
                    color="primary"
                    @click="forgotPassword"
                    class="text-none font-weight-medium"
                  >
                    <v-icon small left>mdi-lock-reset</v-icon>
                    Quên mật khẩu?
                  </v-btn>
                </div>

                <!-- Submit Button -->
                <v-btn
                  color="primary"
                  block
                  large
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                  elevation="2"
                  height="44"
                  class="mb-4"
                >
                  <v-icon left v-if="!loading">mdi-login</v-icon>
                  {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </v-btn>
              </v-form>

              <div class="text-center">
                <v-divider class="my-4"></v-divider>
                <div class="my-4">
                  <span class="grey--text text--darken-1">Chưa có tài khoản?</span>
                  <v-btn text color="primary" @click="register" class="ml-1 text-none">
                    <v-icon small left>mdi-account-plus</v-icon>
                    Đăng ký ngay
                  </v-btn>
                </div>
              </div>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Reset Password Dialog -->
    <ResetPassword
      :open="openResetPasswordDialog"
      @toggle="openResetPasswordDialog = !openResetPasswordDialog"
      @password-reset="handlePasswordReset"
    />
  </div>
</template>

<script>
import authModule from '@/api/auth';
import ResetPassword from '@/components/Dialogs/Auth/ResetPassword.vue';
const authActions = authModule.actions;

export default {
  components: {
    ResetPassword
  },
  data() {
    return {
      valid: true,
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      loading: false,
      error: null,
      openResetPasswordDialog: false,
      errors: {
        email: '',
        password: ''
      },
      emailRules: [
        v => !!v || 'Email không được để trống',
        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
      ],
      passwordRules: [
        v => !!v || 'Mật khẩu không được để trống'
      ]
    };
  },
  methods: {
    login() {
      // Reset errors
      this.error = null;
      this.errors = {
        email: '',
        password: ''
      };

      // Validate form
      if (!this.$refs.form.validate()) return;

      // Start loading
      this.loading = true;

      // Perform login
      authActions.login({
        email: this.email,
        password: this.password,
        rememberMe: this.rememberMe
      })
      .then((res) => {
       if(res && res.status === 200 && res.data && res.data.data){
          this.$snackbar.success('Đăng nhập thành công');
          console.log(res);
          this.$cookies.set('token', res.data.data.access_token, '1d');
          this.$router.push('/dashboard');
        } else {
          this.error = 'Phản hồi từ server không hợp lệ';
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.data && error.response.data.message) {
          this.error = error.response.data.message;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Không thể kết nối đến server. Vui lòng kiểm tra API backend.';
        }
      })
      .finally(() => {
        this.loading = false;
      });
    },
    forgotPassword() {
      this.openResetPasswordDialog = true;
    },
    handlePasswordReset(responseData) {
      // Handle successful password reset
      console.log('Password reset successfully:', responseData);
      this.$snackbar.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
    },
    register() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
  url('@/assets/img/background.jpg') no-repeat center center / cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
}

.login-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.v-text-field ::v-deep .v-input__slot {
  min-height: 48px !important;
}

/* Enhanced focus style for text fields */
.v-text-field.v-input--is-focused ::v-deep .v-input__slot {
  border-color: var(--v-primary-base) !important;
}

/* Button styling enhancements */
.v-btn {
  text-transform: none !important;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.v-btn.v-btn--contained {
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4) !important;
}

.v-btn.v-btn--contained:hover {
  box-shadow: 0 6px 15px rgba(26, 115, 232, 0.5) !important;
}

/* Animation for login container */
.v-card {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide transition for alerts */
.v-slide-y-transition-enter-active,
.v-slide-y-transition-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>
