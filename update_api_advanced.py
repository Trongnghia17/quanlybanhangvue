"""
Script Python để tự động cập nhật tất cả file API
Chạy: python update_api_advanced.py
"""
import re
import os

# Danh sách file cần cập nhật (đã loại trừ auth.js, dashboard.js, customers.js)
api_files = [
    'category.js',
    'inventories.js',
    'order.js',
    'products.js',
    'receipt_payment.js',
    'receipt_type.js',
    'report.js',
    'storage.js',
    'suppliers.js'
]

api_folder = 'src/api'

def update_file(filename):
    filepath = os.path.join(api_folder, filename)
    
    if not os.path.exists(filepath):
        print(f"❌ File không tồn tại: {filename}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern để tìm và thay thế các axios call
    # Tìm: await axios({ ... baseURL: URL.BASE_URL ... Authorization: ... })
    pattern = r'await axios\(\{\s*url:\s*([^,]+),\s*method:\s*([^,]+),\s*baseURL:\s*URL\.BASE_URL,\s*headers:\s*\{[^}]*Authorization:[^}]+\},\s*(params|data):\s*(\{[^}]+\}|\[[^\]]+\]|[^,}]+),?\s*\}\)'
    
    # Đơn giản hóa: thay axios thành axiosInstance và xóa baseURL + headers
    def replace_axios_call(match):
        full_match = match.group(0)
        
        # Kiểm tra xem có responseType không
        has_response_type = 'responseType' in full_match
        
        # Kiểm tra xem có headers đặc biệt không (Content-Type, Accept)
        has_special_headers = 'Content-Type' in full_match or 'Accept' in full_match
        
        # Tạo replacement đơn giản
        new_call = full_match.replace('await axios({', 'await axiosInstance({')
        new_call = re.sub(r',\s*baseURL:\s*URL\.BASE_URL', '', new_call)
        
        # Xóa Authorization header
        new_call = re.sub(
            r',?\s*headers:\s*\{\s*[\'"]Access-Control-Allow-Origin[\'"]\s*:\s*[\'"][\*][\'"],\s*Authorization:[^}]+\}',
            '',
            new_call
        )
        
        # Nếu có headers đặc biệt, giữ lại nhưng xóa Authorization
        if has_special_headers:
            new_call = re.sub(
                r'Authorization:\s*Cookies\.get\([\'"]token[\'"]\)[^,]*,?\s*',
                '',
                new_call
            )
            new_call = re.sub(r'[\'"]Access-Control-Allow-Origin[\'"]\s*:\s*[\'"][\*][\'"],?\s*', '', new_call)
        
        return new_call
    
    # Thử cách khác: tìm pattern đơn giản hơn
    # Tìm tất cả function có await axios
    functions = re.finditer(
        r'(async \w+\([^)]*\)\s*\{[^}]*await axios\(\{[^}]*\}\);?\s*\})',
        content,
        re.DOTALL
    )
    
    count = 0
    for func_match in functions:
        old_func = func_match.group(0)
        new_func = old_func
        
        # Thay axios thành axiosInstance
        new_func = new_func.replace('await axios({', 'await axiosInstance({')
        
        # Xóa baseURL
        new_func = re.sub(r',?\s*baseURL:\s*URL\.BASE_URL', '', new_func)
        
        # Xóa toàn bộ headers block nếu chỉ có Authorization
        new_func = re.sub(
            r',?\s*headers:\s*\{\s*[\'"]Access-Control-Allow-Origin[\'"]\s*:\s*[\'"][\*][\'"],?\s*Authorization:\s*Cookies\.get\([\'"]token[\'"]\)[^}]*\}',
            '',
            new_func,
            flags=re.DOTALL
        )
        
        if old_func != new_func:
            content = content.replace(old_func, new_func)
            count += 1
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Đã cập nhật {count} functions trong {filename}")
    else:
        print(f"⚠️  Không có thay đổi nào trong {filename}")

if __name__ == '__main__':
    print('🚀 Bắt đầu cập nhật các file API...\n')
    
    for filename in api_files:
        print(f'📝 Đang xử lý: {filename}')
        try:
            update_file(filename)
        except Exception as e:
            print(f'❌ Lỗi: {e}')
        print()
    
    print('✨ Hoàn thành!')
