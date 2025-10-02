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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    initializeApp().catch(error => {
        console.error('Failed to initialize:', error);
        showNotification('error', 'Lỗi khởi tạo: ' + error.message);
    });
});


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
        if (data && data.stock && typeof data.stock === 'object') {
            const total = Object.values(data.stock).reduce((sum, val) => sum + val, 0);
            return total;
        }
        return 0;
    } catch (err) {
        console.error("[refreshStock] Lỗi:", err);
        return null;
    }
}

// Trong file: ../assets/product-management.js

function renderProductsTable(products) {
    const tableBody = document.getElementById('products-list');
    if (!tableBody) return;

    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-500">Không có sản phẩm nào.</td></tr>`;
        return;
    }

    tableBody.innerHTML = ''; // Xóa nội dung cũ
    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${product.image || ''}" alt="${product.name}" class="w-12 h-12 object-contain rounded-md border p-1 bg-white">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${product.name}</div>
                <div class="text-sm text-gray-500">${product.code}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.brand}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${(product.price || 0).toLocaleString('vi-VN')}đ</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm ${product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}">${product.stock}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex justify-center items-center gap-4">
                    <button onclick="editProduct(${product.id})" class="text-purple-600 hover:text-purple-900" title="Sửa sản phẩm">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900" title="Xóa sản phẩm">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
            </td>
        </tr>
        `;
        tableBody.appendChild(row);
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
