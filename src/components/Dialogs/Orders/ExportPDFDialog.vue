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
    
    // Lưu ý: font mặc định của jsPDF không hỗ trợ ký tự "₫",
    // nên nếu dùng sẽ bị hiển thị thành ký tự lạ «.
    // Ở đây chỉ dùng số, nếu cần thì thêm hậu tố "VNĐ" ở text ngoài bảng.
    formatCurrency(value) {
      if (!value && value !== 0) return '0';
      return Number(value).toLocaleString('vi-VN');
    },

    // Format number without currency symbol (for summary like "565.000VNĐ")
    formatNumberVN(value) {
      if (!value && value !== 0) return '0';
      return Number(value).toLocaleString('vi-VN');
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
      // ===== New layout: "CUA HANG / Dia chi / Hotline" + single table + period summary =====

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;

      // Get store info from localStorage (user_info) or first order's user
      const userInfo = (() => {
        try {
          return JSON.parse(localStorage.getItem('user_info') || '{}') || {};
        } catch (e) {
          return {};
        }
      })();

      const firstOrderUser = orders[0]?.user || {};

      // Thông tin cửa hàng mặc định nếu không lấy được từ user_info
      // const defaultStoreName = 'AAIPHARMA 32 DAI TU';
      // const defaultStoreAddress = 'SH02.HH3B.EcoLakeView Dai Tu';
      // const defaultStorePhone = '0888472589';

      const defaultStoreName = 'AAIPHARMA 66B HOANG HOA THAM';
      const defaultStoreAddress = '66B Hoang Hoa Tham, Thuy Khue, Ha Noi';
      const defaultStorePhone = '0848872589';

      const storeName = this.convertVietnameseToLatin(
        userInfo.store_name || firstOrderUser.store_name || defaultStoreName
      );
      const storeAddress = this.convertVietnameseToLatin(
        userInfo.address || defaultStoreAddress
      );
      const storePhone = userInfo.phone || defaultStorePhone;

      let currentY = 15;

      // Header: store info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      if (storeName) {
        doc.text(`CUA HANG: ${storeName}`, 14, currentY);
        currentY += 6;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (storeAddress) {
        doc.text(`Dia chi: ${storeAddress}`, 14, currentY);
        currentY += 5;
      }
      if (storePhone) {
        doc.text(`Hotline: ${storePhone}`, 14, currentY);
        currentY += 5;
      }

    currentY += 2; // small spacing before title

    // Title + period text (hiển thị NGAY TRÊN BẢNG)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TONG DOANH THU DON HANG', centerX, currentY, { align: 'center' });
      currentY += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const periodTextTop = this.getPeriodText();
      if (periodTextTop) {
        doc.text(periodTextTop, centerX, currentY, { align: 'center' });
        currentY += 6;
      }

      currentY += 2; // small spacing before table

      // Build table data for ALL orders in the selected period
      const tableData = [];

      let periodTotalRevenue = 0;
      let periodPaid = 0;
      let periodDebt = 0;

      orders.forEach(order => {
        // Accumulate period totals per order
        const orderTotal = getOrderTotal(order);
        const orderPaid = getOrderPaid(order);
        const orderDebt = getOrderDebt(order);

        periodTotalRevenue += orderTotal || 0;
        periodPaid += orderPaid || 0;
        periodDebt += orderDebt || 0;

        // Prefer business date create_date
        const orderCreatedDateRaw = order.create_date || order.created_at;
        const orderCreatedDate = this.formatDate(orderCreatedDateRaw);
        const orderCode = order.code || '';

        const customerNameRaw = getCustomerName(order) || '';
        const customerPhone = order.customer?.phone || order.phone || '';
        const customerCell = this.convertVietnameseToLatin(
          `${customerNameRaw}${customerPhone ? ' ' + customerPhone : ''}`.trim()
        );

        const baseOrderTotal = getOrderTotal(order);
        const baseOrderPaid = getOrderPaid(order);
        const baseOrderDebt = getOrderDebt(order);

        const orderItems = order.order_detail || order.order_items || order.items || [];

        // Gom các dòng sản phẩm của cùng 1 đơn vào "block" riêng,
        // sau đó dùng rowSpan cho 3 cột: Tổng tiền / Đã thanh toán / Còn nợ
        const orderRows = [];

        if (Array.isArray(orderItems) && orderItems.length > 0) {
          orderItems.forEach(item => {
            try {
              const productNameBase = this.convertVietnameseToLatin(
                item.product?.name ||
                item.product_name ||
                item.name ||
                'N/A'
              );

              const soldQty = getSoldQty(item);
              const giftQty = getGiftQty(item);
              const amount = getLineAmount(item);

              const unitName = this.convertVietnameseToLatin(getUnitName(item));
              const unitPrice = getUnitPrice(item);

              // 1) Normal sold quantity row (if any)
              if (soldQty > 0) {
                const row = [
                  orderCreatedDate,
                  orderCode,
                  customerCell,
                  productNameBase,
                  soldQty,
                  unitName,
                  this.formatCurrency(unitPrice),
                  this.formatCurrency(amount),
                  '', // Tổng tiền (sẽ set rowSpan sau)
                  '', // Đã thanh toán
                  ''  // Còn nợ
                ];
                orderRows.push(row);
              }

              // 2) Gift quantity row (if any) – hiển thị dấu gạch thay cho số tiền
              if (giftQty > 0) {
                const dashCurrency = '-';
                const giftRow = [
                  orderCreatedDate,
                  orderCode,
                  customerCell,
                  `Hang tang ${productNameBase}`,
                  giftQty,
                  unitName,
                  dashCurrency,
                  dashCurrency,
                  '', // Tổng tiền dùng rowSpan chung của đơn
                  '',
                  ''
                ];
                orderRows.push(giftRow);
              }

              // If neither sold nor gift quantity, still show a minimal row
              if (soldQty === 0 && giftQty === 0) {
                const minimalRow = [
                  orderCreatedDate,
                  orderCode,
                  customerCell,
                  productNameBase,
                  0,
                  unitName,
                  this.formatCurrency(0),
                  this.formatCurrency(0),
                  '',
                  '',
                  ''
                ];
                orderRows.push(minimalRow);
              }
            } catch (itemError) {
              console.error('Error processing order item:', itemError, item);
            }
          });
        } else {
          // No items – keep one row for the order itself
          try {
            const row = [
              orderCreatedDate,
              orderCode,
              customerCell,
              'Khong co san pham',
              0,
              '',
              this.formatCurrency(0),
              this.formatCurrency(order.retail_cost || 0),
              '',
              '',
              ''
            ];
            orderRows.push(row);
          } catch (orderError) {
            console.error('Error processing order:', orderError, order);
          }
        }

        // Sau khi gom đủ các dòng của 1 đơn, gán rowSpan cho 3 cột cuối
        if (orderRows.length > 0) {
          const spanCount = orderRows.length;
          const totalText = this.formatCurrency(baseOrderTotal);
          const paidText = this.formatCurrency(baseOrderPaid);
          const debtText = this.formatCurrency(baseOrderDebt);

          // Hàng đầu tiên của đơn sẽ mang giá trị + rowSpan,
          // các hàng còn lại để trống -> nhìn giống như 1 ô duy nhất.
          // styles: canh giữa cả ngang (halign) lẫn dọc (valign) cho đẹp.
          const spanCellStyles = { halign: 'center', valign: 'middle' };
          orderRows[0][8] = { content: totalText, rowSpan: spanCount, styles: spanCellStyles };
          orderRows[0][9] = { content: paidText, rowSpan: spanCount, styles: spanCellStyles };
          orderRows[0][10] = { content: debtText, rowSpan: spanCount, styles: spanCellStyles };

          for (let i = 1; i < spanCount; i++) {
            orderRows[i][8] = '';
            orderRows[i][9] = '';
            orderRows[i][10] = '';
          }

          tableData.push(...orderRows);
        }
      });

      // Create table for entire period
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
          2: { cellWidth: 32 }, // Customer + phone
          3: { cellWidth: 54 }, // Product
          4: { cellWidth: 14, halign: 'center' }, // Qty
          5: { cellWidth: 16, halign: 'center' }, // Unit
          6: { cellWidth: 20, halign: 'right' }, // Unit price
          7: { cellWidth: 22, halign: 'right' }, // Line total
          8: { cellWidth: 22, halign: 'center' }, // Order total
          9: { cellWidth: 22, halign: 'center' }, // Paid
          10: { cellWidth: 20, halign: 'center' } // Debt
        },
        margin: { left: 10, right: 10 },
        theme: 'grid',
        tableWidth: 'wrap'
      });

      // Position for summary (after table, possibly new page)
      let summaryY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : currentY + 8;
      if (summaryY + 30 > pageHeight) {
        doc.addPage();
        summaryY = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

  // Summary lines
  doc.text(`Phat sinh trong ky: ${this.formatNumberVN(periodTotalRevenue)} VND`, 14, summaryY);
      summaryY += 6;
  doc.text(`Da thanh toan trong ky: ${this.formatNumberVN(periodPaid)} VND`, 14, summaryY);
      summaryY += 6;
  doc.text(`No cuoi ky (con lai): ${this.formatNumberVN(periodDebt)} VND`, 14, summaryY);
      summaryY += 8;

      // Account line: use user name + current time
      const now = new Date();
      const pad2 = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
      const dateStr = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()}`;
      const accountName = this.convertVietnameseToLatin(userInfo.name || firstOrderUser.name || '');
      if (accountName) {
        doc.text(`Account: ${accountName}_${timeStr}_${dateStr}`, 14, summaryY);
        summaryY += 8;
      }

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

    getPeriodText() {
      // If both from/to selected and are the same day, show weekday-style text
      if (this.form.from && this.form.to && this.form.from === this.form.to) {
        const date = new Date(this.form.from);
        const weekday = this.getVietnameseWeekday(date.getDay());
        const [year, month, day] = this.form.from.split('-');
        return `Tu: ${weekday} ngay ${day}/${month}/${year}`;
      }

      if (this.form.from && this.form.to) {
        return `Tu: ${this.formattedFromDate} den: ${this.formattedToDate}`;
      }

      if (this.form.from) {
        const [year, month, day] = this.form.from.split('-');
        return `Tu: ${day}/${month}/${year}`;
      }

      return '';
    },

    getVietnameseWeekday(dayIndex) {
      const days = [
        'Chu Nhat',
        'Thu Hai',
        'Thu Ba',
        'Thu Tu',
        'Thu Nam',
        'Thu Sau',
        'Thu Bay'
      ];
      return days[dayIndex] || '';
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
