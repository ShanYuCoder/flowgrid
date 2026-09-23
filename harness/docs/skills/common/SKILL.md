---
name: common
description: EXCLUSIVE /common — Use this to define common business rules, UX/UI rules, and patterns for a Surface as Markdown documentation. DO NOT use this to generate YAML technical bundles (use /common-spec for that).
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** This is an allowed human-invoked path only. Do NOT run as a side-effect of `/spec`.

# /common

**Target Path:** `<LCA>/common/patterns/` — resolve LCA from `.cursor/extracts/common-scope.md` (module/cluster `common/` before surface; never invent a second tree).

## Purpose

Markdown rules for a **named scope** (cluster / module / surface / global). Not "always surface-wide". First **Read** `common-scope.md` and pick the LCA `common/patterns/` folder.

**Gate:** Only use when the user explicitly invoked `/common` (or confirmed a grill proposal).

---

## Rule: Target / ID Resolution

- **[MANDATORY]** Prompt MUST name **consumers** (CMP id, cluster `NN`, surface, or "all surfaces"). If ambiguous → ask; propose one LCA from `common-scope.md`.
- **[MANDATORY]** Scaffold `common/patterns/` at that LCA only.
- **[STRICTLY FORBIDDEN]** Do NOT create `surfaces/common` unless ≥2 surfaces share the rule.
- **[MANDATORY]** One function only → do NOT create `common/`; attach the rule to the function bundle directly.
- Surface-wide with no `common/` yet → run `/surfaces <name> common` first, then author `patterns/`.

---

## Rule: Markdown Content

- **[MANDATORY]** Use clear, non-technical language geared towards Business / QA / Dev alignment.
- **[MANDATORY]** Define rules based on surface type when applicable (e.g. Kiosk UI rules differ from Web Portal rules).
- **[STRICTLY FORBIDDEN]** Do NOT output fake i18n tables or framework prose. Focus on actual rules (e.g. "Confirm dialog must always block background").
- **[STRICTLY FORBIDDEN]** Do NOT generate YAML bundles here — use `/common-spec` for codegen bundles.

---

## Verification Checklist

- [ ] Target surface resolved to `surfaces/[Surface]/`.
- [ ] `common/` directory verified or created.
- [ ] `.md` written under LCA `common/patterns/` from `common-scope.md` (not beside a single function).
