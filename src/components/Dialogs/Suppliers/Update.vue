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
      <v-toolbar color="indigo" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium d-flex align-center">
          <v-avatar size="36" color="indigo lighten-4" class="mr-3">
            <v-icon color="indigo darken-1">mdi-truck-check</v-icon>
          </v-avatar>
          Cập nhật nhà cung cấp
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
          <v-icon color="indigo lighten-3" class="mr-2">mdi-information-outline</v-icon>
          Chỉnh sửa thông tin nhà cung cấp trong hệ thống.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 indigo--text">
              <v-icon small color="indigo" class="mr-1">mdi-account-details</v-icon>
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
                  color="indigo"
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
                  color="indigo"
                  hide-details="auto"
                  placeholder="VD: 0901234567"
                  @focus="$event => $event.target.select()"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 indigo--text">
              <v-icon small color="indigo" class="mr-1">mdi-contacts</v-icon>
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
                  color="indigo"
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
                  color="indigo"
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
                  color="indigo"
                  hide-details="auto"
                  placeholder="VD: Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>
          <!-- Change History Section (Optional) -->
          <v-card flat class="mb-2 mt-5 pa-4 rounded-lg blue-grey lighten-5" v-if="showHistory">
            <div class="text-subtitle-2 font-weight-medium mb-3 blue-grey--text">
              <v-icon small color="blue-grey" class="mr-1">mdi-history</v-icon>
              Lịch sử thay đổi
              <v-btn x-small text color="blue-grey darken-1" class="ml-2" @click="showHistory = !showHistory">
                <span class="text-caption">Ẩn</span>
              </v-btn>
            </div>

            <v-timeline dense class="mr-0 pr-0">
              <v-timeline-item
                v-for="(history, i) in changeHistory"
                :key="i"
                small
                :color="history.color"
              >
                <div class="text-caption">{{ formatDate(history.date) }}</div>
                <div class="font-weight-medium">{{ history.title }}</div>
                <div class="text-caption grey--text">{{ history.description }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card>

          <div v-else class="text-center my-3">
            <v-btn text small color="blue-grey" @click="showHistory = true">
              <v-icon left small>mdi-history</v-icon>
              Xem lịch sử thay đổi
            </v-btn>
          </div>

        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <!-- Status Badge -->
        <v-chip
          :color="getStatusColor(supplierStatus)"
          text-color="white"
          small
          class="mr-2"
        >
          {{ getStatusText(supplierStatus) }}
        </v-chip>

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
          color="indigo"
          @click="submit"
          :loading="loading"
          :disabled="!valid || loading"
          class="px-6 rounded-lg"
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
import supplierModule from '@/api/suppliers'
const supplierActions = supplierModule.actions

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    },
    supplier: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      formError: null,
      supplierId: null,
      name: '',
      phone: '',
      email: '',
      address: '',
      total_money: 0,
      contactPerson: '',
      taxCode: '',
      notes: '',
      supplierStatus: 'active',
      showHistory: false,

      nameRules: [
        v => !!v || 'Tên nhà cung cấp không được để trống'
      ],
      phoneRules: [
        v => !v || /^[0-9]+$/.test(v) || 'Số điện thoại không hợp lệ'
      ],
      emailRules: [
        v => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ'
      ],

      // Mock change history data (replace with actual history from API)
      changeHistory: [
        {
          date: new Date(Date.now() - 7*24*60*60*1000),
          title: 'Cập nhật thông tin liên hệ',
          description: 'Người thực hiện: Nguyễn Văn A',
          color: 'indigo'
        },
        {
          date: new Date(Date.now() - 14*24*60*60*1000),
          title: 'Cập nhật công nợ',
          description: 'Công nợ: +1,500,000đ',
          color: 'amber darken-2'
        },
        {
          date: new Date(Date.now() - 30*24*60*60*1000),
          title: 'Tạo mới nhà cung cấp',
          description: 'Người thực hiện: Admin',
          color: 'green'
        }
      ]
    }
  },
  watch: {
    supplier: {
      handler(newValue) {
        if (newValue && Object.keys(newValue).length > 0) {
          this.populateSupplierData(newValue);
        }
      },
      immediate: true
    },
    open(val) {
      if (val && this.supplier && Object.keys(this.supplier).length > 0) {
        this.populateSupplierData(this.supplier);
      }
    }
  },
  methods: {
    populateSupplierData(supplier) {
      this.supplierId = supplier.id;
      this.name = supplier.name || '';
      this.phone = supplier.phone || '';
      this.email = supplier.email || '';
      this.address = supplier.address || '';
      this.contactPerson = supplier.contact_person || '';
      this.taxCode = supplier.tax_code || '';
      this.notes = supplier.notes || '';
      this.supplierStatus = supplier.status || 'active';

      // Format total_money with commas
      const money = supplier.total_money || 0;
      this.total_money = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    formatCurrency() {
      this.total_money = this.total_money.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusColor(status) {
      const colors = {
        'active': 'success',
        'inactive': 'grey',
        'pending': 'orange',
        'blocked': 'error'
      };
      return colors[status] || 'grey';
    },

    getStatusText(status) {
      const labels = {
        'active': 'Đang hoạt động',
        'inactive': 'Không hoạt động',
        'pending': 'Chờ xác nhận',
        'blocked': 'Đã khóa'
      };
      return labels[status] || 'Không xác định';
    },

    toggle() {
      if (!this.loading) {
        this.$emit('toggle');
        this.resetForm();
      }
    },

    resetForm() {
      this.formError = null;
      this.showHistory = false;

      // Form data will be reset by the watcher when dialog is reopened
    },

    submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      this.formError = null;

      // Create supplier data object
      const supplierData = {
        id: this.supplierId,
        name: this.name,
        phone: this.phone,
        email: this.email,
        address: this.address,
        total_money: parseInt(this.total_money ? this.total_money.replace(/\D/g, '') : 0),
        contact_person: this.contactPerson,
        tax_code: this.taxCode,
        notes: this.notes,
        status: this.supplierStatus
      };

      supplierActions.updateSupplier(supplierData)
        .then(res => {
          this.loading = false;
          this.$snackbar.success('Cập nhật nhà cung cấp thành công!');
          this.$emit('refresh');
          this.$emit('toggle');
        })
        .catch(err => {
          console.error('Error updating supplier:', err);
          this.formError = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhà cung cấp!';
          this.$snackbar.error('Có lỗi xảy ra khi cập nhật nhà cung cấp!');
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
  border-color: #3f51b5 !important;
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
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.4) !important;
}

.v-btn.v-btn--contained:hover {
  box-shadow: 0 6px 15px rgba(63, 81, 181, 0.5) !important;
}

.grey.lighten-5 {
  transition: all 0.2s ease;
}

.grey.lighten-5:hover {
  background-color: #f0f2f8 !important;
}

/* Timeline customizations */
.v-timeline {
  padding-top: 0;
  max-height: 200px;
  overflow-y: auto;
}

.v-timeline-item {
  padding-bottom: 8px !important;
}

.v-timeline-item__body {
  padding: 0 !important;
}
</style>
