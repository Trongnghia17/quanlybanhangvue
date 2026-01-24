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
  
  // Fix broken patterns first - remove orphaned backtick patterns
  content = content.replace(/method:\s*[^,\n]+`\s*:\s*''/gs, 'method: apiState.$1.method');
  
  // More aggressive cleanup - remove the broken remnants
  content = content.replace(/,?\s*method:\s*([^\s,]+)`[^}]*:\s*''\s*}/gs, ',\n      method: $1');
  
  // Remove specific broken pattern
  content = content.replace(/method:\s*apiState\.\w+\.method`\s*:\s*''\s*}/gs, 'method: apiState.$&.method\n    }');
  
  // Actually let's just reconstruct the files properly
  // Remove everything from Authorization onwards until the next property or closing
  content = content.replace(
    /Authorization:\s*Cookies\.get\('token'\)\s*!=\s*\(null\s*\|\|\s*undefined\)\s*\?\s*`Bearer\s*\$\{Cookies\.get\('token'\)\}`\s*:\s*'',?\s*\}/gs,
    ''
  );
  
  // Clean up broken method lines
  content = content.replace(
    /method:\s*apiState\.\w+\.method`[^}]*:\s*''\s*\}/gs,
    (match) => {
      return '}';
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
});

console.log('\n✨ All files fixed!');
