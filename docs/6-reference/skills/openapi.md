# Skill: `/openapi`

## Tên
`openapi` (Tích hợp CLI `flowgrid openapi_render`, `openapi_build_ui`)

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/openapi`
- Dùng qua CLI để sinh từng file riêng lẻ: 
  `flowgrid openapi_gen --spec surfaces/.../api/<seq>/01-backend-spec.yaml`
- Dùng qua CLI để quét và sinh toàn bộ: 
  `flowgrid openapi_gen`
- Render và gộp API: `flowgrid openapi_render`
- Build UI tĩnh: `flowgrid openapi_build_ui`

## Input (Dữ liệu đầu vào)
- Đọc file hợp đồng Backend: `01-backend-spec.yaml`.

## Output (Kết quả mong đợi)
- Sinh ra file `02-openapi.yaml` (nằm cùng cấp thư mục với file 01).
- Sau khi chạy `flowgrid openapi_render`, toàn bộ các file `02-openapi.yaml` từ các module sẽ được tổng hợp thành một file OpenAPI thống nhất tại `docs/openapi/api.yaml`.
- (Tùy chọn) Chạy `flowgrid openapi_build_ui` sẽ sinh ra thư mục chứa giao diện Swagger/Redocly UI tĩnh.

## Description / Ý nghĩa
- Chuyên dùng để chuyển đổi (Transform) chuẩn nội bộ `01-backend-spec.yaml` sang chuẩn quốc tế **OpenAPI 3.0.3** (`02-openapi.yaml`).
- OpenAPI trong FlowGrid hoàn toàn là một **Tài liệu (Docs artifact)**, không phải là công cụ sinh code (bộ code). Việc sinh mã nguồn Backend từ API Contract sẽ do các lệnh riêng biệt (như `flowgrid api-gen`) của BE xử lý.
- Tuyệt đối không dùng các thư viện sinh OpenAPI từ source code (như `nestjs --openapi`) để ghi đè vào Docs Hub. Quy trình ở đây là: Docs (Hợp đồng) sinh ra OpenAPI, chứ không phải Code sinh ra OpenAPI.

## Các Skill liên quan
- **Trước đó:** Nhận đầu vào từ kết quả của `/api-spec` (hoặc `/api-update`, `/api-integration`).
- **Sau đó:** Dữ liệu Swagger sẽ được tích hợp thẳng vào trang Docs VitePress qua lệnh render.

## Chú ý quan trọng
- Nếu file OpenAPI sinh ra bị thiếu thông tin (ví dụ: thiếu schema `$refs`, thiếu examples), **tuyệt đối không** được sửa trực tiếp file `02-openapi.yaml`. Tác nhân (Agent) phải sửa tận gốc ở file `01-backend-spec.yaml` rồi chạy lệnh gen lại.
- Dùng cờ `--dry-run` để test thử hoặc `--force` để ép ghi đè nếu cần thiết.
