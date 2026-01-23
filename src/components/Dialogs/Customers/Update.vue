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
      <v-toolbar color="info" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium">
          <v-icon left>mdi-account-edit</v-icon>
          Cập nhật khách hàng
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggle()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-subtitle-1 grey--text text--darken-1 mb-4">
          Cập nhật thông tin khách hàng trong hệ thống.
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
                color="info"
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
                color="info"
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
                color="info"
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
                color="info"
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
                color="info"
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
                color="info"
                hide-details="auto"
                placeholder="Nhập thông tin chi tiết về khách hàng..."
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="health_needs"
                :items="healthNeedsList"
                label="Nhu cầu sức khỏe"
                prepend-icon="mdi-heart-pulse"
                outlined
                dense
                multiple
                chips
                small-chips
                deletable-chips
                class="mb-2"
                color="info"
                hide-details="auto"
                placeholder="Chọn nhu cầu sức khỏe..."
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    v-if="index < 3"
                    small
                    close
                    @click:close="removeHealthNeed(item)"
                    color="info"
                    outlined
                  >
                    {{ item }}
                  </v-chip>
                  <span
                    v-if="index === 3"
                    class="grey--text text-caption"
                  >
                    (+{{ health_needs.length - 3 }} khác)
                  </span>
                </template>
              </v-select>
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
          color="info"
          @click="submit"
          :loading="loading"
          :disabled="!valid || loading"
          class="px-6"
          elevation="2"
        >
          <v-icon left>mdi-content-save</v-icon>
          Cập nhật
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
    },
    customer: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      customerId: null,
      name: '',
      phone: '',
      email: '',
      address: '',
      total_money: 0,
      note: '',
      health_needs: [],
      healthNeedsList: [
        'Xương khớp',
        'Tiểu đường',
        'Tăng cân',
        'Giảm cân',
        'Con cần dinh dưỡng',
        'Tiêu hóa'
      ],
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
  watch: {
    customer: {
      handler(newValue) {
        if (newValue && Object.keys(newValue).length > 0) {
          this.populateCustomerData(newValue);
        }
      },
      immediate: true
    },
    open(val) {
      if (val && this.customer && Object.keys(this.customer).length > 0) {
        this.populateCustomerData(this.customer);
      }
    }
  },
  methods: {
    populateCustomerData(customer) {
      this.customerId = customer.id;
      this.name = customer.name || '';
      this.phone = customer.phone || '';
      this.email = customer.email || '';
      this.address = customer.address || '';
      this.note = customer.note || '';
      this.health_needs = customer.health_needs || [];

      // Format total_money with commas
      const money = customer.total_money || 0;
      this.total_money = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatCurrency() {
      this.total_money = this.total_money.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    removeHealthNeed(item) {
      const index = this.health_needs.indexOf(item);
      if (index >= 0) this.health_needs.splice(index, 1);
    },
    toggle() {
      if (!this.loading) {
        this.$emit('toggle');
        this.resetForm();
      }
    },
    resetForm() {
      this.customerId = null;
      this.name = '';
      this.phone = '';
      this.email = '';
      this.address = '';
      this.total_money = 0;
      this.note = '';
      this.health_needs = [];
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
    submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      // Create customer data object
      const customerData = {
        id: this.customerId,
        name: this.name,
        phone: this.phone,
        email: this.email,
        address: this.address,
        total_money: parseInt(this.total_money ? this.total_money.replace(/\D/g, '') : 0),
        note: this.note,
        health_needs: this.health_needs
      };

      customerActions.updateCustomer(customerData).then(res => {
        this.loading = false;
        this.$snackbar.success('Cập nhật khách hàng thành công!');
        this.$emit('refresh');
        this.$emit('toggle');
      }).catch(err => {
        this.loading = false;
        console.error('Update error:', err);
        
        // Hiển thị lỗi chi tiết từ backend
        if (err.response && err.response.data && err.response.data.errors) {
          const errors = err.response.data.errors;
          if (errors.phone) {
            this.$snackbar.error(errors.phone[0]);
          } else {
            this.$snackbar.error('Có lỗi xảy ra khi cập nhật khách hàng!');
          }
        } else {
          this.$snackbar.error('Có lỗi xảy ra khi cập nhật khách hàng!');
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
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4) !important;
}

.v-btn.v-btn--contained:hover {
  box-shadow: 0 6px 15px rgba(33, 150, 243, 0.5) !important;
}
</style>
