<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="headline">
        <v-icon left color="primary" size="24">mdi-file-export</v-icon>
        Xuất danh sách đơn hàng
      </v-card-title>
      <v-card-text class="py-4">
        <v-form ref="exportForm" v-model="validForm">
          <v-row>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="fromDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedFromDate"
                    label="Từ ngày"
                    prepend-icon="mdi-calendar"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    clearable
                    @click:clear="clearFromDate"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.from"
                  no-title
                  @input="fromDateMenu = false"
                  locale="vi"
                  first-day-of-week="1"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="toDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedToDate"
                    label="Đến ngày"
                    prepend-icon="mdi-calendar"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    clearable
                    @click:clear="clearToDate"
                    :rules="[dateRangeRule]"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.to"
                  no-title
                  @input="toDateMenu = false"
                  locale="vi"
                  first-day-of-week="1"
                  :min="form.from"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <v-select
            v-model="form.type"
            :items="orderTypeOptions"
            label="Loại đơn hàng"
            outlined
            dense
            clearable
            item-text="text"
            item-value="value"
            class="mt-3"
          ></v-select>

          <div class="mt-4 text-body-2 grey--text text--darken-1">
            <v-icon small color="grey" class="mr-1">mdi-information-outline</v-icon>
            <span>Bạn có thể để trống các trường để xuất tất cả dữ liệu</span>
          </div>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="grey darken-1" @click="closeDialog" :disabled="loading">
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="submitExport"
          :disabled="!validForm"
          class="px-5"
        >
          <v-icon left small>mdi-file-excel</v-icon>
          Xuất Excel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import orderModule from '@/api/order'
const orderActions = orderModule.actions

export default {
  name: 'ExportOrdersDialog',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      validForm: true,
      fromDateMenu: false,
      toDateMenu: false,
      form: {
        from: null,
        to: null,
        type: 1 // Default type for sales orders
      },
      orderTypeOptions: [
        { text: 'Bán hàng', value: 1 },
      ]
    }
  },
  computed: {
    formattedFromDate() {
      if (!this.form.from) return '';
      const [year, month, day] = this.form.from.split('-');
      return `${day}/${month}/${year}`;
    },
    formattedToDate() {
      if (!this.form.to) return '';
      const [year, month, day] = this.form.to.split('-');
      return `${day}/${month}/${year}`;
    }
  },
  watch: {
    open(val) {
      this.dialog = val;
    },
    dialog(val) {
      if (!val) {
        this.$emit('toggle');
      }
    }
  },
  methods: {
    clearFromDate() {
      this.form.from = null;
    },
    clearToDate() {
      this.form.to = null;
    },
    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        from: null,
        to: null,
        type: 1 // Reset to default type for sales orders
      };
    },
    dateRangeRule() {
      if (this.form.from && this.form.to) {
        return new Date(this.form.from) <= new Date(this.form.to) || 'Ngày kết thúc phải sau ngày bắt đầu';
      }
      return true;
    },
    async submitExport() {
      if (!this.$refs.exportForm.validate()) return;

      this.loading = true;

      try {
        // Prepare payload with only non-null values
        const payload = {
          type: 1 // Always include type=1 for sales orders
        };
        if (this.form.from) payload.from = this.form.from;
        if (this.form.to) payload.to = this.form.to;

        const response = await orderActions.exportOrders(payload);

        // Create a blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        // Set a meaningful filename with date
        const today = new Date().toISOString().slice(0, 10);
        link.download = `danh_sach_don_hang_${today}.xlsx`;
        link.click();

        URL.revokeObjectURL(link.href);

        this.$snackbar.success('Xuất Excel thành công!');
        this.closeDialog();
      } catch (error) {
        console.error('Export error:', error);
        this.$snackbar.error('Không thể xuất Excel. Vui lòng thử lại.');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.v-text-field--outlined >>> fieldset {
  border-color: rgba(0, 0, 0, 0.15) !important;
}
</style>
