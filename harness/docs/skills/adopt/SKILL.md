---
name: adopt
description: "/adopt — Scan legacy repositories and generate a high-level index mapping catalog & common candidates at root."
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /adopt — Legacy Adoption Index & Common Discovery

**Audit Interlock:** Run `flowgrid audit legacy <target-id>`. Consume JSON gap report to verify mapping or prompt member if index is missing.

---

## Rule: Pre-Scan Mode Selection (AskQuestion Wizard)

- **[MANDATORY]** At the start of `/adopt`, the Agent **MUST** prompt the Member via `AskQuestion` wizard (or read from command flags) to select the scan mode:
  - **Option 1 (Recommended):** `(Recommended) Scan Index + Analyze & Propose Common Catalog (Auto-detect code duplication, propose Common UI/API/DTO candidates to prevent copy-pasting in new system)`
  - **Option 2:** `Index Only (Basic adoption-inventory.md mapping)`

---

## Rule: Purpose & Output

- **[MANDATORY]** Output: single `adoption-inventory.md` file created directly at workspace root.
- **[MANDATORY]** Content: clean bullet-point index mapping surfaces, modules, screens, APIs to legacy file paths.
- **[MANDATORY when Common Mode selected]**: Include **Common Catalog Candidates (`CMN-*`)** section capturing duplicated code/UI patterns caused by legacy copy-pasting habits.
- **[STRICTLY FORBIDDEN]** Do NOT generate full spec details, diagrams, or tables inside inventory file. This is a reference index & common catalog map.

---

## Rule: Common Discovery & Anti-Copy-Paste Guard

- **[MANDATORY when Common Mode selected]**: During legacy code scan across routers, controllers, view components, and services, the Agent **MUST analyze and detect duplicate patterns**:
  1. **UI Commons (`CMN-UI-*`)**: UI patterns duplicated across screens (e.g. Search Filter Toolbar, Bulk Action Bar, Status Badge Pill, Confirmation Modal, DateRangePicker, Address Cascader...).
  2. **API/Service Commons (`CMN-API-*`)**: Controller/Service logic duplicated across endpoints (e.g. Audit Logging Interceptor, Paging/Sorting Wrapper, Excel Export Engine, Custom Exception Handler, JWT Token Resolver...).
  3. **DTO/Data Commons (`CMN-DTO-*`)**: Duplicated DTOs/Entities (e.g. BaseAuditableEntity, AddressDTO, UserSessionHeader, StandardApiResponse...).
- **[ANTI-COPY-PASTE GUARD - NEW DEVELOPMENT]**:
  - Legacy code remains untouched unless explicitly requested.
  - When creating new specs or developing new features (`/spec`, `/codegen`), **STRICTLY FORBIDDEN to copy-paste legacy code/specs into isolated new files**.
  - Agent & Member **MUST reference and inherit `CMN-*` entries from the Common Catalog** to author reusable Common Specs and Common Code for the new project.
- **[EXCEPTION - WHOLE PAGE DUPLICATION HANDLER]**:
  - If 2 or more page files are near-identical whole-file copies (e.g. `CreateUser.tsx` vs `EditUser.tsx` or duplicated CRUD forms):
  - ❌ **DO NOT CREATE a `CMN-*` ID for an entire page** (building a common component for a full page is over-engineered anti-pattern).
  - ✅ **LOG A WARNING** in `adoption-inventory.md` under `### Whole Page Duplication Warnings`.
  - Recommend combining them into a single polymorphic spec (`mode: create | edit`) during `/spec` authoring.

---

## Rule: Common Implementation Plan & Execution Pipeline

- **[MANDATORY when Common Candidates volume is high (≥5 items)]**:
  - Agent **MUST** create a `common-plan.md` at workspace root, partitioning all `CMN-*` items into **manageable execution Phases (3–5 common candidates per phase)** for member approval.
- **[3-Step Standard Execution Pipeline per Common Candidate]**:
  - For each approved `CMN-*` item in the plan, Agent executes a closed-loop 3-step pipeline:
    1. **Step 1: Common Spec (`common-spec`)**: Generate standardized Spec document (`common/specs/CMN-*.yaml` or `.md`), defining Props, Inputs/Outputs, Exception handling, and DSL Contract.
    2. **Step 2: Common Code Generation (`codegen common`)**: Generate production code inside the new project's shared/common directory (`shared/components/`, `shared/services/`, `shared/utils/`).
    3. **Step 3: DSL Registration**: Register `CMN-*` into FlowGrid DSL Registry. When generating specs or code for any future screen using this feature, Codegen Engine **automatically links & imports Common Code** without code duplication.

---

## Rule: Scan Sources

- **[MANDATORY]** Read repo list from `legacy-repos.local.json` (or `core-repos.local.json` / `platform-repos.local.json`).
- **[MANDATORY]** If called with scope (e.g. `/adopt "Customer App"` or `/adopt admin-fe`) → scan only that app/module.
- **[MANDATORY]** Scan: Router, Controllers, View/Page Components, Service Interfaces to extract:
  - **Surfaces**: Application and channel names (Admin Portal, Customer Web, Gateway…)
  - **Modules (`CMP-*`)**: Primary feature groups (Auth, Orders, Profile…)
  - **Screens (`W-*`) & APIs (`API-*`)**: UI screens + API endpoints with legacy file paths (`ID → Legacy File Path`)
  - **Cross-Flow Candidates (`FLOW-*`)**: Business flows spanning multiple screens or services
  - **Common Candidates (`CMN-UI-*`, `CMN-API-*`, `CMN-DTO-*`)**: (If Common Analysis mode selected)

---

## Rule: ID Standardization

- **[MANDATORY]** All items MUST use standardized IDs: `CMP-*`, `W-*`, `API-*`, `FLOW-*`, `CMN-UI-*`, `CMN-API-*`, `CMN-DTO-*`.
- **[MANDATORY]** Every ID MUST map to its corresponding legacy file or directory path.
  - ✅ `W-AD-AUTH-001: Login → admin-fe/src/pages/Login.tsx`
  - ✅ `CMN-UI-001: Filter Toolbar → duplicated in admin-fe/src/pages/Orders.tsx, Users.tsx`

---

## Output Structure Format

```markdown
# Core Adoption Inventory (Legacy Scan & Common Catalog)

> **Scan Date**: YYYY-MM-DD | **Sources Config**: `legacy-repos.local.json` | **Common Analysis**: [Enabled / Disabled]

## 1. Surfaces
- **Admin Portal** (`surfaces/admin`) → Legacy repo: `admin-fe`

## 2. Modules Catalog (`CMP-*`)
- **CMP-ADM-001**: Auth & Identity Management → Legacy: `admin-fe/src/modules/auth/`

## 3. Screens & API Function Inventory (`W-*`, `API-*`)
### Admin Portal (`surfaces/admin/CMP-ADM-001`)
- **W-AD-AUTH-001**: Login → Legacy: `admin-fe/src/pages/Login.tsx`
- **API-ADM-AUTH-01**: Auth Services → Legacy: `auth-service/src/controllers/AuthController.java`

## 4. Cross-Flow Candidates (`FLOW-*`)
- **FLOW-checkout**: Checkout & Payment Flow → across `CMP-ADM-002` & `CMP-CUS-001`

## 5. Common Catalog Candidates (Anti-Copy-Paste Guard)
> **Purpose**: Reuse for specs and code of new features / spec updates.

### UI Commons (`CMN-UI-*`)
- **CMN-UI-001**: Advanced Search & Filter Toolbar → Duplicated in: `admin-fe/src/pages/Orders.tsx`, `Users.tsx`
- **CMN-UI-002**: Confirm Action Modal → Duplicated in: `admin-fe/src/components/*`

### API & Service Commons (`CMN-API-*`)
- **CMN-API-001**: Paging Response & Dynamic Sorting Wrapper → Duplicated in: `OrderController.java`, `UserController.java`
- **CMN-API-002**: Audit Logging Interceptor → Duplicated in: `auth-service`, `order-service`

### DTO & Data Commons (`CMN-DTO-*`)
- **CMN-DTO-001**: Base Auditable & Soft-Delete Entity → Duplicated across 8 Entities

### ⚠️ Whole Page Duplication Warnings
> **Note**: Do not create `CMN-*` for full pages. Recommend consolidating into a single polymorphic spec (`mode: create | edit`).
- **W-AD-USER-001 (Create User)** & **W-AD-USER-002 (Edit User)**: 95% identical → *Recommendation: Consolidate into single Form Spec `CMP-ADM-USER-FORM`*

---
## 6. Handoff Usage Guide
- `/legacy /spec W-AD-AUTH-001` — spec a legacy screen (MUST reuse CMN-* if applicable)
- `/legacy /business-process FLOW-checkout` — map a legacy flow
```

---

## Verification Checklist

- [ ] AskQuestion wizard triggered for mode selection (Index Only vs Index + Common Discovery).
- [ ] Audit script run; index checked or gaps reported.
- [ ] `adoption-inventory.md` created directly at workspace root.
- [ ] All items use standardized `CMP-*`, `W-*`, `API-*`, `FLOW-*`, `CMN-*` IDs.
- [ ] Common Catalog Candidates listed with source files if Common mode selected.
- [ ] Anti-Copy-Paste Guard enforced for new spec/code.
