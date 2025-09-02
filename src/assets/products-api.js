// products-api.js

// Define base functions in global scope
window.getProducts = async function() {
    try {
        console.log('Fetching products...');
        const response = await fetch(window.API_URL + '/products');
        
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
        // Log the request
        console.log('Đang cập nhật sản phẩm:', { id, product });
        
        // Ensure product has the correct field name (stock instead of quantity)
        const updatedProduct = {
            ...product,
            stock: product.stock ||  0 // Fallback to quantity or 0
        };
        
        // Log the actual data being sent
        console.log('Sending to API:', {
            url: `${API_URL}/products/${id}`,
            data: updatedProduct
        });
        
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct)
        });
        
        console.log('Trạng thái response:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                console.error('Lỗi từ API:', errorData);
                errorMessage = errorData.error?.sqlMessage || errorData.error || JSON.stringify(errorData);
            } catch (e) {
                const errorText = await response.text();
                console.error('Lỗi từ API (text):', errorText);
                errorMessage = errorText;
            }
            throw new Error(`Lỗi khi cập nhật sản phẩm: ${errorMessage}`);
        }
        
        const data = await response.json();
        console.log('Dữ liệu sau khi cập nhật:', data);
        return data;
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

// Make functions available globally
window.getProducts = getProducts;
window.getProductsByBrand = getProductsByBrand;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
