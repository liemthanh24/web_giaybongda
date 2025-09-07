// auth-api.js
// Đăng nhập và đăng ký

// Define functions in the global scope
window.login = function(username, password, callback) {
    console.log('Đang đăng nhập với:', { username, password });
    fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Phản hồi từ server:', data);
        if (data.error) {
            callback({ success: false, error: data.error });
        } else {
            callback(data);
        }
    })
    .catch(err => {
        console.error('Lỗi đăng nhập:', err);
        callback({ success: false, error: 'Lỗi kết nối đến server' });
    });
}

window.register = function(username, password, email, role, callback) {
    fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, role })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        return res.json();
    })
    .then(data => {
        callback(data);
    })
    .catch(err => {
        console.error('Lỗi đăng ký:', err);
    });
}

// Ví dụ sử dụng:
// login('user', 'pass', function(data) { ... });
// register('user', 'pass', 'email', function(data) { ... });
