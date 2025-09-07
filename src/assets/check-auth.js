// Kiểm tra quyền truy cập
function checkAccess() {
    const user = JSON.parse(localStorage.getItem('user'));
    const currentPage = window.location.pathname;

    if (!user) {
        // Nếu chưa đăng nhập, chuyển về trang login
        window.location.href = '/src/pages/login.html';
        return;
    }

    if (user.role === 'admin') {
        // Nếu là admin và đang cố truy cập trang index.html
        if (currentPage.includes('index.html')) {
            window.location.href = '/src/pages/revenue-statistics.html';
        }
    } else {
        // Nếu là user thường và cố truy cập trang admin
        if (currentPage.includes('revenue-statistics.html') || 
            currentPage.includes('user-management.html') || 
            currentPage.includes('product-management.html')) {
            window.location.href = '/src/pages/index.html';
        }
    }
}

// Chạy kiểm tra khi trang được load
document.addEventListener('DOMContentLoaded', checkAccess);
