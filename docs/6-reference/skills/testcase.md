# Lệnh: `testcase:gen`

## Tên
`testcase:gen` (Hoạt động dưới dạng Script/CLI thay vì là Agent Skill tương tác).

## Cách dùng (Command/Trigger)
- Lệnh chạy CLI:
  ```bash
  pnpm testcase:gen:dry --testcase <path_to_testcase.yaml>
  pnpm testcase:gen --id <ID_của_Spec>
  pnpm testcase:gen --testcase ... --force
  ```

## Input (Dữ liệu đầu vào)
- File kịch bản kiểm thử (Testcase YAML) tại `testcases/*.yaml`.
- Metadata UI và các test ID yêu cầu (trường `testIds.required`) từ Feature Spec mẹ.
- Các mock setup, session handlers, và semantic tags (ví dụ `#e2e:semantic-list`).

## Output (Kết quả mong đợi)
- Sinh ra tệp khung (skeleton) cho file `.spec.ts` của Playwright.
- Tự động sinh mã cho các hành động (steps) như `goto`, `waitFor`, `fill`, `click`.
- Tự động đính kèm các thư viện Semantic/Axe (`#e2e:*`) thông qua Registry `portal-e2e-test.registry.json`.
- Thiết lập tự động các Mock responses cho Network (`assertions.network`) và các hàm chặn API.

## Description / Ý nghĩa
- Giúp rút ngắn 80% thời gian viết mã E2E Playwright bằng cách "dịch" trực tiếp các kịch bản Testcase (dưới dạng text/YAML do QA hoặc BA viết) thành bộ khung Code thực thi.
- Tự động kết hợp (Merge) với các thư viện Assertions nâng cao:
  - **Functional:** Bắt đúng UI testId có hiển thị không, dữ liệu có đúng không.
  - **Semantic (Giao diện chuẩn):** Kiểm tra xem UI có bị tràn viền (overflow), bảng có bị lệch dòng hay không.
  - **Accessibility (A11y/Axe):** Tuân thủ tiêu chuẩn dành cho người khuyết tật.
- Tách biệt rõ ràng chế độ Prototype (dùng Mock 100%) và chế độ Wire (dùng API thật).

## Các Skill liên quan
- **Trước đó:** Nhận thông tin cấu trúc DOM giả lập từ `pnpm portal:gen`.
- **Sau đó:** Mở đường cho kỹ năng `/test` vào sửa lỗi chi tiết trong file `spec.ts`.
