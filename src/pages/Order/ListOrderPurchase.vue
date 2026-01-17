<template>
<div class="order-management">
    <!-- Main Content Area -->
    <div class="d-flex flex-wrap">
        <!-- Stats Cards -->
        <v-card class="mb-6 rounded-lg elevation-2 stats-card-container" width="100%">
            <v-row class="ma-0">
                <v-col cols="12" sm="6" md="3" class="pa-3">
                    <v-card outlined class="rounded-lg pa-3 indigo lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon indigo lighten-4 mr-4">
                                    <v-icon size="28" color="indigo">mdi-file-document</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline indigo--text text--darken-1 mb-1">Tổng đơn nhập</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ orderMeta.total }}
                                    </div>
                                    <div class="text-caption indigo--text text--darken-1">
                                        <v-icon small color="indigo">mdi-trending-up</v-icon>
                                        <span class="ml-1">+{{ formatNumber(getNewOrdersCount()) }} trong tháng này</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3" class="pa-3">
                    <v-card outlined class="rounded-lg pa-3 teal lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon teal lighten-4 mr-4">
                                    <v-icon size="28" color="teal">mdi-cash-multiple</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline teal--text text--darken-1 mb-1">Chi phí nhập hàng</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ formatCurrency(getTotalCost()) }}
                                    </div>
                                    <div class="text-caption teal--text text--darken-1">
                                        <v-icon small color="teal">mdi-information-outline</v-icon>
                                        <span class="ml-1">Tổng chi phí</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3" class="pa-3">
                    <v-card outlined class="rounded-lg pa-3 amber lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon amber lighten-4 mr-4">
                                    <v-icon size="28" color="amber darken-2">mdi-account-cash</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline amber--text text--darken-2 mb-1">Công nợ nhà cung cấp</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ formatCurrency(getTotalDebt()) }}
                                    </div>
                                    <div class="text-caption amber--text text--darken-2">
                                        <v-icon small color="amber darken-2">mdi-alert-circle-outline</v-icon>
                                        <span class="ml-1">{{ getDebtOrderCount() }} đơn hàng có công nợ</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3" class="pa-3">
                    <v-card outlined class="rounded-lg pa-3 deep-purple lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon deep-purple lighten-4 mr-4">
                                    <v-icon size="28" color="deep-purple">mdi-truck-delivery</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline deep-purple--text text--darken-1 mb-1">Đơn đang chờ nhập</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ formatNumber(getPendingOrdersCount()) }}
                                    </div>
                                    <div class="text-caption deep-purple--text text--darken-1">
                                        <v-icon small color="deep-purple">mdi-clock-outline</v-icon>
                                        <span class="ml-1">Đang chờ xử lý</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </div>

    <!-- Order Data Management -->
    <v-card class="rounded-lg elevation-3 mb-6">
        <v-card-title class="py-4">
            <v-row align="center">
                <v-col cols="12" sm="8" md="5">
                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm theo Mã đơn/Tên nhà cung cấp" single-line hide-details outlined dense clearable class="search-field"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-select v-model="filterStatus" :items="statusFilterOptions" label="Lọc theo trạng thái" outlined dense hide-details></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="4" class="d-flex justify-end align-center">
                    <v-btn color="grey lighten-3" class="mr-2 text-none rounded-lg" elevation="0" @click="openExportDialog">
                        <v-icon left small>mdi-file-export</v-icon>
                        Xuất Excel
                    </v-btn>

                    <v-btn color="primary" dark :to="'/order-purchase'" class="px-4 font-weight-medium text-none rounded-lg" elevation="2">
                        <v-icon left>mdi-plus</v-icon>
                        Tạo đơn nhập hàng mới
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Display options toggle -->
        <v-card-actions class="px-4 py-2 bg-grey-lighten-4">
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="displayMode" color="primary" group mandatory dense class="elevation-0 rounded-lg">
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
        <v-data-table v-if="displayMode === 'table'" :headers="headers" :items="filteredOrders"
          :loading="tableLoading"
          loading-text="Đang tải dữ liệu..."
          sort-by="created_at"
          sort-desc
          class="elevation-0 custom-data-table"
          :footer-props="{
            'items-per-page-text': 'Số đơn hàng mỗi trang:',
            'items-per-page-options': [10, 20, 50, 100],
            'show-first-last-page': true
          }"
          :server-items-length="totalItems"
          :items-per-page="perPage"
          @update:options="handlePageChange"
        >
            <template v-slot:item.code="{ item }">
                <div>
                    <div class="font-weight-medium primary--text">{{ item.code }}</div>
                    <div v-if="item.reference_code" class="text-caption grey--text d-flex align-center mt-1">
                        <v-icon x-small color="grey lighten-1" class="mr-1">mdi-tag</v-icon>
                        <span>Ref: {{ item.reference_code }}</span>
                    </div>
                </div>
            </template>

            <template v-slot:item.supplier="{ item }">
                <div>
                    <div class="font-weight-medium d-flex align-center">
                        <v-icon x-small color="indigo lighten-1" class="mr-1">mdi-domain</v-icon>
                        <span>{{ item.supplier?.name }}</span>
                    </div>
                    <div class="text-caption d-flex align-center mt-1" v-if="item.supplier?.phone">
                        <v-icon x-small color="grey lighten-1" class="mr-1">mdi-phone</v-icon>
                        <span>{{ item.supplier?.phone }}</span>
                    </div>
                </div>
            </template>

            <template v-slot:item.payment_type="{ item }">
                <div class="d-flex align-center">
                    <v-icon small :color="getPaymentTypeColor(item.order_payment?.[0]?.type)" class="mr-1">{{ getPaymentTypeIcon(item.order_payment?.[0]?.type) }}</v-icon>
                    <span>{{ getPaymentTypeName(item.order_payment?.[0]) }}</span>
                </div>
            </template>

            <template v-slot:item.base_cost="{ item }">
                <div class="font-weight-medium">{{ formatCurrency(item.base_cost) }}</div>
                <div v-if="item.discount > 0" class="text-caption">
                    Giảm: {{ item.discount_type === 'percent' ? `${item.discount}%` : formatCurrency(item.discount) }}
                </div>
            </template>

            <template v-slot:item.debt="{ item }">
                <div>
                    <div :class="{'red--text': item.debt > 0, 'green--text': item.debt === 0}" class="font-weight-medium d-flex align-center">
                        <v-icon v-if="item.debt > 0" x-small color="red" class="mr-1">mdi-alert-circle</v-icon>
                        <v-icon v-else x-small color="green" class="mr-1">mdi-check-circle</v-icon>
                        {{ formatCurrency(item.debt) }}
                    </div>
                </div>
            </template>

            <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" text-color="white" small pill elevation="1" class="px-3 py-1">
                    <v-icon left x-small>{{ getStatusIcon(item.status) }}</v-icon>
                    {{ getStatusName(item.status) }}
                </v-chip>
                <div v-if="item.is_return" class="mt-2">
                    <v-chip color="orange" text-color="white" small pill elevation="1" class="px-3 py-1">
                        <v-icon left x-small>mdi-undo-variant</v-icon>
                        Đã trả hàng
                    </v-chip>
                </div>
            </template>

            <template v-slot:item.created_at="{ item }">
                <div class="d-flex align-center">
                    <v-icon small color="grey" class="mr-1">mdi-calendar</v-icon>
                    <span>{{ formatDate(item.created_at) }}</span>
                </div>
                <div class="d-flex align-center mt-1">
                    <v-icon small color="grey" class="mr-1">mdi-clock-outline</v-icon>
                    <span class="text-caption grey--text">{{ formatTime(item.created_at) }}</span>
                </div>
            </template>

            <template v-slot:item.actions="{ item }">
                <div class="d-flex justify-center">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon small color="info" class="mr-2" v-bind="attrs" v-on="on" @click="showOrderDetail(item)" elevation="1">
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                        </template>
                        <span>Xem chi tiết</span>
                    </v-tooltip>

                    <v-tooltip bottom v-if="item.status !== 2">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon small color="teal" class="mr-2" v-bind="attrs" v-on="on" @click="showUpdateOrder(item)" elevation="1">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Chỉnh sửa đơn hàng</span>
                    </v-tooltip>

                    <v-tooltip bottom v-if="item.debt > 0">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon small color="indigo" class="mr-2" v-bind="attrs" v-on="on" @click="openPaymentDialog(item)" elevation="1">
                                <v-icon>mdi-cash-multiple</v-icon>
                            </v-btn>
                        </template>
                        <span>Thanh toán công nợ</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon small color="amber darken-2" class="mr-2" v-bind="attrs" v-on="on" @click="printInvoice(item)" elevation="1">
                                <v-icon>mdi-printer</v-icon>
                            </v-btn>
                        </template>
                        <span>In phiếu nhập hàng</span>
                    </v-tooltip>

                    <v-tooltip bottom v-if="item.status !== 3">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon small color="error" v-bind="attrs" v-on="on" @click="cancelOrder(item)" elevation="1">
                                <v-icon>mdi-close-circle</v-icon>
                            </v-btn>
                        </template>
                        <span>Hủy đơn hàng</span>
                    </v-tooltip>
                </div>
            </template>

            <template v-slot:no-data>
                <v-card flat class="pa-8 text-center mx-auto" max-width="500">
                    <v-img src="https://cdn.vuetifyjs.com/images/lists/no-results.svg" max-width="200" class="mx-auto mb-4"></v-img>
                    <div class="text-h6 grey--text text--darken-1 mb-2">Chưa có đơn nhập hàng nào</div>
                    <div class="text-body-2 grey--text mb-4">Tạo đơn nhập hàng mới để bắt đầu quản lý nhập hàng</div>
                    <v-btn color="primary" class="px-5" outlined :to="'/order-purchase'">
                        <v-icon left>mdi-plus</v-icon>
                        Tạo đơn nhập hàng mới
                    </v-btn>
                </v-card>
            </template>
        </v-data-table>

        <!-- Grid View -->
        <div v-else-if="displayMode === 'grid'" class="pa-4">
            <v-row>
                <v-col v-for="(item, index) in filteredOrders" :key="index" cols="12" sm="6" md="4" lg="3" class="d-flex">
                    <v-card class="rounded-lg elevation-2 flex-grow-1 order-card" hover>
                        <v-card-title class="pb-1">
                            <div class="d-flex justify-space-between align-center w-100">
                                <span>{{ item.code }}</span>
                                <v-chip :color="getStatusColor(item.status)" text-color="white" x-small class="px-2">
                                    {{ getStatusName(item.status) }}
                                </v-chip>
                            </div>
                        </v-card-title>

                        <v-card-subtitle class="pb-0 pt-1 d-flex justify-space-between">
                            <span>{{ formatDate(item.created_at) }}</span>
                            <span class="font-weight-bold">
                                {{ formatCurrency(item.base_cost) }}
                            </span>
                        </v-card-subtitle>

                        <v-divider class="mx-4 my-2"></v-divider>

                        <v-card-text class="py-2">
                            <div class="d-flex align-center mb-2">
                                <v-icon size="18" class="mr-2 grey--text">mdi-domain</v-icon>
                                <div>
                                    <div class="font-weight-medium">{{ item.supplier?.name }}</div>
                                    <div class="text-caption grey--text">{{ item.supplier?.phone }}</div>
                                </div>
                            </div>

                            <div class="d-flex justify-space-between mt-3">
                                <div>
                                    <v-chip color="indigo" text-color="white" x-small class="px-2 mb-1">
                                        Nhập hàng
                                    </v-chip>
                                </div>

                                <div v-if="item.debt > 0" class="red--text text-right">
                                    <div class="text-caption">Công nợ</div>
                                    <div>{{ formatCurrency(item.debt) }}</div>
                                </div>
                            </div>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-btn small text color="primary" :to="`/orders/${item.id}`">
                                <v-icon small left>mdi-eye</v-icon>
                                Chi tiết
                            </v-btn>

                            <v-btn small text color="amber darken-2" @click="printInvoice(item)">
                                <v-icon small left>mdi-printer</v-icon>
                                In
                            </v-btn>

                            <v-spacer></v-spacer>

                            <v-btn small text color="teal" :to="`/orders/${item.id}/edit`">
                                <v-icon small left>mdi-pencil</v-icon>
                                Sửa
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>

                <v-col cols="12" v-if="filteredOrders.length === 0">
                    <v-card flat class="pa-8 text-center mx-auto" max-width="500">
                        <v-img src="https://cdn.vuetifyjs.com/images/lists/no-results.svg" max-width="200" class="mx-auto mb-4"></v-img>
                        <div class="text-h6 grey--text text--darken-1 mb-2">Không tìm thấy đơn nhập hàng nào</div>
                        <div class="text-body-2 grey--text mb-4">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</div>
                        <v-btn color="primary" class="px-5" outlined @click="clearFilters">
                            <v-icon left>mdi-filter-remove</v-icon>
                            Xóa bộ lọc
                        </v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </v-card>

    <!-- Cancel Order Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400" persistent>
        <v-card class="rounded-lg">
            <v-card-title class="headline error--text">
                <v-icon left color="error" size="24">mdi-alert-circle</v-icon>
                Xác nhận hủy đơn
            </v-card-title>
            <v-card-text class="py-3">
                <p class="text-subtitle-1">Bạn có chắc chắn muốn hủy đơn nhập hàng <strong>{{ orderToCancel?.code }}</strong>?</p>
                <p class="text-body-2 grey--text text--darken-1 mt-2">Hành động này không thể hoàn tác.</p>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="grey darken-1" @click="cancelDialog = false" :disabled="cancelLoading">
                    Đóng
                </v-btn>
                <v-btn color="error" :loading="cancelLoading" @click="confirmCancel" elevation="2" class="px-4">
                    <v-icon left>mdi-close-circle</v-icon>
                    Hủy đơn hàng
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="500">
        <v-card class="rounded-lg">
            <v-card-title class="headline">
                <v-icon left color="teal" size="24">mdi-cash</v-icon>
                Thanh toán công nợ
            </v-card-title>
            <v-card-text class="py-4">
                <div v-if="orderToProcess">
                    <div class="d-flex justify-space-between mb-4">
                        <div class="text-subtitle-1">Mã đơn nhập:</div>
                        <div class="font-weight-bold">{{ orderToProcess.code }}</div>
                    </div>

                    <div class="d-flex justify-space-between mb-4">
                        <div class="text-subtitle-1">Tổng tiền:</div>
                        <div class="font-weight-bold">{{ formatCurrency(orderToProcess.base_cost) }}</div>
                    </div>

                    <div class="d-flex justify-space-between mb-4">
                        <div class="text-subtitle-1">Công nợ hiện tại:</div>
                        <div class="red--text font-weight-bold">{{ formatCurrency(orderToProcess.debt) }}</div>
                    </div>

                    <v-divider class="my-4"></v-divider>

                    <v-form ref="paymentForm" v-model="validPaymentForm">
                        <v-text-field
                            v-model="formattedPaymentPrice"
                            label="Số tiền thanh toán"
                            outlined
                            dense
                            prefix="₫"
                            :rules="[
                                v => !!paymentForm.price || 'Vui lòng nhập số tiền',
                                v => paymentForm.price > 0 || 'Số tiền phải lớn hơn 0',
                                v => paymentForm.price <= orderToProcess.debt || 'Số tiền không được lớn hơn công nợ'
                            ]"
                            @input="handlePriceInput"
                            required
                        ></v-text-field>

                        <v-radio-group
                            v-model="paymentForm.type"
                            label="Phương thức thanh toán"
                            required
                            :rules="[v => !!v || 'Vui lòng chọn phương thức thanh toán']"
                        >
                            <v-radio value="1" label="Tiền mặt"></v-radio>
                            <v-radio value="2" label="Chuyển khoản"></v-radio>
                            <v-radio value="3" label="Thẻ tín dụng"></v-radio>
                        </v-radio-group>

                        <v-text-field
                            v-model="paymentForm.note"
                            label="Ghi chú (không bắt buộc)"
                            outlined
                            dense
                        ></v-text-field>
                    </v-form>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="grey darken-1" @click="closePaymentDialog" :disabled="paymentLoading">
                    Hủy
                </v-btn>
                <v-btn
                    color="teal"
                    :loading="paymentLoading"
                    @click="submitPayment"
                    :disabled="!validPaymentForm"
                    class="px-4 white--text"
                >
                    <v-icon left>mdi-check</v-icon>
                    Xác nhận thanh toán
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Order Detail Dialog -->
    <order-detail
        :open="orderDetailDialog"
        :order-id="selectedOrderId"
        @toggle="orderDetailDialog = false"
    ></order-detail>

    <!-- Update Order Dialog -->
    <update-order
        :open="updateOrderDialog"
        :order-id="selectedOrderId"
        @toggle="updateOrderDialog = false"
        @refresh="fetchOrders"
    ></update-order>

    <!-- Export Orders Dialog -->
    <export-purchase-orders-dialog
        :open="exportDialog"
        @toggle="exportDialog = false"
    />
</div>
</template>

<script>
import orderModule from '@/api/order'
const orderActions = orderModule.actions
import {
    printHtmlContent
} from '../../utils/print'
import OrderDetail from '@/components/Dialogs/Orders/OrderDetail.vue'
import UpdateOrder from '@/components/Dialogs/Orders/UpdateOrder.vue'
import ExportPurchaseOrdersDialog from '@/components/Dialogs/Orders/ExportPurchaseOrdersDialog.vue'

export default {
    components: {
        OrderDetail,
        UpdateOrder,
        ExportPurchaseOrdersDialog
    },
    data() {
        return {
            search: '',
            filterStatus: 'all',
            displayMode: 'table',
            tableLoading: false,

            // Pagination parameters
            page: 1,
            perPage: 10,
            totalItems: 0,

            // Order Detail Dialog
            orderDetailDialog: false,
            updateOrderDialog: false,
            selectedOrderId: null,
            exportDialog: false,

            // Search debouncing
            searchTimeout: null,

            headers: [{
                    text: 'Mã đơn nhập',
                    value: 'code',
                    width: '100px'
                },
                {
                    text: 'Nhà cung cấp',
                    value: 'supplier',
                    width: '150px'
                },
                {
                    text: 'Phương thức',
                    value: 'payment_type',
                    width: '120px'
                },
                {
                    text: 'Tổng tiền',
                    value: 'base_cost',
                    width: '150px'
                },
                {
                    text: 'Công nợ',
                    value: 'debt',
                    width: '120px'
                },
                {
                    text: 'Trạng thái',
                    value: 'status',
                    width: '120px'
                },
                {
                    text: 'Ngày tạo',
                    value: 'created_at',
                    width: '120px'
                },
                {
                    text: 'Thao tác',
                    value: 'actions',
                    sortable: false,
                    align: 'center',
                    width: '120px'
                }
            ],
            statusFilterOptions: [{
                    text: 'Tất cả đơn nhập',
                    value: 'all'
                },
                {
                    text: 'Chờ xử lý',
                    value: '1'
                },
                {
                    text: 'Đã hoàn thành',
                    value: '2'
                },
                {
                    text: 'Đã hủy',
                    value: '3'
                },
            ],
            listOrders: [],
            orderMeta: {},

            // Cancel dialog
            cancelDialog: false,
            orderToCancel: null,
            cancelLoading: false,

            // Payment dialog
            paymentDialog: false,
            orderToProcess: null,
            paymentLoading: false,
            validPaymentForm: false,
            paymentForm: {
                price: null,
                type: null,
                note: ''
            },
            formattedPaymentPrice: ''
        }
    },
    watch: {
        // Watch for search input changes and debounce API calls
        search(newValue) {
            // Clear existing timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            // Set new timeout for debounced search
            this.searchTimeout = setTimeout(() => {
                this.page = 1; // Reset to first page when searching
                this.fetchOrders();
            }, 500); // 500ms delay
        },

        // Watch for filter status changes
        filterStatus() {
            this.page = 1; // Reset to first page when filtering
            this.fetchOrders();
        }
    },
    computed: {
        filteredOrders() {
            let orders = [...this.listOrders];

            // For client-side filtering when status is 'debt'
            if (this.filterStatus === 'debt') {
                orders = orders.filter(o => o.debt > 0);
            }

            return orders;
        }
    },
    methods: {
        cancelOrder(item) {
            this.orderToCancel = item;
            this.cancelDialog = true;
        },

        confirmCancel() {
            if (!this.orderToCancel) return;
            this.cancelLoading = true;
            orderActions.cancelOrder(this.orderToCancel.id)
                .then(() => {
                    this.$snackbar.success('Hủy đơn nhập hàng thành công!');
                    this.fetchOrders();
                    this.cancelDialog = false;
                })
                .catch(error => {
                    console.error('Cancel error:', error);
                    this.$snackbar.error('Không thể hủy đơn nhập hàng. Vui lòng thử lại.');
                })
                .finally(() => {
                    this.cancelLoading = false;
                    this.orderToCancel = null;
                });
        },

        printInvoice(item) {
            let htmlPrint = null;
            orderActions.printOrder(item.id).then(res => {
                if (res.status === 200) {
                    htmlPrint = res.data;
                    printHtmlContent(htmlPrint);
                    this.$snackbar.success('In phiếu nhập hàng thành công!');
                }
            }).catch(err => {
                this.$snackbar.error('Không thể in phiếu nhập hàng. Vui lòng thử lại.');
            });
        },

        openPaymentDialog(item) {
            this.orderToProcess = item;
            this.paymentDialog = true;
        },

        closePaymentDialog() {
            this.paymentDialog = false;
            this.orderToProcess = null;
            this.paymentForm = {
                price: null,
                type: null,
                note: ''
            };
            this.formattedPaymentPrice = '';
        },

        handlePriceInput(value) {
            // Remove all non-numeric characters first
            const numericValue = value.replace(/\D/g, '');

            // Convert to number (parseInt returns NaN for empty string)
            const numValue = numericValue ? parseInt(numericValue) : 0;

            // Update the actual price value in the form
            this.paymentForm.price = numValue;

            // Format the display value with thousand separators
            this.formattedPaymentPrice = numValue.toLocaleString('vi-VN');

            // Check if the amount exceeds the debt and provide immediate feedback
            if (numValue > this.orderToProcess.debt) {
                // Set the value to the maximum allowed (debt amount)
                this.paymentForm.price = this.orderToProcess.debt;
                this.formattedPaymentPrice = this.orderToProcess.debt.toLocaleString('vi-VN');

                // Show a notification to the user
                this.$snackbar.warning(`Số tiền không được vượt quá công nợ (${this.formatCurrency(this.orderToProcess.debt)})`);
            }
        },

        submitPayment() {
            if (!this.orderToProcess || !this.validPaymentForm) return;
            this.paymentLoading = true;

            const paymentData = {
                order_id: this.orderToProcess.id,
                price: this.paymentForm.price,
                type: this.paymentForm.type,
                note: this.paymentForm.note
            };

            orderActions.processPayment(paymentData)
                .then(() => {
                    this.$snackbar.success('Thanh toán công nợ thành công!');
                    this.fetchOrders();
                    this.closePaymentDialog();
                })
                .catch(error => {
                    console.error('Payment error:', error);
                    this.$snackbar.error('Không thể thanh toán công nợ. Vui lòng thử lại.');
                })
                .finally(() => {
                    this.paymentLoading = false;
                });
        },

        clearFilters() {
            // Clear search timeout if exists
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }

            this.search = '';
            this.filterStatus = 'all';
            this.page = 1;
            this.fetchOrders();
        },

        openExportDialog() {
            this.exportDialog = true;
        },

        fetchOrders() {
            this.tableLoading = true;
            let params = {
                search: this.search,
                per_page: this.perPage,
                page: this.page,
                type: 2  // Key change: type=2 for purchase orders
            };

            if (this.filterStatus !== 'all' && this.filterStatus !== 'debt') {
                params.status = this.filterStatus;
            }

            orderActions.getListOrders(params)
                .then(res => {
                    this.orderMeta = res.data.meta;
                    this.listOrders = res.data.data;
                    this.totalItems = res.data.meta.total || 0;
                })
                .catch(err => {
                    this.$snackbar.error('Không thể tải danh sách đơn nhập hàng');
                    console.error('Error loading orders:', err);
                })
                .finally(() => {
                    this.tableLoading = false;
                });
        },

        // Analytics methods
        getTotalOrders() {
            return this.listOrders.length;
        },

        getNewOrdersCount() {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            return this.listOrders.filter(order => {
                return order.created_at && new Date(order.created_at) > oneMonthAgo;
            }).length || 0;
        },

        getTotalCost() {
            return this.listOrders
                .filter(order => order.status !== 3) // Exclude canceled orders
                .reduce((sum, order) => sum + (order.base_cost || 0), 0);
        },

        getTotalDebt() {
            return this.listOrders.reduce((sum, order) => sum + (order.debt || 0), 0);
        },

        getDebtOrderCount() {
            return this.listOrders.filter(order => order.debt > 0).length;
        },

        getPendingOrdersCount() {
            return this.listOrders.filter(order => order.status === 1).length;
        },

        getStatusColor(status) {
            switch (parseInt(status)) {
                case 1:
                    return 'warning'; // Chờ xử lý
                case 2:
                    return 'success'; // Đã hoàn thành
                case 3:
                    return 'error'; // Đã hủy
                case 5:
                    return 'error';
                default:
                    return 'grey';
            }
        },

        getStatusIcon(status) {
            switch (parseInt(status)) {
                case 1:
                    return 'mdi-clock-outline'; // Chờ xử lý
                case 2:
                    return 'mdi-check-circle'; // Đã hoàn thành
                case 3:
                    return 'mdi-close-circle'; // Đã hủy
                case 4:
                    return 'mdi-package-variant-closed-remove'; // Trả hàng
                default:
                    return 'mdi-help-circle-outline';
            }
        },

        getStatusName(status) {
            switch (parseInt(status)) {
                case 1:
                    return 'Chờ xử lý';
                case 2:
                    return 'Đã hoàn thành';
                case 3:
                    return 'Đã hủy';
                case 5:
                    return 'Đã hủy';
                default:
                    return 'Không xác định';
            }
        },

        getPaymentTypeName(payment) {
            switch (parseInt(payment?.type)) {
                case 1:
                    return 'Tiền mặt';
                case 2:
                    return 'Chuyển khoản';
                case 3:
                    return 'Công nợ';
                default:
                    return 'Không xác định';
            }
        },

        getPaymentTypeIcon(type) {
            switch (parseInt(type)) {
                case 1:
                    return 'mdi-cash';
                case 2:
                    return 'mdi-bank-transfer';
                case 3:
                    return 'mdi-credit-card-clock';
                default:
                    return 'mdi-help-circle-outline';
            }
        },

        getPaymentTypeColor(type) {
            switch (parseInt(type)) {
                case 1:
                    return 'green';
                case 2:
                    return 'blue';
                case 3:
                    return 'orange';
                default:
                    return 'grey';
            }
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

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        },

        formatTime(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        handlePageChange(options) {
            this.page = options.page;
            this.perPage = options.itemsPerPage;
            this.fetchOrders();
        },

        // Phương thức xem chi tiết đơn hàng
        showOrderDetail(item) {
            this.selectedOrderId = item.id;
            this.orderDetailDialog = true;
        },

        // Phương thức sửa đơn hàng
        showUpdateOrder(item) {
            this.selectedOrderId = item.id;
            this.updateOrderDialog = true;
        }
    },
    mounted() {
        this.fetchOrders();
    },
    beforeDestroy() {
        // Clean up timeout to prevent memory leaks
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }
}
</script>

<style scoped>
.order-management {
    min-height: 100%;
}

.stats-card-container {
    background-color: #f9fafb;
    border-radius: 12px;
    overflow: hidden;
}

.stats-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    transition: all 0.3s ease;
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
    background-color: #f5f7fa !important;
    white-space: nowrap;
    padding: 12px 16px !important;
}

.custom-data-table>>>td {
    padding: 12px 16px !important;
}

.custom-data-table>>>tr {
    transition: background-color 0.2s ease;
}

.custom-data-table>>>tr:hover {
    background-color: rgba(33, 150, 243, 0.08) !important;
}

.order-card {
    transition: all 0.3s;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.order-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Enhancements for buttons */
.v-btn.elevation-1 {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
}

.v-btn.elevation-1:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
    transform: translateY(-2px);
}

/* Enhancements for chips */
.v-chip.elevation-1 {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Search field enhancement */
.search-field>>>.v-input__slot {
    background-color: white !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s ease;
}

.search-field>>>.v-input__slot:hover,
.search-field>>>.v-input--is-focused .v-input__slot {
    border-color: #1976d2 !important;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
}
</style>
