# Skill: `/qa-resolve`

## Tên
`qa-resolve`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/qa-resolve <qa-id>`
- Kèm theo câu trả lời/giải pháp từ User (nếu có): 
  - Ví dụ: `/qa-resolve QA-cmp-adm-002-02-01-02-0001 \n Giữ copy legacy cho title.`

## Input (Dữ liệu đầu vào)
- ID của file QA Tech Debt (ví dụ: `QA-cmp-adm-002-02-01-02-0001.yaml`) nằm trong `qa/open/`.
- Lời giải (Solution) do User cung cấp qua Prompt.
- File đích (`target.path`) và con trỏ JSON/YAML (`target.at`) được khai báo bên trong file QA.

## Output (Kết quả mong đợi)
- File đích (`*.bundle.yaml` hoặc `01-backend-spec.yaml`) được điền giải pháp vào đúng vị trí `target.at` (thay thế `#missing_info`).
- Xóa bỏ ID này khỏi mảng `pendingTechDebt` hoặc các tag `#tech-debt:QA-...`.
- XÓA BỎ hoàn toàn file `qa/open/<id>.yaml` khỏi hệ thống (Đóng QA thành công).
- `forgekit split` chạy lại để làm mới dữ liệu IR.

## Description / Ý nghĩa
- Chuyên dùng để đóng các khoản nợ kỹ thuật (Tech Debt) hoặc các khoảng trống (Gaps) nghiệp vụ đã được ghi nhận trước đó từ các form AskQuestion.
- Quá trình này **đơn nhiệm** (chỉ giải quyết 1 QA ID mỗi lần gọi) để đảm bảo độ chính xác tuyệt đối.
- Agent phải đọc `target.path` từ file QA để biết chính xác cần vá file nào, không được tự ý phỏng đoán (guesswork) vị trí sửa.
- Nếu đích sửa đổi là file `01-backend-spec.yaml`, Agent cần gọi tiếp `forgekit openapi_gen --spec <01>` để cập nhật lại swagger.

## Các Skill liên quan
- **Trước đó:** Nhận đầu vào do các skill `grill-*` (bqa, dev, docs) tạo ra qua tuỳ chọn "Log as Tech Debt".
- **Sau đó:** Nếu sau khi điền xong mà vẫn thiếu cấu hình gen (VD: `codegen.profile`), gọi tiếp `/grill-dev` hoặc `/grill-api-spec`.

## Chú ý quan trọng
- **Luật AskQuestion Tech Debt:** Nếu User gọi lệnh `/qa-resolve <qa-id>` nhưng **KHÔNG** ghi kèm theo giải pháp (Solution) => Agent bắt buộc phải bật Form AskQuestion hỏi User. Form phải có Option `"Log as Tech Debt"` (mặc dù đang ở trong tiến trình resolve) và các option gợi ý (Recommended).
- Tuyệt đối không tạo ra thuộc tính `openQuestions` hoặc `bundle.spec.api` trên các file YAML. Mọi thắc mắc đều phải được tracking dưới dạng file vật lý trong `qa/open/`.
