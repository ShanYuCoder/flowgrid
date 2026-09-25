# Kỹ năng: `/legacy`

## Tên
`legacy`

## Cách dùng (Command/Trigger)
- Gọi qua slash command như một **Skill Modifier** (Bộ bổ trợ kỹ năng).
- Phải dùng kết hợp với một skill chuyên môn khác. Ví dụ: `/legacy /spec`, `/legacy /overview`, hoặc `/legacy /business-process`.

## Input (Dữ liệu đầu vào)
- Dữ liệu đầu vào của base skill (skill đi kèm).
- Mã nguồn và tài liệu của hệ thống cũ, được trỏ từ `legacy-repos.local.json`.

## Output (Kết quả mong đợi)
- Thay đổi hành vi của base skill sang **Chế độ Khảo cổ (Archaeology Mode)**.
- Thay vì sáng tạo logic mới, Agent chỉ trích xuất, ánh xạ và ghi nhận thực tế từ hệ thống cũ.
- Áp dụng metadata cụ thể cho legacy (ví dụ: `specOrigin: legacy`) vào các file thiết kế (bundle YAML).
- Tham chiếu cấu trúc dữ liệu cũ thông qua `legacy.dynamics.yaml` thay vì sử dụng tiêu chuẩn mới.

## Description / Ý nghĩa
- Bản thân `/legacy` không phải là một luồng công việc độc lập. Nó đóng vai trò "công tắc" chuyển bối cảnh (Context Shift) của Agent.
- Khi bật công tắc này, hệ thống FlowGrid hiểu rằng nhiệm vụ hiện tại không phải là xây tính năng mới, mà là "khai quật" và hệ thống hóa lại các tính năng, API, hoặc luồng dữ liệu từ một nền tảng cũ kỹ để chuẩn bị cho quá trình chuyển đổi (migration) hoặc thay thế.
- Giúp bảo vệ tính toàn vẹn của Spec, ngăn chặn Agent "cầm đèn chạy trước ô tô" tự chế logic khi khảo sát hệ thống cũ.
