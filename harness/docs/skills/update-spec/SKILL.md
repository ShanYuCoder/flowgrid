---
name: update-spec
extractBundle: update-spec
description: /update-spec — delta update bundle/spec.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /update-spec — Controlled Spec Delta

**Extracts:** `extractBundle: update-spec` → `.cursor/extracts/extract-registry.docs.json`
Doc hub: `platform/toolchain/UPDATE-SPEC-FLOW.md` · `platform/toolchain/FEATURE-ARTIFACT-FLOWS.md`

---

## Rule: Load Policy

| Read (whole file) | Write | NEVER |
|---|---|---|
| **`ir/design.yaml`** — current tech/UI | Patch `*.bundle.yaml` → then split | Write generated `*.md`; write to `ir/*` directly |
| **`ir/spec.yaml`** — ONLY when delta involves requirements/acceptance prose | | Read only `design.sections` / `spec.ui` partial slices |

---

## Rule: Scope Boundaries

- **[MANDATORY]** Scope: patch bundle (delta only); emit `#update:*` tags; bump `specRevision`; run `flowgrid split/check`.
- **[STRICTLY FORBIDDEN]** Full rewrite → `/spec`. Close `qa/open` item → `/qa-resolve`. Legacy re-mine → `/update-spec-legacy`. Production code → NOT this skill.

---

## Rule: Missing Information Handling & Workload Threshold (Law 2)

- **[MANDATORY]** Gaps or ambiguity regarding delta scope, evaluate total gap volume:
  - **Small Scope (≤5 questions):** Trigger `AskQuestion` wizard — one question at a time, **≥3 options**: (1) `(Recommended)`, (2) `Other`, (3) `Log as Tech Debt (Pending)`.
  - **Large Scope (≥10 gaps):** **[MANDATORY HARD STOP IN CHAT]**. Do not spam single questions in chat. Generate an implementation plan / Plan Mode document partitioned into sequential Phases (3–5 gaps per phase) with disk offloading at boundaries.
  - ✅ If "Log as Tech Debt" is selected → create `qa/open/` entry; do not invent business data.
  - ❌ Never invent delta scope or novel business fields without explicit user confirmation.
- Path SSOT: `surfaces/<surface>/CMP-*/<slug>/` — NO `modules/` segment.

---

## Rule: Patch Guardrails

- **[MANDATORY]** Patch minimal YAML sections in **bundle** only (not `ir/*`).
- **[MANDATORY]** When the delta touches `design.actions`, `design.sections`, or `spec.ui` (list/form/detail, filters, row actions): run the **UX ↔ userStories** checklist in `templates/shared/bundle-authoring.md` — sync `userStories.scenarios` / `acceptanceCriteria` prose when behavior or affordances change (do not leave business story stale).
- **[MANDATORY]** Before split/merge: run `flowgrid audit spec <bundle.yaml> --type <pageType>` and resolve or explicitly defer `UX_*` / gap codes; do not hand off FE/tests with a fresh structural delta and no re-audit.
- **[MANDATORY]** Preserve error matrices: when patching actions/API endpoints, ensure `onSuccess`, `onCommonError`, `onSpecificError` + `#err:*` tags are preserved and updated accordingly.
  - ✅ Add new `onSpecificError.409` entry alongside existing `onSuccess` block.
  - ❌ Overwrite or delete existing error handling blocks that are unrelated to this delta.
- **[MANDATORY]** If `featureStatus` was `wire` → update to `need-update`.
- **[STRICTLY FORBIDDEN]** Do NOT add `codegen` / `gen:` blocks without Dev alignment — hand off to `/grill-dev` instead.
- **[STRICTLY FORBIDDEN]** Do NOT strip legacy evidence or unrelated blocks.
- **[STRICTLY FORBIDDEN]** Do NOT clear `#update:*` tags — those are cleared exclusively at `/wire`.

---

## Workflow

1. Identify delta scope (one scenario / block / API field at a time).
2. Patch minimal YAML sections in bundle per `spec-update-delta.md` (not `ir/*`).
3. Emit matching `#update:*` tags; bump `specRevision`.
4. Update `featureStatus` if needed.
5. Record harness notes when present.
6. `flowgrid audit spec <bundle.yaml> --type <pageType>` — mandatory after delta (see Patch Guardrails).
7. `flowgrid_docs_bundle_split` / `flowgrid split -- <bundle>` (fallback: `pnpm docs:split`).
8. `flowgrid_docs_bundle_check` / `flowgrid split --check -- <bundle>` (fallback: `pnpm docs:check`).
9. User runs `docs_render` / `flowgrid render` (fallback: `pnpm docs:render`).
10. Follow-up per patch type: handoff FE `/prototype` or `/grill-dev` / `/grill-bqa`; if API contract changed → `/api-update` before `openapi:gen`.

---

## Verification Checklist

- [ ] Delta scoped to one scenario/block/field.
- [ ] Patched bundle only (not `ir/*` directly).
- [ ] `#update:*` tags emitted; `specRevision` bumped.
- [ ] Error matrices (`onSuccess`, `onCommonError`, `onSpecificError`, `#err:*`) preserved and updated.
- [ ] `flowgrid audit spec` re-run after delta; UX/gap codes addressed or deferred.
- [ ] `flowgrid split` + `flowgrid split --check` passed with zero errors.
- [ ] No `codegen` / `gen` added without `/grill-dev` handoff.
