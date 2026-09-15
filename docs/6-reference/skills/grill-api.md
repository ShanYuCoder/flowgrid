# Skill: `/grill-api`

## Tên
`grill-api`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/grill-api`

## Input (Dữ liệu đầu vào)
- Tham số truyền vào là đường dẫn của một file `01-backend-spec.yaml` hiện có cần được thẩm định.

## Output (Kết quả mong đợi)
- Tương tự `/api`, đây cũng là một **Bộ điều hướng (Discovery Router)**. Nó không trực tiếp thực hiện việc chất vấn, mà sẽ phân luồng sang các lệnh con.

## Description / Ý nghĩa
- Lệnh gốc dùng để kích hoạt luồng **Chất vấn / Kiểm toán Backend (Backend Grill Router)**.
- Khi Member chạy lệnh này, Agent sẽ đọc file `01-backend-spec.yaml` để xác định tính chất của API (dựa vào `feature.source.base`):
  - Nếu API này có giao diện Frontend đi kèm (Portal) → Agent chuyển hướng sang gọi `/grill-api-spec`.
  - Nếu API này không có giao diện (Webhook, đối tác thứ 3, `feature.source.base: none`) → Agent chuyển hướng sang gọi `/grill-integration-spec`.
- Nếu phát hiện file Spec chưa tồn tại, Agent sẽ báo lỗi hoặc tự động gọi `/api-spec` (hoặc `/api-integration`) để sinh file trước khi grill.

## Các Skill liên quan
- Nằm trong cụm Phase 3 (Backend API).
- Là lớp vỏ bọc bên ngoài cho `/grill-api-spec` và `/grill-integration-spec`.
