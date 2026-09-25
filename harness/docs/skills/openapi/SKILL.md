---
name: openapi
description: /openapi — generate 02-openapi.yaml from 01-backend-spec.yaml on the docs hub (bộ docs).
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /openapi — OpenAPI YAML (docs hub)

**Owner:** bộ docs (`--type=docs`). OpenAPI is a **docs artifact**, not bộ code.

One generator: **OpenAPI 3.0.3** from `01-backend-spec.yaml`. Merge/UI stays `openapi:render` + Redocly bundle.

---

## Rule: Generation Commands

- **[MANDATORY]** Generate `02-openapi.yaml` from the corresponding `01`:
  ```bash
  flowgrid openapi_gen --spec surfaces/<surface>/CMP-*/<NN…>/api/<seq>/01-backend-spec.yaml
  # Or from docs hub root (all 01-backend-spec.yaml under surfaces):
  flowgrid openapi_gen
  # Validate only:
  flowgrid check --spec …/01-backend-spec.yaml
  ```
- **[MANDATORY]** After generation: run `flowgrid openapi_render` to merge fragments into `docs/openapi/api.yaml`.

---

## Rule: Patch vs Reinvent

- **[MANDATORY]** If fragment is too thin (error $refs, missing examples): patch **`01-backend-spec.yaml`** and regenerate.
- **[STRICTLY FORBIDDEN]** Do NOT hand-edit `02-openapi.yaml` as SSOT.
- **[STRICTLY FORBIDDEN]** Do NOT run bộ code `--type=docs` or `nestjs --openapi`. Do NOT invent a second generator per stack.
- **[STRICTLY FORBIDDEN]** BE `/api` generates implementation code from the contract — it does NOT own OpenAPI YAML.
