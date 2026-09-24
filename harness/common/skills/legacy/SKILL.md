---
name: legacy
description: /legacy — Skill Modifier: Shifts source of truth from modern platform to legacy system repositories (legacy archaeology). Used in conjunction with other skills (e.g. /legacy /spec).
disable-model-invocation: true
---

# /legacy — Legacy Context Modifier

**Skill Modifier:** When a member uses `/legacy` alongside another specialized skill (e.g., `/legacy /spec`, `/legacy /overview`, `/legacy /business-process`), the Agent MUST enforce the following behavioral shifts.

## Behavioral Shifts (Context Shift)

1. **Shift Source of Truth:**
   - INSTEAD OF reading modern active repositories (`core-repos.local.json` or legacy `platform-repos.local.json`), the Agent MUST resolve paths from `legacy-repos.local.json` and conduct analysis directly against legacy codebases and documentation.

2. **Archaeology & 2-Tier Audit Mode:**
   - Do NOT invent novel business logic or assumptions. Your role is strictly "archaeological" — extract, map, and document what ACTUALLY exists in the legacy system.
   - **Tier 1 (Page / API Detail — `/legacy /spec`)**: 
     - ONLY audit internal page/API scope: Check **missing Validation** (field validation rules, max length, format regex...) and **Local Security** (e.g. Laravel `@csrf`, Auth guard/middleware on route, input sanitization).
     - Do NOT perform cross-system end-to-end vulnerability audits at this level.
   - **Tier 2 (Cross-Flow / Business Process — `/legacy /business-process`, Module, Surface)**:
     - Audit **End-to-End Business Flow Gaps**: Check data/status misalignment between Step 1 (Screen 1) and Step 2 (Screen 2), orphan APIs/steps, broken flow steps, and missing rollback/confirmation handling on failure.

3. **Metadata Updates (When Applicable):**
   - For design artifacts (such as YAML bundles produced by `/spec`), apply appropriate legacy metadata (e.g. `specOrigin: legacy`) per guidelines in the base skill.
   - Always reference `legacy.dynamics.yaml` rather than default structures when specified by the base skill.

**Operational Mechanics (For Agent):**
This modifier HAS NO independent workflow. It represents supplementary constraints that override or activate "legacy"-specific instructions defined inside the primary `SKILL.md` file (such as `/spec`, `/module`).
