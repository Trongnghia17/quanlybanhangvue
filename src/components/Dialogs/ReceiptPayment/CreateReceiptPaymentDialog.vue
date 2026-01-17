<template>
  <v-dialog
    v-model="dialog"
    :width="600"
    :max-width="1200"
    :min-width="320"
    fullscreen-breakpoint="sm"
    scrollable
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-lg elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium">
          <v-icon left>{{ isReceipt ? 'mdi-cash-plus' : 'mdi-cash-minus' }}</v-icon>
          {{ isReceipt ? 'Tạo phiếu thu' : 'Tạo phiếu chi' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <v-row>
            <!-- Nhóm người nhận -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.partner_group_id"
                :items="partnerGroupOptions"
                label="Nhóm người nhận"
                prepend-icon="mdi-account-group"
                outlined
                dense
                :rules="partnerGroupRules"
                @change="onPartnerGroupChange"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-select>
            </v-col>

            <!-- Tên người nhận -->
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-if="formData.partner_group_id !== 4"
                v-model="formData.partner_id"
                :items="partnerOptions"
                :loading="loadingPartners"
                label="Tên người nhận"
                prepend-icon="mdi-account"
                outlined
                dense
                :rules="partnerRules"
                :disabled="!formData.partner_group_id"
                item-text="name"
                item-value="id"
                @change="onPartnerChange"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-autocomplete>

              <!-- Manual partner name input for "Other" option -->
              <v-text-field
                v-else
                v-model="formData.partner_name"
                label="Tên người nhận"
                prepend-icon="mdi-account-edit"
                outlined
                dense
                :rules="partnerNameRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
                placeholder="Nhập tên người nhận"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <!-- Chọn loại phiếu -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.receipt_type_id"
                :items="receiptTypeOptions"
                :loading="loadingReceiptTypes"
                label="Chọn loại phiếu"
                prepend-icon="mdi-file-document"
                outlined
                dense
                :rules="receiptTypeRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
                item-text="name"
                item-value="id"
              ></v-select>
            </v-col>

            <!-- Số tiền -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.price"
                label="Số tiền"
                prepend-icon="mdi-cash"
                outlined
                dense
                :rules="priceRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
                @input="formatPrice"
                @focus="$event.target.select()"
                suffix="VND"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <!-- Loại thanh toán -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.payment_type"
                :items="paymentTypeOptions"
                label="Loại thanh toán"
                prepend-icon="mdi-credit-card"
                outlined
                dense
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-select>
            </v-col>

            <!-- Thời gian -->
            <v-col cols="12" sm="6">
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formData.time"
                    label="Thời gian"
                    prepend-icon="mdi-calendar"
                    readonly
                    outlined
                    dense
                    class="mb-2"
                    color="primary"
                    hide-details="auto"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="formData.time"
                  no-title
                  @input="dateMenu = false"
                  :max="getCurrentDate()"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <v-row>
            <!-- Ghi chú -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.note"
                label="Ghi chú"
                prepend-icon="mdi-text"
                outlined
                dense
                rows="3"
                auto-grow
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12">
              <v-checkbox
                v-model="formData.is_other_income"
                label="Hoạch toán kết quả kinh doanh"
                color="primary"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          class="text-none"
          @click="closeDialog"
          :disabled="loading"
        >
          Hủy
        </v-btn>
        <v-btn
          v-if="isReceipt"
          color="success"
          class="text-none"
          elevation="1"
          @click="createReceipt"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon left>mdi-cash-plus</v-icon>
          Tạo phiếu thu
        </v-btn>
        <v-btn
          v-else
          color="error"
          class="text-none"
          elevation="1"
          @click="createPayment"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon left>mdi-cash-minus</v-icon>
          Tạo phiếu chi
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import customersApi from '@/api/customers';
import suppliersApi from '@/api/suppliers';
import receiptTypeApi from '@/api/receipt_type';

export default {
  name: 'CreateReceiptPaymentDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    isReceipt: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      dateMenu: false,

      // Partner data
      loadingPartners: false,
      partnerOptions: [],
      partnerGroupOptions: [
        { text: 'Khách hàng', value: 1 },
        { text: 'Nhà cung cấp', value: 2 },
        { text: 'Khác', value: 4 }
      ],

      // Receipt type data
      loadingReceiptTypes: false,
      receiptTypeOptions: [],

      // Payment type options
      paymentTypeOptions: [
        { text: 'Tiền mặt', value: 'cash' },
        { text: 'Chuyển khoản', value: 'bank' },
        { text: 'Thẻ tín dụng', value: 'card' }
      ],

      // Form data
      formData: {
        partner_group_id: null,
        partner_id: null,
        partner_name: null,
        time: this.getCurrentDate(),
        note: null,
        price: '',
        receipt_type_id: null,
        payment_type: 'cash',
        is_other_income: true
      },

      // Validation rules
      partnerGroupRules: [
        v => !!v || 'Nhóm người nhận là bắt buộc'
      ],
      partnerRules: [
        v => !!v || 'Tên người nhận là bắt buộc'
      ],
      partnerNameRules: [
        v => !!v || 'Tên người nhận là bắt buộc',
        v => (v && v.trim().length >= 2) || 'Tên phải có ít nhất 2 ký tự'
      ],
      receiptTypeRules: [
        v => !!v || 'Loại phiếu là bắt buộc'
      ],
      priceRules: [
        v => !!v || 'Số tiền là bắt buộc',
        v => (!!v && parseInt(v.replace(/\D/g, '')) > 0) || 'Số tiền phải lớn hơn 0'
      ]
    };
  },
  watch: {
    dialog(val) {
      if (val) {
        this.resetForm();
        this.loadReceiptTypes();
      }
    },
    isReceipt(val) {
      if (this.dialog) {
        this.loadReceiptTypes();
      }
    }
  },
  methods: {
    getCurrentDate() {
      const now = new Date();
      return now.toISOString().substr(0, 10);
    },
    closeDialog() {
      this.$emit('update:dialog', false);
    },
    resetForm() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
      this.formData = {
        partner_group_id: null,
        partner_id: null,
        partner_name: null,
        time: this.getCurrentDate(),
        note: null,
        price: '',
        receipt_type_id: null,
        payment_type: 'cash',
        is_other_income: true
      };
      this.partnerOptions = [];
    },
    onPartnerGroupChange() {
      this.formData.partner_id = null;
      this.formData.partner_name = null;
      this.partnerOptions = [];

      if (this.formData.partner_group_id && this.formData.partner_group_id !== 4) {
        this.loadPartners();
      }
    },
    onPartnerChange(partnerId) {
      if (partnerId) {
        const selectedPartner = this.partnerOptions.find(p => p.id === partnerId);
        if (selectedPartner) {
          this.formData.partner_name = selectedPartner.name;
        }
      } else {
        this.formData.partner_name = null;
      }
    },
    formatPrice(value) {
      if (!value) return '';

      // Remove all non-numeric characters
      const numericValue = value.toString().replace(/\D/g, '');

      // Format with thousands separators
      this.formData.price = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    async loadPartners() {
      this.loadingPartners = true;
      try {
        if (this.formData.partner_group_id === 1) {
          // Load customers
          const response = await customersApi.actions.getCustomers({});
          if (response.data.success && response.data.data) {
            this.partnerOptions = response.data.data.map(customer => ({
              id: customer.id,
              name: customer.name,
              phone: customer.phone
            }));
          }
        } else if (this.formData.partner_group_id === 2) {
          // Load suppliers
          const response = await suppliersApi.actions.getSuppliers({});
          if (response.data.success && response.data.data) {
            this.partnerOptions = response.data.data.map(supplier => ({
              id: supplier.id,
              name: supplier.name,
              phone: supplier.phone
            }));
          }
        }
      } catch (error) {
        console.error('Error loading partners:', error);
        this.$emit('error', 'Không thể tải danh sách đối tác');
      } finally {
        this.loadingPartners = false;
      }
    },
    async loadReceiptTypes() {
      this.loadingReceiptTypes = true;
      try {
        const type = this.isReceipt ? 1 : 2; // 1 for receipt, 2 for payment
        const response = await receiptTypeApi.actions.getListReceiptType({ type });
        if (response.data.success && response.data.data) {
          this.receiptTypeOptions = response.data.data;

          // Reset receipt type id when switching between receipt/payment
          this.formData.receipt_type_id = null;
        }
      } catch (error) {
        console.error('Error loading receipt types:', error);
        this.$emit('error', 'Không thể tải danh sách loại phiếu');
      } finally {
        this.loadingReceiptTypes = false;
      }
    },
    getPayloadData() {
      const priceValue = parseInt(this.formData.price.replace(/\D/g, ''));

      return {
        partner_group_id: this.formData.partner_group_id,
        partner_id: this.formData.partner_group_id === 4 ? null : this.formData.partner_id,
        partner_name: this.formData.partner_group_id === 4 ? this.formData.partner_name : this.formData.partner_name,
        time: this.formData.time,
        note: this.formData.note || null,
        price: priceValue.toString(),
        receipt_type_id: this.formData.receipt_type_id,
        payment_type: this.formData.payment_type,
        is_other_income: this.formData.is_other_income ? 1 : 0
      };
    },
    createReceipt() {
      if (!this.$refs.form.validate()) return;
      const payload = this.getPayloadData();
      this.$emit('create-receipt', payload);
    },
    createPayment() {
      if (!this.$refs.form.validate()) return;
      const payload = this.getPayloadData();
      this.$emit('create-payment', payload);
    }
  }
};
</script>
