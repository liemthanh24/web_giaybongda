// Hàm đăng xuất
async function logout() {
    try {
        // Xóa thông tin người dùng khỏi localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Chuyển hướng về trang đăng nhập
        window.location.href = '/src/pages/login.html';
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
    }
}

// Khởi tạo xử lý dropdown menu
function initUserMenu() {
    const userOptionsToggle = document.getElementById('user-options-toggle');
    const userOptions = document.getElementById('user-options');
    
    if (userOptionsToggle && userOptions) {
        // Đảm bảo menu ẩn khi khởi tạo
        userOptions.classList.remove('show');
        
        // Toggle dropdown khi click vào icon
        userOptionsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = userOptions.classList.contains('show');
            
            // Đóng tất cả các dropdown khác trước khi mở cái mới
            document.querySelectorAll('#user-options.show').forEach(menu => {
                if (menu !== userOptions) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle menu hiện tại
            if (!isVisible) {
                userOptions.classList.add('show');
            } else {
                userOptions.classList.remove('show');
            }
        });
        
        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!userOptions.contains(e.target) && !userOptionsToggle.contains(e.target)) {
                userOptions.classList.remove('show');
            }
        });
    }

    // Thêm sự kiện cho nút đăng xuất
    const logoutButton = document.querySelector('[data-action="logout"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Khởi tạo khi trang đã load
document.addEventListener('DOMContentLoaded', initUserMenu);

// Export các hàm để sử dụng ở nơi khác
window.logout = logout;
