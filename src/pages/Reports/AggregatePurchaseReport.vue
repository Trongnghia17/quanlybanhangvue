<template>
  <div class="aggregate-purchase-report">
    <!-- Report Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Báo cáo nhập hàng tổng hợp</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Thống kê chi tiết hoạt động nhập hàng theo sản phẩm
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>

      <!-- Filters -->

    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 indigo lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon indigo lighten-4 mr-4">
                <v-icon size="28" color="indigo">mdi-package-variant</v-icon>
              </div>
              <div>
                <div class="text-overline indigo--text text--darken-1 mb-1">Tổng sản phẩm</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatNumber(totalItems) }}
                </div>
                <div class="text-caption indigo--text text--darken-1">
                  <v-icon small color="indigo">mdi-package-variant</v-icon>
                  <span class="ml-1">Số sản phẩm đã nhập</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 teal lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon teal lighten-4 mr-4">
                <v-icon size="28" color="teal">mdi-archive</v-icon>
              </div>
              <div>
                <div class="text-overline teal--text text--darken-1 mb-1">Số lượng nhập</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatNumber(getTotalQuantity()) }}
                </div>
                <div class="text-caption teal--text text--darken-1">
                  <v-icon small color="teal">mdi-information-outline</v-icon>
                  <span class="ml-1">Tổng đơn vị sản phẩm</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 deep-purple lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon deep-purple lighten-4 mr-4">
                <v-icon size="28" color="deep-purple">mdi-cash-multiple</v-icon>
              </div>
              <div>
                <div class="text-overline deep-purple--text text--darken-1 mb-1">Chi phí</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getTotalCost()) }}
                </div>
                <div class="text-caption deep-purple--text text--darken-1">
                  <v-icon small color="deep-purple">mdi-chart-areaspline</v-icon>
                  <span class="ml-1">Tổng chi phí nhập hàng</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 amber lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon amber lighten-4 mr-4">
                <v-icon size="28" color="amber darken-2">mdi-truck</v-icon>
              </div>
              <div>
                <div class="text-overline amber--text text--darken-2 mb-1">Nhà cung cấp</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatNumber(getSupplierCount()) }}
                </div>
                <div class="text-caption amber--text text--darken-2">
                  <v-icon small color="amber darken-2">mdi-domain</v-icon>
                  <span class="ml-1">Số nhà cung cấp</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Report Data -->
    <v-card class="rounded-lg elevation-3">
      <v-card-title class="py-3 d-flex justify-space-between align-center">
        <div>
          <h5 class="text-h6 font-weight-medium mb-1">Chi tiết nhập hàng theo sản phẩm</h5>
          <div class="text-caption text-grey">
            {{ formatDateRange(filters.startDate, filters.endDate) }}
          </div>
        </div>
        <div>
          <v-btn
            color="success"
            class="text-none rounded-lg"
            elevation="1"
            @click="exportToExcel"
            :loading="exportLoading"
            :disabled="!reportData.length"
          >
            <v-icon left>mdi-file-excel</v-icon>
            Xuất Excel
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo Tên/Mã sản phẩm"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
              @input="onSearchInput"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="5" md="6">
            <v-row>
              <v-col cols="12" sm="6">
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.startDate"
                      label="Từ ngày"
                      prepend-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      hide-details
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.startDate"
                    @input="startDateMenu = false"
                    no-title
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" sm="6">
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.endDate"
                      label="Đến ngày"
                      prepend-icon="mdi-calendar"
                      readonly
                      outlined
                      dense
                      hide-details
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.endDate"
                    @input="endDateMenu = false"
                    no-title
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" sm="2" md="2" class="d-flex align-center">
            <v-btn
              color="primary"
              class="mr-2 text-none rounded-lg"
              elevation="1"
              @click="applyFilters"
            >
              <v-icon left>mdi-filter</v-icon>
              Lọc
            </v-btn>

            <v-btn
              color="grey lighten-3"
              class="text-none rounded-lg"
              elevation="0"
              @click="resetFilters"
            >
              <v-icon left>mdi-refresh</v-icon>
              Đặt lại
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="reportData"
        :loading="tableLoading"
        :items-per-page="perPage"
        :server-items-length="totalItems"
        :footer-props="{
          'items-per-page-options': [5, 25, 50, 100],
          'items-per-page-text': 'Số dòng mỗi trang',
          'show-first-last-page': true
        }"
        class="elevation-0 custom-data-table"
        sort-by="quantity"
        sort-desc
        @update:options="updateDisplayedItems"
      >
        <template v-slot:item.index="{ index }">
          {{ ((page - 1) * perPage) + index + 1 }}
        </template>

        <template v-slot:item.product.sku="{ item }">
          <div class="font-weight-medium">{{ item.product.sku || 'N/A' }}</div>
        </template>

        <template v-slot:item.product.name="{ item }">
          <div class="d-flex align-center">
            <div>
              <div class="font-weight-medium">{{ item.product.name }}</div>
              <div class="text-caption grey--text" v-if="item.product.description">
                {{ truncateText(item.product.description, 30) }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.quantity="{ item }">
          <div class="font-weight-medium">{{ formatNumber(item.quantity) }}</div>
          <div class="text-caption" v-if="item.sub_unit_quantity > 0">
            + {{ formatNumber(item.sub_unit_quantity) }} (đơn vị phụ)
          </div>
        </template>

        <template v-slot:item.retail_cost="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.retail_cost) }}</div>
          <div class="text-caption grey--text">
            <v-icon small color="grey">mdi-currency-usd</v-icon>
            Đơn giá: {{ formatCurrency(getUnitPrice(item)) }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            color="primary"
            @click="viewDetails(item)"
            class="mr-1"
          >
            <v-icon small>mdi-eye</v-icon>
          </v-btn>

        </template>

        <template v-slot:no-data>
          <v-card flat class="pa-6 text-center mx-auto">
            <v-img
              src="https://cdn.vuetifyjs.com/images/lists/no-results.svg"
              max-width="150"
              class="mx-auto mb-4"
            ></v-img>
            <div class="text-h6 grey--text text--darken-1 mb-2">
              Không có dữ liệu báo cáo
            </div>
            <div class="text-body-2 grey--text mb-4">
              Hãy thay đổi bộ lọc hoặc chọn một khoảng thời gian khác để xem báo cáo
            </div>
            <v-btn color="primary" class="px-5" outlined @click="resetFilters">
              <v-icon left>mdi-refresh</v-icon>
              Đặt lại bộ lọc
            </v-btn>
          </v-card>
        </template>
      </v-data-table>
    </v-card>

    <!-- Product Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="700">
      <v-card class="rounded-lg">
        <v-card-title class="headline primary--text">
          Chi tiết sản phẩm nhập
          <v-spacer></v-spacer>
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-4" v-if="selectedProduct">
          <v-row>
            <v-col cols="12" sm="4" class="text-center">
              <v-avatar size="100" class="mb-2" v-if="selectedProduct.product.image">
                <v-img :src="selectedProduct.product.image" :alt="selectedProduct.product.name"></v-img>
              </v-avatar>
              <v-avatar size="100" class="mb-2 grey lighten-3" v-else>
                <v-icon size="64" color="grey">mdi-package-variant</v-icon>
              </v-avatar>
              <div class="font-weight-bold mt-2">{{ selectedProduct.product.name }}</div>
              <div class="text-caption grey--text">
                SKU: {{ selectedProduct.product.sku || 'N/A' }}
              </div>
            </v-col>

            <v-col cols="12" sm="8">
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Số lượng đã nhập</v-list-item-title>
                    <v-list-item-subtitle>{{ formatNumber(selectedProduct.quantity) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Chi phí nhập hàng</v-list-item-title>
                    <v-list-item-subtitle>{{ formatCurrency(selectedProduct.retail_cost) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Đơn giá nhập</v-list-item-title>
                    <v-list-item-subtitle>{{ formatCurrency(getUnitPrice(selectedProduct)) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Giá vốn hiện tại</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatCurrency(selectedProduct.product.entry_cost) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="selectedProduct.product.description">
                  <v-list-item-content>
                    <v-list-item-title>Mô tả</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedProduct.product.description }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Tồn kho hiện tại</v-list-item-title>
                    <v-list-item-subtitle>{{ formatNumber(selectedProduct.product.available) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="detailDialog = false">
            Đóng
          </v-btn>
          <v-btn color="primary" elevation="1" @click="navigateToProduct" class="px-4">
            <v-icon left>mdi-pencil</v-icon>
            Quản lý sản phẩm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import reportModule from '@/api/report'
import * as XLSX from 'xlsx'
const reportActions = reportModule.actions

export default {
  data() {
    return {
      search: '',
      tableLoading: false,
      reportData: [],
      // Pagination parameters
      page: 1,
      perPage: 10,
      totalItems: 0,
      startDateMenu: false,
      endDateMenu: false,
      filters: {
        startDate: this.getDefaultStartDate(),
        endDate: this.getDefaultEndDate(),
      },
      headers: [
        {
          text: 'STT',
          value: 'index',
          width: '60px',
          sortable: false
        },
        {
          text: 'Mã sản phẩm',
          value: 'product.sku',
          width: '130px'
        },
        {
          text: 'Tên sản phẩm',
          value: 'product.name',
          width: '250px'
        },
        {
          text: 'Số lượng nhập',
          value: 'quantity',
          width: '120px'
        },
        {
          text: 'Thành tiền',
          value: 'retail_cost',
          width: '150px'
        },
        {
          text: 'Thao tác',
          value: 'actions',
          width: '100px',
          sortable: false,
          align: 'center'
        }
      ],
      detailDialog: false,
      selectedProduct: null,
      supplierCount: 0,
      exportLoading: false,
    }
  },
  methods: {
    updateDisplayedItems(options) {
      const { itemsPerPage, page, sortBy, sortDesc } = options;

      this.fetchReport(page, itemsPerPage, sortBy, sortDesc);
    },

    fetchReport(page = 1, itemsPerPage = 10, sortBy = [], sortDesc = []) {
      this.tableLoading = true;
      this.page = page;
      this.perPage = itemsPerPage;

      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate,
        type: 2, // Purchase type (key change)
        page: page,
        per_page: itemsPerPage,
        name: this.search
      };

      // Add sorting if provided
      if (sortBy.length > 0 && sortDesc.length > 0) {
        params.sort_by = sortBy[0];
        params.sort_desc = sortDesc[0] ? 1 : 0;
      }

      reportActions.getAggregateReport(params)
        .then(res => {
          this.reportData = res.data.data;
          this.totalItems = res.data.meta?.total || 0;

          // Extract unique suppliers from the data
          const suppliers = new Set();
          if (res.data.meta && res.data.meta.suppliers) {
            this.supplierCount = res.data.meta.suppliers.length;
          } else {
            // Fallback if meta.suppliers is not provided by the API
            this.reportData.forEach(item => {
              if (item.supplier && item.supplier.id) {
                suppliers.add(item.supplier.id);
              }
            });
            this.supplierCount = suppliers.size;
          }
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải dữ liệu báo cáo nhập hàng');
          console.error('Error fetching purchase report:', err);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    applyFilters() {
      // Reset to first page when applying filters
      this.page = 1;
      this.fetchReport(1, this.perPage);
    },

    resetFilters() {
      this.filters.startDate = this.getDefaultStartDate();
      this.filters.endDate = this.getDefaultEndDate();
      this.search = '';
      this.fetchReport(1, this.perPage);
    },

    onSearchInput() {
      // Reset to first page when searching
      this.page = 1;
      // Debounce search to avoid too many API calls
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => {
        this.fetchReport(this.page, this.perPage);
      }, 300);
    },

    getDefaultStartDate() {
      const date = new Date();
      date.setDate(1); // First day of current month
      return date.toISOString().substr(0, 10);
    },

    getDefaultEndDate() {
      return new Date().toISOString().substr(0, 10); // Today
    },

    viewDetails(item) {
      this.selectedProduct = item;
      this.detailDialog = true;
    },

    downloadProductReport(item) {
      // Implement download functionality
      this.$snackbar.info('Tính năng đang được phát triển');
    },

    exportToExcel() {
      this.exportLoading = true;
      
      // Prepare parameters for API call - fetch all data for export
      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate,
        type: 2, // Purchase type
        per_page: 999999, // Get all records for export
        page: 1,
        name: this.search || undefined
      };

      // Call API to get full data for export
      reportActions.getAggregateReport(params)
        .then(res => {
          const exportData = res.data.data;
          this.generateExcelFile(exportData);
        })
        .catch(err => {
          this.$snackbar.error('Không thể xuất dữ liệu Excel');
          console.error('Error exporting to Excel:', err);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },

    generateExcelFile(data) {
      try {
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Calculate totals based on the export data (not just current page data)
        const totalProducts = data.length;
        const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalCost = data.reduce((sum, item) => sum + (item.retail_cost || 0), 0);
        
        // Calculate unique suppliers
        const suppliers = new Set();
        data.forEach(item => {
          if (item.supplier && item.supplier.id) {
            suppliers.add(item.supplier.id);
          }
        });
        const totalSuppliers = suppliers.size;

        // Create summary data
        const summaryData = [
          ['BÁO CÁO NHẬP HÀNG TỔNG HỢP'],
          [`Thời gian: ${this.formatDateRange(this.filters.startDate, this.filters.endDate)}`],
          [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
          [''],
          ['TỔNG KẾT'],
          [`Tổng sản phẩm: ${totalProducts.toLocaleString('vi-VN')}`],
          [`Tổng số lượng nhập: ${totalQuantity.toLocaleString('vi-VN')}`],
          [`Tổng chi phí nhập: ${totalCost.toLocaleString('vi-VN')} VNĐ`],
          [`Số nhà cung cấp: ${totalSuppliers.toLocaleString('vi-VN')}`],
          [''],
          ['CHI TIẾT SẢN PHẨM'],
          ['']  // Empty row before table headers
        ];

        // Create worksheet starting with summary
        const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Prepare table headers
        const tableHeaders = [
          'STT',
          'Mã sản phẩm',
          'Tên sản phẩm', 
          'Mô tả',
          'Số lượng nhập',
          'Số lượng đơn vị phụ',
          'Tổng chi phí (VNĐ)',
          'Đơn giá nhập (VNĐ)',
          'Nhà cung cấp',
          'Tồn kho hiện tại'
        ];

        // Add table headers
        const headerRow = summaryData.length;
        XLSX.utils.sheet_add_aoa(worksheet, [tableHeaders], { origin: `A${headerRow + 1}` });

        // Prepare table data
        const tableData = data.map((item, index) => [
          index + 1,
          item.product.sku || 'N/A',
          item.product.name,
          item.product.description || '',
          item.quantity,
          item.sub_unit_quantity || 0,
          item.retail_cost,
          this.getUnitPrice(item),
          item.supplier ? item.supplier.name : 'N/A',
          item.product.available || 0
        ]);

        // Add table data
        XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: `A${headerRow + 2}` });

        // Set column widths
        worksheet['!cols'] = [
          { wch: 5 },   // STT
          { wch: 15 },  // Mã sản phẩm
          { wch: 30 },  // Tên sản phẩm
          { wch: 40 },  // Mô tả
          { wch: 15 },  // Số lượng nhập
          { wch: 18 },  // Số lượng đơn vị phụ
          { wch: 18 },  // Tổng chi phí
          { wch: 18 },  // Đơn giá nhập
          { wch: 25 },  // Nhà cung cấp
          { wch: 18 }   // Tồn kho
        ];

        // Style the title row
        if (worksheet['A1']) {
          worksheet['A1'].s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: 'center' }
          };
        }

        // Style the headers
        const headerRowNum = headerRow + 1;
        for (let col = 0; col < tableHeaders.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRowNum - 1, c: col });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'E3F2FD' } },
              alignment: { horizontal: 'center' }
            };
          }
        }

        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo nhập hàng');

        // Generate filename with date range
        const startDate = this.formatDate(this.filters.startDate);
        const endDate = this.formatDate(this.filters.endDate);
        const filename = `BaoCaoNhapHang_${startDate.replace(/\//g, '')}_${endDate.replace(/\//g, '')}.xlsx`;

        // Write and download file
        XLSX.writeFile(workbook, filename);
        
        this.$snackbar.success('Xuất Excel thành công!');
      } catch (error) {
        console.error('Error generating Excel file:', error);
        this.$snackbar.error('Có lỗi xảy ra khi tạo file Excel');
      }
    },

    navigateToProduct() {
      if (this.selectedProduct && this.selectedProduct.product.id) {
        this.$router.push({
          path: '/product',
          query: { id: this.selectedProduct.product.id }
        });
      }
    },

    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return 'Tất cả thời gian';
      return `Từ ${this.formatDate(startDate)} đến ${this.formatDate(endDate)}`;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '0 ₫';
      return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      });
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0';
      return value.toLocaleString('vi-VN');
    },

    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    getUnitPrice(item) {
      if (!item.quantity || item.quantity === 0) return 0;
      return item.retail_cost / item.quantity;
    },

    // Summary statistics methods
    getTotalProducts() {
      return this.reportData.length;
    },

    getTotalQuantity() {
      return this.reportData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    },

    getTotalCost() {
      return this.reportData.reduce((sum, item) => sum + (item.retail_cost || 0), 0);
    },

    getSupplierCount() {
      return this.supplierCount;
    }
  },
  mounted() {
    this.fetchReport(1, this.perPage);
  }
}
</script>

<style scoped>
.aggregate-purchase-report {
  min-height: 100%;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
}

.custom-data-table {
  border: none !important;
}

.custom-data-table>>>.v-data-table__wrapper {
  border-radius: 0 0 8px 8px;
}

.custom-data-table>>>th {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
  font-weight: 500 !important;
  background-color: #f5f5f5 !important;
  white-space: nowrap;
}

.custom-data-table>>>tr:hover {
  background-color: rgba(33, 150, 243, 0.05) !important;
}
</style>
