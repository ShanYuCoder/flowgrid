# Skill: `/test`

## Tên
`test`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/test`
- Chuyên dùng trong giai đoạn E2E Lane (Playwright).

## Input (Dữ liệu đầu vào)
- Đọc file kịch bản `testcases/*.yaml`.
- Đọc đặc tả giao diện (`ui.testIds`) từ file spec gốc.
- Đọc các Registry liên quan đến E2E (`portal-e2e-test.registry.json`) để xử lý các `#e2e:*` bundle tags.
- Đọc cấu trúc Page Object (PO) của nguyên mẫu Prototype hiện hành.

## Output (Kết quả mong đợi)
- Khắc phục các khoảng trống (gap) giữa kịch bản YAML và file Playwright (`*.spec.ts`) đã được gen.
- Cập nhật, sửa lỗi hoặc thêm các `data-testid` còn thiếu trên giao diện UI để spec E2E có thể chạy (Green).
- Đảm bảo một kịch bản test cụ thể (scoped) vượt qua được trình chạy Playwright.

## Description / Ý nghĩa
- Kỹ năng triển khai mã kiểm thử tự động (Test Automation). 
- **Chỉ tập trung vào E2E:** Kỹ năng này không phải là Unit test (Unit test thuộc về `portal:unit-gen` hoặc `/unit`). Nó chuyên biệt cho luồng Playwright.
- Nó sẽ bù đắp vào những khoảng trống (Session/fixture gap) sau khi lệnh `testcase:gen` chạy xong.

## Các Skill liên quan
- **Trước đó:** `testcase:gen` (Sinh mã khung).
- **Sau đó:** Bị kiểm duyệt khắt khe bởi `/grill-test`.
