// Kiểm tra quyền admin và khởi tạo trang
document.addEventListener('DOMContentLoaded', async () => {
    // Kiểm tra quyền admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // Load danh sách người dùng
    await loadUsers();
});

// Trong file: ../assets/user-management.js

async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3001/api/users');
        const users = await response.json();

        const usersList = document.getElementById('users-list');

        usersList.innerHTML = users.map(user => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="editUser(${user.id})" class="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700 transition-colors">Sửa</button>

                        <button onclick="confirmDeleteUser(${user.id}, '${user.username}')" class="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
    }
}

// Hiển thị form sửa thông tin người dùng
async function editUser(userId) {
    try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}`);
        const user = await response.json();
        
        document.getElementById('user-id').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        
        document.getElementById('user-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
}

// Xác nhận xóa người dùng
function confirmDeleteUser(userId, username) {
    if (confirm(`Bạn có chắc muốn xóa người dùng "${username}"?`)) {
        deleteUser(userId);
    }
}

// Xóa người dùng
async function deleteUser(userId) {
    try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadUsers(); // Tải lại danh sách sau khi xóa
        } else {
            alert('Không thể xóa người dùng');
        }
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
    }
}

// Xử lý form cập nhật thông tin người dùng
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value;
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };

    try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            document.getElementById('user-modal').classList.add('hidden');
            await loadUsers(); // Tải lại danh sách sau khi cập nhật
        } else {
            alert('Không thể cập nhật thông tin người dùng');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    }
});

// Đóng modal
document.getElementById('user-cancel').addEventListener('click', () => {
    document.getElementById('user-modal').classList.add('hidden');
});
