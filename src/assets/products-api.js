// products-api.js
const API_URL = 'http://localhost:3001/api';

async function getProducts() {
    try {
        console.log('Calling API:', `${API_URL}/products`); // Debug log
        const response = await fetch(`${API_URL}/products`);
        
        // Debug logs
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText); // Debug log
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Debug log
        
        if (!Array.isArray(data)) {
            console.log('Data is not an array:', data); // Debug log
            return []; // Return empty array if data is not in expected format
        }
        
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        return []; // Return empty array on error
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
        console.log('Sending product data:', product); // Debug log
        
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        console.log('Response status:', response.status); // Debug log
        
        const data = await response.json();
        console.log('Response data:', data); // Debug log
        
        if (!response.ok) {
            console.error('Error response:', data); // Debug log
            return data; // Return the error response directly
        }
        
        return data;
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        throw error;
    }
}

// Helper function để tạo ID mới
function generateProductId(brand) {
    const prefix = brand.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${randomNum}`;
}

// Cập nhật sản phẩm
async function updateProduct(id, product) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        throw error;
    }
}

// Xóa sản phẩm
async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
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

// Export các functions
export {
    getProducts,
    getProductsByBrand,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    sortProducts
};
