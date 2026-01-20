# Hướng dẫn Deploy Production

## 🚀 Cách deploy lên server

### 1. Cấu hình Backend API URL

Mở file `.env.production` và thay đổi URL backend:

```bash
VUE_APP_API_BASE_URL=https://api.yourdomain.com/api
```

**Ví dụ:**
- Nếu backend ở: `https://api.retailease.com`
  → `VUE_APP_API_BASE_URL=https://api.retailease.com/api`
  
- Nếu backend ở cùng domain: `https://retailease.com`
  → `VUE_APP_API_BASE_URL=https://retailease.com/api`

### 2. Build Production

```bash
npm run build
```

Lệnh này sẽ:
- Đọc cấu hình từ `.env.production`
- Tạo folder `dist/` với file đã được tối ưu hóa
- Thay thế `process.env.VUE_APP_API_BASE_URL` bằng URL thực

### 3. Deploy folder `dist/`

Upload folder `dist/` lên server của bạn:

#### Option 1: Upload lên hosting (Hostinger, cPanel, etc.)
```bash
# Zip folder dist
zip -r dist.zip dist/

# Upload dist.zip lên hosting và giải nén
```

#### Option 2: Deploy lên VPS/Server
```bash
# Sử dụng SCP
scp -r dist/* user@your-server:/var/www/html/

# Hoặc sử dụng FTP/SFTP client
```

#### Option 3: Deploy lên Netlify/Vercel
```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

### 4. Cấu hình Nginx (Nếu dùng VPS)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests (nếu backend cùng server)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 Môi trường khác nhau

### Development (Local)
```bash
npm run serve
# Sử dụng .env.development
# API: http://localhost:8000/api
```

### Production (Server)
```bash
npm run build
# Sử dụng .env.production
# API: https://api.yourdomain.com/api
```

### Staging (Test server)
Tạo file `.env.staging`:
```bash
VUE_APP_API_BASE_URL=https://staging-api.yourdomain.com/api
```

Build staging:
```bash
npm run build --mode staging
```

## 📋 Checklist trước khi deploy

- [ ] Cập nhật `VUE_APP_API_BASE_URL` trong `.env.production`
- [ ] Chạy `npm run build`
- [ ] Kiểm tra folder `dist/` đã được tạo
- [ ] Test API URL có đúng không (mở DevTools > Network)
- [ ] Đảm bảo CORS được cấu hình đúng trên backend Laravel
- [ ] Upload `dist/` lên server
- [ ] Cấu hình web server (Nginx/Apache)

## 🌐 Cấu hình CORS trên Laravel Backend

File: `config/cors.php`
```php
'paths' => ['api/*'],
'allowed_origins' => ['https://yourdomain.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## 🔍 Debug Production

Nếu API không hoạt động sau khi deploy:

1. Mở DevTools (F12) > Console
2. Kiểm tra Network tab xem API call đến đâu
3. Kiểm tra lỗi CORS
4. Verify `.env.production` đã được build đúng

```bash
# Xem file build để kiểm tra URL
grep -r "VUE_APP_API_BASE_URL" dist/
```
