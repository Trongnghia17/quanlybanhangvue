<template>
  <div class="storage-management">
    <h4 class="page-title mb-4">Quản lý kho hàng</h4>

    <!-- Search and filters -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="searchQuery"
          label="Tên sản phẩm"
          prepend-inner-icon="mdi-magnify"
          outlined
          hide-details
          dense
          @keyup.enter="fetchProducts"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="filter.stock_status"
          :items="stockStatusOptions"
          label="Trạng thái"
          outlined
          dense
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4" class="d-flex">
        <v-btn
          color="primary"
          class="mr-2"
          @click="fetchProducts"
          prepend-icon="mdi-filter"
        >
          <v-icon left>mdi-filter</v-icon>
          Tìm kiếm
        </v-btn>

        <v-btn
          color="primary"
          outlined
          class="mr-2"
          @click="showLowStockProducts"
        >
          <v-icon left>mdi-alert</v-icon>
          Sản phẩm sắp hết hàng
        </v-btn>

        <v-btn
          color="success"
          @click="exportExcel"
        >
          <v-icon left>mdi-file-excel</v-icon>
          Xuất Excel
        </v-btn>
<!--
        <v-btn
          color="info"
          class="ml-2"
          @click="createInventoryCheck"
        >
          <v-icon left>mdi-plus</v-icon>
          Tạo phiếu kiểm kho
        </v-btn> -->
      </v-col>
    </v-row>

    <!-- Products table -->
    <v-card class="mt-4">
      <v-data-table
        :headers="headers"
        :items="products"
        :loading="loading"
        :server-items-length="totalItems"
        :options.sync="options"
        :items-per-page="itemsPerPage"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
          'items-per-page-text': 'Hiển thị',
        }"
        class="elevation-1"
      >
        <!-- STT Column -->
        <template v-slot:item.stt="{ index }">
          {{ index + 1 }}
        </template>

        <!-- SKU Column -->
        <template v-slot:item.sku="{ item }">
          <a href="#" class="blue--text" @click.prevent="viewProduct(item)">{{ item.sku || '-' }}</a>
        </template>

        <!-- Product Name Column -->
        <template v-slot:item.name="{ item }">
          <a href="#" class="blue--text" @click.prevent="viewProduct(item)">{{ item.name }}</a>
        </template>

        <!-- Category Column -->
        <template v-slot:item.category="{ item }">
          {{ getCategoryName(item) }}
        </template>

        <!-- Base Cost Column -->
        <template v-slot:item.base_cost="{ item }">
          <span>{{ formatCurrency(item.base_cost) }}</span>
          <v-icon
            small
            class="ml-1"
            color="grey"
            @click="editProductCost(item)"
          >
            mdi-pencil
          </v-icon>
        </template>

        <!-- Retail Cost Column -->
        <template v-slot:item.retail_cost="{ item }">
          <span>{{ formatCurrency(item.retail_cost) }}</span>
          <v-icon
            small
            class="ml-1"
            color="grey"
            @click="editProductPrice(item)"
          >
            mdi-pencil
          </v-icon>
        </template>

        <!-- Available Stock Column -->
        <template v-slot:item.available="{ item }">
          <span :class="getStockColorClass(item.available)">{{ item.available }}</span>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="viewProduct(item)" title="Xem chi tiết">
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small @click="addProduct(item)" title="Cân bằng kho">
            <v-icon small>mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Product view/edit dialog -->
    <v-dialog v-model="productDialog" max-width="800px">
      <v-card>
        <v-card-title class="headline">
          Chi tiết sản phẩm
          <v-spacer></v-spacer>
          <v-btn icon @click="closeProductDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="selectedProduct">
          <v-row>
            <v-col cols="12" md="4">
              <v-img
                :src="selectedProduct.image"
                max-height="200"
                contain
                class="grey lighten-2"
              ></v-img>
            </v-col>
            <v-col cols="12" md="8">
              <v-row>
                <v-col cols="12" md="6">
                  <p><strong>Mã sản phẩm:</strong> {{ selectedProduct.sku || 'Chưa có mã' }}</p>
                  <p><strong>Tên sản phẩm:</strong> {{ selectedProduct.name }}</p>
                  <p><strong>Giá vốn:</strong> {{ formatCurrency(selectedProduct.base_cost) }}</p>
                  <p><strong>Giá bán lẻ:</strong> {{ formatCurrency(selectedProduct.retail_cost) }}</p>
                  <p><strong>Giá bán buôn:</strong> {{ formatCurrency(selectedProduct.wholesale_cost) }}</p>
                </v-col>
                <v-col cols="12" md="6">
                  <p><strong>Tồn kho:</strong> <span :class="getStockColorClass(selectedProduct.available)">{{ selectedProduct.temporality }}</span></p>
                  <p><strong>Nhập kho:</strong> {{ selectedProduct.in_stock }}</p>
                  <p><strong>Đã bán:</strong> {{ selectedProduct.sold }}</p>
                  <p><strong>Đơn vị:</strong> {{ selectedProduct.unit || 'Chưa có đơn vị' }}</p>
                  <p><strong>Trạng thái:</strong> {{ selectedProduct.is_active ? 'Đang kinh doanh' : 'Ngừng kinh doanh' }}</p>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <p><strong>Mô tả:</strong></p>
                  <p>{{ selectedProduct.description || 'Không có mô tả' }}</p>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="editProduct">
            <v-icon left>mdi-pencil</v-icon>
            Chỉnh sửa
          </v-btn>
          <v-btn color="success" text @click="addStockDialog = true">
            <v-icon left>mdi-plus</v-icon>
            Kiểm kho
          </v-btn>
          <!-- <v-btn color="error" text @click="exportStockDialog = true">
            <v-icon left>mdi-minus</v-icon>
            Xuất kho
          </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add stock dialog -->
    <v-dialog v-model="addStockDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">{{ selectedProduct ? selectedProduct.name : 'Tạo phiếu kiểm kho' }}</v-card-title>
        <v-card-text>
          <v-form ref="addStockForm">
            <div class="d-flex mb-3">
              <div class="mr-3" style="width: 30%">
                <label class="mb-1 d-block">SKU</label>
                <v-text-field
                  v-model="stockForm.sku"
                  outlined
                  dense
                  hide-details
                  :placeholder="selectedProduct ? selectedProduct.sku : ''"
                  disabled
                ></v-text-field>
              </div>
              <div class="mr-3" style="width: 35%">
                <label class="mb-1 d-block">Thực tế</label>
                <div class="d-flex align-center">
                  <v-btn icon dense @click="decreaseQuantity"><v-icon>mdi-minus</v-icon></v-btn>
                  <v-text-field
                    v-model="stockForm.actual"
                    outlined
                    dense
                    hide-details
                    type="number"
                    class="mx-2"
                    @input="calculateDifference"
                  ></v-text-field>
                  <v-btn icon dense @click="increaseQuantity"><v-icon>mdi-plus</v-icon></v-btn>
                </div>
              </div>
              <div style="width: 35%">
                <label class="mb-1 d-block">Chênh lệch</label>
                <v-text-field
                  v-model="stockForm.difference"
                  outlined
                  dense
                  hide-details
                  type="number"
                  disabled
                ></v-text-field>
              </div>
            </div>
            <div>
              <label class="mb-1 d-block">Ghi chú</label>
              <v-textarea
                v-model="stockForm.note"
                outlined
                dense
                hide-details
                placeholder="Ghi chú"
                rows="4"
              ></v-textarea>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" outlined class="mr-2" @click="submitAddStock(1)">Cân bằng kho</v-btn>
          <v-btn color="primary" class="mr-2" @click="submitAddStock(2)">Lưu nháp</v-btn>
          <v-btn color="grey darken-1" @click="addStockDialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Export stock dialog -->
    <v-dialog v-model="exportStockDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Xuất kho</v-card-title>
        <v-card-text>
          <v-form ref="exportStockForm">
            <v-text-field
              v-model="stockForm.quantity"
              label="Số lượng"
              type="number"
              :rules="[v => !!v || 'Số lượng không được để trống', v => v > 0 || 'Số lượng phải lớn hơn 0']"
              required
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="stockForm.note"
              label="Ghi chú"
              outlined
              dense
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="exportStockDialog = false">Hủy</v-btn>
          <v-btn color="error" text @click="submitExportStock">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import productModule from '@/api/products'
const productActions = productModule.actions
import inventoriesModule from '@/api/inventories'
const inventoriesActions = inventoriesModule.actions

export default {
  name: 'StorageManagement',
  data() {
    return {
      products: [],
      searchQuery: '',
      loading: false,
      totalItems: 0,
      itemsPerPage: 20,
      options: {},
      selectedProduct: null,
      productDialog: false,
      addStockDialog: false,
      exportStockDialog: false,
      stockForm: {
        quantity: '',
        note: '',
        sku: '',
        actual: 0,
        difference: 0
      },
      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '70px' },
        { text: 'MÃ SP', value: 'sku', sortable: true, width: '120px' },
        { text: 'TÊN SP', value: 'name', sortable: true },
        { text: 'LOẠI SẢN PHẨM', value: 'category', sortable: false },
        { text: 'GIÁ VỐN', value: 'base_cost', sortable: true, align: 'end' },
        { text: 'GIÁ BÁN LẺ', value: 'retail_cost', sortable: true, align: 'end' },
        { text: 'TỒN KHO', value: 'temporality', sortable: true, align: 'end' },
        { text: 'CHỨC NĂNG', value: 'actions', sortable: false, align: 'center', width: '120px' }
      ],
      filter: {
        stock_status: 'all', // all, in-stock, out-of-stock, low-stock
      },
      stockStatusOptions: [
        { text: 'Tất cả', value: 'all' },
        { text: 'Còn hàng', value: 'in-stock' },
        { text: 'Hết hàng', value: 'out-of-stock' },
        { text: 'Sắp hết hàng', value: 'low-stock' }
      ],
      totalStats: {
        base_cost: 0,
        available: 0,
        in_stock: 0
      }
    }
  },
  watch: {
    options: {
      handler() {
        this.fetchProducts();
      },
      deep: true
    }
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    fetchProducts() {
      this.loading = true;

      const params = {
        page: this.options.page || 1,
        per_page: this.options.itemsPerPage || this.itemsPerPage,
        search: this.searchQuery || '',
        sort_by: this.options.sortBy && this.options.sortBy.length ? this.options.sortBy[0] : 'id',
        sort_desc: this.options.sortDesc && this.options.sortDesc.length ? this.options.sortDesc[0] : false
      };

      // Add filter for stock status
      if (this.filter.stock_status === 'in-stock') {
        params.stock_status = 'in-stock';
      } else if (this.filter.stock_status === 'out-of-stock') {
        params.stock_status = 'out-of-stock';
      } else if (this.filter.stock_status === 'low-stock') {
        params.stock_status = 'low-stock';
      }

      productActions.getStorage(params)
        .then(response => {
          if (response.status === 200 && response.data) {
            this.products = response.data.data;
            this.totalItems = response.data.meta.total;

            if (response.data.total) {
              this.totalStats = response.data.total;
            }
          }
        })
        .catch(error => {
          console.error('Error fetching storage data:', error);
          this.$snackbar.error('Không thể tải dữ liệu kho hàng');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '0';
      return value.toLocaleString('vi-VN');
    },

    getStockColorClass(stockLevel) {
      if (stockLevel <= 0) return 'red--text';
      if (stockLevel <= 5) return 'amber--text text--darken-2';
      return '';
    },

    getCategoryName(item) {
      return item.category_name || 'Thường';
    },

    viewProduct(item) {
      this.selectedProduct = item;
      this.productDialog = true;
    },

    closeProductDialog() {
      this.productDialog = false;
      this.selectedProduct = null;
    },

    editProduct() {
      if (this.selectedProduct) {
        this.$router.push({
          path: '/product',
          query: { id: this.selectedProduct.id, edit: true }
        });
      }
    },

    editProductCost(item) {
      this.selectedProduct = item;
      // Open edit cost dialog or navigate to product edit page
      this.$router.push({
        path: '/product',
        query: { id: item.id, edit: true, focus: 'cost' }
      });
    },

    editProductPrice(item) {
      this.selectedProduct = item;
      // Open edit price dialog or navigate to product edit page
      this.$router.push({
        path: '/product',
        query: { id: item.id, edit: true, focus: 'price' }
      });
    },

    addProduct(item) {
      this.selectedProduct = item;
      // Initialize the form with the current available stock value
      this.stockForm = {
        quantity: '',
        note: '',
        sku: item.sku,
        actual: item.temporality, // Initialize actual with available from API
        difference: 0 // Initial difference is 0
      };
      this.addStockDialog = true;
    },

    decreaseQuantity() {
      if (this.stockForm.actual > 0) {
        this.stockForm.actual--;
        this.calculateDifference();
      }
    },

    increaseQuantity() {
      this.stockForm.actual++;
      this.calculateDifference();
    },

    calculateDifference() {
      // Calculate the difference between actual and initial available
      if (this.selectedProduct) {
        this.stockForm.difference = parseInt(this.stockForm.actual) - this.selectedProduct.temporality;
      }
    },

    balanceInventory() {
      // Submit the inventory adjustment with the calculated difference
      if (this.selectedProduct && this.stockForm.difference !== 0) {
        // Prepare data for API call
        const data = {
          product_id: this.selectedProduct.id,
          quantity: this.stockForm.difference,
          note: this.stockForm.note || 'Cân bằng kho'
        };

        // Call API to adjust inventory
        productActions.adjustStock(data)
          .then(() => {
            this.$snackbar.success('Cân bằng kho thành công');
            this.addStockDialog = false;
            this.fetchProducts(); // Refresh the product list
          })
          .catch(error => {
            console.error('Error balancing inventory:', error);
            this.$snackbar.error('Không thể cân bằng kho');
          });
      } else {
        this.$snackbar.info('Không có thay đổi về số lượng');
      }
    },

    async submitAddStock(status = 1) {
      if (this.stockForm.difference !== 0) {
        try {
          // Use the difference as the quantity to adjust
          status = status === 1 ? true : false; // 1 for balance, 2 for draft
          let data = {
            status: status,
            note: this.stockForm.note || 'Điều chỉnh kho',
            inventories_detail: [
              {
                product_id: this.selectedProduct.id,
                quantity_current: this.selectedProduct.temporality,
                sku: this.stockForm.sku,
                quantity_reality: this.stockForm.actual,
                note: this.stockForm.note,
              }
            ]
          };
          await inventoriesActions.createInventory(data)
          .then((res) => {
            if (res.status === 200) {
              this.$snackbar.success('Lưu nhập thành công');
            } else {
              this.$snackbar.error('Không thể lưu nhập kho');
            }
          });

          this.addStockDialog = false;
          this.fetchProducts(); // Refresh the product list
        } catch (error) {
          console.error('Error adjusting stock:', error);
          this.$snackbar.error('Không thể lưu nhập kho');
        }
      } else {
        this.$snackbar.info('Không có thay đổi về số lượng');
        this.addStockDialog = false;
      }
    },

    async submitExportStock() {
      if (this.$refs.exportStockForm.validate()) {
        try {
          await productActions.exportStock({
            product_id: this.selectedProduct.id,
            quantity: parseInt(this.stockForm.quantity),
            note: this.stockForm.note
          });

          this.$snackbar.success('Xuất kho thành công');
          this.exportStockDialog = false;
          this.fetchProducts();
        } catch (error) {
          console.error('Error exporting stock:', error);
          this.$snackbar.error('Không thể xuất kho sản phẩm');
        }
      }
    },

    showLowStockProducts() {
      this.filter.stock_status = 'low-stock';
      this.fetchProducts();
    },

    exportExcel() {
      this.$snackbar.info('Tính năng xuất Excel đang được phát triển');
      // Placeholder for Excel export functionality
    },

    createInventoryCheck() {
      this.$snackbar.info('Tính năng tạo phiếu kiểm kho đang được phát triển');
      // Placeholder for inventory check functionality
    }
  }
}
</script>

<style scoped>
.page-title {
  color: #1976d2;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.stock-value {
  font-weight: 500;
}

.storage-management {
  padding-bottom: 1rem;
}

.v-data-table ::v-deep tbody tr:hover {
  background-color: #f5f5f5;
}

.v-data-table ::v-deep th {
  font-weight: 500 !important;
}

/* Add animation for stock changes */
@keyframes highlight {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(255, 213, 79, 0.2);
  }
  100% {
    background-color: transparent;
  }
}

.highlight {
  animation: highlight 2s;
}
</style>
