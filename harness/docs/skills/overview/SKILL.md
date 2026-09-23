---
name: overview
description: /overview — Handles the Overview root folder (Operational areas).
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /overview — Operational Areas Overview

**Target Paths:** `overview/operational-areas/[Admin operations | Workforce operations | …]`

---

## Rule: Content Boundary

- **[MANDATORY]** Overview MUST be a pure business document written in user domain language: personas, operational areas, high-level system purpose.
- **[STRICTLY FORBIDDEN]** Do NOT include technical details (database schemas, cloud infrastructure configurations, internal routing mechanisms).
- **[MANDATORY]** When mentioning 3rd-party systems, use business names only (e.g. "Payment Gateway"), not technical specifications or protocols.

---

## Rule: `common` Modifier

- **[MANDATORY]** When called with `common` (e.g. `/overview common`) → check if `overview/common` exists; create it if not present.

---

## Modifier: `/legacy`

- **[MANDATORY]** Reference source mappings from `legacy-repos.local.json`.
- **[MANDATORY]** Map legacy actors/personas and subsystems into Operational Areas. Write output with `legacy-` prefix (e.g. `overview/legacy-overview.md`).

---

## Verification Checklist

- [ ] `overview` directory structure verified/created.
- [ ] Content uses business language only — free of technical architecture details.
- [ ] Handled `common` modifier properly if passed.
