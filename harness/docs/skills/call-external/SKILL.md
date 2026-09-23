---
name: call-external
description: EXCLUSIVE #call-external hashtag — ONLY for third-party integration tags. DO NOT output fake Markdown reports.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read `.cursor/extracts/call-external.md` for spec, OpenAPI, and implementation rules.

# #call-external — Third-Party Integration Tag

Used from: `/api-spec`, `/grill-api-spec`, and Codegenkit BE `/api` when this hashtag is present.

---

## Rule: ID Resolution

- **[MANDATORY]** Use `docskit_route` or `docskit_get_element` (or glob) to locate `…/api/<seq>/01-backend-spec.yaml` (or `common/yaml` / integrations `api/<seq>`). NEVER treat `ir/design.yaml` as the BE contract.

---

## Rule: Application

- **[MANDATORY]** When `#call-external` is present in the spec: document the `externalCalls[]` array and add the hashtag to the spec YAML.

---

## Verification Checklist

- [ ] `01-backend-spec.yaml` located via ID or path resolution.
- [ ] `externalCalls[]` documented; `#call-external` applied in spec YAML.
