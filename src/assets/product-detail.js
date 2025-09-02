// product-detail.js - cho product-detail.html
document.addEventListener('DOMContentLoaded', function() {
	const id = localStorage.getItem('selectedProductId');
	const p = products.find(x => x.id == id);
	if (!p) return;

	document.getElementById('product-image').src = p.image;
	document.getElementById('product-image').alt = p.name;
	document.getElementById('product-name').textContent = p.name;
	document.getElementById('product-code').textContent = 'ID: ' + p.id;
	document.getElementById('product-price').textContent = p.price.toLocaleString() + 'đ';
	
	// Màu sắc mẫu (ví dụ, có thể mở rộng từ dữ liệu)
	const colors = p.colors || [p.image];
	const colorsEl = document.getElementById('product-colors');
	colorsEl.innerHTML = colors.map((img, i) => `<img src="${img}" alt="Màu ${i+1}" class="w-12 h-12 object-contain border rounded cursor-pointer">`).join('');
	
	// Kích thước mẫu (ví dụ, có thể mở rộng từ dữ liệu)
	const sizes = p.sizes || [37,38,39,40,41,42,43,"40.5","42.5"];
	const sizesEl = document.getElementById('product-sizes');
	sizesEl.innerHTML = sizes.map(s => {
		const disabled = (typeof s === 'string');
		return `<button class="px-4 py-2 border rounded font-semibold ${disabled ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-900'}" ${disabled ? 'disabled' : ''}>${s}</button>`;
	}).join('');
});
