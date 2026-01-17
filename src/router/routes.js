import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue";

// Admin pages
import Dashboard from "@/pages/Dashboard.vue";
import TableList from "@/pages/TableList.vue";
import Login from "@/pages/Login/Login.vue";
import Register from "@/pages/Register/index.vue";
import Customer from "@/pages/Customer/index.vue";
import Supplier from "@/pages/Supplier/index.vue";
import Product from "@/pages/Product/index.vue";
import CreateOrderSales from "@/pages/Order/OrderSales.vue";
import CreateOrderPurchase from "@/pages/Order/OrderPurchase.vue";
import ListOrderSales from "@/pages/Order/ListOrderSales.vue";
import ListOrderPurchase from "@/pages/Order/ListOrderPurchase.vue";
import AggregateSaleReport from "@/pages/Reports/AggregateSaleReport.vue";
import AggregatePurchaseReport from "@/pages/Reports/AggregatePurchaseReport.vue";
import CustomerDebtReport from "@/pages/Reports/CustomerDebtReport.vue";
import SupplierDebtReport from "@/pages/Reports/SupplierDebtReport.vue";
import StorageReport from "@/pages/Reports/StorageReport.vue";
import ProfitReport from "@/pages/Reports/ProfitReport.vue";
import StorageManagement from "@/pages/Storage/StorageManagement.vue";
import InventoryCheckList from "@/pages/Storage/InventoryCheckList.vue";
import CustomerReport from "@/pages/Customer/CustomerReport.vue";
import SupplierReport from "@/pages/Supplier/SupplierReport.vue";
import ListCategory from "@/pages/Category/index.vue";
import ReceiptPaymentType from "../pages/ReceiptPayment/ReceiptPaymentType.vue";
import ReceiptPayment from "../pages/ReceiptPayment/ReceiptPayment.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      title: "Đăng nhập - Sale Management System",
      icon: "/favicon.png",
      description: "Đăng nhập vào hệ thống quản lý bán hàng"
    }
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: {
      title: "Đăng ký - Sale Management System",
      icon: "/favicon.png",
      description: "Đăng ký tài khoản mới cho hệ thống quản lý bán hàng"
    }
  },
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    meta: {
      requiresAuth: true,
      title: "Sale Management System",
      icon: "/favicon.png"
    },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
        meta: {
          title: "Bảng điều khiển",
          icon: "/icons/retail_icon.png",
          description: "Tổng quan về hoạt động kinh doanh và các chỉ số quan trọng"
        }
      },
      {
        path: "/order-sales",
        name: "Đơn bán hàng",
        component: CreateOrderSales,
        meta: {
          title: "Đơn bán hàng",
          icon: "/icons/retail_icon.png",
          description: "Tạo và quản lý đơn hàng bán ra cho khách hàng"
        }
      },
      {
        path: "/list-order-sales",
        name: "Danh sách đơn bán hàng",
        component: ListOrderSales,
        meta: {
          title: "Danh sách đơn bán hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/order-purchase",
        name: "Đơn mua hàng",
        component: CreateOrderPurchase,
        meta: {
          title: "Đơn mua hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/list-order-purchase",
        name: "Danh sách đơn mua hàng",
        component: ListOrderPurchase,
        meta: {
          title: "Danh sách đơn mua hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/customer",
        name: "Quản lý khách hàng",
        component: Customer,
        meta: {
          title: "Quản lý khách hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        'path': "/customer-report",
        'name': "Doanh số mua hàng",
        'component': CustomerReport,
        meta: {
          title: "Doanh số mua hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        'path': "/supplier-report",
        'name': "Thống kế nhập hàng",
        'component': SupplierReport,
        meta: {
          title: "Thống kế nhập hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/supplier",
        name: "Quản lý nhà cung cấp",
        component: Supplier,
        meta: {
          title: "Quản lý nhà cung cấp",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/product",
        name: "Quản lý sản phẩm",
        component: Product,
        meta: {
          title: "Quản lý sản phẩm",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/category",
        name: "Quản lý danh mục",
        component: ListCategory,
        meta: {
          title: "Quản lý danh mục",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/storage-management",
        name: "Quản lý kho hàng",
        component: StorageManagement,
        meta: {
          title: "Quản lý kho hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/inventory-check-list",
        name: "Danh sách kiểm kho",
        component: InventoryCheckList,
        meta: {
          title: "Danh sách kiểm kho",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/aggregate-sale-report",
        name: "Báo cáo bán hàng tổng hợp",
        component: AggregateSaleReport,
        meta: {
          title: "Báo cáo bán hàng tổng hợp",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/aggregate-purchase-report",
        name: "Báo cáo nhập hàng tổng hợp",
        component: AggregatePurchaseReport,
        meta: {
          title: "Báo cáo nhập hàng tổng hợp",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/customer-debt-report",
        name: "Báo cáo công nợ khách hàng",
        component: CustomerDebtReport,
        meta: {
          title: "Báo cáo công nợ khách hàng",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/supplier-debt-report",
        name: "Báo cáo công nợ nhà cung cấp",
        component: SupplierDebtReport,
        meta: {
          title: "Báo cáo công nợ nhà cung cấp",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/storage-report",
        name: "Báo cáo tồn kho",
        component: StorageReport,
        meta: {
          title: "Báo cáo tồn kho",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/profit-report",
        name: "Báo cáo lợi nhuận",
        component: ProfitReport,
        meta: {
          title: "Báo cáo lợi nhuận",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/receipt-payment-type",
        name: "Loại phiếu thu chi",
        component: ReceiptPaymentType,
        meta: {
          title: "Loại phiếu thu chi",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "/receipt-payment",
        name: "Quản lý thu chi",
        component: ReceiptPayment,
        meta: {
          title: "Quản lý thu chi",
          icon: "/icons/retail_icon.png"
        }
      },
      {
        path: "table-list",
        name: "table-list",
        component: TableList,
        meta: {
          title: "Danh sách bảng",
          icon: "/favicon.png"
        }
      },
    ],
  },
  { 
    path: "*", 
    component: NotFound,
    meta: {
      title: "Trang không tìm thấy",
      icon: "/favicon.png"
    }
  },
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;
