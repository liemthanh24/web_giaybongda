// products-api.js
// Lấy danh sách sản phẩm từ backend và render ra trang chủ

function fetchProductsAndRender(renderCallback) {
    fetch('http://localhost:3001/api/products')
        .then(res => res.json())
        .then(products => {
            renderCallback(products);
        })
        .catch(err => {
            console.error('Lỗi lấy sản phẩm:', err);
        });
}

// Ví dụ sử dụng:
// fetchProductsAndRender(function(products) {
//     // render sản phẩm ra giao diện
// });
