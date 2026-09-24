# 🛠 Danh sách Lệnh CLI & Agent Skills (Usage)

Tài liệu này liệt kê toàn bộ các lệnh thực thi (Commands) và bộ Kỹ năng (Skills) của FlowGrid.

## ⚙️ Các Lệnh Xử Lý Cốt Lõi (FlowGrid CLI)

FlowGrid chia hệ thống ra làm 3 bộ máy chính: **Bộ Docs**, **Bộ Code**, và **Bộ Test**. Dưới đây là các lệnh thao tác cho từng bộ:

### Bộ Docs (Quản lý Tài liệu & Specs)
Các lệnh thao tác với tài liệu, chia tách Spec và kết xuất giao diện Markdown/OpenAPI.

| Lệnh FlowGrid | Chức năng |
|---------------|-----------|
| `flowgrid split` | Cắt nhỏ `.bundle.yaml` ra Markdown & IR files (`ir/design.yaml`, `ir/spec.yaml`, `ir/generated/<slug>.md`). |
| `flowgrid split_all` | Quét và cắt nhỏ toàn bộ Bundle YAML trong repo. |
| `flowgrid render` | Render lại UI Design Specs từ YAML sang MD (Data Dictionary & State Matrix). |
| `flowgrid dev` | Chạy Live Server của VitePress (`npx vitepress dev`). |
| `flowgrid build` | Đóng gói Document Hub tĩnh (`npx vitepress build`). |
| `flowgrid publish` | Publish tài liệu lên server hoặc CDN tĩnh, sinh `CATALOG.md`. |
| `flowgrid openapi_render` | Gộp các OpenAPI YAML nhỏ thành `docs/openapi/api.yaml`. |
| `flowgrid openapi_build_ui` | Build giao diện Swagger UI tĩnh cho Docs Hub. |

*(Ví dụ chạy: `flowgrid split_all`)*

### Bộ Test (Kiểm thử & Testcase)
FlowGrid chịu trách nhiệm phân tích kịch bản kiểm thử định dạng YAML để kết xuất ra Markdown hoặc soi chiếu Coverage.

| Lệnh FlowGrid | Chức năng |
|---------------|-----------|
| `flowgrid cases:render` | Dịch toàn bộ Testplan YAML sang Markdown để đọc trên Docs Hub. |
| `flowgrid cases:check` | Kiểm tra cú pháp YAML của Testplan. |
| `flowgrid cases:coverage` | Quét Coverage để phát hiện các specs chưa có Testplan. |
| `flowgrid testcase:gen` | Tự động sinh mã nguồn Playwright E2E từ YAML. |
| `flowgrid e2e-registry` | Kiểm tra/Xác thực registry của Playwright Test. |

### Bộ Code (Sinh Mã Nguồn & Unit Test)
FlowGrid kế thừa trọn vẹn sức mạnh sinh mã nguồn và Unit Test đa ngôn ngữ (NodeJS, Python, PHP, C#, v.v.).

| Lệnh FlowGrid | Chức năng |
|---------------|-----------|
| `flowgrid gen` | Sinh mã nguồn UI Component (Frontend). |
| `flowgrid unit-gen` | Sinh mã nguồn Unit Test cho Frontend (Jest/Vitest). |
| `flowgrid api-gen` | Sinh mã nguồn API Route/Controller (Backend). |
| `flowgrid api-unit-gen` | Sinh mã nguồn Unit Test cho API (Backend). |
| `flowgrid contract-gen` | Sinh mã nguồn Type/DTO dùng chung cho Fullstack. |
| `flowgrid gen-css` | Cập nhật CSS Variables từ Design Tokens. |
| `flowgrid build-template-code` | Trích xuất DNA từ Golden Sample và tạo bộ Template + DSL Registry cho dự án khác Base. |

*(Tất cả lệnh trên đều có thể truyền thêm `:dry` để xem trước thay vì ghi file, ví dụ: `flowgrid api-unit-gen:dry`)*

---

## 🛠 Danh sách Kỹ năng (Skills) của Agent

Các kỹ năng (`.mdc` và `SKILL.md`) đã được tổ chức lại chuẩn xác vào 4 thư mục chính dựa trên loại Project:

### 1. Frontend Skills (`harness/fe/`)
Dùng để sinh mã nguồn, component và Unit Test cho UI.
- **Sinh UI/Logic:** `model`, `wire`, `prototype`, `gen-common`, `build-template-code`.
- **Kiểm thử:** `test`, `unit`.
- **Review (Grill):** `grill-prototype`, `grill-test`, `grill-unit`, `business-impact-review`.

### 2. Backend Skills (`harness/be/`)
Dùng để sinh mã nguồn API và Unit Test Backend.
- **Sinh Code:** `api`, `api-unit`.
- **Review (Grill):** `grill-api`, `grill-api-unit`, `business-impact-review`.

### 3. Docs Skills (`harness/docs/`)
Khối óc trung tâm (Docskit SSOT). Nơi diễn ra 90% việc phân tích hệ thống, thiết kế kiến trúc và luồng dữ liệu trước khi code.
- **Kiến trúc & Sơ đồ:** `architecture`, `architecture-grill`, `docskit`, `business-process`, `background-logic`, `business-process-trace`, `cross-cutting`, `deployment`, `surfaces`, `db-erd`, `flow-trace`.
- **Thiết kế API & Specs:** `api`, `api-integration`, `api-spec`, `api-update`, `cross-entity-service`, `cross-service`, `openapi`, `module`, `spec`, `update-spec`, `common-spec`.
- **Quản lý & Review:** `decision`, `overview`, `qa-resolve`, `platform-ai`, `build-templates`, `call-external`.
- **Soi chiếu (Grill):** `grill`, `grill-api`, `grill-api-spec`, `grill-bqa`, `grill-common-spec`, `grill-dev`, `grill-docs`, `grill-integration-spec`.

### 4. Test Skills (`harness/tests/`)
Chuyên thiết kế testplan và kịch bản E2E Playwright.
- **Kỹ năng cốt lõi:** `scenario`, `testcase`.
- **Review (Grill):** `grill-testcase`.

### 5. Common/Shared Skills (`harness/common/` & `harness/shared/`)
Kỹ năng dùng chung bắt buộc cho mọi Agent.
- **Cốt lõi:** `artifactgraph`, `platform-mark`, `docs-mark`, `configure-repo-maps`, `legacy`.
- Các file chuẩn giao tiếp: `SSOT_AGENT_PROTOCOL.md`, `AGENTS.md`.

---

## 🛠 Hướng Dẫn Sử Dụng MCP Tools (Model Context Protocol)

Forgekit phơi bày toàn bộ khả năng xử lý thông qua máy chủ MCP duy nhất: **`forgekit`** (`bin/forgekit-mcp.mjs`). AI Agent (Cursor, Antigravity, Claude Desktop) tự động nhận diện và sử dụng cấu hình từ `.agents/mcp_config.json` hoặc `.cursor/mcp.json`.

```json
{
  "mcpServers": {
    "forgekit": {
      "command": "node",
      "args": ["/path/to/forgekit/bin/forgekit-mcp.mjs"],
      "env": {
        "DOCSKIT_ROOT": "/absolute/path/to/docs-hub",
        "CODEGENKIT_ADAPTER": "nextjs"
      }
    }
  }
}
```

### 1. Nhóm Công Cụ Tài Liệu (`docskit_*`)
| Tên Tool MCP | Tham số chính | Chức năng chi tiết |
|---|---|---|
| `docskit_list_ids` | `docsRoot`, `kind`, `prefix` | Quét và liệt kê danh sách toàn bộ ID kiến trúc (`CMP-*`, `FLOW-*`, `W-*`, `API-*`, `DEP-*`, `ADR-*`). |
| `docskit_route` | `topic`, `docsRoot` | Điều hướng chủ đề nghiệp vụ tới đúng file tài liệu tương ứng trong docs hub. |
| `docskit_get_element` | `id`, `docsRoot` | Lấy chi tiết thông tin và nội dung của một phần tử kiến trúc theo ID. |
| `docskit_deps_of` | `id`, `docsRoot` | Truy vết tất cả các dependency mà ID này phụ thuộc vào. |
| `docskit_dependents_of` | `id`, `docsRoot` | Tìm kiếm tất cả các ID khác đang phụ thuộc vào phần tử này. |
| `docskit_orphans` | `docsRoot` | Phát hiện các file mồ côi hoặc ID chưa được liên kết vào chương mục arc42. |
| `docskit_validate_links` | `docsRoot` | Rà soát toàn bộ các liên kết markdown bị gãy trong docs hub. |
| `docskit_bundle_split` | `paths`, `projectRoot` | Chia tách `*.bundle.yaml` ra `ir/design.yaml`, `ir/spec.yaml` và sinh `ir/generated/<slug>.md`. |
| `docskit_bundle_merge` | `paths`, `projectRoot` | Gộp dữ liệu từ `ir/*` ngược trở lại file `*.bundle.yaml`. |
| `docskit_bundle_check` | `paths`, `projectRoot` | Kiểm tra tính đồng bộ giữa bundle và ir files trên CI. |
| `docskit_bundle_split_all` | `projectRoot` | Quét và cắt nhỏ toàn bộ bundle YAML trong toàn bộ repo. |
| `docskit_docs_render` | `projectRoot`, `yamlRoot`, `mdRoot` | Render lại toàn bộ UI Design Specs sang Markdown (chuẩn Data Dictionary & State Matrix, không rác YAML). |
| `docskit_docs_publish` | `projectRoot` | Tổng hợp và xuất file `CATALOG.md` cùng liên kết đầu trang `README.md`. |

### 2. Nhóm Công Cụ Sinh Mã Nguồn Frontend (`codegen_*`, `common_*`, `unit_*`)
| Tên Tool MCP | Tham số chính | Chức năng chi tiết |
|---|---|---|
| `codegen_gen` | `adapter`, `docsRoot`, `argv` | Sinh mã nguồn UI Component Frontend theo adapter (Next.js, Nuxt4, DotNet Line). |
| `codegen_gen_dry` | `adapter`, `docsRoot`, `argv` | Chạy thử nghiệm sinh FE UI Component (Dry-run, không ghi đè file). |
| `unit_gen` | `adapter`, `docsRoot`, `argv` | Sinh mã nguồn Unit Test cho Frontend (Jest/Vitest). |
| `unit_gen_dry` | `adapter`, `docsRoot`, `argv` | Chạy thử nghiệm sinh Unit Test Frontend (Dry-run). |
| `common_gen` | `adapter`, `docsRoot`, `argv` | Bóc tách và sinh các UI molecules dùng chung từ `surfaces/<surface>/common` hoặc `CMP-*/common`. |
| `common_gen_dry` | `adapter`, `docsRoot`, `argv` | Chạy thử nghiệm trích xuất common UI molecules. |
| `codegen_registry_validate` | `projectRoot` | Kiểm tra tính toàn vẹn của registry codegen FE. |
| `unit_registry_validate` | `projectRoot` | Kiểm tra tính toàn vẹn của registry unit test FE. |

### 3. Nhóm Công Cụ Sinh Mã Nguồn Backend (`api_*`)
| Tên Tool MCP | Tham số chính | Chức năng chi tiết |
|---|---|---|
| `api_gen` | `adapter`, `argv` | Sinh mã nguồn API Controller/Route/Service từ `01-backend-spec.yaml` (FastAPI, Laravel, DotNet). |
| `api_gen_dry` | `adapter`, `argv` | Chạy thử nghiệm sinh API Backend (Dry-run). |
| `api_unit_gen` | `adapter`, `argv` | Sinh mã nguồn Unit Test cho API Backend (Pytest, PHPUnit, xUnit). |
| `api_unit_gen_dry` | `adapter`, `argv` | Chạy thử nghiệm sinh API Unit Test Backend (Dry-run). |
| `api_registry_validate` | `projectRoot` | Xác thực tính hợp lệ của backend API codegen registry. |
| `api_unit_registry_validate`| `projectRoot` | Xác thực tính hợp lệ của backend API unit test registry. |

### 4. Nhóm Công Cụ Quản Lý & Tự Động Hóa Kiểm Thử (`cases_*`, `testcase_*`)
| Tên Tool MCP | Tham số chính | Chức năng chi tiết |
|---|---|---|
| `cases_render` | `testsRoot`, `docsRoot` | Dịch toàn bộ Testplan YAML sang tài liệu Markdown trên Tests Hub. |
| `cases_check_plans` | `testsRoot` | Kiểm tra cú pháp và tính hợp lệ của các file kịch bản kiểm thử YAML. |
| `cases_check_coverage` | `testsRoot`, `docsRoot` | Quét và phát hiện các đặc tả specs chưa có kịch bản testplan tương ứng. |
| `testcase_gen` | `testsRoot`, `docsRoot`, `argv` | Tự động sinh mã nguồn Playwright E2E Testcase từ kịch bản kiểm thử IEEE 29119. |
| `testcase_gen_dry` | `testsRoot`, `docsRoot`, `argv` | Chạy thử nghiệm sinh mã Playwright E2E (Dry-run). |
| `e2e_registry_validate` | `projectRoot` | Kiểm tra và xác thực registry kiểm thử Playwright E2E. |

### 5. Nhóm Công Cụ Phân Tích Đồ Thị & Quan Hệ (`artifactgraph_*`)
| Tên Tool MCP | Tham số chính | Chức năng chi tiết |
|---|---|---|
| `artifactgraph_analyze_spec` | `specPath` | Phân tích file đặc tả, phát hiện gaps, gợi ý `#needs-component`, `#needs-endpoint`. |
| `artifactgraph_analyze_bullets`| `bullets` | Phân tích các gạch đầu dòng ý tưởng thô của người dùng với hệ thống hiện có. |
| `artifactgraph_grill_check` | `specPath` | Soi chiếu chất lượng đặc tả, kiểm tra các điều kiện biên và nợ kỹ thuật treo. |
| `artifactgraph_parity_check` | `specPath`, `codePath` | So khớp tính tương thích và đồng bộ giữa đặc tả và mã nguồn thực tế. |

---

# Feature Artifact — Lệnh Script Thực Thi

> Sau khi chạy `forgekit init`: Mọi lệnh thực thi quản lý tài liệu được gọi qua CLI `forgekit <command>`.

---

## Authoring & IR

| Lệnh | Input | Output |
|------|--------|--------|
| `forgekit split -- <bundle.yaml>` · `pnpm spec:split` | Bundle | `ir/design.yaml`, `ir/spec.yaml`, `ir/generated/<slug>.md` |
| `forgekit merge -- <bundle.yaml>` · `pnpm spec:merge` | `ir/*` | Bundle |
| `forgekit check -- <bundle.yaml>` · `pnpm spec:split:check` | Bundle + ir | Fail nếu lệch / common thiếu design |
| `forgekit split_all` · `pnpm spec:split:all` | Mọi `*.bundle.yaml` dưới surfaces | Split từng file |
| `forgekit render` · `pnpm forge:render` | `ir/spec.yaml` (skip màn chưa split) | `ir/generated/*.md` + **`qa/index.md`** (bảng Data Dictionary chuẩn) |
| `forgekit publish` · `pnpm forge:publish` | MD đã có + OpenAPI | **`CATALOG.md`** + link **đầu** README |
| `forgekit dev` · `pnpm docs:dev` | VitePress | Sidebar: surfaces (kèm `ir/generated`) + **QA** cuối |

GitHub: README → `CATALOG.md` (platform / product / QA) → click mở trang MD. Không lục YAML.

---

## Common (Shared Components)

| Lệnh | Mục đích |
|------|----------|
| `forgekit render --yaml-root surfaces/common/yaml` | Render common UI design MD dưới surfaces/common. |
| `forgekit gen-common` rồi `forgekit gen` | Sinh mã nguồn FE molecules trước khi sinh full screen. |

## API (Cùng leaf với FE)

| Lệnh | Mục đích |
|------|----------|
| `/api-spec` | Inventory từ **`ir/design.yaml` actions** (`apiRefs` / `#reuse-api` + `reuseFrom`). Unique → `api/<seq>/` trio. Toàn reuse → **zero** `api/` |
| `forgekit openapi_gen --spec …/01-backend-spec.yaml` | Ghi sibling `02-openapi.yaml` |
| `forgekit openapi_render` | Gộp toàn bộ OpenAPI specs thành `docs/openapi/api.yaml`. |
| `/qa-resolve QA-…` | Đóng một file `qa/open`, patch bundle/01, split |

## Codegen — Frontend (`forgekit gen`)

**Input:** `ir/design.yaml` (`--id` hoặc `--spec`). **Không** `ir/spec.yaml`.

| Lệnh | Mục đích |
|------|----------|
| `forgekit gen:dry -- --id W-*` / `--spec …/ir/design.yaml` | Gate sau `/grill-dev` |
| `forgekit gen` | Scaffold FE component vào repo |
| `forgekit contract-gen` | Sinh FE models từ **design** |

## Codegen — Backend (`forgekit api-gen`)

**Input:** `…/api/<seq>/01-backend-spec.yaml` only. `--id CMP-*` glob mọi 01 dưới module.

| Lệnh | Mục đích |
|------|----------|
| `forgekit api-gen:dry -- --spec …/api/01/01-backend-spec.yaml` | Gate sau `/grill-api-spec` |
| `forgekit api-gen` | Scaffold Backend API controller/route/service |
| `forgekit api-unit-gen` | Sinh Unit Test cho Backend API |

## Unit & E2E Testing

| Lệnh | Input |
|------|--------|
| `forgekit unit-gen` | Sinh Unit Test Frontend từ `ir/design.yaml` |
| `forgekit api-unit-gen` | Sinh Unit Test Backend từ `01-backend-spec.yaml` |
| `forgekit testcase:gen --id …` | Sinh kịch bản Playwright E2E từ Testplan SSOT |
| `forgekit cases:render` | Render kịch bản Testplan YAML sang Markdown |

---

## Ví dụ Thực Thi

```bash
# Phân tách và render tài liệu specs
forgekit split -- surfaces/admin/CMP-01/01/01/01/<slug>.bundle.yaml
forgekit render
forgekit publish
forgekit dev

# Sinh mã nguồn Frontend
forgekit gen:dry --docs-root ~/workspace/base-docs -- --spec …/ir/design.yaml
forgekit gen

# Sinh mã nguồn Backend
forgekit api-gen:dry -- --spec …/api/01/01-backend-spec.yaml
forgekit api-gen
```

Thứ tự phối hợp trong team: [DESIGN-PHASE-DIAGRAM](../2-lifecycle/overview.md)
