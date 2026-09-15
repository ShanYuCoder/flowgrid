# Skill: `/grill`

## Tên
`grill`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill`
- Có thể truyền tham số về Layer cần chất vấn ở phía sau (VD: `/grill module`, `/grill overview`).

## Input (Dữ liệu đầu vào)
- Đọc tài liệu ở lớp (Layer) đang cần phân tích.
- Xác định Layer mục tiêu (Ví dụ: Module, Surface, Overview, Journey, Db-ERD).

## Output (Kết quả mong đợi)
- Đây là một **Bộ điều hướng Chất vấn (Discovery Router)**.
- KHÔNG tự tiện ghi đè (Overwrite) file Spec hay Kiến trúc khi chưa chốt hạ vấn đề.
- Đưa ra chuỗi các câu hỏi sắc bén (AskQuestion Form) hiển thị trực tiếp trên Chat Thread để người dùng (Member) trả lời.
- Sau khi chốt xong, nó sẽ chuyển giao (Handoff) cho các lệnh sinh tài liệu tương ứng (VD: `/module`, `/surfaces`).

## Description / Ý nghĩa
- Đóng vai trò là "Cổng gác" (Hard Confirmation Gate). 
- Dùng trong trường hợp: Thông tin yêu cầu ban đầu quá sơ sài, thiếu hụt, hoặc bạn không chắc chắn về thiết kế ở bước tiếp theo.
- Trình tự đặt câu hỏi (Question Order) ưu tiên:
  1. Phạm vi và Mục tiêu.
  2. Người dùng (Actors) và Kênh (Channels).
  3. Ranh giới và Quyền sở hữu (Ownership).
  4. Luồng chuẩn (Happy path).
  5. Luồng ngoại lệ và lỗi (Exceptions & edge cases).
  6. Phạm vi dùng chung (Common scope).
  7. Định dạng đầu ra.
- **ĐẠO LUẬT THÉP (SSOT_AGENT_PROTOCOL):**
  - **TUYỆT ĐỐI KHÔNG** được bịa ra thông tin nghiệp vụ (invent business data) để lấp liếm sự thiếu hụt.
  - Phải để nguyên thẻ `#missing_info` hoặc đặt câu hỏi.
  - Form AskQuestion **BẮT BUỘC** phải có tuỳ chọn "Log as Tech Debt (Pending)". Nếu người dùng chọn cái này, thông tin sẽ bị ném vào `qa-inbox.md` thay vì làm đình trệ công việc.

## Các Skill liên quan
- Router trung tâm cho hàng loạt skill chất vấn con: `/grill-bqa`, `/grill-dev`, `/grill-docs`.
