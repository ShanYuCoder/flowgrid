# Skill: `/adopt`

## Tên
`adopt` (hoặc `/legacy-adopt`)

## Cách dùng (Command/Trigger)
- Gọi quét toàn hệ thống legacy: `/adopt` (hoặc `/legacy-adopt`)
- Gọi quét phạm vi ứng dụng/module legacy cụ thể: `/adopt "Customer App"` hoặc `/adopt admin-fe`

## Input (Dữ liệu đầu vào)
- Đọc `legacy-repos.local.json` (hoặc `platform-repos.local.json`) để xác định các repos/dự án legacy.
- Quét qua cấu trúc file code cũ (Routers, Controllers, View/Page Components, Service Interfaces).

## Output (Kết quả mong đợi)
- Khởi tạo duy nhất file chỉ mục `adoption-inventory.md` nằm ngay ở thư mục gốc (workspace root).
- Liệt kê dạng bullet list (không checkbox, không ghi chi tiết spec) định danh danh mục:
  - Surfaces (Bề mặt hệ thống)
  - Modules (`CMP-*`)
  - Screens (`W-*`) & APIs (`API-*`) kèm đường dẫn file code cũ tương ứng (`ID -> Legacy File Path`)
  - Cross-Flow Candidates (`FLOW-*`)
- Cuối file tổng hợp danh sách gợi ý Handoff Prompts cho bước tiếp theo.

## Description / Ý nghĩa
- Dùng để lập **Bản đồ chỉ mục & Mã hóa ID (Index & Mapping Directory)** cho dự án Legacy.
- Giải quyết bài toán không ai có thời gian khảo cổ 100% dự án legacy. Đóng vai trò làm bản tra cứu giúp Member tìm nhanh ID của chức năng cần làm và file code cũ tương ứng.
- Khi Member cần nâng cấp/sửa lỗi Chức năng A, Member tra `adoption-inventory.md` tại root để lấy ID (ví dụ `W-AD-AUTH-001`), sau đó gọi lệnh khảo cổ đi kèm `/legacy` (`/docs-hub /legacy /spec W-AD-AUTH-001`).

## Các Skill liên quan
- Kích hoạt sau khi cài đặt hoặc bắt đầu tiếp cận dự án legacy: `/adopt`.
- Khi khảo cổ chi tiết từng chức năng: Gọi kèm modifier `/legacy` với các skill `/surfaces`, `/module`, `/spec`, `/business-process`.
