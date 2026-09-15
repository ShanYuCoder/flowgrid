# Skill: `/overview`

## Tên
`overview`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/overview`
- Có thể dùng kèm với `common`: `/overview common`
- Có thể dùng kèm với cờ khảo cổ mã cũ: `/legacy /overview`

## Input (Dữ liệu đầu vào)
- Khai thác dữ liệu về mục đích kinh doanh, quy trình chung, và chân dung người dùng (Personas).
- Nếu có cờ `/legacy`: Đọc file `legacy-repos.local.json` để mò lại các logic từ dự án mã nguồn cũ.

## Output (Kết quả mong đợi)
- Các file Markdown lưu tại cấu trúc thư mục: `overview/operational-areas/[Tên khu vực nghiệp vụ]/`.
- Nếu có modifier `/legacy`: Tự động thêm tiền tố `legacy-` vào đầu tên file (ví dụ: `overview/legacy-overview.md`).

## Description / Ý nghĩa
- Nằm ở tầng cao nhất của kiến trúc, xử lý thư mục gốc (Root Folder) `overview/`.
- Tập trung vào các mảng nghiệp vụ vận hành lớn (Operational Areas) như "Admin operations", "Workforce operations" thay vì sa đà vào tính năng nhỏ.
- **Ranh giới Spec Nghiệp vụ (Business Spec Boundary):** Tài liệu Overview bắt buộc phải là một tài liệu kinh doanh thuần tuý, viết bằng ngôn ngữ của người dùng (User Language).
- **CẤM ĐOÁN TỐI KỴ:** Tuyệt đối không nhét các chi tiết kỹ thuật hệ thống (như Database Schemas, cấu hình Cloud, cách định tuyến Routing) vào file Overview. Nếu cần nhắc tới một hệ thống thứ 3, hãy dùng tên thương mại (VD: "Cổng thanh toán Payment Gateway") thay vì mô tả giao thức API của nó.

## Các Skill liên quan
- Được kích hoạt/điều phối bởi `/architecture`.
- Nếu cần đi sâu vào kênh giao tiếp (Web/App), dùng `/surfaces`. Mức nhỏ hơn nữa là `/module`.
