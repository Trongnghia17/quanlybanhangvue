<template>
  <v-dialog v-model="dialog" max-width="900" persistent scrollable>
    <v-card class="rounded-lg">
      <v-card-title class="headline primary white--text">
        <v-icon left color="white" size="24">mdi-pencil</v-icon>
        Cập nhật đơn hàng
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-skeleton-loader v-if="loading" type="card, list-item-three-line, table" class="mb-4"></v-skeleton-loader>

        <div v-else>
          <v-form ref="form" v-model="valid">
            <!-- Order Header Information -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-card outlined class="pa-3 rounded-lg">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
                    <div class="text-subtitle-1 font-weight-bold">Thông tin đơn hàng</div>
                  </div>
                  <v-divider class="mb-3"></v-divider>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Mã đơn hàng:</span>
                    <span class="font-weight-medium primary--text">{{ order.code }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Loại đơn hàng:</span>
                    <v-chip :color="getOrderTypeColor(order.type)" text-color="white" small pill class="px-2">
                      <v-icon left x-small>{{ getOrderTypeIcon(order.type) }}</v-icon>
                      {{ getOrderTypeName(order.type) }}
                    </v-chip>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Trạng thái:</span>
                    <v-select
                      v-model="order.status"
                      :items="statusOptions"
                      item-text="text"
                      item-value="value"
                      dense
                      outlined
                      hide-details
                      class="status-select"
                      style="width: 150px"
                    ></v-select>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Ngày tạo:</span>
                    <span>{{ formatDateTime(order.created_at) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.updated_at">
                    <span class="text-body-2 grey--text">Cập nhật lúc:</span>
                    <span>{{ formatDateTime(order.updated_at) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.user">
                    <span class="text-body-2 grey--text">Người tạo:</span>
                    <span class="font-weight-medium">{{ order.user.name }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.user && order.user.store_name">
                    <span class="text-body-2 grey--text">Cửa hàng:</span>
                    <span>{{ order.user.store_name }}</span>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card outlined class="pa-3 rounded-lg">
                  <div class="d-flex align-center mb-2">
                    <v-icon :color="parseInt(order.type) === 2 ? 'teal' : 'blue'" class="mr-2">
                      {{ parseInt(order.type) === 2 ? 'mdi-store' : 'mdi-account' }}
                    </v-icon>
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ parseInt(order.type) === 2 ? 'Thông tin nhà cung cấp' : 'Thông tin khách hàng' }}
                    </div>
                  </div>
                  <v-divider class="mb-3"></v-divider>

                  <!-- For Sales Orders (Type 1) -->
                  <template v-if="parseInt(order.type) === 1">
                    <div class="mb-3">
                      <v-autocomplete
                        v-model="order.customer_id"
                        :items="customers"
                        item-text="displayText"
                        item-value="id"
                        label="Khách hàng"
                        outlined
                        dense
                        :loading="loadingCustomers"
                        clearable
                        return-object
                        @change="updateCustomerInfo"
                      ></v-autocomplete>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="order.phone || (order.customer && order.customer.phone)">
                      <span class="text-body-2 grey--text">Số điện thoại:</span>
                      <span>{{ order.phone || (order.customer && order.customer.phone) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="order.email || (order.customer && order.customer.email)">
                      <span class="text-body-2 grey--text">Email:</span>
                      <span>{{ order.email || (order.customer && order.customer.email) }}</span>
                    </div>
                  </template>

                  <!-- For Purchase Orders (Type 2) -->
                  <template v-else-if="parseInt(order.type) === 2">
                    <div class="mb-3">
                      <v-autocomplete
                        v-model="order.supplier_id"
                        :items="suppliers"
                        item-text="displayText"
                        item-value="id"
                        label="Nhà cung cấp"
                        outlined
                        dense
                        :loading="loadingSuppliers"
                        clearable
                        return-object
                        @change="updateSupplierInfo"
                      ></v-autocomplete>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="order.phone || (order.supplier && order.supplier.phone)">
                      <span class="text-body-2 grey--text">Số điện thoại:</span>
                      <span>{{ order.phone || (order.supplier && order.supplier.phone) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="order.email || (order.supplier && order.supplier.email)">
                      <span class="text-body-2 grey--text">Email:</span>
                      <span>{{ order.email || (order.supplier && order.supplier.email) }}</span>
                    </div>
                  </template>
                  <div class="mb-3">
                    <v-text-field
                      v-model="order.address"
                      label="Địa chỉ giao hàng"
                      outlined
                      dense
                      hide-details
                    ></v-text-field>
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="order.shipping_code"
                      label="Mã vận đơn"
                      outlined
                      dense
                      hide-details
                    ></v-text-field>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Order Items -->
            <v-card outlined class="mb-4 rounded-lg">
              <v-card-title class="py-2">
                <v-icon color="teal" class="mr-2">mdi-package-variant</v-icon>
                <span class="text-subtitle-1 font-weight-bold">Sản phẩm trong đơn hàng</span>
                <v-spacer></v-spacer>
                <v-btn color="primary" small text @click="showAddProductDialog">
                  <v-icon left small>mdi-plus</v-icon>
                  Thêm sản phẩm
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table
                :headers="itemHeaders"
                :items="orderItems"
                hide-default-footer
                class="elevation-0"
                :no-data-text="'Không có sản phẩm nào'"
              >
                <template v-slot:item.product="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="40" class="mr-2" v-if="item.product?.image">
                      <v-img :src="item.product?.image" alt="Product Image"></v-img>
                    </v-avatar>
                    <v-avatar size="40" class="mr-2 grey lighten-3" v-else>
                      <v-icon color="grey">mdi-package-variant</v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ item.product?.name || 'Sản phẩm không xác định' }}</div>
                      <div class="text-caption grey--text" v-if="item.product?.sku">SKU: {{ item.product?.sku }}</div>
                      <div class="text-caption grey--text" v-if="item.product?.unit">Đơn vị: {{ item.product?.unit }}</div>
                    </div>
                  </div>
                </template>

                <template v-slot:item.price="{ item }">
                  <v-text-field
                    v-model.number="item.user_cost"
                    type="number"
                    dense
                    outlined
                    hide-details
                    hide-spin-buttons
                    class="price-field"
                  ></v-text-field>
                </template>

                <template v-slot:item.quantity="{ item }">
                  <v-text-field
                    v-model.number="item.quantity"
                    type="number"
                    dense
                    outlined
                    hide-details
                    class="quantity-field"
                    min="1"
                    hide-spin-buttons
                  ></v-text-field>
                </template>

                <template v-slot:item.discount="{ item }">
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model.number="item.discount"
                      type="number"
                      dense
                      outlined
                      hide-details
                      hide-spin-buttons
                      class="discount-field mr-2"
                    ></v-text-field>
                    <v-btn-toggle
                      v-model="item.discount_type"
                      mandatory
                      dense
                      class="elevation-0"
                    >
                      <v-btn small :value="1" class="px-2">%</v-btn>
                      <v-btn small :value="2" class="px-2">đ</v-btn>
                    </v-btn-toggle>
                  </div>
                </template>

                <template v-slot:item.total="{ item }">
                  {{ formatCurrency(calculateItemTotal(item)) }}
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn icon color="error" @click="removeItem(item)">
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>

            <!-- Payment Information -->
            <v-row>
              <v-col cols="12" md="6">
                <v-card outlined class="pa-3 rounded-lg">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="green" class="mr-2">mdi-cash-multiple</v-icon>
                    <div class="text-subtitle-1 font-weight-bold">Thông tin thanh toán</div>
                  </div>
                  <v-divider class="mb-3"></v-divider>
                  <div class="mb-3">
                    <v-select
                      v-model="paymentType"
                      :items="paymentOptions"
                      item-text="text"
                      item-value="value"
                      label="Phương thức thanh toán"
                      outlined
                      dense
                      hide-details
                    ></v-select>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Tổng tiền hàng:</span>
                    <span class="font-weight-medium">{{ formatCurrency(calculateTotalAmount()) }}</span>
                  </div>
                  <div class="mb-3">
                    <div class="d-flex align-center">
                      <span class="text-body-2 grey--text mr-2">Giảm giá:</span>
                      <v-text-field
                        v-model.number="order.discount"
                        type="number"
                        dense
                        outlined
                        hide-details
                        class="discount-field mr-2"
                      ></v-text-field>
                      <v-btn-toggle
                        v-model="discountType"
                        mandatory
                        dense
                        class="elevation-0"
                      >
                        <v-btn small :value="'percent'" class="px-2">%</v-btn>
                        <v-btn small :value="'amount'" class="px-2">đ</v-btn>
                      </v-btn-toggle>
                    </div>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Thành tiền:</span>
                    <span class="font-weight-bold green--text">{{ formatCurrency(calculateFinalAmount()) }}</span>
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model.number="amountPaid"
                      label="Số tiền đã thanh toán"
                      type="number"
                      dense
                      outlined
                      hide-details
                    ></v-text-field>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Công nợ:</span>
                    <span class="font-weight-medium" :class="{'red--text': calculateDebt() > 0, 'green--text': calculateDebt() <= 0}">
                      {{ formatCurrency(calculateDebt()) }}
                    </span>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card outlined class="pa-3 rounded-lg">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="amber darken-2" class="mr-2">mdi-note-text</v-icon>
                    <div class="text-subtitle-1 font-weight-bold">Thông tin bổ sung</div>
                  </div>
                  <v-divider class="mb-3"></v-divider>
                  <div class="mb-3">
                    <v-textarea
                      v-model="order.note"
                      label="Ghi chú"
                      outlined
                      dense
                      hide-details
                      rows="4"
                    ></v-textarea>
                  </div>
                  <div class="mb-3">
                    <v-checkbox
                      v-model="order.is_retail"
                      label="Đơn bán lẻ"
                      hide-details
                    ></v-checkbox>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn text color="grey darken-1" @click="closeDialog">
          Hủy bỏ
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" dark @click="updateOrder" :disabled="loading || !valid" :loading="updating">
          <v-icon left>mdi-content-save</v-icon>
          Lưu thay đổi
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Add Product Dialog -->
    <v-dialog v-model="addProductDialog" max-width="600">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="primary">mdi-plus-circle</v-icon>
          Thêm sản phẩm
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedProduct"
            :items="products"
            item-text="name"
            return-object
            label="Tìm kiếm sản phẩm"
            outlined
            dense
            :loading="loadingProducts"
            clearable
          >
            <template v-slot:item="{ item }">
              <v-list-item-avatar>
                <v-img :src="item.image || 'https://via.placeholder.com/40?text=No+Image'" alt="Product Image"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  SKU: {{ item.sku }} | {{ formatCurrency(item.retail_cost) }} | Tồn kho: {{ item.in_stock }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-autocomplete>

          <v-row v-if="selectedProduct">
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.quantity"
                label="Số lượng"
                type="number"
                min="1"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.user_cost"
                label="Đơn giá"
                type="number"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="newItem.discount"
                label="Chiết khấu"
                type="number"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="newItem.discount_type"
                :items="[
                  { text: 'Phần trăm (%)', value: 1 },
                  { text: 'Số tiền (VNĐ)', value: 2 }
                ]"
                label="Loại chiết khấu"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="addProductDialog = false">
            Hủy bỏ
          </v-btn>
          <v-btn color="primary" @click="addProduct" :disabled="!selectedProduct">
            <v-icon left>mdi-plus</v-icon>
            Thêm sản phẩm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import orderModule from '@/api/order'
import productModule from '@/api/products'
import customerModule from '@/api/customers'
import supplierModule from '@/api/suppliers'

const orderActions = orderModule.actions
const productActions = productModule.actions
const customerActions = customerModule.actions
const supplierActions = supplierModule.actions

export default {
  name: 'UpdateOrder',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      updating: false,
      valid: false,
      order: {
        id: null,
        code: '',
        customer_id: null,
        status: 1,
        type: 1,
        is_retail: true,
        discount: 0,
        discount_type: 'amount',
        address: '',
        shipping_code: '',
        note: '',
        order_detail: []
      },
      orderItems: [],
      originalOrderItems: [], // Lưu trữ order_detail gốc từ API
      paymentType: 1,
      amountPaid: 0,
      discountType: 'amount',

      // Add product dialog
      addProductDialog: false,
      selectedProduct: null,
      products: [],
      loadingProducts: false,
      newItem: {
        quantity: 1,
        user_cost: 0,
        discount: 0,
        discount_type: 1
      },

      // Customers
      customers: [],
      loadingCustomers: false,

      // Suppliers
      suppliers: [],
      loadingSuppliers: false,

      // Headers for the items table
      itemHeaders: [
        { text: 'Sản phẩm', value: 'product', sortable: false },
        { text: 'Đơn giá', value: 'price', align: 'right', width: '120px' },
        { text: 'Số lượng', value: 'quantity', align: 'center', width: '100px' },
        { text: 'Chiết khấu', value: 'discount', align: 'right', width: '180px' },
        { text: 'Thành tiền', value: 'total', align: 'right', width: '120px' },
        { text: '', value: 'actions', align: 'center', width: '60px' }
      ],

      // Options for dropdowns
      statusOptions: [
        { text: 'Chờ xác nhận', value: 1 },
        { text: 'Hoàn thành', value: 2 },
        { text: 'Đã hủy', value: 3 },
        { text: 'Trả hàng', value: 4 }
      ],
      paymentOptions: [
        { text: 'Tiền mặt', value: 1 },
        { text: 'Chuyển khoản', value: 2 },
        { text: 'COD', value: 3 }
      ]
    }
  },
  watch: {
    open(val) {
      this.dialog = val
      if (val && this.orderId) {
        this.fetchOrderDetail()
      }
    },
    dialog(val) {
      if (!val) {
        this.$emit('toggle')
      }
    },
    selectedProduct(val) {
      if (val) {
        this.newItem.user_cost = val.retail_cost
      }
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false
      // Reset dữ liệu khi đóng dialog
      this.orderItems = []
      this.originalOrderItems = []
    },
    fetchOrderDetail() {
      this.loading = true

      orderActions.getOrderDetail(this.orderId)
        .then(res => {
          if (res.data && res.data.data) {
            const orderData = res.data.data

            // Set basic order information
            this.order = {
              ...orderData,
              customer_id: orderData.customer_id || null,
              discount: parseFloat(orderData.discount) || 0,
              discount_type: orderData.discount_type || 2,
              address: orderData.address || '',
              shipping_code: orderData.shipping_code || '',
              note: orderData.note || '',
              is_retail: orderData.is_retail || false
            }

            // Set discount type for UI
            this.discountType = orderData.discount_type === 1 ? 'percent' : 'amount'

            // Process payment information
            if (orderData.order_payment && orderData.order_payment.length > 0) {
              // Get the first valid payment type
              const validPayments = orderData.order_payment.filter(payment => parseFloat(payment.price || 0) > 0)
              if (validPayments.length > 0) {
                this.paymentType = validPayments[0].type || 1
              }

              // Calculate total amount paid from all valid payments
              this.amountPaid = orderData.order_payment.reduce((sum, payment) => {
                const amount = parseFloat(payment.price) || 0
                return amount > 0 ? sum + amount : sum
              }, 0)
            } else {
              this.paymentType = 1
              this.amountPaid = 0
            }

            // Process order items with proper field mapping
            if (orderData.order_detail && orderData.order_detail.length > 0) {
              this.orderItems = orderData.order_detail.map(item => ({
                ...item,
                product_id: item.product?.id || item.product_id,
                product: item.product || {},
                quantity: parseInt(item.quantity) || 1,
                user_cost: parseFloat(item.user_cost) || 0,
                discount: parseFloat(item.discount) || 0,
                discount_type: item.discount_type || 1,
                is_existing: true, // Đánh dấu đây là item đã tồn tại
                original_id: item.id // Lưu ID gốc của order_detail
              }))

              // Lưu trữ bản sao của order_detail gốc để so sánh
              this.originalOrderItems = JSON.parse(JSON.stringify(this.orderItems))
            } else {
              this.orderItems = []
              this.originalOrderItems = []
            }

            // Load appropriate entity data based on order type
            if (parseInt(orderData.type) === 1) {
              // For sales orders, load customers
              if (orderData.customer_id) {
                this.fetchCustomers().then(() => {
                  const customer = this.customers.find(c => c.id === orderData.customer_id)
                  if (customer) {
                    this.order.customer_id = customer
                  }
                })
              }
            } else if (parseInt(orderData.type) === 2) {
              // For purchase orders, load suppliers
              if (orderData.supplier_id) {
                this.fetchSuppliers().then(() => {
                  const supplier = this.suppliers.find(s => s.id === orderData.supplier_id)
                  if (supplier) {
                    this.order.supplier_id = supplier
                  }
                })
              }
            }
          } else {
            this.$snackbar.error('Không tìm thấy thông tin đơn hàng')
            this.closeDialog()
          }
        })
        .catch(err => {
          console.error('Error fetching order details:', err)
          this.$snackbar.error('Không thể tải thông tin đơn hàng')
          this.closeDialog()
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchCustomers() {
      this.loadingCustomers = true
      return customerActions.getCustomers({ per_page: 1000 })
        .then(res => {
          this.customers = (res.data.data || res.data).map(customer => ({
            ...customer,
            displayText: `${customer.name} - ${customer.phone || 'Không có SĐT'}`
          }))
          return this.customers
        })
        .catch(err => {
          console.error('Error fetching customers:', err)
          this.$snackbar.error('Không thể tải danh sách khách hàng')
          return []
        })
        .finally(() => {
          this.loadingCustomers = false
        })
    },

    fetchSuppliers() {
      this.loadingSuppliers = true
      return supplierActions.getSuppliers({ per_page: 1000 })
        .then(res => {
          this.suppliers = (res.data.data || res.data).map(supplier => ({
            ...supplier,
            displayText: `${supplier.name} - ${supplier.phone || 'Không có SĐT'}`
          }))
          return this.suppliers
        })
        .catch(err => {
          console.error('Error fetching suppliers:', err)
          this.$snackbar.error('Không thể tải danh sách nhà cung cấp')
          return []
        })
        .finally(() => {
          this.loadingSuppliers = false
        })
    },
    fetchProducts(search = '') {
      this.loadingProducts = true
      productActions.getProductsV2({ per_page: 20, name: search })
        .then(res => {
          this.products = res.data.data
        })
        .catch(err => {
          console.error('Error fetching products:', err)
          this.$snackbar.error('Không thể tải danh sách sản phẩm')
        })
        .finally(() => {
          this.loadingProducts = false
        })
    },
    showAddProductDialog() {
      this.selectedProduct = null
      this.newItem = {
        quantity: 1,
        user_cost: 0,
        discount: 0,
        discount_type: 1
      }
      this.fetchProducts()
      this.addProductDialog = true
    },
    addProduct() {
      if (!this.selectedProduct) return

      const newOrderItem = {
        product_id: this.selectedProduct.id,
        product: this.selectedProduct,
        quantity: this.newItem.quantity,
        user_cost: this.newItem.user_cost,
        discount: this.newItem.discount,
        discount_type: this.newItem.discount_type,
        is_existing: false, // Đánh dấu đây là item mới
        original_id: null // Item mới không có ID gốc
      }

      // Check if product already exists in order
      const existingIndex = this.orderItems.findIndex(item => item.product_id === this.selectedProduct.id)

      if (existingIndex >= 0) {
        // Update existing item
        this.orderItems[existingIndex].quantity += this.newItem.quantity
      } else {
        // Add new item
        this.orderItems.push(newOrderItem)
      }

      this.addProductDialog = false
      this.$snackbar.success('Đã thêm sản phẩm vào đơn hàng')
    },
    removeItem(item) {
      const index = this.orderItems.findIndex(i =>
        (i.is_existing && i.original_id === item.original_id) ||
        (!i.is_existing && i.product_id === item.product_id)
      )

      if (index >= 0) {
        // Xóa item khỏi danh sách hiện tại
        // Logic is_delete sẽ được xử lý trong updateOrder()
        this.orderItems.splice(index, 1)
        this.$snackbar.success('Đã xóa sản phẩm khỏi đơn hàng')
      }
    },    updateCustomerInfo() {
      if (this.order.customer_id && typeof this.order.customer_id === 'object') {
        // Set customer information from selected object
        this.order.phone = this.order.customer_id.phone || ''
        this.order.email = this.order.customer_id.email || ''
        this.order.address = this.order.customer_id.address || this.order.address || ''

        // Store the customer object reference
        this.order.customer = this.order.customer_id
        this.order.customer_id = this.order.customer_id.id
      }
    },

    updateSupplierInfo() {
      if (this.order.supplier_id && typeof this.order.supplier_id === 'object') {
        // Set supplier information from selected object
        this.order.phone = this.order.supplier_id.phone || ''
        this.order.email = this.order.supplier_id.email || ''
        this.order.address = this.order.supplier_id.address || this.order.address || ''

        // Store the supplier object reference
        this.order.supplier = this.order.supplier_id
        this.order.supplier_id = this.order.supplier_id.id
      }
    },
    calculateItemTotal(item) {
      const price = parseFloat(item.user_cost) || 0
      const quantity = parseInt(item.quantity) || 0
      const discount = parseFloat(item.discount) || 0

      if (item.discount_type === 1) {
        // Percentage discount
        return (price - (price * discount / 100)) * quantity
      } else {
        // Fixed amount discount
        return (price - discount) * quantity
      }
    },
    calculateTotalAmount() {
      return this.orderItems.reduce((sum, item) => sum + this.calculateItemTotal(item), 0)
    },
    calculateFinalAmount() {
      const totalAmount = this.calculateTotalAmount()
      const discount = parseFloat(this.order.discount) || 0

      if (this.discountType === 'percent') {
        return totalAmount - (totalAmount * discount / 100)
      } else {
        return totalAmount - discount
      }
    },
    calculateDebt() {
      return this.calculateFinalAmount() - this.amountPaid
    },
    updateOrder() {
      if (!this.$refs.form.validate()) return

      this.updating = true

      // Xử lý order_detail với logic is_delete
      const processedOrderDetails = []

      // 1. Xử lý các item hiện tại
      this.orderItems.forEach(item => {
        if (item.is_existing) {
          // Item đã tồn tại - thêm is_delete: false
          processedOrderDetails.push({
            id: item.original_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.user_cost,
            discount: item.discount,
            discount_type: item.discount_type,
            is_delete: false
          })
        } else {
          // Item mới - không cần is_delete
          processedOrderDetails.push({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.user_cost,
            discount: item.discount,
            discount_type: item.discount_type
          })
        }
      })

      // 2. Tìm các item đã bị xóa (có trong originalOrderItems nhưng không có trong orderItems)
      this.originalOrderItems.forEach(originalItem => {
        const stillExists = this.orderItems.find(item =>
          item.is_existing && item.original_id === originalItem.original_id
        )

        if (!stillExists) {
          // Item đã bị xóa - thêm is_delete: true
          processedOrderDetails.push({
            id: originalItem.original_id,
            product_id: originalItem.product_id,
            quantity: originalItem.quantity,
            price: originalItem.user_cost,
            discount: originalItem.discount,
            discount_type: originalItem.discount_type,
            is_delete: true
          })
        }
      })

      // Prepare order data with correct field names for API
      const orderData = {
        id: this.order.id,
        status: this.order.status,
        is_retail: this.order.is_retail,
        discount: this.order.discount,
        discount_type: this.discountType === 'percent' ? 1 : 2,
        note: this.order.note,
        order_detail: processedOrderDetails,
        payment: {
          price: this.amountPaid,
          type: this.paymentType
        }
      }

      // Add customer_id for sales orders or supplier_id for purchase orders
      console.log('customer', this.order.customer_id , 'type of' , typeof this.order.customer_id)
      if (parseInt(this.order.type) === 1) {
        orderData.customer_id = this.order.customer_id?.id || null;
      } else if (parseInt(this.order.type) === 2) {
        orderData.supplier_id = this.order.supplier_id?.id || null;
      }

      // Call API to update order
      orderActions.updateOrder({ id: this.order.id, ...orderData })
        .then(res => {
          this.$snackbar.success('Cập nhật đơn hàng thành công')
          this.$emit('refresh')
          this.closeDialog()
        })
        .catch(err => {
          console.error('Error updating order:', err)
          this.$snackbar.error('Không thể cập nhật đơn hàng. Vui lòng thử lại.')
        })
        .finally(() => {
          this.updating = false
        })
    },
    formatCurrency(value) {
      if (!value && value !== 0) return '0 ₫'
      return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      })
    },
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getStatusColor(status) {
      switch (parseInt(status)) {
        case 1:
          return 'warning' // Chờ xác nhận
        case 2:
          return 'success' // Hoàn thành
        case 3:
          return 'error' // Đã hủy
        case 4:
          return 'deep-purple' // Trả hàng
        default:
          return 'grey'
      }
    },
    getStatusIcon(status) {
      switch (parseInt(status)) {
        case 1:
          return 'mdi-clock-outline' // Chờ xác nhận
        case 2:
          return 'mdi-check-circle' // Hoàn thành
        case 3:
          return 'mdi-close-circle' // Đã hủy
        case 4:
          return 'mdi-package-variant-closed-remove' // Trả hàng
        default:
          return 'mdi-help-circle-outline'
      }
    },
    getStatusName(status) {
      switch (parseInt(status)) {
        case 1:
          return 'Chờ xác nhận'
        case 2:
          return 'Hoàn thành'
        case 3:
          return 'Đã hủy'
        case 4:
          return 'Trả hàng'
        default:
          return 'Không xác định'
      }
    },
    getOrderTypeColor(type) {
      switch (parseInt(type)) {
        case 1:
          return 'purple' // Sale
        case 2:
          return 'teal' // Purchase
        case 3:
          return 'deep-orange' // Sale Return
        case 4:
          return 'amber darken-2' // Purchase Return
        default:
          return 'grey'
      }
    },
    getOrderTypeIcon(type) {
      switch (parseInt(type)) {
        case 1:
          return 'mdi-basket' // Bán hàng
        case 2:
          return 'mdi-truck-delivery' // Nhập hàng
        case 3:
          return 'mdi-keyboard-return' // Trả hàng bán
        case 4:
          return 'mdi-keyboard-return-outline' // Trả hàng nhập
        default:
          return 'mdi-help-circle-outline'
      }
    },
    getOrderTypeName(type) {
      switch (parseInt(type)) {
        case 1:
          return 'Bán hàng'
        case 2:
          return 'Nhập hàng'
        case 3:
          return 'Trả hàng bán'
        case 4:
          return 'Trả hàng nhập'
        default:
          return 'Không xác định'
      }
    }
  }
}
</script>

<style scoped>
.v-data-table >>> th {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
  font-weight: 500 !important;
  background-color: #f5f7fa !important;
}

.v-data-table >>> td {
  padding: 8px 16px !important;
}

.price-field, .quantity-field, .discount-field {
  max-width: 100px;
}

.status-select >>> .v-input__slot {
  min-height: 32px !important;
}
</style>
