<template>
  <!-- Top Bar -->
  <div>
    <v-app-bar flat color="primary" dark class="px-4">
      <v-autocomplete
        ref="productSearch"
        v-model="searchProduct"
        :items="listProduct"
        placeholder="Tìm hàng hóa"
        prepend-inner-icon="mdi-magnify"
        outlined
        dense
        hide-selected
        hide-details
        hide-no-data
        hide-spin-buttons
        item-text="name"
        item-value="id"
        class="search-bar"
        no-filter
        :search-input.sync="searchQuery"
        :loading="isSearching"
        return-object
        clearable
      >
        <template v-slot:item="{ item }">
          <v-list-item @click="addProductToOrder(item)">
            <v-list-item-avatar>
              <v-img
                :src="item.image"
                alt="Item Image"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <span v-html="item.name"></span>
                <v-spacer></v-spacer>
                {{ formatCurrency(item.retail_cost) }} - Có thể bán: {{ item.temporality }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-autocomplete>
      <v-spacer></v-spacer>
           <v-btn icon @click="fetchProducts">
             <v-icon>mdi-refresh</v-icon>
           </v-btn>
           <v-btn icon>
             <v-icon>mdi-plus</v-icon>
           </v-btn>
    </v-app-bar>

    <v-row no-gutters class="flex-grow-1">
      <v-col cols="12" md="8" class="product-list">
        <v-container class="fill-height" fluid
          style="align-items: baseline;"
        >
          <v-row align="center" justify="center">
            <v-col v-if="selectedProducts?.length === 0"
            class="text-center"
            cols="12">
              <v-spacer></v-spacer>
              Chưa có sản phẩm nào trong đơn hàng
              <v-spacer></v-spacer>
            </v-col>
            <v-col
              class=" px-0 py-0 mx-0 py-0"
              v-if="selectedProducts?.length > 0"
              cols="12"
              v-for="(item, index) in selectedProducts"
              :key="index"
            >

              <v-card outlined>
                <v-card-title>
                  <v-row justify="space-between" align="center">
                    <v-col cols="1">
                      <span>{{ index + 1 }}</span>
                    </v-col>
                    <v-col cols="1">
                      <v-row align="center">
                        <v-icon @click="removeProduct(item)">
                          mdi-delete
                        </v-icon>
                      </v-row>
                    </v-col>
                    <v-col cols="2">
                      <v-row align="center">
                        <span class="ml-2">{{ item.sku }}</span>
                      </v-row>
                    </v-col>
                    <v-col cols="2">
                      <v-row align="center">
                        <span class="ml-2">{{ item.name }}</span>
                      </v-row>
                    </v-col>
                    <v-col cols="1" class="text-right">
                      <v-text-field
                        v-model="item.quantity"
                        type="number"
                        min="1"
                        dense
                        :rules="[quantityRules.positive]"
                        hide-spin-buttons
                        label="SL"
                        @input="validateQuantity(item)"
                        @keypress="preventNegativeNumber"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <v-text-field
                        placeholder="Chiết khấu"
                        label="Chiết khấu"
                        :value="item.formattedDiscount || '0'"
                        min="0"
                        dense
                        :rules="item.discountType === 1 ? [discountRules.percentage] : []"
                        hide-spin-buttons
                        @input="onProductDiscountInput(item, $event)"
                        @blur="formatProductDiscountOnBlur(item)"
                        @focus="onProductDiscountFocus(item)"
                      >
                        <template v-slot:append>
                          <v-btn style="margin-left: 0.3rem; margin-bottom: 0.5rem"
                                 outlined
                                 :rounded="false"
                                 height="25px"
                                 width="25px"
                                 text
                                 icon
                                 depressed
                                 @click="item.discountType = 1"
                                 :class="{'button-discount' : item.discountType === 1}"
                          >%
                          </v-btn>
                          <v-btn style="margin-left: 0.3rem; margin-bottom: 0.5rem"
                                 outlined
                                 :rounded="false"
                                 depressed
                                 height="25px"
                                 width="25px"
                                 text
                                 icon
                                 @click="item.discountType = 2"
                                 :class="{'button-discount' : item.discountType === 2}"
                          >đ
                          </v-btn>
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="3" class="text-right">
                      {{formatCurrency(getProductPrice(item))}}
                    </v-col>
                  </v-row>
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <!-- Order Summary Section -->
      <v-col cols="12" md="4" class="order-summary pa-4">
        <v-autocomplete
          v-model="selectedCustomerId"
          :items="listCustomer"
          placeholder="Tìm khách hàng"
          prepend-inner-icon="mdi-account"
          outlined
          dense
          hide-details
          item-text="displayText"
          item-value="id"
        ></v-autocomplete>

        <v-container class="order-details mt-4 pa-0">
          <v-row>
            <v-col cols="12">
              <v-row justify="space-between">
                <v-col cols="6">
                  <span>Tổng tiền hàng</span>
                </v-col>
                <v-col cols="6" class="text-right">
                  {{ formatCurrency(totalAmount) }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row justify="space-between">
                <v-col cols="6">
                  <span>Giảm giá</span>
                </v-col>
                <v-col cols="6" class="text-right">
                  <div class="discount-input-group">
                    <v-text-field
                      v-model="formattedOrderDiscount"
                      min="0"
                      dense
                      :rules="orderDiscountType === 1 ? [discountRules.percentage] : []"
                      hide-spin-buttons
                      class="discount-input"
                      placeholder="Nhập giảm giá"
                      @input="onOrderDiscountInput"
                      @blur="formatOrderDiscountOnBlur"
                      @focus="onOrderDiscountFocus"
                    ></v-text-field>
                    <div class="discount-type-buttons">
                      <v-btn
                        small
                        outlined
                        :color="orderDiscountType === 1 ? 'primary' : ''"
                        :class="{'active-discount-type': orderDiscountType === 1}"
                        @click="orderDiscountType = 1"
                      >%</v-btn>
                      <v-btn
                        small
                        outlined
                        :color="orderDiscountType === 2 ? 'primary' : ''"
                        :class="{'active-discount-type': orderDiscountType === 2}"
                        @click="orderDiscountType = 2"
                      >đ</v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row justify="space-between">
                <v-col cols="6">
                  <span>Khách cần trả</span>
                </v-col>
                <v-col cols="6" class="text-right">
                  {{ formatCurrency(amountDue) }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row justify="space-between">
                <v-col cols="6" justify="center">
                  <span>Khách đã trả</span>
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-text-field
                    placeholder="Nhập số tiền"
                    v-model="formattedAmountPaid"
                    dense
                    hide-details
                    @input="onAmountPaidInput"
                    @blur="formatAmountPaidOnBlur"
                    @focus="onAmountPaidFocus"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12"
            >
              <v-row justify="space-between">
                <v-col cols="6" justify="center">
                  <span>Trạng thái</span>
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-select
                  v-model="orderStatus"
                    :items="[
                      { text: 'Thành công', value: 2 },
                      { text: 'Chờ xác nhận', value: 1 },
                    ]"
                    dense
                    hide-details
                    outlined
                    placeholder="Chọn trạng thái"
                  >

                  </v-select>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row justify="space-between">
                <v-col cols="6">
                  <span>{{ changeLabel }}</span>
                </v-col>
                <v-col cols="6" class="text-right">
                  {{ formatCurrency(change) }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>

        <v-btn
          color="primary"
          block
          large
          class="mt-4"
          @click="processPayment"
          :disabled="selectedProducts.length === 0"
        >
          Thanh toán
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import productModule from '@/api/products';
const productActions = productModule.actions
import customerModule from '@/api/customers'
const customerActions = customerModule.actions
import orderModule from '@/api/order'
const orderActions = orderModule.actions
import { printHtmlContent } from '@/utils/print';

export default {
  name: "OrderSales",
  data() {
    return {
      searchProduct: "",
      searchCustomer: "",
      discountType: 0,  // 0 for amount, 1 for percentage
      amountPaid: 0,    // Amount paid by customer
      formattedAmountPaid: "0", // Formatted display value for amount paid
      listProduct: [],
      listCustomer: [],
      selectedProducts: [],
      selectedCustomerId: null,
      orderStatus: 2,
      orderId: null,
      htmlPrint: null,
      orderDiscount: 0, // New order-level discount value
      formattedOrderDiscount: "0", // Formatted display value for order discount
      orderDiscountType: 2, // Default to fixed amount (2 for VND, 1 for percentage)
      searchQuery: '',
      isSearching: false,
      debounceTimeout: null,
      // Validation rules
      quantityRules: {
        positive: value => value > 0 || 'Số lượng phải lớn hơn 0'
      },
      discountRules: {
        percentage: value => parseFloat(value) <= 100 || 'Chiết khấu không được vượt quá 100%'
      }
    };
  },
  mounted() {
    this.fetchProducts();
    this.fetchCustomers();

    // Initialize formatted values
    this.formattedAmountPaid = this.formatNumber(this.amountPaid);
    this.formattedOrderDiscount = this.formatNumber(this.orderDiscount);

    // Initialize formatted values for any existing products
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.selectedProducts.forEach(product => {
        product.formattedDiscount = this.formatNumber(product.discount || 0);
      });
    }
  },
  watch: {
    // Theo dõi sự thay đổi của searchQuery để gọi API tìm kiếm
    searchQuery(newValue) {
      // Hủy timeout trước đó nếu có
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // Đặt timeout mới với debounce 200ms
      this.debounceTimeout = setTimeout(() => {
        this.fetchProducts(newValue);
      }, 200);
    },

    // Keep formatted values in sync with actual values
    amountPaid(newVal) {
      if (document.activeElement !== this.$el.querySelector('input[placeholder="Nhập số tiền"]')) {
        this.formattedAmountPaid = this.formatNumber(newVal);
      }
    },

    orderDiscount(newVal) {
      if (document.activeElement !== this.$el.querySelector('input[placeholder="Nhập giảm giá"]')) {
        this.formattedOrderDiscount = this.formatNumber(newVal);
      }
    }
  },
  computed: {
    // Calculate the sum of product prices after applying individual product discounts
    totalProductsAfterDiscount() {
      return this.selectedProducts.reduce((sum, product) => {
        return sum + this.getProductPrice(product);
      }, 0);
    },

    // Calculate the total amount from all selected products before any discounts
    totalAmount() {
      return this.selectedProducts.reduce((sum, product) => {
        return sum + (product.retail_cost * product.quantity);
      }, 0);
    },

    // Calculate the order-level discount amount
    orderDiscountAmount() {
      const orderDiscountValue = parseFloat(this.orderDiscount) || 0;

      if (this.orderDiscountType === 1) {
        // Percentage discount
        return (this.totalProductsAfterDiscount * orderDiscountValue) / 100;
      } else {
        // Fixed amount discount
        return orderDiscountValue;
      }
    },

    // Calculate the final amount customer needs to pay (products after discount minus order discount)
    amountDue() {
      return Math.max(0, this.totalProductsAfterDiscount - this.orderDiscountAmount);
    },

    // Calculate change to return to the customer
    change() {
      const paid = parseFloat(this.amountPaid) || 0;
      return paid - this.amountDue;
    },

    changeLabel() {
      return this.change >= 0 ? "Tiền thừa trả khách" : "Khách cần trả thêm";
    }
  },
  methods: {
    // Phương thức mới để tìm kiếm sản phẩm theo từ khóa
    getProductPrice(item) {
      item.discount = parseFloat(item.discount) || 0;
      const unitPrice = item.retail_cost;
      const quantity = parseInt(item.quantity) || 1;
      if (item.discountType === 1) {
        // Percentage discount
        return (unitPrice - (unitPrice * item.discount / 100)) * quantity;
      } else if (item.discountType === 2) {
        // Fixed amount discount
        return (unitPrice - item.discount) * quantity;
      }
      return unitPrice * quantity;
    },
    removeProduct(item) {
      const index = this.selectedProducts.findIndex(product => product.id === item.id);
      if (index !== -1) {
        this.selectedProducts.splice(index, 1);
      }
    },
    formatCurrency(value) {
      return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0';
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    parseFormattedNumber(formattedValue) {
      return parseFloat(formattedValue.toString().replace(/[^\d.-]/g, '')) || 0;
    },

    // Amount Paid formatting methods
    onAmountPaidInput(value) {
      // In Vuetify's v-text-field, the input event handler receives the value directly
      const numericValue = value ? value.toString().replace(/[^\d]/g, '') : '';
      this.amountPaid = parseFloat(numericValue) || 0;
      this.formattedAmountPaid = this.formatNumber(this.amountPaid);
    },

    formatAmountPaidOnBlur() {
      this.formattedAmountPaid = this.formatNumber(this.amountPaid);
    },

    onAmountPaidFocus() {
      this.formattedAmountPaid = this.amountPaid.toString();
    },

    // Order Discount formatting methods
    onOrderDiscountInput(value) {
      // In Vuetify's v-text-field, the input event handler receives the value directly
      const numericValue = value ? value.toString().replace(/[^\d]/g, '') : '';
      this.orderDiscount = parseFloat(numericValue) || 0;

      // Validate percentage discount does not exceed 100%
      if (this.orderDiscountType === 1 && this.orderDiscount > 100) {
        this.orderDiscount = 100;
        this.$snackbar.warning('Chiết khấu theo phần trăm không được vượt quá 100%');
      }

      this.formattedOrderDiscount = this.formatNumber(this.orderDiscount);
    },

    formatOrderDiscountOnBlur() {
      this.formattedOrderDiscount = this.formatNumber(this.orderDiscount);
    },

    onOrderDiscountFocus() {
      this.formattedOrderDiscount = this.orderDiscount.toString();
    },

    // Product discount formatting methods
    onProductDiscountInput(product, value) {
      // In Vuetify's v-text-field, the input event handler receives the value directly
      const numericValue = value ? value.toString().replace(/[^\d]/g, '') : '';
      product.discount = parseFloat(numericValue) || 0;

      // Validate percentage discount does not exceed 100%
      if (product.discountType === 1 && product.discount > 100) {
        product.discount = 100;
        this.$snackbar.warning('Chiết khấu theo phần trăm không được vượt quá 100%');
      }

      product.formattedDiscount = this.formatNumber(product.discount);
    },

    formatProductDiscountOnBlur(product) {
      product.formattedDiscount = this.formatNumber(product.discount || 0);
    },

    onProductDiscountFocus(product) {
      product.formattedDiscount = (product.discount || 0).toString();
    },
    processPayment() {
      const isPaidLessThanDue = parseFloat(this.amountPaid) < this.amountDue;

      if (isPaidLessThanDue && !this.selectedCustomerId) {
        this.$snackbar.error("Đơn hàng nợ cần có thông tin khách hàng. Vui lòng chọn khách hàng trước khi thanh toán.");
        return;
      }

      const orderDetails = this.processOrderDetails();
      let orderData = this.mergeOrderData();

      orderData.order_detail = orderDetails;
      orderActions.createOrder(orderData)
        .then(response => {
          if (response.status === 200) {
            this.orderId = response.data.data.id;
            this.$snackbar.success("Đơn hàng đã được tạo thành công");
            this.reset();
            this.printOrder();
          }
          else{
            this.$snackbar.error("Đã có lỗi xảy ra trong quá trình tạo đơn hàng");
            console.error("Error creating order:", response);
          }
        })
    },
    reset(){
      this.selectedProducts = [];
      this.selectedCustomerId = null;
      this.amountPaid = 0;
      this.formattedAmountPaid = "0";
      this.orderStatus = 2;
      this.searchProduct = "";
      this.searchCustomer = "";
      this.discount = 0;
      this.discountType = 0;
      this.orderDiscount = 0;
      this.formattedOrderDiscount = "0";
      this.orderDiscountType = 2;
      this.listProduct = [];
      this.listCustomer = [];
      this.fetchProducts();
      this.fetchCustomers();
    },
    printOrder() {
      orderActions.printOrder(this.orderId).then(response => {
        if (response.status === 200) {
          console.log("Order printed successfully");
          this.htmlPrint = response;
          printHtmlContent(this.htmlPrint.data); // Use the utility function here
          this.$snackbar.success("In đơn hàng thành công");
        } else {
          console.error("Error printing order:", response);
          this.$snackbar.error("Đã có lỗi xảy ra trong quá trình in đơn hàng");
        }
      })
      .catch(error => {
        console.error("Error printing order:", error);
        this.$snackbar.error("Đã có lỗi xảy ra trong quá trình in đơn hàng");
      });
    },
    mergeOrderData() {
      const payment = {
        price: this.amountPaid,
        type: 1,
      };
      const orderData = {
        customer_id: this.selectedCustomerId,
        payment: payment,
        is_retail: true,
        discount: this.orderDiscount,
        discount_type: this.orderDiscountType,
        total_amount: this.totalProductsAfterDiscount,
        final_amount: this.amountDue,
        status: this.orderStatus,
        type: 1,
      };
      return orderData;
    },
    processOrderDetails() {
      let orderDetails = [];
      this.selectedProducts.forEach((item) => {
        const product = {
          product_id: item.id,
          quantity: item.quantity,
          discount: item.discount,
          discount_type: item.discountType,
          price: item.retail_cost,
        };
        orderDetails.push(product);
      });
      return orderDetails;
    },
    fetchProducts(searchTerm) {
      const payload = {
        per_page: 20, // Giới hạn số lượng kết quả để tối ưu hiệu suất
        name: searchTerm || this.searchProduct,
      };

      this.isSearching = true;

      productActions.getProductsV2(payload)
        .then((response) => {
          this.listProduct = response.data.data;
          this.setDefaultDiscountType();
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          this.$snackbar.error("Không thể tìm kiếm sản phẩm");
        })
        .finally(() => {
          this.isSearching = false;
        });
    },
    setDefaultDiscountType(){
      this.listProduct.forEach((item) => {
        // Use discount from product configuration if available, otherwise default to 0
        item.discountType = item.discount_type || item.discountType || 1;
        item.discount = item.discount || 0;
        item.formattedDiscount = this.formatNumber(item.discount || 0);
      });
    },
    fetchCustomers(){
      const payload = {
        per_page: 1000,
        search: this.searchCustomer,
      };
      customerActions.getCustomers(payload)
        .then((response) => {
         this.listCustomer = response.data.data.map(customer => ({
            ...customer,
            displayText: `${customer.name} - ${customer.phone}`
          }));
          console.log("Fetched customers:", this.listCustomer);
        })
        .catch((error) => {
          console.error("Error fetching customers:", error);
        });
    },
    addProductToOrder(item) {
      // Check if product can be sold (not negative inventory)
      const selectedProduct = this.listProduct.find(product => product.id === item.id);
      const existingProduct = this.selectedProducts.find(product => product.id === item.id);

      // Check inventory constraints
      if ((selectedProduct.is_buy_always && selectedProduct.temporality <= 0) ||
          (existingProduct && existingProduct.is_buy_always && existingProduct.temporality <= 0)) {
        this.$snackbar.warning('Sản phẩm này không thể bán âm!');
        return;
      }

      // Add to order or increment quantity
      if (existingProduct) {
        // Ensure quantity is always at least 1
        const newQuantity = existingProduct.quantity + 1;
        existingProduct.quantity = Math.max(1, newQuantity);
      } else {
        // Add new product with formatted values and ensure quantity is positive
        const newProduct = {...item, quantity: 1};
        // Use discount from product configuration
        newProduct.discountType = item.discount_type || item.discountType || 1;
        newProduct.discount = item.discount || 0;
        newProduct.formattedDiscount = this.formatNumber(newProduct.discount);
        this.selectedProducts.push(newProduct);
      }

      // Clear search to allow selecting another product
      this.searchProduct = null;
      this.searchQuery = '';
      
      // Close the dropdown menu
      this.$nextTick(() => {
        if (this.$refs.productSearch) {
          this.$refs.productSearch.blur();
          this.$refs.productSearch.isMenuActive = false;
        }
      });
    },

    validateQuantity(item) {
      // Ensure quantity is always a positive number
      const quantity = parseFloat(item.quantity);
      if (quantity <= 0 || isNaN(quantity)) {
        item.quantity = 1;
        this.$snackbar.warning('Số lượng sản phẩm phải lớn hơn 0');
      }
    },

    preventNegativeNumber(evt) {
      // Prevent typing negative sign (-) in the quantity field
      if (evt.key === '-' || evt.key === 'e' || evt.key === '+') {
        evt.preventDefault();
      }
    }
  },
};
</script>

<style scoped>
.order-create-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-bar {
  max-width: 400px;

}

.v-input__slot {
  color: #010832 !important;
  border-color: #3c007c !important;
}

.product-list {
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
}

.order-summary {
  background-color: white;
}

.order-id {
  font-size: 1.2rem;
  font-weight: bold;
}
.button-discount {
  background-color: #3c007c !important;
  color: white !important;
}

/* New styles for discount input group */
.discount-input-group {
  display: flex;
  align-items: center;
  justify-content: end;
}

.discount-input {
  max-width: 100px;
}

.discount-type-buttons {
  display: flex;
  margin-left: 8px;
}

.active-discount-type {
  background-color: #61cf67 !important;
  color: rgb(164, 17, 184) !important;
}
</style>
