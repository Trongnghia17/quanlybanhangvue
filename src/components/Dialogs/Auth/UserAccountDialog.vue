<template>
  <v-dialog
    v-model="dialog"
    :width="600"
    :max-width="1000"
    :min-width="320"
    scrollable
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-lg elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium">
          <v-icon left>mdi-account-circle</v-icon>
          Thông tin tài khoản
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <div v-if="loading" class="text-center my-5">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-3">Đang tải thông tin...</p>
        </div>

        <div v-else>
          <v-alert
            v-if="errorMessage"
            type="error"
            dense
            outlined
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <v-alert
            v-if="successMessage"
            type="success"
            dense
            outlined
            class="mb-4"
          >
            {{ successMessage }}
          </v-alert>

          <v-tabs v-model="activeTab" background-color="transparent" grow>
            <v-tab>
              <v-icon left>mdi-account</v-icon>
              Thông tin cơ bản
            </v-tab>
            <v-tab>
              <v-icon left>mdi-security</v-icon>
              Đổi mật khẩu
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab">
            <!-- Basic Information Tab -->
            <v-tab-item>
              <v-form ref="infoForm" v-model="infoFormValid" @submit.prevent="updateInfo" lazy-validation>
                <v-card flat>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="userInfo.name"
                          label="Họ và tên"
                          prepend-inner-icon="mdi-account"
                          outlined
                          dense
                          disabled
                          readonly
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="userInfo.email"
                          label="Email"
                          prepend-inner-icon="mdi-email"
                          outlined
                          dense
                          disabled
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="userInfo.phone"
                          label="Số điện thoại"
                          prepend-inner-icon="mdi-phone"
                          outlined
                          dense
                          disabled
                          readonly
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="userInfo.last_login_at"
                          label="Lần đăng nhập cuối"
                          prepend-inner-icon="mdi-clock"
                          outlined
                          dense
                          disabled
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="formData.store_name"
                          label="Tên cửa hàng"
                          prepend-inner-icon="mdi-store"
                          outlined
                          dense
                          :rules="storeNameRules"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="formData.address"
                          label="Địa chỉ"
                          prepend-inner-icon="mdi-map-marker"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12">
                        <v-alert
                          type="info"
                          outlined
                          dense
                          class="mb-0"
                        >
                          <div class="d-flex align-center">
                            <v-icon left>mdi-information</v-icon>
                            <div>
                              <strong>Thời hạn sử dụng:</strong> {{ userInfo.remaining_days || 0 }} ngày
                            </div>
                          </div>
                        </v-alert>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <v-card-actions class="pt-0">
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      type="submit"
                      :loading="updatingInfo"
                      :disabled="!infoFormValid || updatingInfo"
                    >
                      <v-icon left>mdi-content-save</v-icon>
                      Cập nhật
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-tab-item>

            <!-- Change Password Tab -->
            <v-tab-item>
              <v-form ref="passwordForm" v-model="passwordFormValid" @submit.prevent="updatePassword" lazy-validation>
                <v-card flat>
                  <v-card-text>
                    <v-alert
                      type="warning"
                      outlined
                      dense
                      class="mb-4"
                    >
                      <div class="d-flex align-center">
                        <v-icon left>mdi-shield-key</v-icon>
                        <div>
                          Mật khẩu mới phải có ít nhất 6 ký tự
                        </div>
                      </div>
                    </v-alert>

                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="passwordData.password"
                          label="Mật khẩu mới"
                          prepend-inner-icon="mdi-lock"
                          outlined
                          dense
                          :type="showPassword ? 'text' : 'password'"
                          :rules="passwordRules"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="showPassword = !showPassword"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="passwordData.password_confirmation"
                          label="Xác nhận mật khẩu mới"
                          prepend-inner-icon="mdi-lock-check"
                          outlined
                          dense
                          :type="showPassword ? 'text' : 'password'"
                          :rules="[...passwordRules, passwordConfirmationRule]"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <v-card-actions class="pt-0">
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      type="submit"
                      :loading="updatingPassword"
                      :disabled="!passwordFormValid || updatingPassword"
                    >
                      <v-icon left>mdi-content-save</v-icon>
                      Đổi mật khẩu
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-tab-item>
          </v-tabs-items>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import authApi from '@/api/auth';
import Cookies from 'vue-cookies';

export default {
  name: 'UserAccountDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      updatingInfo: false,
      updatingPassword: false,
      errorMessage: '',
      successMessage: '',
      activeTab: 0,
      showPassword: false,

      // User info from API
      userInfo: {
        id: null,
        name: '',
        email: '',
        phone: '',
        address: '',
        store_name: '',
        last_login_at: '',
        remaining_days: 0
      },

      // Form data for updating
      formData: {
        address: '',
        store_name: ''
      },

      // Password data
      passwordData: {
        password: '',
        password_confirmation: ''
      },

      // Form validation
      infoFormValid: true,
      passwordFormValid: true,

      // Validation rules
      storeNameRules: [
        v => (v && v.length <= 100) || 'Tên cửa hàng không quá 100 ký tự'
      ],
      passwordRules: [
        v => !v || v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự'
      ]
    };
  },
  computed: {
    passwordConfirmationRule() {
      return () => this.passwordData.password === this.passwordData.password_confirmation || 'Xác nhận mật khẩu không khớp';
    }
  },
  watch: {
    dialog(val) {
      if (val) {
        this.fetchAccountInfo();
      } else {
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.errorMessage = '';
      this.successMessage = '';
      this.activeTab = 0;

      if (this.$refs.infoForm) {
        this.$refs.infoForm.resetValidation();
      }

      if (this.$refs.passwordForm) {
        this.$refs.passwordForm.resetValidation();
        this.passwordData = {
          password: '',
          password_confirmation: ''
        };
      }
    },
    async fetchAccountInfo() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await authApi.actions.getAccountInfo();

        if (response && response.data) {
          const userData = response.data;

          this.userInfo = {
            id: userData.id,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            store_name: userData.store_name || '',
            last_login_at: userData.last_login_at || '',
            remaining_days: userData.remaining_days || 0
          };

          // Initialize form data
          this.formData = {
            address: this.userInfo.address,
            store_name: this.userInfo.store_name
          };
        } else {
          this.errorMessage = 'Không thể tải thông tin tài khoản';
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi tải thông tin tài khoản';
      } finally {
        this.loading = false;
      }
    },
    async updateInfo() {
      if (!this.$refs.infoForm.validate()) return;

      this.updatingInfo = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const payload = {
          address: this.formData.address,
          store_name: this.formData.store_name
        };

        const response = await authApi.actions.updateStoreName(payload);

        if (response && response.data && response.data.success) {
          this.successMessage = 'Cập nhật thông tin thành công';
          // Update user info in local state
          this.userInfo.address = this.formData.address;
          this.userInfo.store_name = this.formData.store_name;

          // Update localStorage user info if exists
          const localUser = JSON.parse(localStorage.getItem('user_info') || '{}');
          if (localUser) {
            localUser.address = this.formData.address;
            localUser.store_name = this.formData.store_name;
            localStorage.setItem('user_info', JSON.stringify(localUser));
          }
        } else {
          this.errorMessage = (response && response.data && response.data.message) || 'Không thể cập nhật thông tin';
        }
      } catch (error) {
        console.error('Error updating account info:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi cập nhật thông tin';
      } finally {
        this.updatingInfo = false;
      }
    },
    async updatePassword() {
      if (!this.$refs.passwordForm.validate()) return;

      this.updatingPassword = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const payload = {
          password: this.passwordData.password,
          password_confirmation: this.passwordData.password_confirmation
        };

        const response = await authApi.actions.updateStoreName(payload);

        if (response && response.data && response.data.success) {
          this.successMessage = 'Cập nhật mật khẩu thành công';
          this.passwordData = {
            password: '',
            password_confirmation: ''
          };
        } else {
          this.errorMessage = (response && response.data && response.data.message) || 'Không thể cập nhật mật khẩu';
        }
      } catch (error) {
        console.error('Error updating password:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi cập nhật mật khẩu';
      } finally {
        this.updatingPassword = false;
      }
    },
    close() {
      this.$emit('update:dialog', false);
    }
  }
};
</script>
