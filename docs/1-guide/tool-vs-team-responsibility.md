# FlowGrid — phạm vi tool vs trách nhiệm team

FlowGrid **hỗ trợ** team T-shaped (BA / QA / Dev cross) tạo artifact IT chất lượng. Tool **không** thay người grill, review, hay chịu trách nhiệm chính khi release lọt bug do bỏ bước hoặc làm sơ.

Xem thêm: [Artifact completeness roadmap](./artifact-completeness-roadmap.md) · [Spec / grill / audit workflow](./spec-grill-audit-workflow.md)

---

## 1. Triết lý một câu

**Tool cung cấp SSOT, skill, audit/gate có mã lỗi và đường gen E2E — team chọn chạy đúng luồng, review gap, và chốt quyết định.**

---

## 2. Tool chịu trách nhiệm (product scope)

| Vai trò | FlowGrid cung cấp |
|--------|-------------------|
| **Luồng tạo mới / CR** | Skills: `/spec`, `/grill-bqa`, `/grill-dev`, `/update-spec`, `/api-update`, `/testcase`, `/grill-testcase`, … — thứ tự và load/write policy |
| **Grill & gap** | `flowgrid audit spec` (`gaps[]`, `confirms[]`, `UX_*`), `audit fe-be`, `audit flow`, … — output JSON deterministic |
| **Delta an toàn** | `/update-spec`: re-audit spec, sync checklist `userStories` ↔ `design` / `spec.ui` |
| **Test SSOT** | `cases/**/TC-*.yaml` `schemaVersion: 2`, `testMatrix` facet, `traceability` |
| **Đo / cảnh báo lọt case** | `flowgrid cases:gate`, `audit testcase --bundle`, `audit scenario` — mã lỗi + `suggestedFix` cho **người** review |
| **E2E Playwright (IT)** | `testcase:gen`, `e2e-registry`, contract `testIds` / matrix — **hỗ trợ** sinh spec từ plan, không tự viết nghiệp vụ |

Tool **không** cam kết: zero bug release, coverage 100% assertion đúng nghiệp vụ, hay an toàn khi member cố ý bỏ qua skill/audit.

---

## 3. Team / member chịu trách nhiệm (out of product scope)

| Tình huống | Ai chịu trách nhiệm |
|------------|---------------------|
| Không chạy grill / audit khi skill bắt buộc | Member + lead review |
| `/update-spec` xong nhưng **không** cập nhật TC / traceability | Author CR + QA |
| Chạy `cases:gate` nhưng **không đọc** JSON gap, merge “cho có” | Reviewer |
| Matrix / steps / assert Playwright sơ sài | Author test + grill-test |
| **Một vòng manual E2E** trước release (chống degrade, cảm nhận UX) | QA / BA — **policy release**, không encode bắt buộc trong toolkit |
| Deploy, CI, sprint board, ALM | DevOps / PM — **không** thuộc FlowGrid product |
| PM sketch nhanh 3–5 phút không qua full spec | Được — sau đó `/spec` hoặc `/update-spec` khi vào SSOT |

**Ví dụ CR:** Bước 1 `/update-spec` (có grill/audit trong skill) → Bước 2 cập nhật `TC-*.yaml` + `cases:gate --strict`. Member quên một bước hoặc tick checklist không review gap → **lọt bug là do process người**, không phải thiếu engine.

---

## 4. Luồng tham chiếu (khi team **muốn** làm đúng)

### Tạo mới function / màn

```text
/spec → flowgrid audit spec → grill-bqa / grill-dev → split
→ /testcase (bundle SSOT, schema v2, traceability)
→ flowgrid cases:gate [--strict] + FLOWGRID_DOCS_ROOT
→ testcase:gen → Playwright IT (FE repo)
→ (policy team) manual E2E một vòng trước release
```

### Change request (update spec)

```text
/update-spec → flowgrid audit spec (mandatory trong skill) → split
→ patch TC cùng W-* / bundle impact
→ flowgrid cases:gate --strict --docs-root …
→ /grill-testcase (đọc gate / audit output)
→ gen + IT + manual E2E (policy team)
```

Tool **không** tự kích hoạt các bước khi member không gọi skill hoặc CLI.

---

## 5. Công cụ phân tích rủi ro (human-in-the-loop)

| Lệnh | Cảnh báo | Người quyết định |
|------|----------|------------------|
| `flowgrid audit spec` | Thiếu cấu trúc, UX affordance | BQA / Dev grill |
| `flowgrid cases:gate` | Schema, matrix facet, trace bundle, SC coverage | QA / grill-testcase |
| `flowgrid audit testcase --bundle` | Scenario / AC / action chưa map | Author TC |
| `flowgrid audit scenario` | `screens[]` chưa có TC | Owner cross-flow |

Output `--json` dùng cho **review và sign-off**, không thay thế judgment “đủ hay chưa cho release”.

---

## 6. E2E automation vs manual IT

| Lớp | Mục đích | Tool |
|-----|----------|------|
| **Plan SSOT** | Matrix, steps, testIds, trace bundle | Tests hub YAML + gate |
| **Generated IT** | Regression tự động trên FE | `testcase:gen`, Playwright |
| **Manual E2E một vòng** | Phát hiện degrade / UX / ngữ cảnh | **Team policy** — ngoài phạm vi bắt buộc toolkit |

Playwright chứng minh **code chạy theo plan đã author**; chất lượng plan và việc **có author đúng sau CR** vẫn là người.

---

## 7. Explicitly out of scope (FlowGrid product)

- Pipeline deploy, GitHub Actions, gate merge tự động (DevOps tự gắn `cases:gate` nếu muốn — xem Phase E roadmap như **gợi ý**, không phải deliverable bắt buộc).
- Theo dõi compliance “ai quên grill”.
- ALM / Jira / sprint / hotfix lane.
- Bắt PM qua full BQA trước UI sketch nhanh.
- Dashboard legacy parity đầy đủ (chỉ inventory + deep-dive khi làm W-*).

---

## 8. Liên kết kỹ thuật

| Artifact | Doc / path |
|----------|------------|
| Test gate | `engines/cases/gate.mjs`, `flowgrid cases:gate` |
| TC schema v2 | `schemas/testcase.schema.json`, `harness/tests/templates/TC.example.yaml` |
| Skills | `harness/docs/skills/`, `harness/tests/skills/` |
| CLI | [cli-and-commands.md](../6-reference/cli-and-commands.md) |
