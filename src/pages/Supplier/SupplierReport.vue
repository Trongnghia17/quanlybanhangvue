<template>
  <div class="supplier-report">
    <!-- Report Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Báo cáo nhập hàng từ nhà cung cấp</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Thống kê chi tiết số lượng và giá trị hàng hóa nhập từ các nhà cung cấp theo thời gian
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
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
                  <span class="ml-1">Nhà cung cấp đã nhập hàng</span>
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
                <v-icon size="28" color="teal">mdi-truck-delivery</v-icon>
              </div>
              <div>
                <div class="text-overline teal--text text--darken-1 mb-1">Tổng đơn nhập</div>
                <div class="text-h5 font-weight-bold">
                  {{ getTotalOrders() }}
                </div>
                <div class="text-caption teal--text text--darken-1">
                  <v-icon small color="teal">mdi-package-variant</v-icon>
                  <span class="ml-1">Đơn nhập hàng đã tạo</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 deep-orange lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon deep-orange lighten-4 mr-4">
                <v-icon size="28" color="deep-orange">mdi-cash-multiple</v-icon>
              </div>
              <div>
                <div class="text-overline deep-orange--text text--darken-1 mb-1">Tổng giá trị nhập</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getTotalPurchases()) }}
                </div>
                <div class="text-caption deep-orange--text text--darken-1">
                  <v-icon small color="deep-orange">mdi-chart-areaspline</v-icon>
                  <span class="ml-1">Tổng giá trị đơn nhập hàng</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="rounded-lg pa-3 blue-grey lighten-5">
          <v-card-text class="pa-2">
            <div class="d-flex">
              <div class="stats-icon blue-grey lighten-4 mr-4">
                <v-icon size="28" color="blue-grey">mdi-calculator-variant</v-icon>
              </div>
              <div>
                <div class="text-overline blue-grey--text text--darken-1 mb-1">Giá trị trung bình</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getAverageOrderValue()) }}
                </div>
                <div class="text-caption blue-grey--text text--darken-1">
                  <v-icon small color="blue-grey">mdi-scale-balance</v-icon>
                  <span class="ml-1">Giá trị đơn nhập trung bình</span>
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
          <h5 class="text-h6 font-weight-medium mb-1">Chi tiết nhập hàng theo nhà cung cấp</h5>
          <div class="text-caption text-grey">
            {{ formatDateRange(filters.startDate, filters.endDate) }}
          </div>
        </div>
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
              color="indigo lighten-4"
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
            <v-icon x-small color="teal">mdi-truck</v-icon> Đơn nhập hàng
          </div>
        </template>

        <template v-slot:item.total="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.total) }}</div>
          <div class="text-caption">
            <v-icon x-small color="deep-orange">mdi-cash-multiple</v-icon> Giá trị nhập
          </div>
        </template>

        <template v-slot:item.average="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(getSupplierAverage(item)) }}</div>
          <div class="text-caption">
            <v-icon x-small color="blue-grey">mdi-calculator</v-icon> TB/đơn nhập
          </div>
        </template>

        <template v-slot:item.reliability="{ item }">
          <v-rating
            :value="getSupplierReliabilityScore(item)"
            color="amber"
            background-color="grey lighten-3"
            half-increments
            readonly
            small
            dense
          ></v-rating>
          <div class="text-caption mt-1">
            {{ getReliabilityLabel(getSupplierReliabilityScore(item)) }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            color="primary"
            @click="viewDetails(item)"
            class="mr-1"
            title="Xem chi tiết đơn nhập hàng"
          >
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="teal"
            @click="downloadSupplierReport(item)"
            class="mr-1"
            title="Tải xuống báo cáo"
          >
            <v-icon small>mdi-download</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="indigo"
            @click="navigateToSupplier(item)"
            title="Quản lý nhà cung cấp"
          >
            <v-icon small>mdi-domain</v-icon>
          </v-btn>
        </template>

        <template v-slot:footer.prepend>
          <div class="pa-4">
            <div class="text-subtitle-2 font-weight-bold">Tổng cộng:</div>
            <div class="d-flex mt-2 flex-wrap">
              <div class="mr-4">
                <span class="text-caption text-grey">Số nhà cung cấp:</span>
                <span class="font-weight-medium">{{ reportData.length }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Số đơn nhập:</span>
                <span class="font-weight-medium">{{ totalSummary.number }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Tổng giá trị nhập:</span>
                <span class="font-weight-medium">{{ formatCurrency(totalSummary.total) }}</span>
              </div>
              <div class="mr-4">
                <span class="text-caption text-grey">Trung bình/đơn:</span>
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
              Không có dữ liệu nhập hàng
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
            <v-avatar size="36" color="indigo lighten-4" class="mr-3">
              <span class="white--text font-weight-bold" v-if="selectedSupplier">{{ getInitials(selectedSupplier.supplier.name) }}</span>
            </v-avatar>
            <div v-if="selectedSupplier">
              <div>Lịch sử nhập hàng - {{ selectedSupplier.supplier.name }}</div>
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
          <v-row class="mx-0 px-4 py-3 indigo lighten-5">
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tổng đơn nhập hàng</div>
              <div class="font-weight-medium" v-if="selectedSupplier">{{ formatNumber(selectedSupplier.number) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Tổng giá trị nhập</div>
              <div class="font-weight-medium" v-if="selectedSupplier">{{ formatCurrency(selectedSupplier.total) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Giá trị trung bình</div>
              <div class="font-weight-medium indigo--text" v-if="selectedSupplier">{{ formatCurrency(getSupplierAverage(selectedSupplier)) }}</div>
            </v-col>
            <v-col cols="12" sm="3" class="py-2">
              <div class="text-caption grey--text">Đánh giá</div>
              <div class="d-flex align-center">
                <v-rating
                  :value="getSupplierReliabilityScore(selectedSupplier)"
                  color="amber"
                  background-color="white"
                  half-increments
                  readonly
                  x-small
                  dense
                ></v-rating>
                <span class="ml-2 text-caption">{{ getReliabilityLabel(getSupplierReliabilityScore(selectedSupplier)) }}</span>
              </div>
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
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-truck-delivery-outline</v-icon>
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
            @click="navigateToSupplier(selectedSupplier)"
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
          text: 'Nhà cung cấp',
          value: 'supplier.name',
          width: '220px'
        },
        {
          text: 'Số đơn nhập',
          value: 'number',
          width: '120px'
        },
        {
          text: 'Giá trị nhập',
          value: 'total',
          width: '150px'
        },
        {
          text: 'Trung bình',
          value: 'average',
          width: '120px'
        },
        {
          text: 'Đánh giá',
          value: 'reliability',
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
      selectedSupplier: null,
      supplierOrders: [],
      ordersLoading: false,
      orderHeaders: [
        { text: 'Mã đơn nhập', value: 'code', width: '120px' },
        { text: 'Ngày tạo', value: 'created_at', width: '120px' },
        { text: 'Tổng tiền', value: 'base_cost', width: '120px' },
        { text: 'Thanh toán', value: 'payment_status', width: '120px' },
        { text: 'Trạng thái', value: 'status', width: '100px' },
        { text: 'Sản phẩm', value: 'products', width: '250px' }
      ]
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
          this.$snackbar.error('Không thể tải dữ liệu báo cáo nhập hàng');
          console.error('Error fetching supplier report:', err);
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
      date.setMonth(date.getMonth() - 3); // Mặc định xem 3 tháng gần nhất
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
      if (supplierId === -1) {
        params.supplier_id = "null";
      }
      orderActions.getListOrders(params)
        .then(res => {
          this.supplierOrders = res.data.data || [];
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải dữ liệu đơn nhập hàng');
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
          let filename = `don-nhap-hang-${item.supplier.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`;

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

          this.$snackbar.success(`Tải xuống báo cáo của ${item.supplier.name} thành công!`);
        })
        .catch(error => {
          console.error('Export supplier orders error:', error);
          this.$snackbar.error('Không thể tải xuống báo cáo. Vui lòng thử lại.');
        });
    },

    exportToExcel() {
      this.$snackbar.info('Tính năng xuất Excel đang được phát triển');
    },

    navigateToSupplier(item) {
      if (item && item.supplier && item.supplier.id && item.supplier.id !== -1) {
        this.$router.push({
          path: '/supplier',
          query: { id: item.supplier.id }
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

    // Purchase performance metrics
    getTotalOrders() {
      return this.totalSummary.number || this.reportData.reduce((sum, item) => sum + (item.number || 0), 0);
    },

    getTotalPurchases() {
      return this.totalSummary.total || this.reportData.reduce((sum, item) => sum + (item.total || 0), 0);
    },

    getAverageOrderValue() {
      const totalOrders = this.getTotalOrders();
      if (totalOrders <= 0) return 0;
      return this.getTotalPurchases() / totalOrders;
    },

    getSupplierAverage(item) {
      if (!item.number || item.number <= 0) return 0;
      return item.total / item.number;
    },

    getSupplierReliabilityScore(item) {
      // Simple scoring based on number of purchases and payment history
      // Adjust the scoring logic based on your business needs
      if (!item || !item.number) return 0;

      // Basic score based on order count
      let score = 0;
      if (item.number >= 10) score = 5;
      else if (item.number >= 7) score = 4.5;
      else if (item.number >= 5) score = 4;
      else if (item.number >= 3) score = 3;
      else if (item.number >= 2) score = 2;
      else score = 1;

      // Adjust score based on payment ratio (higher payment ratio is better)
      const paymentRatio = item.total > 0 ? item.total_pay / item.total : 0;

      // Final score
      return Math.min(5, Math.max(1, score));
    },

    getReliabilityLabel(score) {
      if (score >= 4.5) return 'Rất uy tín';
      if (score >= 4) return 'Uy tín';
      if (score >= 3) return 'Khá tốt';
      if (score >= 2) return 'Bình thường';
      return 'Mới hợp tác';
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
    }
  },
  mounted() {
    this.fetchReport();
  }
}
</script>

<style scoped>
.supplier-report {
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
