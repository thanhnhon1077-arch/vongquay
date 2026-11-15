# Vòng Quay May Mắn (Lucky Draw) - BZT USA | ROCKY

Ứng dụng web Vòng Quay May Mắn giao diện đỏ rượu vang – vàng ánh kim sang trọng, chạy trực tiếp trên trình duyệt mà không cần cài đặt backend.

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

## Cách chạy dự án

1. Giải nén file `vong-quay-may-man.zip`.
2. Mở trực tiếp file `index.html` bằng trình duyệt (Chrome, Edge, Safari...) hoặc chạy qua Live Server trong VS Code.
