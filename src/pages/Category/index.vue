<template>
  <div class="category-management">
    <!-- Category List Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
      <v-card-title class="py-4">
        <h4 class="text-h5 font-weight-medium">Quản lý nhóm hàng</h4>
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Quản lý các danh mục nhóm hàng trong hệ thống
      </v-card-subtitle>
      <v-divider class="mt-2"></v-divider>
    </v-card>

    <!-- Category Management Card -->
    <v-card class="rounded-lg elevation-3">
      <v-card-title class="py-3 d-flex justify-space-between align-center">
        <div>
          <h5 class="text-h6 font-weight-medium">Danh sách nhóm hàng</h5>
        </div>

        <v-btn
          color="primary"
          dark
          class="text-none rounded-lg"
          elevation="1"
          @click="openAddCategoryDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Thêm nhóm hàng
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm nhóm hàng"
              single-line
              hide-details
              outlined
              dense
              clearable
              class="search-field"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              outlined
              dense
              hide-details
              label="Sắp xếp theo"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="12" md="5" class="d-flex justify-end align-center">

            <v-btn
              color="info"
              class="text-none rounded-lg"
              elevation="0"
              @click="refreshData"
            >
              <v-icon left>mdi-refresh</v-icon>
              Làm mới
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Category Data Table -->
      <v-data-table
        :headers="headers"
        :items="categories"
        :loading="tableLoading"
        :search="search"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
          'items-per-page-text': 'Số dòng mỗi trang'
        }"
        class="elevation-0 custom-data-table"
        :sort-by="[sortBy]"
        :sort-desc="[sortDesc]"
      >
        <!-- Index Column -->
        <template v-slot:item.index="{ index }">
          {{ index + 1 }}
        </template>

        <!-- Name Column -->
        <template v-slot:item.name="{ item }">
          <div class="font-weight-medium">{{ item.name }}</div>
        </template>

        <!-- Total Products Column -->
        <template v-slot:item.product_count="{ item }">
          <v-chip
            small
            :color="getProductCountColor(item.products ? item.products.length : 0)"
            text-color="white"
            class="px-2"
          >
            {{ item.products ? item.products.length : 0 }}
          </v-chip>
        </template>

        <!-- Product List Column -->
        <template v-slot:item.products="{ item }">
          <div class="product-chips">
            <v-chip
              v-for="(product, index) in getFirstNProducts(item.products, 2)"
              :key="index"
              small
              outlined
              class="mr-1 mb-1"
            >
              {{ product.name }}
            </v-chip>
            <v-chip
              v-if="item.products && item.products.length > 2"
              small
              outlined
              color="grey"
            >
              +{{ item.products.length - 2 }} sản phẩm khác
            </v-chip>
          </div>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            color="primary"
            class="mr-1"
            title="Chỉnh sửa"
            @click="editCategory(item)"
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="error"
            class="mr-1"
            title="Xóa"
            @click="confirmDeleteCategory(item)"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>

        <!-- Empty Data Slot -->
        <template v-slot:no-data>
          <v-card flat class="pa-6 text-center mx-auto">
            <v-img
              src="https://cdn.vuetifyjs.com/images/lists/no-results.svg"
              max-width="150"
              class="mx-auto mb-4"
            ></v-img>
            <div class="text-h6 grey--text text--darken-1 mb-2">
              Không tìm thấy nhóm hàng nào
            </div>
            <div class="text-body-2 grey--text mb-4">
              Hãy tạo nhóm hàng mới để quản lý sản phẩm hiệu quả hơn
            </div>
            <v-btn color="primary" class="px-5" outlined @click="openAddCategoryDialog">
              <v-icon left>mdi-plus</v-icon>
              Thêm nhóm hàng
            </v-btn>
          </v-card>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="headline d-flex align-center primary--text">
          <v-icon color="primary" class="mr-2">
            {{ editMode ? 'mdi-pencil' : 'mdi-folder-plus' }}
          </v-icon>
          <span>{{ editMode ? 'Chỉnh sửa nhóm hàng' : 'Thêm nhóm hàng mới' }}</span>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pt-4">
          <v-form ref="categoryForm" v-model="validForm" lazy-validation>
            <v-text-field
              v-model="categoryForm.name"
              :rules="nameRules"
              label="Tên nhóm hàng"
              outlined
              dense
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn
            color="grey darken-1"
            text
            @click="closeCategoryDialog"
          >
            Hủy
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="formLoading"
            @click="saveCategory"
            :disabled="!validForm"
          >
            {{ editMode ? 'Cập nhật' : 'Thêm mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="rounded-lg">
        <v-card-title class="headline d-flex align-center error--text">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          <span>Xác nhận xóa</span>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pt-4 pb-2">
          <p>Bạn có chắc chắn muốn xóa nhóm hàng <strong>{{ currentCategory ? currentCategory.name : '' }}</strong>?</p>
          <p v-if="currentCategory && currentCategory.products && currentCategory.products.length > 0" class="mt-2 red--text">
            <v-icon small color="error">mdi-alert</v-icon>
            Nhóm hàng này đang chứa {{ currentCategory.products.length }} sản phẩm. Xóa nhóm hàng có thể ảnh hưởng đến các sản phẩm này.
          </p>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn
            color="grey darken-1"
            text
            @click="deleteDialog = false"
          >
            Hủy
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="deleteCategory"
          >
            Xác nhận xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import categoryModule from '@/api/category'
const categoryActions = categoryModule.actions

export default {
  name: 'CategoryManagement',
  data() {
    return {
      // Table data
      search: '',
      categories: [],
      tableLoading: false,
      headers: [
        { text: 'STT', value: 'index', width: '70px', sortable: false },
        { text: 'Tên nhóm hàng', value: 'name', width: '250px' },
        { text: 'Số sản phẩm', value: 'product_count', width: '120px' },
        { text: 'Sản phẩm', value: 'products', sortable: false },
        { text: 'Thao tác', value: 'actions', width: '120px', sortable: false, align: 'center' }
      ],
      sortOptions: [
        { text: 'Tên A-Z', value: 'name' },
        { text: 'Số sản phẩm', value: 'product_count' }
      ],
      sortBy: 'name',
      sortDesc: false,

      // Form data
      categoryDialog: false,
      deleteDialog: false,
      editMode: false,
      validForm: false,
      formLoading: false,
      deleteLoading: false,
      currentCategory: null,
      categoryForm: {
        name: '',
      },
      nameRules: [
        v => !!v || 'Tên nhóm hàng không được để trống',
        v => (v && v.length >= 3) || 'Tên nhóm hàng phải có ít nhất 3 ký tự',
        v => (v && v.length <= 50) || 'Tên nhóm hàng không được vượt quá 50 ký tự'
      ],
    }
  },

  mounted() {
    this.fetchCategories();
  },

  methods: {
    // Fetch all categories
    fetchCategories() {
      this.tableLoading = true;
      categoryActions.getListCategories({per_page: 1000})
        .then(response => {
          this.categories = response.data.data || [];
        })
        .catch(error => {
          this.$snackbar.error('Không thể tải danh sách nhóm hàng');
          console.error('Error fetching categories:', error);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },

    // Refresh data
    refreshData() {
      this.fetchCategories();
      this.$snackbar.success('Đã cập nhật danh sách nhóm hàng');
    },

    // Open dialog for adding a new category
    openAddCategoryDialog() {
      this.editMode = false;
      this.categoryForm = { name: '' };
      this.$refs.categoryForm && this.$refs.categoryForm.resetValidation();
      this.categoryDialog = true;
    },

    // Open dialog for editing a category
    editCategory(item) {
      this.editMode = true;
      this.currentCategory = item;
      this.categoryForm = {
        name: item.name
      };
      this.$refs.categoryForm && this.$refs.categoryForm.resetValidation();
      this.categoryDialog = true;
    },

    // Close the category dialog
    closeCategoryDialog() {
      this.categoryDialog = false;
      setTimeout(() => {
        this.categoryForm = { name: '' };
        this.currentCategory = null;
      }, 300);
    },

    // Save or update a category
    saveCategory() {
      if (!this.$refs.categoryForm.validate()) return;

      this.formLoading = true;

      if (this.editMode) {
        // Update existing category
        const payload = {
          id: this.currentCategory.id,
          data: this.categoryForm
        };

        categoryActions.updateCategory(payload)
          .then(() => {
            this.$snackbar.success('Cập nhật nhóm hàng thành công');
            this.fetchCategories();
            this.closeCategoryDialog();
          })
          .catch(error => {
            this.$snackbar.error('Không thể cập nhật nhóm hàng');
            console.error('Error updating category:', error);
          })
          .finally(() => {
            this.formLoading = false;
          });
      } else {
        // Create new category
        categoryActions.createCategory(this.categoryForm)
          .then(() => {
            this.$snackbar.success('Thêm nhóm hàng thành công');
            this.fetchCategories();
            this.closeCategoryDialog();
          })
          .catch(error => {
            this.$snackbar.error('Không thể thêm nhóm hàng');
            console.error('Error creating category:', error);
          })
          .finally(() => {
            this.formLoading = false;
          });
      }
    },

    // Confirm deletion of a category
    confirmDeleteCategory(item) {
      this.currentCategory = item;
      this.deleteDialog = true;
    },

    // Delete a category
    deleteCategory() {
      this.deleteLoading = true;

      categoryActions.deleteCategory(this.currentCategory.id)
        .then(() => {
          this.$snackbar.success('Xóa nhóm hàng thành công');
          this.fetchCategories();
          this.deleteDialog = false;
        })
        .catch(error => {
          this.$snackbar.error('Không thể xóa nhóm hàng');
          console.error('Error deleting category:', error);
        })
        .finally(() => {
          this.deleteLoading = false;
        });
    },

    // Export categories to Excel
    exportToExcel() {
      this.$snackbar.info('Tính năng xuất Excel đang được phát triển');
    },

    // Helper methods
    getProductCountColor(count) {
      if (count === 0) return 'grey';
      if (count < 5) return 'blue';
      if (count < 10) return 'teal';
      return 'indigo';
    },

    getFirstNProducts(products, n) {
      if (!products) return [];
      return products.slice(0, n);
    }
  }
}
</script>

<style scoped>
.category-management {
  min-height: 100%;
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

.product-chips {
  max-width: 500px;
  white-space: normal;
}
</style>
