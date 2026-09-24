# Custom Base & Maintain Workflow (Dự Án Khác Base)

> Hướng dẫn thiết lập và vận hành FlowGrid cho các dự án **Bảo trì hệ thống cũ (Maintain)** hoặc **Phát triển mới nhưng sử dụng Base code / Thư viện UI riêng** (Vue 3 + Element Plus, React + Ant Design, Vuetify, Bootstrap, NestJS Active-Record, Laravel Livewire...).

---

## 1. Vấn Đề Cần Giải Quyết

Khi làm việc với một dự án có sẵn hoặc không dùng bộ Base mặc định của công ty (Nuxt 4 + Shadcn-ui, NestJS CQRS):
- **Template Code mặc định bị lệch:** Sinh ra syntax không khớp với UI library và kiến trúc mà dự án đang dùng.
- **Từ vựng DSL bị lệch:** Các component sẵn có của dự án (ví dụ: `<el-table>`, `<a-card>`, `UserDialog.vue`) không được đăng ký trong `design.registry.json`, dẫn đến việc AI gán nhãn tags sai lệch.
- **ArtifactGraph báo đỏ ảo:** SQLite Local Graph coi các component cũ là "mồ côi" (orphan) hoặc liên tục đòi hỏi tạo mới `#needs-component`.
- **Docs SSOT mất tính chân thực:** `spec.md` mô tả một đằng nhưng code thật trong repo lại chạy một nẻo.

---

## 2. Mô Hình "Tam Giác Đồng Bộ" (Tri-Sync)

Để giải quyết bài toán trên, FlowGrid kích hoạt cơ chế đồng bộ 3 mắt xích khép kín thông qua **Golden Sample (Màn hình hình mẫu)**:

```text
               DỰ ÁN KHÁC BASE (Custom / Maintain)
                               │
               flowgrid init (Chọn Custom Base)
                               │
             Khai báo 1 file "Golden Sample"
            (Ví dụ: src/pages/users/UserList.vue)
                               │
            flowgrid build-template-code
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
1. CODE TEMPLATES       2. DSL REGISTRY         3. ARTIFACTGRAPH
  (Sinh code khớp)       (Từ điển SSOT)          (Lập chỉ mục)
       │                       │                       │
.flowgrid/adapters/    .flowgrid/adapters/    .flowgrid/adapters/
  custom/templates/       custom/registries/      custom/lexicon/
  - list.vue.hbs          - design.registry.json  - registry-tags.en.txt
(Thay entity, fields)   (Ghi nhận ElTable,      (Nạp vào SQLite Graph,
                         ElDatePicker...)        dập tắt báo đỏ giả)
```

---

## 3. Quy Trình Vận Hành 3 Bước

### Bước 1: Khởi tạo với Custom Profile (`flowgrid init`)

Khi chạy wizard khởi tạo trong repository dự án:

```bash
flowgrid init
```

1. Tại bước **Select Base Architecture Profile**, chọn:  
   👉 `Custom / Existing Base (Dành cho dự án Maintain hoặc Tech Stack khác Base)`
2. Nhập đường dẫn đến **Golden Sample** (màn hình/file mẫu đẹp nhất và chuẩn nhất trong dự án của bạn):
   ```text
   Enter path to Golden Sample file: src/pages/users/UserList.vue
   ```
3. Cấu hình được lưu vào `.flowgrid/config.json`:
   ```json
   {
     "baseProfile": "custom",
     "goldenSample": "src/pages/users/UserList.vue",
     "frontend": { "adapter": "custom" }
   }
   ```

---

### Bước 2: Bóc tách DNA Dự Án (`flowgrid build-template-code`)

Chạy lệnh trích xuất DNA để tự động học phong cách code và danh mục linh kiện có sẵn:

```bash
# Xem trước các tệp sẽ được tạo (Dry-run)
flowgrid build-template-code --dry-run

# Thực hiện trích xuất và sinh Adapter Custom
flowgrid build-template-code
```

**Những gì hệ thống tự động xử lý ngầm:**
1. **Quét `package.json`:** Tự động phát hiện UI library (`element-plus`, `ant-design-vue`, `vuetify`, `chakra-ui`, `bootstrap-vue`...).
2. **Quét Golden Sample:**
   - Trích xuất khung Layout Shell (`<el-container>`, `<a-layout>`, `<v-app>`).
   - Trích xuất bảng dữ liệu (`<el-table>`, `<a-table>`) và phân trang.
   - Trích xuất các Form Widgets (`el-input`, `el-date-picker`, `el-select`...).
3. **Sinh Custom Registry (`design.registry.json`):**
   - Đánh dấu trạng thái `status: implemented` cho toàn bộ linh kiện đã quét thấy.
4. **Sinh Template Handlebars (`.hbs`):**
   - Tham số hóa màn hình mẫu thành template dùng chung (`{{pascalCase entity}}`, `{{#each fields}}`).
5. **Sinh Từ điển Lexicon (`registry-tags.en.txt`):**
   - Chuẩn bị từ vựng để nạp trực tiếp vào SQLite Graph của ArtifactGraph.

---

### Bước 3: Viết Đặc Tả & Sinh Mã (SSOT Không Bị Lệch)

Sau khi bộ Custom Adapter đã được thiết lập, quy trình phát triển tính năng diễn ra hoàn toàn bình thường và tận dụng tối đa sức mạnh của AI:

1. **Khởi tạo Spec (`/spec`)**:
   - Khi mô tả màn hình mới, AI sẽ sử dụng đúng các thẻ `#shell:` và `#widget:` của dự án đó (ví dụ: `#shell: ElAdminLayout`, `#widget: ElDatePicker`).
   - File kết xuất `spec.md` vẫn giữ nguyên chuẩn mực **Data Dictionary Table & 5-Tier Validator**, nhưng tên linh kiện và cấu trúc hiển thị phản ánh 100% linh kiện thực tế của dự án.
2. **Kiểm định (`/grill-dev`, `/grill-with-docs`)**:
   - ArtifactGraph SQLite đọc Lexicon tùy biến từ `.flowgrid/adapters/custom/lexicon/`, nhận diện các widget cũ là **đã có sẵn (implemented)**.
   - **Tuyệt đối không báo đỏ ảo** đòi tạo lại component từ đầu.
3. **Sinh mã (`/prototype` hoặc `/codegen`)**:
   - Engine đọc template từ `.flowgrid/adapters/custom/templates/`, sinh code chuẩn theo phong cách của dự án cũ mà không bị rác code.

---

## 4. Bảng So Sánh Hai Luồng Vận Hành

| Tiêu chí | Standard Base (Dự án mới) | Custom Base (Maintain / Khác Base) |
|---|---|---|
| **Mục đích** | Dự án làm mới từ đầu theo Base chuẩn | Dự án có sẵn, khác UI library, bảo trì |
| **Profile khi init** | `Standard Base` | `Custom / Existing Base` |
| **Thư viện UI** | Nuxt 4 + Shadcn-ui / Next.js Tailwind | Element Plus, Ant Design, Vuetify, Custom... |
| **Nguồn Template** | `adapters/nuxt4/` hoặc `adapters/nextjs/` | Sinh từ Golden Sample qua `build-template-code` |
| **DSL Registry** | `registries/design.registry.json` chuẩn | Tự động sinh vào `.flowgrid/adapters/custom/` |
| **Lexicon Graph** | Packaged built-in lexicon | Nạp từ `.flowgrid/adapters/custom/lexicon/` |
| **Kết quả Docs SSOT** | Data Dictionary + Shadcn tags | Data Dictionary + Thẻ component thực tế của dự án |

---

## 5. Câu Hỏi Thường Gặp (FAQ)

### Dự án có nhiều màn hình phong cách khác nhau thì chọn Golden Sample thế nào?
Hãy chọn **1 màn hình CRUD phổ biến nhất** (có thanh tìm kiếm, bảng dữ liệu, phân trang và nút thao tác). Màn hình này mang tính đại diện cao nhất (80% các màn hình khác sẽ kế thừa phong cách này).

### Nếu sau này dự án bổ sung component mới thì cập nhật thế nào?
Bạn chỉ cần thêm component vào dự án, sau đó chạy lại:
```bash
flowgrid build-template-code --sample=<path/to/NewComponent.vue> --force
```
Hệ thống sẽ cập nhật lại `design.registry.json` và đồng bộ vào ArtifactGraph ngay lập tức.
