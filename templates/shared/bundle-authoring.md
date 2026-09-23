# portal-feature-bundle/v1 — authoring rules (PHASE 1)

Hub: `docs/templates/feature.bundle.yaml` · split: `pnpm spec:split`

## Top-level

| Key | Purpose |
|-----|---------|
| `page-id` | Screen identity (`cmp-adm-000-01`). Split copies this onto `ir/spec.yaml` as `page-id` (not `id`, so it does not collide with requirement/section ids). Legacy bundles may still use `id`. |
| `summary` | Phải trình bày dạng bullet. Bắt buộc có các tiêu đề (chuẩn Arc42 business): **mục tiêu nghiệp vụ** (business_goals), **các bên liên quan** (stakeholders), **kịch bản người dùng** (user_journey), **bối cảnh** (description, input liên kết cross-page/module, output) và **cách giải quyết** (tùy chọn). Mục đích để 100% Non-tech Stakeholder hiểu và duyệt. |
| `userStories` | **Khối User Stories chuyên sâu cho màn hình:** Cấu trúc gồm `primary` (asA, iWant, soThat), `contextAndHandoff` (chứa `screenAccess` hỗ trợ 3 loại: `directRoute` cho URL công khai/trực tiếp, `sidebarMenu` cho menu trái đa cấp + label text, `contextualAction` cho nút bấm kích hoạt từ màn hình A), `scenarios` (5 kịch bản chi tiết: Initial Load, Input/Validation, Submit, Exceptions & Fallback, Background Logic Trigger), và `acceptanceCriteria`. Split sao chép nguyên vẹn sang `ir/spec.yaml` và render khối `## User Stories & Screen Journey` ra Markdown. |
| `spec` | Design v1 — actors, requirements, `ui.routes`, **`ui.list` / `ui.form` / `ui.detail`**, `acceptance`. **Không** author `spec.api` — API SSOT là `api/<seq>/01-backend-spec.yaml`. |
| `gen` | **Bắt buộc trước codegenkit:** `codegen.profile` (`auth` login/forgot/reset; `change-password`; `public`; `not-found`/`error`; `list`/`create`/`admin-crud`) + entity/module, `tags`, derived `ui.*`. `/grill-dev` ghi. Endpoint `action` ghi trên **01**, không trên bundle. |
| `legacy` | Legacy facts + evidence pointers |
| `design` | Nested **`sections[]`** (card/container/form + `meaning` + `purpose` + `visual` + `interaction` + `validation` + `messages` + `states` + `bind`/`db`) · **`nav`** (`screenAccess` & `sidebar.hierarchy`) · `zones[]` fallback · `behavior` · **`actions[]`** (onSuccess, onSpecificError, backgroundTrigger) |
| `review` | BA prose only — **không** split sang `ir/*` |

## /spec authoring (complete when information exists)

- Fill `userStories` chi tiết theo mẫu trong `feature.bundle.yaml`. Tuyệt đối không để trống hoặc chỉ ghi 1 câu qua loa.
- **Quy tắc Khai báo Cách thức Truy cập Màn hình (screenAccess BẮT BUỘC):** Phải chọn đúng 1 trong 3 loại:
  - `directRoute`: Dành cho trang truy cập trực tiếp bằng URL (Login, Register, Guest Page, Public Landing, 404). Khai báo `routePath`, `isPublic`.
  - `sidebarMenu`: Dành cho Dashboard, Danh sách Admin CRUD. Khai báo `menuHierarchy` (mảng danh mục dropdown đa cấp `["Group", "Subgroup"]`), `menuLabel` (text nhãn menu), `icon`.
  - `contextualAction`: Dành cho Trang chi tiết, Edit Modal, Settings. Khai báo `sourceScreen`, `triggerControl` (mô tả nút bấm kích hoạt từ màn hình A), `navigationType` (`pageRedirect`, `modalDialog`, `drawer`, `tabSwitch`).
- **Quy tắc Meaning vs Purpose BẮT BUỘC:** Trên từng element (section, item, column, filter, action), BẮT BUỘC khai báo cả 2 trường:
  - `meaning`: **Ý nghĩa nghiệp vụ** — Bản chất kinh doanh của trường dữ liệu/nút bấm trong thế giới thực, ảnh hưởng đến luồng tính toán hay quyết định nào.
  - `purpose`: **Mục đích thao tác** — Người dùng thao tác gì với control này trên UI (nhập, tìm kiếm, bấm, xem).
- **Thẩm định dữ liệu (Validation & Messages):** Mọi trường có `validation` (required, min/max, pattern, accept) PHẢI đi kèm trường `messages` chứa câu thông báo lỗi tiếng Việt tương ứng.
- **Hành động & Tương tác (Actions):** Nút bấm nộp/lưu phải có đầy đủ: `validateFormBeforeSubmit`, `feedback` (loadingText, disableWhileSubmitting), `apiRefs`, `onSuccess` (toast, navigation handoff, backgroundTrigger), `onSpecificError` (map lỗi 422, 409 conflict, 403), `onCommonError`.
- Fill `design.sections[]` as a **dynamic nested tree** for that page (any depth). Same node shape everywhere: `kind` + `meaning` + `purpose` + `visual` + `tags`/`extract` + `items[]` + nested `sections[]`. Do not assume login or any one layout.
- When the page has app chrome: `design.nav.sidebar.levels` (đa cấp) + `design.nav.breadcrumb`. Full-bleed pages: `sidebar.enabled: false`.
- Flat `design.zones[]` is only a fallback if there is no nested card tree.
- Fill the matching profile: list → `spec.ui.list`; form → `spec.ui.form` (do not merge form into the page shell); detail → `spec.ui.detail`.
- Do **not** dump the screen into `requirements` prose instead of inventory.
- **UI Metrics Policy:** DO NOT declare basic CSS properties (e.g., `font-size`, `padding`, exact colors) in feature specs. These are governed by the global Design System (e.g., Shadcn/Tailwind). Only declare them if the feature requires a specific, exceptional override.
- Missing hard facts → `#missing_info` on that field. Do not wait for grill to invent inventory.
- `/grill-bqa`, `/grill-dev`, `/grill-docs` only re-check, fill gaps, or fix conflicts.

## spec (design v1) — có

- `actors`, `entities`, `relationships`
- `requirements` (BẮT BUỘC chứa Edge Cases. CHÚ Ý: Field Validations, State Machine, UI Permissions phải được map vào từng item trong `design.sections`, KHÔNG liệt kê chung chung ở đây)
- `ui.routes`, `ui.list`, `ui.form`, `ui.detail`, `ui.toolbar` (intent)
- `acceptance`

API: **chỉ** `…/api/<seq>/01-backend-spec.yaml` (`/api-spec`). Split **chiếu** `api.endpoints` (id/method/path/action) sang `ir/design.yaml` cho FE/testkit — không author trên bundle.

## spec — không (thuộc `gen`)

- `codegen`, `tags`
- root `ui.filters`, `ui.columns`, `ui.composition`, `ui.testIds` (derive after inventory exists)
- Prose layout blob — dùng `design.sections[]` (nested) + `design.nav` + `review.layoutNotes`

## Split output

Split exists so agents **Read the entire `ir/design.yaml`** (tech) or **entire `ir/spec.yaml`** (prose). Do **not** instruct “only Read `design.sections` / `spec.ui` from the bundle” — that misses fields and is why IR is split.

Authoring (`/spec`, grill-*) still **writes** `*.bundle.yaml`, then split.

| Artifact | Đọc bởi | Nội dung |
|----------|---------|----------|
| `*.bundle.yaml` | Ghi SSOT (`/spec`, grill-*) | Đầy đủ spec+gen+design |
| `ir/design.yaml` | **Đọc cả file** — grill-*, FE `/prototype`, `/testcase` | Tech: id, kind, tags, bind, visual CSS, `api` chiếu từ 01. Giữ label/purpose. |
| `ir/spec.yaml` | VitePress + stakeholder | Business page + requirements/acceptance. Không id/tag/bind. `"Q&A"`. Không stub `legacy` rỗng. |
| `…/api/<seq>/01-backend-spec.yaml` | BE `/api`, `openapi:gen`, **author API** | Tech BE — SSOT duy nhất cho endpoint |
| `<slug>.md` | Người (BA/QA) | Render từ **`ir/spec.yaml`** (chưa split thì không có trang) |

Không còn `ir/legacy.yaml`. `legacy:` trên `ir/spec.yaml` chỉ khi có evidence thật.

Thiếu fact → `#missing_info` trên field đó. Grill không bịa CSS/API.

## design.nav + nested sections (dynamic)

Cùng một schema cho mọi page. Agent điền cây theo màn thực tế — không dùng một màn (login, list, …) làm mặc định.

```yaml
nav:
  sidebar:
    enabled: true   # false nếu không có menu trái
    position: left
    levels: []      # { id, label, href, active, children[] } lồng đa cấp
  breadcrumb: []    # { label, href }

**LƯU Ý ĐẶC BIỆT VỀ ĐA NGÔN NGỮ (i18n):**
1. **Text hiển thị UI (cần i18n)**: Các thuộc tính như `label`, `value`, `copy.placeholder`, text của component lib... BẮT BUỘC dùng cho i18n (sẽ được map với file ngôn ngữ). Áp dụng cho các component lá như `input`, `text`, `button`, v.v.
2. **Text ngữ cảnh (không i18n)**: Các thuộc tính giải thích/cấu trúc như `name`, `description`, `purpose` chỉ dùng cho BA/Dev, KHÔNG dùng để render UI, KHÔNG mang đi dịch. Tùy thuộc vào `kind` mà khai báo cho đúng bản chất, **tuyệt đối không dùng `label` để mô tả một node ẩn (như container)**.
   - **BA**: `name`, `description`, `purpose`, `copy`, `position`, `color`, `visual` (width/height/max-*/scroll), `interaction`, `validation` (mặt UI), `db` (thông tin lưu trữ schema, field, enumMapping)
   - **Tech**: `kind`/`widget`, `tags`, `extract`, `bind` (field/hidden/apiRef), `apiRefs`, `hidden`, `testId`, `states`

```yaml
sections:
  # LOẠI 1: KHỐI STATS BANNER / HEADER KPI CARD (#ui: Card, #ui: Badge)
  - id: sec_kpi_banner
    name: "Khối Thống Kê Tổng Quan"
    kind: card
    primitive: "#ui: Card" # Gắn tag primitive Shadcn UI
    meaning: "Cung cấp chỉ số hiệu suất tổng quan của tài khoản giúp nhân viên đưa ra quyết định xử lý nhanh"
    purpose: "Hiển thị các thẻ KPI thống kê tổng số bản ghi và trạng thái"
    visual:
      colorToken: "#common:card-surface"
      className: "grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-card border rounded-xl shadow-xs"
      typography: "text-card-foreground"
    dynamicProps:
      layoutMode: "responsive-grid"
      columns: 3
    items:
      - id: kpi_total_records
        kind: badge
        primitive: "#ui: Badge"
        label: "Tổng hồ sơ"
        meaning: "Số lượng bản ghi đang quản lý trong hệ thống"
        purpose: "Theo dõi số lượng hồ sơ hiện có"
        colorToken: "#common:primary"
        visual:
          className: "text-2xl font-bold tracking-tight text-primary"

  # LOẠI 2: KHỐI FORM NHẬP LIỆU ĐỘNG (#ui: Form, #ui: Select, #ui: Input)
  - id: sec_main_info
    name: "Khối Thông Tin Nhập Liệu Hồ Sơ"
    kind: form_grid
    primitive: "#ui: Form"
    meaning: "Gom nhóm các thuộc tính nhận diện cốt lõi của bản ghi phục vụ tra cứu và kiểm toán"
    purpose: "Khu vực nhập liệu thông tin chính của hồ sơ"
    visual:
      className: "space-y-6 border p-6 rounded-xl bg-background shadow-xs"
      layoutMode: "two-column"
    dynamicProps:
      responsiveGrid: "grid grid-cols-1 lg:grid-cols-2 gap-6"
    sections:
      # Component nhập liệu có validation & messages & styling
      - id: fld_record_name
        name: "Record Name Field"
        kind: input
        primitive: "#ui: Input"
        label: "Tên hồ sơ"
        meaning: "Tên định danh giao dịch của khách hàng dùng làm tiêu đề hiển thị trên mọi báo cáo"
        purpose: "Nhập tên hồ sơ hiển thị"
        visual:
          className: "w-full focus:ring-2 focus:ring-ring"
        copy:
          placeholder: "Nhập tên đầy đủ..."
          helper: "Tối thiểu 3 ký tự, không chứa ký tự đặc biệt"
        bind:
          field: record_name
        db:
          schema: records
          field: name
        validation:
          required: true
          minLength: 3
          maxLength: 100
        messages:
          required: "Vui lòng nhập tên hồ sơ."
          minLength: "Tên hồ sơ phải có ít nhất 3 ký tự."

      # Component chọn có điều kiện động (Dropdown + States)
      - id: fld_service_level
        name: "Service Level Select"
        kind: select
        primitive: "#ui: Select"
        label: "Cấp độ dịch vụ"
        meaning: "Xác định gói dịch vụ để áp dụng chính sách giá và kích hoạt tự động Zalo VIP"
        purpose: "Chọn gói dịch vụ áp dụng"
        visual:
          className: "w-full border-input"
        bind:
          field: service_level
        db:
          schema: records
          field: service_level
          enumMapping:
            "STANDARD": "Tiêu chuẩn"
            "PREMIUM": "Cao cấp VIP"
        validation:
          required: true
        messages:
          required: "Vui lòng chọn cấp độ dịch vụ."

      # Component hiển thị động theo trạng thái
      - id: fld_vip_request
        name: "VIP Special Request"
        kind: textarea
        primitive: "#ui: Textarea"
        label: "Yêu cầu đặc biệt cho gói VIP"
        meaning: "Chi tiết yêu cầu cá nhân hóa bổ sung"
        purpose: "Nhập ghi chú yêu cầu riêng cho gói dịch vụ VIP"
        visual:
          className: "col-span-full border-muted bg-muted/20"
        states:
          visibleWhen: "service_level == 'PREMIUM'"
```

Minh họa lồng (không phải template cố định): container → card → form, hoặc sidebar → toolbar → table.

## design.zones (flat fallback)

```yaml
zones:
  - id: search
    label: Khu vực tìm kiếm
    kind: container
    items:
      - id: keyword
        kind: search
        widget: search
        label: Ô tìm kiếm
        purpose: "User tìm bản ghi theo tên hoặc mã"
        copy:
          placeholder: Search by name or code
        bind: { field: keyword }
```

## design.behavior (CRUD table trong md render)

```yaml
behavior:
  create: { enabled: true, surface: page }
  delete: { enabled: true, mode: confirm_dialog }
```

## design.actions (API calls + UI error handling)

Không còn `bundle.spec.api`. Màn gọi API nào = `design.actions` (và button/item trong `sections`/`zones`) trên **`ir/design.yaml`** sau split.

- Unique API của màn: `apiRefs` (sau `/api-spec` ghi trio `api/<seq>/`).
- API đã có (màn khác / common): `tags: ["#reuse-api"]` + `reuseFrom: …/01-backend-spec.yaml`. **Không** tạo trio mới.

```yaml
actions:
  - id: submit_form
    label: Submit Form
    purpose: "Lưu form và báo kết quả cho user"
    variant: primary
    position: form_footer
    trigger: button_click
    apiRefs: [ feature.create ]
    # tags: ["#reuse-api"]
    # reuseFrom: surfaces/admin/CMP-01/auth/01/01/01/api/01/01-backend-spec.yaml
    onSuccess:
      - Navigate to list page
      - Show success toast "Created successfully"
    onCommonError:
      override: false
      notes: "Inherit #ui-common:error-handler (Global toast 500/401)"
    onSpecificError:
      - condition: "422 Validation"
        notes: "Show inline field errors below inputs"
      - condition: "403 IDOR"
        notes: "Redirect to safety page, show warning"
```

## Agent output (/spec)

YAML only per schema. No explanation. No markdown.

## Questions: AskQuestion wizard or hub `qa/open/`

Do **not** write `openQuestions` anywhere. Schema/render không còn field này.

- Member trả lời **ngay:** AskQuestion (options + Recommended + **Other**) → **STOP** → ghi field thật.
- Member chọn **Other** mà **chưa quyết:** `.cursor/extracts/qa-inbox.md` → `qa/open/QA-<bundle.id>-NNNN.yaml`. Đóng sau bằng **`/qa-resolve <id>` + giải pháp**.
- `grillStatus` có thể `done` khi vẫn còn file QA.

## YAML Syntax & Escaping Rules

- **ALWAYS quote colons in strings:** Any string containing `:` (e.g., `summary: "Case 1: Token..."`, `label: "Hàng nút: [Secondary]"`) MUST be wrapped in double quotes `"..."`.
- **Multiline text:** Use `|` block scalar for multiline strings or list items containing formatting symbols.

## ir/spec.yaml vs ir/design.yaml

`pnpm spec:split` ghi hai file. Docskit grill **không** đọc `ir/*` khi author — chỉ bundle. Split ghi `"Q&A":` trên **`ir/spec.yaml`** (id `QA-<bundle.id>-NNNN` cách nhau bởi `, `) từ `qa/open/` — không nhét list vào bundle.

Downstream (UI gen, API gen, testcase) đọc **chỉ `ir/design.yaml`**. Thiếu file = split/spec chưa xong. Story/copy chưa đủ thì **bổ sung design** (bundle.gen + split), không đọc `ir/spec.yaml`. `ir/spec.yaml` chỉ văn mô tả + `legacy` + `qa` (id treo).

