# Forgekit & Các Bộ Công Cụ (Kits)

<div class="intro-grid">
<div class="intro-card intro-card--main">
<h3>Forgekit là gì</h3>
<ul>
<li><strong>Forgekit</strong> là nền tảng Tooling & MCP điều phối toàn diện quy trình phát triển: từ kiến trúc, đặc tả SSOT, sinh mã nguồn đến kiểm thử tự động.</li>
<li>Một <strong>repo</strong> là nơi team thao tác và chia sẻ artifact: Document Hub (Docs SSOT), API/Frontend (Source Code), hoặc kịch bản kiểm thử (Test Hub).</li>
<li>Lệnh <code>forgekit init</code> tự động cấu hình bộ công cụ, MCP server, và các kỹ năng (Skills) tương ứng với vai trò của Repo.</li>
</ul>
</div>
<div class="intro-card intro-card--side">
<h3>Nguyên tắc vận hành</h3>
<ol>
<li>Cài đặt và quản lý tập trung qua CLI <code>forgekit</code> và máy chủ MCP <code>forgekit</code>.</li>
<li>Cấu hình dự án lưu tại <code>.forgekit/config.json</code> ở thư mục gốc.</li>
<li>Dữ liệu liên repo kết nối qua biến môi trường cục bộ (như <code>DOCSKIT_ROOT</code>), đảm bảo an toàn và bảo mật tuyệt đối.</li>
</ol>
</div>
</div>

---

## 1. Bảng phân loại "Bộ Công Cụ" (Kits) trong Forgekit

Khi khởi tạo dự án với `forgekit init`, hệ thống cấu hình các bộ kỹ năng tương ứng với Project Type của bạn:

| Bộ Công Cụ | Hỗ trợ (capability) | Skill cung cấp (`harness/`) | Lane (Project Type) |
|------------|---------------------|-----------------------------|---------------------|
| **Bộ Docs** | SSOT Architecture + Specs (Arc42, Data Dictionary, State Matrix, Action Flows). Split IR, render Markdown không rác YAML, publish catalog, API 01. | `docs/`: `/architecture`, `/spec`, `/grill-bqa`, `/grill-dev`, `/api-spec`, `/update-spec`... | Document Hub |
| **Bộ Code** | Sinh code FE/BE từ IR (`ir/design.yaml`, `api/01`). Quản lý UI Components, Data Models, Adapters (Next.js, FastAPI, Laravel, DotNet), API Routes, Unit Test. | `fe/`: `/prototype`, `/unit`, `/grill-unit` <br> `be/`: `/api`, `/grill-api` | Frontend, Backend, Fullstack |
| **Bộ Test** | Lên kế hoạch kiểm thử theo chuẩn IEEE 29119 Boundary Test Matrix + Gherkin BDD + sinh Playwright E2E Testcase. | `tests/`: `/scenario`, `/testcase`, `/grill-testcase` | Test, Frontend, Fullstack |
| **Common** | Gợi ý tag / gap / parity thông qua hệ thống ArtifactGraph cục bộ. | `common/`: `/artifactgraph` | Tất cả (Common) |

<br>

<div class="intro-grid">
  <div class="intro-card">
    <img src="./assets/forgekit-docs.jpg" alt="Bộ Docs" style="border-radius: 8px; margin-bottom: 12px;" />
    <h4>Bộ Docs (Docskit SSOT)</h4>
    <p>Quản lý Document Hub, Architecture Arc42, 5-Tier Validation, State & Action Flow Matrix, Bundle IR và Specs chuẩn mực.</p>
  </div>
  <div class="intro-card">
    <img src="./assets/forgekit-code.jpg" alt="Bộ Code" style="border-radius: 8px; margin-bottom: 12px;" />
    <h4>Bộ Code (Codegenkit)</h4>
    <p>Sinh mã nguồn FE/BE tự động theo Adapters, kiểm soát contract parity và sinh Unit Test.</p>
  </div>
  <div class="intro-card">
    <img src="./assets/forgekit-test.jpg" alt="Bộ Test" style="border-radius: 8px; margin-bottom: 12px;" />
    <h4>Bộ Test (Testkit)</h4>
    <p>Kế hoạch kiểm thử phân hoạch tương đương & phân tích giá trị biên (IEEE 29119), sinh kịch bản Playwright E2E tự động.</p>
  </div>
  <div class="intro-card">
    <img src="./assets/forgekit-common.jpg" alt="Common" style="border-radius: 8px; margin-bottom: 12px;" />
    <h4>Common (ArtifactGraph)</h4>
    <p>Graph database local, hỗ trợ gap analysis, code tagging và metadata liên repo.</p>
  </div>
</div>

### Lệnh xử lý tài liệu (Docs Lane)

Trên Repo đóng vai trò **Document Hub**, bộ kỹ năng của Forgekit cung cấp:

| Command | Trỏ tới | Phân hệ |
|---------|---------|---------|
| `/architecture` | Router duy nhất → overview, surfaces, business-process, module... | Bộ Docs |
| `/overview` | `overview/` — purpose, actors, operational areas | Bộ Docs |
| `/surfaces` | `surfaces/` — actor + action + channel | Bộ Docs |
| `/spec` / `/grill-docs` | `…/CMP-*/<NN…>/` (`*.bundle.yaml` + `ir/` + `api/`) | Bộ Docs |
| `/artifactgraph` | Phân tích local `.artifactgraph/` index | Common |

Lệnh triển khai code (`/prototype`, `/api`, `/test`) sẽ chạy ở các **code repo** (FE/BE) nhờ sự hỗ trợ của Bộ Code và Bộ Test.

---

## 2. Docs là "registry hub", các repo khác chỉ giữ pointer

Repo **Document Hub** là nơi duy nhất sở hữu registry sản phẩm đầy đủ, architecture ID và bundle IR. Repo khác (FE/BE/tests) **không** copy dữ liệu đó — chúng giữ **pointer machine-local** trỏ tới một checkout docs do developer tự config qua file `.forgekit/config.json` hoặc Environment Variable.

| Từ repo | Pointer (MCP env) | Ai dùng |
|---------|-------------------|---------|
| FE / BE | `CODEGENKIT_DOCS_ROOT` / `DOCSKIT_ROOT` | Bộ Code đọc IR (`ir/design.yaml`) |
| Tests | `TESTKIT_DOCS_ROOT` | Bộ Test phân tích `FLOW-*` |

1. Pointer là **đường dẫn tuyệt đối do dev chọn** trên máy đó (config lúc chạy `forgekit init`).
2. Registry / architecture **SSOT ở lại repo docs**. 
3. **ArtifactGraph mặc định chạy local**, sinh index SQLite trong thư mục `.artifactgraph/`.

---

## 3. Chọn Project Type theo nhu cầu

Khi chạy `forgekit init`, bạn sẽ được hỏi loại dự án. Tùy theo lựa chọn, các bộ kỹ năng sẽ được sync:

| Tôi muốn… | Chọn Project Type | Kỹ năng được tải |
|-----------|-------------------|------------------|
| Author/index architecture, sinh Bundle IR, Specs | **Document** | Bộ Docs + Common |
| Sinh code React/Vue/Angular/Nuxt/Next | **Frontend** | Bộ Code (FE) + Common |
| Sinh code FastAPI, Laravel, NestJS | **Backend** | Bộ Code (BE) + Common |
| Code cả FE và BE trong cùng 1 Monorepo | **Fullstack** | Bộ Code (FE+BE) + Common |
| Lên kịch bản Test, sinh Playwright Automation | **Test** | Bộ Test + Common |

---

## 4. Các lệnh của Forgekit CLI

Mọi thao tác đều thông qua lệnh `forgekit`.

| Lệnh | Việc |
|------|------|
| `forgekit init` | Wizard tương tác để khai báo loại dự án, adapter và tự động cài đặt MCP, chèn scripts vào `package.json`. |
| `forgekit dev` | (Dành cho Document/Test) Khởi chạy giao diện VitePress ở localhost. |
| `forgekit build` | Đóng gói trang tĩnh VitePress. |
| `forgekit split` / `split_all` | Phân tách Bundle YAML ra Markdown và JSON IR. |
| `forgekit publish` | Triển khai (Deploy) Document Hub. |
| `forgekit openapi_*` | Render và Build Swagger/OpenAPI UI. |
| `forgekit build-template-code` | Trích xuất DNA từ Golden Sample và tạo bộ Template + DSL Registry cho dự án khác Base. |

---

## 5. Kiến Trúc MCP Server Hợp Nhất (`forgekit`)

**Forgekit** cung cấp **một tiến trình MCP Server duy nhất** (`bin/forgekit-mcp.mjs`), tự động cấu hình vào `.agents/mcp_config.json` hoặc `.cursor/mcp.json` sau khi chạy `forgekit init`.

| Nhóm công cụ MCP | Tiền tố Tool | Trách nhiệm chính |
|---|---|---|
| **Docs Hub** | `docskit_*` | Quản lý cây kiến trúc arc42, routing ID, split `*.bundle.yaml` sang IR, render `spec.md` chuẩn bảng biểu (Data Dictionary & State Matrix), publish `CATALOG.md`. |
| **Code Generation (FE)** | `codegen_*`, `common_*`, `unit_*` | Sinh mã nguồn Component UI theo adapter (Next.js, Nuxt), sinh molecule chung từ surface/module common, sinh Vitest/Jest Unit Test. |
| **Code Generation (BE)** | `api_*` | Sinh API routes, controller, DTO, validation schemas từ `01-backend-spec.yaml`, sinh Backend Unit Test. |
| **Test Engineering** | `cases_*`, `testcase_*` | Kiểm tra cú pháp testplan, rà soát coverage gaps, sinh mã Playwright E2E tự động từ kịch bản IEEE 29119. |
| **Artifact Graph** | `artifactgraph_*` | Truy vấn SQLite local để phân tích gap, gợi ý tag `#needs-component`, `#needs-endpoint`, kiểm tra parity contract. |

---

## 6. Ownership & Quy Tắc Độc Lập

1. Một `SKILL.md` (như `/architecture`) chỉ nằm trong đúng một thư mục gốc của `harness/` (ví dụ `harness/docs/skills/architecture/`).
2. Các script thực thi (engine) nằm tập trung ở `engines/` và được Forgekit gọi tự động dựa trên alias truyền vào (ví dụ `forgekit split_all`).
3. Dữ liệu local của mỗi dự án lưu tại `.forgekit/config.json`.

---

Đọc tiếp: [Start now](./getting-started.md) · [System doc structure](./system-doc-structure.md) · [Toolchain index](../2-lifecycle/overview.md) · [CLI & MCP Reference](../6-reference/cli-and-commands.md).
