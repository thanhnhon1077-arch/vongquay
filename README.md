# Vòng Quay May Mắn (Lucky Draw) - BZT USA | ROCKY

Ứng dụng web Vòng Quay May Mắn giao diện đỏ rượu vang – vàng ánh kim sang trọng, chạy trực tiếp trên trình duyệt mà không cần cài đặt backend.

🌐 **Link chạy trực tiếp (Live Demo):** [https://thanhnhon1077-arch.github.io/vongquay/](https://thanhnhon1077-arch.github.io/vongquay/)

---

## Tính năng nổi bật

- 🎡 **Vòng quay may mắn:** Thuật toán quay mượt mà với hiệu ứng giảm tốc (cubic ease-out), tự động căn tâm người trúng vào kim chỉ định.
- 🔊 **Âm thanh chân thực:** Sử dụng Web Audio API giả lập tiếng tick khi kim lướt qua từng ô và giai điệu chiến thắng khi trúng giải.
- 🎊 **Pháo hoa giấy (Confetti):** Hiệu ứng pháo hoa rực rỡ khi mở hộp chúc mừng trúng thưởng.
- 👥 **Quản lý danh sách linh hoạt:** Dễ dàng thêm, bớt, xáo trộn danh sách người tham gia. Mỗi người chỉ trúng tối đa 1 giải.
- 🎁 **Tùy biến cơ cấu giải:** Cho phép sửa tên giải, hình ảnh biểu tượng, số lượng giải thưởng và phần quà.
- 📥 **Xuất dữ liệu Excel/CSV:** Lưu lịch sử trúng thưởng kèm thời gian chi tiết, hỗ trợ xuất file CSV định dạng UTF-8 không lỗi font.
- 💾 **Lưu trữ tự động:** Sử dụng LocalStorage để giữ nguyên danh sách và kết quả khi tải lại trang.

---

## Cấu trúc thư mục dự án

```text
vong-quay-may-man/
├── index.html        # Giao diện chính và cấu trúc các tab (Vòng quay, Danh sách & giải, Kết quả)
├── css/
│   └── style.css     # Toàn bộ định dạng giao diện, hiệu ứng kính mờ, modal trúng thưởng
├── js/
│   ├── audio.js      # Hiệu ứng âm thanh quay và chúc mừng bằng Web Audio API
│   ├── confetti.js   # Hiệu ứng pháo hoa giấy khi có người trúng thưởng
│   └── app.js        # Logic vòng quay, quản lý danh sách, giải thưởng, lưu LocalStorage & xuất CSV
└── README.md         # Hướng dẫn sử dụng
```

---

## Cách chạy dự án

1. **Chạy trực tuyến:** Mở ngay đường dẫn [https://thanhnhon1077-arch.github.io/vongquay/](https://thanhnhon1077-arch.github.io/vongquay/) trên trình duyệt máy tính hoặc điện thoại.
2. **Chạy trực tiếp trên máy (Offline):** Mở file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Safari, Firefox...) hoặc chạy qua Live Server trong VS Code.
