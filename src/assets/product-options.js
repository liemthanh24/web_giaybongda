// Các màu sắc và kích thước có sẵn
const AVAILABLE_COLORS = ['Trắng', 'Đen', 'Đỏ', 'Xanh dương', 'Xanh lá'];
const AVAILABLE_SIZES = ['37', '38', '39', '40', '41', '42', '43'];

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các container - chỉ lấy reference, không tạo lại elements
    const colorsContainer = document.getElementById('colors-container');
    const sizesContainer = document.getElementById('sizes-container');

    // Hàm lấy các giá trị đã chọn
    window.getSelectedOptions = function() {
        const selectedColors = Array.from(document.querySelectorAll('input[name="color"]:checked'))
            .map(input => input.value);
        const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked'))
            .map(input => input.value);
        return { colors: selectedColors, sizes: selectedSizes };
    };

    // Hàm set các giá trị đã chọn
    window.setSelectedOptions = function(colors = [], sizes = []) {
        // Set màu sắc
        document.querySelectorAll('input[name="color"]').forEach(input => {
            input.checked = colors.includes(input.value);
        });

        // Set kích thước
        document.querySelectorAll('input[name="size"]').forEach(input => {
            input.checked = sizes.includes(input.value);
        });
    };

    // Handle form validation for colors and sizes
    const form = document.getElementById('product-form');
    if (form) {
        const originalSubmit = form.onsubmit;
        form.addEventListener('submit', function(e) {
            const { colors, sizes } = window.getSelectedOptions();
            
            // Validate
            if (colors.length === 0 || sizes.length === 0) {
                e.preventDefault();
                alert('Vui lòng chọn ít nhất một màu sắc và một kích thước!');
                return false;
            }
        }, true); // Use capturing phase to run before other handlers
    }
});
