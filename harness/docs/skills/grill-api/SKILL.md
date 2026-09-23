---
name: grill-api
description: >-
  /grill-api — Discovery router for backend API grill. Routes to /grill-api-spec
  (Portal-backed) or /grill-integration-spec (webhook/partner/no FE) based on source.kind.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /grill-api — Backend Grill Router

---

## Rule: Routing

- **[MANDATORY]** Check `feature.source.kind` in `…/api/<seq>/01-backend-spec.yaml` to determine routing:

  | Context | Route to |
  |---|---|
  | `feature.source.base` is Portal | `/grill-api-spec` |
  | `feature.source.base: none` / webhook / partner | `/grill-integration-spec` |

- **[MANDATORY]** If `01-backend-spec.yaml` does not exist yet → run `/api-spec` or `/api-integration` first.
- **[STRICTLY FORBIDDEN]** Do NOT attempt to audit the API contract from within this routing skill — delegate immediately.
