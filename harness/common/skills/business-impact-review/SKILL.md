---
name: business-impact-review
description: Đánh giá bán kính ảnh hưởng (Blast-radius) toàn diện xuyên suốt các kho lưu trữ (Cross-repo) và các phân hệ (Cross-surface).
disable-model-invocation: true
---

# /business-impact-review

Read-only analysis by default. Do not implement fixes unless explicitly asked.

**Owner:** Common Hub (Cross-Boundary Inspector)

## Checkout resolution

Cross-repo callers/callees:

| System id | Map |
|-----------|-----|
| `legacy-*` | `legacy-repos.local.json` |
| Otherwise | `platform-repos.local.json` |

Missing/empty map or missing key → **Gaps** + **`/configure-repo-maps`**; never
guess paths. Then remind `platform-dna codegraph:wire` if needed. Ambiguous
matches → ask or Gaps.

## Workflow

1. Scope changed public/protected methods, routes, Jobs, Events, Listeners,
   Commands and Schedules from diff/user files.
2. **[CRITICAL] Phân tích chéo (Cross-Boundary Analysis):**
   - **Cross-repo (FE ↔ BE):** Quét toàn bộ các nhánh FE/Mobile đang gọi API bị thay đổi để đảm bảo contract (payload/response) không bị gãy.
   - **Cross-surface (BE Surface A ↔ BE Surface B):** Truy vết các Event, Job, DB Schema để xem các Listener/Consumer ở Surface khác có bị side-effect làm sập hệ thống không.
3. Trace each reachable vertical path:

```text
Client/FE or Scheduler/Webhook
  → route/command/job
  → auth/middleware/context rewrite
  → controller/handler
  → service/domain
  → repository/model/database
  → event/listener/job/external API
  → response/error/status mapping
  → FE/consumer/next async hop
```

4. Apply `risk-classes.md`: authZ/IDOR, request bag, trust boundary,
   over-broad parse, null/empty, error collapsing, hardcode/magic,
   async context/idempotency, business rules, transactions and compatibility.
5. Yêu cầu dùng CodeGraph (`codegraph-<key>`) và ArtifactGraph theo chuẩn Đạo luật 8 để nhảy repo.

## Required report

```text
Summary / ship recommendation
Changed symbols
Horizontal callers
Vertical process paths
Cross-Boundary Impact (FE/BE & Surfaces)  <-- BẮT BUỘC BÁO CÁO TƯỜNG MINH
Findings: severity · class · evidence · impact · verify
Unsearched repos / residual risks
Targeted test plan
```

## Accelerators (optional)

Route per intent (rule `cross-repo-index.mdc`): never one merged
workspace graph — always the correct per-repo index.

```text
if CodeGraph available: changed symbols + callers + call graph — for repo X use
  its own server `codegraph-<key>` (--project-root = X's checkout), never the
  open repo's index; unindexed repo → report `cd <root> && codegraph init`
else: targeted repository search/read

if Docskit available: map process steps to CMP/CTR/FLOW docs via DOCSKIT_ROOT
  (never CodeGraph for architecture Markdown)
else: repository conventions/search

IR / registry / generation questions → pointer kits
  (CODEGENKIT_DOCS_ROOT, TESTKIT_DOCS_ROOT, TESTKIT_TESTS_ROOT)

if ArtifactGraph available: affected tags/registries/parity
  (local-only — never a shared index for other repos)
else: model review from scoped evidence
```

Missing accelerators never block the review. Assign one stable `runId` at run
start. Report only actual `fileReads` and `contextBytes`, never invented token claims.
