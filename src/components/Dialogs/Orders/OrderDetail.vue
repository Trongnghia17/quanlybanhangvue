<template>
  <v-dialog v-model="dialog" max-width="900" persistent scrollable>
    <v-card class="rounded-lg">
      <v-card-title class="headline primary white--text">
        <v-icon left color="white" size="24">mdi-receipt</v-icon>
        Chi tiết đơn hàng
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-skeleton-loader v-if="loading" type="card, list-item-three-line, table" class="mb-4"></v-skeleton-loader>

        <div v-else>
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
                  <v-chip :color="getStatusColor(order.status)" text-color="white" small pill class="px-2">
                    <v-icon left x-small>{{ getStatusIcon(order.status) }}</v-icon>
                    {{ getStatusName(order.status) }}
                  </v-chip>
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

                <!-- Thông tin khách hàng (đơn bán) -->
                <template v-if="parseInt(order.type) === 1">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Tên khách hàng:</span>
                    <span class="font-weight-medium">{{ order.customer?.name || order.name || 'Khách lẻ' }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.customer?.phone || order.phone">
                    <span class="text-body-2 grey--text">Số điện thoại:</span>
                    <span>{{ order.customer?.phone || order.phone }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.customer?.email || order.email">
                    <span class="text-body-2 grey--text">Email:</span>
                    <span>{{ order.customer?.email || order.email }}</span>
                  </div>
                </template>

                <!-- Thông tin nhà cung cấp (đơn nhập) -->
                <template v-else>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2 grey--text">Tên nhà cung cấp:</span>
                    <span class="font-weight-medium">{{ order.supplier?.name || 'Không có thông tin' }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.supplier?.phone">
                    <span class="text-body-2 grey--text">Số điện thoại:</span>
                    <span>{{ order.supplier?.phone }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2" v-if="order.supplier?.email">
                    <span class="text-body-2 grey--text">Email:</span>
                    <span>{{ order.supplier?.email }}</span>
                  </div>
                </template>
                <div class="d-flex justify-space-between mb-2" v-if="order.address">
                  <span class="text-body-2 grey--text">Địa chỉ:</span>
                  <span>{{ order.address }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2" v-if="order.shipping_code">
                  <span class="text-body-2 grey--text">Mã vận đơn:</span>
                  <span class="font-weight-medium">{{ order.shipping_code }}</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Order Items -->
          <v-card outlined class="mb-4 rounded-lg">
            <v-card-title class="py-2">
              <v-icon color="teal" class="mr-2">mdi-package-variant</v-icon>
              <span class="text-subtitle-1 font-weight-bold">Sản phẩm trong đơn hàng</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-data-table
              :headers="itemHeaders"
              :items="order.order_detail || []"
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
                {{ formatCurrency(item.user_cost) }}
              </template>

              <template v-slot:item.discount="{ item }">
                <span v-if="item.discount && item.discount > 0">
                  {{ item.discount_type === 1 ? `${item.discount}%` : formatCurrency(item.discount) }}
                </span>
                <span v-else>-</span>
              </template>

              <template v-slot:item.total="{ item }">
                {{ formatCurrency(calculateItemTotal(item)) }}
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
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2 grey--text">Phương thức thanh toán:</span>
                  <div class="d-flex align-center">
                    <v-icon small :color="getPaymentTypeColor(order.order_payment?.[0]?.type)" class="mr-1">
                      {{ getPaymentTypeIcon(order.order_payment?.[0]?.type) }}
                    </v-icon>
                    <span>{{ getPaymentTypeName(order.order_payment?.[0]) }}</span>
                  </div>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2 grey--text">Tổng tiền hàng:</span>
                  <span class="font-weight-medium">{{  formatCurrency(calculateRetailTotal()) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2" v-if="order.discount > 0">
                  <span class="text-body-2 grey--text">Giảm giá:</span>
                  <span class="red--text">-{{ order.discount_type === 1 ? `${order.discount}%` : formatCurrency(order.discount) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2 grey--text">Thành tiền:</span>
                  <span class="font-weight-bold text-h6 primary--text">{{ formatCurrency(order.retail_cost) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2 grey--text">Đã thanh toán:</span>
                  <span class="font-weight-medium green--text">{{ formatCurrency(getTotalPaid()) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2" v-if="order.debt > 0">
                  <span class="text-body-2 grey--text">Công nợ:</span>
                  <span class="font-weight-medium red--text">{{ formatCurrency(order.debt) }}</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card outlined class="pa-3 rounded-lg">
                <div class="d-flex align-center mb-2">
                  <v-icon color="amber darken-2" class="mr-2">mdi-history</v-icon>
                  <div class="text-subtitle-1 font-weight-bold">Lịch sử thanh toán</div>
                </div>
                <v-divider class="mb-3"></v-divider>
                <div v-if="order.order_payment && order.order_payment.length > 0 && hasValidPayments()">
                  <div v-for="(payment, index) in order.order_payment" :key="index" class="mb-3 pa-2 rounded-lg grey lighten-4" v-if="payment.price > 0">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-body-2 grey--text">Ngày thanh toán:</span>
                      <span>{{ formatDateTime(payment.created_at) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-body-2 grey--text">Số tiền:</span>
                      <span class="font-weight-medium green--text">{{ formatCurrency(payment.price) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-body-2 grey--text">Phương thức:</span>
                      <div class="d-flex align-center">
                        <v-icon small :color="getPaymentTypeColor(payment.type)" class="mr-1">
                          {{ getPaymentTypeIcon(payment.type) }}
                        </v-icon>
                        <span>{{ getPaymentTypeName(payment) }}</span>
                      </div>
                    </div>
                    <div class="d-flex justify-space-between" v-if="payment.note">
                      <span class="text-body-2 grey--text">Ghi chú:</span>
                      <span>{{ payment.note }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 grey--text">
                  <v-icon large color="grey lighten-1" class="mb-2">mdi-cash-remove</v-icon>
                  <div>Chưa có lịch sử thanh toán</div>
                  <div class="text-caption" v-if="order.debt > 0">Còn nợ: {{ formatCurrency(order.debt) }}</div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn text color="grey darken-1" @click="closeDialog">
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="amber darken-2" dark class="mr-2" @click="printInvoice" :disabled="loading">
          <v-icon left>mdi-printer</v-icon>
          In hóa đơn
        </v-btn>
        <v-btn color="primary" dark @click="closeDialog" :disabled="loading">
          <v-icon left>mdi-check</v-icon>
          Xác nhận
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import orderModule from '@/api/order'
import { printHtmlContent } from '@/utils/print'

const orderActions = orderModule.actions

export default {
  name: 'OrderDetail',
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
      order: {},
      itemHeaders: [
        { text: 'Sản phẩm', value: 'product', sortable: false },
        { text: 'Đơn giá', value: 'price', align: 'right' },
        { text: 'Số lượng', value: 'quantity', align: 'center' },
        { text: 'Chiết khấu', value: 'discount', align: 'right' },
        { text: 'Thành tiền', value: 'total', align: 'right' }
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
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false
    },
    fetchOrderDetail() {
      this.loading = true
      orderActions.getOrderDetail(this.orderId)
        .then(res => {
          if (res.data && res.data.data) {
            this.order = res.data.data
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
    printInvoice() {
      this.loading = true
      orderActions.printOrder(this.orderId)
        .then(res => {
          if (res.status === 200) {
            const htmlPrint = res.data
            printHtmlContent(htmlPrint)
            this.$snackbar.success('In hóa đơn thành công!')
          }
        })
        .catch(err => {
          console.error('Error printing invoice:', err)
          this.$snackbar.error('Không thể in hóa đơn. Vui lòng thử lại.')
        })
        .finally(() => {
          this.loading = false
        })
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
    getTotalPaid() {
      if (!this.order.order_payment || !Array.isArray(this.order.order_payment)) {
        return 0
      }
      return this.order.order_payment.reduce((total, payment) => {
        return total + (parseFloat(payment.price) || 0)
      }, 0)
    },
    hasValidPayments() {
      if (!this.order.order_payment || !Array.isArray(this.order.order_payment)) {
        return false
      }
      return this.order.order_payment.some(payment => parseFloat(payment.price) > 0)
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
    },
    getPaymentTypeName(payment) {
      switch (parseInt(payment?.type)) {
        case 1:
          return 'Tiền mặt'
        case 2:
          return 'Chuyển khoản'
        case 3:
          return 'COD'
        default:
          return 'Không xác định'
      }
    },
    getPaymentTypeIcon(type) {
      switch (parseInt(type)) {
        case 1:
          return 'mdi-cash'
        case 2:
          return 'mdi-bank-transfer'
        case 3:
          return 'mdi-truck-delivery'
        default:
          return 'mdi-help-circle-outline'
      }
    },
    getPaymentTypeColor(type) {
      switch (parseInt(type)) {
        case 1:
          return 'green'
        case 2:
          return 'blue'
        case 3:
          return 'purple'
        default:
          return 'grey'
      }
    },
    calculateRetailTotal() {
      if (!this.order?.order_detail || !Array.isArray(this.order.order_detail)) {
        return 0
      }

      return this.order.order_detail.reduce((total, item) => {
        const quantity = parseFloat(item.quantity) || 0
        const price = parseFloat(item.product?.retail_cost) || 0
        return total + quantity * price
      }, 0)
    },
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
</style>
