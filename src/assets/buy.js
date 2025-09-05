// src/assets/buy.js

document.addEventListener('DOMContentLoaded', async function () {
    // --- STATE (Lưu trữ trạng thái của trang) ---
    const state = {
        product: null,
        stock: {},
        selectedColor: null,
        selectedSize: null,
        quantity: 1,
    };

    // --- DOM ELEMENTS (Lấy các phần tử HTML để thao tác) ---
    const elements = {
        name: document.getElementById('product-name'),
        code: document.getElementById('product-code'),
        price: document.getElementById('product-price'),
        image: document.getElementById('product-image'),
        colorsContainer: document.getElementById('product-colors'),
        sizesContainer: document.getElementById('product-sizes'),
        decreaseBtn: document.getElementById('decrease-quantity'),
        increaseBtn: document.getElementById('increase-quantity'),
        quantityInput: document.getElementById('quantity-input'),
        stockStatus: document.getElementById('stock-status'),
        unitPrice: document.getElementById('unit-price'),
        totalAmount: document.getElementById('total-amount'),
        orderBtn: document.getElementById('order-btn'),
    };

    // --- HELPER FUNCTIONS (Các hàm hỗ trợ) ---
    function formatCurrency(amount) {
        return (amount || 0).toLocaleString('vi-VN') + 'đ';
    }

    // Hàm parse JSON an toàn, nếu lỗi hoặc dữ liệu rỗng sẽ trả về mảng rỗng
    function parseJSONSafe(jsonString, defaultValue = []) {
        if (!jsonString) return defaultValue;
        
        let data = jsonString;
        // Nếu dữ liệu là một chuỗi, thử parse nó. Điều này xử lý trường hợp chuỗi JSON lồng nhau.
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Nếu parse lỗi, có thể nó không phải là JSON, trả về giá trị mặc định
                console.error("Lỗi parse JSON:", e, "Dữ liệu gốc:", jsonString);
                return defaultValue;
            }
        }

        // Đảm bảo kết quả cuối cùng là một mảng
        return Array.isArray(data) ? data : defaultValue;
    }
    function normalizeToArray(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                return [value];
            }
        }
        return [value];
    }

document.addEventListener('DOMContentLoaded', async function () {
    // --- STATE (Lưu trữ trạng thái của trang) ---
    const state = {
        product: null,
        stock: {},
        selectedColor: null,
        selectedSize: null,
        quantity: 1,
    };

    // --- DOM ELEMENTS (Lấy các phần tử HTML để thao tác) ---
    const elements = {
        name: document.getElementById('product-name'),
        code: document.getElementById('product-code'),
        price: document.getElementById('product-price'),
        image: document.getElementById('product-image'),
        colorsContainer: document.getElementById('product-colors'),
        sizesContainer: document.getElementById('product-sizes'),
        decreaseBtn: document.getElementById('decrease-quantity'),
        increaseBtn: document.getElementById('increase-quantity'),
        quantityInput: document.getElementById('quantity-input'),
        stockStatus: document.getElementById('stock-status'),
        unitPrice: document.getElementById('unit-price'),
        totalAmount: document.getElementById('total-amount'),
        orderBtn: document.getElementById('order-btn'),
    };

    // --- HELPER FUNCTIONS (Các hàm hỗ trợ) ---
    function formatCurrency(amount) {
        return (amount || 0).toLocaleString('vi-VN') + 'đ';
    }

    // --- UI RENDERING FUNCTIONS (Các hàm cập nhật giao diện) ---

    // Hiển thị thông tin sản phẩm cơ bản
    function renderProductInfo() {
        if (!state.product) return;
        elements.name.textContent = state.product.name || 'Không có tên';
        elements.code.textContent = state.product.code || 'N/A';
        elements.price.textContent = formatCurrency(state.product.price);
        // Sửa lỗi đường dẫn ảnh: Giả sử ảnh nằm trong thư mục /assets/ và tên file được lưu trong DB
        elements.image.src = state.product.image ? `/assets/${state.product.image}` : '';
        elements.unitPrice.textContent = formatCurrency(state.product.price);
    }
function prepareColorsAndSizes() {
    let colors = Array.isArray(state.product.colors) ? state.product.colors : [];
    let sizes  = Array.isArray(state.product.sizes) ? state.product.sizes : [];

    // Nếu rỗng, lấy từ stock keys
    if ((colors.length === 0 || sizes.length === 0) && state.stock) {
        const stockKeys = Object.keys(state.stock); // ["Trắng-37", "Trắng-38", "Đen-37", "Đen-38"]
        colors = [...new Set(stockKeys.map(k => k.split('-')[0]))];
        sizes  = [...new Set(stockKeys.map(k => k.split('-')[1]))];
    }

    state.product.colors = colors;
    state.product.sizes = sizes;
}
    // Hiển thị các nút chọn màu
    function renderColorOptions() {
        elements.colorsContainer.innerHTML = '';
        // Lấy màu sắc từ state
        const colors = Array.isArray(state.product.colors) ? state.product.colors : [];
        console.log('[Buy.js] Rendering colors:', colors);

        if (colors.length === 0) {
            elements.colorsContainer.textContent = 'Không có lựa chọn màu sắc.';
            return;
        }

        colors.forEach((colorObj, index) => {
            const colorName = typeof colorObj === 'string' ? colorObj : (colorObj.name || colorObj);
            const btn = document.createElement('button');
            btn.className = 'w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none';
            
            // Xử lý màu sắc tiếng Việt
            const colorMap = {
                "Đen": "#000000",
                "Trắng": "#ffffff",
                "Đỏ": "#ff0000",
                "Xanh dương": "#4141dcff",
                "Xanh lá": "#00ff00"
            };
            btn.style.backgroundColor = colorMap[colorName] || colorName;
            btn.dataset.color = colorName;
            btn.title = colorName;
            
            // Chọn màu đầu tiên làm mặc định
            if (index === 0) {
                state.selectedColor = colorName;
                btn.classList.add('border-purple-600', 'scale-110');
            } else {
                btn.classList.add('border-gray-200');
            }

            btn.addEventListener('click', () => {
                state.selectedColor = colorName;
                // Cập nhật giao diện cho nút được chọn
                elements.colorsContainer.querySelectorAll('button').forEach(b => {
                    b.classList.remove('border-purple-600', 'scale-110', 'selected');
                    b.classList.add('border-gray-200');
                });
                btn.classList.add('border-purple-600', 'scale-110', 'selected');
                btn.classList.remove('border-gray-200');
                updateUI(); // Cập nhật lại toàn bộ UI khi thay đổi lựa chọn
            });
            elements.colorsContainer.appendChild(btn);
        });
    }

    // Hiển thị các nút chọn size
    function renderSizeOptions() {
        elements.sizesContainer.innerHTML = '';
        // Lấy kích thước từ state
        const sizes = Array.isArray(state.product.sizes) ? state.product.sizes : [];
        console.log('[Buy.js] Rendering sizes:', sizes);

        if (sizes.length === 0) {
            elements.sizesContainer.textContent = 'Không có lựa chọn kích thước.';
            return;
        }

        sizes.forEach((size, index) => {
            const btn = document.createElement('button');
            btn.className = 'px-4 py-2 border rounded-lg transition-colors duration-200';
            btn.textContent = size;
            btn.dataset.size = size;

            // Chọn size đầu tiên làm mặc định
            if (index === 0) {
                state.selectedSize = size;
                btn.classList.add('border-purple-600', 'bg-purple-50');
            }

            btn.addEventListener('click', () => {
                state.selectedSize = size;
                // Cập nhật giao diện cho nút được chọn
                elements.sizesContainer.querySelectorAll('button').forEach(b => b.classList.remove('border-purple-600', 'bg-purple-50'));
                btn.classList.add('border-purple-600', 'bg-purple-50');
                updateUI(); // Cập nhật lại toàn bộ UI khi thay đổi lựa chọn
            });
            elements.sizesContainer.appendChild(btn);
        });
    }

    // Cập nhật toàn bộ giao diện (tồn kho, giá tiền, trạng thái nút)
    function updateUI() {
        if (!state.product) return;
        const stockKey = `${state.selectedColor}-${state.selectedSize}`;
        const availableStock = state.stock[stockKey] || 0;

        if (availableStock > 0) {
            elements.stockStatus.textContent = `(Còn ${availableStock} sản phẩm)`;
            elements.stockStatus.className = 'text-green-600 text-sm';
            elements.orderBtn.disabled = false;
            elements.orderBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-500');
            elements.orderBtn.classList.add('bg-black', 'hover:bg-gray-800');
            elements.quantityInput.disabled = false;
            if (state.quantity === 0) state.quantity = 1;
        } else {
            elements.stockStatus.textContent = '(Hết hàng)';
            elements.stockStatus.className = 'text-red-500 text-sm';
            elements.orderBtn.disabled = true;
            elements.orderBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-500');
            elements.orderBtn.classList.remove('bg-black', 'hover:bg-gray-800');
            elements.quantityInput.disabled = true;
            state.quantity = 0;
        }

        elements.quantityInput.value = state.quantity;
        elements.quantityInput.max = availableStock;
        elements.totalAmount.textContent = formatCurrency(state.product.price * state.quantity);
    }

    // --- EVENT LISTENERS (Gán sự kiện cho các nút) ---
    elements.increaseBtn.addEventListener('click', () => {
        const maxStock = parseInt(elements.quantityInput.max, 10);
        if (state.quantity < maxStock) {
            state.quantity++;
            updateUI();
        }
    });

    elements.decreaseBtn.addEventListener('click', () => {
        if (state.quantity > 1) {
            state.quantity--;
            updateUI();
        }
    });

    // --- INITIALIZATION (Khởi tạo trang) ---
    try {
        const productJSON = localStorage.getItem('selectedProduct');
        if (!productJSON) throw new Error('Không tìm thấy dữ liệu sản phẩm trong localStorage.');
        state.product = JSON.parse(productJSON);
        
        // Debug log để kiểm tra dữ liệu sản phẩm
        console.log('[Buy.js] Product data:', state.product);
        console.log('[Buy.js] Colors:', state.product.colors);
        console.log('[Buy.js] Sizes:', state.product.sizes);

        // Ensure colors and sizes are arrays
        if (typeof state.product.colors === 'string') {
            try {
                state.product.colors = JSON.parse(state.product.colors);
            } catch (e) {
                state.product.colors = [state.product.colors];
            }
        }
        if (typeof state.product.sizes === 'string') {
            try {
                state.product.sizes = JSON.parse(state.product.sizes);
            } catch (e) {
                state.product.sizes = [state.product.sizes];
            }
        }

        const response = await fetch(`http://localhost:3001/api/products/${state.product.id}/stock`);
        if (!response.ok) throw new Error('Không thể tải thông tin tồn kho từ server.');
        const data = await response.json();
        state.stock = data.stock || {};
        console.log('[Buy.js] Fetched Stock:', state.stock); // DEBUG

        // Bắt đầu hiển thị mọi thứ lên giao diện
        renderProductInfo();
        prepareColorsAndSizes();
        renderColorOptions();
        renderSizeOptions();

        // --- SET DEFAULT SELECTIONS (Đặt lựa chọn mặc định sau khi render) ---
        const firstColorBtn = elements.colorsContainer.querySelector('button');
        if (firstColorBtn) {
            state.selectedColor = firstColorBtn.dataset.color;
        firstColorBtn.classList.add('border-purple-600', 'scale-110', 'selected');
        }

        const firstSizeBtn = elements.sizesContainer.querySelector('button');
        if (firstSizeBtn) {
            state.selectedSize = firstSizeBtn.dataset.size;
            firstSizeBtn.classList.add('border-purple-600', 'bg-purple-50', 'selected');
        }

        updateUI();

    } catch (error) {
        console.error("Lỗi khởi tạo trang buy.html:", error);
        // Hiển thị lỗi cho người dùng một cách thân thiện hơn
        elements.name.textContent = "Lỗi tải sản phẩm";
        elements.colorsContainer.textContent = `Đã xảy ra lỗi: ${error.message}. Vui lòng thử lại.`;
        // alert(`Lỗi: ${error.message}`);
    }
   // --- Modal Elements ---
const confirmModal = document.getElementById("confirm-modal");
const confirmOkBtn = document.getElementById("confirm-ok");
const confirmCancelBtn = document.getElementById("confirm-cancel");
const successModal = document.getElementById("success-modal");
const successOkBtn = document.getElementById("success-ok");

// --- Đặt hàng ---
elements.orderBtn.addEventListener("click", () => {
  if (!state.product) return;

  // Mở modal confirm
  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("flex");
});

// Xử lý nút "Đồng ý"
// Xử lý nút "Đồng ý"
confirmOkBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");

  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("Bạn cần đăng nhập để mua hàng!");
    return;
  }

  fetch("http://localhost:3001/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      items: [
        {
          product_id: state.product.id,
          color: state.selectedColor,
          size: state.selectedSize,
          quantity: state.quantity,
          price: state.product.price,
          status: "Đang giao"   // ✅ đặc biệt cho buy
        }
      ]
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      successModal.classList.remove("hidden");
      successModal.classList.add("flex");
    } else {
      alert("Lỗi khi đặt hàng: " + (data.error || "Không rõ nguyên nhân"));
    }
  })
  .catch(err => {
    console.error("Lỗi API:", err);
    alert("Không thể kết nối tới server!");
  });
});


// Xử lý nút "Hủy"
confirmCancelBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

// Xử lý nút "OK" trong modal thành công
successOkBtn.addEventListener("click", () => {
  successModal.classList.add("hidden");
  window.location.href = "cart.html";
});
});
    // --- UI RENDERING FUNCTIONS (Các hàm cập nhật giao diện) ---

    // Hiển thị thông tin sản phẩm cơ bản
    function renderProductInfo() {
        if (!state.product) return;
        elements.name.textContent = state.product.name || 'Không có tên';
        elements.code.textContent = state.product.code || 'N/A';
        elements.price.textContent = formatCurrency(state.product.price);
        // Sửa lỗi đường dẫn ảnh: Giả sử ảnh nằm trong thư mục /assets/ và tên file được lưu trong DB
        elements.image.src = state.product.image ? `/assets/${state.product.image}` : '';
        elements.unitPrice.textContent = formatCurrency(state.product.price);
    }
function prepareColorsAndSizes() {
    let colors = Array.isArray(state.product.colors) ? state.product.colors : [];
    let sizes  = Array.isArray(state.product.sizes) ? state.product.sizes : [];

    // Nếu rỗng, lấy từ stock keys
    if ((colors.length === 0 || sizes.length === 0) && state.stock) {
        const stockKeys = Object.keys(state.stock); // ["Trắng-37", "Trắng-38", "Đen-37", "Đen-38"]
        colors = [...new Set(stockKeys.map(k => k.split('-')[0]))];
        sizes  = [...new Set(stockKeys.map(k => k.split('-')[1]))];
    }

    state.product.colors = colors;
    state.product.sizes = sizes;
}
    // Hiển thị các nút chọn màu
    function renderColorOptions() {
        elements.colorsContainer.innerHTML = '';
        // Lấy màu sắc từ state
        const colors = Array.isArray(state.product.colors) ? state.product.colors : [];
        console.log('[Buy.js] Rendering colors:', colors);

        if (colors.length === 0) {
            elements.colorsContainer.textContent = 'Không có lựa chọn màu sắc.';
            return;
        }

        colors.forEach((colorObj, index) => {
            const colorName = typeof colorObj === 'string' ? colorObj : (colorObj.name || colorObj);
            const btn = document.createElement('button');
            btn.className = 'w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none';
            
            // Xử lý màu sắc tiếng Việt
            const colorMap = {
                "Đen": "#000000",
                "Trắng": "#ffffff",
                "Đỏ": "#ff0000",
                "Xanh dương": "#4141dcff",
                "Xanh lá": "#00ff00"
            };
            btn.style.backgroundColor = colorMap[colorName] || colorName;
            btn.dataset.color = colorName;
            btn.title = colorName;
            
            // Chọn màu đầu tiên làm mặc định
            if (index === 0) {
                state.selectedColor = colorName;
                btn.classList.add('border-purple-600', 'scale-110');
            } else {
                btn.classList.add('border-gray-200');
            }

            btn.addEventListener('click', () => {
                state.selectedColor = colorName;
                // Cập nhật giao diện cho nút được chọn
                elements.colorsContainer.querySelectorAll('button').forEach(b => {
                    b.classList.remove('border-purple-600', 'scale-110', 'selected');
                    b.classList.add('border-gray-200');
                });
                btn.classList.add('border-purple-600', 'scale-110', 'selected');
                btn.classList.remove('border-gray-200');
                updateUI(); // Cập nhật lại toàn bộ UI khi thay đổi lựa chọn
            });
            elements.colorsContainer.appendChild(btn);
        });
    }

    // Hiển thị các nút chọn size
    function renderSizeOptions() {
        elements.sizesContainer.innerHTML = '';
        // Lấy kích thước từ state
        const sizes = Array.isArray(state.product.sizes) ? state.product.sizes : [];
        console.log('[Buy.js] Rendering sizes:', sizes);

        if (sizes.length === 0) {
            elements.sizesContainer.textContent = 'Không có lựa chọn kích thước.';
            return;
        }

        sizes.forEach((size, index) => {
            const btn = document.createElement('button');
            btn.className = 'px-4 py-2 border rounded-lg transition-colors duration-200';
            btn.textContent = size;
            btn.dataset.size = size;

            // Chọn size đầu tiên làm mặc định
            if (index === 0) {
                state.selectedSize = size;
                btn.classList.add('border-purple-600', 'bg-purple-50');
            }

            btn.addEventListener('click', () => {
                state.selectedSize = size;
                // Cập nhật giao diện cho nút được chọn
                elements.sizesContainer.querySelectorAll('button').forEach(b => b.classList.remove('border-purple-600', 'bg-purple-50'));
                btn.classList.add('border-purple-600', 'bg-purple-50');
                updateUI(); // Cập nhật lại toàn bộ UI khi thay đổi lựa chọn
            });
            elements.sizesContainer.appendChild(btn);
        });
    }

    // Cập nhật toàn bộ giao diện (tồn kho, giá tiền, trạng thái nút)
    function updateUI() {
        if (!state.product) return;
        const stockKey = `${state.selectedColor}-${state.selectedSize}`;
        const availableStock = state.stock[stockKey] || 0;

        if (availableStock > 0) {
            elements.stockStatus.textContent = `(Còn ${availableStock} sản phẩm)`;
            elements.stockStatus.className = 'text-green-600 text-sm';
            elements.orderBtn.disabled = false;
            elements.orderBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-500');
            elements.orderBtn.classList.add('bg-black', 'hover:bg-gray-800');
            elements.quantityInput.disabled = false;
            if (state.quantity === 0) state.quantity = 1;
        } else {
            elements.stockStatus.textContent = '(Hết hàng)';
            elements.stockStatus.className = 'text-red-500 text-sm';
            elements.orderBtn.disabled = true;
            elements.orderBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-500');
            elements.orderBtn.classList.remove('bg-black', 'hover:bg-gray-800');
            elements.quantityInput.disabled = true;
            state.quantity = 0;
        }

        elements.quantityInput.value = state.quantity;
        elements.quantityInput.max = availableStock;
        elements.totalAmount.textContent = formatCurrency(state.product.price * state.quantity);
    }

    // --- EVENT LISTENERS (Gán sự kiện cho các nút) ---
    elements.increaseBtn.addEventListener('click', () => {
        const maxStock = parseInt(elements.quantityInput.max, 10);
        if (state.quantity < maxStock) {
            state.quantity++;
            updateUI();
        }
    });

    elements.decreaseBtn.addEventListener('click', () => {
        if (state.quantity > 1) {
            state.quantity--;
            updateUI();
        }
    });

    // --- INITIALIZATION (Khởi tạo trang) ---
    try {
        const productJSON = localStorage.getItem('selectedProduct');
        if (!productJSON) throw new Error('Không tìm thấy dữ liệu sản phẩm trong localStorage.');
        state.product = JSON.parse(productJSON);
        
        // Debug log để kiểm tra dữ liệu sản phẩm
        console.log('[Buy.js] Product data:', state.product);
        console.log('[Buy.js] Colors:', state.product.colors);
        console.log('[Buy.js] Sizes:', state.product.sizes);

        // Ensure colors and sizes are arrays
        state.product.colors = normalizeToArray(state.product.colors);
        state.product.sizes  = normalizeToArray(state.product.sizes);


        const response = await fetch(`http://localhost:3001/api/products/${state.product.id}/stock`);
        if (!response.ok) throw new Error('Không thể tải thông tin tồn kho từ server.');
        const data = await response.json();
        state.stock = data.stock || {};
        console.log('[Buy.js] Fetched Stock:', state.stock); // DEBUG

        // Bắt đầu hiển thị mọi thứ lên giao diện
        renderProductInfo();
        prepareColorsAndSizes();
        renderColorOptions();
        renderSizeOptions();

        // --- SET DEFAULT SELECTIONS (Đặt lựa chọn mặc định sau khi render) ---
        const firstColorBtn = elements.colorsContainer.querySelector('button');
        if (firstColorBtn) {
            state.selectedColor = firstColorBtn.dataset.color;
        firstColorBtn.classList.add('border-purple-600', 'scale-110', 'selected');
        }

        const firstSizeBtn = elements.sizesContainer.querySelector('button');
        if (firstSizeBtn) {
            state.selectedSize = firstSizeBtn.dataset.size;
            firstSizeBtn.classList.add('border-purple-600', 'bg-purple-50', 'selected');
        }

        updateUI();

    } catch (error) {
        console.error("Lỗi khởi tạo trang buy.html:", error);
        // Hiển thị lỗi cho người dùng một cách thân thiện hơn
        elements.name.textContent = "Lỗi tải sản phẩm";
        elements.colorsContainer.textContent = `Đã xảy ra lỗi: ${error.message}. Vui lòng thử lại.`;
        // alert(`Lỗi: ${error.message}`);
    }
   // --- Modal Elements ---
const confirmModal = document.getElementById("confirm-modal");
const confirmOkBtn = document.getElementById("confirm-ok");
const confirmCancelBtn = document.getElementById("confirm-cancel");
const successModal = document.getElementById("success-modal");
const successOkBtn = document.getElementById("success-ok");

// --- Đặt hàng ---
elements.orderBtn.addEventListener("click", () => {
  if (!state.product) return;

  // Mở modal confirm
  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("flex");
});

// Xử lý nút "Đồng ý"
// Xử lý nút "Đồng ý"
confirmOkBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");

  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("Bạn cần đăng nhập để mua hàng!");
    return;
  }

  fetch("http://localhost:3001/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      items: [
        {
          product_id: state.product.id,
          color: state.selectedColor,
          size: state.selectedSize,
          quantity: state.quantity,
          price: state.product.price,
          status: "Đang giao"   // ✅ đặc biệt cho buy
        }
      ]
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      successModal.classList.remove("hidden");
      successModal.classList.add("flex");
    } else {
      alert("Lỗi khi đặt hàng: " + (data.error || "Không rõ nguyên nhân"));
    }
  })
  .catch(err => {
    console.error("Lỗi API:", err);
    alert("Không thể kết nối tới server!");
  });
});


// Xử lý nút "Hủy"
confirmCancelBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

// Xử lý nút "OK" trong modal thành công
successOkBtn.addEventListener("click", () => {
  successModal.classList.add("hidden");
  window.location.href = "cart.html";
});
});