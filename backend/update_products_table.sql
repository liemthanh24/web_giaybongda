-- Sửa lại cấu trúc bảng products
ALTER TABLE products
    MODIFY id VARCHAR(10) PRIMARY KEY,
    DROP COLUMN code,
    CHANGE old_price oldPrice INT,
    CHANGE stock quantity INT DEFAULT 0,
    ADD COLUMN createdAt DATE,
    DROP COLUMN colors,
    DROP COLUMN sizes;
