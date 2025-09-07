// cart-api.js
// Lấy giỏ hàng của user từ backend và render ra trang giỏ hàng

function fetchCartAndRender(userId, renderCallback) {
    fetch(`http://localhost:3001/api/orders/${userId}`)
        .then(res => res.json())
        .then(cartItems => {
            renderCallback(cartItems);
        })
        .catch(err => {
            console.error('Lỗi lấy giỏ hàng:', err);
        });
}

// Ví dụ sử dụng:
// fetchCartAndRender(1, function(cartItems) {
//     // render giỏ hàng ra giao diện
// });
