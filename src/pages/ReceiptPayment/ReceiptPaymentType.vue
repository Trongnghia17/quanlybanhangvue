<template>
  <div class="receipt-payment-type-management">
    <!-- Receipt Payment Type Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Quản lý loại phiếu thu chi</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Quản lý các loại phiếu thu chi trong hệ thống
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>
    </v-card>

    <!-- Receipt Payment Type Management Card -->
    <v-card class="rounded-lg elevation-3">
      <v-card-title class="py-3 d-flex justify-space-between align-center">
        <div>
          <h5 class="text-h6 font-weight-medium">Danh sách loại phiếu thu chi</h5>
        </div>

        <v-btn
          color="primary"
          dark
          class="text-none rounded-lg"
          elevation="1"
          @click="openCreateDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Thêm loại phiếu
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo tên"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
              @input="debouncedSearch"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="type"
              :items="typeOptions"
              outlined
              dense
              hide-details
              label="Loại phiếu"
              @change="fetchReceiptTypes"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="12" md="5" class="d-flex justify-end align-center">
            <v-btn
              color="info"
              class="text-none rounded-lg"
              elevation="0"
              @click="fetchReceiptTypes"
            >
              <v-icon left>mdi-refresh</v-icon>
              Làm mới
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Receipt Payment Type Data Table -->
      <v-data-table
        :headers="headers"
        :items="receiptTypes"
        :loading="loading"
        :search="search"
        :items-per-page="perPage"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
          'items-per-page-text': 'Số dòng mỗi trang'
        }"
        :server-items-length="totalItems"
        @update:options="handlePageChange"
        class="elevation-0 custom-data-table"
      >
        <!-- Index Column -->
        <template v-slot:item.index="{ index }">
          {{ index + 1 }}
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status ? 'success' : 'error'"
            small
            text-color="white"
          >
            {{ item.status ? 'Hoạt động' : 'Không hoạt động' }}
          </v-chip>
        </template>

        <!-- Created Date Column -->
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="error"
                icon
                small
                v-bind="attrs"
                v-on="on"
                @click="confirmDelete(item)"
              >
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Xóa</span>
          </v-tooltip>
        </template>

        <!-- No Data Message -->
        <template v-slot:no-data>
          <div class="pa-5 text-center">
            <v-icon large color="grey lighten-1">mdi-information-outline</v-icon>
            <p class="mt-3 text-subtitle-1 grey--text text--darken-1">
              Không có dữ liệu loại phiếu thu chi nào
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create Receipt Type Dialog -->
    <create-receipt-type-dialog
      :open="createDialogOpen"
      :loading="dialogLoading"
      @close="createDialogOpen = false"
      @create="createReceiptType"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="headline">
          Xác nhận xóa
        </v-card-title>
        <v-card-text>
          Bạn có chắc muốn xóa loại phiếu "{{ selectedItem ? selectedItem.name : '' }}" này không?
          <br>
          <span class="red--text">Hành động này không thể hoàn tác.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="deleteDialog = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            text
            @click="deleteReceiptType"
            :loading="deleteLoading"
          >
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import receiptTypeApi from '@/api/receipt_type';
import { debounce } from 'lodash';
import CreateReceiptTypeDialog from '@/components/Dialogs/ReceiptPayment/CreateReceiptType.vue';

export default {
  name: 'ReceiptPaymentType',
  components: {
    CreateReceiptTypeDialog
  },
  data() {
    return {
      // Table data
      receiptTypes: [],
      headers: [
        { text: 'STT', value: 'index', sortable: false, width: '60px' },
        { text: 'ID', value: 'id', width: '80px' },
        { text: 'Tên loại phiếu', value: 'name', width: '300px' },
        { text: 'Trạng thái', value: 'status', width: '150px' },
        { text: 'Ngày tạo', value: 'created_at', width: '180px' },
        { text: 'Thao tác', value: 'actions', sortable: false, align: 'center', width: '100px' }
      ],
      loading: false,

      // Search and filters
      search: '',
      type: null,
      typeOptions: [
        { text: 'Tất cả', value: null },
        { text: 'Phiếu thu', value: 1 },
        { text: 'Phiếu chi', value: 2 }
      ],

      // Pagination
      page: 1,
      perPage: 10,
      totalItems: 0,

      // Dialogs
      createDialogOpen: false,
      deleteDialog: false,
      dialogLoading: false,
      deleteLoading: false,
      selectedItem: null,

      // Snackbar
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },
  created() {
    this.debouncedSearch = debounce(() => {
      this.fetchReceiptTypes();
    }, 500);
    this.fetchReceiptTypes();
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date)
        ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';
    },
    async fetchReceiptTypes() {
      this.loading = true;
      try {
        const payload = {
          name: this.search || undefined,
          type: this.type || undefined,
          page: this.page,
          per_page: this.perPage
        };

        const response = await receiptTypeApi.actions.getListReceiptType(payload);
        if (response.data.success) {
          this.receiptTypes = response.data.data;
          this.totalItems = response.data.meta.total;
        } else {
          this.showSnackbar('Không thể tải dữ liệu loại phiếu thu chi', 'error');
        }
      } catch (error) {
        console.error('Error fetching receipt types:', error);
        this.showSnackbar('Đã xảy ra lỗi khi tải dữ liệu', 'error');
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(options) {
      this.page = options.page;
      this.perPage = options.itemsPerPage;
      this.fetchReceiptTypes();
    },
    openCreateDialog() {
      this.createDialogOpen = true;
    },
    async createReceiptType(data) {
      this.dialogLoading = true;
      try {
        const response = await receiptTypeApi.actions.createReceiptType(data);
        if (response.data.success) {
          this.showSnackbar('Tạo loại phiếu thu chi thành công', 'success');
          this.createDialogOpen = false;
          this.fetchReceiptTypes();
        } else {
          this.showSnackbar(response.data.message || 'Không thể tạo loại phiếu thu chi', 'error');
        }
      } catch (error) {
        console.error('Error creating receipt type:', error);
        this.showSnackbar('Đã xảy ra lỗi khi tạo loại phiếu thu chi', 'error');
      } finally {
        this.dialogLoading = false;
      }
    },
    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },
    async deleteReceiptType() {
      if (!this.selectedItem) return;

      this.deleteLoading = true;
      try {
        const response = await receiptTypeApi.actions.deleteReceiptType(this.selectedItem.id);
        if (response.data.success) {
          this.showSnackbar('Xóa loại phiếu thu chi thành công', 'success');
          this.deleteDialog = false;
          this.fetchReceiptTypes();
        } else {
          this.showSnackbar(response.data.message || 'Không thể xóa loại phiếu thu chi', 'error');
        }
      } catch (error) {
        console.error('Error deleting receipt type:', error);
        this.showSnackbar('Đã xảy ra lỗi khi xóa loại phiếu thu chi', 'error');
      } finally {
        this.deleteLoading = false;
      }
    },
    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  }
};
</script>

<style scoped>
.custom-data-table {
  border-radius: 0 0 8px 8px;
}
.search-field ::v-deep .v-input__slot {
  min-height: 40px !important;
}
</style>
