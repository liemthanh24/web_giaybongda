// Toàn bộ mã JavaScript cho trang chính
const products = [
	{
		id: 1,
		name: "Nike Mercurial",
		price: 2200000,
		image: "assets/nike-mercurial.jpg",
		desc: "Giày bóng đá Nike Mercurial chính hãng."
	},
	{
		id: 2,
		name: "Adidas Predator",
		price: 2100000,
		image: "assets/adidas-predator.jpg",
		desc: "Giày bóng đá Adidas Predator chất lượng cao."
	},
	{
		id: 3,
		name: "Puma Future",
		price: 1800000,
		image: "assets/puma-future.jpg",
		desc: "Giày bóng đá Puma Future bền đẹp."
	}
];

const cart = [];

function renderProducts() {
	const productsEl = document.getElementById('products');
	productsEl.innerHTML = products.map(p => `
		<div class="product">
			<img src="${p.image}" alt="${p.name}" />
			<h3>${p.name}</h3>
			<p>${p.desc}</p>
			<p><strong>${p.price.toLocaleString()}đ</strong></p>
			<button onclick="addToCart(${p.id})">Thêm vào giỏ</button>
		</div>
	`).join('');
}

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
const navLinks = document.querySelectorAll('nav a');
navLinks[0].onclick = function() {
	document.getElementById('products').style.display = '';
	document.getElementById('cart').style.display = 'none';
};
navLinks[1].onclick = function() {
	document.getElementById('products').style.display = 'none';
	document.getElementById('cart').style.display = '';
	renderCart();
};

window.onload = renderProducts;
// Đăng nhập đơn giản
let currentUser = null;
const users = [
	{ username: "admin", password: "123456" },
	{ username: "user", password: "password" }
];
