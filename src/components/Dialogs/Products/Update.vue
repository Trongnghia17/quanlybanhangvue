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
      <v-toolbar color="teal" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium d-flex align-center">
          <v-avatar size="36" color="teal lighten-4" class="mr-3">
            <v-icon color="teal darken-1">mdi-package-variant-edit</v-icon>
          </v-avatar>
          Cập nhật sản phẩm
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
          Cập nhật thông tin sản phẩm trong hệ thống.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <!-- Basic Information -->
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
                  placeholder="VD: 0015476546"
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
                  :items="units"
                  label="Đơn vị tính"
                  placeholder="VD: Cái, Lọ, Kg, ..."
                  clearable
                  dense
                  outlined
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

          <!-- Pricing Information -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-cash-multiple</v-icon>
              Thông tin giá
            </div>

            <v-row>
              <v-col cols="12" sm="4">
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

              <v-col cols="12" sm="4">
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

              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="discount"
                  @input="formatCurrency('discount')"
                  @focus="$event => $event.target.select()"
                  label="Chiết khấu"
                  prepend-inner-icon="mdi-sale"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: 10,000 hoặc 10"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-select
                  v-model="discount_type"
                  :items="[
                    { text: 'Phần trăm (%)', value: 1 },
                    { text: 'Số tiền (VNĐ)', value: 2 }
                  ]"
                  label="Loại chiết khấu"
                  prepend-inner-icon="mdi-percent"
                  outlined
                  dense
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                ></v-select>
              </v-col>


            </v-row>
          </v-card>

          <!-- Stock Information -->
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5">
            <div class="text-subtitle-2 font-weight-medium mb-3 teal--text">
              <v-icon small color="teal" class="mr-1">mdi-cube</v-icon>
              Thông tin tồn kho
            </div>

            <v-row>
              <v-col cols="12" sm="3">
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
                  readonly
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="sold"
                  type="number"
                  label="Đã bán"
                  prepend-inner-icon="mdi-cart-outline"
                  outlined
                  dense
                  :rules="numberRules"
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: 50"
                  readonly
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="3">
              <v-text-field
                v-model="available"
                type="number"
                label="Có sẵn"
                prepend-inner-icon="mdi-package-variant"
                outlined
                dense
                :rules="numberRules"
                class="mb-2 rounded-lg"
                color="teal"
                hide-details="auto"
                placeholder="VD: 100"
                readonly
              >
                <template v-slot:append>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >mdi-information</v-icon>
                    </template>
                    <span>Số lượng thực tế  còn trong kho</span>
                  </v-tooltip>
                </template>
              </v-text-field>
              </v-col>

              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="temporality"
                  type="number"
                  label="Có thể bán"
                  prepend-inner-icon="mdi-package-variant"
                  outlined
                  dense
                  :rules="numberRules"
                  class="mb-2 rounded-lg"
                  color="teal"
                  hide-details="auto"
                  placeholder="VD: 100"
                  readonly
                >
                <template v-slot:append>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >mdi-information</v-icon>
                    </template>
                    <span>Số lượng còn lại sau khi trừ đơn đặt hàng</span>
                  </v-tooltip>
                </template>
              </v-text-field>
              </v-col>
              <v-col cols="12" sm="12">
                      <v-icon small>mdi-information</v-icon>
                      Vui lòng tạo phiếu kiểm kho nếu muốn thay đổi tồn kho của sản phẩm
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
                  label="Chọn hình ảnh"
                  prepend-inner-icon="mdi-image"
                  outlined
                  dense
                  accept="image/*"
                  show-size
                  hint="Định dạng: JPG, PNG, GIF"
                  persistent-hint
                  class="rounded-lg mb-4"
                />
              </v-col>

              <v-col cols="12" sm="6" class="d-flex align-center">
                <v-switch
                  v-model="is_show"
                  label="Mở bán sản phẩm"
                  color="teal"
                  hide-details
                  class="mt-0 red-label"
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
          <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5" v-if="image">
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

          <!-- Product History (Optional) -->
            <v-card flat class="mb-5 pa-4 rounded-lg grey lighten-5" v-if="showHistory">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="text-subtitle-2 font-weight-medium teal--text">
                <v-icon small color="teal" class="mr-1">mdi-history</v-icon>
                Lịch sử thay đổi
              </div>
              <v-btn x-small text color="teal darken-1" @click="showHistory = false">
                <v-icon small left>mdi-chevron-up</v-icon>
                <span class="text-caption">Ẩn</span>
              </v-btn>
            </div>

            <v-timeline dense class="mr-0 pr-0">
              <v-timeline-item
                v-for="(history, i) in changeHistory"
                :key="i"
                small
                :color="history.color"
              >
                <div class="text-caption">{{ formatDate(history.date) }}</div>
                <div class="font-weight-medium">{{ history.title }}</div>
                <div class="text-caption grey--text">{{ history.description }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card>

          <div v-else class="text-center my-3">
            <v-btn text small color="teal" @click="showHistory = true">
              <v-icon left small>mdi-history</v-icon>
              Xem lịch sử thay đổi
            </v-btn>
          </div>
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
          Khôi phục
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
          :disabled="loading"
          class="px-6 rounded-lg"
          elevation="2"
        >
          <v-icon left>mdi-content-save</v-icon>
          Cập nhật
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import productModule from '@/api/products'
import categoryModule from '@/api/category'
const productActions = productModule.actions
const categoryActions = categoryModule.actions

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      formError: null,
      showHistory: false,

      // Product data
      productId: null,
      name: '',
      image: '',
      description: '',
      // is_active: true,
      is_show: true,
      is_buy_always: false,
      sku: '',
      barcode: '',
      base_cost: '',
      retail_cost: '',
      discount: '',
      discount_type: 1,
      in_stock: 0,
      sold: 0,
      temporality: 7,
      available: 0,
      unit: '',
      units: ['Cái', 'Kg', 'Hộp', 'Lít', 'Chai', 'Đôi', 'Thùng'],

      // Category data
      category_ids: [], // Changed to array for multiple selection
      categories: [],
      loadingCategories: false,

      // Validation rules
      nameRules: [
        v => !!v || 'Tên sản phẩm không được để trống'
      ],
      priceRules: [
        v => !!v || 'Giá không được để trống',
        v => !!v.toString().replace(/\D/g, '') || 'Giá phải là số'
      ],
      numberRules: [
        v => v !== null || 'Trường này không được để trống'
      ],

      // Mock change history data (replace with actual history from API)
      changeHistory: [
        {
          date: new Date(Date.now() - 3*24*60*60*1000),
          title: 'Cập nhật giá bán',
          description: 'Người thực hiện: Admin',
          color: 'teal'
        },
        {
          date: new Date(Date.now() - 7*24*60*60*1000),
          title: 'Nhập thêm hàng',
          description: 'Số lượng: +50',
          color: 'amber darken-2'
        },
        {
          date: new Date(Date.now() - 30*24*60*60*1000),
          title: 'Tạo mới sản phẩm',
          description: 'Người thực hiện: Admin',
          color: 'green'
        }
      ]
    }
  },
  watch: {
    product: {
      handler(newValue) {
        if (newValue && Object.keys(newValue).length > 0) {
          this.populateProductData(newValue);
        }
      },
      immediate: true
    },
    open(val) {
      if (val && this.product && Object.keys(this.product).length > 0) {
        this.populateProductData(this.product);
      }
    }
  },
  methods: {
    formatCurrency(field) {
      if (this[field]) {
        this[field] = this[field].toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    },

    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    populateProductData(product) {
      this.productId = product.id;
      this.name = product.name || '';
      this.sku = product.sku || '';
      this.description = product.description || '';
      this.image = product.image || '';
      this.is_show = typeof product.is_show !== 'undefined' ? product.is_show : true;
      this.is_buy_always = typeof product.is_buy_always !== 'undefined' ? product.is_buy_always : false;
      this.in_stock = product.in_stock || 0;
      this.sold = product.sold || 0;
      this.available = product.available || 0;
      this.temporality = product.temporality || 0;
      this.unit = product.unit || '';
      this.barcode = product.barcode || '';

      // Handle category_ids - convert single category_id to array format
      if (product.category_ids && Array.isArray(product.category_ids)) {
        this.category_ids = [...product.category_ids];
      } else if (product.category_id) {
        // If still using old format, convert to array
        this.category_ids = [product.category_id];
      } else {
        this.category_ids = [];
      }

      // Format currency values with commas
      const base = product.base_cost || 0;
      const retail = product.retail_cost || 0;
      const disc = product.discount || 0;

      this.base_cost = base.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.retail_cost = retail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.discount = disc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.discount_type = product.discount_type || 1;
    },

    toggle() {
      if (!this.loading) {
        this.$emit('toggle');
        this.resetForm();
      }
    },

    resetForm() {
      this.formError = null;
      this.showHistory = false;

      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }

      // Form data will be reset by the watcher when dialog is reopened with product data
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

    submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      this.formError = null;

      const formData = new FormData();
      formData.append('id', this.productId);
      formData.append('name', this.name);
      formData.append('description', this.description || '');
      formData.append('is_show', this.is_show ? 1 : 0);
      formData.append('is_buy_always', this.is_buy_always ? 1 : 0);
      formData.append('sku', this.sku || '');
      formData.append('base_cost', this.base_cost ? this.base_cost.toString().replace(/,/g, '') : '0');
      formData.append('retail_cost', this.retail_cost ? this.retail_cost.toString().replace(/,/g, '') : '0');
      formData.append('wholesale_cost', this.wholesale_cost ? this.retail_cost.toString().replace(/,/g, '') : '0');
      formData.append('discount', this.discount ? this.discount.toString().replace(/,/g, '') : '0');
      formData.append('discount_type', this.discount_type);
      formData.append('in_stock', this.in_stock || 0);
      formData.append('sold', this.sold || 0);
      formData.append('temporality', this.temporality || 0);
      formData.append('available', this.available || 0);
      formData.append('unit', this.unit || '');
      formData.append('barcode', this.barcode || '');
      // formData.append('category_ids', this.category_ids && this.category_ids.length > 0 ? this.category_ids : []);
      this.category_ids.forEach(id => {
        formData.append('category_ids[]', id);
      });
      if (this.imageFile && this.imageFile instanceof File) {
        formData.append('image', this.imageFile);
      }
      console.log('image', this.imageFile)
      // ✅ Debug: log toàn bộ FormData trước khi gửi
      console.log('FormData to send:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }


      productActions.updateProduct(formData)
        .then(res => {
          this.loading = false;
          this.$snackbar.success('Cập nhật sản phẩm thành công!');
          this.$emit('refresh');
          this.$emit('toggle');
        })
        .catch(err => {
          console.error('Error updating product:', err);
          this.formError = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm!';
          this.$snackbar.error(this.formError);
          this.loading = false;
        });
    }
  },

  // Fetch categories when the component is created
  created() {
    this.fetchCategories();
  }
};
</script>

<style scoped>
.product-dialog {
  border-radius: 16px;
}

.v-card {
  overflow: hidden;
}

.v-toolbar {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.v-text-field ::v-deep .v-input__slot,
.v-textarea ::v-deep .v-input__slot {
  min-height: 44px !important;
  transition: all 0.2s ease;
}

.v-text-field ::v-deep .v-input__slot:hover,
.v-textarea ::v-deep .v-input__slot:hover {
  border-color: #009688 !important;
}

.v-text-field ::v-deep .v-input__prepend-inner {
  margin-right: 8px;
}

.v-text-field ::v-deep .v-input__prepend-inner i {
  opacity: 0.6;
}

.v-btn {
  text-transform: none !important;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.v-btn.v-btn--contained {
  box-shadow: 0 4px 12px rgba(0, 150, 136, 0.4) !important;
}

.v-btn.v-btn--contained:hover {
  box-shadow: 0 6px 15px rgba(0, 150, 136, 0.5) !important;
}

.grey.lighten-5 {
  transition: all 0.2s ease;
}

.grey.lighten-5:hover {
  background-color: #f0f7f6 !important;
}

.border {
  border: 1px solid #e0e0e0;
}

/* Timeline customizations */
.v-timeline {
  padding-top: 0;
  max-height: 200px;
  overflow-y: auto;
}

.v-timeline-item {
  padding-bottom: 8px !important;
}

.v-timeline-item__body {
  padding: 0 !important;
}
.red-label ::v-deep .v-label {
  color: rgb(194, 17, 17) !important;
}
</style>
