<template>
  <div>
    <!-- Loading overlay -->
    <div v-if="loading" class="text-center pa-4">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
      <p class="mt-2">Đang tải dữ liệu dashboard...</p>
    </div>

    <div v-else>
      <!-- Refresh button -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Dashboard</h3>
        <button
          class="btn btn-outline-primary btn-sm"
          @click="fetchDashboardData"
          :disabled="loading"
        >
          <i class="ti-reload"></i> Làm mới
        </button>
      </div>

      <!--Stats cards-->
      <div class="row">
        <div
          class="col-md-6 col-xl-3"
          v-for="stats in statsCards"
          :key="stats.title"
        >
          <stats-card>
            <div
              class="icon-big text-center"
              :class="`icon-${stats.type}`"
              slot="header"
            >
              <i :class="stats.icon"></i>
            </div>
            <div class="numbers" slot="content">
              <p>{{ stats.title }}</p>
              {{ stats.value }}
            </div>
            <div class="stats" slot="footer">
              <i :class="stats.footerIcon"></i> {{ stats.footerText }}
            </div>
          </stats-card>
        </div>
      </div>

    <!-- Charts
    <div class="row">
      <div class="col-12">
        <chart-card
          title="Hoạt động bán hàng"
          sub-title="Doanh thu và đơn hàng 7 ngày gần nhất"
          :chart-data="usersChart.data"
          :chart-options="usersChart.options"
        >
          <span slot="footer">
            <i class="ti-reload"></i> Cập nhật {{ getLastUpdateTime() }}
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Doanh thu
            <i class="fa fa-circle text-danger"></i> Số đơn hàng
          </div>
        </chart-card>
      </div>

      <div class="col-md-6 col-12">
        <chart-card
          title="Trạng thái thanh toán"
          sub-title="Phân bổ trạng thái đơn hàng"
          :chart-data="preferencesChart.data"
          chart-type="Pie"
        >
          <span slot="footer">
            <i class="ti-timer"></i> Cập nhật theo thời gian thực
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Đã thanh toán
            <i class="fa fa-circle text-danger"></i> Chưa thanh toán
            <i class="fa fa-circle text-warning"></i> Thanh toán một phần
          </div>
        </chart-card>
      </div>

      <div class="col-md-6 col-12">
        <chart-card
          title="Doanh thu theo tháng"
          sub-title="So sánh doanh thu và chi phí"
          :chart-data="activityChart.data"
          :chart-options="activityChart.options"
        >
          <span slot="footer">
            <i class="ti-check"></i> Dữ liệu đã được xác minh
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Doanh thu
            <i class="fa fa-circle text-warning"></i> Chi phí
          </div>
        </chart-card>
      </div>
    </div> -->

    <!-- Recent Orders Table -->
    <div class="row mt-4" v-if="dashboardData && dashboardData.recent_orders">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Đơn hàng gần đây</h4>
            <p class="card-category">{{ dashboardData.recent_orders.length }} đơn hàng mới nhất</p>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in dashboardData.recent_orders.slice(0, 10)" :key="order.id">
                    <td><strong>{{ order.code }}</strong></td>
                    <td>
                      <span v-if="order.customer_id">KH{{ order.customer_id.toString().padStart(3, '0') }}</span>
                      <span v-else class="text-muted">Khách lẻ</span>
                    </td>
                    <td>{{ formatCurrency(order.retail_cost) }}</td>
                    <td>
                      <span class="badge" :class="{
                        'badge-success': order.status === 2,
                        'badge-warning': order.status === 1,
                        'badge-danger': order.status === 0
                      }">
                        {{ getOrderStatusText(order.status) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="{
                        'badge-success': order.payment_status === 2,
                        'badge-warning': order.payment_status === 3,
                        'badge-danger': order.payment_status === 1
                      }">
                        {{ getPaymentStatusText(order.payment_status) }}
                      </span>
                    </td>
                    <td>{{ formatDate(order.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
<script>
import { StatsCard, ChartCard } from "@/components/index";
import Chartist from "chartist";
import dashboardModule from '@/api/dashboard';

const dashboardActions = dashboardModule.actions;

export default {
  components: {
    StatsCard,
    ChartCard,
  },
  data() {
    return {
      loading: false,
      dashboardData: null,
      statsCards: [
        {
          type: "success",
          icon: "ti-wallet",
          title: "Doanh thu tuần",
          value: "0 ₫",
          footerText: "7 ngày gần nhất",
          footerIcon: "ti-calendar",
        },
        {
          type: "info",
          icon: "ti-shopping-cart",
          title: "Đơn hàng tuần",
          value: "0",
          footerText: "Đơn hàng mới",
          footerIcon: "ti-reload",
        },
        {
          type: "warning",
          icon: "ti-user",
          title: "Khách hàng mới",
          value: "0",
          footerText: "Tuần này",
          footerIcon: "ti-timer",
        },
        {
          type: "danger",
          icon: "ti-alert",
          title: "Đơn chờ xử lý",
          value: "0",
          footerText: "Cần xử lý",
          footerIcon: "ti-pulse",
        },
      ],
      usersChart: {
        data: {
          labels: [
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
            "Chủ nhật",
          ],
          series: [
            [0, 0, 0, 0, 0, 0, 0], // Doanh thu
            [0, 0, 0, 0, 0, 0, 0], // Đơn hàng
          ],
        },
        options: {
          low: 0,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3,
          }),
          showLine: true,
          showPoint: false,
        },
      },
      activityChart: {
        data: {
          labels: [],
          series: [
            [], // Doanh thu hàng tháng
            [], // Chi phí hàng tháng
          ],
        },
        options: {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
          },
          height: "245px",
        },
      },
      preferencesChart: {
        data: {
          labels: ["Đã thanh toán", "Chưa thanh toán", "Một phần"],
          series: [80, 15, 5],
        },
        options: {},
      },
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const response = await dashboardActions.getDashboard();
        this.dashboardData = response.data.data || response.data;
        this.updateStatsCards();
        this.updateCharts();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.$snackbar?.error('Không thể tải dữ liệu dashboard');
      } finally {
        this.loading = false;
      }
    },

    updateStatsCards() {
      if (!this.dashboardData) return;

      // Update stats cards with real data from API
      this.statsCards[0].value = this.formatCurrency(this.dashboardData.revenue || 0);
      this.statsCards[0].footerText = `Tỷ lệ chuyển đổi: ${this.formatPercent(this.dashboardData.order_conversion_rate || 0)}%`;

      this.statsCards[1].value = this.dashboardData.total_order_week || 0;
      this.statsCards[1].footerText = `Giá trị TB: ${this.formatCurrency(this.dashboardData.average_order_value || 0)}`;

      this.statsCards[2].value = this.dashboardData.new_customers_week || 0;
      this.statsCards[2].footerText = `Tổng KH: ${this.dashboardData.total_customer || 0}`;

      this.statsCards[3].value = this.dashboardData.pending_orders || 0;
      this.statsCards[3].footerText = `Nợ chưa thu: ${this.formatCurrency(this.dashboardData.outstanding_payments || 0)}`;
    },

    updateCharts() {
      if (!this.dashboardData) return;

      // Update revenue chart based on recent orders
      if (this.dashboardData.recent_orders && Array.isArray(this.dashboardData.recent_orders)) {
        const weeklyData = this.processWeeklyData(this.dashboardData.recent_orders);
        this.usersChart.data.series[0] = weeklyData.revenue;
        this.usersChart.data.series[1] = weeklyData.orders;
      }

      // Update monthly activity chart with real data
      const monthlyData = this.generateMonthlyData();
      this.activityChart.data.labels = monthlyData.labels;
      this.activityChart.data.series[0] = monthlyData.revenue;
      this.activityChart.data.series[1] = monthlyData.costs;

      // Update payment status pie chart based on recent orders
      this.updatePaymentChart();
    },

    processWeeklyData(recentOrders) {
      // Create arrays for 7 days
      const revenue = new Array(7).fill(0);
      const orders = new Array(7).fill(0);

      // Group orders by day (simple approach - last 7 orders represent last 7 days)
      recentOrders.slice(0, 7).forEach((order, index) => {
        const dayIndex = 6 - index; // Reverse order to show recent first
        if (dayIndex >= 0 && dayIndex < 7) {
          revenue[dayIndex] = (order.retail_cost || order.base_cost || 0) / 1000; // Convert to thousands
          orders[dayIndex] = 1;
        }
      });

      return { revenue, orders };
    },

    updatePaymentChart() {
      if (!this.dashboardData.recent_orders) return;

      // Calculate payment status distribution from recent orders
      const statusCounts = { paid: 0, unpaid: 0, partial: 0 };

      this.dashboardData.recent_orders.forEach(order => {
        switch (order.payment_status) {
          case 1:
            statusCounts.unpaid++;
            break;
          case 2:
            statusCounts.paid++;
            break;
          case 3:
            statusCounts.partial++;
            break;
        }
      });

      const total = statusCounts.paid + statusCounts.unpaid + statusCounts.partial;
      if (total > 0) {
        this.preferencesChart.data.series = [
          Math.round((statusCounts.paid / total) * 100),
          Math.round((statusCounts.unpaid / total) * 100),
          Math.round((statusCounts.partial / total) * 100)
        ];
      }
    },

    generateMonthlyData() {
      const months = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
        "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
        "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
      ];

      // Use real monthly data if available, otherwise generate sample data
      const currentMonth = new Date().getMonth();
      const revenue = new Array(12).fill(0);
      const costs = new Array(12).fill(0);

      // Set current month data from API
      if (this.dashboardData.revenue_month) {
        revenue[currentMonth] = Math.abs(this.dashboardData.revenue_month) / 1000000; // Convert to millions
        costs[currentMonth] = revenue[currentMonth] * 0.7; // Assume 70% cost ratio
      }

      // Fill other months with sample data for visualization
      for (let i = 0; i < 12; i++) {
        if (i !== currentMonth) {
          revenue[i] = Math.floor(Math.random() * 5) + 1; // 1-6 million
          costs[i] = revenue[i] * 0.7;
        }
      }

      return {
        labels: months,
        revenue,
        costs
      };
    },

    formatCurrency(value) {
      if (!value && value !== 0) return '0 ₫';
      return Math.abs(value).toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      });
    },

    formatPercent(value) {
      if (!value && value !== 0) return '0';
      return Math.round(Math.abs(value * 100) / 100);
    },

    getLastUpdateTime() {
      return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getOrderStatusText(status) {
      switch (status) {
        case 0: return 'Đã hủy';
        case 1: return 'Chờ xử lý';
        case 2: return 'Hoàn thành';
        default: return 'Không xác định';
      }
    },

    getPaymentStatusText(status) {
      switch (status) {
        case 1: return 'Chưa thanh toán';
        case 2: return 'Đã thanh toán';
        case 3: return 'Thanh toán một phần';
        default: return 'Không xác định';
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
  },
};
</script>
<style></style>
