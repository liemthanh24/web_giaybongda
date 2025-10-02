// File: ../assets/index-products.js

document.addEventListener('DOMContentLoaded', async () => {
    // Cập nhật số lượng giỏ hàng ngay khi trang tải
    updateCartBadge();

    const productsListContainer = document.getElementById('products-list');
    const brandButtons = document.querySelectorAll('.brand-btn');
    const sortSelect = document.getElementById('sort-select');
    const noProductsMessage = document.getElementById('no-products');

    let allProducts = [];
    let currentBrand = 'Tất cả';
    let currentSort = 'all';

    function renderProducts(productsToRender) {
        if (!productsListContainer || !noProductsMessage) return;

        productsListContainer.innerHTML = '';
        if (!productsToRender || productsToRender.length === 0) {
            productsListContainer.style.display = 'none';
            noProductsMessage.style.display = 'block';
            return;
        }

        productsListContainer.style.display = 'grid';
        noProductsMessage.style.display = 'none';

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-xl shadow-sm flex flex-col p-4';
            
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-contain mb-4 rounded-xl border">
                <div class="flex-grow flex flex-col">
                    <h3 class="text-lg font-bold mb-1 text-gray-800 flex-grow">${product.name}</h3>
                    <div class="mt-auto">
                        ${product.old_price ? `<span class="text-gray-500 line-through mr-2">${(product.old_price).toLocaleString('vi-VN')}đ</span>` : ''}
                        <span class="text-xl font-bold text-purple-700">${(product.price || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
                <div class="flex gap-2 w-full mt-4">
                    <button onclick='buyNow(${JSON.stringify(product)})' class="flex-1 px-2 py-2 border border-gray-300 rounded font-semibold text-xs hover:bg-gray-100 transition">
                        MUA NGAY
                    </button>
                    <button onclick='showDetail(${JSON.stringify(product)})' class="flex-1 px-2 py-2 bg-black text-white rounded font-semibold text-xs hover:bg-gray-800 transition">
                        CHI TIẾT
                    </button>
                </div>
            `;
            productsListContainer.appendChild(productCard);
        });
    }

    function filterAndSortProducts() {
        let filteredProducts = [...allProducts];

        if (currentBrand !== 'Tất cả') {
            filteredProducts = filteredProducts.filter(p => p.brand === currentBrand);
        }

        switch (currentSort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        renderProducts(filteredProducts);
    }
    
    brandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            brandButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentBrand = this.querySelector('span').textContent;
            filterAndSortProducts();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            filterAndSortProducts();
        });
    }

    try {
        const response = await fetch('http://localhost:3001/api/products');
        if (!response.ok) throw new Error(`Lỗi mạng: ${response.statusText}`);
        
        allProducts = await response.json();
        filterAndSortProducts();

    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        if (noProductsMessage) {
            noProductsMessage.textContent = 'Không thể tải sản phẩm. Vui lòng thử lại.';
            noProductsMessage.style.display = 'block';
        }
    }
});

// Chuyển đến trang chi tiết
function showDetail(product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'product-detail.html';
}

// Chuyển đến trang mua ngay
function buyNow(product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'buy.html';
}

// ===== HÀM CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG (ĐÃ SỬA LẠI) =====
async function updateCartBadge() {
    const userId = localStorage.getItem('user_id');
    const badge = document.getElementById('cart-count-badge');

    if (!userId || !badge) {
        if (badge) badge.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/orders/${userId}`);
        if (!response.ok) {
            badge.style.display = 'none';
            return;
        }

        const cartItems = await response.json();
        const itemCount = cartItems.length;

        if (itemCount > 0) {
            badge.textContent = itemCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng giỏ hàng:', error);
        badge.style.display = 'none';
    }
}