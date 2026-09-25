---
name: grill-common-spec
description: EXCLUSIVE /grill-common-spec — Use this to audit and verify technical common bundles before code generation.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /grill-common-spec — Common Bundle Audit

**Target Path:** `<LCA>/common/yaml/<slug>/<slug>.bundle.yaml` (see `.cursor/extracts/common-scope.md`).

---

## Rule: Audit Checks

- **[MANDATORY]** Verify `schema` is set (e.g. `portal-feature-bundle/v1` or appropriate surface schema).
- **[MANDATORY]** Verify `design.shell.tag` reflects the target platform:
  - Web Portal → `#shell: DataListPage`
  - WinForms → `#shell: KioskCheckIn`
  - Gateway → `#shell: OtAdapter`
- **[MANDATORY]** Verify `spec.principles` and `spec.acceptance` are detailed enough to drive test cases and codegen.
- **[MANDATORY]** Verify `design.patterns` and referenced middlewares point to valid, existing items.
- **[STRICTLY FORBIDDEN]** Do NOT "fix" a module-common bundle by copying it to surface `common/`.

---

## Rule: Output

- **[STRICTLY FORBIDDEN]** Do NOT output new files from this skill.
- **[MANDATORY]** If issues are found → inform user + suggest fixes, or fix directly in `.bundle.yaml` if instructed.
- **[MANDATORY]** If bundle passes → instruct user: run `flowgrid split -- <path>` (must emit `ir/design.yaml`), then bộ code FE `/gen-common`.
- **[STRICTLY FORBIDDEN]** Do NOT send BE `/api` a common FE bundle.

---

## Verification Checklist

- [ ] `schema` field set correctly.
- [ ] `design.shell.tag` aligned with target surface type.
- [ ] `spec.principles` and `spec.acceptance` are substantive.
- [ ] All `design.patterns` / middleware references are valid and exist.
