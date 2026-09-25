# Skill: `/grill-common-spec`

## Tên
`grill-common-spec`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill-common-spec`
- Dùng ĐỘC QUYỀN sau khi lệnh `/common-spec` chạy xong.

## Input (Dữ liệu đầu vào)
- Đọc file `.bundle.yaml` lưu tại thư mục LCA (Ví dụ: `<LCA>/common/yaml/<slug>/<slug>.bundle.yaml`).

## Output (Kết quả mong đợi)
- Vá lại file `.bundle.yaml` (nếu phát hiện ra lỗi logic/thiết kế).
- Nếu pass toàn bộ các bước kiểm tra, Agent sẽ hướng dẫn Member gõ lệnh `flowgrid split` để sinh ra `ir/design.yaml`, và gọi hệ thống sinh code Frontend `/gen-common`.
- **CẤM ĐOÁN:** KHÔNG ĐƯỢC sinh ra file tài liệu mới. KHÔNG bàn giao file common bundle này cho hệ thống Backend (`/api`).

## Description / Ý nghĩa
- Đóng vai trò làm "Kiểm toán viên" (Auditor) dành riêng cho các thành phần kỹ thuật dùng chung (Technical Common Bundles).
- Đảm bảo rằng file YAML này đã đủ điều kiện để chuyển giao cho bộ code sinh code tự động.
- Trọng tâm kiểm định (Audit Rules):
  - **Schema Validation:** File phải tuân thủ đúng định dạng `portal-feature-bundle/v1` (hoặc chuẩn của Surface đích).
  - **Platform Readiness:** Thẻ `design.shell.tag` phải ánh xạ ĐÚNG nền tảng. Ví dụ Web là `#shell: DataListPage`, App Kiosk là `#shell: KioskCheckIn`.
  - **Completeness:** Các phần về `spec.principles` và `spec.acceptance` phải đủ chi tiết để sinh Testcase và Code thực tế.

## Các Skill liên quan
- **Trước đó:** `/common-spec`
- **Sau đó:** `flowgrid split` và bộ code `/gen-common`.
