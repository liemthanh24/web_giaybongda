// cart.js - render giỏ hàng demo

document.addEventListener('DOMContentLoaded', function() {
    // Demo dữ liệu giỏ hàng
    const cart = [
        {
            name: "MORELIA NEO IV PRO AG",
            image: "assets/mizuno-red.jpg",
            color: "Đỏ vàng",
            size: "40",
            code: "P1GA233564.40",
            price: 1299000,
            quantity: 1,
            status: "Đã đặt"
        },
        {
            name: "WAVE DRIVE 9",
            image: "assets/mizuno-blue.jpg",
            color: "Trắng xanh dương",
            size: "37",
            code: "81GA220532.37",
            price: 2750000,
            quantity: 1,
            status: "Đang giao"
        },
        {
            name: "MORELIA NEO IV PRO FG",
            image: "assets/mizuno-monarcida.jpg",
            color: "Trắng xanh",
            size: "42",
            code: "P1GA243425.42",
            price: 2190000,
            quantity: 3,
            status: "Đã nhận"
        }
    ];
    const cartList = document.getElementById('cart-list');
        cartList.innerHTML = cart.map(item => `
            <tr class="border-b">
                <td class="py-4 flex gap-4 items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-contain rounded-xl border">
                    <div>
                        <div class="font-bold text-lg mb-1">${item.name}</div>
                        <div class="text-gray-700 text-sm mb-1">${item.color} / ${item.size}</div>
                        <div class="text-gray-700 text-sm mb-1">${item.code}</div>
                    </div>
                </td>
                <td class="py-4 font-bold text-lg">${item.price.toLocaleString()}đ</td>
                <td class="py-4 text-center font-bold text-lg">${item.quantity}</td>
                <td class="py-4 font-bold text-lg">${(item.price * item.quantity).toLocaleString()}đ</td>
                <td class="py-4 font-semibold">${item.status}</td>
            </tr>
        `).join('');
});
