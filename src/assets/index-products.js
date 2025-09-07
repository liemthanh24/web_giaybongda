// src/assets/index-products.js

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Index-Products] Bắt đầu thực thi script.');

    const productsListContainer = document.getElementById('products-list');
    if (!productsListContainer) {
        console.error("[Index-Products] LỖI NGHIÊM TRỌNG: Không tìm thấy phần tử #products-list trong HTML.");
        return;
    }

    let allProducts = [];

    // --- HÀM HIỂN THỊ SẢN PHẨM ---
    function renderProducts(products) {
        productsListContainer.innerHTML = '';
        if (!products || products.length === 0) {
            console.warn("[Index-Products] Không có sản phẩm nào để hiển thị.");
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-xl shadow flex flex-col p-4 transition-transform duration-300 hover:scale-105 cursor-pointer';
            productCard.dataset.productId = product.id; // Gán ID vào đây

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-contain mb-4 rounded-xl border">
                <h3 class="text-lg font-bold mb-1 flex-grow">${product.name}</h3>
                <div class="mb-1 text-gray-700 text-sm">Mã sản phẩm: ${product.code}</div>
                <div class="mb-2">
                    <span class="text-2xl font-bold text-purple-700 mr-2">${(product.price || 0).toLocaleString()}đ</span>
                </div>
                <div class="flex gap-2 w-full mt-auto">
                    <button class="buy-now-btn flex-1 px-2 py-1 border border-black rounded font-semibold flex items-center justify-center gap-1 text-xs hover:bg-gray-100">
                        MUA NGAY
                    </button>
                    <button class="detail-btn flex-1 px-2 py-1 border border-black rounded font-semibold flex items-center justify-center gap-1 text-xs hover:bg-gray-100">
                        CHI TIẾT
                    </button>
                </div>
            `;
            productsListContainer.appendChild(productCard);
        });
        console.log(`[Index-Products] Đã hiển thị ${products.length} sản phẩm.`);
    }

    // --- HÀM XỬ LÝ KHI CLICK ---
    function handleProductClick(event) {
        console.log('[Index-Products] Đã click vào khu vực sản phẩm.');
        const productCard = event.target.closest('[data-product-id]');
        
        if (!productCard) {
            console.warn('[Index-Products] Click không hợp lệ (không tìm thấy data-product-id).');
            return;
        }

        const productId = productCard.dataset.productId;
        console.log(`[Index-Products] Đã lấy được ID sản phẩm: ${productId}`);
        
        const product = allProducts.find(p => p.id == productId);

        if (!product) {
            console.error(`[Index-Products] LỖI: Không tìm thấy sản phẩm với ID ${productId} trong danh sách.`);
            alert('Lỗi: Không tìm thấy thông tin sản phẩm này.');
            return;
        }

        console.log('[Index-Products] Đã tìm thấy sản phẩm:', product);

        try {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            console.log('[Index-Products] ĐÃ LƯU SẢN PHẨM VÀO LOCALSTORAGE THÀNH CÔNG.');
            
            if (event.target.closest('.buy-now-btn')) {
                console.log('[Index-Products] Đang chuyển hướng đến buy.html...');
                window.location.href = 'buy.html';
            } else {
                console.log('[Index-Products] Đang chuyển hướng đến product-detail.html...');
                window.location.href = 'product-detail.html';
            }
        } catch (e) {
            console.error('[Index-Products] LỖI NGHIÊM TRỌNG KHI LƯU VÀO LOCALSTORAGE:', e);
            alert('Lỗi trình duyệt: Không thể lưu thông tin sản phẩm.');
        }
    }

    // --- KHỞI TẠO TRANG ---
    try {
        const response = await fetch('http://localhost:3001/api/products');
        if (!response.ok) throw new Error(`Lỗi mạng: ${response.statusText}`);
        allProducts = await response.json();
        console.log('[Index-Products] Đã tải thành công danh sách sản phẩm từ API:', allProducts);

        renderProducts(allProducts);
        productsListContainer.addEventListener('click', handleProductClick);

    } catch (error) {
        console.error("[Index-Products] Lỗi khi tải sản phẩm:", error);
        productsListContainer.innerHTML = `<p class="col-span-full text-center text-red-500">Không thể tải sản phẩm.</p>`;
    }
});