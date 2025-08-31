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

// API: Lấy danh sách người dùng
app.get('/api/users', (req, res) => {
    console.log('Đang lấy danh sách người dùng...');
    db.query('SELECT id, username, email, role, created_at FROM users', (err, results) => {
        if (err) {
            console.error('Lỗi khi query users:', err);
            return res.status(500).json({ error: err });
        }
        console.log('Danh sách người dùng:', results);
        res.json(results);
    });
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // đổi thành user MySQL của bạn
    password: 'Liemdz2005', // đổi thành password MySQL của bạn
    database: 'giaybongda'
});

// Kết nối database
function connectDB() {
    db.connect((err) => {
        if (err) {
            console.error('Lỗi kết nối MySQL:', err);
            setTimeout(connectDB, 2000);
        } else {
            console.log('Kết nối MySQL thành công!');
        }
    });
}

// Xử lý khi mất kết nối
db.on('error', function(err) {
    console.error('Lỗi database:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        connectDB();
    } else {
        throw err;
    }
});

connectDB();

// Helper function để tạo ID sản phẩm
function generateProductCode(brand) {
    // Generate code like KM001, MZ002, etc.
    return new Promise((resolve, reject) => {
        try {
            if (!brand) {
                reject(new Error('Brand is required'));
                return;
            }
            
            const prefix = brand.substring(0, 2).toUpperCase();
            
            // Lấy code cuối cùng của brand này
            db.query('SELECT code FROM products WHERE brand = ? ORDER BY code DESC LIMIT 1', [brand], (err, results) => {
                if (err) {
                    console.error('Lỗi khi tạo mã sản phẩm:', err);
                    reject(err);
                    return;
                }
                
                try {
                    if (results.length === 0) {
                        resolve(`${prefix}001`);
                    } else {
                        const lastCode = results[0].code;
                        const num = parseInt(lastCode.slice(-3)) + 1;
                        resolve(`${prefix}${num.toString().padStart(3, '0')}`);
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý mã sản phẩm:', error);
                    reject(error);
                }
            });
        } catch (error) {
            console.error('Lỗi khi tạo mã sản phẩm:', error);
            reject(error);
        }
    });
}

// API: Lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    const query = `
        SELECT 
            id, 
            name, 
            code,
            price,
            old_price as oldPrice,
            image,
            brand,
            stock,
            description
        FROM products
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// API: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
    try {
        const { name, brand, price, old_price, image, description, stock } = req.body;
        
        // Validate input
        const errors = [];
        if (!name || name.trim() === '') errors.push('Tên sản phẩm là bắt buộc');
        if (!brand || brand.trim() === '') errors.push('Nhãn hiệu là bắt buộc');
        if (!price || isNaN(price) || price <= 0) errors.push('Giá phải lớn hơn 0');
        if (!stock || isNaN(stock) || stock < 0) errors.push('Số lượng không hợp lệ');
        if (!image || image.trim() === '') errors.push('Link ảnh là bắt buộc');
        if (!description || description.trim() === '') errors.push('Mô tả là bắt buộc');

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: errors
            });
        }

        // Generate product code
        let code;
        try {
            code = await generateProductCode(brand);
        } catch (error) {
            console.error('Error generating product code:', error);
            return res.status(500).json({ error: 'Could not generate product code' });
        }
        
        const productData = {
            name: name.trim(),
            code: code,
            brand: brand.trim(),
            price: parseInt(price),
            old_price: old_price ? parseInt(old_price) : null,
            image: image.trim(),
            description: description.trim(),
            stock: parseInt(stock)
        };

        // Insert new product
        db.query('INSERT INTO products SET ?', productData, (err, result) => {
            if (err) {
                console.error('Lỗi khi thêm sản phẩm:', err);
                // Kiểm tra lỗi trùng mã sản phẩm
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        error: 'Mã sản phẩm đã tồn tại',
                        details: ['Mã sản phẩm đã được sử dụng']
                    });
                }
                return res.status(500).json({ 
                    error: 'Lỗi khi thêm sản phẩm vào cơ sở dữ liệu',
                    details: [err.message]
                });
            }
            
            // Get inserted product
            db.query(
                `SELECT id, name, code, price, old_price as oldPrice, 
                        image, brand, stock as quantity, description
                 FROM products WHERE id = ?`, 
                [result.insertId], 
                (err, products) => {
                    if (err) {
                        console.error('Lỗi khi lấy sản phẩm vừa thêm:', err);
                        return res.status(500).json({ 
                            error: 'Could not retrieve inserted product',
                            details: err.message
                        });
                    }
                    if (!products || products.length === 0) {
                        return res.status(500).json({
                            error: 'Product was inserted but could not be retrieved'
                        });
                    }
                    res.json(products[0]);
                }
            );
        });
    } catch (error) {
        console.error('Lỗi khi xử lý thêm sản phẩm:', error);
        res.status(500).json({ error: 'Lỗi khi xử lý thêm sản phẩm: ' + error.message });
    }
});

// API: Cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, brand, price, oldPrice, image, description, quantity } = req.body;

    const query = 'UPDATE products SET name = ?, brand = ?, price = ?, oldPrice = ?, image = ?, description = ?, quantity = ? WHERE id = ?';
    db.query(query, [name, brand, price, oldPrice, image, description, quantity, id], (err) => {
        if (err) return res.status(500).json({ error: err });
        
        // Trả về sản phẩm sau khi cập nhật
        db.query('SELECT * FROM products WHERE id = ?', [id], (err, products) => {
            if (err) return res.status(500).json({ error: err });
            res.json(products[0]);
        });
    });
});

// API: Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true, id });
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

// API: Lấy danh sách người dùng
app.get('/api/users', (req, res) => {
    db.query('SELECT id, username, email, role, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// API: Lấy thông tin một người dùng
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, username, email, role FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        res.json(results[0]);
    });
});

// API: Cập nhật thông tin người dùng
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, role } = req.body;
    db.query('UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?', 
        [username, email, role, id], (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
    });
});

// API: Xóa người dùng
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    // Không cho phép xóa tài khoản admin
    db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(400).json({ error: 'Không thể xóa tài khoản admin' });
        res.json({ success: true });
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

        // Chỉ trả về các thông tin cần thiết, loại bỏ password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
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
