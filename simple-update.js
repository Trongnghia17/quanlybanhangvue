const fs = require('fs');
const path = require('path');

const files = ['category.js', 'inventories.js', 'order.js', 'products.js', 'receipt_payment.js', 'receipt_type.js', 'report.js', 'storage.js', 'suppliers.js'];

// Pattern to replace - exact match from files
const pattern1 = `return await axios({
      url: apiState.`;

const replacement1 = `return await axiosInstance({
      url: apiState.`;

const pattern2 = `,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? \`Bearer \${Cookies.get('token')}\`
            : '',
      },`;

const replacement2 = `,`;

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'api', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import
  if (!content.includes("import axiosInstance from '@/utils/axios'")) {
    content = content.replace(
      "import axios from 'axios'",
      "import axios from 'axios'\nimport axiosInstance from '@/utils/axios'"
    );
  }
  
  // Replace all axios calls
  content = content.split(pattern1).join(replacement1);
  content = content.split(pattern2).join(replacement2);
  
  // Handle the case where Content-Type is present
  const pattern3 = `,
      baseURL: URL.BASE_URL,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? \`Bearer \${Cookies.get('token')}\`
            : '',
        'Content-Type': 'multipart/form-data'
      },`;
  
  const replacement3 = `,
      headers: {
        'Content-Type': 'multipart/form-data'
      },`;
  
  content = content.split(pattern3).join(replacement3);
  
  // Handle blob responses
  const pattern4 = `,
      baseURL: URL.BASE_URL,
      responseType: 'blob',
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization:
          Cookies.get('token') != (null || undefined)
            ? \`Bearer \${Cookies.get('token')}\`
            : '',
      },`;
  
  const replacement4 = `,
      responseType: 'blob',`;
  
  content = content.split(pattern4).join(replacement4);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file}`);
});

console.log('\n✨ Complete!');
