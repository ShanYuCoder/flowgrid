---
name: cross-entity-service
description: EXCLUSIVE #cross-entity-service hashtag — ONLY for cross-aggregate orchestration tags. DO NOT output fake Markdown reports.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read `.cursor/extracts/cross-entity-service.md` for trigger criteria, spec/OpenAPI tags, and implementation rules.

# #cross-entity-service — Cross-Aggregate Orchestration Tag

Used from: `/api-spec`, `/grill-api-spec`, and Codegenkit BE `/api` when this hashtag is present.

---

## Rule: ID Resolution

- **[MANDATORY]** Use `docskit_route` or `docskit_get_element` (or glob) to locate `…/api/<seq>/01-backend-spec.yaml` (or `common/yaml`). NEVER treat `ir/design.yaml` as the BE contract.

---

## Rule: Application

- **[MANDATORY]** When `#cross-entity-service` is present in the spec: document the `services[]` array and add the hashtag to the spec YAML.

---

## Verification Checklist

- [ ] `01-backend-spec.yaml` located via ID or path resolution.
- [ ] `services[]` documented; `#cross-entity-service` applied in spec YAML.
