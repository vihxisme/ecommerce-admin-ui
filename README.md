# 🚀 Microservices Project (Tìm hiểu về kiến trúc microservice và ứng dụng xây dựng website thương mại điện tử)

# Shop Admin

Đây là website quản trị (admin) cho nền tảng thương mại điện tử, được xây dựng bằng Vue 3 và Vite.

## Liên kết dự án
- **Client UI**: [Ecommerce-Client-UI](https://github.com/vihxisme/ecommerce-client-ui.git)
- **Backend**: [MicroService-Project](https://github.com/vihxisme/MicroService-Project.git)

## Tính năng
- Quản lý sản phẩm, danh mục: thêm, sửa, xóa sản phẩm
- Quản lý đơn hàng và trạng thái giao hàng, in hóa đơn, thanh toán
- Quản lý giảm giá
- Xuất dữ liệu sang .xlsx
- Dashboard hiển thị các số liệu thống kê
- Giao diện tối ưu cho quản trị viên

## Công nghệ sử dụng
- **Frontend Framework**: Vue 3
- **Build Tool**: Vite
- **State Management**: Pinia (hoặc Vuex nếu cần)
- **CSS Framework**: Tailwind CSS

## Cài đặt dự án

### Cài đặt các thư viện
Chạy lệnh sau để cài đặt các thư viện cần thiết:
```
npm install
```

### Chạy server phát triển
Để khởi động server phát triển với tính năng hot-reload, sử dụng:
```
npm run dev
```

### Build cho môi trường sản xuất
Để biên dịch và tối ưu hóa ứng dụng cho môi trường sản xuất, chạy:
```
npm run build
```

### Kiểm tra và sửa lỗi code
Để kiểm tra và tự động sửa lỗi code, chạy:
```
npm run lint
```

## Cấu trúc thư mục
- `src/`: Chứa mã nguồn chính của ứng dụng
  - `components/`: Các thành phần giao diện dùng chung
  - `pages/`: Các trang quản trị
  - `stores/`: Quản lý trạng thái ứng dụng (Pinia hoặc Vuex)
  - `styles/`: Các tệp CSS/Tailwind tùy chỉnh
  - `utils/`: Các hàm tiện ích
- `public/`: Chứa các tệp tĩnh như favicon, hình ảnh

## Tùy chỉnh cấu hình
Xem thêm chi tiết về cấu hình tại [Vite Configuration Reference](https://vitejs.dev/config/).

## License
Dự án được phát hành dưới giấy phép MIT.