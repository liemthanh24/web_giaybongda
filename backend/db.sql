-- Database structure for web giaybongda

CREATE DATABASE IF NOT EXISTS giaybongda;
USE giaybongda;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('user','admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    old_price INT,
    image VARCHAR(255),
    brand VARCHAR(50),
    colors VARCHAR(255), -- JSON or comma separated
    sizes VARCHAR(255),  -- JSON or comma separated
    stock INT DEFAULT 0,
    description TEXT
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    status ENUM('Đã đặt','Đang giao','Đã nhận') DEFAULT 'Đã đặt',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    color VARCHAR(50),
    size VARCHAR(10),
    quantity INT DEFAULT 1,
    price INT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
