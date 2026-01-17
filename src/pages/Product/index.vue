<template>
  <div class="product-management">
    <!-- Page Header with Analytics Banner -->
    <v-card class="mb-6 rounded-lg elevation-3 overflow-hidden">
      <v-img
        src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fHByb2R1Y3QlMjBtYW5hZ2VtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
        max-height="200"
        gradient="to top, rgba(25,32,72,.85), rgba(25,32,72,.0)"
      >
        <v-row class="fill-height" align="end">
          <v-col>
            <div class="pa-4 pt-8 white--text">
              <div class="d-flex align-center">
                <v-icon size="38" color="white" class="mr-3">mdi-package-variant-closed</v-icon>
                <div>
                  <h2 class="text-h4 font-weight-medium mb-1">Quản lý sản phẩm</h2>
                  <div class="text-subtitle-1 font-weight-light">
                    Theo dõi, quản lý và cập nhật thông tin sản phẩm
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="auto" class="pa-4">
            <v-chip
              color="teal"
              text-color="white"
              class="font-weight-bold px-3"
              size="large"
            >
              <v-icon left>mdi-package-variant</v-icon>
              {{totalItems}} sản phẩm
            </v-chip>
          </v-col>
        </v-row>
      </v-img>
    </v-card>

    <!-- Main Content Area -->
    <div class="d-flex flex-wrap">
      <!-- Stats Cards -->
    </div>

    <!-- Product Data Management -->
    <v-card class="rounded-lg elevation-3 mb-6">
      <v-card-title class="py-4">
        <v-row align="center">
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo Tên/SKU/Mô tả sản phẩm"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
              @input="onSearchInput"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="filterCategory"
              :items="categoryOptions"
              item-text="name"
              item-value="id"
              label="Lọc theo nhóm hàng"
              outlined
              dense
              hide-details
              :loading="loadingCategories"
              clearable
              @change="onCategoryFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="12" md="4" class="d-flex justify-end align-center">
            <v-btn
              color="grey lighten-3"
              class="mr-2 text-none rounded-lg"
              elevation="0"
              @click="openExportDialog = true"
            >
              <v-icon left small>mdi-file-export</v-icon>
              Xuất Excel
            </v-btn>

            <v-btn
              color="amber darken-2"
              dark
              class="mr-2 text-none rounded-lg"
              elevation="0"
              @click="openImportDialog = true"
            >
              <v-icon left small>mdi-file-import</v-icon>
              Nhập Excel
            </v-btn>

            <v-btn
              color="primary"
              dark
              @click="openDialog = !openDialog"
              class="px-4 font-weight-medium text-none rounded-lg"
              elevation="2"
            >
              <v-icon left>mdi-plus</v-icon>
              Thêm sản phẩm mới
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Display options toggle -->
      <v-card-actions class="px-4 py-2 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn-toggle
          v-model="displayMode"
          color="primary"
          group
          mandatory
          dense
          class="elevation-0 rounded-lg"
        >
          <v-btn value="table" small class="px-3">
            <v-icon small>mdi-table</v-icon>
            <span class="ml-1 text-caption">Bảng</span>
          </v-btn>
          <v-btn value="grid" small class="px-3">
            <v-icon small>mdi-grid</v-icon>
            <span class="ml-1 text-caption">Lưới</span>
          </v-btn>
        </v-btn-toggle>
      </v-card-actions>

      <!-- Table View -->
      <v-data-table
        v-if="displayMode === 'table'"
        :headers="headers"
        :items="listProducts"
        :items-per-page="perPage"
        :server-items-length="totalItems"
        :loading="tableLoading"
        loading-text="Đang tải dữ liệu..."
        sort-by="name"
        class="elevation-0 custom-data-table"
        @update:options="updateDisplayedItems"
        :footer-props="{
          'items-per-page-text': 'Số sản phẩm mỗi trang:',
          'items-per-page-options': [10, 20, 50, 100],
          'show-first-last-page': true
        }"
      >
        <template v-slot:item.image="{ item }">
          <div class="product-image">
            <v-img
              :src="item.image || 'https://via.placeholder.com/150?text=No+Image'"
              max-width="60"
              max-height="60"
              contain
              class="rounded-lg"
            ></v-img>
          </div>
        </template>

        <template v-slot:item.name="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption grey--text">SKU: {{ item.sku }}</div>
          </div>
        </template>

        <template v-slot:item.description="{ item }">
          <div class="text-truncate description-cell">{{ item.description || 'Không có mô tả' }}</div>
        </template>

        <template v-slot:item.unit="{ item }">
          <div>{{ (item.unit) }}</div>
        </template>

        <template v-slot:item.base_cost="{ item }">
          <div>{{ formatCurrency(item.base_cost) }}</div>
        </template>

        <template v-slot:item.retail_cost="{ item }">
          <div class="font-weight-medium">{{ formatCurrency(item.retail_cost) }}</div>
        </template>

        <template v-slot:item.wholesale_cost="{ item }">
          <div>{{ formatCurrency(item.wholesale_cost) }}</div>
        </template>

        <template v-slot:item.in_stock="{ item }">
          <v-chip
            :color="getStockColor(item.in_stock)"
            text-color="white"
            x-small
            class="px-2"
          >
            {{ item.in_stock }}
          </v-chip>
        </template>

        <template v-slot:item.sold="{ item }">
          <div>
            <div>{{ item.sold }}</div>
            <div v-if="item.in_stock + item.sold > 0" class="text-caption grey--text">
              {{ Math.round(item.sold / (item.in_stock + item.sold) * 100) }}% bán ra
            </div>
          </div>
        </template>

        <template v-slot:item.is_show="{ item }">
          <v-chip
            :color="item.is_show == 1 ? 'success' : 'error'"
            text-color="white"
            small
            class="px-2"
          >
            {{ item.is_show == 1 ? 'Mở bán' : 'Đã dừng bán' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  x-small
                  color="primary"
                  class="mr-1"
                  v-bind="attrs"
                  v-on="on"
                  @click="editProduct(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Chỉnh sửa</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  x-small
                  color="error"
                  v-bind="attrs"
                  v-on="on"
                  @click="deleteProduct(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Xóa</span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:no-data>
          <v-card flat class="pa-8 text-center mx-auto" max-width="500">
            <v-img
              src="https://cdn.vuetifyjs.com/images/lists/no-results.svg"
              max-width="200"
              class="mx-auto mb-4"
            ></v-img>
            <div class="text-h6 grey--text text--darken-1 mb-2">Chưa có sản phẩm nào</div>
            <div class="text-body-2 grey--text mb-4">Thêm sản phẩm mới để bắt đầu quản lý kho hàng của bạn</div>
            <v-btn
              color="primary"
              class="px-5"
              outlined
              @click="openDialog = true"
            >
              <v-icon left>mdi-plus</v-icon>
              Thêm sản phẩm mới
            </v-btn>
          </v-card>
        </template>
      </v-data-table>

      <!-- Grid View -->
      <div v-else-if="displayMode === 'grid'" class="pa-4">
        <v-row>
          <v-col
            v-for="(item, index) in listProducts"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="d-flex"
          >
            <v-card
              class="rounded-lg elevation-2 flex-grow-1 product-card"
              hover
            >
              <v-img
                :src="item.image || 'https://via.placeholder.com/300?text=No+Image'"
                height="180"
                class="white--text align-end"
                gradient="to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,.7)"
              >
                <v-card-title class="pb-0 text-subtitle-1">{{ item.name }}</v-card-title>
                <v-card-subtitle class="pb-0 pt-1">SKU: {{ item.sku }}</v-card-subtitle>
              </v-img>

              <v-card-text class="py-3">
                <div class="d-flex justify-space-between align-center mb-3">
                  <v-chip
                    :color="getStockColor(item.in_stock)"
                    text-color="white"
                    x-small
                    class="px-2"
                  >
                    <v-icon x-small left>mdi-cube</v-icon>
                    {{ item.in_stock }} còn lại
                  </v-chip>
                  <span class="text-caption grey--text">Đã bán: {{ item.sold }}</span>
                </div>

                <div class="text-truncate mb-2 text-caption grey--text">
                  {{ item.description || 'Không có mô tả' }}
                </div>

                <div class="d-flex justify-space-between">
                  <div>
                    <div class="text-caption grey--text mb-1">Giá nhập</div>
                    <div>{{ formatCurrency(item.base_cost) }}</div>
                  </div>
                  <div>
                    <div class="text-caption grey--text mb-1">Giá bán lẻ</div>
                    <div class="font-weight-bold primary--text">{{ formatCurrency(item.retail_cost) }}</div>
                  </div>
                </div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions>
                <v-btn
                  small
                  text
                  color="primary"
                  @click="editProduct(item)"
                >
                  <v-icon small left>mdi-pencil</v-icon>
                  Sửa
                </v-btn>

                <v-btn
                  small
                  text
                  color="teal"
                  @click="adjustStock(item)"
                >
                  <v-icon small left>mdi-cube</v-icon>
                  Tồn kho
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn
                  small
                  icon
                  color="error"
                  @click="deleteProduct(item)"
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12" v-if="listProducts.length === 0">
            <v-card flat class="pa-8 text-center mx-auto" max-width="500">
              <v-img
                src="https://cdn.vuetifyjs.com/images/lists/no-results.svg"
                max-width="200"
                class="mx-auto mb-4"
              ></v-img>
              <div class="text-h6 grey--text text--darken-1 mb-2">Không tìm thấy sản phẩm nào</div>
              <div class="text-body-2 grey--text mb-4">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</div>
              <v-btn
                color="primary"
                class="px-5"
                outlined
                @click="clearFilters"
              >
                <v-icon left>mdi-filter-remove</v-icon>
                Xóa bộ lọc
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- Create Product Dialog -->
    <create-product
      :open="openDialog"
      @toggle="openDialog = !openDialog"
      @refresh="fetchProducts"
    />

    <!-- Update Product Dialog -->
    <update-product
      :open="openDialogUpdate"
      @toggle="openDialogUpdate = !openDialogUpdate"
      :product="selectedProduct"
      @refresh="fetchProducts"
    />

    <!-- Adjust Stock Dialog -->
    <!-- <adjust-stock-dialog
      :open="openStockDialog"
      @toggle="openStockDialog = !openStockDialog"
      :product="selectedProduct"
      @refresh="fetchProducts"
    /> -->

    <!-- Import Products Dialog -->
    <v-dialog v-model="openImportDialog" max-width="500" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline">
          <v-icon left color="amber darken-2" size="24">mdi-file-import</v-icon>
          Nhập sản phẩm từ Excel/CSV
        </v-card-title>

        <v-card-text class="py-4">
          <p class="text-body-2 mb-4">
            Tải lên file Excel hoặc CSV chứa danh sách sản phẩm của bạn. Dung lượng tối đa: 2MB.
          </p>

          <div class="text-center py-4 grey lighten-4 rounded-lg" v-if="!selectedFile">
            <v-icon size="64" color="grey lighten-1" class="mb-2">mdi-file-upload</v-icon>
            <div class="text-body-1 grey--text text--darken-1">
              Kéo thả file vào đây hoặc
            </div>
            <v-btn color="primary" class="mt-3" @click="triggerFileInput">
              <v-icon left>mdi-upload</v-icon>
              Chọn file
            </v-btn>
            <input type="file" ref="fileInput" @change="onFileSelected" class="d-none" accept=".xlsx,.xls,.csv">
          </div>

          <v-card class="pa-3 mt-4 d-flex align-center" v-else outlined>
            <v-icon size="36" class="mr-3" :color="getFileIconColor(selectedFile.name)">{{ getFileIcon(selectedFile.name) }}</v-icon>
            <div class="flex-grow-1">
              <div class="font-weight-medium">{{ selectedFile.name }}</div>
              <div class="text-caption">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
            <v-btn icon color="red" @click="clearSelectedFile">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card>

          <div v-if="fileError" class="error--text mt-2">
            <v-icon small color="error" class="mr-1">mdi-alert-circle</v-icon>
            {{ fileError }}
          </div>

          <v-alert
            v-if="selectedFile"
            type="info"
            class="mt-4 text-body-2"
            dense
            border="left"
          >
            <strong>Lưu ý:</strong> File Excel/CSV phải có các cột: Tên sản phẩm, Mã SKU, Giá nhập, Giá bán lẻ, Giá bán sỉ, Tồn kho, Đơn vị.
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="closeImportDialog" :disabled="importLoading">
            Hủy bỏ
          </v-btn>
          <v-btn
            color="amber darken-2"
            class="px-4"
            :disabled="!selectedFile || !!fileError"
            :loading="importLoading"
            @click="importProducts"
          >
            <v-icon left>mdi-file-import</v-icon>
            Nhập sản phẩm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <p class="text-subtitle-1">Bạn có chắc chắn muốn xóa sản phẩm <strong>{{ productToDelete?.name }}</strong>?</p>
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

    <!-- Export Dialog with Date Range -->
    <v-dialog v-model="openExportDialog" max-width="500" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline primary--text">
          <v-icon left color="primary" size="24">mdi-file-export</v-icon>
          Xuất danh sách sản phẩm
        </v-card-title>
        <v-card-text class="py-3">
          <p class="text-subtitle-1 mb-4">Chọn khoảng thời gian để xuất dữ liệu sản phẩm:</p>

          <v-row>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="fromDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="fromDate"
                    label="Từ ngày"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="fromDate"
                  @input="fromDateMenu = false"
                  no-title
                ></v-date-picker>
              </v-menu>
            </v-col>

            <v-col cols="12" sm="6">
              <v-menu
                v-model="toDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="toDate"
                    label="Đến ngày"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="toDate"
                  @input="toDateMenu = false"
                  no-title
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            color="grey darken-1"
            @click="openExportDialog = false"
            :disabled="exportLoading"
          >
            Hủy bỏ
          </v-btn>
          <v-btn
            color="primary"
            :loading="exportLoading"
            @click="exportProducts"
            elevation="2"
            class="px-4"
          >
            <v-icon left>mdi-file-export</v-icon>
            Xuất Excel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import productModule from '@/api/products'
import categoryModule from '@/api/category'
import CreateProduct from '@/components/Dialogs/Products/Create.vue'
import UpdateProduct from '@/components/Dialogs/Products/Update.vue'
// import AdjustStockDialog from '@/components/Dialogs/Products/AdjustStock.vue'

const productActions = productModule.actions
const categoryActions = categoryModule.actions

export default {
  components: {
    CreateProduct,
    UpdateProduct,
    // AdjustStockDialog
  },
  data() {
    return {
      search: '',
      filterCategory: null,
      displayMode: 'table',
      tableLoading: false,
      // Pagination parameters
      page: 1,
      perPage: 10,
      totalItems: 0,
      headers: [
        { text: 'Hình ảnh', value: 'image', sortable: false, width: '90px' },
        { text: 'Tên sản phẩm', value: 'name', width: '200px' },
        { text: 'Mô tả', value: 'description' },
        {text: 'Đơn vị', value: 'unit', width: '100px'},
        { text: 'Giá nhập', value: 'base_cost', width: '120px' },
        { text: 'Giá bán lẻ', value: 'retail_cost', width: '120px' },
        { text: 'Tồn kho', value: 'in_stock', width: '100px' },
        { text: 'Đã bán', value: 'sold', width: '100px' },
        { text: 'Còn lại trong kho', value: 'temporality', width: '100px' },
        { text: 'Trạng thái', value: 'is_show', width: '120px' },
        { text: 'Thao tác', value: 'actions', sortable: false, align: 'center', width: '100px' }
      ],
      categoryOptions: [],
      openDialog: false,
      openDialogUpdate: false,
      openImportDialog: false,
      openExportDialog: false,
      listProducts: [],
      selectedProduct: {},

      // Export date range
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      fromDateMenu: false,
      toDateMenu: false,
      exportLoading: false,

      // Delete dialog
      deleteDialog: false,
      productToDelete: null,
      deleteLoading: false,

      // Import dialog
      selectedFile: null,
      fileError: null,
      importLoading: false,

      // Category loading state
      loadingCategories: false
    }
  },
  methods: {
    editProduct(item) {
      this.selectedProduct = {...item};
      this.openDialogUpdate = true;
    },

    adjustStock(item) {
      // TODO: Implement stock adjustment functionality
      this.$snackbar.info('Tính năng điều chỉnh tồn kho đang được phát triển');
    },

    deleteProduct(item) {
      this.productToDelete = item;
      this.deleteDialog = true;
    },

    cancelDelete() {
      this.deleteDialog = false;
      setTimeout(() => {
        this.productToDelete = null;
      }, 300);
    },

    confirmDelete() {
      if (!this.productToDelete) return;

      this.deleteLoading = true;

      productActions.deleteProduct(this.productToDelete)
        .then(() => {
          this.$snackbar.success('Xóa sản phẩm thành công!');
          this.fetchProducts();
          this.deleteDialog = false;
        })
        .catch(error => {
          console.error('Delete error:', error);
          this.$snackbar.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
        })
        .finally(() => {
          this.deleteLoading = false;
          setTimeout(() => {
            this.productToDelete = null;
          }, 300);
        });
    },

    clearFilters() {
      this.search = '';
      this.filterCategory = null;
      // Reset to first page and fetch products after clearing filters
      this.page = 1;
      this.fetchProducts(this.page, this.perPage);
    },

    onCategoryFilterChange() {
      // Reset to first page when category filter changes
      this.page = 1;
      // Fetch products with new category filter
      this.fetchProducts(this.page, this.perPage);
    },

    onSearchInput() {
      // Reset to first page when searching
      this.page = 1;
      // Debounce search to avoid too many API calls
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => {
        this.fetchProducts(this.page, this.perPage);
      }, 300);
    },

    exportProducts() {
      this.exportLoading = true;

      const params = {
        from: this.fromDate,
        to: this.toDate,
      };

      productActions.exportProducts(params)
        .then(res => {
          const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Set filename from content-disposition header if available, otherwise use default
          const contentDisposition = res.headers['content-disposition'];
          let filename = 'danh-sach-san-pham.xlsx';

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

          this.$snackbar.success('Xuất danh sách sản phẩm thành công!');
          this.openExportDialog = false;
        })
        .catch(err => {
          this.$snackbar.error('Không thể xuất danh sách sản phẩm');
          console.error('Lỗi export:', err);
        })
        .finally(() => {
          this.exportLoading = false;
        });

      this.$snackbar.info('Đang tải file Excel...');
    },

    updateDisplayedItems(options) {
      // Extract pagination options
      const { itemsPerPage, page, sortBy, sortDesc } = options;

      // Now you can use these values in your API call
      this.fetchProducts(page, itemsPerPage, sortBy, sortDesc);
    },

    fetchProducts(page = 1, itemsPerPage = 10, sortBy = [], sortDesc = []) {
      this.tableLoading = true;
      this.page = page;
      this.perPage = itemsPerPage;

      const params = {
        page: page,
        per_page: itemsPerPage,
        name: this.search,
        category_id: this.filterCategory
      };

      // Add sorting if provided
      if (sortBy.length > 0 && sortDesc.length > 0) {
        params.sort_by = sortBy[0];
        params.sort_desc = sortDesc[0] ? 1 : 0;
      }

      productActions.getProducts(params)
        .then(res => {
          this.listProducts = res.data.data;
          this.totalItems = res.data.meta?.total || 0;
        })
        .catch(err => {
          this.$snackbar.error('Không thể tải danh sách sản phẩm');
          console.error('Error loading products:', err);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    fetchCategories() {
      this.loadingCategories = true;
      categoryActions.getListCategories()
        .then(res => {
          if (res.data && res.data.data) {
            this.categoryOptions = res.data.data;
          }
          this.loadingCategories = false;
        })
        .catch(err => {
          console.error('Error fetching categories:', err);
          this.loadingCategories = false;
        });
    },

    getStockColor(stock) {
      if (stock <= 0) return 'error';
      if (stock <= 10) return 'warning';
      return 'success';
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '0 ₫';
      return value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'});
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0';
      return value.toLocaleString('vi-VN');
    },

    // Import dialog methods
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        this.fileError = 'Dung lượng file vượt quá 2MB.';
        return;
      }

      this.selectedFile = file;
      this.fileError = null;
    },

    clearSelectedFile() {
      this.selectedFile = null;
      this.fileError = null;
    },

    closeImportDialog() {
      this.openImportDialog = false;
      this.clearSelectedFile();
    },

    importProducts() {
      if (!this.selectedFile) return;

      this.importLoading = true;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      productActions.importProducts(formData)
        .then(() => {
          this.$snackbar.success('Nhập sản phẩm thành công!');
          this.fetchProducts();
          this.closeImportDialog();
        })
        .catch(error => {
          console.error('Import error:', error);
          this.$snackbar.error('Không thể nhập sản phẩm. Vui lòng thử lại.');
        })
        .finally(() => {
          this.importLoading = false;
        });
    },

    getFileIcon(fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      if (extension === 'xlsx' || extension === 'xls') return 'mdi-file-excel';
      if (extension === 'csv') return 'mdi-file-delimited';
      return 'mdi-file';
    },

    getFileIconColor(fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      if (extension === 'xlsx' || extension === 'xls') return 'green';
      if (extension === 'csv') return 'blue';
      return 'grey';
    },

    formatFileSize(size) {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  },
  mounted() {
    this.fetchProducts();
    this.fetchCategories();
  }
}
</script>

<style scoped>
.product-management {
  min-height: 100%;
}

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
  white-space: nowrap;
}

.custom-data-table >>> tr:hover {
  background-color: rgba(0, 150, 136, 0.05) !important;
}

.custom-data-table >>> tr.v-data-table__expanded__content {
  background-color: rgba(0, 150, 136, 0.05) !important;
}
</style>
