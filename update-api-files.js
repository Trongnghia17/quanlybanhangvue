/**
 * Script để cập nhật tất cả các file API để sử dụng axios interceptor
 * Chạy: node update-api-files.js
 */

const fs = require('fs');
const path = require('path');

const apiFolder = path.join(__dirname, 'src', 'api');

// Danh sách các file API cần cập nhật (trừ auth.js đã được sửa)
const apiFiles = [
  'category.js',
  'customers.js',
  'dashboard.js',
  'inventories.js',
  'order.js',
  'products.js',
  'receipt_payment.js',
  'receipt_type.js',
  'report.js',
  'storage.js',
  'suppliers.js'
];

// Function để cập nhật nội dung file
function updateApiFile(filename) {
  const filePath = path.join(apiFolder, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File không tồn tại: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Thêm import axiosInstance nếu chưa có
  if (!content.includes('@/utils/axios')) {
    // Tìm dòng import axios
    const axiosImportRegex = /import axios from 'axios'/;
    if (axiosImportRegex.test(content)) {
      content = content.replace(
        axiosImportRegex,
        "import axios from 'axios'\nimport axiosInstance from '@/utils/axios'"
      );
      console.log(`✅ Đã thêm import axiosInstance vào ${filename}`);
    }
  }

  // 2. Thay thế axios({ ... baseURL: URL.BASE_URL ... }) bằng axiosInstance()
  // Tìm tất cả các axios call có baseURL và Authorization header
  const axiosCallRegex = /axios\(\{\s*url:([^}]+)baseURL:\s*URL\.BASE_URL,\s*headers:\s*\{[^}]*Authorization:[^}]+\},[^}]*\}\)/gs;
  
  // Đếm số lượng thay thế
  const matches = content.match(axiosCallRegex);
  if (matches) {
    content = content.replace(
      /await axios\(\{(\s*)url:\s*([^,]+),(\s*)method:\s*([^,]+),(\s*)baseURL:\s*URL\.BASE_URL,(\s*)headers:\s*\{(\s*)'Access-Control-Allow-Origin':\s*'\*',(\s*)Authorization:(\s*)Cookies\.get\('token'\)\s*!=\s*\(null\s*\|\|\s*undefined\)(\s*)\?\s*`Bearer\s*\$\{Cookies\.get\('token'\)\}`(\s*):\s*'',(\s*)\},/gs,
      'await axiosInstance({$1url: $2,$3method: $4,'
    );
    
    console.log(`✅ Đã cập nhật ${matches.length} API calls trong ${filename}`);
  } else {
    console.log(`⚠️  Không tìm thấy pattern cần thay thế trong ${filename}`);
  }

  // Ghi file
  fs.writeFileSync(filePath, content, 'utf8');
}

// Cập nhật tất cả các file
console.log('🚀 Bắt đầu cập nhật các file API...\n');

apiFiles.forEach(filename => {
  console.log(`📝 Đang xử lý: ${filename}`);
  try {
    updateApiFile(filename);
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý ${filename}:`, error.message);
  }
  console.log('');
});

console.log('✨ Hoàn thành! Vui lòng kiểm tra lại các file đã được cập nhật.');
console.log('⚠️  Lưu ý: Bạn vẫn cần kiểm tra thủ công một số trường hợp đặc biệt.');
