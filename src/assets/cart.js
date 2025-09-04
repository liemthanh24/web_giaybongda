// cart.js - render giỏ hàng từ API

document.addEventListener('DOMContentLoaded', function() {
    const cartList = document.getElementById('cart-list');

    const userId = localStorage.getItem("user_id");
    if (!userId) {
        cartList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-6 text-gray-500">
                    Bạn cần đăng nhập để xem giỏ hàng
                </td>
            </tr>
        `;
        return;
    }

    // ✅ gọi API lấy giỏ hàng của user
    fetch(`http://localhost:3001/api/orders/${userId}`)
        .then(res => res.json())
        .then(cartItems => {
            if (!cartItems || cartItems.length === 0) {
                cartList.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-6 text-gray-500">
                            Giỏ hàng của bạn đang trống
                        </td>
                    </tr>
                `;
                return;
            }

            cartList.innerHTML = cartItems.map(item => `
  <tr class="border-b align-top">
    <!-- Cột sản phẩm -->
    <td class="py-4 px-4 align-top">
      <div class="flex items-start gap-4">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain rounded-xl border">
        <div>
          <div class="font-bold text-base mb-1">${item.name}</div>
          <div class="text-gray-700 text-sm mb-1">${item.color || ''} / ${item.size || ''}</div>
          <div class="text-gray-500 text-xs">Mã: ${item.code || item.product_id}</div>
        </div>
      </div>
    </td>

    <!-- Cột đơn giá -->
    <td class="py-4 px-4 text-center align-top">
      ${Number(item.price).toLocaleString()}đ
    </td>

    <!-- Cột số lượng -->
    <td class="py-4 px-4 text-center align-top">
      ${item.quantity}
    </td>

    <!-- Cột tổng giá -->
    <td class="py-4 px-4 text-center align-top font-bold">
      ${(item.price * item.quantity).toLocaleString()}đ
    </td>

    <!-- Cột trạng thái -->
    <td class="py-4 px-4 text-center align-top font-semibold">
      ${item.status}
    </td>
  </tr>
`).join('');

        })
        .catch(err => {
            console.error("Lỗi tải giỏ hàng:", err);
            cartList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-6 text-red-500">
                        Lỗi khi tải giỏ hàng. Vui lòng thử lại!
                    </td>
                </tr>
            `;
        });
});
