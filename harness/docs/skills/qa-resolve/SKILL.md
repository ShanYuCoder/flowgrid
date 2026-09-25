---
name: qa-resolve
extractBundle: docs-hub
description: EXCLUSIVE /qa-resolve — close one qa/open file. Prompt is QA id + solution. Do not use for full-screen grill or first-time /spec.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /qa-resolve — Close One Open QA

**When:** Member provides `QA-<page-id>-NNNN` (or `QA-<feature.id>-NNNN`) **along with** an explicit decision/solution.

**Not this skill:**
- Unknown answers needing brainstorming → `/grill-bqa` / `/grill-dev` / `/grill-docs` / `/api-spec`
- FE delta without an existing QA file → `/update-spec`
- Portal/BE sync without closing QA files → `/api-update`

**Extract:** `.cursor/extracts/qa-inbox.md`

---

## Rule: Load Policy

| Read (whole file) | Write | NEVER do |
|---|---|---|
| `qa/open/<id>.yaml` | Patch `target.path` only | Read generated `*.md` as SSOT |
| Target bundle **or** `01-backend-spec.yaml` (entire file) | Delete QA file after patch | Author `openQuestions` |
| `ir/design.yaml` — ONLY to locate field if `at` is a design pointer | `flowgrid split` after patch | Full-screen rewrite (use `/spec`) |

---

## Rule: Missing Solution Handling

- **[MANDATORY]** If user prompt includes a solution → treat as confirmed decision. **Do NOT** re-trigger AskQuestion wizard.
- **[MANDATORY]** If user prompt provides **no solution**: trigger `AskQuestion` wizard with **≥3 options** (1. Recommended, 2. Other, 3. "Log as Tech Debt") + include `options[]` from the QA file if present. Then **STOP**.
- **[STRICTLY FORBIDDEN]** Do NOT invent solutions. Do NOT inject business data absent from user prompt.

---

## Rule: Resolving the QA File

- **[MANDATORY]** Step 1: Locate `qa/open/<id>.yaml`. If missing, glob `qa/open/QA-*-NNNN.yaml` matching `id:`.
  - Zero matches → **STOP**, list available `qa/open/` IDs to user.
  - Multiple matches → **STOP**, prompt user to clarify which file to close.
- **[MANDATORY]** Step 2: Read `target.path`, `target.at`, `kind`, `skill`, and `question` from the QA file.

---

## Rule: Patch Logic (One SSOT)

- **[MANDATORY]** Use `target.path` to locate patch destination — never guess path:

  | `target.path` | Patch Action |
  |---|---|
  | `*.bundle.yaml` | Patch `target.at` field only. Never patch `spec.api`. |
  | `…/api/<seq>/01-backend-spec.yaml` or `common/yaml/<slug>/01-backend-spec.yaml` | Patch that `01`. Drop `pendingTechDebt[]` row for this QA id. Regenerate `02` via `flowgrid openapi_gen --spec <01>`. |
  | Missing / invalid path | **STOP** — do not invent a fallback path. |

- **[MANDATORY]** Post-patch execution:
  1. Write solution into field at `target.at` (replacing `#missing_info` / empty / placeholder).
  2. Remove this ID from `#missing_info QA-…`, `#tech-debt:QA-…`, and all tag lists.
  3. **Delete** `qa/open/<id>.yaml`.
  4. Run `flowgrid split` / `pnpm docs:split` so `ir/spec.yaml` Q&A removes this ID.
- **[MANDATORY]** Preserve existing error matrices (`onSuccess` / `onCommonError` / `onSpecificError`, `#err:*`) unless solution specifically alters those fields.

---

## Rule: Out of Scope

- **[STRICTLY FORBIDDEN]** Do NOT close multiple QA IDs in a single invocation (strictly one ID per prompt).
- **[STRICTLY FORBIDDEN]** No codegen, prototype, or Playwright generation. No inventing API endpoints or UI inventory.

---

## Handoff (after close)

- `01` still missing `codegen.profile` / `#gen:*` / `action` → instruct member to run **`/grill-api-spec`**.
- `bundle.gen` still empty while grill-dev was pending → **`/grill-dev`**.
- Otherwise: execution complete.

---

## Verification Checklist

- [ ] Read `qa/open/<id>.yaml`; patched only `target.path` field.
- [ ] Solution sourced strictly from user prompt (or single AskQuestion turn).
- [ ] QA file deleted; `pendingTechDebt` + `#missing_info` references removed for this ID.
- [ ] `flowgrid split` executed; `ir/spec.yaml` Q&A reflects closed status.
- [ ] Did not author `openQuestions` or `bundle.spec.api`.
