# Skill: `/grill-integration-spec`

## Tên
`grill-integration-spec`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill-integration-spec <provider/slug>`
- Chạy SAU KHI `/api-integration` đã hoàn tất, và TRƯỚC KHI chuyển sang hệ thống sinh code Backend.

## Input (Dữ liệu đầu vào)
- Đọc file hợp đồng Backend Integration tại `surfaces/integrations/<provider>/<slug>/api/<seq>/01-backend-spec.yaml`.
- Tuyệt đối KHÔNG đọc `ir/design.yaml` vì Integration API hiếm khi có giao diện Frontend đi kèm.

## Output (Kết quả mong đợi)
- File `01-backend-spec.yaml` được vá/bổ sung nếu thiếu sót về Auth, Idempotency, Retry logic.
- Bổ sung các thẻ gencode (`codegen.profile`, `entity`, `module`, `#gen:*`, `#manual-service`).
- Cập nhật trạng thái `approval.status` thành `reviewed` (hoặc `approved`).
- Chạy qua các cổng kiểm định CLI: `flowgrid openapi_gen` và `flowgrid openapi_render`.

## Description / Ý nghĩa
- Đóng vai trò là "Kiểm toán viên" (Auditor) dành riêng cho các hợp đồng giao tiếp ngoại vi (Webhook, Partner API). 
- Đảm bảo rằng hợp đồng kết nối với đối tác (Provider) đã có đủ các lớp bảo mật (Auth/SecuritySchemes) và các cơ chế kỹ thuật phức tạp (như chống trùng lặp dữ liệu - Idempotency, tự động thử lại - Retry).
- Khác với API của ứng dụng nội bộ, API tích hợp không chịu sự chi phối của cấu trúc màn hình, do đó Agent chỉ tập trung đối chiếu với tài liệu của đối tác.

## Các Skill liên quan
- **Trước đó:** Nhận dữ liệu thô từ `/api-integration`.
- **Sau đó:** Nếu được đánh dấu `approved`, có thể bàn giao cho hệ thống bộ code BE (`/api` với cờ `--type=be`) để sinh code.

## Chú ý quan trọng
- **Cấm đoán:** Không tự ý viết mã nguồn Backend, không sinh các bản báo cáo Markdown rườm rà.
- KHÔNG BẮT BUỘC phải đồng bộ mô hình dữ liệu với Frontend (Portal Testcase hay FE model alignment) vì tích hợp bên thứ 3 thường có Data schema độc lập.
- Không bao giờ được đánh dấu "Ready for code" (sẵn sàng sinh code) nếu chưa có bằng chứng đã chạy vượt qua các lệnh kiểm định bộ docs (`flowgrid check`, `flowgrid openapi_gen`, …).
