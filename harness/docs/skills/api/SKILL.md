---
name: api
description: EXCLUSIVE /api — Backend Router ONLY. Immediately routes to /api-spec or /api-integration without generating gross files.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Check for `01-backend-spec.yaml`, `approval.status`, and `feature.source.kind` before routing.

# /api — Backend Router

---

## Rule: Routing Table

- **[MANDATORY]** Always delegate — never generate content directly from this skill:

  | Condition | Route to |
  |---|---|
  | No `01-backend-spec.yaml` + Portal-backed | `/api-spec` |
  | No `01-backend-spec.yaml` + webhook/partner/no FE (`base: none`) | `/api-integration` |
  | Portal specs changed / merge deferred child functions | `/api-update` |
  | BE-only requirement (no FE contract change) | `/api-update --be-only` |
  | Spec exists but not codegen-ready / `approval.status` not `approved` | `/grill-api-spec` or `/grill-integration-spec` (per `source.kind`) |
  | `approval.status: approved` + explicit implement request | Codegenkit BE `/api` (switch to BE repo skill — NOT this skill) |

- **[MANDATORY]** Locate `01-backend-spec.yaml` under: `…/api/<seq>/` (screen leaf), `…/common/yaml/<slug>/`, or `…/integrations/…/api/<seq>/`.
- **[STRICTLY FORBIDDEN]** Do NOT skip `/grill-api-spec` for new features, cross-portal, or legacy-derived contracts.
- PHPUnit coverage: NOT routed here — use `/unit-be` directly.

Doc: `docs/operational/TEAM-AI-BACKEND-WORKFLOW.md`

---

## Verification Checklist

- [ ] Checked `01-backend-spec.yaml` presence, `approval.status`, and `feature.source.kind`.
- [ ] Correctly routed to contract skills vs Codegenkit BE `/api`.
- [ ] Did NOT generate any content from this routing skill.
