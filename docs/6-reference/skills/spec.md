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
- Quá trình chạy tool `forgekit split` sẽ sinh ra các file trung gian trong `ir/` và `forgekit render` sinh ra `ir/generated/spec.md`.

## Description / Ý nghĩa
- Chuyên dùng để khởi tạo hoặc viết đặc tả chi tiết cho một chức năng/màn hình cụ thể (Function Detail).
- Brainstorm 2 mặt dữ liệu cốt lõi: 
  - **Business:** Khối `userStories` chuyên sâu (Primary Story, `screenAccess` hỗ trợ 3 loại: `directRoute` cho URL trực tiếp, `sidebarMenu` cho menu trái đa cấp + text label, `contextualAction` cho nút bấm kích hoạt từ màn hình A, Screen Handoff từ màn nào sang màn nào, 5 kịch bản chi tiết: Tải dữ liệu, Nhập liệu/Validate, Nộp thành công, Ngoại lệ/Lỗi, Tác vụ ngầm, và Acceptance Criteria).
  - **Kỹ thuật:** Phân định rõ ràng trên từng element giữa `meaning` (**Ý nghĩa nghiệp vụ**) và `purpose` (**Mục đích thao tác**).
- Mọi rule validation bắt buộc đi kèm trường `messages` tiếng Việt cụ thể.
- Mọi hành động tương tác (Actions) phải định nghĩa rõ: `validateFormBeforeSubmit`, `feedback` (loadingText, disableWhileSubmitting), `apiRefs`, `onSuccess` (toast, navigation handoff, backgroundTrigger), `onSpecificError` (map lỗi 422, 409 conflict, 403), `onCommonError`.
- **Tuyệt đối không** sinh nội dung ra file `.md` bằng tay, mà phải luôn ghi vào YAML và để engine `forgekit split` lo việc chuyển đổi sang `ir/spec.yaml` và `ir/generated/spec.md`.

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
