---
name: spec
extractBundle: spec-requirement
description: EXCLUSIVE /spec — ONLY for authoring design bundle (feature.bundle.yaml). DO NOT trigger for grill or testcase skills.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. **STRICTLY FORBIDDEN** to rely on memory.
> **[MANDATORY]** Read `.flowgrid/templates/feature.bundle.yaml` + `.flowgrid/templates/bundle-authoring.md` BEFORE generating any YAML.
> If templates are missing → STOP: *"Template missing. Run `flowgrid init` to generate templates."*
> Physical interlocks: `AGENTS.md` + `SSOT_AGENT_PROTOCOL.md` (Laws 1–7). Chat-only done = **FAILED**.

# /spec — Function detail (design)

**Mindset:** Author a **complete** bundle from the template when information exists. Build a **dynamic** `design.sections[]` tree for that page; leaf controls in `items[]`. Do **not** copy a login (or any) sample as the default layout.

**Business layer:** Screen `W-*` / API `API-*` inside a module. **Standards:** C4 only (no new arc42 chapters per screen).

---

## Rule: Missing Information Handling & Workload Threshold (Law 2)

- **[MANDATORY]** When required fields are absent from user prompt or context, evaluate total missing items:
  - **Small Scope (≤5 gaps):** Run `AskQuestion` wizard — **one question at a time**, **≥3 options**: (1) `(Recommended)`, (2) Alternative, (3) `Log as Tech Debt (Pending)`. Show next question only after member answers current one.
  - **Large Scope (≥10 gaps OR multi-screen scope):** **[MANDATORY HARD STOP IN CHAT]**. Do not spam single questions in chat. Generate an implementation plan / Plan Mode document partitioned into Phases (3–5 questions/fields per phase) to prevent session token overflow.
  - ❌ Never invent, assume, or silently skip missing fields.
- **[MANDATORY]** If member chooses "Log as Tech Debt" → create `qa/open/QA-<page-id>-NNNN.yaml` + tag `#missing_info QA-…`. Do not block on it.
- **[RECOMMENDED]** Brainstorm business text (context, input, output, screen descriptions) proactively in Vietnamese for Non-tech audience — do not wait to be told.

---

## Rule: Page Type Detection

- **[MANDATORY]** Before running audit or bundle generation, the Agent **MUST** detect the page type:
  - Read `gen.codegen.profile` inside existing bundle (if present).
  - OR infer from prompt keywords:
    - "list", "table", "danh sách" → `list`
    - "form", "create", "new", "tạo mới" → `create`
    - "detail", "view", "chi tiết" → `detail`
    - "login", "auth", "đăng nhập" → `auth`
    - "CRUD", "management", "quản lý" → `admin-crud`
  - The detected page type is passed to: `--type` audit script parameter + zone-based analysis partitioning.

---

## Rule: Audit Interlock

- **[MANDATORY]** If bundle file already exists: run `flowgrid audit spec <path-to-bundle.yaml> --type <pageType>` first.
  - `<pageType>` = page type đã xác định ở bước trên (list | create | detail | admin-crud | auth | ...).
  - Script output:
    - `gaps[]` → required fields missing → Agent patches bundle directly.
    - `confirms[]` → optional / UX (`category: ux`, codes `UX_*`, `CONFIRM_UX_*`) → AskQuestion; `(Recommended)` must match audit option text or `flowgrid-ux-common` checklist proposals.
    - Summary fields: `uxAffordanceGaps`, `uxAffordanceConfirms`.
  - **Threshold Interlock (Law 2):** If audit script outputs ≥10 gaps + confirms, HALT chat wizard immediately → create an implementation plan / Plan Mode document partitioned into sequential phases.
  - ❌ Do not skip audit and proceed to authoring directly.
  - ❌ Do not run audit without `--type` parameter.

---

## Rule: Common Catalog Reuse (Anti-Copy-Paste Guard)

- **[MANDATORY]** When authoring or updating specs (`/spec`, `/legacy /spec`), Agent **MUST inspect Section 5 (Common Catalog Candidates)** inside `adoption-inventory.md` (if present).
- **[ANTI-COPY-PASTE ENFORCEMENT]**: 
  - If the new feature or screen uses UI Controls, API Handlers, or DTOs already defined in the Common Catalog (`CMN-UI-*`, `CMN-API-*`, `CMN-DTO-*`), the Agent **MUST reference and inherit these Common codes/specs**.
  - **STRICTLY FORBIDDEN to copy-paste legacy code/specs into isolated new classes/files** in the new project.

---

## Rule: Target / ID Resolution

- **[MANDATORY]** Resolve screen ID, module ID, slug, or Draft ID before generating any file.
  - Draft ID `1-1-2` → pad each segment → `01/01/02/`
  - Bundle ID: module prefix + padded segments, e.g. `CMP-ADM-002` + `02-01-02` → `page-id: cmp-adm-002-02-01-02`
- **[MANDATORY]** Search for input `.md` file at resolved path. If found, read it as primary requirement source — do NOT say "I cannot hallucinate" or ask user for input that is already present.
- **[STRICTLY FORBIDDEN]** Do NOT demand full filesystem path from user when ID or slug is given.

---

## Rule: Load Policy

- **[MANDATORY]** Write the **entire** `*.bundle.yaml` (authoring SSOT).
- **[MANDATORY]** After split exists: re-read **entire** `ir/design.yaml` + `ir/spec.yaml`; do not skim partial keys.
- **[STRICTLY FORBIDDEN]** Do NOT read generated `*.md` files.

---

## Workflow

1. Confirm `CMP-*` exists and `CTR-*` is identified — otherwise stop for lead/owner.
2. Detect page type from prompt or existing bundle's `codegen.profile`.
3. Run audit: `flowgrid audit spec <bundle> --type <pageType>` (if bundle exists).
4. Process audit output: fill `gaps[]` directly; ask member about `confirms[]` via wizard.
5. **Zone-based multi-turn authoring** (see rule below): chia page thành zones, phân tích từng zone trong turn riêng.
6. Write/update `*.bundle.yaml` with `specOrigin: requirement`.
7. Apply **existing** common/DSL extracts (consume only — promote via `/common-spec`).
8. Run `pnpm docs:split -- <bundle>` → `pnpm docs:render` (design MD only).
9. Update `.harness/progress.md`.
10. Handoff → `/testcase` from acceptance criteria.

---

## Rule: Zone-Based Multi-Turn Analysis (anti lost-in-middle)

- **[MANDATORY]** Do not analyze and write the full page in a single turn.
- **[MANDATORY]** Split the page into **dynamic zones** from the real bundle content (not a fixed template). Examples: HEADER (title, breadcrumb, summary), CONTENT slices (toolbar, table, form groups), FOOTER/ACTIONS (pagination, stateMatrix, outcomes).
- **[MANDATORY]** If one zone is too large (>5 fields, >3 sections, >2 relationships) → split into sub-zones.

### Per-zone pipeline (DSL first, then UX gaps)

Each zone turn — **in order**:

1. Announce zone name (e.g. `Zone CONTENT: toolbar + table`).
2. **DSL / registry pass:** Match controls to `design.registry.json` (when present), common catalog, `#shell:`, `#pattern:`, `#ui:`, `#widget:`. Write matched structure into `*.bundle.yaml` for this zone.
3. **Unmapped structure:** Shadcn primitive → `#ui: <Primitive>`. ≥2 domain structural blocks → `#needs-component: MoBlockName`. Unknown widget → `#needs-ui:` (never invent primitive names). See **Common Pattern Resolution** below.
4. **Affordance gaps** (still unmapped or thin spec): apply **`flowgrid-ux-common.mdc`** + `.cursor/extracts/ux-common-patterns.md` — only **Recognize / Propose** checklist items that apply; use the rule’s proposal output format. No open-ended UX brainstorming.
5. **Member decisions:** `confirms[]` from audit + any checklist-derived proposals → `AskQuestion` wizard — one question at a time, ≥3 options: `(Recommended)` = top structured proposal from steps 3–4, Alternative, `Log as Tech Debt (Pending)` (Law 2).
6. Persist zone YAML; update matching **`userStories.scenarios` steps** and **`acceptanceCriteria`** (Vietnamese business prose) for the same affordance — see `bundle-authoring.md` § UX affordance ↔ userStories.
7. Proceed to next zone.

- **[STRICTLY FORBIDDEN]** All-in-one zone dumps. Redundant YAML for patterns already covered by DSL. AskQuestion options not grounded in DSL mapping, audit output, or UX checklists. **Tech-only `design` patches without `userStories` sync before split.**

---

## Rule: Content Requirements per Section

### Rule: User Stories (`userStories`)
- **[MANDATORY]** Generate complete `primary` (asA, iWant, soThat), `contextAndHandoff`, `scenarios` (5 core + **6th “Affordances UX”** when delete/filter/breadcrumb/disabled/import apply), `acceptanceCriteria` (include UX AC lines from template when applicable).
- **[MANDATORY]** After resolving audit `UX_*` gaps or `CONFIRM_UX_*` answers: mirror behavior in `userStories` (use `suggestedStoryPatch` from audit JSON when present).
- **[MANDATORY]** `contextAndHandoff.screenAccess` MUST be one of: `directRoute` | `sidebarMenu` | `contextualAction`.
- **[MANDATORY]** 5 scenarios: (1) Initial data load, (2) Input entry & Form validation errors, (3) Successful submission, (4) Exception handling / UI error states, (5) Background operations (if applicable). All descriptive texts generated for user consumption MUST be in clear Vietnamese.

### Rule: Meaning vs Purpose
- **[MANDATORY]** Every section, item, column, filter, action MUST declare both:
  - `meaning`: Business essence / meaning (value delivered, which workflow it impacts).
  - `purpose`: Interaction purpose (what user does with this control on the UI).
  - ✅ `meaning: "Xác nhận danh tính thành viên"` / `purpose: "Nhập email đăng nhập"`
  - ❌ `meaning: "Email field"` — too generic; not business-meaningful.

### Rule: UI Section Attributes & Custom Component Deep-Grill
- **Reusable / Base Components (Shadcn UI & Base Kit):**
  - If a component/section uses an existing base component or Shadcn primitive:
    - Declare `primitive`: Shadcn tag (`#ui: Card`, `#ui: Form`, `#ui: Table`, `#ui: Dialog`, `#ui: Select`, `#ui: Input`, `#ui: Badge`, …).
    - Declare `visual.colorToken` (e.g. `#common:card-surface`, `#common:primary`) and standard Tailwind layout classes.
- **New / Custom Non-standard UI Blocks (`custom` / Novel Widgets):**
  - **[MANDATORY DEEP-GRILL INTERLOCK]**: Whenever a UI section or component is novel, custom, or not in the standard base library, the Agent **STRICTLY FORBIDDEN** from leaving vague descriptions. The Agent MUST deeply drill down and specify:
    1. **`customWidgetType`**: Exact functional archetype (e.g. `interactive-timeline`, `kanban-lane`, `drag-drop-uploader`, `signature-pad`).
    2. **Dimension & Geometry Specifications**: Explicit width, height, min/max constraints, aspect ratio, responsive breakpoints (`mobileBreakpoints`, `desktopLayout`).
    3. **Color & Surface Palette**: Exact token hierarchy — `backgroundToken`, `borderToken`, `accentToken`, `hoverStateColor`, `activeStateColor`, and dark/light contrast semantics.
    4. **Typography & Text Metrics**: Header hierarchy (`h1`-`h6`), font-weight, line-height, text truncation behavior (`truncate`, `line-clamp-2`).
    5. **Micro-Interactions & States**: Loading skeleton structure, empty/error state UI, hover transition curves, and disabled visual opacity.
- **[PROACTIVE OPTIONS ONLY]**: Novel custom blocks without dimensions/colors → propose 2–3 concrete specs (design tokens) via `AskQuestion`; `(Recommended)` must be one of those specs — not vague “how should this look?” prompts. Affordance gaps (breadcrumb, delete feedback, disabled reason, …) → `flowgrid-ux-common.mdc` checklists, not ad-hoc UX ideas.

### Rule: Dynamic 5-Tier Validation & Messages
- **[MANDATORY]** Never accept superficial `validation: { required: true }`. The Agent **MUST proactively brainstorm and specify** the full 5-tier validation profile for all form fields:
  1. **Prototype format:** Assign standard presets (`email`, `phone_vn`, `tax_code`, `slug_uppercase`, `currency_vnd`, `date_range`, `password_strong`).
  2. **Boundary limits:** Explicit `min` / `max` length or numeric values.
  3. **Conditional & Cross-field dependencies:** Declare `conditionalRules` (`requiredWhen`, `disabledWhen`, `greaterThan`).
  4. **Remote / Async verification:** Declare `remoteCheck` for unique DB constraints (endpoint, trigger `onBlur`, debounce, params).
  5. **Explicit Vietnamese error copy:** Every single rule MUST declare its exact human-readable error message.
- **[PROACTIVE AI BRAINSTORMING INTERLOCK]**: When user inputs are sparse, the Agent **STRICTLY FORBIDDEN** from leaving fields minimally validated. The Agent MUST actively infer and propose realistic validation rules and confirm with user via Wizard options.

### Rule: Action Flow Specification (6 Mandatory Technical Blocks)
- **[MANDATORY]** Every mutation/submit button MUST specify all 6 technical blocks:
  1. `preconditions`: UI form validity, record lifecycle status (`record.status in [...]`), required RBAC permissions, and `disabledReason`.
  2. `interactionControl`: `preventDoubleSubmit: true` (immediate button lock), `debounceMs`, `loadingIndicator` text, and `confirmDialog` (for destructive actions).
  3. `payloadTransformation`: String trimming, XSS sanitation, and type casting rules (e.g. currency string $\to$ integer).
  4. `executionContract`: Target `apiRef`, HTTP method, `idempotencyKey` header, timeout SLA, and concurrency strategy (`optimistic_locking`).
  5. `outcomes`: 4-tier matrix:
     - `onSuccess`: Toast copy, navigation target, background event dispatch.
     - `onBusinessErrors` (422, 409): Field-level inline error mapping and duplicate warnings.
     - `onSecurityErrors` (401, 403): Session expiry localStorage preservation and IDOR safety redirects.
     - `onSystemErrors` (500, 504, Client Offline): Timeout resubmit lock, offline data preservation banner.
  6. `stateMatrix`: Link action behavior with screen record status and role permission visibility.
- **[STRICTLY FORBIDDEN]** Do NOT skip concurrency, double-submit protection, or network timeout handling.

### Rule: Layout Structure
- **[MANDATORY]** Map every visible control into nested `design.sections[]` (or flat `zones[]`).
- **[MANDATORY]** App pages: declare `design.nav.sidebar.levels` + breadcrumb.
- **[MANDATORY]** API endpoints → `/api-spec` (not `spec.api` on this bundle).

---

## Rule: Common Pattern Resolution (DSL consume)

- **[MANDATORY]** Before authoring each zone: scan upward `common/yaml/` (function → module → cluster → surface → global); read `templates/shared/patterns/*.pattern.yaml`; match `design.registry.json` when the FE checkout pointer exists.
- **[MANDATORY]** Tag from structural cues only (never invented business fields):
  - `>8 columns` → `#split-hook:columns`; `>3 filters` → `#split-hook:filters`; export → `#split-hook:export`; form >6 fields → `#split-hook:form-sections`
  - `≥2 domain structural blocks` → `#needs-component: MoBlockName` (NOT shadcn primitives)
  - Delete → `#pattern: delete-flow`; list/table → `#pattern: CRUD`; confirm/overwrite → `common-confirm-dialog`
- **[MANDATORY]** Inject resolved patterns into `design.patterns[]` and zone `items[]` with `#ui:` / `#widget:` as applicable.
- **[STRICTLY FORBIDDEN]** Tag shadcn primitives as `#needs-component`. Duplicate full common IR into the screen bundle when DSL already covers the widget.

---

## Rule: YAML Authoring Safety

- **[MANDATORY]** Output MUST be `*.bundle.yaml`. Do NOT write `.md` directly — Markdown is generated by `pnpm docs:split`.
- **[MANDATORY]** All strings with `:`, `[]`, or leading symbols MUST be double-quoted or use YAML block scalar (`|`).
  - ✅ `summary: "Màn hình: Đăng nhập hệ thống"`
  - ❌ `summary: Màn hình: Đăng nhập`
- **[MANDATORY]** File path: `surfaces/<surface>/CMP-*/<NN>/<NN>/<NN>/<slug>.bundle.yaml` (numeric segments, no text in path).

---

## Modifiers

### `/legacy` modifier
- **[MANDATORY]** Lookup `adoption-inventory.md` at workspace root. If missing → STOP: *"Run `/docs-hub /adopt` first."*
- **[MANDATORY]** Set `specOrigin: legacy`; use legacy source path from inventory mapping.
- **[STRICTLY FORBIDDEN]** Do NOT read `adoption-inventory.md` for Greenfield (non-legacy) commands.

---

## Tools

- `flowgrid_docs_bundle_split` / `flowgrid split -- <bundle>` (prefer MCP when installed)
- `docs_render` / `flowgrid render …`
- Local fallback: `pnpm docs:split` · `pnpm docs:render`

---

## Verification Checklist

- [ ] Module `CMP-*` confirmed; `CTR-*` identified.
- [ ] Audit script run (if bundle existed); all gaps resolved or QA-tagged.
- [ ] `userStories`: 5 scenarios + `screenAccess` typed + `acceptanceCriteria` present.
- [ ] `meaning` + `purpose` on every section, item, column, action.
- [ ] Shadcn `primitive` + `visual.className` + `states` on every `design.sections[]` block.
- [ ] Dynamic 5-Tier Validator: `prototype`, boundaries (`min`/`max`), regex/format, `conditionalRules`, `remoteCheck` DB unique.
- [ ] `validation.messages` in Vietnamese on every validated field (no vague error text).
- [ ] `stateMatrix` defined: Record Status ↔ Fields State ↔ Visible Buttons ↔ RBAC Overrides.
- [ ] 6-Block Action Flows specified: Preconditions, Interaction Lock (Double-submit), Payload Transform, API Contract, 4-Tier Outcomes Matrix (Success, 422/409, 401/403, 500/504/Offline).
- [ ] Custom UI Blocks: Dimensions, Palette semantic tokens, Typography, and Micro-interactions defined if novel.
- [ ] Common patterns tagged in `design.patterns[]`; DSL-mapped zones written; `#needs-component` / `#needs-ui` only where registry/common does not cover.
- [ ] UX gap questions used checklist-backed `(Recommended)` options (`flowgrid-ux-common.mdc`), not open brainstorming.
- [ ] `userStories` scenarios/AC reflect UX affordances patched in `design` (incl. audit `suggestedStoryPatch`).
- [ ] YAML strings with `:` or `[]` are double-quoted. No `.md` written by hand.
- [ ] `pnpm docs:split` + `pnpm docs:render` run with zero errors; rendered `spec.md` verified clean of raw YAML dumps.
- [ ] Handoff → `/testcase` created.
