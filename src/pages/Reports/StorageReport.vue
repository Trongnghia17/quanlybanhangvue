<template>
  <div class="storage-report">
    <!-- Report Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Báo cáo tồn kho</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Thống kê chi tiết tồn kho theo sản phẩm
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
                <v-icon size="28" color="blue">mdi-package-variant-closed</v-icon>
              </div>
              <div>
                <div class="text-overline blue--text text--darken-1 mb-1">Tổng sản phẩm</div>
                <div class="text-h5 font-weight-bold">
                  {{ reportData.length || 0 }}
                </div>
                <div class="text-caption blue--text text--darken-1">
                  <v-icon small color="blue">mdi-information-outline</v-icon>
                  <span class="ml-1">Số sản phẩm trong kho</span>
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
                <v-icon size="28" color="green">mdi-arrow-down-bold</v-icon>
              </div>
              <div>
                <div class="text-overline green--text text--darken-1 mb-1">Tổng nhập kho</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatNumber(getTotalInStock()) }}
                </div>
                <div class="text-caption green--text text--darken-1">
                  <v-icon small color="green">mdi-information-outline</v-icon>
                  <span class="ml-1">Tổng số lượng đã nhập</span>
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
                <v-icon size="28" color="deep-orange">mdi-arrow-up-bold</v-icon>
              </div>
              <div>
                <div class="text-overline deep-orange--text text--darken-1 mb-1">Tổng xuất kho</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatNumber(getTotalOutStock()) }}
                </div>
                <div class="text-caption deep-orange--text text--darken-1">
                  <v-icon small color="deep-orange">mdi-package-variant</v-icon>
                  <span class="ml-1">Tổng số lượng đã xuất</span>
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
                <v-icon size="28" color="amber darken-2">mdi-cash-multiple</v-icon>
              </div>
              <div>
                <div class="text-overline amber--text text--darken-2 mb-1">Giá trị tồn kho</div>
                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(getTotalInventoryValue()) }}
                </div>
                <div class="text-caption amber--text text--darken-2">
                  <v-icon small color="amber darken-2">mdi-finance</v-icon>
                  <span class="ml-1">Tổng giá trị hàng tồn kho</span>
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
          <h5 class="text-h6 font-weight-medium mb-1">Chi tiết tồn kho</h5>
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
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo Tên/Mã sản phẩm"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
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
        :search="search"
      >
        <template v-slot:item.index="{ index }">
          {{ index + 1 }}
        </template>

        <template v-slot:item.product.sku="{ item }">
          <div class="font-weight-medium">{{ item.product.sku || 'N/A' }}</div>
        </template>

        <template v-slot:item.product.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-2" v-if="item.product.image">
              <v-img :src="item.product.image" :alt="item.product.name"></v-img>
            </v-avatar>
            <v-avatar size="32" color="grey lighten-3" class="mr-2" v-else>
              <v-icon size="16" color="grey darken-2">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.product.name }}</div>
              <div class="text-caption grey--text" v-if="item.product.description">
                {{ truncateText(item.product.description, 30) }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.start="{ item }">
          <div class="font-weight-medium">{{ formatNumber(item.start) }}</div>
        </template>

        <template v-slot:item.total_nhap="{ item }">
          <div class="font-weight-medium">{{ formatNumber(item.total_nhap) }}</div>
          <div class="text-caption green--text" v-if="item.total_nhap > 0">
            <v-icon x-small color="green">mdi-plus</v-icon>
            Nhập kho
          </div>
        </template>

        <template v-slot:item.total_xuat="{ item }">
          <div class="font-weight-medium">{{ formatNumber(Math.abs(item.total_xuat)) }}</div>
          <div class="text-caption amber--text text--darken-3" v-if="item.total_xuat < 0">
            <v-icon x-small color="amber darken-3">mdi-minus</v-icon>
            Xuất kho
          </div>
        </template>

        <template v-slot:item.end="{ item }">
          <div
            class="font-weight-medium"
            :class="{
              'red--text': item.end <= 0,
              'amber--text text--darken-2': item.end > 0 && item.end <= 10,
              'green--text': item.end > 10
            }"
          >
            {{ formatNumber(item.end) }}
          </div>
          <v-chip
            x-small
            :color="getStockStatusColor(item.end)"
            text-color="white"
            v-if="item.end <= 10"
          >
            {{ getStockStatusText(item.end) }}
          </v-chip>
        </template>

        <template v-slot:item.product.retail_cost="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.product.retail_cost) }}</div>
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
            @click="navigateToProduct(item)"
            class="mr-1"
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>

        <template v-slot:footer.prepend>
          <div class="pa-4">
            <div class="text-subtitle-2 font-weight-bold">Tổng cộng:</div>
            <div class="d-flex flex-wrap mt-2">
              <div class="mr-4 mb-2">
                <span class="text-caption text-grey">Sản phẩm:</span>
                <span class="font-weight-medium">{{ reportData.length }}</span>
              </div>
              <div class="mr-4 mb-2">
                <span class="text-caption text-grey">Tổng nhập:</span>
                <span class="font-weight-medium">{{ formatNumber(getTotalInStock()) }}</span>
              </div>
              <div class="mr-4 mb-2">
                <span class="text-caption text-grey">Tổng xuất:</span>
                <span class="font-weight-medium">{{ formatNumber(getTotalOutStock()) }}</span>
              </div>
              <div class="mr-4 mb-2">
                <span class="text-caption text-grey">Giá trị tồn:</span>
                <span class="font-weight-medium">{{ formatCurrency(getTotalInventoryValue()) }}</span>
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
              Không có dữ liệu tồn kho
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
          Chi tiết sản phẩm
          <v-spacer></v-spacer>
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-4" v-if="selectedItem">
          <v-row>
            <v-col cols="12" sm="4" class="text-center">
              <v-avatar size="100" class="mb-2" v-if="selectedItem.product.image">
                <v-img :src="selectedItem.product.image" :alt="selectedItem.product.name"></v-img>
              </v-avatar>
              <v-avatar size="100" class="mb-2 grey lighten-3" v-else>
                <v-icon size="64" color="grey">mdi-package-variant</v-icon>
              </v-avatar>
              <div class="font-weight-bold mt-2">{{ selectedItem.product.name }}</div>
              <div class="text-caption grey--text">
                SKU: {{ selectedItem.product.sku || 'N/A' }}
              </div>
            </v-col>

            <v-col cols="12" sm="8">
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Mã sản phẩm</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem.product.sku || 'Chưa có mã' }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Đầu kỳ</v-list-item-title>
                    <v-list-item-subtitle>{{ formatNumber(selectedItem.start) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Nhập kho</v-list-item-title>
                    <v-list-item-subtitle class="green--text">{{ formatNumber(selectedItem.total_nhap) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Xuất kho</v-list-item-title>
                    <v-list-item-subtitle class="amber--text text--darken-3">{{ formatNumber(Math.abs(selectedItem.total_xuat)) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Cuối kỳ</v-list-item-title>
                    <v-list-item-subtitle :class="getEndValueClass(selectedItem.end)">{{ formatNumber(selectedItem.end) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Giá bán</v-list-item-title>
                    <v-list-item-subtitle>{{ formatCurrency(selectedItem.product.retail_cost) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="selectedItem.product.description">
                  <v-list-item-content>
                    <v-list-item-title>Mô tả</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem.product.description }}</v-list-item-subtitle>
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
      exportLoading: false,
      reportData: [],
      startDateMenu: false,
      endDateMenu: false,
      filters: {
        startDate: this.getDefaultStartDate(),
        endDate: this.getDefaultEndDate()
      },
      headers: [
        {
          text: 'STT',
          value: 'index',
          width: '50px',
          sortable: false
        },
        {
          text: 'MÃ SẢN PHẨM',
          value: 'product.sku',
          width: '130px'
        },
        {
          text: 'TÊN SẢN PHẨM',
          value: 'product.name',
          width: '220px'
        },
        {
          text: 'ĐẦU KỲ',
          value: 'start',
          width: '100px'
        },
        {
          text: 'ĐÃ NHẬP',
          value: 'total_nhap',
          width: '100px'
        },
        {
          text: 'ĐÃ XUẤT',
          value: 'total_xuat',
          width: '100px'
        },
        {
          text: 'CUỐI KỲ',
          value: 'end',
          width: '100px'
        },
        {
          text: 'GIÁ',
          value: 'product.retail_cost',
          width: '120px'
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
      selectedItem: null,
      // Store summary data from API response
      totalSummary: {
        total_inventory: 0,
        total_price: 0
      }
    }
  },
  methods: {
    fetchReport() {
      this.tableLoading = true;
      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate
      };

      reportActions.getStorageReport(params)
        .then(res => {
          this.reportData = res.data.data;
          this.totalSummary = res.data.total || {
            total_inventory: 0,
            total_price: 0
          };
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải dữ liệu báo cáo tồn kho');
          console.error('Error fetching storage report:', err);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    resetFilters() {
      this.filters.startDate = this.getDefaultStartDate();
      this.filters.endDate = this.getDefaultEndDate();
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
      this.selectedItem = item;
      this.detailDialog = true;
    },

    navigateToProduct(item) {
      const product = item ? item.product : (this.selectedItem ? this.selectedItem.product : null);
      if (product && product.id) {
        this.$router.push({
          path: '/product',
          query: { id: product.id }
        });
      }
    },

    exportToExcel() {
      this.exportLoading = true;
      
      const params = {
        start_date: this.filters.startDate,
        end_date: this.filters.endDate,
        per_page: 999999
      };

      reportActions.getStorageReport(params)
        .then(res => {
          this.generateExcelFile(res.data.data, res.data.total);
        })
        .catch(err => {
          this.$snackbar.error('Không thể xuất dữ liệu Excel');
          console.error('Error exporting storage report:', err);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },

    generateExcelFile(data, totalSummary) {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare summary data
      const totalProducts = data.length;
      const totalInStock = data.reduce((sum, item) => sum + (item.total_nhap || 0), 0);
      const totalOutStock = data.reduce((sum, item) => sum + Math.abs(item.total_xuat || 0), 0);
      const totalInventoryValue = totalSummary?.total_price || data.reduce((sum, item) => {
        const endValue = item.end || 0;
        const price = item.product.retail_cost || 0;
        return sum + (endValue * price);
      }, 0);
      
      // Create summary data array
      const summaryData = [
        ['BÁO CÁO TỒN KHO'],
        [`Thời gian: ${this.formatDate(this.filters.startDate)} - ${this.formatDate(this.filters.endDate)}`],
        [''],
        ['THỐNG KÊ TỔNG QUAN'],
        ['Tổng sản phẩm:', totalProducts],
        ['Tổng nhập kho:', totalInStock.toLocaleString('vi-VN')],
        ['Tổng xuất kho:', totalOutStock.toLocaleString('vi-VN')],
        ['Giá trị tồn kho:', totalInventoryValue.toLocaleString('vi-VN') + ' ₫'],
        [''],
        ['CHI TIẾT TỒN KHO'],
        ['STT', 'Mã SP', 'Tên sản phẩm', 'Đầu kỳ', 'Đã nhập', 'Đã xuất', 'Cuối kỳ', 'Giá bán', 'Giá trị tồn kho']
      ];
      
      // Add detail data
      data.forEach((item, index) => {
        const endValue = item.end || 0;
        const price = item.product.retail_cost || 0;
        const inventoryValue = endValue * price;
        
        summaryData.push([
          index + 1,
          item.product.sku || '',
          item.product.name || '',
          item.start || 0,
          item.total_nhap || 0,
          Math.abs(item.total_xuat || 0),
          endValue,
          price.toLocaleString('vi-VN') + ' ₫',
          inventoryValue.toLocaleString('vi-VN') + ' ₫'
        ]);
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // STT
        { wch: 15 },  // Mã SP
        { wch: 30 },  // Tên sản phẩm
        { wch: 12 },  // Đầu kỳ
        { wch: 12 },  // Đã nhập
        { wch: 12 },  // Đã xuất
        { wch: 12 },  // Cuối kỳ
        { wch: 15 },  // Giá bán
        { wch: 18 }   // Giá trị tồn kho
      ];
      
      // Style the header cells
      const headerRow = 10; // Row with headers (0-indexed)
      for (let col = 0; col < 9; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E3F2FD' } },
          alignment: { horizontal: 'center' }
        };
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tồn kho');
      
      // Generate filename
      const startDate = this.filters.startDate.split('-').reverse().join('');
      const endDate = this.filters.endDate.split('-').reverse().join('');
      const filename = `BaoCaoTonKho_${startDate}_${endDate}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      this.$snackbar.success('Xuất file Excel thành công!');
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

    getStockStatusColor(value) {
      if (value <= 0) return 'error';
      if (value <= 10) return 'warning';
      return 'success';
    },

    getStockStatusText(value) {
      if (value <= 0) return 'Hết hàng';
      if (value <= 10) return 'Sắp hết';
      return 'Còn hàng';
    },

    getEndValueClass(value) {
      if (value <= 0) return 'red--text';
      if (value <= 10) return 'amber--text text--darken-2';
      return 'green--text';
    },

    // Summary statistics methods
    getTotalInStock() {
      return this.reportData.reduce((sum, item) => sum + (item.total_nhap || 0), 0);
    },

    getTotalOutStock() {
      return this.reportData.reduce((sum, item) => sum + Math.abs(item.total_xuat || 0), 0);
    },

    getTotalInventoryValue() {
      // Use the total from API if available
      if (this.totalSummary && this.totalSummary.total_price) {
        return this.totalSummary.total_price;
      }
      // Otherwise calculate it
      return this.reportData.reduce((sum, item) => {
        const endValue = item.end || 0;
        const price = item.product.retail_cost || 0;
        return sum + (endValue * price);
      }, 0);
    }
  },
  mounted() {
    this.fetchReport();
  }
}
</script>

<style scoped>
.storage-report {
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
