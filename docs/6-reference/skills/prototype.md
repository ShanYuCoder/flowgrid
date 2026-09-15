# Lệnh: `portal:gen` & Kỹ năng `/prototype`

## Tên
`portal:gen` (Script) và `/prototype`, `/grill-prototype` (Skills).

## Cách dùng (Command/Trigger)
- Lệnh chạy CLI:
  ```bash
  pnpm portal:gen
  pnpm portal:unit-gen
  ```
- Gọi qua slash command: `/prototype` và `/grill-prototype`.

## Input (Dữ liệu đầu vào)
- Đọc đặc tả giao diện (`ir/design.yaml`) sau khi `docskit split` thành công.
- Các thẻ tags `#needs-component:*`, `#custom-slot:*`.

## Output (Kết quả mong đợi)
- **`portal:gen`**: Sinh ra (Scaffold) các giao diện Vue/React dạng thô (Cells/Pages) chứa sẵn `data-testid` và gắn tag `#needs-component` nếu thiếu các thành phần UI nhỏ (Molecules/Organisms).
- **`/prototype`**: Lập trình viên AI hoặc người dùng sẽ nhảy vào viết code chi tiết cho các thành phần UI bị thiếu (Molecules/DataCells). Quá trình này dùng API Mock giả lập hoàn toàn.
- **`/grill-prototype`**: Soi lỗi lại xem bản code Prototype có khớp với Design Spec gốc không, giao diện có bị sai lệch không.

## Description / Ý nghĩa
- Nằm ở **Phase 2a (Scaffold)**.
- Thay vì bắt AI phải tự viết toàn bộ trang web từ con số 0 dẫn đến rác code, Forgekit ép buộc dùng `portal:gen` để đẻ ra cấu trúc chuẩn trước. AI (`/prototype`) chỉ đóng vai trò "thợ xây" điền vào các chỗ trống (những Component chưa tồn tại trong Design System).
- Ở phase này, UI chạy độc lập hoàn toàn, không cần gọi Backend thật.
