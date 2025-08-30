// products.js - Chỉ định nghĩa cấu trúc dữ liệu, không còn dữ liệu mẫu
const products = [
    // Format mẫu cho sản phẩm:
    /*
    {
        id: number,         // ID sản phẩm
        name: string,       // Tên sản phẩm
        price: number,      // Giá (VND)
        brand: string,      // Thương hiệu
        date: string,       // Ngày thêm vào (YYYY-MM-DD)
        image: string,      // Đường dẫn ảnh
        desc: string,       // Mô tả
        outOfStock: boolean // Trạng thái hết hàng (tùy chọn)
    }
    */
	{
		id: 6,
		name: "Mitre Delta",
		price: 990000,
		brand: "Mitre",
		date: "2023-12-20",
		image: "assets/mitre-delta.jpg",
		desc: "Giày Mitre Delta bền đẹp.",
		outOfStock: true
	},
	{
		id: 7,
		name: "Jogabola Classic",
		price: 850000,
		brand: "Jogabola",
		date: "2023-11-15",
		image: "assets/jogabola-classic.jpg",
		desc: "Giày Jogabola Classic phong cách cổ điển."
	},
	{
		id: 8,
		name: "Pan Vigor",
		price: 1250000,
		brand: "Pan",
		date: "2023-10-01",
		image: "assets/pan-vigor.jpg",
		desc: "Giày Pan Vigor dành cho mọi sân bóng."
	}
];
