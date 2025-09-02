USE giaybongda;

-- Sửa tên cột createdAt thành created_at
ALTER TABLE products CHANGE COLUMN createdAt created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Thêm unique key cho cột code
ALTER TABLE products ADD UNIQUE (code);
