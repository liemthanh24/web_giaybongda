-- Update products table to handle colors and sizes properly
ALTER TABLE products MODIFY COLUMN colors TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products MODIFY COLUMN sizes TEXT NOT NULL DEFAULT '[]';
