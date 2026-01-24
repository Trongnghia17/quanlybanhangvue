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

function updateFile(file) {
  const filePath = path.join(__dirname, 'src', 'api', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add import if not exists
  if (!content.includes("import axiosInstance from '@/utils/axios'")) {
    content = content.replace(
      "import axios from 'axios'",
      "import axios from 'axios'\nimport axiosInstance from '@/utils/axios'"
    );
  }
  
  // 2. Replace axios calls - more careful approach
  // Find all axios({ ... }) blocks
  const axiosCallRegex = /await axios\(\{([^}]+(?:\{[^}]+\}[^}]+)*)\}\)/gs;
  
  content = content.replace(axiosCallRegex, (match) => {
    // Check if this call has authentication (has baseURL and Authorization)
    if (match.includes('baseURL: URL.BASE_URL') && match.includes('Authorization:')) {
      // This is an authenticated call, convert it
      let newCall = match;
      
      // Replace axios with axiosInstance
      newCall = newCall.replace('await axios({', 'await axiosInstance({');
      
      // Remove baseURL line
      newCall = newCall.replace(/[\n\s]*baseURL:\s*URL\.BASE_URL,?/g, '');
      
      // Remove entire headers block for authenticated calls
      // This regex handles multi-line headers blocks
      newCall = newCall.replace(
        /[\n\s]*headers:\s*\{[\s\n]*'Access-Control-Allow-Origin':\s*'\*',[\s\n]*Authorization:[\s\S]*?\},?/g,
        ''
      );
      
      // Special case: keep headers if there are other properties besides Authorization
      // Check for responseType, Content-Type, Accept
      if (match.includes('responseType') || (match.includes('Content-Type') && !match.includes('Authorization'))) {
        // Restore headers but only keep non-auth headers
        const headersMatch = match.match(/headers:\s*\{([\s\S]*?)\}/);
        if (headersMatch) {
          const headersContent = headersMatch[1];
          // Keep only non-auth headers
          const nonAuthHeaders = headersContent
            .split(',')
            .filter(h => !h.includes('Access-Control-Allow-Origin') && !h.includes('Authorization'))
            .join(',');
          
          if (nonAuthHeaders.trim()) {
            newCall = newCall.replace(
              /responseType:/,
              `headers: {${nonAuthHeaders}},\n      responseType:`
            );
          }
        }
      }
      
      // Clean up: remove double commas and extra spaces
      newCall = newCall.replace(/,[\s\n]*,/g, ',');
      newCall = newCall.replace(/,[\s\n]*\}/g, '\n    }');
      newCall = newCall.replace(/\{[\s\n]*,/g, '{\n      ');
      
      return newCall;
    }
    
    // Return unchanged if not authenticated call
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${file}`);
}

console.log('🚀 Starting update...\n');

files.forEach(file => {
  try {
    updateFile(file);
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
});

console.log('\n✨ Done! Please check the files.');
