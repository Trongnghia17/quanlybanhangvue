<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="headline">
        <v-icon left color="error" size="24">mdi-file-pdf-box</v-icon>
        Xuất báo cáo doanh thu PDF
      </v-card-title>
      <v-card-text class="py-4">
        <v-form ref="exportForm" v-model="validForm">
          <v-row>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="fromDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedFromDate"
                    label="Từ ngày"
                    prepend-icon="mdi-calendar"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    clearable
                    @click:clear="clearFromDate"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.from"
                  no-title
                  @input="fromDateMenu = false"
                  locale="vi"
                  first-day-of-week="1"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="toDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="formattedToDate"
                    label="Đến ngày"
                    prepend-icon="mdi-calendar"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    clearable
                    @click:clear="clearToDate"
                    :rules="[dateRangeRule]"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.to"
                  no-title
                  @input="toDateMenu = false"
                  locale="vi"
                  first-day-of-week="1"
                  :min="form.from"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <div class="mt-4 text-body-2 grey--text text--darken-1">
            <v-icon small color="grey" class="mr-1">mdi-information-outline</v-icon>
            <span>Chọn ngày để xuất báo cáo doanh thu</span>
          </div>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="grey darken-1" @click="closeDialog" :disabled="loading">
          Hủy
        </v-btn>
        <v-btn
          color="error"
          :loading="loading"
          @click="submitExport"
          :disabled="!validForm"
          class="px-5"
        >
          <v-icon left small>mdi-file-pdf-box</v-icon>
          Xuất PDF
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import orderModule from '@/api/order'

const orderActions = orderModule.actions

export default {
  name: 'ExportPDFDialog',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      validForm: true,
      fromDateMenu: false,
      toDateMenu: false,
      form: {
        from: null,
        to: null
      }
    }
  },
  computed: {
    formattedFromDate() {
      if (!this.form.from) return '';
      const [year, month, day] = this.form.from.split('-');
      return `${day}/${month}/${year}`;
    },
    formattedToDate() {
      if (!this.form.to) return '';
      const [year, month, day] = this.form.to.split('-');
      return `${day}/${month}/${year}`;
    }
  },
  watch: {
    open(val) {
      this.dialog = val;
    },
    dialog(val) {
      if (!val) {
        this.$emit('toggle');
      }
    }
  },
  methods: {
    clearFromDate() {
      this.form.from = null;
    },
    clearToDate() {
      this.form.to = null;
    },
    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        from: null,
        to: null
      };
    },
    dateRangeRule() {
      if (this.form.from && this.form.to) {
        return new Date(this.form.from) <= new Date(this.form.to) || 'Ngày kết thúc phải sau ngày bắt đầu';
      }
      return true;
    },
    
    formatCurrency(value) {
      if (!value && value !== 0) return '0 ₫';
      return value.toLocaleString('vi-VN') + ' ₫';
    },

    formatDate(dateString) {
      if (!dateString) return '';

      // Handle plain date strings like "2026-03-09" reliably (avoid timezone shifting)
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [y, m, d] = dateString.split('-').map(Number)
        return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
      }

      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },

    async loadFont() {
      // Load Vietnamese font for PDF
      const fontUrl = 'https://cdn.jsdelivr.net/npm/@canvas-fonts/roboto@1.0.3/Roboto-Regular.ttf';
      
      try {
        const response = await fetch(fontUrl);
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
      } catch (error) {
        console.error('Error loading font:', error);
        return null;
      }
    },

    async submitExport() {
      if (!this.$refs.exportForm.validate()) return;

      this.loading = true;

      try {
        // Prepare payload
        const payload = {
          type: 1, // Sales orders
          per_page: 1000, // Get all orders
          with: 'orderItems,orderItems.product' // Include related data
        };
        // Backend OrderRepository currently filters by `start_date`/`end_date` (updated_at)
        // The UI uses from/to, so we map it here.
        if (this.form.from) {
          payload.from = this.form.from;
          payload.start_date = this.form.from;
          payload.create_date_from = this.form.from;
        }
        if (this.form.to) {
          payload.to = this.form.to;
          payload.end_date = this.form.to;
          payload.create_date_to = this.form.to;
        }

        console.log('Fetching orders with payload:', payload);

        // Fetch orders data
        const response = await orderActions.getListOrders(payload);

        console.log('Response:', response);

        // Handle different response structures
        let orders = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            orders = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            orders = response.data.data;
          } else if (response.data.orders && Array.isArray(response.data.orders)) {
            orders = response.data.orders;
          }
        }

        console.log('Orders found:', orders.length);
        
        // Debug: Log first order structure
        if (orders.length > 0) {
          console.log('First order structure:', orders[0]);
          console.log('First order.order_detail:', orders[0].order_detail);
          console.log('First order.order_items:', orders[0].order_items);
          console.log('First order.items:', orders[0].items);
        }
        
        if (orders.length === 0) {
          this.$snackbar.warning('Không có dữ liệu để xuất!');
          this.loading = false;
          return;
        }

        // Check if we need to fetch order details (if order_detail not included)
        const needsDetails = orders.length > 0 && 
                             !orders[0].order_detail && 
                             !orders[0].order_items && 
                             !orders[0].items;
        
        if (needsDetails) {
          console.log('Fetching order details for each order...');
          const detailedOrders = await Promise.all(
            orders.map(async (order) => {
              try {
                const detailResponse = await orderActions.getOrderDetail(order.id);
                return detailResponse.data.data || detailResponse.data || order;
              } catch (error) {
                console.error('Error fetching order detail:', order.id, error);
                return order;
              }
            })
          );
          orders = detailedOrders;
          console.log('Detailed orders loaded:', orders.length);
          if (orders.length > 0) {
            console.log('First detailed order:', orders[0]);
          }
        }

        // Generate PDF
        await this.generatePDF(orders);

        this.$snackbar.success('Xuất PDF thành công!');
        this.closeDialog();
      } catch (error) {
        console.error('Export error:', error);
        console.error('Error details:', error.response || error.message);
        
        let errorMessage = 'Không thể xuất PDF. Vui lòng thử lại.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.$snackbar.error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    async generatePDF(orders) {
      try {
        console.log('Starting PDF generation with', orders.length, 'orders');

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        // Debug: Check if autoTable is available
        console.log('doc.autoTable exists?', typeof doc.autoTable);
        console.log('doc methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(doc)));

        if (typeof doc.autoTable !== 'function') {
          throw new Error('autoTable is not available on jsPDF instance');
        }

        // Group orders by business date (create_date) when available
        const ordersByDate = {};
        orders.forEach(order => {
          const orderDate = this.formatDate(order.create_date || order.created_at);
          if (!ordersByDate[orderDate]) {
            ordersByDate[orderDate] = [];
          }
          ordersByDate[orderDate].push(order);
        });

        console.log('Orders grouped by date:', Object.keys(ordersByDate).length, 'dates');

        // Use built-in fonts
        doc.setFont('helvetica');

      // Helpers aligned with backend OrderDetailResource
      const getSoldQty = (item) => Number(item?.quantity ?? 0)
      const getGiftQty = (item) =>
        Number(item?.gift_quantity ?? item?.gift_qty ?? item?.quantity_gift ?? item?.qty_gift ?? 0)
      const getLineAmount = (item) => {
        const retailCost = Number(item?.retail_cost ?? 0)
        if (Number.isFinite(retailCost) && retailCost > 0) return retailCost

        const unitPrice = Number(item?.price ?? item?.unit_price ?? item?.retail_price ?? 0)
        const qty = Number(item?.quantity ?? 0)
        return unitPrice * qty
      }

      const getCustomerName = (order) =>
        order?.customer?.name || order?.name || order?.customer_name || ''

      const getUnitName = (item) => {
        // Best-effort: backend ProductResource structure may vary
        return (
          item?.unit_name ||
          item?.unit ||
          item?.product?.unit_name ||
          item?.product?.unit?.name ||
          item?.product?.unit ||
          item?.size ||
          ''
        )
      }

      const getUnitPrice = (item) => {
        // Prefer per-unit base if present; otherwise derive from line total / quantity
        const perUnit = Number(item?.retail_cost_base ?? item?.user_cost ?? item?.base_cost_base ?? 0)
        if (Number.isFinite(perUnit) && perUnit > 0) return perUnit

        const qty = Number(item?.quantity ?? 0)
        const line = Number(item?.retail_cost ?? 0)
        if (qty > 0 && Number.isFinite(line) && line > 0) return line / qty

        return Number(item?.price ?? item?.unit_price ?? item?.retail_price ?? 0)
      }

      const getOrderTotal = (order) => Number(order?.retail_cost ?? order?.total_money ?? 0)

      const getOrderPaid = (order) => {
        // Backend sends order_payment array; OrderResource also calculates debt
        if (typeof order?.paid === 'number') return order.paid

        const payments = Array.isArray(order?.order_payment) ? order.order_payment : []
        return payments.reduce((sum, p) => sum + Number(p?.price ?? 0), 0)
      }

      const getOrderDebt = (order) => {
        if (typeof order?.debt === 'number') return order.debt
        const total = getOrderTotal(order)
        const paid = getOrderPaid(order)
        return total - paid
      }

  let currentY = 15;
      let isFirstPage = true;
      const sortedDates = Object.keys(ordersByDate).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('.');
        const [dayB, monthB, yearB] = b.split('.');
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB - dateA;
      });

      sortedDates.forEach((date) => {
        if (!isFirstPage) {
          doc.addPage();
          currentY = 15;
        }
        isFirstPage = false;

        const dateOrders = ordersByDate[date];

  // Title (keep per-day pages)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = `BAO CAO DOANH THU NGAY ${date}`;
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  // Calculate total revenue for the day
  let totalRevenue = 0;
  const tableData = [];

        dateOrders.forEach(order => {
          totalRevenue += order.retail_cost || 0;

          // Requested: prefer backend `create_date` (often business/local date) over `created_at`
          const orderCreatedDateRaw = order.create_date || order.created_at
          const orderCreatedDate = this.formatDate(orderCreatedDateRaw)
          const orderCode = order.code || ''
          const customerName = this.convertVietnameseToLatin(getCustomerName(order))
          const orderTotal = getOrderTotal(order)
          const orderPaid = getOrderPaid(order)
          const orderDebt = getOrderDebt(order)

          // Get order items from order_detail (backend field), order_items, or items
          const orderItems = order.order_detail || order.order_items || order.items || [];

          // Add rows for each product in the order
          if (Array.isArray(orderItems) && orderItems.length > 0) {
            orderItems.forEach(item => {
              try {
                const productName = this.convertVietnameseToLatin(
                  item.product?.name || 
                  item.product_name || 
                  item.name || 
                  'N/A'
                );
                const salesName = this.convertVietnameseToLatin(
                  order.sales_name || 
                  order.user?.name || 
                  order.created_by?.name || 
                  ''
                );
                const note = this.convertVietnameseToLatin(order.note || '');

                const soldQty = getSoldQty(item);
                const giftQty = getGiftQty(item);
                const amount = getLineAmount(item);

                const unitName = this.convertVietnameseToLatin(getUnitName(item))
                const unitPrice = getUnitPrice(item)

                const row = [
                  orderCreatedDate,
                  orderCode,
                  customerName,
                  productName,
                  soldQty,
                  unitName,
                  this.formatCurrency(unitPrice),
                  this.formatCurrency(amount),
                  this.formatCurrency(orderTotal),
                  this.formatCurrency(orderPaid),
                  this.formatCurrency(orderDebt)
                ];
                tableData.push(row);
              } catch (itemError) {
                console.error('Error processing order item:', itemError, item);
              }
            });
          } else {
            // If no items, show order info
            try {
              const salesName = this.convertVietnameseToLatin(order.sales_name || order.user?.name || '');
              const note = this.convertVietnameseToLatin(order.note || '');
              
              const row = [
                orderCreatedDate,
                orderCode,
                customerName,
                'Khong co san pham',
                0,
                '',
                this.formatCurrency(0),
                this.formatCurrency(order.retail_cost || 0),
                this.formatCurrency(orderTotal),
                this.formatCurrency(orderPaid),
                this.formatCurrency(orderDebt)
              ];
              tableData.push(row);
            } catch (orderError) {
              console.error('Error processing order:', orderError, order);
            }
          }
        });

  // Add total revenue row
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const totalText = `Tong doanh thu ngay ${date}`;
  const totalAmount = this.formatCurrency(totalRevenue);
  doc.text(totalText, 14, currentY);
  doc.text(totalAmount, pageWidth - 14, currentY, { align: 'right' });
  currentY += 8;

        // Create table
        doc.autoTable({
          startY: currentY,
          head: [[
            'Ngay tao don',
            'Ma don hang',
            'Khach hang',
            'San pham',
            'So luong',
            'Don vi',
            'Don gia',
            'Thanh tien',
            'Tong tien',
            'Da thanh toan',
            'Con no'
          ]],
          body: tableData,
          styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 1.5,
            overflow: 'linebreak',
            halign: 'left'
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 18 }, // Created date
            1: { cellWidth: 22 }, // Code
            2: { cellWidth: 26 }, // Customer
            3: { cellWidth: 58 }, // Product
            4: { cellWidth: 14, halign: 'center' }, // Qty
            5: { cellWidth: 14 }, // Unit
            6: { cellWidth: 20, halign: 'right' }, // Unit price
            7: { cellWidth: 22, halign: 'right' }, // Line total
            8: { cellWidth: 22, halign: 'right' }, // Order total
            9: { cellWidth: 22, halign: 'right' }, // Paid
            10: { cellWidth: 20, halign: 'right' } // Debt
          },
          margin: { left: 10, right: 10 },
          theme: 'grid',
          tableWidth: 'wrap'
        });
      });

      // Save PDF
      console.log('Saving PDF...');
      const fromDate = this.form.from ? this.form.from.replace(/-/g, '') : 'all';
      const toDate = this.form.to ? this.form.to.replace(/-/g, '') : 'all';
      const filename = `bao_cao_doanh_thu_${fromDate}_${toDate}.pdf`;
      doc.save(filename);
      console.log('PDF saved successfully:', filename);
      } catch (error) {
        console.error('Error generating PDF:', error);
        throw error; // Re-throw to be caught by submitExport
      }
    },

    convertVietnameseToLatin(str) {
      if (!str) return '';
      
      const vietnameseMap = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'Đ': 'D',
        'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
      };

      let result = str;
      Object.keys(vietnameseMap).forEach(key => {
        result = result.replace(new RegExp(key, 'g'), vietnameseMap[key]);
      });

      return result;
    }
  }
}
</script>

<style scoped>
.v-text-field--outlined >>> fieldset {
  border-color: rgba(0, 0, 0, 0.15) !important;
}
</style>
