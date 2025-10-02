# web_giaybongda

## Giới thiệu

**web_giaybongda** là một website bán giày bóng đá trực tuyến, cho phép người dùng xem, tìm kiếm, đặt mua sản phẩm và quản lý đơn hàng. Trang web được xây dựng bởi **Nguyễn Khắc Thanh Liêm**.

## Chức năng chính

- **Trang người dùng:**
  - Xem danh sách sản phẩm giày bóng đá với hình ảnh, giá, mô tả, màu sắc, size.
  - Tìm kiếm, lọc và sắp xếp sản phẩm theo tên, nhãn hàng, giá.
  - Xem chi tiết sản phẩm, chọn màu, size, số lượng và đặt hàng.
  - Quản lý giỏ hàng, xem trạng thái đơn hàng.
  - Đăng ký, đăng nhập, đăng xuất tài khoản.

- **Trang quản trị (Admin):**
  - Quản lý sản phẩm: thêm, sửa, xóa sản phẩm.
  - Quản lý người dùng: xem, sửa, xóa tài khoản (trừ admin).
  - Thống kê doanh thu theo sản phẩm, nhãn hàng.

## Công nghệ sử dụng

- **Frontend:** HTML, CSS (TailwindCSS), JavaScript (Vanilla JS)
- **Backend:** Node.js (Express), MySQL
- **Quản lý trạng thái:** localStorage (trên trình duyệt)
- **API:** RESTful giữa frontend và backend

## Cách hoạt động

1. **Người dùng truy cập website** để xem danh sách sản phẩm.
2. **Đăng ký/Đăng nhập** để sử dụng các chức năng đặt hàng, quản lý đơn hàng.
3. **Chọn sản phẩm**, màu sắc, size, số lượng và đặt hàng. Đơn hàng sẽ được lưu vào cơ sở dữ liệu.
4. **Admin đăng nhập** để quản lý sản phẩm, người dùng và xem thống kê doanh thu.

## Hướng dẫn cài đặt & chạy

1. **Clone dự án về máy:**
   ```sh
   git clone <repo-url>
   cd web_giaybongda-demo3
