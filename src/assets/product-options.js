// Thay thế toàn bộ file: ../assets/product-options.js

const AVAILABLE_COLORS = [
    { name: 'Trắng', value: '#FFFFFF' },
    { name: 'Đen', value: '#000000' },
    { name: 'Đỏ', value: '#FF0000' },
    { name: 'Xanh dương', value: '#0000FF' },
    { name: 'Xanh lá', value: '#008000' },
    { name: 'Vàng', value: '#FFFF00' },
    { name: 'Cam', value: '#FFA500' }
];
const AVAILABLE_SIZES = ['37', '38', '39', '40', '41', '42', '43', '44'];

document.addEventListener('DOMContentLoaded', function() {
    const colorsContainer = document.getElementById('colors-container');
    const sizesContainer = document.getElementById('sizes-container');

    // --- HÀM RENDER CÁC NÚT BẤM ---
    function renderOptions() {
        if (colorsContainer) {
            // Thay đổi grid để các nút không bị dính sát nhau
            colorsContainer.className = 'mt-2 grid grid-cols-5 sm:grid-cols-7 gap-3';
            colorsContainer.innerHTML = AVAILABLE_COLORS.map(color => `
                <button type="button" 
                        class="color-option" 
                        data-value="${color.name}" 
                        style="background-color: ${color.value};" 
                        title="${color.name}">
                </button>
            `).join('');
            
            // Thêm sự kiện click để chọn/bỏ chọn (toggle)
            colorsContainer.querySelectorAll('.color-option').forEach(btn => {
                btn.addEventListener('click', () => btn.classList.toggle('selected'));
            });
        }

        if (sizesContainer) {
            // Thay đổi grid
            sizesContainer.className = 'mt-2 grid grid-cols-4 sm:grid-cols-6 gap-3';
            sizesContainer.innerHTML = AVAILABLE_SIZES.map(size => `
                <button type="button" 
                        class="size-option" 
                        data-value="${size}">
                    ${size}
                </button>
            `).join('');

            // Thêm sự kiện click để chọn/bỏ chọn (toggle)
            sizesContainer.querySelectorAll('.size-option').forEach(btn => {
                btn.addEventListener('click', () => btn.classList.toggle('selected'));
            });
        }
    }

    renderOptions();
});


// --- CẬP NHẬT CÁC HÀM LẤY VÀ SET DỮ LIỆU ---

window.getSelectedOptions = function() {
    const selectedColors = Array.from(document.querySelectorAll('.color-option.selected'))
        .map(btn => btn.dataset.value);
    const selectedSizes = Array.from(document.querySelectorAll('.size-option.selected'))
        .map(btn => btn.dataset.value);
    return { colors: selectedColors, sizes: selectedSizes };
};

window.setSelectedOptions = function(colors = [], sizes = []) {
    // Bỏ chọn tất cả các nút trước
    document.querySelectorAll('.color-option, .size-option').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Chọn lại các mục tương ứng với dữ liệu của sản phẩm
    if (Array.isArray(colors)) {
        colors.forEach(color => {
            const el = document.querySelector(`.color-option[data-value="${color}"]`);
            if (el) el.classList.add('selected');
        });
    }

    if (Array.isArray(sizes)) {
        sizes.forEach(size => {
            const el = document.querySelector(`.size-option[data-value="${size}"]`);
            if (el) el.classList.add('selected');
        });
    }
};