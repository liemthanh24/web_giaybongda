// order-api.js
// Đặt hàng từ trang mua sản phẩm

function placeOrder(userId, items, callback) {
    fetch('http://localhost:3001/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, items })
    })
    .then(res => res.json())
    .then(data => {
        callback(data);
    })
    .catch(err => {
        console.error('Lỗi đặt hàng:', err);
    });
}

// Ví dụ sử dụng:
// placeOrder(1, [{ product_id: 2, color: 'Đỏ', size: '40', quantity: 1, price: 1299000 }], function(data) {
//     // xử lý kết quả đặt hàng
// });
