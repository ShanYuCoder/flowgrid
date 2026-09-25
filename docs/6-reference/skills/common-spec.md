# Skill: `/common-spec`

## Tên
`common-spec`

## Cách dùng (Command/Trigger)
- Gọi qua slash command: `/common-spec`
- Tương tự như `/common`, Agent sẽ hỏi người dùng khai báo danh sách Consumer để tính toán vị trí cấp độ dùng chung (Lowest Common Ancestor - LCA).

## Input (Dữ liệu đầu vào)
- Phạm vi dùng chung (Scope) do Member khai báo.
- Các yêu cầu về mặt kỹ thuật, logic xử lý của các Component dùng chung (ví dụ: Confirm Dialog, Shared Layout, Middleware, Step Flow).

## Output (Kết quả mong đợi)
- Sinh ra file cấu hình kỹ thuật dạng YAML Bundle: `common/yaml/<slug>/<slug>.bundle.yaml`. (Được sinh tại thư mục LCA).
- Yêu cầu người dùng chạy lệnh `flowgrid split <path>` để chẻ file Bundle này ra thành `ir/design.yaml`, rồi dùng `flowgrid render` để sinh file đọc được.

## Description / Ý nghĩa
- Khác biệt hoàn toàn với `/common` (chỉ viết quy tắc bằng Markdown cho con người đọc), kỹ năng `/common-spec` sinh ra các **cấu trúc kỹ thuật YAML** để máy (hệ thống bộ code) đọc và sinh code.
- Tính Đa nền tảng (Platform-Agnostic): Bundle sinh ra không bị gò bó vào Web, nó có thể tuỳ biến qua thẻ `design.shell.tag` thành Kiosk, Mobile App, hay Gateway Adapter tùy ý.
- Nếu làm màn hình Web, Agent có thể đề xuất kế thừa từ 16 mẫu có sẵn trong `templates/project-skeleton/surfaces/common/yaml/`. Ngược lại, nếu làm hệ thống khác thì phải sinh file mới tinh.

## Các Skill liên quan
- Tuyệt đối không dùng `/common-spec` cho màn hình nghiệp vụ đơn lẻ, thay vào đó hãy dùng `/spec`.
- Sinh xong bundle, bắt buộc bị kiểm định bởi `/grill-common-spec`.

## Chú ý quan trọng
- **Tuyệt đối cấm:** KHÔNG ĐƯỢC sinh ra file Markdown trực tiếp. Việc sinh file `.md` là nhiệm vụ của engine `/docs-hub` thông qua lệnh `split` và `render`. Kỹ năng này chỉ sinh `.bundle.yaml`.
