// Thay thế toàn bộ file: ../assets/cart.js

document.addEventListener('DOMContentLoaded', function() {
    const cartList = document.getElementById('cart-list');
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        cartList.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500">Bạn cần đăng nhập để xem giỏ hàng</td></tr>`;
        return;
    }

    // Lấy các element của dialog xóa
    const deleteModal = document.getElementById('delete-confirm-modal');
    const deleteOkBtn = document.getElementById('delete-confirm-ok');
    const deleteCancelBtn = document.getElementById('delete-confirm-cancel');

    // Gán sự kiện cho các nút trong dialog
    deleteCancelBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    deleteOkBtn.addEventListener('click', () => {
        const orderId = deleteOkBtn.dataset.orderId; // Lấy orderId đã lưu
        if (orderId) {
            deleteOrder(orderId);
        }
        deleteModal.classList.add('hidden');
    });


    // Lấy dữ liệu giỏ hàng và hiển thị
    fetch(`http://localhost:3001/api/orders/${userId}`)
        .then(res => res.json())
        .then(cartItems => {
            if (!cartItems || cartItems.length === 0) {
                cartList.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500">Giỏ hàng của bạn đang trống</td></tr>`;
                return;
            }

            cartList.innerHTML = cartItems.map(item => `
                <tr class="border-b align-top">
                    <td class="py-4 px-4 align-top">
                        <div class="flex items-start gap-4">
                            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain rounded-xl border">
                            <div>
                                <div class="font-bold text-base mb-1">${item.name}</div>
                                <div class="text-gray-700 text-sm mb-1">${item.color || ''} / ${item.size || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-4 text-center align-top">${Number(item.price).toLocaleString()}đ</td>
                    <td class="py-4 px-4 text-center align-top">${item.quantity}</td>
                    <td class="py-4 px-4 text-center align-top font-bold">${(item.price * item.quantity).toLocaleString()}đ</td>
                    <td class="py-4 px-4 text-center align-top font-semibold">${item.status}</td>
                    <td class="py-4 px-4 text-center align-top">
                        <button onclick="confirmDeleteOrder(${item.id})" class="text-red-500 hover:text-red-700" title="Xóa đơn hàng">
                            <svg class="w-6 h-6 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error("Lỗi tải giỏ hàng:", err);
            cartList.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500">Lỗi khi tải giỏ hàng. Vui lòng thử lại!</td></tr>`;
        });
});

// Hàm này giờ chỉ để hiện dialog và lưu orderId
function confirmDeleteOrder(orderId) {
    const deleteModal = document.getElementById('delete-confirm-modal');
    const deleteOkBtn = document.getElementById('delete-confirm-ok');
    
    // Lưu orderId vào nút "Xóa" để sử dụng sau
    deleteOkBtn.dataset.orderId = orderId;

    // Hiển thị dialog
    deleteModal.classList.remove('hidden');
}

// Hàm này không thay đổi, chỉ gọi API để xóa
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
            alert('Xóa đơn hàng thành công!');
            location.reload(); // Tải lại trang để cập nhật danh sách
        } else {
            alert('Lỗi: ' + result.error);
        }
    } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        alert('Đã xảy ra lỗi khi cố gắng xóa đơn hàng.');
    }
}