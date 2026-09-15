# Skill: `/business-process`

## Tên
`business-process`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/business-process`
- Thường dùng kèm với các cụm từ điều hướng như `/common` hoặc `/architecture` để xác định ngữ cảnh vẽ luồng.
- Dùng cờ `/legacy` để đào xới lại quy trình từ mã nguồn cũ.

## Input (Dữ liệu đầu vào)
- Thông tin về chuỗi hành động: Ai (Actor) đang tương tác trên bề mặt nào (Surface), chuỗi hành động diễn ra sao (Action) và kết quả cuối cùng là gì (Outcome).
- Bắt buộc phải tính đến các luồng lỗi, luồng ngoại lệ.

## Output (Kết quả mong đợi)
- Sinh ra các file Markdown có mã tiền tố `FLOW-*` (VD: `FLOW-PORTAL-AUTH-CHANGE.md`).
- Các sơ đồ Mermaid (flowchart hoặc sequenceDiagram) mô tả trực quan quy trình.

## Description / Ý nghĩa
- Kỹ năng thiết kế các luồng quy trình nghiệp vụ (Business Process). Chú trọng vào chuỗi hành động xuyên suốt thay vì bị gò bó trong một API hay màn hình cụ thể.
- **Quy tắc Phân tách 2 góc nhìn (2 Distinct Perspectives) BẮT BUỘC:**
  1. **Nhìn từ góc độ Giao diện (Kèm `/common` hoặc `surfaces`):** Chỉ vẽ sơ đồ tương tác ở mức Frontend (`Actor <-> Surface <-> Tên 3rd Party`). Lưu tại thư mục `surfaces/**/common/processes/FLOW-*.md`. Tuyệt đối CẤM vẽ các dịch vụ backend ngầm hay DB vào đây.
  2. **Nhìn từ góc độ Kỹ thuật (Kèm `/architecture`):** Vẽ sơ đồ tuần tự (Sequence Diagram) thể hiện TOÀN BỘ hệ thống ngầm, từ Backend Services, DB, Cronjobs, cho tới tích hợp 3rd party chuyên sâu. Lưu tại `architecture/03-business-process/`.
- **Bắt buộc vẽ luồng Lỗi (MANDATORY ERROR FLOWS):** Trong mọi sơ đồ Mermaid, Agent bắt buộc phải vẽ các nhánh Exception. Ví dụ: Chuyển hướng khi lỗi 401, chặn khi lỗi 403 IDOR, hay trả về Form khi Validation 422 thất bại.
- **Tính năng Truy vết Khảo cổ (Legacy Trace):** Khi dùng kèm `/legacy`, lệnh này đóng vai trò thay thế cho `business-process-trace` cũ:
  - Agent đọc mã nguồn cũ (cấu hình qua `dna/legacy.json`) để truy vết các bước từ `page -> api -> call -> persist -> job -> event -> listener -> command -> mail`.
  - Tuyệt đối **CẤM** bịa ra (invent) các bước bị thiếu. Nếu luồng bị đứt đoạn, phải ghi nhận là "unverified hops" hoặc "gaps".

## Các Skill liên quan
- Được kích hoạt/điều phối bởi `/architecture`.
- Có sự tương tác qua lại mật thiết với `/surfaces` và `/module`.
