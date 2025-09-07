
const cart = [];
const users = [
	{ username: "admin", password: "123456" },
	{ username: "user", password: "123456" }
];

function renderProducts(customList) {
	const productsEl = document.getElementById('products-list');
	let filtered = Array.isArray(customList) 
		? customList 
		: products.filter(p => currentBrand === "Tất cả" || p.brand === currentBrand);

	if (!Array.isArray(customList)) {
		if (currentSort === "price") filtered.sort((a, b) => a.price - b.price);
		else if (currentSort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
		else if (currentSort === "date") filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
		else if (currentSort === "all") filtered = products.slice();
	}

	productsEl.innerHTML = filtered.map(p => {
		return `
		<div class="bg-white rounded-xl shadow p-4 flex flex-col items-stretch border border-gray-200 h-full">
			<div class="relative w-full flex justify-center">
				<img src="${p.image}" alt="${p.name}" class="h-40 w-auto object-contain mb-2" />
				${p.discount ? `<span class='absolute left-2 top-2 bg-black text-white text-xs px-2 py-1 rounded'>-${p.discount}%</span>` : ''}
			</div>
			<h3 class="font-bold text-lg mb-1 text-center min-h-[48px] flex items-center justify-center">${p.name}</h3>
			<p class="text-gray-600 mb-1 text-center min-h-[36px] flex items-center justify-center">${p.desc || ''}</p>
			<div class="flex flex-col items-center mb-2 min-h-[40px] justify-center">
				<span class="font-bold text-xl text-gray-900">${p.price.toLocaleString()}đ</span>
				${p.oldPrice ? `<span class="text-gray-400 line-through text-base">${p.oldPrice.toLocaleString()}đ</span>` : ''}
			</div>
			${p.outOfStock ? `<span class="text-red-600 font-bold text-lg mb-2">TẠM HẾT</span>` : ''}
			<div class="flex gap-2 w-full mt-auto">
				${!p.outOfStock ? `<button onclick="window.location.href='buy.html'" class="flex-1 px-2 py-1 border border-black rounded font-semibold flex items-center justify-center gap-1 text-xs hover:bg-gray-100 min-w-[90px]">
					<svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-1.3L17 13M7 13V6a1 1 0 011-1h9a1 1 0 011 1v7'/></svg><span>MUA NGAY</span></button>` : ''}
				<button onclick="showDetail(${p.id})" class="flex-1 px-2 py-1 border border-black rounded font-semibold flex items-center justify-center gap-1 text-xs hover:bg-gray-100 min-w-[90px]">
					<svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/></svg><span>CHI TIẾT</span>
				</button>
			</div>
		</div>
		`;
	}).join('');

	const noProducts = document.getElementById('no-products');
	if (filtered.length === 0) {
		noProducts && (noProducts.classList.remove('hidden'));
	} else {
		noProducts && (noProducts.classList.add('hidden'));
	}
}

function renderHot() {
	const hotProducts = products.slice(0, 4); // lấy 4 giày hot đầu tiên
	const hot = hotProducts[hotIndex % hotProducts.length];
	document.getElementById('hot-img').src = hot.image;
	document.getElementById('hot-img').alt = hot.name;
}

window.onload = function() {
	// Tìm kiếm giày
	const searchInput = document.getElementById('search-input');
	const suggestBox = document.getElementById('search-suggest');
	const productsList = document.getElementById('products-list');
	const noProducts = document.getElementById('no-products');
	let lastSearchResults = [];
	if (searchInput) {
		searchInput.addEventListener('input', function() {
			const val = this.value.trim().toLowerCase();
			if (!val) {
				suggestBox.innerHTML = '';
				suggestBox.classList.add('hidden');
				renderProducts();
				noProducts && (noProducts.classList.add('hidden'));
				return;
			}
			const results = products.filter(p => p.name.toLowerCase().includes(val));
			lastSearchResults = results;
			if (results.length) {
				suggestBox.innerHTML = results.map(p => `<div class='px-4 py-2 cursor-pointer hover:bg-purple-100' data-id='${p.id}'>${p.name}</div>`).join('');
				suggestBox.classList.remove('hidden');
			} else {
				suggestBox.innerHTML = `<div class='px-4 py-2 text-gray-500'>Không có đôi nào thỏa mãn</div>`;
				suggestBox.classList.remove('hidden');
			}
		});
		suggestBox.addEventListener('mousedown', function(e) {
			const item = e.target.closest('[data-id]');
			if (item) {
				const id = item.getAttribute('data-id');
				const prod = products.find(p => p.id == id);
				if (prod) {
					searchInput.value = prod.name;
					suggestBox.classList.add('hidden');
					renderProducts([prod]);
					noProducts && (noProducts.classList.add('hidden'));
				}
			}
		});
		searchInput.addEventListener('keydown', function(e) {
			if (e.key === 'Enter') {
				suggestBox.classList.add('hidden');
				if (lastSearchResults.length) {
					renderProducts(lastSearchResults);
					noProducts && (noProducts.classList.add('hidden'));
				} else {
					productsList.innerHTML = '';
					noProducts && (noProducts.classList.remove('hidden'));
				}
			}
		});
	}
	// Hiển thị tên người dùng
	const username = localStorage.getItem('username') || '';
	if (document.getElementById('username-display')) {
		document.getElementById('username-display').textContent = username;
	}
	// Hiển thị dialog đăng nhập thành công nếu vừa đăng nhập
	if (localStorage.getItem('showLoginDialog') === 'true') {
		const dialog = document.getElementById('login-dialog');
		if (dialog) {
			dialog.style.display = '';
			setTimeout(() => {
				dialog.style.display = 'none';
				localStorage.removeItem('showLoginDialog');
			}, 3000);
		}
	}
	renderProducts();
	renderHot();
	// Sự kiện nhãn hàng
	document.querySelectorAll('.brand-btn').forEach(btn => {
		btn.onclick = function() {
			document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
			this.classList.add('active');
			currentBrand = this.textContent;
			renderProducts();
		};
	});
	// Sự kiện sắp xếp
	if (document.getElementById('sort-select')) {
		document.getElementById('sort-select').onchange = function() {
			currentSort = this.value;
			renderProducts();
		};
	}
	// Sự kiện slider hot
	if (document.getElementById('prev-hot') && document.getElementById('next-hot')) {
		document.getElementById('prev-hot').onclick = function() {
			hotIndex = (hotIndex - 1 + 4) % 4;
			renderHot();
		};
		document.getElementById('next-hot').onclick = function() {
			hotIndex = (hotIndex + 1) % 4;
			renderHot();
		};
	}
};
let currentBrand = "Tất cả";
let currentSort = "price";
let hotIndex = 0;


function addToCart(id) {
	const product = products.find(p => p.id === id);
	if (!product) return;
	const item = cart.find(i => i.id === id);
	if (item) {
		item.qty++;
	} else {
		cart.push({ ...product, qty: 1 });
	}
	renderCart();
	alert('Đã thêm vào giỏ hàng!');
}

function renderCart() {
	const cartEl = document.getElementById('cart-items');
	if (!cartEl) return;
	cartEl.innerHTML = cart.length === 0 ? '<li>Giỏ hàng trống</li>' : cart.map(item => `
		<li>
			${item.name} x${item.qty} - <strong>${(item.price * item.qty).toLocaleString()}đ</strong>
			<button onclick="removeFromCart(${item.id})">Xóa</button>
		</li>
	`).join('');
}

function removeFromCart(id) {
	const idx = cart.findIndex(i => i.id === id);
	if (idx > -1) {
		cart.splice(idx, 1);
		renderCart();
	}
}

function checkout() {
	if (cart.length === 0) {
		alert('Giỏ hàng trống!');
		return;
	}
	alert('Cảm ơn bạn đã mua hàng!');
	cart.length = 0;
	renderCart();
}

// Chuyển đổi giữa trang chủ và giỏ hàng
window.onload = function() {
	renderProducts();
	renderHot();
	// ...existing code...
}

function showDetail(id) {
	window.location.href = 'product-detail.html';
}
// Đăng nhập đơn giản
