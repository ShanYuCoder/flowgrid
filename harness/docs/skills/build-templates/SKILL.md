---
name: build-templates
description: /build-templates — Scan FE/BE codebase and scaffold matching EJS templates and common specs.
disable-model-invocation: true
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /build-templates — Codebase Scanning & Template Scaffolding

**Purpose:** Synchronize Docs Hub (`docskit`) with actual FE/BE codebase reality by scanning code and scaffolding customized `.ejs` templates.

---

## Rule: Pre-flight

- **[MANDATORY]** Read `platform-repos.local.json` at root to resolve absolute paths to FE (`fe`) and BE (`be`).
- **[MANDATORY]** If file is missing or paths are empty → STOP and instruct user: *"Please configure repository mappings using `/configure-repo-maps`."*

---

## Rule: Scan Steps

- **[MANDATORY]** Frontend: Scan `package.json` + imports to identify UI Framework (`vuetify`, `shadcn-ui`, `element-plus`, `bootstrap`, etc.). Locate shared layout components (Breadcrumb, MainLayout, Table, Form).
- **[MANDATORY]** Backend: Scan routers/controllers + shared data structures (Base Response, Paging Request) to capture API standards.

---

## Rule: EJS Template Generation

- **[MANDATORY]** Write EJS templates to `.forgekit/templates/` (e.g. `default-layout.ejs`, `breadcrumb-flow.ejs`).
- **[MANDATORY]** Templates MUST accurately reflect project UI Kit (Vuetify → Vuetify component tags; Shadcn → flat design style).
- **[STRICTLY FORBIDDEN]** Do NOT alter anchor comments `<!-- docskit-anchor: ... -->` in templates — these are vital data anchors for AI processing.
- **[MANDATORY]** If an EJS template already exists with customizations → ask user before overwriting, or only append delta changes.

---

## Rule: Common Specs Sync

- **[MANDATORY]** Create or update YAML common specs under `surfaces/common/yaml/` matching scanned shared code structures.

---

## Rule: Verification

- **[MANDATORY]** After scaffolding templates: run `pnpm docs:render` to compile all specs and verify EJS templates contain no syntax errors.
