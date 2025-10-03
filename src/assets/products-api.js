// products-api.js
const API_URL = 'http://localhost:3001/api';
// Define base functions in global scope
window.getProducts = async function() {
    try {
        console.log('Fetching products...');
        const response = await fetch(`${API_URL}/products`);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.sqlMessage || data.error?.message || 'Failed to fetch products');
        }

        console.log('Received products:', data);
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        // Add more context to the error
        throw new Error(`Failed to fetch products: ${error.message}`);
    }
}

// Lấy sản phẩm theo brand
async function getProductsByBrand(brand) {
    try {
        const products = await getProducts();
        return brand.toLowerCase() === 'all' 
            ? products 
            : products.filter(product => product.brand.toLowerCase() === brand.toLowerCase());
    } catch (error) {
        console.error('Lỗi khi lọc sản phẩm theo hãng:', error);
        return [];
    }
}

// Thêm sản phẩm mới
async function addProduct(product) {
    try {
        console.log('Sending product data:', product);
        
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        const data = await response.json();
        console.log('Server response:', { status: response.status, data });

        if (!response.ok) {
            // Nếu có lỗi, ném lỗi với message từ server
            const errorMessage = data.error || 'Failed to add product';
            const error = new Error(errorMessage);
            error.details = data.details;
            throw error;
        }
        
        return data; // Return the product data directly
    } catch (error) {
        console.error('Error adding product:', error);
        throw error; // Re-throw để product-management.js có thể xử lý
    }
}

// Helper function để tạo ID mới
function generateProductId(brand) {
    const prefix = brand.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${randomNum}`;
}

// Thay thế trong file: ../assets/products-api.js

async function updateProduct(id, product) {
    try {
        console.log('Đang cập nhật sản phẩm:', { id, product });

        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        // Đọc nội dung phản hồi MỘT LẦN DUY NHẤT
        const data = await response.json();

        // Kiểm tra trạng thái sau khi đã đọc
        if (!response.ok) {
            // Nếu có lỗi, ném lỗi với message từ server
            throw new Error(data.error || 'Cập nhật sản phẩm thất bại');
        }

        console.log('Dữ liệu sau khi cập nhật:', data);
        return data; // Trả về dữ liệu thành công

    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        throw error; // Ném lỗi ra ngoài để hàm gọi nó có thể xử lý
    }
}

// Xóa sản phẩm
async function deleteProduct(id) {
    try {
        console.log('Sending DELETE request to:', `${API_URL}/products/${id}`); // Debug log

        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Delete response status:', response.status); // Debug log
        
        const data = await response.json();
        console.log('Delete response data:', data); // Debug log
        
        if (!response.ok) {
            throw new Error(data.error || 'Không thể xóa sản phẩm');
        }
        
        return data;
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        throw error;
    }
}

// Tìm kiếm sản phẩm
async function searchProducts(query) {
    try {
        const products = await getProducts();
        const searchTerm = query.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        return [];
    }
}

function sortProducts(products, criteria) {
    return [...products].sort((a, b) => {
        switch (criteria.toLowerCase()) {
            case 'price':
                return a.price - b.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });
}

// Make functions available globally
window.getProducts = getProducts;
window.getProductsByBrand = getProductsByBrand;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
