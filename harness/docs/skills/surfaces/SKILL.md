---
name: surfaces
description: "/surfaces — Manage business/interaction surfaces (who does what on which channel)."
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /surfaces — Business/Interaction Surfaces

**Definition:** A surface = business interface or interaction channel (Admin Portal, Customer Web, Mobile App, Integration Gateway) — NOT a repository or project.

---

## Rule: Target Resolution

- **[MANDATORY]** Use `docskit_route` or `docskit_get_element` (or glob) to resolve the target surface directory under `surfaces/[Surface Name]/`.
- **[STRICTLY FORBIDDEN]** Do NOT confuse an API with a surface. APIs belong to architecture containers or function-level API contracts.

---

## Rule: `common` Scope

- **[MANDATORY]** `surfaces/common` — ONLY when a rule/API is used by **≥2 surfaces**. Never use as a default dumping ground.
- **[MANDATORY]** `surfaces/[Surface]/common` — share between modules on this specific surface (not within a single `CMP-*`).
- For sharing within one `CMP-*` → use `/module CMP-… common`.

---

## Rule: Overview Alignment

- **[MANDATORY]** When authoring a surface overview, describe: target actors, their actions, interaction channels, and assigned business responsibilities. Keep descriptions in business terms rather than technical architecture.
- **[MANDATORY]** Surface technical boundary: UI layout, component states, props, single-API data schemas specific to that screen.
- **[STRICTLY FORBIDDEN]** Do NOT include system-level architecture details (backend server configuration, load balancers, database schemas) in surface documentation.

---

## Modifier: `/legacy`

- **[MANDATORY]** If `adoption-inventory.md` is missing at workspace root → STOP: *"Run `@docskit /adopt` first."*
- **[MANDATORY]** If file exists: look up surface ID → get legacy app/repo path → write `surfaces/[Surface]/legacy-surface.md`.
- **[STRICTLY FORBIDDEN]** Do NOT read `adoption-inventory.md` for Greenfield commands.

---

## Verification Checklist

- [ ] Target surface folder located or created under `surfaces/[Surface Name]/`.
- [ ] Business responsibilities (actors, channels, scope) documented in business language.
- [ ] `surfaces/common` reserved strictly for rules shared across ≥2 surfaces.
