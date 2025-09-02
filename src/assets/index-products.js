// Xử lý hiển thị sản phẩm trên trang chủ
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupBrandFilter();
    setupSortSelect();
    setupSearch();
});

async function loadProducts() {
    try {
        const products = await getProducts();
        // Lấy 2 sản phẩm mỗi hãng cho trang chủ
        const limitedProducts = getLimitedProducts(products, 2);
        renderProducts(limitedProducts);
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
    }
}

// Hàm lấy số lượng sản phẩm giới hạn cho mỗi hãng
function getLimitedProducts(products, limit) {
    // Lấy danh sách các hãng duy nhất
    const brands = [...new Set(products.map(p => p.brand))];
    
    // Lấy limit sản phẩm cho mỗi hãng
    const limitedProducts = brands.flatMap(brand => {
        return products
            .filter(p => p.brand === brand)
            .slice(0, limit);
    });

    return limitedProducts;
}

function renderProducts(products) {
    const container = document.getElementById('products-list');
    if (!container) return;

    container.innerHTML = '';
    
    if (products.length === 0) {
        document.getElementById('no-products').classList.remove('hidden');
        return;
    }
    
    document.getElementById('no-products').classList.add('hidden');
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-xl shadow flex flex-col p-4';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-contain mb-4 rounded-xl border">
            <h3 class="text-lg font-bold mb-1">${product.name}</h3>
            <div class="mb-1 text-gray-700 text-sm">Mã sản phẩm: ${product.id}</div>
            <div class="mb-2">
                <span class="text-2xl font-bold text-purple-700 mr-2">${formatPrice(product.price)}đ</span>
            </div>
            <div class="flex gap-2 w-full mt-auto">
                <button onclick="showBuy('${product.id}')" class="flex-1 px-2 py-1 border border-black rounded font-semibold flex items-center justify-center gap-1 text-xs hover:bg-gray-100 min-w-[90px]">
                    <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-1.3L17 13M7 13V6a1 1 0 011-1h9a1 1 0 011 1v7'/>
                    </svg>
                    <span>MUA NGAY</span>
                </button>
                <button onclick="showDetail('${product.id}')" class="flex-1 px-2 py-1 border border-black rounded font-semibold flex items-center justify-center gap-1 text-xs hover:bg-gray-100 min-w-[90px]">
                    <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/>
                        <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/>
                    </svg>
                    <span>CHI TIẾT</span>
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

function setupBrandFilter() {
    const brandButtons = document.querySelectorAll('.brand-btn');
    brandButtons.forEach(button => {
        button.addEventListener('click', async () => {
            // Remove active class from all buttons
            brandButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get products and filter
            const products = await getProducts();
            let filteredProducts;
            
            if (button.textContent === 'Tất cả') {
                filteredProducts = getLimitedProducts(products, 2);
            } else {
                filteredProducts = getLimitedProducts(
                    products.filter(p => p.brand === button.textContent),
                    2
                );
            }
            
            renderProducts(filteredProducts);
        });
    });
}

function setupSortSelect() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', async () => {
        const products = await getProducts();
        const limitedProducts = getLimitedProducts(products, 2);
        const sortedProducts = sortProducts(limitedProducts, sortSelect.value);
        renderProducts(sortedProducts);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchSuggest = document.getElementById('search-suggest');
    if (!searchInput || !searchSuggest) return;

    let timeoutId;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchSuggest.classList.add('hidden');
            return;
        }

        timeoutId = setTimeout(async () => {
            const results = await searchProducts(query);
            const limitedResults = getLimitedProducts(results, 2);
            renderSearchSuggestions(limitedResults, searchSuggest);
        }, 300);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggest.contains(e.target)) {
            searchSuggest.classList.add('hidden');
        }
    });
}

function renderSearchSuggestions(products, container) {
    if (products.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.innerHTML = '';
    container.classList.remove('hidden');

    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-contain">
            <div>
                <div class="font-semibold">${product.name}</div>
                <div class="text-purple-600">${formatPrice(product.price)}đ</div>
            </div>
        `;
        div.onclick = () => showDetail(product.id);
        container.appendChild(div);
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Hàm xử lý khi click nút Mua ngay
function showBuy(productId) {
    window.location.href = `buy.html?id=${productId}`;
}

// Hàm xử lý khi click nút Chi tiết
function showDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}
