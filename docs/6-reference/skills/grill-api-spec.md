# Skill: `/grill-api-spec`

## Tên
`grill-api-spec`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill-api-spec <page-id/slug>`
- Luôn phải chạy sau `/api-spec` và trước khi qua bước Codegenkit (`/api`) của Backend.

## Input (Dữ liệu đầu vào)
- Đọc `ir/design.yaml` để xác minh lại việc Frontend cần những API gì (actions / apiRefs).
- Đọc file hợp đồng Backend vừa tạo `01-backend-spec.yaml`.

## Output (Kết quả mong đợi)
- File `01-backend-spec.yaml` được vá/sửa đổi nếu phát hiện sai sót.
- Bổ sung các thẻ gencode (`codegen.profile`, `entity`, `module`, `#gen:*`) vào `01-backend-spec.yaml`.
- Chạy qua các cổng kiểm định CLI: `docskit api:check`, `openapi:gen` và `openapi:render`.

## Description / Ý nghĩa
- Kỹ năng **kiểm toán (Audit)** độc quyền cho Technical Backend.
- Đối soát khắt khe giữa những gì thiết kế FE yêu cầu và những gì API cung cấp (Database schemas, API endpoints, data types, securitySchemes).
- **Kiểm định thẻ `#reuse-api`:** Quét lại toàn bộ các actions của Frontend xem có vi phạm việc đẻ ra các API dư thừa hay không. Nếu action nào có `#reuse-api` thì file YAML đó không được quyền đẻ ra `api/<seq>` mới.
- **Kiểm định Error Matrix:** Kiểm tra gắt gao các mã lỗi (Endpoint Error Storming Matrix). Ví dụ route có tham số `{id}` bắt buộc phải cover lỗi 404 và 403 IDOR. Form Submit phải cover lỗi 422.

## Các Skill liên quan
- **Trước đó:** `/api-spec`.
- **Sau đó:** `pnpm docs:render` để team review giao diện, sau đó bàn giao cho Backend Codegenkit (`/api`) để đẻ source code thực tế.

## Chú ý quan trọng
- **Cấm đoán:** Tuyệt đối không sinh Markdown reports, BQA 3-Pillars reports hay mã nguồn (FastAPI, Laravel) bằng tay.
- Mọi Tech Debt (Câu hỏi chưa rõ ràng) đều phải được tracking dưới dạng `#tech-debt:QA-<feature.id>-NNNN` và đối chiếu bằng file vật lý trong `qa/open/`. Không được để lại `openQuestions`.
