# Skill: `/db-erd`

## Tên
`db-erd`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/db-erd`
- Có thể kết hợp cờ khảo cổ mã nguồn cũ: `/legacy /db-erd`

## Input (Dữ liệu đầu vào)
- Đọc các yêu cầu về nghiệp vụ để suy xuất ra các thực thể (Business Entities).
- Nếu có `/legacy`: Khảo cổ file `legacy-repos.local.json` để mò lại database schema cũ (ví dụ: các file export SQL hoặc ORM models) rồi map sang mô hình nghiệp vụ mới.

## Output (Kết quả mong đợi)
- Sinh ra file tài liệu Markdown chứa sơ đồ thực thể liên kết (Entity-Relationship Diagram) viết bằng cú pháp Mermaid `erDiagram`.
- Vị trí lưu file: Nằm ở cấp bậc dùng chung thấp nhất có thể (Lowest Common Ancestor - LCA) dạng `<LCA>/common/db-erd.md`.

## Description / Ý nghĩa
- Kỹ năng thiết kế **Cơ sở dữ liệu và Thực thể (Database ERD)**.
- Tập trung vào việc mô hình hóa các thực thể chia sẻ (Shared Entities), quyền sở hữu dữ liệu (Data Ownership) và tính bản số (Cardinality, vd: 1-n, n-n).
- Tránh việc dump nguyên xi cấu trúc Database vật lý (Raw schema dump) hoặc ORM export vào file này, trừ khi ranh giới Repo hoàn toàn trùng khớp với ranh giới nghiệp vụ (rất hiếm). Thiết kế ERD phải dựa trên lăng kính nghiệp vụ (Business Lens).
- **Lưu ý về mức độ chi tiết:** Tại tầng Kiến trúc này, ERD mang tính chất Global (toàn cục), chỉ tập trung làm rõ mối quan hệ và các trường dữ liệu chính (Main fields). Các trường dữ liệu chi tiết li ti, hoặc các trường xử lý kỹ thuật ngầm (Derived data) sẽ được định nghĩa sâu hơn ở tầng Feature (Spec) hoặc tầng API Contract.

## Các Skill liên quan
- Nằm trong nhóm Kiến trúc (Architecture), thường được gọi sau khi đã hạch toán xong các `/surfaces` và `/module`.
