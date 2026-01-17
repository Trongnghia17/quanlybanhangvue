<template>
  <div class="receipt-payment-management">
    <!-- Receipt Payment Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Tổng quan sổ quỹ</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Quản lý các phiếu thu chi và theo dõi dòng tiền trong hệ thống
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-lg elevation-2 receipt-card">
          <v-card-text class="d-flex flex-column pa-4">
            <div class="d-flex align-center">
              <v-icon size="32" color="success">mdi-cash-plus</v-icon>
              <span class="text-subtitle-1 font-weight-medium grey--text text--darken-1 ml-2">Tổng thu</span>
            </div>
            <div class="text-h5 font-weight-bold mt-2 success--text">
              {{ formatCurrency(summaryData.total_receipt || 0) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-lg elevation-2 payment-card">
          <v-card-text class="d-flex flex-column pa-4">
            <div class="d-flex align-center">
              <v-icon size="32" color="error">mdi-cash-minus</v-icon>
              <span class="text-subtitle-1 font-weight-medium grey--text text--darken-1 ml-2">Tổng chi</span>
            </div>
            <div class="text-h5 font-weight-bold mt-2 error--text">
              {{ formatCurrency(Math.abs(summaryData.total_payment || 0)) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters Card -->
    <v-card class="rounded-lg elevation-3 mb-6">
      <v-card-title class="py-3 d-flex justify-space-between align-center">
        <div>
          <h5 class="text-h6 font-weight-medium">Bộ lọc</h5>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filter.type"
              :items="typeOptions"
              outlined
              dense
              label="Loại phiếu"
              hide-details
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-menu
              v-model="startDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="filter.startDate"
                  label="Từ ngày"
                  readonly
                  outlined
                  dense
                  hide-details
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="filter.startDate = null"
                  prepend-inner-icon="mdi-calendar"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="filter.startDate"
                no-title
                @input="startDateMenu = false"
                locale="vi-VN"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-menu
              v-model="endDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="filter.endDate"
                  label="Đến ngày"
                  readonly
                  outlined
                  dense
                  hide-details
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="filter.endDate = null"
                  prepend-inner-icon="mdi-calendar"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="filter.endDate"
                no-title
                @input="endDateMenu = false"
                locale="vi-VN"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="6" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              class="mr-2"
              @click="applyFilter"
            >
              <v-icon left>mdi-filter</v-icon>
              Lọc
            </v-btn>
            <v-btn
              text
              color="grey darken-1"
              @click="resetFilter"
            >
              <v-icon left>mdi-refresh</v-icon>
              Đặt lại
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Receipt Payment List Card -->
    <v-card class="rounded-lg elevation-3">
      <v-card-title class="py-3 d-flex justify-space-between align-center">
        <div>
          <h5 class="text-h6 font-weight-medium">Danh sách phiếu thu chi</h5>
        </div>
        <div>
          <v-btn
            color="success"
            class="text-none rounded-lg mr-2"
            elevation="1"
            @click="openCreateReceiptDialog"
          >
            <v-icon left>mdi-cash-plus</v-icon>
            Tạo phiếu thu
          </v-btn>
          <v-btn
            color="error"
            class="text-none rounded-lg mr-2"
            elevation="1"
            @click="openCreatePaymentDialog"
          >
            <v-icon left>mdi-cash-minus</v-icon>
            Tạo phiếu chi
          </v-btn>
          <v-btn
            color="info"
            class="text-none rounded-lg mr-2"
            elevation="0"
            @click="fetchReceiptPayments"
          >
            <v-icon left>mdi-refresh</v-icon>
            Làm mới
          </v-btn>
        </div>
      </v-card-title>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="receiptPayments"
        :loading="loading"
        :items-per-page="perPage"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
          'items-per-page-text': 'Số dòng mỗi trang'
        }"
        :server-items-length="totalItems"
        @update:options="handlePageChange"
        class="elevation-0 custom-data-table"
      >
        <!-- Code Column -->
        <template v-slot:item.code="{ item }">
          <div class="font-weight-medium">{{ item.code }}</div>
        </template>

        <!-- Type Column -->
        <template v-slot:item.type="{ item }">
          <v-chip
            small
            :color="item.type === 1 ? 'success' : 'error'"
            text-color="white"
          >
            {{ item.type === 1 ? 'Phiếu thu' : 'Phiếu chi' }}
          </v-chip>
        </template>

        <!-- Partner Column -->
        <template v-slot:item.partner_name="{ item }">
          <div>
            <div>{{ item.partner_name || 'N/A' }}</div>
            <div class="caption grey--text">{{ item.partner_group_name }}</div>
          </div>
        </template>

        <!-- Price Column -->
        <template v-slot:item.price="{ item }">
          <span :class="item.type === 1 ? 'success--text' : 'error--text'" class="font-weight-medium">
            {{ formatCurrency(Math.abs(item.price)) }}
          </span>
        </template>

        <!-- Payment Type Column -->
        <template v-slot:item.payment_type="{ item }">
          <v-chip small outlined :color="getPaymentTypeColor(item.payment_type)">
            {{ getPaymentTypeName(item.payment_type) }}
          </v-chip>
        </template>

        <!-- Receipt Type Column -->
        <template v-slot:item.receipt_type="{ item }">
          {{ item.receipt_type ? item.receipt_type.name : 'Tự động' }}
        </template>

        <!-- Created Date Column -->
        <template v-slot:item.created_at="{ item }">
          {{ formatDateTime(item.created_at) }}
        </template>

        <!-- Note Column -->
        <template v-slot:item.note="{ item }">
          <v-tooltip bottom max-width="300px">
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on" class="note-text">{{ item.note || 'N/A' }}</div>
            </template>
            <span>{{ item.note || 'N/A' }}</span>
          </v-tooltip>
        </template>

        <!-- No Data Message -->
        <template v-slot:no-data>
          <div class="pa-5 text-center">
            <v-icon large color="grey lighten-1">mdi-information-outline</v-icon>
            <p class="mt-3 text-subtitle-1 grey--text text--darken-1">
              Không có dữ liệu phiếu thu chi nào
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create Receipt/Payment Dialog -->
    <create-receipt-payment-dialog
      :dialog.sync="createDialog"
      :is-receipt="isReceipt"
      :loading="dialogLoading"
      @error="showSnackbar($event, 'error')"
      @create-receipt="createReceipt"
      @create-payment="createPayment"
    />

    <!-- Snackbar for messages -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      top
      right
      :timeout="3000"
    >
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Đóng
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import receiptPaymentApi from '@/api/receipt_payment';
import { debounce } from 'lodash';
import CreateReceiptPaymentDialog from '@/components/Dialogs/ReceiptPayment/CreateReceiptPaymentDialog.vue';

export default {
  name: 'ReceiptPayment',
  components: {
    CreateReceiptPaymentDialog
  },
  data() {
    return {
      // Data table
      receiptPayments: [],
      loading: false,
      headers: [
        { text: 'Mã phiếu', value: 'code', width: '120px' },
        { text: 'Loại phiếu', value: 'type', width: '120px' },
        { text: 'Đối tác', value: 'partner_name', width: '200px' },
        { text: 'Số tiền', value: 'price', width: '150px' },
        { text: 'Hình thức', value: 'payment_type', width: '120px' },
        { text: 'Loại thu chi', value: 'receipt_type', width: '180px' },
        { text: 'Thời gian', value: 'created_at', width: '180px' },
        { text: 'Ghi chú', value: 'note' }
      ],

      // Pagination
      page: 1,
      perPage: 10,
      totalItems: 0,

      // Filter
      filter: {
        type: null,
        startDate: null,
        endDate: null,
      },
      startDateMenu: false,
      endDateMenu: false,
      typeOptions: [
        { text: 'Phiếu thu', value: 1 },
        { text: 'Phiếu chi', value: 2 }
      ],

      // Summary data
      summaryData: {
        total: 0,
        total_receipt: 0,
        total_payment: 0
      },

      // Snackbar
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',

      // Dialog states
      createDialog: false,
      isReceipt: true,
      dialogLoading: false,
    };
  },
  created() {
    this.debouncedFilter = debounce(() => {
      this.fetchReceiptPayments();
    }, 500);
    this.fetchReceiptPayments();
  },
  methods: {
    formatCurrency(amount) {
      if (!amount && amount !== 0) return 'N/A';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount);
    },
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getPaymentTypeName(type) {
      switch (type) {
        case 'cash':
          return 'Tiền mặt';
        case 'bank':
          return 'Chuyển khoản';
        case 'card':
          return 'Thẻ tín dụng';
        default:
          return 'Khác';
      }
    },
    getPaymentTypeColor(type) {
      switch (type) {
        case 'cash':
          return 'success';
        case 'bank':
          return 'primary';
        case 'card':
          return 'purple';
        default:
          return 'grey';
      }
    },
    async fetchReceiptPayments() {
      this.loading = true;
      try {
        const payload = {
          page: this.page,
          per_page: this.perPage
        };

        if (this.filter.type) {
          payload.type = this.filter.type;
        }

        if (this.filter.startDate) {
          payload.start_date = this.filter.startDate;
        }

        if (this.filter.endDate) {
          payload.end_date = this.filter.endDate;
        }

        const response = await receiptPaymentApi.actions.getListReceiptPayments(payload);

        if (response.data.success) {
          this.receiptPayments = response.data.data.data;
          this.totalItems = response.data.data.total;

          // Update summary data
          if (response.data.total) {
            this.summaryData = response.data.total;
          }
        } else {
          this.showSnackbar('Không thể tải dữ liệu phiếu thu chi', 'error');
        }
      } catch (error) {
        console.error('Error fetching receipt payments:', error);
        this.showSnackbar('Đã xảy ra lỗi khi tải dữ liệu', 'error');
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(options) {
      this.page = options.page;
      this.perPage = options.itemsPerPage;
      this.fetchReceiptPayments();
    },
    applyFilter() {
      this.page = 1;
      this.fetchReceiptPayments();
    },
    resetFilter() {
      this.filter = {
        type: null,
        startDate: null,
        endDate: null
      };
      this.page = 1;
      this.fetchReceiptPayments();
    },
    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    openCreateReceiptDialog() {
      this.isReceipt = true;
      this.createDialog = true;
    },
    openCreatePaymentDialog() {
      this.isReceipt = false;
      this.createDialog = true;
    },
    async createReceipt(payload) {
      this.dialogLoading = true;
      try {
        const response = await receiptPaymentApi.actions.createReceipt(payload);
        if (response.data.success) {
          this.showSnackbar('Tạo phiếu thu thành công');
          this.createDialog = false;
          this.fetchReceiptPayments();
        } else {
          this.showSnackbar(response.data.message || 'Không thể tạo phiếu thu', 'error');
        }
      } catch (error) {
        console.error('Error creating receipt:', error);
        this.showSnackbar('Đã xảy ra lỗi khi tạo phiếu thu', 'error');
      } finally {
        this.dialogLoading = false;
      }
    },
    async createPayment(payload) {
      this.dialogLoading = true;
      try {
        const response = await receiptPaymentApi.actions.createPayment(payload);
        if (response.data.success) {
          this.showSnackbar('Tạo phiếu chi thành công');
          this.createDialog = false;
          this.fetchReceiptPayments();
        } else {
          this.showSnackbar(response.data.message || 'Không thể tạo phiếu chi', 'error');
        }
      } catch (error) {
        console.error('Error creating payment:', error);
        this.showSnackbar('Đã xảy ra lỗi khi tạo phiếu chi', 'error');
      } finally {
        this.dialogLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.custom-data-table {
  border-radius: 0 0 8px 8px;
}
.note-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
