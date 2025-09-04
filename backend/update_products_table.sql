mysql -u root -p < update_products_table.sqlUSE giaybongda;

-- Kiểm tra và sửa tên cột createdAt thành created_at
SELECT IF(
    EXISTS(
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'giaybongda' 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'createdAt'
    ),
    'ALTER TABLE products CHANGE COLUMN createdAt created_at DATETIME DEFAULT CURRENT_TIMESTAMP;',
    'SELECT "Column already renamed or does not exist"'
) INTO @sql;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra và thêm unique key cho cột code
SELECT IF(
    NOT EXISTS(
        SELECT * FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'giaybongda' 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'code' 
        AND INDEX_NAME != 'PRIMARY'
    ),
    'ALTER TABLE products ADD UNIQUE (code);',
    'SELECT "Unique key already exists"'
) INTO @sql;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm hoặc sửa cột colors và sizes
ALTER TABLE products 
    MODIFY COLUMN colors TEXT NOT NULL DEFAULT '[]' COMMENT 'JSON array of available colors',
    MODIFY COLUMN sizes TEXT NOT NULL DEFAULT '[]' COMMENT 'JSON array of available sizes';

-- Cập nhật các giá trị NULL thành mảng rỗng
UPDATE products SET colors = '[]' WHERE colors IS NULL OR colors = '';
UPDATE products SET sizes = '[]' WHERE sizes IS NULL OR sizes = '';
