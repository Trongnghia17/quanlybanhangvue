const fs = require('fs');
const path = require('path');

const files = [
  'category.js',
  'inventories.js', 
  'order.js',
  'products.js',
  'receipt_payment.js',
  'receipt_type.js',
  'report.js',
  'storage.js',
  'suppliers.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'api', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace await axios({ with await axiosInstance({
  content = content.replace(/await axios\(\{/g, 'await axiosInstance({');
  
  // Remove baseURL: URL.BASE_URL,
  content = content.replace(/,?\s*baseURL:\s*URL\.BASE_URL,?\s*/g, '');
  
  // Remove entire headers block with just Authorization
  content = content.replace(/,?\s*headers:\s*\{\s*'Access-Control-Allow-Origin':\s*'\*',\s*Authorization:\s*Cookies\.get\('token'\)[^}]*\},?\s*/gs, '');
  
  // Clean up double commas
  content = content.replace(/,,/g, ',');
  
  // Clean up trailing commas before closing braces
  content = content.replace(/,(\s*)\}/g, '$1}');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${file}`);
});

console.log('\n✨ All files updated! Please verify the changes.');
