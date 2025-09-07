// Biến để theo dõi trạng thái loading và lưu dữ liệu
let isLoading = false;
let productRevenueData = [];
let brandRevenueData = [];

// Biến lưu timeout cho chức năng search
let productSearchTimeout;
let brandSearchTimeout;

// Hàm tạo mã sản phẩm từ brand
function generateProductCode(brand) {
    if (!brand) return '';
    const prefix = brand.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
}

// Hàm format tiền tệ
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Hàm gọi API với xử lý lỗi
async function fetchAPI(url) {
    try {
        console.log(`Đang gọi API: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Kết quả từ API ${url}:`, data);
        return data;
    } catch (error) {
        console.error(`Lỗi khi gọi API ${url}:`, error);
        return null;
    }
}

// Hàm hiển thị trạng thái loading
function setLoadingState(loading) {
    isLoading = loading;
    const tables = document.querySelectorAll('table');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <svg class="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    `;

    tables.forEach(table => {
        const parentDiv = table.parentElement;
        const existingOverlay = parentDiv.querySelector('.loading-overlay');
        
        if (loading) {
            if (!existingOverlay) {
                loadingOverlay.style.cssText = 'position: absolute; inset: 0; background: rgba(255, 255, 255, 0.8); z-index: 10;';
                parentDiv.style.position = 'relative';
                parentDiv.appendChild(loadingOverlay.cloneNode(true));
            }
        } else {
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }
    });
}

// Hàm tải và hiển thị doanh thu theo sản phẩm
async function loadProductRevenue() {
    if (isLoading) return;
    
    try {
        setLoadingState(true);
        // Đầu tiên lấy tất cả sản phẩm từ API sản phẩm
        const allProducts = await fetchAPI('http://localhost:3001/api/products');
        if (!allProducts) {
            throw new Error('Không thể lấy danh sách sản phẩm');
        }
        console.log('Tất cả sản phẩm:', allProducts);

        // Sau đó lấy doanh thu
        const revenueData = await fetchAPI('http://localhost:3001/api/statistics/products') || [];
        console.log('Dữ liệu doanh thu:', revenueData);

        const tableBody = document.getElementById('product-revenue-body');
        if (!tableBody) {
            console.error('Không tìm thấy element product-revenue-body');
            return;
        }
        tableBody.innerHTML = '';

        // Map doanh thu vào từng sản phẩm
        const productsWithRevenue = allProducts.map(product => {
            const revenueInfo = revenueData.find(r => r.id === product.id) || {
                total_orders: 0,
                total_quantity: 0,
                total_revenue: 0
            };
            return {
                ...product,
                total_orders: revenueInfo.total_orders || 0,
                total_quantity: revenueInfo.total_quantity || 0,
                total_revenue: revenueInfo.total_revenue || 0
            };
        });

        // Sắp xếp theo doanh thu giảm dần
        productsWithRevenue.sort((a, b) => b.total_revenue - a.total_revenue);
        
        // Lưu dữ liệu để dùng cho tìm kiếm
        productRevenueData = productsWithRevenue;
        
        // Hiển thị tất cả sản phẩm
        displayProductRevenue(productRevenueData);
    } catch (error) {
        console.error('Lỗi khi tải doanh thu sản phẩm:', error);
    } finally {
        setLoadingState(false);
    }
}

// Hàm tải và hiển thị doanh thu theo nhãn hàng
async function loadBrandRevenue() {
    try {
        // Lấy tất cả sản phẩm để lấy danh sách nhãn hàng
        const allProducts = await fetchAPI('http://localhost:3001/api/products');
        if (!allProducts) {
            throw new Error('Không thể lấy danh sách sản phẩm');
        }
        console.log('Tất cả sản phẩm:', allProducts);

        // Lấy danh sách nhãn hàng duy nhất
        const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].filter(Boolean);
        console.log('Danh sách nhãn hàng:', uniqueBrands);

        // Lấy doanh thu theo nhãn hàng
        const revenueData = await fetchAPI('http://localhost:3001/api/statistics/brands') || [];
        console.log('Dữ liệu doanh thu nhãn hàng:', revenueData);

        const tableBody = document.getElementById('brand-revenue-body');
        if (!tableBody) {
            console.error('Không tìm thấy element brand-revenue-body');
            return;
        }
        tableBody.innerHTML = '';

        // Tạo dữ liệu cho mỗi nhãn hàng
        const brandsWithRevenue = uniqueBrands.map(brandName => {
            const revenueInfo = revenueData.find(r => r.brand === brandName) || {
                total_products: allProducts.filter(p => p.brand === brandName).length,
                total_orders: 0,
                total_quantity: 0,
                total_revenue: 0
            };
            return {
                brand: brandName,
                total_products: revenueInfo.total_products,
                total_orders: revenueInfo.total_orders || 0,
                total_quantity: revenueInfo.total_quantity || 0,
                total_revenue: revenueInfo.total_revenue || 0
            };
        });

        // Sắp xếp theo doanh thu giảm dần
        brandsWithRevenue.sort((a, b) => b.total_revenue - a.total_revenue);

        // Lưu dữ liệu để dùng cho tìm kiếm
        brandRevenueData = brandsWithRevenue;
        
        // Hiển thị tất cả nhãn hàng
        displayBrandRevenue(brandRevenueData);
    } catch (error) {
        console.error('Lỗi khi tải doanh thu nhãn hàng:', error);
    }
}

// Hàm tải lại toàn bộ dữ liệu
async function refreshData() {
    const button = document.getElementById('refresh-stats');
    if (button) {
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải...
        `;
    }
    
    try {
        await Promise.all([
            loadProductRevenue(),
            loadBrandRevenue()
        ]);
    } catch (error) {
        console.error('Lỗi khi làm mới dữ liệu:', error);
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                Làm mới dữ liệu
            `;
        }
    }
}

// Load dữ liệu khi trang được tải
// Hàm lọc sản phẩm theo từ khóa
function filterProducts(keyword) {
    if (!keyword) {
        displayProductRevenue(productRevenueData);
        return;
    }
    
    const searchTerm = keyword.toLowerCase();
    const filtered = productRevenueData.filter(product => 
        product.code?.toLowerCase().includes(searchTerm) ||
        product.name?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
    );
    
    displayProductRevenue(filtered);
}

// Hàm lọc nhãn hàng theo từ khóa
function filterBrands(keyword) {
    if (!keyword) {
        displayBrandRevenue(brandRevenueData);
        return;
    }
    
    const searchTerm = keyword.toLowerCase();
    const filtered = brandRevenueData.filter(brand => 
        brand.brand?.toLowerCase().includes(searchTerm)
    );
    
    displayBrandRevenue(filtered);
}

// Hàm hiển thị dữ liệu sản phẩm đã lọc
function displayProductRevenue(data) {
    const tableBody = document.getElementById('product-revenue-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    data.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4">${product.code || generateProductCode(product.brand)}</td>
            <td class="px-6 py-4">${product.name || ''}</td>
            <td class="px-6 py-4">${product.brand || ''}</td>
            <td class="px-6 py-4">${product.total_orders}</td>
            <td class="px-6 py-4">${product.total_quantity}</td>
            <td class="px-6 py-4">${formatPrice(product.total_revenue)}đ</td>
        `;
        tableBody.appendChild(row);
    });
    
    const totalRevenue = data.reduce((sum, product) => sum + product.total_revenue, 0);
    document.getElementById('total-product-revenue').textContent = formatPrice(totalRevenue) + 'đ';
}

// Hàm hiển thị dữ liệu nhãn hàng đã lọc
function displayBrandRevenue(data) {
    const tableBody = document.getElementById('brand-revenue-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    data.forEach(brand => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4">${brand.brand || ''}</td>
            <td class="px-6 py-4">${brand.total_products || 0}</td>
            <td class="px-6 py-4">${brand.total_orders}</td>
            <td class="px-6 py-4">${brand.total_quantity}</td>
            <td class="px-6 py-4">${formatPrice(brand.total_revenue)}đ</td>
        `;
        tableBody.appendChild(row);
    });
    
    const totalRevenue = data.reduce((sum, brand) => sum + brand.total_revenue, 0);
    document.getElementById('total-brand-revenue').textContent = formatPrice(totalRevenue) + 'đ';
}

document.addEventListener('DOMContentLoaded', () => {
    // Load dữ liệu ban đầu
    refreshData();
    
    // Thêm sự kiện cho nút refresh
    const refreshButton = document.getElementById('refresh-stats');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshData);
    }
    
    // Thêm sự kiện tìm kiếm cho sản phẩm
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            clearTimeout(productSearchTimeout);
            productSearchTimeout = setTimeout(() => {
                filterProducts(e.target.value.trim());
            }, 300);
        });
    }
    
    // Thêm sự kiện tìm kiếm cho nhãn hàng
    const brandSearch = document.getElementById('brand-search');
    if (brandSearch) {
        brandSearch.addEventListener('input', (e) => {
            clearTimeout(brandSearchTimeout);
            brandSearchTimeout = setTimeout(() => {
                filterBrands(e.target.value.trim());
            }, 300);
        });
    }
});
