const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the web root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve files from src directory
app.use('/src', express.static(path.join(__dirname, '../src')));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // đổi thành user MySQL của bạn
    password: 'Liemdz2005', // đổi thành password MySQL của bạn
    database: 'giaybongda'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Kết nối MySQL thành công!');
});

// API: Lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// API: Đăng ký
app.post('/api/register', (req, res) => {
    const { username, password, email, role } = req.body;
    db.query('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', [username, password, email, role], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        // Sau khi đăng ký thành công, lấy thông tin user vừa tạo
        db.query('SELECT id, username, email, role FROM users WHERE id = ?', [result.insertId], (err, users) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true, user: users[0] });
        });
    });
});

// API: Đăng nhập
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Đang xử lý đăng nhập cho:', { username, password });

    // Log để debug
    console.log('Request body:', req.body);
    
    // Truy vấn để debug
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Lỗi database:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }

        console.log('Kết quả tìm user:', results);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại' });
        }

        const user = results[0];
        console.log('Password nhập vào:', password);
        console.log('Password trong DB:', user.password);

        if (user.password !== password) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }

        // Chỉ trả về các thông tin cần thiết
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
            if (err) {
                console.error('Lỗi database:', err);
                return res.status(500).json({ error: 'Lỗi server' });
            }
            
            console.log('Kết quả truy vấn:', results);
            
            if (results.length === 0) {
                return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
            }
            
            // Trả về thông tin user không bao gồm password
            const user = results[0];
            res.json({ success: true, user: user });
    });
});

// API: Đặt hàng
app.post('/api/order', (req, res) => {
    const { user_id, items } = req.body;
    db.query('INSERT INTO orders (user_id) VALUES (?)', [user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        const orderId = result.insertId;
        const values = items.map(item => [orderId, item.product_id, item.color, item.size, item.quantity, item.price]);
        db.query('INSERT INTO order_items (order_id, product_id, color, size, quantity, price) VALUES ?', [values], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json({ success: true, orderId });
        });
    });
});

// API: Lấy giỏ hàng (đơn hàng của user)
app.get('/api/orders/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    db.query('SELECT o.id, o.status, o.created_at, oi.*, p.name, p.image FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE o.user_id = ?', [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log('Server đang chạy tại http://localhost:' + PORT);
});
