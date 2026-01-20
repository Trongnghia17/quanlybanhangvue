# RetailEase - Sale Management Web

Hệ thống quản lý bán hàng với Vue.js

## 📦 Cài đặt

```bash
npm install
```

## 🚀 Development (Local)

```bash
npm run serve
```

Ứng dụng sẽ chạy tại: http://localhost:8080
Backend API: http://localhost:8000/api

## 🏗️ Build Production

### 1. Cấu hình Backend URL

Mở file `.env.production` và cập nhật URL backend:

```bash
VUE_APP_API_BASE_URL=https://api.yourdomain.com/api
```

### 2. Build

```bash
npm run build
```

Kết quả được tạo trong folder `dist/`

### 3. Deploy

Upload folder `dist/` lên server của bạn.

📖 Xem chi tiết: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `VUE_APP_API_BASE_URL` | `http://localhost:8000/api` | `https://api.yourdomain.com/api` |

## 📝 Ví dụ Deploy

### Ví dụ 1: Backend ở domain riêng
```bash
# .env.production
VUE_APP_API_BASE_URL=https://api.retailease.com/api
```

### Ví dụ 2: Backend cùng domain
```bash
# .env.production
VUE_APP_API_BASE_URL=https://retailease.com/api
```

### Ví dụ 3: Backend trên VPS
```bash
# .env.production
VUE_APP_API_BASE_URL=http://your-server-ip:8000/api
```

## 🛠️ Scripts

```bash
# Development
npm run serve

# Build production
npm run build

# Lint
npm run lint
```

## 📚 Tech Stack

- Vue 2.7
- Vuetify
- Axios
- Vue Router
- Vuex
