---
name: common-spec
extractBundle: spec-core
description: EXCLUSIVE /common-spec — Use this to define common technical bundles (YAML) for a Surface for Codegen. DO NOT output Markdown files.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.
> **[MANDATORY]** Read `.cursor/extracts/common-scope.md` first to resolve the LCA path.

# /common-spec — Common Technical Bundle (YAML)

**Target Path:** `<LCA>/common/yaml/<slug>/<slug>.bundle.yaml` (LCA from `common-scope.md`).

**Gate:** Only use when user explicitly invokes `/common-spec` or confirmed a grill proposal to promote common.

---

## Rule: Platform-Agnostic Generation

- **[MANDATORY]** Use `design.shell.tag` to match target surface type:
  - Web Portal → `#shell: DataListPage`
  - WinForms Kiosk → `#shell: KioskCheckIn`
  - Gateway → `#shell: OtAdapter`
- **[MANDATORY]** Populate `spec.clients` if applicable.
- **[RECOMMENDED]** For known Web patterns (e.g. `confirm-dialog`): ask if user wants to inherit from seed template in `templates/project-skeleton/surfaces/common/yaml/`.
- **[MANDATORY]** For non-Web surfaces → generate new bundle tailored to that requirement. Do NOT force Web template inheritance.

---

## Rule: Output

- **[MANDATORY]** Output MUST be `.bundle.yaml`. Do NOT write `.md` directly.
- **[MANDATORY]** All strings containing `:` must be double-quoted.
- **[MANDATORY]** After writing: instruct user to run `docskit split -- <path>` (must emit `ir/design.yaml`), then `docskit render`. Run `docskit split --check` to verify.
- **[STRICTLY FORBIDDEN]** Do NOT send BE `/api` a common FE bundle. Codegenkit → FE `/gen-common` only.

---

## Workflow

1. Read `common-scope.md`. Identify consumers → one LCA `common/yaml/<slug>/`.
   - Example module-local: `surfaces/admin/CMP-ADM-002/common/yaml/confirm-dialog/confirm-dialog.bundle.yaml`
2. Generate `.bundle.yaml` using `portal-feature-bundle/v1` schema.
3. Instruct user: `docskit split -- <path>` → `docskit render`.

---

## Verification Checklist

- [ ] LCA resolved from `common-scope.md`; path correctly scoped.
- [ ] `design.shell.tag` matches target surface type.
- [ ] `.bundle.yaml` output only (no `.md`). YAML strings with `:` are double-quoted.
- [ ] `docskit split --check` passes (emits `ir/design.yaml`).
