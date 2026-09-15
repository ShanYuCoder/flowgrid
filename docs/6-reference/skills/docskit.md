# Skill: `/docskit` & Các lệnh CLI Automation

## Tên
`docskit` (Kèm theo bộ lệnh CLI `forge:split`, `forge:render`, `docs:split`...)

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/docskit` (để tra cứu, phân giải thư mục, đọc cấu trúc C4 Markdown).
- Sử dụng qua CLI (Terminal) trong quá trình tự động hoá:
  - `pnpm docs:split -- <bundle.yaml>` (hoặc `forgekit split` / `docskit split`)
  - **`pnpm docs:split:all` (hoặc `forgekit split_all` / `docskit split-all`)**: Lệnh quét và phân tách **TOÀN BỘ** các file `*.bundle.yaml` có trong repo. (Thích hợp cho thành viên "lười" gõ đường dẫn dài ngoằng của lệnh split đơn lẻ).
  - `pnpm docs:render` (hoặc `forgekit render` / `docskit render`)
  - `pnpm forge:publish` (hoặc `forgekit publish` / `docskit publish`)

## Input (Dữ liệu đầu vào)
- Lệnh `split`: Nhận đầu vào là một file `*.bundle.yaml` được chỉ định.
- Lệnh `split-all`: Nhận đầu vào là **tất cả** các file `*.bundle.yaml` đang nằm rải rác dưới thư mục `surfaces/`.
- Lệnh `render`: Nhận đầu vào là các file trung gian trong thư mục `ir/` (như `ir/design.yaml`, `ir/spec.yaml`).
- Lệnh `publish`: Nhận đầu vào là hệ thống Markdown hiện có và OpenAPI.

## Output (Kết quả mong đợi)
- **`split` / `split-all`:** Phân tách và ghi đè ra các file con trong thư mục `ir/` (Intermediate Representation). Dùng `split-all` sẽ xử lý hàng loạt toàn hệ thống.
- **`render`:** Sinh ra file Markdown cuối cùng để người dùng đọc (`ir/generated/spec.md`) và tệp `qa/index.md`.
- **`publish`:** Sinh ra file **`CATALOG.md`** tổng hợp đóng vai trò làm **Index danh mục trên GitHub**. Việc cắm file này vào trang chủ (`README.md`) giúp thành viên trong team click vào là thấy ngay bản đồ tài liệu, tránh việc phải lặn lội bấm mở từng folder con để tìm file spec cực kỳ mất thời gian.

## Description / Ý nghĩa
- `docskit` không chỉ là một Agent Skill mà còn là Engine cốt lõi (CLI) chịu trách nhiệm vận hành hệ thống tài liệu.
- Phân tích và biên dịch (Compile) dữ liệu YAML thô (Bundle) thành các file giao diện đọc được (Markdown, EJS, HTML).
- Quản lý **Index Routing**: Đảm bảo các hệ thống (Docs Hub, CodeGraph, Testkit) không dẫm chân lên nhau. Ví dụ: ID kiến trúc thì trỏ về Docskit, Symbol code thì trỏ về CodeGraph.
- Đóng vai trò Fallback: Khi các tool xịn (như ArtifactGraph) bị lỗi hoặc không có, Docskit sẽ đóng vai trò dự phòng (fallback) để Agent vẫn có thể đọc Markdown bằng thuật toán tìm kiếm truyền thống.

## Các Skill liên quan
- **Trước đó:** Gần như mọi skill chỉnh sửa YAML (như `/spec`, `/grill-bqa`, `/grill-dev`, `/update-spec`) đều phải kết thúc bằng việc gọi lệnh `docskit split` để ghi nhận thay đổi.
- **Sau đó:** `docskit render` sẽ đưa dữ liệu lên VitePress (`pnpm docs:dev`).

## Chú ý quan trọng
- Tuyệt đối không tự ý dùng lệnh linux `cat` hay `echo` để sửa file Markdown được generate (`ir/generated/*.md`).
- Các Agent phải luôn tuân thủ việc đọc (Read) file `ir/design.yaml` sau khi `split` hoàn thành, thay vì cố gắng đọc toàn bộ cấu trúc khổng lồ của `bundle.yaml`.
