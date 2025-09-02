-- Kiểm tra và xóa stored procedures liên quan đến old_price
SHOW PROCEDURE STATUS WHERE Db = 'giaybongda';

-- Kiểm tra và xóa triggers liên quan đến old_price
SHOW TRIGGERS FROM giaybongda;

-- Kiểm tra ràng buộc trong bảng products
SELECT COLUMN_NAME, CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'giaybongda'
AND TABLE_NAME = 'products';

-- Xem cấu trúc bảng products hiện tại
DESCRIBE products;
