# Kỹ năng: `/wire` & `/grill-wire`

## Tên
`wire`, `grill-wire`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/wire` và `/grill-wire`.
- Chạy ở Phase 3, sau khi cả Frontend Prototype (2a) và Backend API (2c) đã hoàn thiện.

## Input (Dữ liệu đầu vào)
- Đọc lại đặc tả giao diện (`ir/design.yaml`) và API Spec.
- Đọc Source code Frontend (đang dùng API Mock).
- Các tag đánh dấu dời lại tích hợp như `#wire-only:*` hoặc `#update:*`.

## Output (Kết quả mong đợi)
- **`/wire`**: Tháo bỏ 100% các API Mock/Stub ở phía giao diện Frontend. Đấu nối trực tiếp vào API Backend thật.
- Khắc phục các lỗi về CORS, sai lệch contract dữ liệu (nếu có) giữa FE và BE.
- Xóa bỏ các tag `#update:*` và `#wire-only:*` để chốt sổ tính năng.
- **`/grill-wire`**: Đóng vai trò kiểm thử lại luồng tích hợp (Integration testing), soi xem dữ liệu từ BE trả ra hiển thị trên FE có khớp với Business Spec ban đầu không.

## Description / Ý nghĩa
- Nằm ở **Phase 3 (Wire - Hội tụ)**.
- Đây là điểm "hội tụ" (Converge) của dây chuyền sản xuất: Lúc trước FE và BE được phát triển song song rẽ nhánh. Giờ đây cả 2 sẽ đan lại vào nhau.
- Nếu xảy ra mâu thuẫn lớn về Spec giữa FE và BE trong khâu này, hệ thống sẽ đẩy ngược lại về kỹ năng `/api-update-spec` hoặc `/update-spec` để làm lại.
