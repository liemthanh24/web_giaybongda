// Kiểm tra quyền admin khi tải trang
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin page loaded');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Current user:', user);
    
    if (!user || user.role !== 'admin') {
        console.log('Not admin, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('Initializing admin interface');
        // Khởi tạo các chức năng
        initTabs();
        initProductManagement();
        await loadProducts();
        console.log('Admin interface initialized');
    } catch (error) {
        console.error('Error initializing admin interface:', error);
    }
});

// Khởi tạo tabs
function initTabs() {
    const tabs = document.querySelectorAll('.admin-btn');
    const tabContents = document.querySelectorAll('.admin-tab');

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Xóa active khỏi tất cả các tab
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));

            // Thêm active cho tab được chọn
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
        });
    });
}

// Khởi tạo quản lý sản phẩm
function initProductManagement() {
    const addBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const cancelBtn = document.getElementById('product-cancel');
    const deleteModal = document.getElementById('delete-modal');
    const deleteConfirm = document.getElementById('delete-confirm');
    const deleteCancel = document.getElementById('delete-cancel');

    // Mở form thêm sản phẩm mới
    addBtn.addEventListener('click', () => {
        document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới';
        productForm.reset();
        document.getElementById('product-id').value = '';
        productModal.classList.remove('hidden');
    });

    // Đóng modal sản phẩm
    cancelBtn.addEventListener('click', () => {
        productModal.classList.add('hidden');
    });

    // Xử lý submit form sản phẩm
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('product-name').value,
            brand: document.getElementById('product-brand').value,
            price: parseInt(document.getElementById('product-price').value),
            image: document.getElementById('product-image').value || 'assets/default-shoe.jpg',
            desc: document.getElementById('product-desc').value
        };

        const productId = document.getElementById('product-id').value;
        let result;

        if (productId) {
            // Cập nhật sản phẩm
            result = await updateProduct(productId, productData);
        } else {
            // Thêm sản phẩm mới
            result = await addProduct(productData);
        }

        if (result.success) {
            productModal.classList.add('hidden');
            loadProducts();
        } else {
            alert('Có lỗi xảy ra: ' + (result.error || 'Không thể lưu sản phẩm'));
        }
    });

    // Đóng modal xóa
    deleteCancel.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    // Xác nhận xóa sản phẩm
    deleteConfirm.addEventListener('click', async () => {
        const productId = deleteConfirm.dataset.productId;
        if (productId) {
            const result = await deleteProduct(productId);
            if (result.success) {
                deleteModal.classList.add('hidden');
                loadProducts();
            } else {
                alert('Có lỗi xảy ra khi xóa sản phẩm');
            }
        }
    });
}

// Tải danh sách sản phẩm
async function loadProducts() {
    try {
        console.log('Loading products...');
        const productsList = document.getElementById('products-admin-list');
        if (!productsList) {
            console.error('products-admin-list element not found');
            return;
        }

        const products = await getProducts();
        console.log('Products loaded:', products);
        
        if (!products || products.length === 0) {
            productsList.innerHTML = '<div class="col-span-full text-center text-gray-500">Chưa có sản phẩm nào</div>';
            return;
        }

    productsList.innerHTML = products.map(product => `
        <div class="bg-white rounded-xl shadow p-4">
            <img src="${product.image || 'assets/default-shoe.jpg'}" 
                 alt="${product.name}" 
                 class="w-full h-40 object-contain mb-4 rounded-lg">
            <h3 class="font-bold text-lg mb-1">${product.name}</h3>
            <p class="text-gray-600 mb-2">${product.brand}</p>
            <p class="text-xl font-bold text-purple-600 mb-4">${product.price.toLocaleString()}đ</p>
            <div class="flex gap-2">
                <button onclick="editProduct(${product.id})" 
                        class="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Sửa
                </button>
                <button onclick="confirmDelete(${product.id}, '${product.name}')" 
                        class="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Xóa
                </button>
            </div>
        </div>
    `).join('');
}

// Mở form sửa sản phẩm
async function editProduct(productId) {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('product-modal-title').textContent = 'Sửa sản phẩm';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-brand').value = product.brand;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-desc').value = product.desc || '';
        
        document.getElementById('product-modal').classList.remove('hidden');
    }
}

// Hiển thị xác nhận xóa sản phẩm
function confirmDelete(productId, productName) {
    const deleteModal = document.getElementById('delete-modal');
    const deleteConfirm = document.getElementById('delete-confirm');
    const deleteMsg = document.getElementById('delete-modal-msg');
    
    deleteMsg.textContent = `Bạn có chắc muốn xóa sản phẩm "${productName}"?`;
    deleteConfirm.dataset.productId = productId;
    deleteModal.classList.remove('hidden');
}
    btn.onclick = function() {
        tabs.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        tabContents.forEach(tab => tab.classList.add('hidden'));
        document.getElementById('tab-' + this.dataset.tab).classList.remove('hidden');
    };
};

// ...Các hàm render doanh thu, render sản phẩm, render người dùng, modal thêm/xóa sản phẩm, nâng cấp user, cấm user...
// (Sẽ bổ sung chi tiết logic khi có yêu cầu cụ thể về dữ liệu hoặc hành động)
// Kiểm tra quyền admin khi tải trang
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin page loaded');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Current user:', user);
    
    if (!user || user.role !== 'admin') {
        console.log('Not admin, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('Initializing admin interface');
        // Khởi tạo các chức năng
        initTabs();
        initProductManagement();
        await loadProducts();
        console.log('Admin interface initialized');
    } catch (error) {
        console.error('Error initializing admin interface:', error);
    }
});

// Khởi tạo tabs
function initTabs() {
    const tabs = document.querySelectorAll('.admin-btn');
    const tabContents = document.querySelectorAll('.admin-tab');

    // Thêm sự kiện click cho mỗi tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            console.log('Switching to tab:', tabId);

            // Bỏ active khỏi tất cả các tab
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));

            // Thêm active cho tab được chọn
            tab.classList.add('active');
            const selectedTab = document.getElementById(`tab-${tabId}`);
            if (selectedTab) {
                selectedTab.classList.remove('hidden');
                
                // Load dữ liệu khi chuyển tab
                if (tabId === 'products') {
                    loadProducts();
                } else if (tabId === 'users') {
                    loadUsers();
                }
            }
        });
    });
}

// Load danh sách sản phẩm
async function loadProducts() {
    try {
        console.log('Loading products...');
        const productsList = document.getElementById('products-admin-list');
        
        if (!productsList) {
            console.error('products-admin-list element not found');
            return;
        }

        const products = await getProducts();
        console.log('Products loaded:', products);

        if (!products || products.length === 0) {
            productsList.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Chưa có sản phẩm nào</div>';
            return;
        }

        productsList.innerHTML = products.map(product => `
            <div class="bg-white rounded-xl shadow p-4">
                <img src="${product.image || 'assets/default-shoe.jpg'}" 
                     alt="${product.name}" 
                     class="w-full h-40 object-contain mb-4 rounded-lg">
                <h3 class="font-bold text-lg mb-1">${product.name}</h3>
                <p class="text-gray-600 mb-2">${product.brand}</p>
                <p class="text-xl font-bold text-purple-600 mb-4">${product.price.toLocaleString()}đ</p>
                <div class="flex gap-2">
                    <button onclick="editProduct(${product.id})" 
                            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Sửa
                    </button>
                    <button onclick="confirmDelete(${product.id}, '${product.name}')" 
                            class="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Xóa
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load danh sách người dùng
async function loadUsers() {
    console.log('Loading users...');
    const usersList = document.getElementById('users-admin-list');
    if (usersList) {
        usersList.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Chức năng đang được phát triển</div>';
    }
}

