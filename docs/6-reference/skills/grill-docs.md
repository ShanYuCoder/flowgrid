# Skill: `/grill-docs`

## Tên
`grill-docs`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill-docs <page-id/slug>`
- Chỉ được gọi khi có sự xung đột giữa hai luồng kiểm định trước đó (`/grill-bqa` vs `/grill-dev`) hoặc khi cần tổng hợp/chốt sổ đặc tả cuối cùng trước khi chuyển sang sinh code. Cấm gọi độc lập thay thế cho `grill-bqa` hay `grill-dev`.

## Input (Dữ liệu đầu vào)
- `ir/design.yaml` (dữ liệu UI/Logic đã qua xử lý).
- `ir/spec.yaml` (các mô tả văn xuôi business).
- File bundle gốc `*.bundle.yaml`.

## Output (Kết quả mong đợi)
- File `*.bundle.yaml` đã được vá lỗi xung đột, xóa bỏ mâu thuẫn giữa Business và Technical.
- File QA Tech Debt (`qa/open/QA-…`) nếu có vấn đề không thể tự dung hòa.
- Chạy lệnh `forgekit split` để sinh lại Intermediate Representation (IR).

## Description / Ý nghĩa
- Kỹ năng mang tính chất **hòa giải (Reconcile)**: Xóa bỏ các mâu thuẫn (conflicts) giữa góc nhìn Nghiệp vụ (BQA) và góc nhìn Lập trình (Dev/Tech).
  - BQA yêu cầu luồng A (ví dụ: tạo mới qua modal).
  - Dev lại gắn nhãn `#pattern: admin-crud` hoặc gọi API `#reuse-api` không khớp.
  - `grill-docs` sẽ phát hiện sự không đồng nhất này và xử lý.
- Đóng vai trò là chốt chặn cuối cùng (Codegen gate): Kiểm tra nghiêm ngặt `bundle.gen.codegen.profile` giống hệt `/grill-dev`. Nếu thiếu, không cho pass mà trả ngược lại cho `/grill-dev`.
- Xác nhận lại việc thừa kế các Pattern dùng chung (Common Patterns) và các thẻ chia tách component (`#split-hook:*`).

## Các Skill liên quan
- **Trước đó:** Nhận đầu vào từ `/grill-bqa` và `/grill-dev`.
- **Sau đó:** Chuyển giao thông tin sang cho `FE Codegenkit` để chạy prototype (Sinh code giao diện giả lập).

## Chú ý quan trọng
- **Cấm đoán (Out of scope):** Không được tạo mới kho UI (page inventory) từ đầu, không đọc lại source code legacy, không triển khai viết code FE hay API.
- **Luật AskQuestion Tech Debt:** Nếu gặp xung đột không thể tự giải quyết dựa vào bằng chứng có sẵn, Agent buộc phải dùng AskQuestion để hỏi người dùng lựa chọn (Must include "Log as Tech Debt"). Nếu user chọn Tech Debt, sinh file QA pointer tương ứng. 
- Không bao giờ được phép để lại trường `openQuestions` trên file YAML của hệ thống.
