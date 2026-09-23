---
name: adopt
description: "/adopt — Scan legacy repositories and generate a high-level index mapping catalog at root."
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /adopt — Legacy Adoption Index

**Audit Interlock:** Run `node engines/spec/lib/audit-legacy-gaps.mjs <target-id>`. Consume JSON gap report to verify mapping or prompt member if index is missing.

---

## Rule: Purpose & Output

- **[MANDATORY]** Output: one `adoption-inventory.md` file directly at workspace root.
- **[MANDATORY]** Content: clean bullet-point index only — surface, module, screen/API IDs mapped to legacy file paths.
- **[STRICTLY FORBIDDEN]** Do NOT generate spec details, diagrams, or tables. Do NOT use checkboxes (`- [ ]`). This is a reference index, not a full spec.

---

## Rule: Scan Sources

- **[MANDATORY]** Read repo list from `legacy-repos.local.json` (or `platform-repos.local.json`).
- **[MANDATORY]** If called with scope (e.g. `/adopt "Customer App"` or `/adopt admin-fe`) → scan only that app/module.
- **[MANDATORY]** Scan: Router, Controllers, View/Page Components, Service Interfaces to extract:
  - **Surfaces**: Application and channel names (Admin Portal, Customer Web, Gateway…)
  - **Modules (`CMP-*`)**: Primary feature groups (Auth, Orders, Profile…)
  - **Screens (`W-*`) & APIs (`API-*`)**: UI screens + API endpoints with legacy file paths (`ID → Legacy File Path`)
  - **Cross-Flow Candidates (`FLOW-*`)**: Business flows spanning multiple screens or services

---

## Rule: ID Standardization

- **[MANDATORY]** All items MUST use standardized IDs: `CMP-*`, `W-*`, `API-*`, `FLOW-*`.
- **[MANDATORY]** Every ID MUST map to its corresponding legacy file or directory path.
  - ✅ `W-AD-AUTH-001: Login → admin-fe/src/pages/Login.tsx`
  - ❌ `Login screen → src/pages/Login.tsx` — missing ID prefix.

---

## Output Structure Format

```markdown
# Platform Adoption Inventory (Legacy Scan)

> **Scan Date**: YYYY-MM-DD | **Sources Config**: `legacy-repos.local.json`

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

---
## 5. Handoff Usage Guide
- `/legacy /spec W-AD-AUTH-001` — spec a legacy screen
- `/legacy /business-process FLOW-checkout` — map a legacy flow
```

---

## Verification Checklist

- [ ] Audit script run; index checked or gaps reported.
- [ ] `adoption-inventory.md` created directly at workspace root.
- [ ] All items use standardized `CMP-*`, `W-*`, `API-*`, `FLOW-*` IDs.
- [ ] Every ID maps to a legacy file or directory path.
- [ ] No spec details, diagrams, or checkboxes in output — clean bullet index only.
