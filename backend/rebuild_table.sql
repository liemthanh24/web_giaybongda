DROP VIEW IF EXISTS product_view;
DROP FUNCTION IF EXISTS get_old_price;
DROP TRIGGER IF EXISTS update_old_price;

-- Tạo lại cấu trúc bảng products nếu cần
CREATE TABLE products_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    description TEXT,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy dữ liệu từ bảng cũ sang bảng mới
INSERT INTO products_new (id, code, name, brand, price, image, description, quantity, created_at)
SELECT id, code, name, brand, price, image, description, quantity, created_at
FROM products;

-- Xóa bảng cũ và đổi tên bảng mới
DROP TABLE products;
ALTER TABLE products_new RENAME TO products;
