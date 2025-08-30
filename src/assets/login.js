document.addEventListener('DOMContentLoaded', function() {
    // Lấy form và element hiển thị lỗi
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
// Lấy giá trị từ form
const username = form.username.value.trim();
const password = form.password.value;

// Kiểm tra dữ liệu trước khi gửi
if (!username || !password) {
    if (errorEl) {
        errorEl.textContent = 'Vui lòng điền đầy đủ thông tin!';
    }
    return;
}

// Sử dụng hàm login từ auth-api.js
window.login(username, password, function(data) {
    if (data.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Điều hướng dựa vào role
        if (data.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        // Hiển thị thông báo lỗi
        if (errorEl) {
            errorEl.textContent = data.error || 'Sai tài khoản hoặc mật khẩu!';
        }
    }
})
.catch(function(error) {
    if (errorEl) {
        errorEl.textContent = 'Có lỗi xảy ra. Vui lòng thử lại!';
    }
});
        });
    }
});
