<template>
  <div class="customer-report">
    <!-- Report Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Báo cáo doanh số khách hàng</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Thống kê chi tiết doanh số mua hàng và hoạt động của khách hàng theo thời gian
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 blue lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon blue lighten-4 mr-4">
                <v-icon size="28" color="blue">mdi-account-group</v-icon>
              </div>
              <div>
                <div class="text-overline blue--text text--darken-1 mb-1">Số khách hàng</div>
                <div class="text-h5 font-weight-bold">
                  {{ totalItems || 0 }}
                </div>
                <div class="text-caption blue--text text--darken-1">
                  <v-icon small color="blue">mdi-information-outline</v-icon>
                  <span class="ml-1">Khách hàng đã mua hàng</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 green lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon green lighten-4 mr-4">
                <v-icon size="28" color="green">mdi-cart-outline</v-icon>
              </div>
              <div>
                <div class="text-overline green--text text--darken-1 mb-1">Tổng đơn hàng</div>
                <div class="text-h5 font-weight-bold">
                  {{ getTotalOrders() }}
                </div>
                <div class="text-caption green--text text--darken-1">
                  <v-icon small color="green">mdi-package-variant</v-icon>
                  <span class="ml-1">Đơn hàng đã tạo</span>
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
                <v-icon size="28" color="amber darken-2">mdi-currency-usd</v-icon>
              </div>
              <div>
                <div class="text-overline amber--text text--darken-2 mb-1">Tổng doanh thu</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getTotalSales()) }}
                </div>
                <div class="text-caption amber--text text--darken-2">
                  <v-icon small color="amber darken-2">mdi-chart-areaspline</v-icon>
                  <span class="ml-1">Tổng giá trị đơn hàng</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 purple lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon purple lighten-4 mr-4">
                <v-icon size="28" color="purple">mdi-chart-line</v-icon>
              </div>
              <div>
                <div class="text-overline purple--text text--darken-1 mb-1">Giá trị trung bình</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getAverageOrderValue()) }}
                </div>
                <div class="text-caption purple--text text--darken-1">
                  <v-icon small color="purple">mdi-calculator</v-icon>
                  <span class="ml-1">Giá trị đơn hàng trung bình</span>
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
          <h5 class="text-h6 font-weight-medium mb-1">Chi tiết doanh số theo khách hàng</h5>
          <div class="text-caption text-grey">
            {{ formatDateRange(filters.startDate, filters.endDate) }}
          </div>
        </div>

      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo tên khách hàng"
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
        :items-per-page="perPage"
        :server-items-length="totalItems"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'items-per-page-text': 'Số dòng mỗi trang',
          'show-first-last-page': true
        }"
        class="elevation-0 custom-data-table"
        sort-by="total"
        sort-desc
        @update:options="updateDisplayedItems"
      >
        <template v-slot:item.index="{ index }">
          {{ ((page - 1) * perPage) + index + 1 }}
        </template>

        <template v-slot:item.customer.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              size="32"
              color="primary lighten-4"
              class="mr-2"
            >
              <span class="white--text font-weight-bold">{{ getInitials(item.customer.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.customer.name }}</div>
              <div class="text-caption grey--text" v-if="item.customer.phone">
                {{ item.customer.phone }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.number="{ item }">
          <div class="font-weight-medium">{{ formatNumber(item.number) }}</div>
          <div class="text-caption">
            <v-icon x-small color="green">mdi-cart</v-icon> Đơn hàng
          </div>
        </template>

        <template v-slot:item.total="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.total) }}</div>
          <div class="text-caption">
            <v-icon x-small color="amber darken-2">mdi-currency-usd</v-icon> Doanh số
          </div>
        </template>

        <template v-slot:item.average="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(getCustomerAverage(item)) }}</div>
          <div class="text-caption">
            <v-icon x-small color="blue">mdi-calculator</v-icon> TB/đơn hàng
          </div>
        </template>

        <template v-slot:item.frequency="{ item }">
          <v-rating
            :value="getPurchaseFrequencyScore(item)"
            color="amber"
            background-color="grey lighten-3"
            half-increments
            readonly
            small
            dense
          ></v-rating>
          <div class="text-caption mt-1">
            {{ getFrequencyLabel(getPurchaseFrequencyScore(item)) }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            color="primary"
            @click="viewDetails(item)"
            class="mr-1"
            title="Xem chi tiết đơn hàng"
          >
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="teal"
            @click="downloadCustomerReport(item)"
            class="mr-1"
            title="Tải xuống báo cáo"
          >
            <v-icon small>mdi-download</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="blue"
            @click="navigateToCustomer(item)"
            title="Quản lý khách hàng"
          >
            <v-icon small>mdi-account-edit</v-icon>
          </v-btn>
        </template>

        <template v-slot:footer.prepend>
          <div class="pa-4">
            <div class="text-subtitle-2 font-weight-bold">Tổng cộng:</div>
            <div class="d-flex mt-2 flex-wrap">
              <div class="mr-4">
                <span class="text-caption text-grey">Số khách hàng:</span>
                <span class="font-weight-medium">{{ totalItems }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Số đơn:</span>
                <span class="font-weight-medium">{{ totalSummary.number }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Tổng doanh số:</span>
                <span class="font-weight-medium">{{ formatCurrency(totalSummary.total) }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Trung bình:</span>
                <span class="font-weight-medium">{{ formatCurrency(getAverageOrderValue()) }}</span>
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
              Không có dữ liệu doanh số
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

    <!-- Customer Orders Dialog -->
    <v-dialog v-model="detailDialog" max-width="900">
      <v-card class="rounded-lg">
        <v-card-title class="headline d-flex justify-space-between align-center primary--text">
          <div class="d-flex align-center">
            <v-avatar size="36" color="blue lighten-4" class="mr-3">
              <span class="white--text font-weight-bold" v-if="selectedCustomer">{{ getInitials(selectedCustomer.customer.name) }}</span>
            </v-avatar>
            <div v-if="selectedCustomer">
              <div>Lịch sử mua hàng - {{ selectedCustomer.customer.name }}</div>
              <div class="text-subtitle-2 grey--text" v-if="selectedCustomer.customer.phone">
                {{ selectedCustomer.customer.phone }}
              </div>
            </div>
          </div>
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-0">
          <!-- Customer Order Summary -->
          <v-row class="mx-0 px-4 py-3 blue lighten-5">
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tổng đơn hàng</div>
              <div class="font-weight-medium" v-if="selectedCustomer">{{ formatNumber(selectedCustomer.number) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tổng doanh số</div>
              <div class="font-weight-medium" v-if="selectedCustomer">{{ formatCurrency(selectedCustomer.total) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Giá trị trung bình</div>
              <div class="font-weight-medium blue--text" v-if="selectedCustomer">{{ formatCurrency(getCustomerAverage(selectedCustomer)) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tần suất mua hàng</div>
              <div class="d-flex align-center">
                <v-rating
                  :value="getPurchaseFrequencyScore(selectedCustomer)"
                  color="amber"
                  background-color="white"
                  half-increments
                  readonly
                  x-small
                  dense
                ></v-rating>
                <span class="ml-2 text-caption">{{ getFrequencyLabel(getPurchaseFrequencyScore(selectedCustomer)) }}</span>
              </div>
            </v-col>
          </v-row>

          <!-- Order List -->
          <v-data-table
            :headers="orderHeaders"
            :items="customerOrders"
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
                <div v-if="item.shipping_code" class="text-caption grey--text">Ship: {{ item.shipping_code }}</div>
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

            <!-- Payment Status Column -->
            <template v-slot:item.payment_status="{ item }">
              <v-chip
                :color="item.debt > 0 ? 'warning' : 'success'"
                text-color="white"
                x-small
                class="px-2"
              >
                {{ item.debt > 0 ? 'Còn nợ' : 'Đã thanh toán' }}
              </v-chip>
              <div v-if="item.debt > 0" class="text-caption mt-1">
                Còn nợ: {{ formatCurrency(item.debt) }}
              </div>
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

            <template v-slot:no-data>
              <div class="text-center py-4">
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-receipt-text-outline</v-icon>
                <div class="text-body-2 grey--text text--darken-1">Không tìm thấy đơn hàng nào</div>
              </div>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            outlined
            @click="navigateToCustomer(selectedCustomer)"
            class="mr-2"
          >
            <v-icon left>mdi-account</v-icon>
            Quản lý khách hàng
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
const reportActions = reportModule.actions
const orderActions = orderModule.actions

export default {
  data() {
    return {
      search: '',
      tableLoading: false,
      reportData: [],
      totalSummary: {
        number: 0,
        total: 0,
        total_pay: 0
      },
      // Pagination parameters
      page: 1,
      perPage: 10,
      totalItems: 0,
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
          width: '50px',
          sortable: false
        },
        {
          text: 'Khách hàng',
          value: 'customer.name',
          width: '220px'
        },
        {
          text: 'Số đơn hàng',
          value: 'number',
          width: '120px'
        },
        {
          text: 'Tổng doanh số',
          value: 'total',
          width: '150px'
        },
        {
          text: 'Trung bình',
          value: 'average',
          width: '120px'
        },
        {
          text: 'Tần suất',
          value: 'frequency',
          width: '150px',
          sortable: false
        },
        {
          text: 'Thao tác',
          value: 'actions',
          width: '120px',
          sortable: false,
          align: 'center'
        }
      ],
      detailDialog: false,
      selectedCustomer: null,
      customerOrders: [],
      ordersLoading: false,
      orderHeaders: [
        { text: 'Mã đơn hàng', value: 'code', width: '120px' },
        { text: 'Ngày tạo', value: 'created_at', width: '120px' },
        { text: 'Tổng tiền', value: 'retail_cost', width: '120px' },
        { text: 'Thanh toán', value: 'payment_status', width: '120px' },
        { text: 'Trạng thái', value: 'status', width: '100px' },
        { text: 'Sản phẩm', value: 'products', width: '250px' }
      ]
    }
  },
  methods: {
    updateDisplayedItems(options) {
      // Extract pagination options
      const { itemsPerPage, page, sortBy, sortDesc } = options;

      // Now you can use these values in your API call
      this.fetchReport(page, itemsPerPage, sortBy, sortDesc);
    },

    fetchReport(page = 1, itemsPerPage = 10, sortBy = [], sortDesc = []) {
      this.tableLoading = true;
      this.page = page;
      this.perPage = itemsPerPage;

      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate,
        name: this.filters.name,
        page: page,
        per_page: itemsPerPage,
        name: this.search
      };

      // Add sorting if provided
      if (sortBy.length > 0 && sortDesc.length > 0) {
        params.sort_by = sortBy[0];
        params.sort_desc = sortDesc[0] ? 1 : 0;
      }

      reportActions.getCustomerReport(params)
        .then(res => {
          this.reportData = res.data.data;
          this.totalItems = res.data.meta?.total || 0;
          this.totalSummary = res.data.total || {
            number: 0,
            total: 0,
            total_pay: 0
          };
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải dữ liệu báo cáo doanh số khách hàng');
          console.error('Error fetching customer report:', err);
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
      date.setMonth(date.getMonth() - 3); // Mặc định xem 3 tháng gần nhất
      return date.toISOString().substr(0, 10);
    },

    getDefaultEndDate() {
      return new Date().toISOString().substr(0, 10); // Today
    },

    viewDetails(item) {
      this.selectedCustomer = item;
      this.detailDialog = true;
      this.fetchCustomerOrders(item.customer.id);
    },

    fetchCustomerOrders(customerId) {
      this.ordersLoading = true;
      this.customerOrders = [];


      const params = {
        customer_id: customerId,
        per_page: 1000,
        start_date: this.filters.startDate,
        end_date: this.filters.endDate
      };
      if (customerId = -1) {
        params.customer_id = "null";
      }
      orderActions.getListOrders(params)
        .then(res => {
          this.customerOrders = res.data.data || [];
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải dữ liệu đơn hàng');
          console.error('Error fetching customer orders:', err);
        })
        .finally(() => {
          this.ordersLoading = false;
        });
    },

    downloadCustomerReport(item) {
      let data = {
        id: item.customer.id,
        from: this.filters.startDate,
        to: this.filters.endDate
      };
      orderActions.exportCustomerOrders(data)
        .then(response => {
          const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

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
        .catch(err => {
          this.$snackbar.error('Không thể tải xuống báo cáo khách hàng');
          console.error('Error downloading customer report:', err);
        });
    },

    exportToExcel() {
      this.$snackbar.info('Tính năng xuất Excel đang được phát triển');
    },

    navigateToCustomer(item) {
      if (item && item.customer && item.customer.id && item.customer.id !== -1) {
        this.$router.push({
          path: '/customer',
          query: { id: item.customer.id }
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

    // Sales performance metrics
    getTotalOrders() {
      return this.totalSummary.number || this.reportData.reduce((sum, item) => sum + (item.number || 0), 0);
    },

    getTotalSales() {
      return this.totalSummary.total || this.reportData.reduce((sum, item) => sum + (item.total || 0), 0);
    },

    getAverageOrderValue() {
      const totalOrders = this.getTotalOrders();
      if (totalOrders <= 0) return 0;
      return this.getTotalSales() / totalOrders;
    },

    getCustomerAverage(item) {
      if (!item.number || item.number <= 0) return 0;
      return item.total / item.number;
    },

    getPurchaseFrequencyScore(item) {
      // Simple scoring based on number of purchases
      // Adjust the scoring logic based on your business needs
      if (!item || !item.number) return 0;

      if (item.number >= 10) return 5;
      if (item.number >= 7) return 4.5;
      if (item.number >= 5) return 4;
      if (item.number >= 3) return 3;
      if (item.number >= 2) return 2;
      return 1;
    },

    getFrequencyLabel(score) {
      if (score >= 4.5) return 'Rất thường xuyên';
      if (score >= 4) return 'Thường xuyên';
      if (score >= 3) return 'Định kỳ';
      if (score >= 2) return 'Thỉnh thoảng';
      return 'Hiếm khi';
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
.customer-report {
  min-height: 100%;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
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
