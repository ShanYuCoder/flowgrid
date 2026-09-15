# Skill: `/spec`

## Tên
`spec`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/spec <module-id/slug/draft-id>`
- Kích hoạt bằng `@forgekit` (hoặc tên bot tương ứng) khi cần tạo bản đặc tả ban đầu (design bundle).
- Khi có thêm cờ `/legacy`: Đọc source cũ và ghi `specOrigin: legacy`.

## Input (Dữ liệu đầu vào)
- User Prompt (mô tả yêu cầu bằng text).
- Draft ID (ví dụ: `1-1-1`, `2-1-2`) hoặc Slug, Module ID (ví dụ: `CMP-ADM-002`).
- File requirement dạng Markdown (nếu có) được tạo sẵn trong thư mục ứng với ID (ví dụ: `01/01/02.md`).
- File template gốc tại `.forgekit/templates/feature.bundle.yaml`.

## Output (Kết quả mong đợi)
- File `*.bundle.yaml` chứa thông tin chức năng tại thư mục `surfaces/<surface>/CMP-*/<numeric-path>/`. (Tuân thủ nghiêm ngặt cấu trúc của [feature.bundle.yaml](file:///home/vutv/workspace/forgekit/.forgekit/templates/feature.bundle.yaml)).
- Thư mục được tự động sinh dựa trên số của Draft ID.
- Quá trình chạy tool `docskit split` sẽ sinh ra các file trung gian trong `ir/` và `pnpm docs:render` sinh ra `ir/generated/spec.md`.

## Description / Ý nghĩa
- Chuyên dùng để khởi tạo hoặc viết đặc tả chi tiết cho một chức năng/màn hình cụ thể (Function Detail).
- Brainstorm 2 mặt dữ liệu cốt lõi: 
  - Business (Dành cho Stakeholder, mô tả chuẩn Arc42, kịch bản nghiệp vụ bằng ngôn ngữ tự nhiên).
  - Kỹ thuật (Dev/QA: Các rule validate, State machine, Edge cases, UI Permissions).
- Bắt buộc phải ánh xạ (map) toàn bộ rules/validations vào đúng item UI trong `design.sections[]` thông qua các cấu hình `validation`, `messages`, `states` (disabledWhen, visibleWhen), `action`.
- Tái sử dụng (Reuse) API thông qua `#reuse-api` thay vì tự ý tạo mới.
- Khai báo rõ 3 luồng kết quả cho mọi UI action: `onSuccess`, `onCommonError`, `onSpecificError`.
- **Tuyệt đối không** sinh nội dung ra file `.md` bằng tay, mà phải luôn ghi vào YAML và để engine `docskit` lo việc chuyển đổi thành Markdown.

## Các Skill liên quan
- **Trước đó:** Không có bắt buộc, thường được gọi trực tiếp đầu tiên khi có yêu cầu (hoặc sau khi chốt `business-process`).
- **Sau đó:**
  - Kéo theo `/testcase` để đội test chuẩn bị kịch bản E2E.
  - Sẽ bị review và xác nhận lại bởi `/grill-bqa` (về Business), `/grill-dev` (về Gen Code), `/grill-docs` (Xung đột).
  - Update sau này sẽ dùng `/update-spec`.

## Chú ý quan trọng
- **Luật AskQuestion Tech Debt:** Nếu gặp thông tin phân vân, phải hiển thị Form hỏi người dùng (phải bao gồm tuỳ chọn `"Log as Tech Debt"`). Nếu người dùng chọn ghi nợ, phải đẩy thông tin vào file `qa/open/QA-<page-id>-NNNN.yaml` thay vì cố tình tự suy diễn (Hallucinate).
- Không được đưa cấu hình CSS cụ thể (màu sắc, border, padding) vào spec trừ khi là case cực kỳ đặc biệt.
- Yêu cầu dùng ngoặc kép hoặc block YAML (`|`) cho tất cả các chuỗi chứa dấu hai chấm `:` hoặc ngoặc vuông `[]`.
- Việc tìm kiếm và sử dụng template có sẵn (Common Pattern như Delete Flow, CRUD) là điều bắt buộc.
