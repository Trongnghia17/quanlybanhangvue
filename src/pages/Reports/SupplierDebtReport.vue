<template>
  <div class="supplier-debt-report">
    <!-- Report Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Báo cáo công nợ nhà cung cấp</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Thống kê chi tiết công nợ nhà cung cấp và số tiền đã thanh toán
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card outlined class="rounded-lg pa-3 indigo lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon indigo lighten-4 mr-4">
                <v-icon size="28" color="indigo">mdi-domain</v-icon>
              </div>
              <div>
                <div class="text-overline indigo--text text--darken-1 mb-1">Số nhà cung cấp</div>
                <div class="text-h5 font-weight-bold">
                  {{ reportData.length || 0 }}
                </div>
                <div class="text-caption indigo--text text--darken-1">
                  <v-icon small color="indigo">mdi-information-outline</v-icon>
                  <span class="ml-1">Nhà cung cấp có công nợ</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card outlined class="rounded-lg pa-3 deep-purple lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon deep-purple lighten-4 mr-4">
                <v-icon size="28" color="deep-purple">mdi-cash-multiple</v-icon>
              </div>
              <div>
                <div class="text-overline deep-purple--text text--darken-1 mb-1">Tổng công nợ</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getTotalDebt()) }}
                </div>
                <div class="text-caption deep-purple--text text--darken-1">
                  <v-icon small color="deep-purple">mdi-chart-areaspline</v-icon>
                  <span class="ml-1">Tổng tiền còn nợ nhà cung cấp</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card outlined class="rounded-lg pa-3 teal lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon teal lighten-4 mr-4">
                <v-icon size="28" color="teal">mdi-cash-check</v-icon>
              </div>
              <div>
                <div class="text-overline teal--text text--darken-1 mb-1">Đã thanh toán</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getTotalPaid()) }}
                </div>
                <div class="text-caption teal--text text--darken-1">
                  <v-icon small color="teal">mdi-information-outline</v-icon>
                  <span class="ml-1">Tổng số tiền đã thanh toán</span>
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
          <h5 class="text-h6 font-weight-medium mb-1">Chi tiết công nợ theo nhà cung cấp</h5>
          <div class="text-caption text-grey">
            {{ formatDateRange(filters.startDate, filters.endDate) }}
          </div>
        </div>

        <v-btn 
          color="success" 
          class="text-none rounded-lg" 
          elevation="0" 
          @click="exportToExcel"
          :loading="exportLoading"
        >
          <v-icon left small>mdi-file-excel</v-icon>
          Xuất Excel
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="filters.name"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo tên nhà cung cấp"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
              @keyup.enter="fetchReport"
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
              @click="fetchReport"
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
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'items-per-page-text': 'Số dòng mỗi trang',
          'show-first-last-page': true
        }"
        class="elevation-0 custom-data-table"
        sort-by="total"
        sort-desc
        :search="search"
      >
        <template v-slot:item.index="{ index }">
          {{ index + 1 }}
        </template>

        <template v-slot:item.supplier.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              size="32"
              color="primary lighten-4"
              class="mr-2"
            >
              <span class="white--text font-weight-bold">{{ getInitials(item.supplier.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.supplier.name }}</div>
              <div class="text-caption grey--text" v-if="item.supplier.phone">
                {{ item.supplier.phone }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.number="{ item }">
          <div class="font-weight-medium">{{ formatNumber(item.number) }}</div>
          <div class="text-caption">
            <v-icon x-small color="grey">mdi-truck</v-icon> Đơn nhập hàng
          </div>
        </template>

        <template v-slot:item.total="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.total) }}</div>
        </template>

        <template v-slot:item.total_pay="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.total_pay) }}</div>
        </template>

        <template v-slot:item.remaining="{ item }">
          <div class="font-weight-medium" :class="{'red--text': getRemainingDebt(item) > 0}">
            {{ formatCurrency(getRemainingDebt(item)) }}
          </div>
          <div class="text-caption" v-if="getRemainingDebt(item) > 0">
            <v-icon small color="warning">mdi-alert-circle</v-icon>
            {{ getPaymentStatus(item) }}
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
          <v-btn
            icon
            small
            color="teal"
            @click="downloadSupplierReport(item)"
            class="mr-1"
          >
            <v-icon small>mdi-download</v-icon>
          </v-btn>
        </template>

        <template v-slot:footer.prepend>
          <div class="pa-4">
            <div class="text-subtitle-2 font-weight-bold">Tổng cộng:</div>
            <div class="d-flex mt-2">
              <div class="mr-4">
                <span class="text-caption text-grey">Số đơn:</span>
                <span class="font-weight-medium">{{ totalSummary.number }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Tổng tiền:</span>
                <span class="font-weight-medium">{{ formatCurrency(totalSummary.total) }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Đã trả:</span>
                <span class="font-weight-medium">{{ formatCurrency(totalSummary.total_pay) }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Còn nợ:</span>
                <span class="font-weight-medium red--text">{{ formatCurrency(totalSummary.total - totalSummary.total_pay) }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-slot:no-data>
          <v-card flat class="pa-6 text-center mx-auto">
            <v-img
              src="https://cdn.vuetifyjs.com/images/lists/no-results.svg"
              max-width="150"
              class="mx-auto mb-4"
            ></v-img>
            <div class="text-h6 grey--text text--darken-1 mb-2">
              Không có dữ liệu công nợ
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

    <!-- Supplier Orders Dialog -->
    <v-dialog v-model="detailDialog" max-width="900">
      <v-card class="rounded-lg">
        <v-card-title class="headline d-flex justify-space-between align-center primary--text">
          <div class="d-flex align-center">
            <v-avatar size="36" color="primary lighten-4" class="mr-3">
              <span class="white--text font-weight-bold" v-if="selectedSupplier">{{ getInitials(selectedSupplier.supplier.name) }}</span>
            </v-avatar>
            <div v-if="selectedSupplier">
              <div>Đơn nhập hàng của nhà cung cấp {{ selectedSupplier.supplier.name }}</div>
              <div class="text-subtitle-2 grey--text" v-if="selectedSupplier.supplier.phone">
                {{ selectedSupplier.supplier.phone }}
              </div>
            </div>
          </div>
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-0">
          <!-- Supplier Order Summary -->
          <v-row class="mx-0 px-4 py-3 grey lighten-4">
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tổng đơn nhập hàng</div>
              <div class="font-weight-medium" v-if="selectedSupplier">{{ formatNumber(selectedSupplier.number) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tổng giá trị</div>
              <div class="font-weight-medium" v-if="selectedSupplier">{{ formatCurrency(selectedSupplier.total) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Đã thanh toán</div>
              <div class="font-weight-medium green--text" v-if="selectedSupplier">{{ formatCurrency(selectedSupplier.total_pay) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Còn nợ</div>
              <div class="font-weight-medium red--text" v-if="selectedSupplier">{{ formatCurrency(getRemainingDebt(selectedSupplier)) }}</div>
            </v-col>
          </v-row>

          <!-- Order List -->
          <v-data-table
            :headers="orderHeaders"
            :items="supplierOrders"
            :loading="ordersLoading"
            :items-per-page="5"
            :footer-props="{
              'items-per-page-options': [5, 10, 20],
              'items-per-page-text': 'Số dòng mỗi trang'
            }"
            class="elevation-0"
            sort-by="created_at"
            sort-desc
          >
            <!-- Code Column -->
            <template v-slot:item.code="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.code }}</div>
                <div v-if="item.reference_code" class="text-caption grey--text">Ref: {{ item.reference_code }}</div>
              </div>
            </template>

            <!-- Date Column -->
            <template v-slot:item.created_at="{ item }">
              <div>{{ formatDateFromAPI(item.created_at) }}</div>
              <div class="text-caption grey--text">{{ formatTimeFromAPI(item.created_at) }}</div>
            </template>

            <!-- Total Column -->
            <template v-slot:item.retail_cost="{ item }">
              <div class="font-weight-medium">{{ formatCurrency(item.retail_cost) }}</div>
              <div v-if="item.discount > 0" class="text-caption">
                Giảm: {{ item.discount_type === 'percent' ? `${item.discount}%` : formatCurrency(item.discount) }}
              </div>
            </template>

            <!-- Debt Column -->
            <template v-slot:item.debt="{ item }">
              <div :class="{'red--text': item.debt > 0}">{{ formatCurrency(item.debt) }}</div>
            </template>

            <!-- Status Column -->
            <template v-slot:item.status="{ item }">
              <v-chip :color="getOrderStatusColor(item.status)" text-color="white" x-small class="px-2">
                {{ getOrderStatusName(item.status) }}
              </v-chip>
            </template>

            <!-- Products Column -->
            <template v-slot:item.products="{ item }">
              <div v-if="item.order_detail && item.order_detail.length">
                <v-chip small outlined class="mr-1 mb-1" v-for="(detail, index) in item.order_detail.slice(0, 2)" :key="index">
                  {{ detail.product ? detail.product.name : 'Sản phẩm không xác định' }} ({{ detail.quantity }})
                </v-chip>
                <v-chip small outlined v-if="item.order_detail.length > 2">
                  + {{ item.order_detail.length - 2 }} sản phẩm khác
                </v-chip>
              </div>
              <div v-else class="text-caption grey--text">
                Không có thông tin sản phẩm
              </div>
            </template>

            <!-- Payment Column -->
            <template v-slot:item.payment="{ item }">
              <div v-if="item.order_payment && item.order_payment.length">
                <div v-for="(payment, index) in item.order_payment" :key="index" class="mb-1">
                  <div class="d-flex align-center">
                    <v-icon x-small :color="getPaymentTypeColor(payment.type)" class="mr-1">{{ getPaymentTypeIcon(payment.type) }}</v-icon>
                    <span>{{ formatCurrency(payment.price) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption grey--text">
                Chưa thanh toán
              </div>
            </template>

            <template v-slot:no-data>
              <div class="text-center py-4">
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-receipt-text-outline</v-icon>
                <div class="text-body-2 grey--text text--darken-1">Không tìm thấy đơn nhập hàng nào</div>
              </div>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            outlined
            @click="navigateToSupplier"
            class="mr-2"
          >
            <v-icon left>mdi-domain</v-icon>
            Quản lý nhà cung cấp
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn
            text
            color="grey darken-1"
            @click="detailDialog = false"
          >
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import reportModule from '@/api/report'
import orderModule from '@/api/order'
import * as XLSX from 'xlsx'
const reportActions = reportModule.actions
const orderActions = orderModule.actions

export default {
  data() {
    return {
      search: '',
      tableLoading: false,
      exportLoading: false,
      reportData: [],
      totalSummary: {
        number: 0,
        total: 0,
        total_pay: 0
      },
      startDateMenu: false,
      endDateMenu: false,
      filters: {
        startDate: this.getDefaultStartDate(),
        endDate: this.getDefaultEndDate(),
        name: ''
      },
      headers: [
        {
          text: 'STT',
          value: 'index',
          width: '60px',
          sortable: false
        },
        {
          text: 'Nhà cung cấp',
          value: 'supplier.name',
          width: '250px'
        },
        {
          text: 'Số đơn hàng',
          value: 'number',
          width: '120px'
        },
        {
          text: 'Tổng tiền',
          value: 'total',
          width: '150px'
        },
        {
          text: 'Đã thanh toán',
          value: 'total_pay',
          width: '150px'
        },
        {
          text: 'Còn nợ',
          value: 'remaining',
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
      orderHeaders: [
        { text: 'Mã đơn', value: 'code', width: '150px' },
        { text: 'Ngày tạo', value: 'created_at', width: '150px' },
        { text: 'Tổng tiền', value: 'retail_cost', width: '150px' },
        { text: 'Còn nợ', value: 'debt', width: '150px' },
        { text: 'Trạng thái', value: 'status', width: '120px' },
        { text: 'Sản phẩm', value: 'products', width: '250px' },
        { text: 'Thanh toán', value: 'payment', width: '200px' }
      ],
      detailDialog: false,
      selectedSupplier: null,
      supplierOrders: [],
      ordersLoading: false
    }
  },
  methods: {
    fetchReport() {
      this.tableLoading = true;
      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate,
        name: this.filters.name
      };

      reportActions.getSupplierReport(params)
        .then(res => {
          this.reportData = res.data.data;
          this.totalSummary = res.data.total || {
            number: 0,
            total: 0,
            total_pay: 0
          };
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải dữ liệu báo cáo công nợ nhà cung cấp');
          console.error('Error fetching supplier debt report:', err);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    resetFilters() {
      this.filters.startDate = this.getDefaultStartDate();
      this.filters.endDate = this.getDefaultEndDate();
      this.filters.name = '';
      this.search = '';
      this.fetchReport();
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
      this.selectedSupplier = item;
      this.detailDialog = true;
      this.fetchSupplierOrders(item.supplier.id);
    },

    fetchSupplierOrders(supplierId) {
      this.ordersLoading = true;
      this.supplierOrders = [];

      const params = {
        supplier_id: supplierId,
        per_page: 1000,
        type: 2, // Specify type 2 for purchase orders
        start_date: this.filters.startDate,
        end_date: this.filters.endDate
      };

      orderActions.getListOrders(params)
        .then(res => {
          this.supplierOrders = res.data.data || [];
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải danh sách đơn nhập hàng');
          console.error('Error fetching supplier orders:', err);
        })
        .finally(() => {
          this.ordersLoading = false;
        });
    },

    downloadSupplierReport(item) {
      if (!item || !item.supplier || !item.supplier.id) {
        this.$snackbar.error('Không thể tải xuống báo cáo của nhà cung cấp này');
        return;
      }

      // Prepare export data with supplier information and date filters
      const exportData = {
        id: item.supplier.id,
        supplier_name: item.supplier.name,
        start_date: this.filters.startDate,
        end_date: this.filters.endDate
      };

      orderActions.exportSupplierOrders(exportData)
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
          let filename = `cong-no-${item.supplier.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`;

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

          // Clean up the URL object
          window.URL.revokeObjectURL(url);

          this.$snackbar.success(`Tải xuống báo cáo công nợ của ${item.supplier.name} thành công!`);
        })
        .catch(error => {
          console.error('Export supplier debt report error:', error);
          this.$snackbar.error('Không thể tải xuống báo cáo. Vui lòng thử lại.');
        });
    },

    exportToExcel() {
      this.exportLoading = true;
      
      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate,
        name: this.filters.name,
        per_page: 999999
      };

      reportActions.getSupplierReport(params)
        .then(res => {
          this.generateExcelFile(res.data.data, res.data.total);
        })
        .catch(err => {
          this.$snackbar.error('Không thể xuất dữ liệu Excel');
          console.error('Error exporting supplier debt report:', err);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },

    generateExcelFile(data, totalSummary) {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare summary data
      const totalSuppliers = data.length;
      const totalOrders = totalSummary?.number || data.reduce((sum, item) => sum + (item.number || 0), 0);
      const totalAmount = totalSummary?.total || data.reduce((sum, item) => sum + (item.total || 0), 0);
      const totalPaid = totalSummary?.total_pay || data.reduce((sum, item) => sum + (item.total_pay || 0), 0);
      const totalDebt = totalAmount - totalPaid;
      
      // Create summary data array
      const summaryData = [
        ['BÁO CÁO CÔNG NỢ NHÀ CUNG CẤP'],
        [`Thời gian: ${this.formatDate(this.filters.startDate)} - ${this.formatDate(this.filters.endDate)}`],
        [''],
        ['THỐNG KÊ TỔNG QUAN'],
        ['Số nhà cung cấp:', totalSuppliers],
        ['Tổng đơn hàng:', totalOrders.toLocaleString('vi-VN')],
        ['Tổng tiền:', totalAmount.toLocaleString('vi-VN') + ' ₫'],
        ['Đã thanh toán:', totalPaid.toLocaleString('vi-VN') + ' ₫'],
        ['Còn nợ:', totalDebt.toLocaleString('vi-VN') + ' ₫'],
        [''],
        ['CHI TIẾT CÔNG NỢ NHÀ CUNG CẤP'],
        ['STT', 'Nhà cung cấp', 'Email', 'Số điện thoại', 'Địa chỉ', 'Số đơn hàng', 'Tổng tiền', 'Đã thanh toán', 'Còn nợ', 'Tỷ lệ thanh toán (%)', 'Trạng thái thanh toán']
      ];
      
      // Add detail data
      data.forEach((item, index) => {
        const remainingDebt = this.getRemainingDebt(item);
        const paymentRate = this.getPaymentRate(item);
        const paymentStatus = this.getPaymentStatus(item);
        
        summaryData.push([
          index + 1,
          item.supplier.name || '',
          item.supplier.email || '',
          item.supplier.phone || '',
          item.supplier.address || '',
          item.number || 0,
          (item.total || 0).toLocaleString('vi-VN') + ' ₫',
          (item.total_pay || 0).toLocaleString('vi-VN') + ' ₫',
          remainingDebt.toLocaleString('vi-VN') + ' ₫',
          paymentRate.toFixed(1) + '%',
          paymentStatus
        ]);
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // STT
        { wch: 25 },  // Nhà cung cấp
        { wch: 25 },  // Email
        { wch: 15 },  // Số điện thoại
        { wch: 30 },  // Địa chỉ
        { wch: 12 },  // Số đơn hàng
        { wch: 18 },  // Tổng tiền
        { wch: 18 },  // Đã thanh toán
        { wch: 18 },  // Còn nợ
        { wch: 18 },  // Tỷ lệ thanh toán
        { wch: 20 }   // Trạng thái thanh toán
      ];
      
      // Style the header cells
      const headerRow = 10; // Row with headers (0-indexed)
      for (let col = 0; col < 11; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E3F2FD' } },
          alignment: { horizontal: 'center' }
        };
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo công nợ nhà cung cấp');
      
      // Generate filename
      const startDate = this.filters.startDate.split('-').reverse().join('');
      const endDate = this.filters.endDate.split('-').reverse().join('');
      const filename = `BaoCaoCongNoNCC_${startDate}_${endDate}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      this.$snackbar.success('Xuất file Excel thành công!');
    },

    navigateToSupplier() {
      if (this.selectedSupplier && this.selectedSupplier.supplier.id && this.selectedSupplier.supplier.id !== -1) {
        this.$router.push({
          path: '/supplier',
          query: { id: this.selectedSupplier.supplier.id }
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

    formatDateFromAPI(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },

    formatTimeFromAPI(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN');
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

    getInitials(name) {
      if (!name) return '';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },

    getRemainingDebt(item) {
      return item.total - item.total_pay;
    },

    getPaymentStatus(item) {
      const remaining = this.getRemainingDebt(item);
      const rate = this.getPaymentRate(item);

      if (rate >= 75) return 'Thanh toán tốt';
      if (rate >= 50) return 'Đã thanh toán một phần';
      if (rate >= 25) return 'Cần theo dõi';
      return 'Chưa thanh toán';
    },

    getPaymentRate(item) {
      if (item.total <= 0) return 100;
      return (item.total_pay / item.total) * 100;
    },

    getTotalDebt() {
      if (this.totalSummary && this.totalSummary.total && this.totalSummary.total_pay) {
        return this.totalSummary.total - this.totalSummary.total_pay;
      }
      return this.reportData.reduce((sum, item) => sum + this.getRemainingDebt(item), 0);
    },

    getTotalPaid() {
      if (this.totalSummary && this.totalSummary.total_pay) {
        return this.totalSummary.total_pay;
      }
      return this.reportData.reduce((sum, item) => sum + (item.total_pay || 0), 0);
    },

    getOrderStatusColor(status) {
      switch (parseInt(status)) {
        case 1:
          return 'warning'; // Chờ xác nhận
        case 2:
          return 'success'; // Hoàn thành
        case 3:
          return 'error'; // Đã hủy
        case 4:
          return 'deep-purple'; // Trả hàng
        default:
          return 'grey';
      }
    },

    getOrderStatusName(status) {
      switch (parseInt(status)) {
        case 1:
          return 'Chờ xác nhận';
        case 2:
          return 'Hoàn thành';
        case 3:
          return 'Đã hủy';
        case 4:
          return 'Trả hàng';
        default:
          return 'Không xác định';
      }
    },

    getPaymentTypeIcon(type) {
      switch (parseInt(type)) {
        case 1:
          return 'mdi-cash';
        case 2:
          return 'mdi-bank-transfer';
        case 3:
          return 'mdi-credit-card';
        default:
          return 'mdi-help-circle';
      }
    },

    getPaymentTypeColor(type) {
      switch (parseInt(type)) {
        case 1:
          return 'green';
        case 2:
          return 'blue';
        case 3:
          return 'purple';
        default:
          return 'grey';
      }
    }
  },
  mounted() {
    this.fetchReport();
  }
}
</script>

<style scoped>
.supplier-debt-report {
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
