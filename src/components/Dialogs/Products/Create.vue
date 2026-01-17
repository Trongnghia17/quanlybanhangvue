<template>
  <v-dialog
    :value="open"
    :width="800"
    :max-width="1200"
    :min-width="320"
    fullscreen-breakpoint="sm"
    @keydown="$event.key === 'Escape' && toggle()"
    scrollable
    persistent
    transition="dialog-bottom-transition"
    content-class="product-dialog"
  >
    <v-card class="rounded-lg elevation-12">
      <!-- Toolbar remains unchanged -->
      <v-toolbar color="teal" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium d-flex align-center">
          <v-avatar size="36" color="teal lighten-4" class="mr-3">
            <v-icon color="teal darken-1">mdi-package-variant-plus</v-icon>
          </v-avatar>
          Thêm sản phẩm mới
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="toggle()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <v-alert
          v-if="formError"
          dense
          text
          type="error"
          class="mb-4"
          border="left"
          dismissible
          @click:close="formError = null"
        >
          {{ formError }}
        </v-alert>

        <p class="text-subtitle-1 grey--text text--darken-1 mb-5 d-flex align-center">
          <v-icon color="teal lighten-3" class="mr-2">mdi-information-outline</v-icon>
          Nhập thông tin sản phẩm mới để thêm vào hệ thống.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <!-- Basic Information (unchanged except for image input) -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-information</v-icon>
              Thông tin cơ bản
            </div>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="name"
                  label="Tên sản phẩm"
                  prepend-inner-icon="mdi-tag-text"
                  outlined
                  dense
                  auto-focus
                  :rules="nameRules"
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: Áo thun nam"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="sku"
                  label="Mã SKU"
                  prepend-inner-icon="mdi-barcode"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: SP001"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="barcode"
                  label="Mã vạch"
                  prepend-inner-icon="mdi-barcode"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: 1345001"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="description"
                  label="Mô tả sản phẩm"
                  prepend-inner-icon="mdi-text-box-outline"
                  outlined
                  dense
                  rows="2"
                  class="rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                ></v-textarea>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="unit"
                  :items="['Cái', 'Chiếc', 'Lọ', 'Hộp', 'Đôi', 'Thùng', 'Gói']"
                  label="Đơn vị"
                  prepend-inner-icon="mdi-cube-outline"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="category_ids"
                  :items="categories"
                  item-text="name"
                  item-value="id"
                  label="Nhóm hàng"
                  prepend-inner-icon="mdi-shape-outline"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  :loading="loadingCategories"
                  :disabled="loadingCategories"
                  placeholder="Chọn nhóm hàng"
                  multiple
                  chips
                  deletable-chips
                  small-chips
                >
                  <template v-slot:no-data>
                    <div class="pa-2 text-center">
                      <v-icon small color="grey" class="mr-1">mdi-information-outline</v-icon>
                      Không có nhóm hàng
                    </div>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-card>

          <!-- Pricing Information (unchanged) -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-cash-multiple</v-icon>
              Thông tin giá
            </div>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="base_cost"
                  @input="formatCurrency('base_cost')"
                  @focus="$event => $event.target.select()"
                  label="Giá nhập"
                  prepend-inner-icon="mdi-shopping-outline"
                  outlined
                  dense
                  :rules="priceRules"
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  :suffix="'đ'"
                  placeholder="VD: 100,000"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="retail_cost"
                  @input="formatCurrency('retail_cost')"
                  @focus="$event => $event.target.select()"
                  label="Giá bán lẻ"
                  prepend-inner-icon="mdi-tag"
                  outlined
                  dense
                  :rules="priceRules"
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  :suffix="'đ'"
                  placeholder="VD: 150,000"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <!-- Stock Information (unchanged) -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-cube</v-icon>
              Thông tin tồn kho
            </div>

            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="in_stock"
                  type="number"
                  label="Tồn kho"
                  prepend-inner-icon="mdi-cube-outline"
                  outlined
                  dense
                  :rules="numberRules"
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: 100"
                ></v-text-field>
              </v-col>

            </v-row>
          </v-card>

          <!-- Additional Settings -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-cog</v-icon>
              Cài đặt bổ sung
            </div>
            <v-row>
              <v-col cols="12" sm="12">
                <v-file-input
                  v-model="imageFile"
                  @change="handleFileChange"
                  label="Chọn hình ảnh"
                  prepend-inner-icon="mdi-image"
                  outlined
                  dense
                  accept="image/*"
                  :rules="[v => !!v || 'Vui lòng chọn hình ảnh']"
                  show-size
                  hint="Định dạng: JPG, PNG, GIF"
                  persistent-hint
                  class="rounded-lg mb-4"
                />
              </v-col>
              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-switch
                  v-model="is_active"
                  label="Kích hoạt sản phẩm"
                  color="teal"
                  hide-details
                  class="mt-0"
                ></v-switch>
              </v-col>

              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-switch
                  v-model="is_buy_always"
                  label="Sản phẩm bán âm"
                  color="teal"
                  hide-details
                  class="mt-0"
                ></v-switch>
              </v-col>
            </v-row>
          </v-card>

          <!-- Image Preview -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5" v-if="imagePreview">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-image-filter</v-icon>
              Xem trước hình ảnh
            </div>
            <div class="text-center">
              <v-img
                :src="image"
                max-height="200"
                max-width="200"
                contain
                class="mx-auto rounded-lg border"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="teal"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </div>
          </v-card>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          plain
          color="teal"
          @click="resetForm"
          :disabled="loading"
          class="rounded-lg"
        >
          <v-icon left>mdi-refresh</v-icon>
          Làm mới
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          text
          color="grey darken-1"
          @click="toggle()"
          :disabled="loading"
          class="px-4 rounded-lg"
        >
          <v-icon left>mdi-cancel</v-icon>
          Hủy bỏ
        </v-btn>

        <v-btn
          color="teal"
          @click="submit"
          :loading="loading"
          :disabled="!valid || loading"
          class="px-6 rounded-lg"
          elevation="2"
        >
          <v-icon left>mdi-content-save</v-icon>
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import productModule from '@/api/products';
const productActions = productModule.actions;
import categoryModule from '@/api/category';
const categoryActions = categoryModule.actions;
import "@/assets/css/createproduct.css";

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      formError: null,
      loadingCategories: false,
      categories: [],

      // Product data
      name: '',
      image: '',
      description: '',
      is_active: true,
      is_buy_always: false,
      sku: '',
      base_cost: '',
      retail_cost: '',
      in_stock: 0,
      sold: 0,
      temporality: 0,
      available: 0,
      unit: '',
      barcode: '',
      category_ids: [], // For multiple category selection

      // Validation rules
      nameRules: [
        v => !!v || 'Tên sản phẩm không được để trống',
        v => v.length <= 255 || 'Tên sản phẩm không được vượt quá 255 ký tự'
      ],
      priceRules: [
        v => !!v || 'Giá không được để trống',
        v => !isNaN(parseFloat(v.replace(/\D/g, ''))) || 'Giá phải là số'
      ],
      numberRules: [
        v => v !== null && v !== '' || 'Trường này không được để trống',
        v => !isNaN(v) && v >= 0 || 'Giá trị không được âm'
      ],
      imageRules: [
        v => !v || v.size <= 2048000 || 'Hình ảnh không được vượt quá 2MB',
        v => !v || ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(v.type) || 'Định dạng hình ảnh không hợp lệ'
      ]
    };
  },
  methods: {
    formatCurrency(field) {
      if (this[field]) {
        this[field] = this[field].toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    },

    fetchCategories() {
      this.loadingCategories = true;
      categoryActions.getListCategories()
        .then(res => {
          if (res.data && res.data.data) {
            this.categories = res.data.data;
          }
          this.loadingCategories = false;
        })
        .catch(err => {
          console.error('Error fetching categories:', err);
          this.loadingCategories = false;
        });
    },

    toggle() {
      if (!this.loading) {
        this.$emit('toggle');
        this.resetForm();
      }
    },

    resetForm() {
      this.name = '';
      this.imageFile = '';
      this.description = '';
      this.is_active = true;
      this.is_buy_always = false;
      this.sku = '';
      this.base_cost = '';
      this.retail_cost = '';
      this.in_stock = 0;
      this.sold = 0;
      this.temporality = 0;
      this.available = 0;
      this.unit = '';
      this.barcode = '';
      this.category_ids = []; // Reset to empty array
      this.formError = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
      // Fetch categories from the server
      fetchCategories()
      {
        this.loadingCategories = true;
        categoryActions.getListCategories()
          .then(res => {
            if (res.data && res.data.data) {
              this.categories = res.data.data;
            }
            this.loadingCategories = false;
          })
          .catch(err => {
            console.error('Error fetching categories:', err);
            this.loadingCategories = false;
          });
      },

    async submit() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      this.formError = null;

      // 1. Khởi tạo FormData
      const formData = new FormData();
      formData.append('name', this.name);
      if (this.imageFile) {
        // append File object, phần thứ 3 là filename
        formData.append('image', this.imageFile, this.imageFile.name);
      }
      formData.append('description', this.description || '');
      formData.append('is_active', this.is_active ? '1' : '0');
      formData.append('is_buy_always', this.is_buy_always ? '1' : '0');
      formData.append('sku', this.sku || '');
      formData.append('base_cost', parseInt(this.base_cost.replace(/\D/g, '') || 0));
      formData.append('retail_cost', parseInt(this.retail_cost.replace(/\D/g, '') || 0));
      formData.append('wholesale_cost', parseInt(this.retail_cost.replace(/\D/g, '') || 0));
      formData.append('in_stock', this.in_stock);
      formData.append('sold', this.sold);
      formData.append('temporality', this.in_stock);
      formData.append('available', this.in_stock);
      formData.append('unit', this.unit || '');
      formData.append('barcode', this.barcode || '');

      // Handle multiple category IDs
      if (this.category_ids && this.category_ids.length > 0) {
        this.category_ids.forEach(categoryId => {
          formData.append('category_ids[]', categoryId);
        });
      }

      try {
        // 2. Gọi action createProduct đã nhận FormData và header multipart
        await productActions.createProduct(formData);
        this.$snackbar.success('Thêm sản phẩm mới thành công!');
        this.resetForm();
        this.$emit('refresh');
      } catch (err) {
        this.formError = err.response?.data?.message || 'Có lỗi xảy ra!';
        this.$snackbar.error(this.formError);
      } finally {
        this.loading = false;
      }
    }
  },

  // Fetch categories when the component is created
  created() {
    this.fetchCategories();
  }
};
</script>
