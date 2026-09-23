# Skill: `/business-process`

## Tên
`business-process`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/business-process`
- Thường dùng kèm với các cụm từ điều hướng như `/common` hoặc `/surfaces` để xác định ngữ cảnh vẽ luồng nghiệp vụ.
- Dùng cờ `/legacy` để đào xới lại quy trình từ mã nguồn cũ.

## Input (Dữ liệu đầu vào)
- Thông tin về chuỗi hành động: Ai (Actor) đang tương tác trên các màn hình cụ thể nào (`[W-...]`), chuỗi hành động diễn ra sao và kết quả cuối cùng là gì.
- Dữ liệu chuyển giao giữa các màn hình (Key fields, values).
- Xác nhận có hay không có xử lý ngầm (Background Logic Gate) sau khi lưu.

## Output (Kết quả mong đợi)
- Sinh ra file Markdown có mã tiền tố `FLOW-*` (VD: `FLOW-AUTO-MESSAGE-BOOKING.md`) tuân thủ cấu trúc **Đặc Tả Nghiệp Vụ Chuyên Sâu 6 Phần**:
  1. `## 1. Bối cảnh & Ma trận Phân quyền Nghiệp vụ`: Trigger, vai trò người dùng và quyền hạn trên từng màn hình.
  2. `## 2. Chuỗi User Stories Đa Tầng`: Phân rã thành Setup Story, Primary Action Story, Tracking Story, và **System Story** (khi có xử lý ngầm).
  3. `## 3. Quy tắc Nghiệp vụ (Business Rules) & Vòng đời Trạng thái`: Danh mục BR-* và bảng State Transition.
  4. `## 4. Đặc tả Chi tiết Hành trình Từng Chặng`: Thao tác chi tiết, Data Handoff liên màn hình, Kịch bản xử lý ngầm (so khớp, retry, idempotency) và Phản hồi trạng thái.
  5. `## 5. Ma trận Đối chiếu (Traceability Matrix)`: Đối chiếu 1-1 giữa User Story Step <-> Màn hình [W-*] <-> Sơ đồ Sequence <-> Thành phần kỹ thuật.
  6. `## 6. Sơ đồ Tuần tự Nghiệp vụ Liên Màn hình (Screen-to-Screen Sequence Diagram)`: Sơ đồ Mermaid mô tả rõ các màn hình cụ thể, thao tác người dùng, lưu trữ khái quát (DB Table, S3 Bucket) và phân đoạn `rect` xử lý ngầm (nếu có).

## Description / Ý nghĩa
- Kỹ năng thiết kế các luồng quy trình nghiệp vụ (Business Process). Chú trọng vào chuỗi hành động xuyên suốt giữa các màn hình thay vì bị gò bó trong một API đơn lẻ.
- **Quy tắc Phân tách 2 góc nhìn (2 Distinct Perspectives) BẮT BUỘC:**
  1. **Nhìn từ góc độ Giao diện (Kèm `/common` hoặc `surfaces`):** Mô tả hành trình người dùng qua các màn hình cụ thể `[W-...]`. Chỉ nhắc tới lưu trữ (DB/S3) và Worker ngầm ở mức khái quát (tên table, tên bucket). Tuyệt đối **CẤM** nhét HTTP verbs (`POST /api/...`), SQL queries, DB internal column schema vào đây.
  2. **Nhìn từ góc độ Kỹ thuật (Kèm `/architecture`):** Vẽ sơ đồ tuần tự (Sequence Diagram) thể hiện TOÀN BỘ hệ thống ngầm, từ Backend Services, DB, Cronjobs, cho tới tích hợp 3rd party chuyên sâu. Lưu tại `architecture/03-business-process/`.
- **Cơ chế Background Logic (Tùy chọn):**
  - Không phải flow nào cũng có background job. Khi có, bắt buộc phải có **System Story** và kịch bản lỗi/retry trong User Stories và phân đoạn `rect` trong sơ đồ Sequence Diagram.
  - Quản lý / cập nhật riêng phần logic ngầm: Sử dụng skill `/background-logic`.

## Các Skill liên quan
- Được kích hoạt/khảo sát bởi `/grill`.
- Kết hợp với `/background-logic` để cập nhật các tác vụ ngầm.
- Có sự tương tác qua lại mật thiết với `/surfaces` và `/module`.
