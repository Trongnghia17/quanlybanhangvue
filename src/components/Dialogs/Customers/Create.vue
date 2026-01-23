<template>
  <v-dialog
    :value="open"
    :width="600"
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
          <v-icon left>mdi-account-plus</v-icon>
          Tạo mới khách hàng
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggle()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-subtitle-1 grey--text text--darken-1 mb-4">
          Nhập thông tin khách hàng mới để thêm vào hệ thống.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="name"
                label="Tên khách hàng"
                prepend-icon="mdi-account"
                outlined
                dense
                auto-focus
                :rules="nameRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="phone"
                label="Số điện thoại"
                prepend-icon="mdi-phone"
                outlined
                dense
                :rules="phoneRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email-outline"
                outlined
                dense
                :rules="emailRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="address"
                label="Địa chỉ"
                prepend-icon="mdi-map-marker"
                outlined
                dense
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
                <v-text-field
                v-model="total_money"
                @input="formatCurrency"
                @focus="$event => $event.target.select()"
                label="Dư nợ khách hàng"
                prepend-icon="mdi-cash"
                outlined
                dense
                class="mb-2"
                color="primary"
                hide-details="auto"
                :suffix="'đ'"
                ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="note"
                label="Thông tin chi tiết"
                prepend-icon="mdi-note-text"
                outlined
                dense
                rows="3"
                class="mb-2"
                color="primary"
                hide-details="auto"
                placeholder="Nhập thông tin chi tiết về khách hàng..."
              ></v-textarea>
            </v-col>
          </v-row>
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
          <v-icon left>mdi-cancel</v-icon>
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
          <v-icon left>mdi-content-save</v-icon>
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import customerModule from '@/api/customers'
const customerActions = customerModule.actions

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
      name: '',
      phone: '',
      email: '',
      address: '',
      total_money: 0,
      note: '',
      nameRules: [
        v => !!v || 'Tên khách hàng không được để trống'
      ],
      phoneRules: [
        v => !!v || 'Số điện thoại không được để trống',
        v => /^[0-9]+$/.test(v) || 'Số điện thoại không hợp lệ'
      ],
      emailRules: [
        v => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ'
      ]
    }
  },
  methods: {
    formatCurrency() {
      this.total_money = this.total_money.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
      this.note = '';
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
    submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      // Create customer data object
      const customerData = {
        name: this.name,
        phone: this.phone,
        email: this.email,
        address: this.address,
        total_money: parseInt(this.total_money ? this.total_money.replace(/\D/g, '' ) : 0),
        note: this.note
      };

      customerActions.createCustomer(customerData).then(res => {
        this.loading = false;

        this.resetForm();


        this.$snackbar.success('Tạo mới khách hàng thành công!');
        this.$emit('toggle');
        this.$emit('refresh');

      }).catch(err => {
        this.loading = false;
        
        // Hiển thị lỗi chi tiết từ backend
        if (err.response && err.response.data && err.response.data.errors) {
          const errors = err.response.data.errors;
          if (errors.phone) {
            this.$snackbar.error(errors.phone[0]);
          } else {
            this.$snackbar.error('Có lỗi xảy ra khi tạo khách hàng!');
          }
        } else {
          this.$snackbar.error('Có lỗi xảy ra!');
        }
      });
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

.v-text-field ::v-deep .v-input__slot {
  min-height: 44px !important;
}

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
</style>
