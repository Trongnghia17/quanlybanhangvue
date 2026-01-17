<template>
<div class="profit-report">
    <!-- Report Header -->
    <v-card class="mb-6 rounded-lg elevation-2" width="100%">
        <v-card-title class="py-4">
            <h4 class="text-h5 font-weight-medium">Báo cáo lợi nhuận</h4>
        </v-card-title>
        <v-card-subtitle class="pb-0">
            Thống kê chi tiết kết quả kinh doanh theo khoảng thời gian
        </v-card-subtitle>
        <v-divider class="mt-2"></v-divider>

        <!-- Filters -->
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="5" md="6">
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="filters.startDate" label="Từ ngày" prepend-icon="mdi-calendar" readonly outlined dense hide-details v-bind="attrs" v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="filters.startDate" @input="startDateMenu = false" no-title></v-date-picker>
                            </v-menu>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="filters.endDate" label="Đến ngày" prepend-icon="mdi-calendar" readonly outlined dense hide-details v-bind="attrs" v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="filters.endDate" @input="endDateMenu = false" no-title></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="12" sm="3" md="2" class="d-flex align-center">
                    <v-btn color="primary" class="mr-2 text-none rounded-lg" elevation="1" @click="fetchReport">
                        <v-icon left>mdi-filter</v-icon>
                        Lọc
                    </v-btn>
                </v-col>

                <v-col cols="12" sm="3" md="2" class="d-flex align-center">
                    <v-btn color="grey lighten-3" class="text-none rounded-lg" elevation="0" @click="resetFilters">
                        <v-icon left>mdi-refresh</v-icon>
                        Đặt lại
                    </v-btn>
                </v-col>

                <v-col cols="12" sm="3" md="2" class="d-flex align-center">
                    <v-btn color="success" class="text-none rounded-lg" elevation="0" @click="exportToExcel">
                        <v-icon left>mdi-file-excel</v-icon>
                        Xuất Excel
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
            <v-card outlined class="rounded-lg pa-3 blue lighten-5">
                <v-card-text class="pa-2">
                    <div class="d-flex">
                        <div class="stats-icon blue lighten-4 mr-4">
                            <v-icon size="28" color="blue">mdi-cash-register</v-icon>
                        </div>
                        <div>
                            <div class="text-overline blue--text text--darken-1 mb-1">Doanh thu</div>
                            <div class="text-h5 font-weight-bold">
                                {{ formatCurrency(reportData?.revenue_sale || 0) }}
                            </div>
                            <div class="text-caption blue--text text--darken-1">
                                <v-icon small color="blue">mdi-chart-line</v-icon>
                                <span class="ml-1">Tổng doanh thu bán hàng</span>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
            <v-card outlined class="rounded-lg pa-3 green lighten-5">
                <v-card-text class="pa-2">
                    <div class="d-flex">
                        <div class="stats-icon green lighten-4 mr-4">
                            <v-icon size="28" color="green">mdi-cash-plus</v-icon>
                        </div>
                        <div>
                            <div class="text-overline green--text text--darken-1 mb-1">Doanh thu thuần</div>
                            <div class="text-h5 font-weight-bold">
                                {{ formatCurrency(getNetRevenue()) }}
                            </div>
                            <div class="text-caption green--text text--darken-1">
                                <v-icon small color="green">mdi-information-outline</v-icon>
                                <span class="ml-1">Sau khi giảm trừ</span>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
            <v-card outlined class="rounded-lg pa-3 red lighten-5">
                <v-card-text class="pa-2">
                    <div class="d-flex">
                        <div class="stats-icon red lighten-4 mr-4">
                            <v-icon size="28" color="red">mdi-cash-minus</v-icon>
                        </div>
                        <div>
                            <div class="text-overline red--text text--darken-1 mb-1">Chi phí</div>
                            <div class="text-h5 font-weight-bold">
                                {{ formatCurrency(getTotalCost()) }}
                            </div>
                            <div class="text-caption red--text text--darken-1">
                                <v-icon small color="red">mdi-chart-arc</v-icon>
                                <span class="ml-1">Tổng chi phí phát sinh</span>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
            <v-card outlined class="rounded-lg pa-3 amber lighten-5">
                <v-card-text class="pa-2">
                    <div class="d-flex">
                        <div class="stats-icon amber lighten-4 mr-4">
                            <v-icon size="28" color="amber darken-2">mdi-chart-line-variant</v-icon>
                        </div>
                        <div>
                            <div class="text-overline amber--text text--darken-2 mb-1">Lợi nhuận</div>
                            <div class="text-h5 font-weight-bold" :class="getFinalProfit() >= 0 ? 'green--text text--darken-1' : 'red--text'">
                                {{ formatCurrency(getFinalProfit()) }}
                            </div>
                            <div class="text-caption amber--text text--darken-2">
                                <v-icon small color="amber darken-2">mdi-trending-up</v-icon>
                                <span class="ml-1">Tổng lợi nhuận</span>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <!-- Profit Report Detail -->
    <v-card class="rounded-lg elevation-3">
        <v-card-title class="py-3">
            <div>
                <h5 class="text-h6 font-weight-medium mb-1">Chi tiết kết quả kinh doanh</h5>
                <div class="text-caption text-grey">
                    {{ formatDateRange(filters.startDate, filters.endDate) }}
                </div>
            </div>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Profit Details Table -->
        <v-card-text class="profit-details">
            <div class="profit-table">
                <div class="profit-row header">
                    <div class="profit-col description">Khoản mục</div>
                    <div class="profit-col amount">Số tiền</div>
                </div>

                <!-- 1. Revenue -->
                <div class="profit-row section">
                    <div class="profit-col description">1. Doanh thu bán hàng</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.revenue_sale || 0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Doanh thu thực bán</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.revenue_sale || 0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Phí giao hàng thu của khách</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.fee || 0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Giá trị gia tăng (VAT)</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.vat || 0) }}</div>
                </div>

                <!-- 2. Revenue Reduction -->
                <div class="profit-row section">
                    <div class="profit-col description">2. Giảm trừ doanh thu</div>
                    <div class="profit-col amount">{{ formatCurrency(getRevenueReduction()) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Chiết khấu bán hàng</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.discount_sale || 0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Đơn hàng trả lại</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.order_cancel || 0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Quản lý chịu phí giao hàng</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.order_service_fee_manager || 0) }}</div>
                </div>

                <!-- 3. Net Revenue -->
                <div class="profit-row section highlight">
                    <div class="profit-col description">3. Doanh thu thuần (1 - 2)</div>
                    <div class="profit-col amount">{{ formatCurrency(getNetRevenue()) }}</div>
                </div>

                <!-- 4. Cost of Sales -->
                <div class="profit-row section">
                    <div class="profit-col description">4. Chi phí bán hàng</div>
                    <div class="profit-col amount">{{ formatCurrency(getSalesCost()) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Giá vốn bán hàng</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.cost_sale || 0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Thanh toán bằng điểm</div>
                    <div class="profit-col amount">{{ formatCurrency(0) }}</div>
                </div>

                <div class="profit-row subsection">
                    <div class="profit-col description">- Chi phí khác</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.order_service_fee || 0) }}</div>
                </div>

                <!-- 5. Gross Profit -->
                <div class="profit-row section highlight">
                    <div class="profit-col description">5. Lợi nhuận gộp (3 - 4)</div>
                    <div class="profit-col amount">{{ formatCurrency(getGrossProfit()) }}</div>
                </div>

                <!-- 6. Other Income -->
                <div class="profit-row section">
                    <div class="profit-col description">6. Thu nhập khác</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.other_income || 0) }}</div>
                </div>

                <!-- 7. Other Cost -->
                <div class="profit-row section">
                    <div class="profit-col description">7. Chi phí khác</div>
                    <div class="profit-col amount">{{ formatCurrency(reportData?.other_cost || 0) }}</div>
                </div>

                <!-- 8. Other Profit -->
                <div class="profit-row section highlight">
                    <div class="profit-col description">8. Lợi nhuận khác (6 - 7)</div>
                    <div class="profit-col amount">{{ formatCurrency(getOtherProfit()) }}</div>
                </div>

                <!-- 9. Final Profit -->
                <div class="profit-row section final">
                    <div class="profit-col description">9. Lợi nhuận (5 + 8)</div>
                    <div class="profit-col amount" :class="getFinalProfit() >= 0 ? 'positive-amount' : 'negative-amount'">
                        {{ formatCurrency(getFinalProfit()) }}
                    </div>
                </div>
            </div>
        </v-card-text>
    </v-card>

    <!-- Visualization Section -->
    <v-card class="rounded-lg elevation-2 mt-6">
        <v-card-title class="py-3">
            <h5 class="text-h6 font-weight-medium">Biểu đồ phân tích</h5>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
            <v-row>
                <!-- Revenue vs Cost Chart -->
                <v-col cols="12" md="6">
                    <v-card class="pa-4" outlined>
                        <h6 class="text-subtitle-1 font-weight-medium mb-4">Tỷ lệ doanh thu và chi phí</h6>
                        <div class="chart-placeholder">
                            <div class="pie-chart-container">
                                <div class="pie-section revenue" :style="{ '--percentage': getRevenueCostRatio().revenuePercent + '%' }">
                                    <span class="pie-label revenue-label">
                                        Doanh thu<br>{{ getRevenueCostRatio().revenuePercent }}%
                                    </span>
                                </div>
                                <div class="pie-section cost" :style="{ '--percentage': getRevenueCostRatio().costPercent + '%' }">
                                    <span class="pie-label cost-label">
                                        Chi phí<br>{{ getRevenueCostRatio().costPercent }}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-col>

                <!-- Profit Analysis Chart -->
                <v-col cols="12" md="6">
                    <v-card class="pa-4" outlined>
                        <h6 class="text-subtitle-1 font-weight-medium mb-4">Phân tích lợi nhuận</h6>
                        <div class="chart-placeholder">
                            <div class="bar-chart">
                                <div class="bar-container">
                                    <div class="bar-label">Doanh thu thuần</div>
                                    <div class="bar-value">
                                        <div class="bar net-revenue" :style="{ width: '100%' }">
                                            {{ formatCurrency(getNetRevenue()) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="bar-container">
                                    <div class="bar-label">Chi phí bán hàng</div>
                                    <div class="bar-value">
                                        <div class="bar cost-sale" :style="{ width: (getSalesCost() / getNetRevenue() * 100) + '%' }">
                                            {{ formatCurrency(getSalesCost()) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="bar-container">
                                    <div class="bar-label">Lợi nhuận gộp</div>
                                    <div class="bar-value">
                                        <div class="bar gross-profit" :style="{ width: (getGrossProfit() / getNetRevenue() * 100) + '%' }">
                                            {{ formatCurrency(getGrossProfit()) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="bar-container">
                                    <div class="bar-label">Lợi nhuận ròng</div>
                                    <div class="bar-value">
                                        <div class="bar final-profit" :class="{'negative': getFinalProfit() < 0}" :style="{ width: Math.abs(getFinalProfit() / getNetRevenue() * 100) + '%' }">
                                            {{ formatCurrency(getFinalProfit()) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</div>
</template>

<script>
import reportModule from '@/api/report'
const reportActions = reportModule.actions

export default {
    name: "ProfitReport",
    data() {
        return {
            reportData: null,
            tableLoading: false,
            startDateMenu: false,
            endDateMenu: false,
            filters: {
                startDate: this.getDefaultStartDate(),
                endDate: this.getDefaultEndDate(),
            }
        }
    },
    methods: {
        fetchReport() {
            this.tableLoading = true;
            const params = {
                start_date: this.filters.startDate,
                end_date: this.filters.endDate
            };

            reportActions.getProfitLossReport(params)
                .then(res => {
                    this.reportData = res.data.data;
                })
                .catch(err => {
                    this.$snackbar.error('Không thể tải dữ liệu báo cáo lợi nhuận');
                    console.error('Error fetching profit report:', err);
                })
                .finally(() => {
                    this.tableLoading = false;
                });
            this.reportData = this.getFakeReportData(); // For testing purposes
        },
        // Add this method to your component to generate fake data
        getFakeReportData() {
            // Generate some random but realistic numbers
            const revenue_sale = Math.floor(Math.random() * 500000000) + 500000000; // 500M - 1B VND
            const cost_percentage = 0.6 + (Math.random() * 0.2); // 60-80% of revenue

            return {
                // Revenue data
                revenue_sale: revenue_sale,
                fee: Math.floor(revenue_sale * 0.02),
                vat: Math.floor(revenue_sale * 0.1),

                // Reductions
                discount_sale: Math.floor(revenue_sale * 0.03),
                order_cancel: Math.floor(revenue_sale * 0.02),
                order_service_fee_manager: Math.floor(revenue_sale * 0.01),

                // Costs
                cost_sale: Math.floor(revenue_sale * cost_percentage),
                order_service_fee: Math.floor(revenue_sale * 0.05),

                // Other financials
                other_income: Math.floor(revenue_sale * 0.01),
                other_cost: Math.floor(revenue_sale * 0.02)
            };
        },

        resetFilters() {
            this.filters.startDate = this.getDefaultStartDate();
            this.filters.endDate = this.getDefaultEndDate();
            this.fetchReport();
        },

        getDefaultStartDate() {
            const date = new Date();
            date.setDate(1); // First day of current month
            return date.toISOString().substr(0, 10);
        },

        getDefaultEndDate() {
            return new Date().toISOString().substr(0, 10); // Today
        },

        formatDateRange(startDate, endDate) {
            if (!startDate || !endDate) return 'Tất cả thời gian';
            return `Từ ${this.formatDate(startDate)} đến ${this.formatDate(endDate)}`;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        },

        formatCurrency(value) {
            if (value === null || value === undefined) return '0 ₫';
            return value.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
            });
        },

        // Calculation methods based on the provided formula
        getRevenueReduction() {
            const {
                discount_sale = 0, order_cancel = 0, order_service_fee_manager = 0
            } = this.reportData || {};
            return discount_sale + order_cancel + order_service_fee_manager;
        },

        getNetRevenue() {
            const {
                revenue_sale = 0
            } = this.reportData || {};
            return revenue_sale - this.getRevenueReduction();
        },

        getSalesCost() {
            const {
                cost_sale = 0, order_service_fee = 0
            } = this.reportData || {};
            return cost_sale + order_service_fee;
        },

        getGrossProfit() {
            return this.getNetRevenue() - this.getSalesCost();
        },

        getOtherProfit() {
            const {
                other_income = 0, other_cost = 0
            } = this.reportData || {};
            return other_income - other_cost;
        },

        getFinalProfit() {
            return this.getGrossProfit() + this.getOtherProfit();
        },

        getTotalCost() {
            const {
                cost_sale = 0, order_service_fee = 0, other_cost = 0
            } = this.reportData || {};
            return cost_sale + order_service_fee + other_cost;
        },

        getRevenueCostRatio() {
            const netRevenue = this.getNetRevenue();
            const totalCost = this.getTotalCost();
            const total = netRevenue + totalCost;

            if (total === 0) return {
                revenuePercent: 50,
                costPercent: 50
            };

            const revenuePercent = Math.round((netRevenue / total) * 100);
            const costPercent = 100 - revenuePercent;

            return {
                revenuePercent,
                costPercent
            };
        },

        exportToExcel() {
            this.$snackbar.info('Tính năng xuất Excel đang được phát triển');
        }
    },
    mounted() {
        this.fetchReport();
    }
}
</script>

<style scoped>
.profit-report {
    min-height: 100%;
}

.stats-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 12px;
}

/* Profit Details Table */
.profit-details {
    padding: 1rem;
}

.profit-table {
    width: 100%;
    margin-bottom: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    overflow: hidden;
}

.profit-row {
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.profit-row:last-child {
    border-bottom: none;
}

.profit-col {
    padding: 1rem;
}

.profit-col.description {
    flex: 3;
    display: flex;
    align-items: center;
}

.profit-col.amount {
    flex: 1;
    text-align: right;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.profit-row.header {
    background-color: #f5f5f5;
    font-weight: 600;
}

.profit-row.section {
    background-color: rgba(0, 0, 0, 0.02);
    font-weight: 600;
}

.profit-row.subsection .description {
    padding-left: 2.5rem;
}

.profit-row.highlight {
    background-color: #e3f2fd;
    color: #1976d2;
}

.profit-row.final {
    background-color: #e8f5e9;
    color: #2e7d32;
    font-weight: 700;
    font-size: 1.1rem;
}

.positive-amount {
    color: #2e7d32;
}

.negative-amount {
    color: #d32f2f;
}

/* Chart Styles */
.chart-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pie-chart-container {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #f5f5f5;
}

.pie-section {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pie-section.revenue {
    background-color: #4caf50;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
    clip-path: polygon(50% 0, 50% 50%, calc(50% + 50 * var(--percentage) / 100) 50%);
}

.pie-section.cost {
    background-color: #f44336;
    clip-path: polygon(50% 0, 0 0, 0 100%, 50% 100%);
    clip-path: polygon(50% 0, 50% 50%, calc(50% - 50 * var(--percentage) / 100) 50%);
}

.pie-label {
    position: absolute;
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 4px 8px;
    border-radius: 4px;
}

.revenue-label {
    top: 50px;
    right: 40px;
}

.cost-label {
    top: 50px;
    left: 40px;
}

/* Bar Chart */
.bar-chart {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.bar-container {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.bar-label {
    width: 120px;
    font-size: 14px;
    font-weight: 500;
}

.bar-value {
    flex: 1;
    height: 30px;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
}

.bar {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 8px;
    color: white;
    font-weight: 500;
    font-size: 12px;
    transition: width 0.5s ease;
}

.bar.net-revenue {
    background-color: #2196f3;
}

.bar.cost-sale {
    background-color: #f44336;
}

.bar.gross-profit {
    background-color: #4caf50;
}

.bar.final-profit {
    background-color: #ff9800;
}

.bar.final-profit.negative {
    background-color: #d32f2f;
}
</style>
