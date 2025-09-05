// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function generateProductCode(brand) {
    if (!brand) return 'XX' + Date.now().toString().slice(-6);
    const prefix = brand.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Global Elements Container
const elements = {
    modal: null,
    form: null,
    title: null,
    productId: null,
    name: null,
    brand: null,
    price: null,
    stock: null,
    image: null,
    description: null,
    tableBody: null,
    refreshBtn: null,
    addBtn: null,
    cancelBtn: null
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, waiting for API...');
    waitForAPI();
});

function waitForAPI() {
    if (typeof window.getProducts === 'function') {
        console.log('API functions detected, initializing...');
        initializeApp().catch(error => {
            console.error('Failed to initialize:', error);
            showNotification('error', 'Initialization error: ' + error.message);
        });
    } else {
        console.log('API not ready, retrying...');
        setTimeout(waitForAPI, 100);
    }
}

// Main initialization
async function initializeApp() {
    try {
        initializeElements();
        setupEventListeners();
        await loadProducts();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('error', 'Error initializing: ' + error.message);
        throw error;
    }
}

// Initialize DOM elements
function initializeElements() {
    elements.modal = document.getElementById('product-modal');
    elements.form = document.getElementById('product-form');
    elements.title = document.getElementById('product-modal-title');
    elements.productId = document.getElementById('product-id');
    elements.name = document.getElementById('product-name');
    elements.brand = document.getElementById('product-brand');
    elements.price = document.getElementById('product-price');
    elements.stock = document.getElementById('product-stock');
    elements.image = document.getElementById('product-image');
    elements.description = document.getElementById('product-desc');
    
    // Auto-resize textarea
    if (elements.description) {
        elements.description.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight + 2) + 'px';
        });
    }
    elements.tableBody = document.getElementById('products-list');
    elements.refreshBtn = document.getElementById('refresh-products');
    elements.addBtn = document.getElementById('add-product-btn');
    elements.cancelBtn = document.getElementById('product-cancel');

    // Validate required elements
    if (!elements.tableBody) throw new Error('Required element "products-list" not found');
    if (!elements.form) throw new Error('Required element "product-form" not found');
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    elements.refreshBtn?.addEventListener('click', () => loadProducts());
    
    // Add product button
    elements.addBtn?.addEventListener('click', () => {
        if (elements.form) elements.form.reset();
        if (elements.productId) elements.productId.value = '';
        if (elements.modal) elements.modal.classList.remove('hidden');
        if (elements.title) elements.title.textContent = 'Thêm sản phẩm mới';
    });

    // Form submit
    elements.form?.addEventListener('submit', handleProductFormSubmit);
    
    // Cancel button
    elements.cancelBtn?.addEventListener('click', () => {
        if (elements.modal) elements.modal.classList.add('hidden');
    });
}

// Load and display products
async function loadProducts() {
    if (!elements.tableBody) return;

    try {
        console.log('Loading products...');
        elements.tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Đang tải...</td></tr>';
        
        const products = await window.getProducts();
        console.log('Products loaded:', products);

        if (!Array.isArray(products)) {
            throw new Error('Invalid products data received');
        }
        
        if (products.length === 0) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-gray-600">
                        Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!
                    </td>
                </tr>
            `;
        } else {
            renderProductsTable(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('error', 'Không thể tải danh sách sản phẩm: ' + error.message);
        
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-red-600">
                    Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối và thử lại.
                </td>
            </tr>
        `;
    }
}

// Validate stock based on colors and sizes
function validateStock(stock, colors, sizes) {
    const minRequired = colors.length * sizes.length;
    if (stock < minRequired) {
        throw new Error('Số lượng không hợp lệ');
    }
    return true;
}

// Handle product form submission
async function handleProductFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Get form data including colors and sizes
        const selectedOptions = window.getSelectedOptions();
        console.log('Selected options:', selectedOptions); // Debug log
        
        // Validate colors and sizes selection
        if (selectedOptions.colors.length === 0) {
            throw new Error('Vui lòng chọn màu sắc');
        }
        if (selectedOptions.sizes.length === 0) {
            throw new Error('Vui lòng chọn kích thước');
        }

        // Get stock value
        const stock = Number(elements.stock?.value) || 0;
        
        // Validate stock based on selected colors and sizes
        validateStock(stock, selectedOptions.colors, selectedOptions.sizes);

        const formData = {
            name: elements.name?.value?.trim(),
            brand: elements.brand?.value,
            price: Number(elements.price?.value),
            stock: stock,
            image: elements.image?.value?.trim() || null,
            description: elements.description?.value?.trim() || null,
            colors: selectedOptions.colors,
            sizes: selectedOptions.sizes
        };

        console.log('Form data:', formData); // Debug log

        // Validate form data
        if (!formData.name) throw new Error('Vui lòng nhập tên sản phẩm');
        if (!formData.brand) throw new Error('Vui lòng chọn nhãn hiệu');
        if (!formData.price || isNaN(formData.price) || formData.price <= 0) throw new Error('Vui lòng nhập giá hợp lệ');
        if (formData.stock === undefined || isNaN(formData.stock) || formData.stock < 0) throw new Error('Vui lòng nhập số lượng hợp lệ');

        // Get product ID if editing
        const productId = elements.productId?.value;

        // Prepare product data
        const productData = {
            name: formData.name,
            brand: formData.brand,
            price: formData.price,
            stock: formData.stock,
            image: formData.image,
            description: formData.description,
            colors: formData.colors,
            sizes: formData.sizes
        };

        if (!productId) {
            // Create new product
            try {
                // Generate product code and add it to the data
                productData.code = generateProductCode(formData.brand);
                
                // Add the product through the API
                const newProduct = await window.addProduct(productData);
                
                // Log the response for debugging
                console.log('Added product:', newProduct);
                
                // If we get here, the product was added successfully
                showNotification('success', 'Thêm sản phẩm thành công!');
                
                // Close modal and reset form
                elements.modal?.classList.add('hidden');
                elements.form?.reset();
                
                // Refresh the products list
                await loadProducts();
            } catch (error) {
                console.error('Error in form submission:', error);
                showNotification('error', error.message || 'Không thể tạo sản phẩm');
                // Don't throw error here - we've already handled it with the notification
            }
        } else {
            // Update existing product with prepared data
            const updateData = {
                name: String(formData.name || '').trim(),
                brand: String(formData.brand || '').trim(),
                price: Number(formData.price) || 0,
                stock: Number(formData.stock) || 0,
                image: String(formData.image || '').trim(),
                description: String(formData.description || '').trim(),
                colors: formData.colors || [],
                sizes: formData.sizes || []
            };
            
            // Log the data being sent
            console.log('Sending update data:', {
                id: productId,
                data: updateData
            });
            
            // Send update request
            const result = await window.updateProduct(productId, updateData);
            showNotification('success', 'Cập nhật sản phẩm thành công!');
        }

        // Close modal and refresh list
        if (elements.modal) elements.modal.classList.add('hidden');
        await loadProducts();

    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('error', 'Lỗi: ' + error.message);
    }
}
// 🔄 Hàm lấy tồn kho mới nhất theo productId
async function refreshStock(productId) {
    try {
        const res = await fetch(`${API_URL}/products/${productId}/stock`);
        if (!res.ok) throw new Error("Không thể tải tồn kho");
        const data = await res.json();
        console.log("[refreshStock] Stock mới cho", productId, data);
        return data.stock;
    } catch (err) {
        console.error("[refreshStock] Lỗi:", err);
        return null;
    }
}

// Render products table
function renderProductsTable(products) {
    if (!elements.tableBody) return;
    
    elements.tableBody.innerHTML = '';
    
    products.forEach(async (product) => {   // 👈 dùng async để có thể await
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 border-b border-gray-200';
        row.innerHTML = `
            <td class="w-28 px-4 py-3 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-700">${product.code || ''}</span>
            </td>
            <td class="w-28 px-4 py-3 text-center">
                <div class="flex justify-center">
                    <img src="${product.image || ''}" alt="${product.name || ''}" class="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-white p-1">
                </div>
            </td>
            <td class="w-44 px-4 py-3 text-center">
                <span class="text-sm font-medium text-gray-800 line-clamp-2">${product.name || ''}</span>
            </td>
            <td class="w-28 px-4 py-3 text-center">
                <span class="text-sm text-gray-600">${product.brand || ''}</span>
            </td>
            <td class="w-32 px-4 py-3 text-right">
                <span class="text-sm font-medium text-gray-800">${formatPrice(product.price)}đ</span>
            </td>
            <!-- 👇 gán id cho cột stock -->
            <td class="w-24 px-4 py-3 text-center" id="stock-${product.id}">
                <span class="text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                    ${product.stock || 0}
                </span>
            </td>
            <td class="w-40 px-4 py-3 text-center">
                <span class="text-sm text-gray-500 whitespace-nowrap">${formatDate(product.created_at)}</span>
            </td>
            <td class="w-28 px-4 py-3">
                <div class="flex justify-center items-center space-x-2">
                    <button onclick="editProduct('${product.id}')" class="p-1 rounded text-blue-600 hover:bg-blue-50">
                        ✏️
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="p-1 rounded text-red-600 hover:bg-red-50">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        elements.tableBody.appendChild(row);

        // 🔄 Gọi API lấy stock mới nhất rồi update vào cell
        const newStock = await refreshStock(product.id);
        if (newStock !== null) {
            const stockCell = document.getElementById(`stock-${product.id}`);
            if (stockCell) {
                stockCell.innerHTML = `
                    <span class="text-sm font-medium ${newStock > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${newStock}
                    </span>
                `;
            }
        }
    });
}


// Edit product
async function editProduct(id) {
    if (!id || !elements.modal || !elements.form) return;
    
    try {
        const products = await window.getProducts();
        const product = products.find(p => String(p.id) === String(id));
        
        if (!product) {
            showNotification('error', 'Không tìm thấy sản phẩm');
            return;
        }

        // Fill form with product data
        if (elements.productId) elements.productId.value = product.id;
        if (elements.name) elements.name.value = product.name;
        if (elements.brand) elements.brand.value = product.brand;
        if (elements.price) elements.price.value = product.price;
        if (elements.stock) elements.stock.value = product.stock;
        if (elements.image) elements.image.value = product.image || '';
        if (elements.description) elements.description.value = product.description || '';
        
        // Set colors and sizes
        if (typeof window.setSelectedOptions === 'function') {
            try {
                // Handle colors
                let colors = [];
                if (product.colors) {
                    colors = typeof product.colors === 'string' ? 
                            JSON.parse(product.colors) : 
                            Array.isArray(product.colors) ? product.colors : [];
                }
                
                // Handle sizes
                let sizes = [];
                if (product.sizes) {
                    sizes = typeof product.sizes === 'string' ? 
                            JSON.parse(product.sizes) : 
                            Array.isArray(product.sizes) ? product.sizes : [];
                }
                
                window.setSelectedOptions(colors, sizes);
            } catch (e) {
                console.error('Error parsing colors/sizes:', e);
                window.setSelectedOptions([], []);
            }
        }
        
        // Update modal title and show
        if (elements.title) elements.title.textContent = 'Chỉnh sửa sản phẩm';
        elements.modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('error', 'Không thể tải thông tin sản phẩm: ' + error.message);
    }
}

// Delete product
async function deleteProduct(id) {
    console.log('Deleting product with ID:', id); // Debug log

    const confirmed = confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');
    if (!confirmed) {
        console.log('User cancelled deletion'); // Debug log
        return;
    }

    try {
        console.log('Sending delete request...'); // Debug log
        
        // Gọi API trực tiếp tới backend
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Xóa sản phẩm thất bại!');
        }

        const result = await response.json();
        console.log('Delete result:', result);

        showNotification('success', 'Xóa sản phẩm thành công!');
        await loadProducts(); // Refresh lại danh sách
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('error', 'Không thể xóa sản phẩm: ' + error.message);
    }
}
