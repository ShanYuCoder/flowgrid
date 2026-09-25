<!-- flowgrid-catalog -->
**[Danh mục tài liệu](CATALOG.md)**
<!-- /flowgrid-catalog -->

# FlowGrid — Enterprise Disciplined AI Engineering Platform

---

## 💡 Giới Thiệu & Triết Lý Cốt Lõi

**FlowGrid** là bệ phóng AI Engineering cho đội ngũ phát triển phần mềm doanh nghiệp, được xây dựng dựa trên kiến trúc tiên phong: **Hybrid LLM + Deterministic Script Interlock**.

### 🎯 3 Trụ Cột Triết Lý Cốt Lõi:

* **1. Phân Công Trách Nhiệm Rạch Ròi (Hybrid Reasoning & Interlock)**:
  * **Deterministic Audit Script (Kiểm tra LƯỢNG)**: Bộ script chạy tĩnh `0-dependency` kiểm định tính đầy đủ cấu trúc, schema và sự tồn tại của các trường bắt buộc (`required[]`, `fields`, `testids`), lập tức báo lỗi chính xác nếu thiếu thông tin mà không phụ thuộc vào suy đoán ngẫu nhiên.
  * **AI Agent Reasoning (Kiểm tra CHẤT)**: Dành riêng năng lực tư duy của LLM cho việc phân tích ngữ nghĩa nghiệp vụ, thiết kế kịch bản User Story 4-tier, phát hiện lỗ hổng logic nghiệp vụ và tối ưu trải nghiệm người dùng.

* **2. Bộ Bảo Vệ Bản Quyền & Chống Rác Legacy (Legacy Guard & Anti-Copy-Paste)**:
  * **2-Tier Legacy Audit**: Phân định rạch ròi giữa kiểm tra cục bộ trên từng màn hình (*Page-local Tier 1*) và kiểm tra đứt đoạn quy trình liên màn hình (*Cross-flow Tier 2*).
  * **Common Catalog Discovery**: Tự động quét khảo cổ codebase cũ để phát hiện và gom nhóm các hàm, linh kiện, DTO lặp lại thành danh mục linh kiện dùng chung (`CMN-UI-*`, `CMN-API-*`, `CMN-DTO-*`).
  * **Anti-Copy-Paste Guard**: Bắt buộc Agent và Developer phải tái sử dụng mã dùng chung trong Common Catalog, ngăn chặn triệt để hành vi nhân bản code rác legacy sang dự án mới.

* **3. Kỷ Luật Vận Hành Scrum Agile (Agile Interlock & Law Execution)**:
  * **Law 2 Threshold Interlock**: Tự động phát hiện khi số lượng câu hỏi/yêu cầu vượt quá ngưỡng 10 items, ngắt luồng chat ngẫu nhiên để ép chuyển sang cơ chế lập kế hoạch `common-plan.md` chia Phase review minh bạch.
  * **Zone-Based Multi-Turn Analysis**: Chia màn hình lớn thành các Zone độc lập (Header, Filter Toolbar, Table/Form, Footer Actions) để phân tích sâu theo từng lượt tương tác, loại bỏ hiện tượng trôi context (Lost-in-the-middle).

---

## 📋 Mục Lục (Table of Contents)

1. [Tổng Quan Đánh Giá Vận Hành (Operational Assessment)](#-1-tổng-quan-đánh-giá-vận-hành)
2. [Review Chi Tiết Theo 3 Case Sử Dụng Thực Tế](#-2-review-chi-tiết-theo-3-case-sử-dụng-thực-tế)
3. [Mô Hình Nhân Sự T-Shaped Agile & Tương Tác Cross-Role](#-3-mô-hình-nhân-sự-t-shaped-agile--tương-tác-cross-role)
4. [Định Hướng Phát Triển Tương Lai (Future Roadmap)](#-4-định-hướng-phát-triển-tương-lai-future-roadmap)
5. [Tài Liệu Chi Tiết & Hướng Dẫn Vận Hành](#-5-tài-liệu-chi-tiết--hướng-dẫn-vận-hành)
6. [Cài Đặt Nhanh (One-Liner)](#-⚡-cài-đặt-nhanh-one-liner)

---

## 🏆 1. TỔNG QUAN ĐÁNH GIÁ VẬN HÀNH

Hệ thống FlowGrid được thiết kế nhằm chuẩn hóa toàn bộ vòng đời phát triển phần mềm trong doanh nghiệp, đảm bảo tính kỷ luật và sự nhất quán tuyệt đối giữa Tài liệu đặc tả (SSOT) và Mã nguồn thực tế.

### 🛡️ 1.1. Ngăn Chặn Tự Suy Đoán (Hallucination Guard)

* **Cơ chế hoạt động**: Thay vì tin tưởng hoàn toàn vào kết quả sinh code/doc trực tiếp từ LLM, FlowGrid ép buộc mọi Agent làm việc qua quy trình kiểm định 2 lớp nghiêm ngặt kết hợp giữa **Deterministic Audit Scripts** và **Skill Workflow Pipeline**:
  * **Audit Tĩnh 0-Dependency**: Các script như `audit-bundle-gaps.mjs`, `audit-api-gaps.mjs`, `audit-testcase-gaps.mjs` chạy trực tiếp bằng Node.js thuần, kiểm tra 100% tính hợp lệ của cấu trúc file, schema trường dữ liệu, tham chiếu API và coverage testcase. Nếu thiếu bất kỳ trường bắt buộc nào, script sẽ lập tức chặn workflow và sinh danh sách `gaps[]` chính xác từng dòng mà không đoán mò.
  * **Chuẩn hóa DSL Artifact**: Tất cả tài liệu đặc tả được lưu trữ dưới dạng DSL Markdown/YAML chuẩn hóa (Artifact IR). AI Agent chỉ tương tác qua các skill quy chuẩn (`/spec`, `/grill`, `/legacy`, `/update-spec`, `/api-spec`, `/testcase:gen`). Agent không bao giờ được phép tự tiện suy đoán điền bừa các thông tin thiếu, mà bắt buộc phải qua bước Grill hoặc dùng Modal tương tác để chốt phương án với BA/Dev.
* **Tài liệu tham khảo chi tiết**:
  * 📖 [Quy trình Spec, Audit Script & Grill Workflow](./docs/1-guide/spec-grill-audit-workflow.md)
  * 📖 [Quy trình Khảo cổ Legacy & Common Discovery](./docs/1-guide/legacy-adoption-common-workflow.md)
  * 🧩 [Cấu trúc Bundle, Artifact IR & Manifest](./docs/3-artifacts/bundle-and-ir.md)

### 📌 1.2. Nền Tảng Single Source of Truth (SSOT)

* **Tại sao FlowGrid là SSOT tuyệt đối?**:
  * Mọi tri thức của dự án (từ Luồng nghiệp vụ, UI Wireframe, Contract API, Field Registry đến kịch bản Testcase E2E) đều hội tụ vào **một file Bundle YAML duy nhất** (ví dụ `backend-api.bundle.yaml` hoặc `*.bundle.yaml`).
  * Toàn bộ các artifact kỹ thuật về sau — bao gồm Frontend Prototype (Nuxt 4 / Vue 3), Backend Service (FastAPI / Node.js), DTO Schemas, Playwright E2E Testcases và Technical Architecture Docs — đều được bóc tách và sinh tự động (**Deterministic Codegen**) từ file Bundle SSOT này.
  * Khi có thay đổi nghiệp vụ, BA/Dev chỉ cần cập nhật file Spec SSOT và chạy lệnh đồng bộ. Loại bỏ hoàn toàn tình trạng tài liệu mô tả một đằng, code chạy một nẻo, hay testcase lệch với thực tế.
* **Tài liệu tham khảo chi tiết**:
  * 🛤️ [Tổng quan Pipeline Vòng đời Vận hành](./docs/2-lifecycle/overview.md)
  * 🏗️ [Luồng Phát triển Chi tiết cho Developer](./docs/2-lifecycle/development-flows.md)
  * 🧠 [Luồng Vận hành Backend & AI Integration](./docs/2-lifecycle/backend-workflow.md)

### 📊 1.3. Đánh Giá Vận Hành Kỹ Thuật Tổng Quan

| Tiêu chí Vận hành | Đánh giá Kỹ thuật Chi tiết |
|---|---|
| **Bảo vệ Kiến trúc & An toàn Codebase** | • Sử dụng bộ script kiểm định tĩnh (Static Audit Scripts) chạy 0-dependency với tham số `--type` độc lập.<br>• Loại bỏ hoàn toàn rủi ro AI tự suy đoán (Hallucination) hoặc tự bỏ sót các trường bắt buộc.<br>• Phân định rạch ròi giữa kiểm tra định lượng (Script) và kiểm định nội dung nghiệp vụ (Agent). |
| **Hỗ trợ Scrum Agile & T-Shaped Roles** | • Phá vỡ rào cản giao tiếp giữa PM, BA, Dev và QA thông qua ngôn ngữ đặc tả YAML/Markdown chuẩn hóa.<br>• Tự động ngắt chat khi khối lượng yêu cầu vượt quá ngưỡng 10 items (Law 2), chuyển sang cơ chế lập `common-plan.md` chia nhỏ theo Phase để review. |
| **Kiểm định Tự động & Bảo vệ Tech Debt** | • Tự động gắn tag các lỗ hổng kỹ thuật (`#missing_info`, `QA-item`, `[LEGACY_GAP]`).<br>• Tự động quét và phát hiện các mẫu code copy-paste từ dự án cũ để gom nhóm thành bộ thư viện dùng chung `CMN-*`. |

---

## 🏢 2. REVIEW CHI TIẾT THEO 3 CASE SỬ DỤNG THỰC TẾ

### 🟢 CASE 1: Phát Triển Mới Từ Đầu (Greenfield Project)
- **Đặc trưng**: Tốc độ phát triển cực nhanh | Độ chuẩn xác nghiệp vụ tối đa (99%).
- **Cơ chế Vận hành**:
  1. BA/PM sử dụng lệnh `/spec` để phác thảo màn hình ➔ Agent tự động nhận diện Page Type (`list`, `create`, `detail`, `admin-crud`, `auth`).
  2. Kích hoạt `audit-bundle-gaps.mjs --type <pageType>`: Tự động điền các trường required trong `gaps[]` và kích hoạt AskQuestion Modal cho các tùy chọn optional (`confirms[]`).
  3. Áp dụng **Zone-Based Multi-Turn Analysis**: Chia màn hình thành các Zone linh động (Header, Search Toolbar, Table/Form, Footer Actions) để phân tích sâu từng zone trong turn riêng lẻ.
  4. Dev thực hiện `/prototype` hoặc `/codegen` sinh code ➔ QA kích hoạt `/audit:testcase` để kiểm thử ma trận Boundary & Concurrency.

### 🟡 CASE 2: Dựa Trên Legacy Để Phát Triển Mới (Modernization / Re-Platforming)
- **Đặc trưng**: Độ an toàn kiến trúc rất cao | Bảo vệ hệ thống mới khỏi mã rác cũ.
- **Cơ chế Vận hành**:
  1. Kích hoạt lệnh `/adopt` ở chế độ **Common Analysis Mode**: AI quét toàn bộ cấu trúc code legacy (FE Router/Components + BE Services/Utils/DTOs).
  2. Tự động gom nhóm các đoạn code/UI lặp lại thành **Common Catalog Candidates (`CMN-UI-*`, `CMN-API-*`, `CMN-DTO-*`)**.
  3. Với trường hợp dev cũ nhân bản cả màn hình (ví dụ `CreateUser` vs `EditUser`), hệ thống phát cảnh báo **Whole Page Duplication Warning**, khuyến nghị gộp thành 1 Spec đa chế độ (`mode: create | edit`).
  4. Kích hoạt **Anti-Copy-Paste Guard**: Bắt buộc Dev/BA khi thiết kế màn mới phải tái sử dụng mã `CMN-*` trong Common Catalog, nghiêm cấm bê code lẻ tẻ từ dự án cũ.
  5. Áp dụng **2-Tier Legacy Audit**: 
     - *Tier 1 (Page-local)*: Rà soát validate nội bộ màn hình (`/legacy /spec`).
     - *Tier 2 (Cross-flow)*: Rà soát đứt đoạn quy trình và lệch schema giữa các màn hình (`/legacy /flow`).

### 🔵 CASE 3: Bảo Trì & Phát Triển Hệ Thống Cũ (Legacy Maintenance)
- **Đặc trưng**: Mức độ tương thích tuyệt đối với Tech Stack cũ.
- **Cơ chế Vận hành**:
  1. Khởi tạo dự án qua `flowgrid init` chọn profile **Custom / Existing Base**.
  2. Chỉ định **Golden Sample** (màn hình hình mẫu đẹp nhất của dự án cũ).
  3. Chạy `flowgrid build-template-code`: Hệ thống tự động bóc tách DNA dự án, học danh mục UI library (Element Plus, Ant Design, Vuetify...) và sinh `design.registry.json` kèm Lexicon tùy biến.
  4. Nạp Lexicon vào SQLite Local ArtifactGraph ➔ **Dập tắt hoàn toàn báo đỏ giả (`#needs-component`)**, cho phép sinh code bảo trì chuẩn phong cách dự án cũ mà không bị vỡ giao diện.

---

## 🎯 3. MÔ HÌNH NHÂN SỰ T-SHAPED AGILE & TƯƠNG TÁC CROSS-ROLE

Trong một đội ngũ Scrum Agile vận hành theo mô hình nhân sự **T-Shaped** (Thành viên có chuyên môn sâu một mảng nhưng có khả năng làm việc liên mảng), FlowGrid đóng vai trò là **chất kết dính giao tiếp**, loại bỏ hoàn toàn các điểm nghẽn (Siloed Bottlenecks):

```mermaid
mindmap
  root((FlowGrid Cross-Role Collaboration))
    PM Scrum Master
      Quản lý C4 Overview surfaces/
      Theo dõi tiến độ qua common-plan.md
      Kiểm soát khối lượng theo Law 2
    BA Business Analyst
      Đặc tả User Story 4-tier
      Khai báo Business Rules BR-*
      Xác định Handoff Target W-*
    Dev Developer
      Khảo cổ legacy /adopt
      Tái sử dụng CMN-* Common Catalog
      Sinh code chuẩn qua /codegen
    QA Quality Assurance
      Audit ma trận Testcases
      Kiểm tra Boundary & Concurrency
      Chạy E2E Playwright Assertions
```

### 🔄 Luồng Tương Tác Giữa Các Role Trong Sprint:

1. **PM / Scrum Master (Quản Lý Tiến Độ & Phạm Vi)**:
   - Theo dõi bức tranh tổng thể hệ thống qua cấu trúc C4 Architecture trong `/overview`.
   - Quản lý các đợt phát triển linh kiện dùng chung qua `common-plan.md`.
   - Được bảo vệ bởi **Law 2 (Workload Threshold)**: AI không bao giờ tự ý nghĩ ra quá 10 câu hỏi spam chat mà tự động đóng gói thành Plan chia Phase rõ ràng để PM duyệt.

2. **BA (Business Analyst - Đặc Tả Nghiệp Vụ)**:
   - Sử dụng lệnh `/spec` và `/flow` (`/business-process`) để tạo tài liệu đặc tả SSOT.
   - Nhận sự hỗ trợ từ Script Audit: Tự động gợi ý các kịch bản ngoại lệ 4-tier (`onBusinessErrors`, `onSecurityErrors`, `onSystemErrors`).

3. **Dev (Developer - Lập Trình & Tái Sử Dụng)**:
   - Đóng vai trò khảo cổ dự án cũ bằng `/adopt` và `/legacy /spec`.
   - Tận dụng triệt để bộ linh kiện **Common Catalog (`CMN-*`)** để sinh code nhanh thông qua `/codegen` mà không cần viết lại từ đầu.
   - Kiểm tra phản biện thiết kế trước khi gõ code thông qua lệnh `/grill-dev`.

4. **QA (Quality Assurance - Thẩm Định & Kiểm Thử)**:
   - Chạy lệnh `pnpm run audit:testcase` để đảm bảo 100% kịch bản kiểm thử đã bao phủ các kịch bản khởi tạo (Initial Load), Thẩm định form (Validation), Nộp thành công (Happy Path), Ngoại lệ 5xx/409, Ma trận giá trị biên (Boundary Analysis) và Phân quyền RBAC.

### 💡 Giải Quyết Bài Toán Điểm Nghẽn Nhân Sự (Cross-Role Synergy):
- **Khi BA quá tải**: Dev có thể gõ `/spec` thô, Script Audit sẽ tự động chỉ ra các trường thiếu để Dev bổ sung theo đúng chuẩn BA.
- **Khi Dev cần verify nghiệp vụ**: Dev chạy `/grill-dev`, AI Agent sẽ đóng vai BA/QA để phản biện từng Zone của màn hình.
- **Khi QA cần viết E2E Test**: QA dựa trực tiếp vào file Spec YAML đã được gắn sẵn TestIDs và Semantic Assertions để tự động sinh mã kiểm thử Playwright.

---

## 🔍 4. ĐỊNH HƯỚNG PHÁT TRIỂN TƯƠNG LAI (FUTURE ROADMAP)

Để tiếp tục nâng cao hiệu quả vận hành cho các đội ngũ phần mềm enterprise, lộ trình phát triển tiếp theo của FlowGrid tập trung vào 2 tính năng trọng tâm:

1. **📊 Metrics Dashboard CLI (`flowgrid metrics`)**:
   - Tự động thống kê và xuất báo cáo chỉ số tái sử dụng Common Code.
   - Đo lường mức độ giảm thiểu Tech Debt và tỷ lệ % bao phủ linh kiện `CMN-*` giữa các dự án.

2. **🖼️ Visual Regression Diff cho Legacy Archaeology**:
   - Tích hợp công cụ so sánh trực quan giao diện UI giữa hệ thống cũ (Legacy) và bản thiết kế mới (Prototype).
   - Tự động phát hiện các điểm sai lệch về bố cục, màu sắc và typography ngay ở giai đoạn Đặc tả.

---

## 📚 5. TÀI LIỆU CHI TIẾT & HƯỚNG DẪN VẬN HÀNH

Toàn bộ thông tin hướng dẫn chuyên sâu đã được phân tách thành các cuốn Sổ tay SSOT:

1. 👉 **[Hướng dẫn Quét Khảo cổ Legacy & Đề xuất Common Catalog](./docs/1-guide/legacy-adoption-common-workflow.md)**
2. 👉 **[Hướng dẫn Quy trình Spec, Audit Script & Grill cho Dự án mới](./docs/1-guide/spec-grill-audit-workflow.md)**
3. 👉 **[Sổ tay Hướng dẫn Dự án Custom Base / Maintain](./docs/1-guide/custom-base-workflow.md)**
4. 👉 **[Danh mục Mục lục Tài liệu Hệ thống (CATALOG.md)](./CATALOG.md)**

---

## ⚡ Cài Đặt Nhanh (One-Liner)

Dành cho Linux / WSL. Yêu cầu hệ thống: `Node.js >= 22` và `git`.

```bash
curl -fsSL https://raw.githubusercontent.com/ShanYuCoder/flowgrid/main/install.sh | bash
```

---

**🔥 Dành cho Đội ngũ Phần mềm:** Mọi thứ đã được chuẩn hóa khép kín. Hãy cài đặt FlowGrid ngay hôm nay để trải nghiệm quy trình AI Engineering kỷ luật và hiện đại!
