<template>
  <div class="wrapper" :class="{ 'sidebar-mini': sidebarCollapsed }">
    <div class="v-navigation-drawer__content">
      <!-- Logo -->
      <div class="text-center">
        <router-link to="/">
          <img src="@/assets/img/RetailEase_logo.png" height="60px" alt="Logo" />
        </router-link>
      </div>

      <!-- Navigation List -->
      <div class="v-list v-theme--light bg-transparent v-list--density-comfortable v-list--one-line vertical-nav-list" tabindex="0" role="listbox">
        <div v-for="(section, index) in sections" :key="index">
          <div class="vertical-nav-list__label">{{ section.label }}</div>
          <div class="v-list-group v-list-group--prepend">
            <div
              class="v-list-item v-list-item--link v-theme--light v-list-group__header vertical-nav-list__item py-2"
              @click="toggleSection(section.state)"
              :class="{ 'section-active': isSectionActive(section) }"
            >
              <div class="v-list-item__prepend">
                <v-icon>{{ section.icon }}</v-icon>
                <div class="v-list-item__spacer"></div>
              </div>
              <div class="v-list-item__content">
                <div class="v-list-item-title">{{ section.title }}</div>
              </div>
              <div class="v-list-item__append">
                <v-icon>{{ section.open ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                <div class="v-list-item__spacer"></div>
              </div>
            </div>
            <div class="v-list-group__items" :style="{ display: section.open ? 'block' : 'none' }">
              <router-link
                v-for="(item, idx) in section.items"
                :key="idx"
                :to="item.path"
                class="v-list-item v-list-item--link v-theme--light vertical-nav-list__group"
                :class="{ 'v-list-item--active': isActive(item.path) }"
              >
                <div class="v-list-item__prepend">
                  <v-icon>{{ item.icon }}</v-icon>
                </div>
                <div class="v-list-item__content">
                  <div class="v-list-item-title">{{ item.name }}</div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-panel">
      <top-navbar>
        <template slot="navbar-toggle-button">
          <button class="navbar-toggle-btn d-md-none" @click="toggleSidebarCollapse">
            <i class="ti-menu"></i>
          </button>
        </template>
      </top-navbar>
      <dashboard-content @click.native="toggleSidebar"></dashboard-content>
    </div>
  </div>
</template>

<script>
import "@/assets/css/dashboard.css";
import TopNavbar from "./TopNavbar.vue";
import DashboardContent from "./Content.vue";

export default {
    components: {
        TopNavbar,
        DashboardContent,
    },
    data() {
        return {
            sidebarCollapsed: false,
            sections: [
                {
                    label: "Đơn hàng",
                    title: "Bán hàng",
                    state: "orderSalesSectionOpen",
                    open: false,
                    icon: "mdi-cart",
                    items: [
                        { name: "Tạo đơn bán", path: "/order-sales", icon: "mdi-cart-plus" },
                        { name: "Danh sách đơn bán", path: "/list-order-sales", icon: "mdi-format-list-bulleted" },
                    ],
                },
                {
                    label: "Đơn hàng",
                    title: "Nhập hàng",
                    state: "orderPurchaseSectionOpen",
                    open: false,
                    icon: "mdi-truck",
                    items: [
                        { name: "Tạo đơn nhập hàng", path: "/order-purchase", icon: "mdi-truck-fast" },
                        { name: "Danh sách đơn nhập hàng", path: "/list-order-purchase", icon: "mdi-format-list-bulleted" },
                    ],
                },
                {
                    label: "Đối tác",
                    title: "Khách hàng",
                    state: "customerSectionOpen",
                    open: false,
                    icon: "mdi-account-group",
                    items: [
                        { name: "Quản lý khách hàng", path: "/customer", icon: "mdi-account" },
                        { name: "Doanh số mua hàng", path: "/customer-report", icon: "mdi-chart-bar" },
                    ],
                },
                {
                    label: "Đối tác",
                    title: "Nhà cung cấp",
                    state: "supplierSectionOpen",
                    open: false,
                    icon: "mdi-factory",
                    items: [
                        { name: "Danh sách nhà cung cấp", path: "/supplier", icon: "mdi-format-list-bulleted" },
                        { name: "Thống kê nhập hàng", path: "/supplier-report", icon: "mdi-chart-bar" },
                    ],
                },
                {
                    label: "Danh mục hàng hóa",
                    title: "Sản phẩm",
                    state: "productSectionOpen",
                    open: false,
                    icon: "mdi-package-variant",
                    items: [
                        { name: "Quản lý sản phẩm", path: "/product", icon: "mdi-package" },
                        { name: "Nhóm mặt hàng", path: "/category", icon: "mdi-package-variant-closed" },
                    ],
                },
                {
                  'title': 'Kho hàng',
                  state: 'storageSectionOpen',
                  open: false,
                  icon: 'mdi-warehouse',
                  items: [
                      { name: 'Quản lý kho', path: '/storage-management', icon: 'mdi-warehouse' },
                      { name: 'Phiếu kiểm kho', path: '/inventory-check-list', icon: 'mdi-clipboard-list' },
                  ],
                },
                {
                  title: 'Quản lý thu chi',
                  state: 'incomeExpenseSectionOpen',
                  open: false,
                  icon: 'mdi-cash',
                  items: [
                    { name: 'Loại phiếu thu chi', path: '/receipt-payment-type', icon: 'mdi-cash-multiple' },
                    { name: 'Tổng quan sổ quỹ', path: '/receipt-payment', icon: 'mdi-file-document' },
                  ],
                },
                {
                  label: "Báo cáo thống kê",
                  title: "Báo cáo",
                  state: "reportSectionOpen",
                  open: false,
                  icon: "mdi-chart-line",
                  items: [
                      { name: "Báo cáo bán hàng", path: "/aggregate-sale-report", icon: "mdi-chart-line" },
                      { name: "Báo cáo nhập hàng", path: "/aggregate-purchase-report", icon: "mdi-chart-line" },
                      { name: "Báo cáo tồn kho", path: "/storage-report", icon: "mdi-chart-line" },
                      { name: "Báo cáo công nợ khách hàng", path: "/customer-debt-report", icon: "mdi-chart-line" },
                      { name: "Báo cáo công nợ nhà cung cấp", path: "/supplier-debt-report", icon: "mdi-chart-line" },
                      { name: "Báo cáo lợi nhuận", path: "/profit-report", icon: "mdi-chart-line" },
                  ],
                }
            ],
        };
    },
    created() {
        const savedState = localStorage.getItem("sidebarCollapsed");
        if (savedState !== null) {
            this.sidebarCollapsed = JSON.parse(savedState);
        }

        if (window.innerWidth < 992) {
            this.sidebarCollapsed = true;
        }

        window.addEventListener("resize", this.handleResize);

        // Check if there's a section that should be expanded based on current route
        this.checkActiveSection();
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.handleResize);
    },
    watch: {
        // Watch for route changes to update active section
        '$route': 'checkActiveSection'
    },
    methods: {
        toggleSidebarCollapse() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem("sidebarCollapsed", JSON.stringify(this.sidebarCollapsed));
        },
        toggleSection(section) {
            const target = this.sections.find(s => s.state === section);
            if (target) target.open = !target.open;
        },
        handleResize() {
            if (window.innerWidth < 992) {
                this.sidebarCollapsed = true;
            } else {
                this.sidebarCollapsed = JSON.parse(localStorage.getItem("sidebarCollapsed") || "false");
            }
        },
        toggleSidebar() {
            if (this.sidebarCollapsed) {
                this.toggleSidebarCollapse();
            }
        },
        isActive(path) {
            // Check if the current route path matches the menu item path
            return this.$route.path === path;
        },
        isSectionActive(section) {
            // Check if any item in this section matches the current route
            return section.items.some(item => this.isActive(item.path));
        },
        checkActiveSection() {
            // Auto-expand the section containing the active route
            const currentPath = this.$route.path;

            for (const section of this.sections) {
                const hasActiveItem = section.items.some(item => item.path === currentPath);
                if (hasActiveItem) {
                    section.open = true;
                    break;
                }
            }
        }
    },
};
</script>

<style>
/* Active menu item styling */
.v-list-item--active {
    background-color: rgba(25, 118, 210, 0.12) !important;
    border-left: 3px solid #1976D2 !important;
    color: #1976D2 !important;
}

.v-list-item--active .v-icon {
    color: #1976D2 !important;
}

.v-list-item--active .v-list-item-title {
    font-weight: 600 !important;
    color: #1976D2 !important;
}

/* Section active styling */
.section-active {
    background-color: rgba(25, 118, 210, 0.05) !important;
}

.section-active .v-list-item-title {
    color: #1976D2 !important;
    font-weight: 500;
}
</style>
