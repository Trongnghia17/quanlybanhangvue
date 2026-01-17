<template>
  <div class="inventory-check-list">
    <h4 class="page-title mb-4">Danh sách kiểm kho</h4>

    <!-- Search and filters -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="searchQuery"
          label="Mã phiếu"
          prepend-inner-icon="mdi-magnify"
          outlined
          hide-details
          dense
          @keyup.enter="fetchInventories"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-menu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="dateRangeText"
              label="Thời gian"
              prepend-inner-icon="mdi-calendar"
              readonly
              outlined
              dense
              hide-details
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateRange"
            range
            scrollable
            @change="fetchInventories"
            @input="dateMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" sm="4" class="d-flex">
        <v-btn
          color="primary"
          class="mr-2"
          @click="fetchInventories"
          prepend-icon="mdi-filter"
        >
          <v-icon left>mdi-filter</v-icon>
          Tìm kiếm
        </v-btn>

        <v-btn
          color="success"
          @click="exportExcel"
        >
          <v-icon left>mdi-file-excel</v-icon>
          Xuất Excel
        </v-btn>

        <v-btn
          color="info"
          class="ml-2"
          @click="createInventoryCheck"
        >
          <v-icon left>mdi-plus</v-icon>
          Tạo phiếu kiểm kho
        </v-btn>
      </v-col>
    </v-row>

    <!-- Inventories table -->
    <v-card class="mt-4">
      <v-data-table
        :headers="headers"
        :items="inventories"
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

        <!-- Code Column -->
        <template v-slot:item.code="{ item }">
          <a href="#" class="blue--text" @click.prevent="viewInventory(item)">{{ item.code }}</a>
        </template>

        <!-- Date Column -->
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- Creator Column -->
        <template v-slot:item.user="{ item }">
          {{ item.user ? item.user.name : '-' }}
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            small
            :color="item.status === 1 ? 'success' : 'warning'"
            text-color="white"
          >
            {{ item.status === 1 ? 'Thành công' : 'Bản nháp' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="viewInventory(item)" title="Xem chi tiết">
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteInventories(item)" title="Xóa phiếu kiểm kho">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Inventory Detail Dialog -->
    <v-dialog v-model="inventoryDetailDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline d-flex justify-space-between">
          Chi tiết phiếu kiểm kho
          <v-btn icon @click="inventoryDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="selectedInventory">
          <div class="mb-4">
            <div class="font-weight-medium mb-2">Mã phiếu</div>
            <v-text-field
              v-model="selectedInventory.code"
              outlined
              dense
              readonly
              hide-details
            ></v-text-field>
          </div>

          <div v-for="(detail, index) in selectedInventory.inventories_detail" :key="index" class="mb-4">
            <div class="font-weight-medium mb-2">{{ index + 1 }}. {{ detail.product ? detail.product.name : 'Sản phẩm không xác định' }}</div>

            <div class="d-flex mb-2">
              <div class="mr-2" style="width: 33%">
                <div class="caption grey--text mb-1">Mã sản phẩm</div>
                <v-text-field
                  :value="detail.product ? detail.product.sku || 'sku' + detail.product.id : ''"
                  outlined
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </div>
              <div class="mr-2" style="width: 33%">
                <div class="caption grey--text mb-1">Tồn kho</div>
                <v-text-field
                  :value="detail.quantity_current"
                  outlined
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </div>
              <div style="width: 34%">
                <div class="caption grey--text mb-1">Số lượng thực tế</div>
                <v-text-field
                  :value="detail.quantity_reality"
                  outlined
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </div>
            </div>
            <div class="mb-4">
              <div class="font-weight-medium mb-2">Ghi chú</div>
              <v-textarea
                v-model="detail.note"
                outlined
                dense
                readonly
                hide-details
                rows="3"
                no-resize
              ></v-textarea>
            </div>
          </div>



        </v-card-text>
        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" @click="inventoryDetailDialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Inventory Check Dialog -->
    <v-dialog v-model="createInventoryDialog" max-width="700px">
      <v-card>
        <v-card-title class="headline">
          Tạo phiếu kiểm kho mới
          <v-spacer></v-spacer>
          <v-btn icon @click="createInventoryDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="createInventoryForm">
            <!-- Product Selection Section -->
            <v-autocomplete
              v-model="selectedProducts"
              :items="productsList"
              item-text="name"
              item-value="id"
              label="Chọn sản phẩm kiểm kho"
              multiple
              chips
              outlined
              dense
              :loading="loadingProducts"
              @input="handleProductSelection"
            >
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index < 3" small>{{ item.name }}</v-chip>
                <span v-if="index === 3" class="grey--text caption">
                  (+{{ selectedProducts.length - 3 }} sản phẩm khác)
                </span>
              </template>
            </v-autocomplete>

            <div v-for="(product, index) in inventoryForm.products" :key="product.id" class="my-3 pa-3 rounded-lg" style="border: 1px solid #e0e0e0;">
              <div class="d-flex justify-space-between">
                <h3 class="subtitle-1">{{ index + 1 }}. {{ product.name }}</h3>
                <v-btn icon small @click="removeProduct(index)">
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </div>

              <div class="d-flex mt-2">
                <div class="mr-3" style="width: 30%">
                  <label class="mb-1 d-block">SKU</label>
                  <v-text-field
                    v-model="product.sku"
                    outlined
                    dense
                    hide-details
                    disabled
                  ></v-text-field>
                </div>
                <div class="mr-3" style="width: 35%">
                  <label class="mb-1 d-block">Thực tế</label>
                  <div class="d-flex align-center">
                    <v-btn icon dense @click="decreaseQuantity(index)">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                    <v-text-field
                      v-model="product.actual"
                      outlined
                      dense
                      hide-details
                      type="number"
                      class="mx-2"
                      @input="calculateDifference(index)"
                    ></v-text-field>
                    <v-btn icon dense @click="increaseQuantity(index)">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div style="width: 35%">
                  <label class="mb-1 d-block">Chênh lệch</label>
                  <v-text-field
                    v-model="product.difference"
                    outlined
                    dense
                    hide-details
                    type="number"
                    disabled
                  ></v-text-field>
                </div>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="mt-4">
              <label class="mb-1 d-block">Ghi chú</label>
              <v-textarea
                v-model="inventoryForm.note"
                outlined
                dense
                hide-details
                placeholder="Ghi chú phiếu kiểm kho"
                rows="3"
              ></v-textarea>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" outlined class="mr-2" @click="submitInventory(false)">Lưu nháp</v-btn>
          <v-btn color="primary" class="mr-2" @click="submitInventory(true)">Xác nhận</v-btn>
          <v-btn color="grey darken-1" @click="createInventoryDialog = false">Hủy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import inventoriesModule from '@/api/inventories'
const inventoriesActions = inventoriesModule.actions
import productModule from '@/api/products'
const productActions = productModule.actions

export default {
  name: 'InventoryCheckList',
  data() {
    return {
      searchQuery: '',
      dateRange: [],
      dateMenu: false,
      inventories: [],
      loading: false,
      totalItems: 0,
      itemsPerPage: 20,
      options: {},
      inventoryDetailDialog: false,
      createInventoryDialog: false,
      selectedInventory: null,
      headers: [
        { text: 'STT', value: 'stt', sortable: false, width: '70px' },
        { text: 'MÃ PHIẾU', value: 'code', sortable: true },
        { text: 'NGÀY', value: 'created_at', sortable: true },
        { text: 'NGƯỜI KIỂM', value: 'user', sortable: false },
        { text: 'TRẠNG THÁI', value: 'status', sortable: true, align: 'center' },
        { text: 'CHỨC NĂNG', value: 'actions', sortable: false, align: 'center', width: '100px' }
      ],
      productsList: [],
      loadingProducts: false,
      selectedProducts: [],
      inventoryForm: {
        note: '',
        products: []
      }
    }
  },
  computed: {
    dateRangeText() {
      if (!this.dateRange || this.dateRange.length !== 2) return 'Chọn thời gian';
      return `${this.formatDateShort(this.dateRange[0])} - ${this.formatDateShort(this.dateRange[1])}`;
    }
  },
  watch: {
    options: {
      handler() {
        this.fetchInventories();
      },
      deep: true
    }
  },
  mounted() {
    this.fetchInventories();
  },
  methods: {
    deleteInventories(item) {
        let data = {
          id: item.id
        };
        inventoriesActions.deleteInventory(data)
          .then(response => {
            if (response.status === 200 && response.data && response.data.success) {
              this.$snackbar.success('Đã xóa phiếu kiểm kho thành công');
              this.fetchInventories();
            } else {
              this.$snackbar.error('Không thể xóa phiếu kiểm kho');
            }
          })
          .catch(error => {
            console.error('Error deleting inventory:', error);
            this.$snackbar.error('Không thể xóa phiếu kiểm kho');
          });
    },
    fetchInventories() {
      this.loading = true;

      const params = {
        page: this.options.page || 1,
        per_page: this.options.itemsPerPage || this.itemsPerPage,
        search: this.searchQuery || ''
      };

      // Add date range filter if selected
      if (this.dateRange && this.dateRange.length === 2) {
        params.start_date = this.dateRange[0];
        params.end_date = this.dateRange[1];
      }

      // Add sorting if available
      if (this.options.sortBy && this.options.sortBy.length) {
        params.sort_by = this.options.sortBy[0];
        params.sort_desc = this.options.sortDesc && this.options.sortDesc[0] ? 1 : 0;
      }

      inventoriesActions.getInventories(params)
        .then(response => {
          if (response.status === 200 && response.data && response.data.success) {
            this.inventories = response.data.data;
            this.totalItems = response.data.meta ? response.data.meta.total : this.inventories.length;
          }
        })
        .catch(error => {
          console.error('Error fetching inventories:', error);
          this.$snackbar.error('Không thể tải dữ liệu phiếu kiểm kho');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    },

    formatDateShort(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    viewInventory(item) {
      this.selectedInventory = item;
      this.inventoryDetailDialog = true;
    },

    createInventoryCheck() {
      this.createInventoryDialog = true;
      this.inventoryForm = {
        note: '',
        products: []
      };
      this.selectedProducts = [];
      this.fetchProductsList();
    },

    fetchProductsList() {
      this.loadingProducts = true;
      productActions.getStorage({ per_page: 100 })
        .then(response => {
          if (response.status === 200 && response.data) {
            this.productsList = response.data.data.map(product => ({
              id: product.id,
              name: product.name,
              sku: product.sku || `sku${product.id}`,
              available: product.available
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          this.$snackbar.error('Không thể tải danh sách sản phẩm');
        })
        .finally(() => {
          this.loadingProducts = false;
        });
    },

    handleProductSelection() {
      // Reset product list
      this.inventoryForm.products = [];

      // Add selected products to the form
      this.selectedProducts.forEach(productId => {
        const product = this.productsList.find(p => p.id === productId);
        if (product) {
          this.inventoryForm.products.push({
            id: product.id,
            name: product.name,
            sku: product.sku,
            available: product.available,
            actual: product.available,
            difference: 0
          });
        }
      });
    },

    removeProduct(index) {
      // Remove from products array
      const productId = this.inventoryForm.products[index].id;
      this.inventoryForm.products.splice(index, 1);

      // Also remove from selectedProducts array
      const selectedIndex = this.selectedProducts.indexOf(productId);
      if (selectedIndex !== -1) {
        this.selectedProducts.splice(selectedIndex, 1);
      }
    },

    decreaseQuantity(index) {
      if (this.inventoryForm.products[index].actual > 0) {
        this.inventoryForm.products[index].actual--;
        this.calculateDifference(index);
      }
    },

    increaseQuantity(index) {
      this.inventoryForm.products[index].actual++;
      this.calculateDifference(index);
    },

    calculateDifference(index) {
      const product = this.inventoryForm.products[index];
      product.difference = parseInt(product.actual) - product.available;
    },

    submitInventory(isConfirmed) {
      if (this.inventoryForm.products.length === 0) {
        this.$snackbar.error('Vui lòng chọn ít nhất một sản phẩm');
        return;
      }

      const payload = {
        status: isConfirmed ? 1 : 0, // 1 for confirmed, 0 for draft
        note: this.inventoryForm.note,
        inventories_detail: this.inventoryForm.products.map(product => ({
          product_id: product.id,
          quantity_current: product.available,
          quantity_reality: parseInt(product.actual)
        }))
      };

      inventoriesActions.createInventory(payload)
        .then(response => {
          if (response.status === 200 && response.data && response.data.success) {
            this.$snackbar.success(isConfirmed ? 'Đã tạo phiếu kiểm kho thành công' : 'Đã lưu nháp phiếu kiểm kho');
            this.createInventoryDialog = false;
            this.fetchInventories();
          } else {
            this.$snackbar.error('Không thể tạo phiếu kiểm kho');
          }
        })
        .catch(error => {
          console.error('Error creating inventory check:', error);
          this.$snackbar.error('Không thể tạo phiếu kiểm kho');
        });
    },

    exportExcel() {
      this.$snackbar.info('Tính năng xuất Excel đang được phát triển');
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

.inventory-check-list {
  padding-bottom: 1rem;
}

.v-data-table ::v-deep tbody tr:hover {
  background-color: #f5f5f5;
}

.v-data-table ::v-deep th {
  font-weight: 500 !important;
}
</style>
