# Skill: `/api-integration`

## Tên
`api-integration`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/api-integration <provider/slug>` (Ví dụ: `/api-integration stripe/charge`)
- Dùng ĐỘC QUYỀN cho các API tích hợp ngoại vi (Partner APIs, Webhooks inbound/outbound) không có giao diện Portal FE đi kèm.

## Input (Dữ liệu đầu vào)
- Tên Provider, danh sách các Event webhook, tài liệu PDF hoặc OpenAPI URL của đối tác (Partner).
- Các file legacy controller cũ (nếu muốn reverse-engineer lại).
- Các ghi chú lưu tại `docs/integrations/{provider}/*.md`.

## Output (Kết quả mong đợi)
- Tạo ra thư mục tích hợp mới tại: `surfaces/integrations/<provider>/<slug>/api/<seq>/`.
- Sinh ra bộ 3 file quen thuộc: `01-backend-spec.yaml`, `02-openapi.yaml` (dùng `docskit openapi:gen`), và `03-mock-data.yaml`.
- Dữ liệu `portalRefs` sẽ rỗng (empty), thay vào đó khai báo các mảng `integrationRefs[]` và `integrationBacklog[]`.

## Description / Ý nghĩa
- Khác với `/api-spec` chuyên phục vụ cho giao diện Frontend nội bộ, kỹ năng này dành riêng cho thế giới không giao diện (No Portal FE). 
- Đóng vai trò là cầu nối chuẩn hoá hợp đồng giao tiếp giữa hệ thống Forgekit và các đối tác bên ngoài (Ví dụ: Cổng thanh toán Stripe, Push Notification Firebase, v.v.).
- Yêu cầu bắt buộc tuân thủ quy tắc **Tái sử dụng API (API Reuse)** để không bị duplicate các webhooks, và quy tắc **Đặt tên Action rõ ràng (Explicit URI Naming)** (VD: `/api/v1/integrations/<provider>/webhook`).
- Đòi hỏi phải định nghĩa rõ các mã lỗi từ đối tác (Integration Error Storming) như lỗi chữ ký số (`#err:signature-invalid`), lỗi giới hạn request (`#err:rate-limit`).

## Các Skill liên quan
- **Thay thế cho:** `/api-spec` (Nếu màn hình đó có UI thì KHÔNG ĐƯỢC DÙNG lệnh này, mà phải dùng `/api-spec`).
- **Sau đó:** Bị review gắt gao bởi `/grill-integration-spec` (để gắn tag sinh code và kiểm định).

## Chú ý quan trọng
- **Cấm đoán:** Tuyệt đối không sinh Markdown report hay gộp chung nhiều provider/endpoint vào cùng 1 file. Không được gắn cờ sinh code (`codegen`, `#gen:*`) ở bước này.
- **Luật AskQuestion Tech Debt:** Các thông tin bảo mật như Chữ ký (Signature), Retention, Retry logic... nếu không rõ, Agent phải mở form AskQuestion hỏi Member. Bắt buộc có option `"Log as Tech Debt"`. Trả lời "Tech Debt" sẽ sinh file trong `qa/open/`.
