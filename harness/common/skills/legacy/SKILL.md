---
name: legacy
description: /legacy — Skill Modifier: Shifts source of truth from modern platform to legacy system repositories (legacy archaeology). Used in conjunction with other skills (e.g. /legacy /spec).
disable-model-invocation: true
---

# /legacy — Legacy Context Modifier

**Skill Modifier:** When a member uses `/legacy` alongside another specialized skill (e.g., `/legacy /spec`, `/legacy /overview`, `/legacy /business-process`), the Agent MUST enforce the following behavioral shifts.

## Behavioral Shifts (Context Shift)

1. **Shift Source of Truth:**
   - INSTEAD OF reading modern active repositories (`platform-repos.local.json`), the Agent MUST resolve paths from `legacy-repos.local.json` and conduct analysis directly against legacy codebases and documentation.

2. **Archaeology Mode:**
   - Do NOT invent novel business logic or assumptions. Your role is strictly "archaeological" — extract, map, and document what ACTUALLY exists in the legacy system.

3. **Metadata Updates (When Applicable):**
   - For design artifacts (such as YAML bundles produced by `/spec`), apply appropriate legacy metadata (e.g. `specOrigin: legacy`) per guidelines in the base skill.
   - Always reference `legacy.dynamics.yaml` rather than default structures when specified by the base skill.

**Operational Mechanics (For Agent):**
This modifier HAS NO independent workflow. It represents supplementary constraints that override or activate "legacy"-specific instructions defined inside the primary `SKILL.md` file (such as `/spec`, `/module`).
