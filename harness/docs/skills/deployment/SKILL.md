---
name: deployment
description: /deployment — optional DEP-* stub; do not invent prod topology.
disable-model-invocation: true
extractBundle: architecture-core
---

> [!CRITICAL] MANDATORY PRE-FLIGHT
> **[MANDATORY]** Re-read this entire `SKILL.md` via file-read tool. STRICTLY FORBIDDEN to rely on memory.

# /deployment — Deploy Stub-First

**Business layer:** Deploy (outside module tree; thin architecture layer)  
**Standards:** Short prose OK; diagrams → C4 `DEP-*` only when placement is confirmed.

---

## Rule: Default Behavior

- **[MANDATORY]** If the user did NOT confirm that deployment placement matters → write/keep a **short stub only** (`tpl-deployment.md`).
- **[STRICTLY FORBIDDEN]** Do NOT invent staging/production multi-region diagrams from imagination.
- **[STRICTLY FORBIDDEN]** Do NOT write local IDE/WSL machine tips into the docs hub.
- **[STRICTLY FORBIDDEN]** Never commit secrets into deployment documentation.

---

## Rule: When to Write Full Deployment Doc

- **[MANDATORY]** Only author a full `DEP-*` deployment document when the user explicitly confirms placement matters.
- **[MANDATORY]** Path: `Architecture/Deployment/`; ID: `DEP-*`.
- **[MANDATORY]** Use `docskit_list_ids kind:DEP` to check existing IDs before creating new ones.
- **[STRICTLY FORBIDDEN]** Do NOT confuse with journey sequences (those belong to `/journey`).

Parent: `/architecture`
