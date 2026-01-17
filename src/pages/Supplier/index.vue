<template>
  <div>
    <!-- Page Header -->
    <v-card class="mb-6 rounded-lg elevation-3">
      <v-sheet
        color="deep-purple"
        dark
        class="pa-3"
      >
        <v-row align="center" no-gutters>
          <v-col>
            <div class="d-flex align-center">
              <v-icon size="32" class="mr-3">mdi-truck-delivery</v-icon>
              <h2 class="text-h5 font-weight-medium mb-0">Quản lý nhà cung cấp</h2>
            </div>
          </v-col>
          <v-col class="text-right">
            <v-chip
              color="white"
              text-color="deep-purple"
              class="font-weight-bold"
            >
              <v-icon left small>mdi-account-group</v-icon>
              {{totalItems}} nhà cung cấp
            </v-chip>
          </v-col>
        </v-row>
      </v-sheet>
    </v-card>

    <!-- Main Content Area -->
    <v-card class="rounded-lg elevation-3">
      <v-card-title class="py-4">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo Tên/SĐT/Email nhà cung cấp"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
              @input="onSearchInput"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end">
            <v-btn
              color="success"
              dark
              @click="exportSuppliers"
              class="px-4 mr-3 font-weight-medium text-none rounded-lg"
              elevation="2"
              :loading="exportLoading"
            >
              <v-icon left>mdi-file-export</v-icon>
              Xuất danh sách
            </v-btn>
            <v-btn
              color="deep-purple"
              dark
              @click="openDialog = !openDialog"
              class="px-4 font-weight-medium text-none rounded-lg"
              elevation="2"
            >
              <v-icon left>mdi-plus</v-icon>
              Thêm nhà cung cấp mới
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Stats Summary -->
      <v-card-text class="pa-0">
        <v-row class="ma-0">
          <v-col cols="12" sm="4" class="pa-3">
            <v-card outlined class="rounded-lg">
              <v-card-text class="d-flex align-center">
                <v-avatar color="deep-purple lighten-5" size="52" class="mr-4">
                  <v-icon color="deep-purple" size="28">mdi-cash-multiple</v-icon>
                </v-avatar>
                <div>
                  <div class="text-overline grey--text">Tổng công nợ</div>
                  <div class="text-h6 font-weight-bold">
                    {{formatCurrency(getTotalDebt())}}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" class="pa-3">
            <v-card outlined class="rounded-lg">
              <v-card-text class="d-flex align-center">
                <v-avatar color="green lighten-5" size="52" class="mr-4">
                  <v-icon color="green" size="28">mdi-account-check</v-icon>
                </v-avatar>
                <div>
                  <div class="text-overline grey--text">Nhà cung cấp mới</div>
                  <div class="text-h6 font-weight-bold">
                    {{ getNewSuppliersCount() }} <span class="text-caption grey--text">trong tháng</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" class="pa-3">
            <v-card outlined class="rounded-lg">
              <v-card-text class="d-flex align-center">
                <v-avatar color="amber lighten-5" size="52" class="mr-4">
                  <v-icon color="amber darken-2" size="28">mdi-cart-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-overline grey--text">Nhập hàng gần đây</div>
                  <div class="text-h6 font-weight-bold">
                    {{ getRecentTransactions() }} <span class="text-caption grey--text">trong tuần</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="listSuppliers"
        :items-per-page="perPage"
        :server-items-length="totalItems"
        loading-text="Đang tải dữ liệu..."
        sort-by="stt"
        class="elevation-0 custom-data-table"
        fixed-header
        :loading="tableLoading"
        @update:options="updateDisplayedItems"
        :footer-props="{
          'items-per-page-text': 'Số bản ghi mỗi trang:',
          'items-per-page-options': [10, 20, 50, 100],
          'show-first-last-page': true,
          'show-current-page': true,
          'first-icon': 'mdi-page-first',
          'last-icon': 'mdi-page-last',
          'prev-icon': 'mdi-chevron-left',
          'next-icon': 'mdi-chevron-right'
        }"
      >
        <template v-slot:item.stt="{ item }">
          <div class="font-weight-medium">{{getItemNumber(item)}}</div>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="deep-purple lighten-5" class="mr-2">
              <span class="deep-purple--text text--darken-1 font-weight-bold">{{getInitials(item.name)}}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{item.name}}</div>
              <div class="text-caption grey--text" v-if="item.email">{{item.email}}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.phone="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey darken-1" class="mr-1">mdi-phone</v-icon>
            {{item.phone || 'N/A'}}
          </div>
        </template>

        <template v-slot:item.address="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey darken-1" class="mr-1">mdi-map-marker</v-icon>
            <span class="text-truncate address-cell">{{item.address || 'N/A'}}</span>
          </div>
        </template>

        <template v-slot:item.debt="{ item }">
          <div class="font-weight-medium" :class="{'red--text': item.debt > 50000000}">
            {{formatCurrency(item.debt)}}
          </div>
        </template>

        <template v-slot:item.updated_at="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey darken-1" class="mr-1">mdi-calendar-clock</v-icon>
            {{formatDate(item.updated_at)}}
          </div>
        </template>

        <template v-slot:item.action="{ item }">
          <v-menu
            offset-y
            left
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="editSupplier(item)">
                <v-list-item-icon>
                  <v-icon color="primary">mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Chỉnh sửa</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="deleteSupplier(item)">
                <v-list-item-icon>
                  <v-icon color="error">mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="error--text">Xóa</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center">
            <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-truck-delivery-outline</v-icon>
            <div class="text-subtitle-1 grey--text text--darken-1">Chưa có nhà cung cấp nào</div>
            <v-btn
              color="deep-purple"
              class="mt-4"
              outlined
              @click="openDialog = true"
            >
              <v-icon left>mdi-plus</v-icon>
              Thêm nhà cung cấp mới
            </v-btn>
          </div>
        </template>

        <template v-slot:progress>
          <v-progress-linear
            color="deep-purple"
            indeterminate
            absolute
            top
          ></v-progress-linear>
        </template>

      </v-data-table>
    </v-card>

    <!-- Create and Update Dialogs -->
    <createSupplier
      :open="openDialog"
      @toggle="openDialog = !openDialog"
      @refresh="fetchListSuppliers"
    />
    <UpdateSupplier
      :open="openDialogUpdate"
      @toggle="openDialogUpdate = !openDialogUpdate"
      :supplier="selectedSupplier"
      @refresh="fetchListSuppliers"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="headline error--text">
          <v-icon left color="error" size="24">mdi-alert-circle</v-icon>
          Xác nhận xóa
        </v-card-title>
        <v-card-text class="py-3">
          <p class="text-subtitle-1">Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{{ supplierToDelete?.name }}</strong>?</p>
          <p class="text-body-2 grey--text text--darken-1 mt-2">Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.</p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            color="grey darken-1"
            @click="cancelDelete"
            :disabled="deleteLoading"
          >
            Hủy bỏ
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="confirmDelete"
            elevation="2"
            class="px-4"
          >
            <v-icon left>mdi-delete</v-icon>
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import createSupplier from '@/components/Dialogs/Suppliers/Create.vue'
import UpdateSupplier from '@/components/Dialogs/Suppliers/Update.vue'
import supplierModule from '@/api/suppliers'

const supplierActions = supplierModule.actions

export default {
  components: {
    createSupplier,
    UpdateSupplier
  },
  data() {
    return {
      search: '',
      tableLoading: false,
      exportLoading: false,
      // Pagination parameters
      page: 1,
      perPage: 10,
      totalItems: 0,
      headers: [
        { text: 'STT', value: 'stt', width: '70px' },
        { text: 'Tên nhà cung cấp', value: 'name', width: '220px' },
        { text: 'Số điện thoại', value: 'phone', width: '150px' },
        { text: 'Email', value: 'email', width: '180px' },
        { text: 'Địa chỉ', value: 'address' },
        { text: 'Tổng công nợ', value: 'debt', width: '150px'},
        { text: 'Cập nhật lúc', value: 'updated_at', width: '180px'},
        { text: '', value: 'action', sortable: false, width: '70px', align: 'center' },
      ],
      openDialog: false,
      openDialogUpdate: false,
      listSuppliers: [],
      selectedSupplier: {},

      // Delete dialog data
      deleteDialog: false,
      supplierToDelete: null,
      deleteLoading: false
    }
  },
  methods: {
    editSupplier(item) {
      this.selectedSupplier = item;
      this.openDialogUpdate = true;
    },

    // Delete supplier methods
    deleteSupplier(item) {
      this.supplierToDelete = item;
      this.deleteDialog = true;
    },

    cancelDelete() {
      this.deleteDialog = false;
      setTimeout(() => {
        this.supplierToDelete = null;
      }, 300);
    },

    confirmDelete() {
      if (!this.supplierToDelete) return;

      this.deleteLoading = true;

      supplierActions.deleteSupplier(this.supplierToDelete.id)
        .then(() => {
          this.$snackbar.success('Xóa nhà cung cấp thành công!');
          this.fetchListSuppliers();
          this.deleteDialog = false;
        })
        .catch(error => {
          console.error('Delete error:', error);
          this.$snackbar.error('Không thể xóa nhà cung cấp. Vui lòng thử lại.');
        })
        .finally(() => {
          this.deleteLoading = false;
          setTimeout(() => {
            this.supplierToDelete = null;
          }, 300);
        });
    },

    init() {
      this.fetchListSuppliers();
    },

    updateDisplayedItems(options) {
      // Extract pagination options
      const { itemsPerPage, page, sortBy, sortDesc } = options;

      // Now you can use these values in your API call
      this.fetchListSuppliers(page, itemsPerPage, sortBy, sortDesc);
    },

    onSearchInput() {
      // Reset to first page when searching
      this.page = 1;
      // Debounce search to avoid too many API calls
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => {
        this.fetchListSuppliers(this.page, this.perPage);
      }, 300);
    },

    fetchListSuppliers(page = 1, itemsPerPage = 10, sortBy = [], sortDesc = []) {
      this.tableLoading = true;
      this.page = page;
      this.perPage = itemsPerPage;

      const params = {
        page: page,
        per_page: itemsPerPage,
        name: this.search
      };

      // Add sorting if provided
      if (sortBy.length > 0 && sortDesc.length > 0) {
        params.sort_by = sortBy[0];
        params.sort_desc = sortDesc[0] ? 1 : 0;
      }

      supplierActions.getSuppliers(params).then(res => {
        this.listSuppliers = res.data.data;
        this.totalItems = res.data.meta?.total || 0;
      }).catch(err => {
        this.$snackbar.error('Không thể tải danh sách nhà cung cấp');
        console.error('Error loading suppliers:', err);
      }).finally(() => {
        this.tableLoading = false;
      });
    },

    getItemNumber(item) {
      const index = this.listSuppliers.indexOf(item);
      return ((this.page - 1) * this.perPage) + index + 1;
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '0 ₫';
      return value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'});
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    },

    // Get initials for avatar
    getInitials(name) {
      if (!name) return 'N/A';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },

    // Calculate total debt (for stats card)
    getTotalDebt() {
      return this.listSuppliers.reduce((sum, supplier) => sum + (supplier.total_money || 0), 0);
    },

    // Get new suppliers count (for stats card)
    getNewSuppliersCount() {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      return this.listSuppliers.filter(supplier => {
        return supplier.created_at && new Date(supplier.created_at) > oneMonthAgo;
      }).length;
    },

    // Get recent transactions count (for stats card)
    getRecentTransactions() {
      // This would ideally come from your transactions API
      // For now, just return a placeholder value
      return Math.floor(Math.random() * 20) + 5;
    },

    // Export suppliers to Excel file
    exportSuppliers() {
      this.exportLoading = true;

      // Prepare export parameters (can include filters if needed)
      const exportParams = {
        search: this.search
      };

      supplierActions.exportSuppliers(exportParams)
        .then(response => {
          // Create a blob from the response data
          const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          // Create a link element and trigger download
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Set filename from content-disposition header if available, otherwise use default
          const contentDisposition = response.headers['content-disposition'];
          let filename = 'danh-sach-nha-cung-cap.xlsx';

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch.length === 2) {
              filename = filenameMatch[1];
            }
          }

          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.$snackbar.success('Xuất danh sách nhà cung cấp thành công!');
        })
        .catch(error => {
          console.error('Export error:', error);
          this.$snackbar.error('Không thể xuất danh sách nhà cung cấp. Vui lòng thử lại.');
        })
        .finally(() => {
          this.exportLoading = false;
        });
    }
  },
  mounted() {
    this.init();
  }
}
</script>

<style scoped>
.custom-data-table {
  border: none !important;
}

.custom-data-table >>> .v-data-table__wrapper {
  border-radius: 0 0 8px 8px;
}

.custom-data-table >>> th {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
  font-weight: 500 !important;
  background-color: #f5f5f5 !important;
}

.custom-data-table >>> tr:hover {
  background-color: rgba(103, 58, 183, 0.05) !important;
}

.custom-data-table >>> tr td {
  border-bottom: thin solid rgba(0, 0, 0, 0.05) !important;
  padding: 12px 16px !important;
}

.search-field >>> .v-input__prepend-inner {
  margin-top: 8px !important;
}

.search-field >>> .v-text-field__slot input {
  font-size: 0.95rem !important;
}

.address-cell {
  max-width: 180px;
  display: inline-block;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-data-table >>> .v-data-table__wrapper {
    overflow-x: auto;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #673AB7;
}
</style>
