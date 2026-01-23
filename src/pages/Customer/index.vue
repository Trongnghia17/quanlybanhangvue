<template>
  <div>
    <!-- Page Header -->
    <v-card class="mb-6 rounded-lg elevation-3">
      <v-sheet
        color="primary"
        dark
        class="pa-3"
      >
        <v-row align="center" no-gutters>
          <v-col>
            <div class="d-flex align-center">
              <v-icon size="32" class="mr-3">mdi-account-group</v-icon>
              <h2 class="text-h5 font-weight-medium mb-0">Quản lý khách hàng</h2>
            </div>
          </v-col>
          <v-col class="text-right">
            <v-chip
              color="white"
              text-color="primary"
              class="font-weight-bold"
            >
              <v-icon left small>mdi-account-multiple</v-icon>
              {{totalItems}} khách hàng
            </v-chip>
          </v-col>
        </v-row>
      </v-sheet>
    </v-card>

    <!-- Main Content Area -->
    <v-card class="rounded-lg elevation-3">
      <v-card-title class="py-4">
        <v-row align="center">
          <v-col cols="12" md="2">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tên/SĐT/Email"
              hide-details
              outlined
              dense
              clearable
              class="search-field"
              @keyup.enter="fetchListCustomers()"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="healthNeedFilter"
              :items="healthNeedsList"
              label="Nhu cầu sức khỏe"
              prepend-inner-icon="mdi-heart-pulse"
              outlined
              dense
              clearable
              hide-details
              class="search-field"
              placeholder="Lọc theo nhu cầu"
            ></v-select>
          </v-col>

          <v-col cols="12" md="1">
            <v-btn
              icon
              @click="fetchListCustomers()"
              class="search-field"
              color="primary"
            >
              <v-icon>mdi-filter-variant</v-icon>
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="6" class="d-flex justify-end">
            <v-btn
              color="success"
              dark
              @click="exportCustomers"
              class="px-4 mr-3 font-weight-medium text-none rounded-lg"
              elevation="2"
              :loading="exportLoading"
            >
              <v-icon left>mdi-file-export</v-icon>
              Xuất danh sách
            </v-btn>
            <v-btn
              color="primary"
              dark
              @click="openDialog = !openDialog"
              class="px-4 font-weight-medium text-none rounded-lg"
              elevation="2"
            >
              <v-icon left>mdi-account-plus</v-icon>
              Thêm khách hàng mới
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
                <v-avatar color="primary lighten-5" size="52" class="mr-4">
                  <v-icon color="primary" size="28">mdi-cash-multiple</v-icon>
                </v-avatar>
                <div>
                  <div class="text-overline grey--text">Tổng dư nợ</div>
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
                  <v-icon color="green" size="28">mdi-account-plus</v-icon>
                </v-avatar>
                <div>
                  <div class="text-overline grey--text">Khách hàng mới</div>
                  <div class="text-h6 font-weight-bold">
                    {{ getNewCustomersCount() }} <span class="text-caption grey--text">trong tháng</span>
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
                  <div class="text-overline grey--text">Giao dịch gần đây</div>
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
        :items="listCustomers"
        :search="search"
        :items-per-page="perPage"
        :server-items-length="totalItems"
        v-model:options="tableOptions"
        loading-text="Đang tải dữ liệu..."
        sort-by="stt"
        class="elevation-0 custom-data-table"
        fixed-header
        :loading="tableLoading"
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
        @update:options="updateDisplayedItems"
      >
        <template v-slot:item.stt="{ item }">
          <div class="font-weight-medium">{{getItemNumber(item)}}</div>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary lighten-5" class="mr-2">
              <span class="primary--text text--darken-1 font-weight-bold">{{getInitials(item.name)}}</span>
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

        <template v-slot:item.note="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey darken-1" class="mr-1">mdi-note-text</v-icon>
            <v-tooltip bottom v-if="item.note && item.note.length > 30">
              <template v-slot:activator="{ on, attrs }">
                <span class="text-truncate note-cell" v-bind="attrs" v-on="on">
                  {{item.note}}
                </span>
              </template>
              <span>{{item.note}}</span>
            </v-tooltip>
            <span v-else class="text-truncate note-cell">{{item.note || 'N/A'}}</span>
          </div>
        </template>

        <template v-slot:item.health_needs="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey darken-1" class="mr-1">mdi-heart-pulse</v-icon>
            <div v-if="item.health_needs && item.health_needs.length > 0">
              <v-chip
                v-for="(need, index) in item.health_needs.slice(0, 2)"
                :key="index"
                x-small
                color="primary"
                outlined
                class="mr-1 mb-1"
              >
                {{ need }}
              </v-chip>
              <v-tooltip bottom v-if="item.health_needs.length > 2">
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    x-small
                    color="grey"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  >
                    +{{ item.health_needs.length - 2 }}
                  </v-chip>
                </template>
                <div>
                  <div v-for="(need, index) in item.health_needs.slice(2)" :key="index">
                    {{ need }}
                  </div>
                </div>
              </v-tooltip>
            </div>
            <span v-else class="grey--text">N/A</span>
          </div>
        </template>

        <template v-slot:item.total_money="{ item }">
          <div class="font-weight-medium" :class="{'red--text': item.total_money > 50000000}">
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
              <v-list-item @click="editCustomer(item)">
                <v-list-item-icon>
                  <v-icon color="primary">mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Chỉnh sửa</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="deleteCustomer(item)">
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
            <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
            <div class="text-subtitle-1 grey--text text--darken-1">Chưa có khách hàng nào</div>
            <v-btn
              color="primary"
              class="mt-4"
              outlined
              @click="openDialog = true"
            >
              <v-icon left>mdi-account-plus</v-icon>
              Thêm khách hàng mới
            </v-btn>
          </div>
        </template>

        <template v-slot:progress>
          <v-progress-linear
            color="primary"
            indeterminate
            absolute
            top
          ></v-progress-linear>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create and Update Dialogs -->
    <createCustomer
      :open="openDialog"
      @toggle="openDialog = !openDialog"
      @refresh="fetchListCustomers"
    />
    <UpdateCustomer
      :open="openDialogUpdate"
      @toggle="openDialogUpdate = !openDialogUpdate"
      :customer="selectedCustomer"
      @refresh="fetchListCustomers"
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
          <p class="text-subtitle-1">Bạn có chắc chắn muốn xóa khách hàng <strong>{{ customerToDelete?.name }}</strong>?</p>
          <p class="text-body-2 grey--text text--darken-1 mt-2">Hành động này không thể hoàn tác.</p>
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
import createCustomer from '@/components/Dialogs/Customers/Create.vue'
import UpdateCustomer from '@/components/Dialogs/Customers/Update.vue'
import customerModule from '@/api/customers'
const customerActions = customerModule.actions

export default {
  components: {
    createCustomer,
    UpdateCustomer
  },
  data() {
    return {
      tableOptions: {},
      search: '',
      healthNeedFilter: null,
      healthNeedsList: [
        'Xương khớp',
        'Tiểu đường',
        'Tăng cân',
        'Giảm cân',
        'Con cần dinh dưỡng',
        'Tiêu hóa'
      ],
      tableLoading: false,
      exportLoading: false,
      // Pagination parameters
      page: 1,
      perPage: 10,
      totalItems: 0,
      headers: [
        { text: 'STT', value: 'stt', width: '70px' },
        { text: 'Tên khách hàng', value: 'name', width: '220px' },
        { text: 'Số điện thoại', value: 'phone', width: '150px' },
        { text: 'Email', value: 'email', width: '180px' },
        { text: 'Địa chỉ', value: 'address' },
        { text: 'Thông tin chi tiết', value: 'note', width: '200px' },
        { text: 'Nhu cầu sức khỏe', value: 'health_needs', width: '250px' },
        { text: 'Công nợ', value: 'total_money', width: '150px'},
        { text: 'Cập nhật lúc', value: 'updated_at', width: '180px'},
        { text: '', value: 'action', sortable: false, width: '70px', align: 'center' },
      ],
      openDialog: false,
      openDialogUpdate: false,
      listCustomers: [],
      selectedCustomer: {},

      // Delete dialog data
      deleteDialog: false,
      customerToDelete: null,
      deleteLoading: false
    }
  },
  methods: {
    updateDisplayedItems(options) {
      // Extract pagination options
      const { itemsPerPage, page, sortBy, sortDesc } = options;

      // Now you can use these values in your API call
      this.fetchListCustomers(page, itemsPerPage, sortBy, sortDesc);
    },
    editCustomer(item) {
      this.selectedCustomer = item;
      this.openDialogUpdate = true;
    },

    // Delete customer methods
    deleteCustomer(item) {
      this.customerToDelete = item;
      this.deleteDialog = true;
    },

    cancelDelete() {
      this.deleteDialog = false;
      setTimeout(() => {
        this.customerToDelete = null;
      }, 300);
    },

    confirmDelete() {
      if (!this.customerToDelete) return;

      this.deleteLoading = true;

      customerActions.deleteCustomer(this.customerToDelete.id)
        .then(() => {
          this.$snackbar.success('Xóa khách hàng thành công!');
          this.fetchListCustomers();
          this.deleteDialog = false;
        })
        .catch(error => {
          console.error('Delete error:', error);
          this.$snackbar.error('Không thể xóa khách hàng. Vui lòng thử lại.');
        })
        .finally(() => {
          this.deleteLoading = false;
          setTimeout(() => {
            this.customerToDelete = null;
          }, 300);
        });
    },

    init() {
      this.fetchListCustomers();
    },

    fetchListCustomers(page = 1, itemsPerPage = 10, sortBy = [], sortDesc = []) {
      this.tableLoading = true;
      this.page = page;
      this.perPage = itemsPerPage;

      let searchParams = {
        search: this.search,
        page: page,
        per_page: itemsPerPage
      }

      // Thêm filter nhu cầu sức khỏe nếu có
      if (this.healthNeedFilter) {
        searchParams.health_need = this.healthNeedFilter;
      }

      customerActions.getCustomers(searchParams).then(res => {
        this.listCustomers = res.data.data;
        this.totalItems = res.data.meta?.total || 0;
      }).catch(err => {
        this.$snackbar.error('Không thể tải danh sách khách hàng');
        console.error('Error loading customers:', err);
      }).finally(() => {
        this.tableLoading = false;
      });
    },

    getItemNumber(item) {
      const index = this.listCustomers.indexOf(item);
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
    // Note: This is calculating based on the current page only
    // For accurate statistics across all pages, consider adding a dedicated API endpoint
    getTotalDebt() {
      return this.listCustomers.reduce((sum, customer) => sum + (customer.total_money || 0), 0);
    },

    // Get new customers count (for stats card)
    // Note: This is calculating based on the current page only
    // For accurate statistics across all pages, consider adding a dedicated API endpoint
    getNewCustomersCount() {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      return this.listCustomers.filter(customer => {
        return customer.created_at && new Date(customer.created_at) > oneMonthAgo;
      }).length;
    },

    // Get recent transactions count (for stats card)
    getRecentTransactions() {
      // This would ideally come from your transactions API
      return Math.floor(Math.random() * 20) + 5;
    },
    
    exportCustomers() {
      this.exportLoading = true;
      
      // Prepare export parameters (can include filters if needed)
      let exportParams = {
        search: this.search
      };
      
      customerActions.exportCustomers(exportParams)
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
          let filename = 'danh-sach-khach-hang.xlsx';
          
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
          
          this.$snackbar.success('Xuất danh sách khách hàng thành công!');
        })
        .catch(error => {
          console.error('Export error:', error);
          this.$snackbar.error('Không thể xuất danh sách khách hàng. Vui lòng thử lại.');
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
  background-color: rgba(25, 118, 210, 0.05) !important;
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

.note-cell {
  max-width: 800px;
  display: inline-block;
  cursor: pointer;
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
  background: #1976D2;
}
</style>
