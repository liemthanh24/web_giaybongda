const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Chỉ cần cấu hình này là đủ cho dự án của bạn:
app.use(express.static(path.join(__dirname, '../src')));
// Nếu có thư mục assets nằm trong src, thì:
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));
// Nếu css nằm trong src/css:
app.use('/css', express.static(path.join(__dirname, '../src/css')));

// Xóa dòng này nếu không cần thiết:
// app.use(express.static(path.join(__dirname, '..')));

// Server port
const PORT = 3001;

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
    const { name, brand, price, image, description, stock, colors, sizes } = req.body;

    // Log request data
    console.log('Update request:', {
        id,
        body: req.body
    });

    // Convert values to proper types
    const numericStock = parseInt(stock || 0);
    const numericPrice = parseInt(price || 0);
    const colorsJson = colors ? JSON.stringify(colors) : null;
    const sizesJson = sizes ? JSON.stringify(sizes) : null;

    const query = `
        UPDATE products 
        SET name = ?, 
            brand = ?, 
            price = ?, 
            image = ?, 
            description = ?, 
            stock = ?,
            colors = CAST(? AS JSON),
            sizes = CAST(? AS JSON)
        WHERE id = ?
    `;

    // Ensure colors and sizes are valid JSON arrays
const colorsArray = Array.isArray(colors) ? colors : (colors ? colors.split(',') : []);
const sizesArray  = Array.isArray(sizes)  ? sizes  : (sizes ? sizes.split(',') : []);


    db.query(
        query,
        [name, brand, numericPrice, image, description, numericStock, 
         JSON.stringify(colorsArray), JSON.stringify(sizesArray), id],
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

// API: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
    try {
        const { name, brand, price, stock, image, description, colors, sizes } = req.body;

        // Validate input
        if (!name || !brand || !price) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Name, brand, and price are required'
            });
        }

        // Generate product code
        const code = await generateProductCode(brand);

        // Convert values to proper types
        const numericStock = parseInt(stock || 0);
        const numericPrice = parseInt(price || 0);
        const colorsJson = colors ? JSON.stringify(colors) : null;
        const sizesJson = sizes ? JSON.stringify(sizes) : null;

        const productData = {
            name: name.trim(),
            code: code,
            brand: brand.trim(),
            price: numericPrice,
            stock: numericStock,
            image: image?.trim() || null,
            description: description?.trim() || null,
            colors: colorsJson,
            sizes: sizesJson,
            created_at: new Date()
        };

        // Log the data being inserted
        console.log('Inserting product:', productData);

        // Insert new product
        db.query('INSERT INTO products SET ?', productData, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    error: 'Database error',
                    details: err.message
                });
            }

            // Return the created product
            db.query('SELECT * FROM products WHERE id = ?', [result.insertId], (err, products) => {
                if (err) {
                    console.error('Error fetching created product:', err);
                    return res.status(500).json({
                        error: 'Database error',
                        details: err.message
                    });
                }
                res.status(201).json(products[0]);
            });
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

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
// API: Lấy danh sách tất cả sản phẩm
app.get('/api/products', (req, res) => {
    console.log('Đang lấy danh sách tất cả sản phẩm...');
    // Đảm bảo lấy tất cả các cột cần thiết, bao gồm cả colors và sizes
    const query = 'SELECT id, name, code, brand, price, image, description, stock, colors, sizes FROM products ORDER BY created_at DESC';
    
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

        // Parse colors và sizes trước khi trả về
        const parsedResults = results.map(product => {
    let colors = [];
    let sizes = [];

    // Xử lý colors
    if (product.colors) {
        if (product.colors.startsWith('[')) {
            // JSON chuẩn
            try { colors = JSON.parse(product.colors); } 
            catch (e) { console.error('Parse error colors:', e, product.colors); }
        } else {
            // Dữ liệu cũ kiểu "Trắng,Đen"
            colors = product.colors.split(',');
        }
    }

    // Xử lý sizes
    if (product.sizes) {
        if (product.sizes.startsWith('[')) {
            try { sizes = JSON.parse(product.sizes); } 
            catch (e) { console.error('Parse error sizes:', e, product.sizes); }
        } else {
            sizes = product.sizes.split(',');
        }
    }

    return {
        ...product,
        colors: Array.isArray(colors) ? colors : [],
        sizes: Array.isArray(sizes) ? sizes : []
    };
});
res.json(parsedResults);
 });
});



// API: Lấy danh sách sản phẩm
app.get('/api/products/:id/stock', (req, res) => {
    const { id } = req.params;
    console.log(`\n--- [STOCK API] Bắt đầu yêu cầu mới cho ID: ${id} ---`);

    const query = 'SELECT stock, colors, sizes FROM products WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(`[STOCK API] LỖI SQL:`, err);
            return res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
        }

        if (results.length === 0) {
            console.warn(`[STOCK API] CẢNH BÁO: Không tìm thấy sản phẩm với ID ${id}.`);
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        }

        const product = results[0];
        console.log(`[STOCK API] Dữ liệu gốc từ DB:`, product);
        
        const stockData = {};
        let colors = [];
        let sizes = [];

        // --- BƯỚC PARSE DỮ LIỆU AN TOÀN ---
        try {
            // Xử lý `colors`
            if (product.colors) {
    if (product.colors.startsWith('[')) {
        try { colors = JSON.parse(product.colors); } 
        catch (e) { console.error('Parse error colors:', e, product.colors); }
    } else {
        colors = product.colors.split(',');
    }
}

if (product.sizes) {
    if (product.sizes.startsWith('[')) {
        try { sizes = JSON.parse(product.sizes); } 
        catch (e) { console.error('Parse error sizes:', e, product.sizes); }
    } else {
        sizes = product.sizes.split(',');
    }
}

            console.log(`[STOCK API] Đã xử lý 'colors':`, colors);

            // Xử lý `sizes`
            if (product.sizes && typeof product.sizes === 'string') {
                sizes = JSON.parse(product.sizes);
            } else if (Array.isArray(product.sizes)) {
                sizes = product.sizes; // Nếu nó đã là một mảng
            }
            console.log(`[STOCK API] Đã xử lý 'sizes':`, sizes);

            // Kiểm tra kết quả parse
            if (!Array.isArray(colors) || !Array.isArray(sizes)) {
                throw new Error('Dữ liệu sau khi parse không phải là mảng.');
            }

        } catch (parseError) {
            console.error(`[STOCK API] LỖI PARSE JSON:`, parseError.message);
            console.error(`[STOCK API] Dữ liệu gốc gây lỗi -> colors:`, product.colors, `(kiểu: ${typeof product.colors})`);
            console.error(`[STOCK API] Dữ liệu gốc gây lỗi -> sizes:`, product.sizes, `(kiểu: ${typeof product.sizes})`);
            return res.status(500).json({ error: 'Lỗi định dạng dữ liệu trong CSDL (Parse error).' });
        }

        // --- BƯỚC TẠO DỮ LIỆU TỒN KHO ---
        try {
            colors.forEach(colorObj => {
                const colorName = colorObj.name || (typeof colorObj === 'string' ? colorObj : 'UnknownColor');
                sizes.forEach(size => {
                    const key = `${colorName}-${size}`;
                    stockData[key] = product.stock;
                });
            });

            console.log(`[STOCK API] Đã tạo dữ liệu tồn kho thành công:`, stockData);
            res.json({ stock: stockData });

        } catch (logicError) {
            console.error(`[STOCK API] LỖI LOGIC KHI TẠO STOCK:`, logicError);
            return res.status(500).json({ error: 'Lỗi logic xử lý dữ liệu.' });
        }
    });
});


// API: Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting product with ID:', id);

    // Kiểm tra sản phẩm tồn tại
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error checking product:', err);
            return res.status(500).json({
                error: 'Database error',
                details: err.message
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({
                error: 'Product not found',
                details: 'Product does not exist'
            });
        }

        // Xóa sản phẩm
        db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting product:', err);
                return res.status(500).json({
                    error: 'Failed to delete product',
                    details: err.message
                });
            }

            console.log('Delete result:', result);
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        });
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

// API: Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting product with ID:', id); // Debug log

    db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message 
            });
        }

        // Check if any row was deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Product not found',
                details: `No product found with id ${id}`
            });
        }

        res.json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
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
        const values = items.map(item => [
    orderId,
    item.product_id,  // phải là ID số trong bảng products
    item.color,
    item.size,
    item.quantity,
    item.price,
    item.status || "Chờ xử lý"
]);

db.query(
  'INSERT INTO order_items (order_id, product_id, color, size, quantity, price, status) VALUES ?',
  [values],
  (err2) => {
    if (err2) {
      console.error('Lỗi khi thêm order_items:', err2);
      return res.status(500).json({ error: err2 });
    }
    res.json({ success: true, orderId });
  }
);


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

app.listen(PORT, () => {
    console.log('Server đang chạy tại http://localhost:' + PORT);
});
