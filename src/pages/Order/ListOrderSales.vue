<template>
<div class="order-management">
    <!-- Main Content Area -->
    <div class="d-flex flex-wrap">
        <!-- Stats Cards -->
        <v-card class="mb-6 rounded-lg elevation-2 stats-card-container" width="100%">
            <v-row class="ma-0">
                <v-col cols="12" sm="6" md="3" class="pa-3">
                    <v-card outlined class="rounded-lg pa-3 blue lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon blue lighten-4 mr-4">
                                    <v-icon size="28" color="blue">mdi-receipt</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline blue--text text--darken-1 mb-1">Tổng đơn hàng</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ orderMeta.total }}
                                    </div>
                                    <div class="text-caption blue--text text--darken-1">
                                        <v-icon small color="blue">mdi-trending-up</v-icon>
                                        <span class="ml-1">+{{ formatNumber(getNewOrdersCount()) }} trong tháng này</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="3" class="pa-3">
                    <v-card outlined class="rounded-lg pa-3 green lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon green lighten-4 mr-4">
                                    <v-icon size="28" color="green">mdi-cash-multiple</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline green--text text--darken-1 mb-1">Doanh thu</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ formatCurrency(getTotalRevenue()) }}
                                    </div>
                                    <div class="text-caption green--text text--darken-1">
                                        <v-icon small color="green">mdi-information-outline</v-icon>
                                        <span class="ml-1">Doanh thu thuần</span>
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
                                    <div class="text-overline amber--text text--darken-2 mb-1">Công nợ</div>
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
                    <v-card outlined class="rounded-lg pa-3 purple lighten-5">
                        <v-card-text class="pa-2">
                            <div class="d-flex">
                                <div class="stats-icon purple lighten-4 mr-4">
                                    <v-icon size="28" color="purple">mdi-package-variant-closed</v-icon>
                                </div>
                                <div>
                                    <div class="text-overline purple--text text--darken-1 mb-1">Đơn hàng chưa hoàn thành</div>
                                    <div class="text-h5 font-weight-bold">
                                        {{ formatNumber(getPendingOrdersCount()) }}
                                    </div>
                                    <div class="text-caption purple--text text--darken-1">
                                        <v-icon small color="purple">mdi-clock-outline</v-icon>
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
                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm theo Mã đơn/Tên khách hàng/SĐT" single-line hide-details outlined dense clearable class="search-field"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-select v-model="filterStatus" :items="statusFilterOptions" label="Lọc theo trạng thái" outlined dense hide-details></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="4" class="d-flex justify-end align-center">
                    <v-btn color="grey lighten-3" class="mr-2 text-none rounded-lg" elevation="0" @click="openExportDialog">
                        <v-icon left small>mdi-file-export</v-icon>
                        Xuất Excel
                    </v-btn>

                    <v-btn color="primary" dark :to="'/order-sales'" class="px-4 font-weight-medium text-none rounded-lg" elevation="2">
                        <v-icon left>mdi-plus</v-icon>
                        Tạo đơn hàng mới
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
                    <div v-if="item.shipping_code" class="text-caption grey--text d-flex align-center mt-1">
                        <v-icon x-small color="grey lighten-1" class="mr-1">mdi-truck-delivery</v-icon>
                        <span>Ship: {{ item.shipping_code }}</span>
                    </div>
                </div>
            </template>

            <template v-slot:item.customer="{ item }">
                <div>
                    <div class="font-weight-medium d-flex align-center">
                        <v-icon x-small :color="item.customer_id ? 'blue lighten-1' : 'grey'" class="mr-1">mdi-account</v-icon>
                        <span :class="{'grey--text': !item.customer_id}">{{ item.name || 'Chưa có khách hàng' }}</span>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon x-small :color="item.customer_id ? 'info' : 'success'" class="ml-1" v-bind="attrs" v-on="on">
                                    <v-icon x-small>{{ item.customer_id ? 'mdi-dots-vertical' : 'mdi-plus' }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list dense>
                                <v-list-item v-if="item.customer_id" @click="editCustomerFromOrder(item)">
                                    <v-list-item-icon class="mr-2">
                                        <v-icon small color="info">mdi-pencil</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>Sửa thông tin</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="openChangeCustomerDialog(item)">
                                    <v-list-item-icon class="mr-2">
                                        <v-icon small :color="item.customer_id ? 'orange' : 'success'">
                                            {{ item.customer_id ? 'mdi-account-switch' : 'mdi-account-plus' }}
                                        </v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>
                                        {{ item.customer_id ? 'Đổi khách hàng' : 'Thêm khách hàng' }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                    <div class="text-caption d-flex align-center mt-1" v-if="item.phone">
                        <v-icon x-small color="grey lighten-1" class="mr-1">mdi-phone</v-icon>
                        <span>{{ item.phone }}</span>
                    </div>
                    <div v-if="item.address" class="text-caption d-flex align-center mt-1" style="max-width: 150px">
                        <v-icon x-small color="grey lighten-1" class="mr-1">mdi-map-marker</v-icon>
                        <span class="text-truncate">{{ item.address }}</span>
                    </div>
                </div>
            </template>

            <template v-slot:item.type="{ item }">
                <v-chip :color="getOrderTypeColor(item.type)" text-color="white" small pill elevation="1" class="px-3 py-1">
                    <v-icon left x-small>{{ getOrderTypeIcon(item.type) }}</v-icon>
                    {{ getOrderTypeName(item.type) }}
                </v-chip>
                <div class="mt-2">
                    <v-chip v-if="item.is_retail" color="teal" text-color="white" small pill elevation="1" class="px-3 py-1">
                        <v-icon left x-small>mdi-cart</v-icon>
                        Bán lẻ
                    </v-chip>
                    <v-chip v-else color="indigo" text-color="white" small pill elevation="1" class="px-3 py-1">
                        <v-icon left x-small>mdi-package-variant</v-icon>
                        Bán sỉ
                    </v-chip>
                </div>
            </template>

            <template v-slot:item.payment_type="{ item }">
                <div class="d-flex align-center">
                    <v-icon small :color="getPaymentTypeColor(item.order_payment?.[0]?.type)" class="mr-1">{{ getPaymentTypeIcon(item.order_payment?.[0]?.type) }}</v-icon>
                    <span>{{ getPaymentTypeName(item.order_payment?.[0]) }}</span>
                </div>
            </template>

            <template v-slot:item.retail_cost="{ item }">
                <div class="font-weight-medium green--text text--darken-1">{{ formatCurrency(item.retail_cost) }}</div>
                <div v-if="item.discount > 0" class="text-caption d-flex align-center mt-1">
                    <v-icon x-small color="orange" class="mr-1">mdi-tag-off</v-icon>
                    <span>Giảm: {{ item.discount_type === 1 ? `${item.discount}%` : formatCurrency(item.discount) }}</span>
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
                <div v-if="item.is_refund" class="mt-2">
                    <v-chip color="orange" text-color="white" small pill elevation="1" class="px-3 py-1">
                        <v-icon left x-small>mdi-undo-variant</v-icon>
                        Đã hoàn trả
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
                            <v-btn icon small color="primary" class="mr-2" v-bind="attrs" v-on="on" @click="viewOrderDetail(item)" elevation="1">
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                        </template>
                        <span>Xem chi tiết</span>
                    </v-tooltip>

                    <v-tooltip bottom v-if="item.status === 1">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon small color="teal" class="mr-2" v-bind="attrs" v-on="on" @click="editOrder(item)" elevation="1">
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
                        <span>In hóa đơn</span>
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
                    <div class="text-h6 grey--text text--darken-1 mb-2">Chưa có đơn hàng nào</div>
                    <div class="text-body-2 grey--text mb-4">Tạo đơn hàng mới để bắt đầu quản lý bán hàng</div>
                    <v-btn color="primary" class="px-5" outlined :to="'/order-sales'">
                        <v-icon left>mdi-plus</v-icon>
                        Tạo đơn hàng mới
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
                                <div class="d-flex align-center">
                                    <v-icon small color="blue" class="mr-1">mdi-receipt</v-icon>
                                    <span class="primary--text">{{ item.code }}</span>
                                </div>
                                <v-chip :color="getStatusColor(item.status)" text-color="white" small pill elevation="1" class="px-2">
                                    <v-icon left x-small>{{ getStatusIcon(item.status) }}</v-icon>
                                    {{ getStatusName(item.status) }}
                                </v-chip>
                            </div>
                        </v-card-title>

                        <v-card-subtitle class="pb-0 pt-1 d-flex justify-space-between">
                            <div class="d-flex align-center">
                                <v-icon x-small color="grey" class="mr-1">mdi-calendar</v-icon>
                                <span class="grey--text">{{ formatDate(item.created_at) }}</span>
                            </div>
                            <span class="font-weight-bold green--text">
                                {{ formatCurrency(item.retail_cost) }}
                            </span>
                        </v-card-subtitle>

                        <v-divider class="mx-4 my-2"></v-divider>

                        <v-card-text class="py-2">
                            <div class="d-flex align-center mb-2">
                                <v-icon size="18" class="mr-2" :class="item.customer_id ? 'blue--text' : 'grey--text'">mdi-account</v-icon>
                                <div class="flex-grow-1">
                                    <div class="d-flex align-center">
                                        <div class="font-weight-medium" :class="{'grey--text': !item.customer_id}">
                                            {{ item.name || 'Chưa có khách hàng' }}
                                        </div>
                                        <v-menu offset-y>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn icon x-small :color="item.customer_id ? 'info' : 'success'" class="ml-1" v-bind="attrs" v-on="on">
                                                    <v-icon x-small>{{ item.customer_id ? 'mdi-dots-vertical' : 'mdi-plus' }}</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list dense>
                                                <v-list-item v-if="item.customer_id" @click="editCustomerFromOrder(item)">
                                                    <v-list-item-icon class="mr-2">
                                                        <v-icon small color="info">mdi-pencil</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-title>Sửa thông tin</v-list-item-title>
                                                </v-list-item>
                                                <v-list-item @click="openChangeCustomerDialog(item)">
                                                    <v-list-item-icon class="mr-2">
                                                        <v-icon small :color="item.customer_id ? 'orange' : 'success'">
                                                            {{ item.customer_id ? 'mdi-account-switch' : 'mdi-account-plus' }}
                                                        </v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-title>
                                                        {{ item.customer_id ? 'Đổi khách hàng' : 'Thêm khách hàng' }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </div>
                                    <div class="text-caption d-flex align-center" v-if="item.phone">
                                        <v-icon x-small color="grey" class="mr-1">mdi-phone</v-icon>
                                        {{ item.phone }}
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex align-center mb-2" v-if="item.address">
                                <v-icon size="18" class="mr-2 grey--text">mdi-map-marker</v-icon>
                                <span class="text-caption text-truncate">{{ item.address }}</span>
                            </div>

                            <div class="d-flex justify-space-between mt-3">
                                <div>
                                    <v-chip :color="getOrderTypeColor(item.type)" text-color="white" small pill elevation="1" class="px-2 mb-1 mr-1">
                                        <v-icon left x-small>{{ getOrderTypeIcon(item.type) }}</v-icon>
                                        {{ getOrderTypeName(item.type) }}
                                    </v-chip>
                                    <v-chip :color="item.is_retail ? 'teal' : 'indigo'" text-color="white" small pill elevation="1" class="px-2 mb-1">
                                        <v-icon left x-small>{{ item.is_retail ? 'mdi-cart' : 'mdi-package-variant' }}</v-icon>
                                        {{ item.is_retail ? 'Bán lẻ' : 'Bán sỉ' }}
                                    </v-chip>
                                </div>

                                <div v-if="item.debt > 0" class="red--text text-right">
                                    <div class="text-caption d-flex align-center justify-end">
                                        <v-icon x-small color="red" class="mr-1">mdi-alert-circle</v-icon>
                                        Công nợ
                                    </div>
                                    <div>{{ formatCurrency(item.debt) }}</div>
                                </div>
                            </div>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-btn small text color="primary" @click="viewOrderDetail(item)">
                                <v-icon small left>mdi-eye</v-icon>
                                Chi tiết
                            </v-btn>

                            <v-btn small text color="amber darken-2" @click="printInvoice(item)">
                                <v-icon small left>mdi-printer</v-icon>
                                In
                            </v-btn>

                            <v-spacer></v-spacer>

                            <v-btn small text color="teal" @click="editOrder(item)">
                                <v-icon small left>mdi-pencil</v-icon>
                                Sửa
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>

                <v-col cols="12" v-if="filteredOrders.length === 0">
                    <v-card flat class="pa-8 text-center mx-auto" max-width="500">
                        <v-img src="https://cdn.vuetifyjs.com/images/lists/no-results.svg" max-width="200" class="mx-auto mb-4"></v-img>
                        <div class="text-h6 grey--text text--darken-1 mb-2">Không tìm thấy đơn hàng nào</div>
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

    <!-- Order Detail Dialog -->
    <order-detail
      :open="detailDialog"
      @toggle="detailDialog = false"
      :orderId="selectedOrderId"
    />

    <!-- Order Update Dialog -->
    <update-order
      :open="updateDialog"
      @toggle="updateDialog = false"
      :orderId="selectedOrderForUpdate"
      @refresh="fetchOrders"
    />

    <!-- Cancel Order Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400" persistent>
        <v-card class="rounded-lg">
            <v-card-title class="headline error--text">
                <v-icon left color="error" size="24">mdi-alert-circle</v-icon>
                Xác nhận hủy đơn
            </v-card-title>
            <v-card-text class="py-3">
                <p class="text-subtitle-1">Bạn có chắc chắn muốn hủy đơn hàng <strong>{{ orderToCancel?.code }}</strong>?</p>
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
                        <div class="text-subtitle-1">Mã đơn hàng:</div>
                        <div class="font-weight-bold">{{ orderToProcess.code }}</div>
                    </div>

                    <div class="d-flex justify-space-between mb-4">
                        <div class="text-subtitle-1">Tổng tiền:</div>
                        <div class="font-weight-bold">{{ formatCurrency(orderToProcess.retail_cost) }}</div>
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

    <!-- Export Orders Dialog -->
    <export-orders-dialog
        :open="exportDialog"
        @toggle="exportDialog = false"
    />

    <!-- Update Customer Dialog -->
    <update-customer
        :open="updateCustomerDialog"
        @toggle="updateCustomerDialog = false"
        :customer="selectedCustomer"
        @refresh="handleCustomerUpdate"
    />

    <!-- Change Customer Dialog -->
    <v-dialog v-model="changeCustomerDialog" max-width="600" persistent>
        <v-card class="rounded-lg">
            <v-card-title class="headline" :class="orderToChangeCustomer?.customer_id ? 'orange--text' : 'success--text'">
                <v-icon left :color="orderToChangeCustomer?.customer_id ? 'orange' : 'success'" size="24">
                    {{ orderToChangeCustomer?.customer_id ? 'mdi-account-switch' : 'mdi-account-plus' }}
                </v-icon>
                {{ orderToChangeCustomer?.customer_id ? 'Đổi khách hàng cho đơn hàng' : 'Thêm khách hàng cho đơn hàng' }}
            </v-card-title>
            <v-card-text class="py-4">
                <div v-if="orderToChangeCustomer">
                    <div class="mb-4 pa-3 rounded" :class="orderToChangeCustomer.customer_id ? 'blue lighten-5' : 'grey lighten-4'">
                        <div class="text-subtitle-2 mb-2">Đơn hàng hiện tại:</div>
                        <div class="font-weight-bold">{{ orderToChangeCustomer.code }}</div>
                        <div class="text-caption" v-if="orderToChangeCustomer.customer_id">
                            Khách hàng hiện tại: <strong>{{ orderToChangeCustomer.name }}</strong>
                        </div>
                        <div class="text-caption grey--text" v-else>
                            <v-icon x-small color="grey">mdi-alert-circle-outline</v-icon>
                            Đơn hàng chưa có khách hàng
                        </div>
                    </div>

                    <v-autocomplete
                        v-model="newCustomerId"
                        :items="customerList"
                        item-text="name"
                        item-value="id"
                        :label="orderToChangeCustomer.customer_id ? 'Chọn khách hàng mới' : 'Chọn khách hàng'"
                        placeholder="Gõ tên hoặc SĐT để tìm kiếm..."
                        :hint="orderToChangeCustomer.customer_id ? 'Gõ ít nhất 2 ký tự để tìm kiếm, hoặc xóa để xem tất cả' : 'Chọn khách hàng để gán cho đơn hàng này'"
                        persistent-hint
                        outlined
                        dense
                        :loading="loadingCustomers"
                        :search-input.sync="customerSearch"
                        clearable
                        prepend-icon="mdi-account-search"
                        :rules="[v => !!v || 'Vui lòng chọn khách hàng']"
                        no-data-text="Không tìm thấy khách hàng"
                    >
                        <template v-slot:append-outer>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        small
                                        color="primary"
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="searchCustomers('')"
                                        :loading="loadingCustomers"
                                    >
                                        <v-icon small>mdi-refresh</v-icon>
                                    </v-btn>
                                </template>
                                <span>Tải lại danh sách</span>
                            </v-tooltip>
                        </template>
                        <template v-slot:item="{ item }">
                            <v-list-item-content>
                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-icon x-small class="mr-1">mdi-phone</v-icon>
                                    {{ item.phone }}
                                    <span v-if="item.email" class="ml-2">
                                        <v-icon x-small class="mr-1">mdi-email</v-icon>
                                        {{ item.email }}
                                    </span>
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </template>
                        <template v-slot:selection="{ item }">
                            <v-chip small color="primary" text-color="white">
                                <v-icon left small>mdi-account</v-icon>
                                {{ item.name }}
                            </v-chip>
                        </template>
                    </v-autocomplete>

                    <v-alert type="warning" text dense class="mt-2" v-if="orderToChangeCustomer.customer_id">
                        <small>Lưu ý: Sau khi đổi khách hàng, thông tin đơn hàng (tên, SĐT, địa chỉ) sẽ được cập nhật theo khách hàng mới.</small>
                    </v-alert>
                    <v-alert type="info" text dense class="mt-2" v-else>
                        <small>Thông tin khách hàng (tên, SĐT, địa chỉ) sẽ được cập nhật vào đơn hàng.</small>
                    </v-alert>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="grey darken-1" @click="closeChangeCustomerDialog" :disabled="changingCustomer">
                    Hủy
                </v-btn>
                <v-btn
                    :color="orderToChangeCustomer?.customer_id ? 'orange' : 'success'"
                    :loading="changingCustomer"
                    @click="confirmChangeCustomer"
                    :disabled="!newCustomerId"
                    class="px-4 white--text"
                >
                    <v-icon left>mdi-check</v-icon>
                    {{ orderToChangeCustomer?.customer_id ? 'Xác nhận đổi' : 'Xác nhận thêm' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
import orderModule from '@/api/order'
const orderActions = orderModule.actions
import customerModule from '@/api/customers'
const customerActions = customerModule.actions
import {
    printHtmlContent
} from '../../utils/print'
import OrderDetail from '@/components/Dialogs/Orders/OrderDetail.vue'
import UpdateOrder from '@/components/Dialogs/Orders/UpdateOrder.vue'
import ExportOrdersDialog from '@/components/Dialogs/Orders/ExportOrdersDialog.vue'
import UpdateCustomer from '@/components/Dialogs/Customers/Update.vue'

export default {
    components: {
        OrderDetail,
        UpdateOrder,
        ExportOrdersDialog,
        UpdateCustomer
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

            // Search debouncing
            searchTimeout: null,

            headers: [{
                    text: 'Mã đơn hàng',
                    value: 'code',
                    width: '100px'
                },
                {
                    text: 'Khách hàng',
                    value: 'customer',
                    width: '100px'
                },
                {
                    text: 'Phương thức',
                    value: 'payment_type',
                    width: '120px'
                },
                {
                    text: 'Tổng tiền',
                    value: 'retail_cost',
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
                    text: 'Tất cả đơn hàng',
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
                {
                    text: 'Trả hàng',
                    value: '4'
                },
                {
                    text: 'Hủy sau hoàn thành',
                    value: '5'
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
            formattedPaymentPrice: '',

            // Order detail dialog
            detailDialog: false,
            selectedOrderId: null,

            // Order update dialog
            updateDialog: false,
            selectedOrderForUpdate: null,

            // Export orders dialog
            exportDialog: false,

            // Customer update dialog
            updateCustomerDialog: false,
            selectedCustomer: null,

            // Change customer dialog
            changeCustomerDialog: false,
            orderToChangeCustomer: null,
            newCustomerId: null,
            customerList: [],
            customerSearch: null,
            loadingCustomers: false,
            changingCustomer: false,
            customerSearchTimeout: null
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
        },

        // Watch for customer search input
        customerSearch(val) {
            // Clear existing timeout
            if (this.customerSearchTimeout) {
                clearTimeout(this.customerSearchTimeout);
            }

            // Set new timeout for debounced search
            this.customerSearchTimeout = setTimeout(() => {
                // Load customers when typing (min 2 chars) or when cleared (empty)
                if ((val && val.length >= 2) || val === '' || val === null) {
                    this.searchCustomers(val || '');
                }
            }, 300); // 300ms delay
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
                    this.$snackbar.success('Hủy đơn hàng thành công!');
                    this.fetchOrders();
                    this.cancelDialog = false;
                })
                .catch(error => {
                    console.error('Cancel error:', error);
                    this.$snackbar.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
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
                    this.$snackbar.success('In hóa đơn thành công!');
                }
            }).catch(err => {
                this.$snackbar.error('Không thể in hóa đơn. Vui lòng thử lại.');
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

        viewOrderDetail(item) {
            this.selectedOrderId = item.id;
            this.detailDialog = true;
        },

        editOrder(item) {
            this.selectedOrderForUpdate = item.id;
            this.updateDialog = true;
        },

        editCustomer(customer) {
            this.selectedCustomer = customer;
            this.updateCustomerDialog = true;
        },

        async editCustomerFromOrder(order) {
            if (!order.customer_id) {
                this.$snackbar.warning('Đơn hàng này chưa có khách hàng. Vui lòng thêm khách hàng trước.');
                return;
            }

            try {
                // Fetch customer data by ID
                const response = await customerActions.getCustomerById(order.customer_id);
                
                if (response.status === 200) {
                    // Check if data is nested in response
                    const customerData = response.data.data || response.data;
                    
                    if (customerData && customerData.id) {
                        this.selectedCustomer = customerData;
                        this.updateCustomerDialog = true;
                    } else {
                        this.$snackbar.error('Không tìm thấy thông tin khách hàng');
                    }
                } else {
                    this.$snackbar.error('Không tìm thấy thông tin khách hàng');
                }
            } catch (error) {
                console.error('Error fetching customer:', error);
                this.$snackbar.error('Không thể tải thông tin khách hàng. Vui lòng thử lại.');
            }
        },

        handleCustomerUpdate() {
            // Refresh orders list to get updated customer information
            this.fetchOrders();
            this.$snackbar.success('Cập nhật thông tin khách hàng thành công!');
        },

        openChangeCustomerDialog(order) {
            this.orderToChangeCustomer = order;
            this.newCustomerId = null;
            this.customerList = [];
            this.changeCustomerDialog = true;
            // Load initial customers
            this.searchCustomers('');
        },

        closeChangeCustomerDialog() {
            this.changeCustomerDialog = false;
            this.orderToChangeCustomer = null;
            this.newCustomerId = null;
            this.customerList = [];
            this.customerSearch = null;
        },

        async searchCustomers(searchTerm) {
            this.loadingCustomers = true;
            try {
                const params = {
                    per_page: 100 // Increase to get more results
                };
                
                // Only add search param if searchTerm is not empty
                if (searchTerm && searchTerm.trim() !== '') {
                    params.search = searchTerm.trim();
                }
                
                const response = await customerActions.getCustomers(params);
                
                if (response.status === 200) {
                    // Handle both nested and flat response structures
                    const data = response.data.data || response.data;
                    this.customerList = Array.isArray(data) ? data : [];
                    
                    if (this.customerList.length === 0 && searchTerm) {
                        this.$snackbar.info(`Không tìm thấy khách hàng với từ khóa "${searchTerm}"`);
                    }
                }
            } catch (error) {
                console.error('Error loading customers:', error);
                this.$snackbar.error('Không thể tải danh sách khách hàng');
                this.customerList = [];
            } finally {
                this.loadingCustomers = false;
            }
        },

        async confirmChangeCustomer() {
            if (!this.orderToChangeCustomer || !this.newCustomerId) return;

            this.changingCustomer = true;
            try {
                // Call new API endpoint to change customer
                const payload = {
                    order_id: this.orderToChangeCustomer.id,
                    customer_id: this.newCustomerId
                };

                const response = await orderActions.changeCustomer(payload);

                if (response.status === 200) {
                    const successMessage = this.orderToChangeCustomer.customer_id 
                        ? 'Đổi khách hàng thành công!' 
                        : 'Thêm khách hàng thành công!';
                    this.$snackbar.success(successMessage);
                    this.fetchOrders();
                    this.closeChangeCustomerDialog();
                } else {
                    this.$snackbar.error('Không thể cập nhật khách hàng');
                }
            } catch (error) {
                console.error('Error changing customer:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    this.$snackbar.error(error.response.data.message);
                } else {
                    this.$snackbar.error('Không thể cập nhật khách hàng. Vui lòng thử lại.');
                }
            } finally {
                this.changingCustomer = false;
            }
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
                type: 1
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
                    this.$snackbar.error('Không thể tải danh sách đơn hàng');
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

        getTotalRevenue() {
            return this.listOrders
                .filter(order => order.status !== 3) // Exclude canceled orders
                .reduce((sum, order) => sum + (order.retail_cost || 0), 0);
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
                case 4:
                    return 'info'; // Trả hàng
                case 5:
                    return 'error'; // Hủy sau hoàn thành
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
                    return 'mdi-keyboard-return'; // Trả hàng
                case 5:
                    return 'mdi-package-variant-closed-remove'; // Hủy sau hoàn thành
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
                case 4:
                    return 'Trả hàng';
                case 5:
                    return 'Hủy sau hoàn thành';
                default:
                    return 'Không xác định';
            }
        },

        getOrderTypeColor(type) {
            switch (parseInt(type)) {
                case 1:
                    return 'purple'; // Sale
                case 2:
                    return 'deep-orange'; // Return
                default:
                    return 'grey';
            }
        },

        getOrderTypeIcon(type) {
            switch (parseInt(type)) {
                case 1:
                    return 'mdi-basket'; // Bán hàng
                case 2:
                    return 'mdi-keyboard-return'; // Trả hàng
                default:
                    return 'mdi-help-circle-outline';
            }
        },

        getOrderTypeName(type) {
            switch (parseInt(type)) {
                case 1:
                    return 'Bán hàng';
                case 2:
                    return 'Trả hàng';
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
                    return 'COD';
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
                    return 'mdi-truck-delivery';
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
                    return 'purple';
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

        validatePaymentAmount() {
            if (this.paymentForm.price > this.orderToProcess.debt) {
                this.paymentForm.price = this.orderToProcess.debt;
            }
        },

        handlePriceInput(value) {
            const numericValue = value.replace(/\D/g, '');
            const numValue = numericValue ? parseInt(numericValue) : 0;
            this.paymentForm.price = numValue;
            this.formattedPaymentPrice = numValue.toLocaleString('vi-VN');

            if (numValue > this.orderToProcess.debt) {
                this.paymentForm.price = this.orderToProcess.debt;
                this.formattedPaymentPrice = this.orderToProcess.debt.toLocaleString('vi-VN');
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
            };

            orderActions.paymentOrder(paymentData)
                .then(() => {
                    this.$snackbar.success('Thanh toán thành công!');
                    this.fetchOrders();
                    this.closePaymentDialog();
                })
                .catch(error => {
                    console.error('Payment error:', error);
                    this.$snackbar.error('Không thể thanh toán. Vui lòng thử lại.');
                })
                .finally(() => {
                    this.paymentLoading = false;
                });
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
        if (this.customerSearchTimeout) {
            clearTimeout(this.customerSearchTimeout);
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

.stats-icon:hover {
    transform: scale(1.05);
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
