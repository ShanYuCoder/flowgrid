# Skill: `/grill-test`

## Tên
`grill-test`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill-test`
- Chạy sau khi luồng `/test` (E2E) đã được triển khai và pass (green).

## Input (Dữ liệu đầu vào)
- Đọc đặc tả gốc (Spec YAML) đặc biệt chú trọng phần `testIds.required` và kịch bản `testcases/*.yaml`.
- Đọc Page Object (PO) sinh ra.
- Đọc các tệp Playwright `*.spec.ts` tương ứng.

## Output (Kết quả mong đợi)
- Ma trận vết (Traceability Matrix) đối chiếu 4 chiều: Spec ↔ Testcase YAML ↔ Page Object ↔ Code Spec Playwright.
- Báo cáo lỗ hổng (Gap analysis) hoặc các đoạn `#e2e:*` bị đánh rớt.
- Nếu Pass: Đề xuất chuyển sang cập nhật vòng đời (lifecycle: `test`).

## Description / Ý nghĩa
- Đóng vai trò là "Kiểm toán viên mảng Test".
- Kỹ năng này không tập trung vào việc fix lỗi code (như `/test` làm), mà tập trung vào **Audit (Kiểm toán)**: Đảm bảo rằng Developer không ăn bớt kịch bản (Testcase) so với đặc tả (Spec) ban đầu.
- Rất nghiêm ngặt trong việc yêu cầu các Semantic Tags (`#e2e:semantic-list`, `#e2e:a11y-wcag`...) phải được đáp ứng đầy đủ nếu có yêu cầu.
- Luồng rẽ nhánh: 
  - Nếu thiếu file hoặc thiếu testId, sẽ đẩy ngược lại yêu cầu cho kỹ năng `/test`.
  - Nếu bản thân kịch bản test bị sai lệch so với logic kinh doanh, sẽ đẩy thông tin cho lệnh `/update-spec`.

## Các Skill liên quan
- **Trước đó:** Nhận kết quả bàn giao từ `/test`.
- **Sau đó:** Chốt luồng E2E Lane hoặc trả về `/test` để hoàn thiện.
