<template>
  <v-dialog
    :value="open"
    :width="650"
    :max-width="1200"
    :min-width="320"
    fullscreen-breakpoint="sm"
    @keydown="$event.key === 'Escape' && toggle()"
    scrollable
    persistent
    transition="dialog-bottom-transition"
    content-class="supplier-dialog"
  >
    <v-card class="rounded-lg elevation-12">
      <v-toolbar color="deep-purple" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium d-flex align-center">
          <v-avatar size="36" color="deep-purple lighten-4" class="mr-3">
            <v-icon color="deep-purple darken-1">mdi-truck-delivery</v-icon>
          </v-avatar>
          Tạo mới nhà cung cấp
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggle()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <v-alert
          v-if="formError"
          dense
          text
          type="error"
          class="mb-4"
          border="left"
          dismissible
          @click:close="formError = null"
        >
          {{ formError }}
        </v-alert>

        <p class="text-subtitle-1 grey--text text--darken-1 mb-5 d-flex align-center">
          <v-icon color="deep-purple lighten-3" class="mr-2">mdi-information-outline</v-icon>
          Nhập thông tin nhà cung cấp mới để thêm vào hệ thống.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 deep-purple--text">
              <v-icon small color="deep-purple" class="mr-1">mdi-account-details</v-icon>
              Thông tin cơ bản
            </div>

            <v-row class="mt-2">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="name"
                  label="Tên nhà cung cấp"
                  prepend-inner-icon="mdi-domain"
                  outlined
                  dense
                  auto-focus
                  :rules="nameRules"
                  class="mb-2 rounded-lg"
                  color="deep-purple"
                  hide-details="auto"
                  placeholder="VD: Công ty TNHH ABC"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="phone"
                  label="Số điện thoại"
                  prepend-inner-icon="mdi-phone"
                  outlined
                  dense
                  :rules="phoneRules"
                  class="mb-2 rounded-lg"
                  color="deep-purple"
                  hide-details="auto"
                  placeholder="VD: 0901234567"
                  @focus="$event => $event.target.select()"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 deep-purple--text">
              <v-icon small color="deep-purple" class="mr-1">mdi-contacts</v-icon>
              Thông tin liên hệ
            </div>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="email"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  outlined
                  dense
                  :rules="emailRules"
                  class="mb-2 rounded-lg"
                  color="deep-purple"
                  hide-details="auto"
                  placeholder="VD: contact@supplier.com"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="contactPerson"
                  label="Người liên hệ"
                  prepend-inner-icon="mdi-account"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="deep-purple"
                  hide-details="auto"
                  placeholder="VD: Nguyễn Văn A"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="address"
                  label="Địa chỉ"
                  prepend-inner-icon="mdi-map-marker"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="deep-purple"
                  hide-details="auto"
                  placeholder="VD: Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          plain
          color="deep-purple"
          @click="resetForm"
          :disabled="loading"
          class="rounded-lg"
        >
          <v-icon left>mdi-refresh</v-icon>
          Làm mới
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          text
          color="grey darken-1"
          @click="toggle()"
          :disabled="loading"
          class="px-4 rounded-lg"
        >
          <v-icon left>mdi-cancel</v-icon>
          Hủy bỏ
        </v-btn>

        <v-btn
          color="deep-purple"
          @click="submit"
          :loading="loading"
          :disabled="!valid || loading"
          class="px-6 rounded-lg"
          elevation="2"
        >
          <v-icon left>mdi-content-save</v-icon>
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import supplierModule from '@/api/suppliers'
const supplierActions = supplierModule.actions

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      formError: null,
      name: '',
      phone: '',
      email: '',
      address: '',
      total_money: 0,
      contactPerson: '',
      taxCode: '',
      notes: '',

      nameRules: [
        v => !!v || 'Tên nhà cung cấp không được để trống'
      ],
      phoneRules: [
        v => !v || /^[0-9]+$/.test(v) || 'Số điện thoại không hợp lệ'
      ],
      emailRules: [
        v => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ'
      ]
    }
  },
  methods: {
    formatCurrency() {
      this.total_money = this.total_money.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    toggle() {
      if (!this.loading) {
        this.$emit('toggle');
        this.resetForm();
      }
    },

    resetForm() {
      this.name = '';
      this.phone = '';
      this.email = '';
      this.address = '';
      this.total_money = 0;
      this.contactPerson = '';
      this.taxCode = '';
      this.notes = '';
      this.formError = null;

      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      this.formError = null;

      // Create supplier data object
      const supplierData = {
        name: this.name,
        phone: this.phone,
        email: this.email,
        address: this.address,
        total_money: parseInt(this.total_money ? this.total_money.replace(/\D/g, '') : 0),
        contact_person: this.contactPerson,
        surrogate: this.taxCode,
        notes: this.notes
      };

      supplierActions.createSupplier(supplierData).then(res => {
        this.loading = false;
        this.resetForm();

        this.$snackbar.success('Tạo mới nhà cung cấp thành công!');
        this.$emit('toggle');
        this.$emit('refresh');
      }).catch(err => {
        console.error('Error creating supplier:', err);
        this.formError = err.response?.data?.message || 'Có lỗi xảy ra khi tạo nhà cung cấp!';
        this.$snackbar.error('Có lỗi xảy ra khi tạo nhà cung cấp!');
        this.loading = false;
      });
    }
  }
};
</script>

<style scoped>
.supplier-dialog {
  border-radius: 16px;
}

.v-card {
  overflow: hidden;
}

.v-toolbar {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.v-text-field ::v-deep .v-input__slot,
.v-textarea ::v-deep .v-input__slot {
  min-height: 44px !important;
  transition: all 0.2s ease;
}

.v-text-field ::v-deep .v-input__slot:hover,
.v-textarea ::v-deep .v-input__slot:hover {
  border-color: #673ab7 !important;
}

.v-text-field ::v-deep .v-input__prepend-inner {
  margin-right: 8px;
}

.v-text-field ::v-deep .v-input__prepend-inner i {
  opacity: 0.6;
}

.v-btn {
  text-transform: none !important;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.v-btn.v-btn--contained {
  box-shadow: 0 4px 12px rgba(103, 58, 183, 0.4) !important;
}

.v-btn.v-btn--contained:hover {
  box-shadow: 0 6px 15px rgba(103, 58, 183, 0.5) !important;
}

.grey.lighten-5 {
  transition: all 0.2s ease;
}

.grey.lighten-5:hover {
  background-color: #f3f0f7 !important;
}
</style>
