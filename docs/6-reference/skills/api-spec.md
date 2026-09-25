# Skill: `/api-spec`

## Tên
`api-spec`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/api-spec <page-id/slug>`
- Chỉ chạy **SAU KHI** FE Spec đã được tạo và các actions cần gọi API đã được liệt kê (Trong `ir/design.yaml`). Không chạy độc lập trước khi có giao diện.

## Input (Dữ liệu đầu vào)
- Đọc mảng `design.actions` hoặc `apiRefs` từ `ir/design.yaml` của trang tương ứng.
- Phải quét qua các API dùng chung (`common/yaml/`) hoặc các api của màn hình lân cận để tìm cơ hội tái sử dụng (`#reuse-api`).

## Output (Kết quả mong đợi)
- Nếu API là mới hoàn toàn: Tạo thư mục `api/<seq>/` và sinh file `01-backend-spec.yaml` theo đúng chuẩn (Tuân thủ nghiêm ngặt cấu trúc của [`backend-api.bundle.yaml`](../../../../.flowgrid/templates/backend-api.bundle.yaml)).
- Nếu API gọi lại đồ cũ: Đánh tag `#reuse-api` và tham chiếu `reuseFrom:` trên file bundle hiện tại, **KHÔNG** sinh ra bộ 3 file api mới (`01`, `02`, `03`).
- File `02-openapi.yaml` (nếu sinh file 01 mới, thì sau đó chạy lệnh `flowgrid openapi_gen`).

## Description / Ý nghĩa
- Chuyên dùng để thiết kế hợp đồng Backend API (Backend API Contract).
- **Quy tắc tái sử dụng (Reuse First):** Luôn ưu tiên dùng lại API đã có bằng thẻ `#reuse-api`. Tránh tình trạng sinh ra hàng loạt API rác, thừa thãi cho các tác vụ giống nhau (như lấy dropdown list).
- **Quy tắc đặt tên URI tường minh (Explicit URI Naming):** Cấm đoán việc dùng RESTful mù mờ. Luôn phải gắn hậu tố rõ ràng ở đuôi API (VD: `/create`, `/{id}/update`, `/{id}/delete`, `/{id}/detail`).
- **Phân loại lỗi (Endpoint Error Storming):** Ép buộc phải định nghĩa rõ API này có thể gặp lỗi gì (404 Not Found, 403 IDOR, 422 Validation, 409 Conflict) bằng các thẻ `#err:*` và `errorStorming`. 

## Các Skill liên quan
- **Trước đó:** Bắt buộc phải có `ir/design.yaml` (Kết quả của `/spec` hoặc `/update-spec`).
- **Sau đó:** Chạy lệnh sinh `02-openapi.yaml` (Skill `/openapi`). Bị review gắt gao bởi `/grill-api-spec`.

## Chú ý quan trọng
- **Luật AskQuestion Tech Debt:** Nếu thông tin truyền tải bị thiếu, Agent bắt buộc phải hỏi Member bằng Form AskQuestion và phải có tuỳ chọn `"Log as Tech Debt"`. Trả lời "Tech Debt" sẽ sinh file `QA-<feature.id>-NNNN`. Cấm để lại cờ `openQuestions` bên trong file YAML.
- **KHÔNG SINH FILE MARKDOWN:** `api-spec` chỉ sinh YAML. Việc render ra giao diện `.md` cho người đọc là nhiệm vụ bộ docs (`flowgrid render` / `pnpm flowgrid:render`).
- Tác nhân (Agent) phải luôn đọc file template mẫu `.flowgrid/templates/backend-api.bundle.yaml` trước khi gen YAML mới.
