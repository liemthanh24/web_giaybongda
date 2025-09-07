document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = form.username.value;
            const password = form.password.value;
            const confirm = form.confirm.value;
            const email = form.email.value;
            const role = form.type.value;
            const errorEl = document.getElementById('register-error');
            if (password !== confirm) {
                errorEl.textContent = 'Mật khẩu xác nhận không khớp!';
                return;
            }
            // Use the register function from auth-api.js
            register(username, password, email, role, function(data) {
                if (data.success) {
                    alert('Đăng ký thành công!');
                    // Lưu thông tin user và điều hướng dựa trên role
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.role === 'admin') {
                        window.location.href = 'revenue-statistics.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    errorEl.textContent = (data.error && (data.error.sqlMessage || data.error.message)) || 'Đăng ký thất bại!';
                    console.error('Lỗi đăng ký:', data.error);
                }
            });
        });
    }
});