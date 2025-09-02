const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the web root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve files from src directory
app.use('/src', express.static(path.join(__dirname, '../src')));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Liemdz2005',
    database: 'giaybongda'
};

// Database connection
const db = mysql.createConnection(dbConfig);

// Connect and handle reconnection
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

// Initialize database connection
connectDB();

// API: Cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, brand, price, image, description, stock } = req.body;

    // Log request data
    console.log('Update request:', {
        id,
        body: req.body
    });

    // Convert values to proper types
    const numericStock = parseInt(stock || 0);
    const numericPrice = parseInt(price || 0);

    const query = `
        UPDATE products 
        SET name = ?, 
            brand = ?, 
            price = ?, 
            image = ?, 
            description = ?, 
            stock = ? 
        WHERE id = ?
    `;

    db.query(
        query,
        [name, brand, numericPrice, image, description, numericStock, id],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    error: 'Database error', 
                    details: err.message 
                });
            }

            // Check if any row was updated
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Product not found',
                    details: `No product found with id ${id}`
                });
            }

            // Return updated product
            db.query('SELECT * FROM products WHERE id = ?', [id], (err, products) => {
                if (err) {
                    console.error('Error fetching updated product:', err);
                    return res.status(500).json({ 
                        error: 'Database error',
                        details: err.message
                    });
                }
                res.json(products[0]);
            });
        }
    );
});

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

// API endpoints continue...

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
            image,
            brand,
            colors,
            sizes,
            stock,
            description,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM products
    `;
    
    console.log('Executing query:', query);
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: {
                    message: 'Database query failed',
                    details: err.message
                }
            });
        }
        
        console.log('Query results:', results);
        console.log('Number of products:', results ? results.length : 0);
        res.json(results);
    });
});

// API: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
    try {
        console.log('Received product data:', req.body); // Debug log
        
        const { name, brand, price, image, description, stock } = req.body;
        
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

            image: image.trim(),
            description: description.trim(),
            stock: parseInt(stock),
            created_at: new Date() // Thêm created_at
        };

        // Log product data before insertion
        console.log('Product data to insert:', productData);

        // Insert new product
        db.query('INSERT INTO products SET ?', productData, (err, result) => {
            if (err) {
                console.error('Lỗi khi thêm sản phẩm:', err);
                console.error('SQL Error:', err.sqlMessage); // Log SQL error message
                
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
                `SELECT id, name, code, price, 
                        image, brand, stock, description, createdAt
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
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    
    // Log toàn bộ request body để debug
    console.log('Update request body:', req.body);
    
    const { name, brand, price, image, description, stock } = req.body;
    
    // Log extracted values
    console.log('Extracted values:', {
        name, brand, price, image, description, stock,
        stockType: typeof stock
    });

    // Convert values to correct types
    const updateData = {
        name: String(name || ''),
        brand: String(brand || ''),
        price: Number(price || 0),
        stock: Number(stock || 0),
        image: String(image || ''),
        description: String(description || '')
    };

    // Log final update data
    console.log('Final update data:', updateData);

    const query = 'UPDATE products SET name = ?, brand = ?, price = ?, image = ?, description = ?, stock = ? WHERE id = ?';
    db.query(query, [
        updateData.name,
        updateData.brand,
        updateData.price,
        updateData.image,
        updateData.description,
        updateData.stock,
        id
    ], (err) => {
        if (err) return res.status(500).json({ error: err });
        
        // Trả về sản phẩm sau khi cập nhật
        db.query('SELECT * FROM products WHERE id = ?', [id], (err, products) => {
            if (err) return res.status(500).json({ error: err });
            res.json(products[0]);
        });
    });
});

// API: Xóa sản phẩm và cập nhật lại ID
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    // Bắt đầu transaction để đảm bảo tính nhất quán của dữ liệu
    db.beginTransaction(async (err) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        try {
            // 1. Xóa sản phẩm
            await new Promise((resolve, reject) => {
                db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // 2. Cập nhật lại ID của các sản phẩm còn lại
            await new Promise((resolve, reject) => {
                db.query(
                    `SET @count = 0; 
                     UPDATE products 
                     SET id = @count := @count + 1 
                     ORDER BY created_at;
                     ALTER TABLE products AUTO_INCREMENT = 1;`,
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            // Commit transaction nếu mọi thứ OK
            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: err });
                    });
                }
                res.json({ success: true, id });
            });
        } catch (error) {
            return db.rollback(() => {
                res.status(500).json({ error });
            });
        }
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

// API: Lấy doanh thu theo sản phẩm
app.get('/api/statistics/products', (req, res) => {
    const query = `
        SELECT 
            p.id,
            p.name,
            p.code,
            p.brand,
            p.price,
            p.stock,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(oi.quantity), 0) as total_quantity,
            COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
            p.created_at
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'Đã hủy'
        GROUP BY p.id, p.name, p.code, p.brand, p.price, p.stock, p.created_at
        ORDER BY total_revenue DESC, p.created_at DESC
    `;
    
    console.log('Executing product revenue query...');
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error in product revenue query:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Found ${results.length} products with revenue data`);
        res.json(results);
    });
});

// API: Lấy doanh thu theo nhãn hàng
app.get('/api/statistics/brands', (req, res) => {
    const query = `
        SELECT 
            p.brand,
            COUNT(DISTINCT p.id) as total_products,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(oi.quantity), 0) as total_quantity,
            COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
            SUM(p.stock) as total_stock,
            MIN(p.created_at) as first_product_date
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'Đã hủy'
        WHERE p.brand IS NOT NULL
        GROUP BY p.brand
        ORDER BY total_revenue DESC, total_products DESC
    `;
    
    console.log('Executing brand revenue query...');
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error in brand revenue query:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Found ${results.length} brands with revenue data`);
        res.json(results);
    });
});

// API: Lấy thống kê doanh thu theo thời gian
app.get('/api/statistics/timeline', (req, res) => {
    const { start_date, end_date, group_by } = req.query;
    let timeFormat;
    let groupBy;
    
    switch(group_by) {
        case 'day':
            timeFormat = '%Y-%m-%d';
            groupBy = 'DATE(o.created_at)';
            break;
        case 'month':
            timeFormat = '%Y-%m';
            groupBy = 'DATE_FORMAT(o.created_at, "%Y-%m")';
            break;
        case 'year':
            timeFormat = '%Y';
            groupBy = 'YEAR(o.created_at)';
            break;
        default:
            timeFormat = '%Y-%m-%d';
            groupBy = 'DATE(o.created_at)';
    }

    const query = `
        SELECT 
            ${groupBy} as time_period,
            COUNT(DISTINCT o.id) as total_orders,
            COUNT(DISTINCT o.user_id) as total_customers,
            COALESCE(SUM(oi.quantity), 0) as total_items,
            COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status != 'Đã hủy'
        ${start_date ? `AND o.created_at >= ?` : ''}
        ${end_date ? `AND o.created_at <= ?` : ''}
        GROUP BY time_period
        ORDER BY time_period DESC
    `;

    const params = [
        ...(start_date ? [start_date] : []),
        ...(end_date ? [end_date] : [])
    ];

    console.log('Executing timeline revenue query...', {query, params});
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error in timeline revenue query:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Found ${results.length} time periods with revenue data`);
        res.json(results);
    });
});

// API: Lấy tổng quan thống kê
app.get('/api/statistics/overview', (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM products) as total_products,
            (SELECT COUNT(DISTINCT brand) FROM products WHERE brand IS NOT NULL) as total_brands,
            (SELECT COUNT(*) FROM users WHERE role = 'user') as total_customers,
            (SELECT COUNT(*) FROM orders WHERE status != 'Đã hủy') as total_orders,
            COALESCE((
                SELECT SUM(oi.quantity * oi.price) 
                FROM order_items oi 
                JOIN orders o ON oi.order_id = o.id 
                WHERE o.status != 'Đã hủy'
            ), 0) as total_revenue,
            (SELECT SUM(stock) FROM products) as total_stock,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'status', status,
                        'count', cnt
                    )
                )
                FROM (
                    SELECT status, COUNT(*) as cnt
                    FROM orders
                    GROUP BY status
                ) as status_counts
            ) as order_status_counts
    `;

    console.log('Executing statistics overview query...');
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error in statistics overview query:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log('Server đang chạy tại http://localhost:' + PORT);
});
