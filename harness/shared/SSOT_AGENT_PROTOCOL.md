# SSOT Agent Protocol — Physical Interlocks (Docskit)

> [!CRITICAL]
> These are **PHYSICAL INTERLOCKS**, not casual reminders.
> Any violation of these laws → run **FAILED**. Chat-only "done" = **STRICTLY REJECTED**.
>
> Path SSOT: `surfaces/<surface>/CMP-*/<slug>/` (NO `modules/` segment).

---

## LAW 1 — CRITICAL RULE FOR PRE-FLIGHT CHECK

**Objective:** Eliminate refusal to read original specification files.

In any thread (new or continuing), whenever a user requests to run a skill or feature, the **MANDATORY FIRST ACTION** is to invoke `{{DOC_SKIT_READ_TOOL}}` (or equivalent read tool) directly on the target `SKILL.md` to load the current standards.

**STRICTLY FORBIDDEN** to rely on speculative memory or context from prior turns.

Without first invoking `{{DOC_SKIT_READ_TOOL}}` on `SKILL.md` → **FORBIDDEN** to generate plans, YAML files, or any product artifacts.

---

## LAW 2 — CRITICAL RULE FOR TASK TRACKING & SESSION TOKEN HORIZON (Anti Flat-Check & Compaction Protection)

**Objective:** Prevent incomplete delivery, superficial checking, and session max-length token overflow (auto-compaction/truncation).

Immediately after Pre-flight, the agent **MUST** evaluate the total workload (including gaps from audit scripts, user questions, and action items) against the **Session Max-Length Horizon**:

### Workload & Token Safeguard Gate (The 5 / 10 Threshold Rule)
1. **Small Scope (≤5 items, single screen/API):**
   - Accumulates < 30k trajectory tokens — well within safe single-session limits.
   - List dynamic checklist (`- [ ]`) directly in the **chat thread**.
   - Check off items (`[x]`) with concrete file/diff evidence as each completes.
   - Execute wizard questions one at a time directly in the chat thread.
2. **Buffer Scope (6–9 items):**
   - Permitted in chat ONLY if items are isolated, single-turn scalar string/label fills without deep file re-reading.
   - If items involve structural changes or multi-file dependencies → MUST escalate to an implementation plan.
3. **Large Scope (≥10 items, multi-screen/cross-repo, OR audit script outputs extensive gaps):**
   - **MANDATORY HARD STOP IN CHAT:** Strictly forbidden from dumping all items into the active chat session, which guarantees single-turn truncation and session auto-compaction.
   - **Environment Plan Gate:** Author a structured implementation plan using the host environment's plan mechanism:
     - **Antigravity:** `implementation_plan.md` in `<appDataDir>/brain/<conversation-id>/`.
     - **Cursor:** Plan Mode / Plan document / `plan.md`.
     - **Claude Code / Windsurf / Others:** Structured plan artifact or scratchpad (`plan.md` / `implementation_plan.md`).
     - **Repository Cleanliness:** Regardless of host agent, **NEVER** commit temporary plan scratchpads into the production codebase repo.
   - **Phase Slicing:** Partition workload into discrete **Phases** (each phase capped at 3–5 items).
   - **Phase Boundary & Context Offloading:** At the completion of each phase, immediately write persistent physical files to disk. For the next phase, load fresh state from disk instead of accumulating verbose conversation history, insulating the workflow against context loss.

**Question Protocol (mandatory in both chat thread and implementation plan):**

- Every question **MUST** be explicitly numbered (`Question 1`, `Question 2`, etc.).
- Every question **MUST** provide **≥3 options**: (1) Concrete choice labeled `(Recommended)`, (2) `Other` (free text input), and (3) `Log as Tech Debt (Pending)`.
- **Chat Wizards (Small Scope):** Render one question at a time, awaiting user response before proceeding.
- **Implementation Plans (Large Scope):** Consolidate numbered questions within their respective phases in the plan document.

**CRITICAL — Physical File Policy:**

- **STRICTLY FORBIDDEN** to create a physical `TODO.md` file inside the target repository.
- **STRICTLY FORBIDDEN** to merely copy the static "Verification Checklist" from the end of `SKILL.md`.
- Each Workflow step = one checklist item. Each Accelerator branch = one `if available / else fallback` entry.
- **STRICTLY FORBIDDEN** to combine steps, batch check-off items, or output static generic checklists.

The verification checklist at the bottom of a skill serves only to audit evidence against derived steps — never as the checklist source itself.

---

## LAW 3 — CRITICAL RULE FOR EXECUTION (Plan Before Write)

**Objective:** Prevent raw unvalidated generation directly in RAM.

**STRICTLY FORBIDDEN** to batch actions together without planning. **STRICTLY FORBIDDEN** to create redundant standalone plan files (`*-plan.md`).

---

## LAW 4 — CRITICAL RULE — PHYSICAL OUTPUT IMMEDIATELY (No RAM Caching)

**Objective:** Eliminate context truncation and loss of state.

Whenever the agent generates a persistent result (plan, proposal, bundle, step summary), it **MUST NOT** retain it solely in RAM or chat context.

**MANDATORY** to write physical files immediately using the appropriate tool.

Physical output of step N = Physical input of step N+1 (read from disk, do not rely on memory).

---

## LAW 5 — CRITICAL RULE FOR DATA ORIGIN (Zero Business Hallucination)

**Objective:** Forbid inventing business logic when prompt information is missing.

The agent is permitted to populate specifications from strictly **2 sources**:

1. User prompt
2. Evidence from ArtifactGraph Registry (when MCP is available)

**STRICTLY FORBIDDEN** to invent fields, validations, database columns, flows, or domain tags.

Any missing detail **MUST** remain empty or be tagged `#missing_info` and deferred to `/grill`.

---

## LAW 6 — CRITICAL RULE FOR GRILL PROCESS (Hard Confirmation Gate)

**Objective:** Restrict grilling to localized analysis; prevent unapproved scope creep.

When inspecting `#missing_info` or gaps, Grill **MUST** follow 4 steps:

1. **Re-check ArtifactGraph** (if available) — other members may have committed updates.
2. **Micro-scoping:** Isolate strictly the missing block/field. Do not alter settled sections.
3. **Proposal:** Present via **wizard form** in the **Chat Thread** — one question at a time with ≥3 options (Recommended, Other, Tech Debt).
4. **Hard Confirmation Gate:** Wait for member confirmation in chat. Only after explicit confirmation is the agent permitted to update product SSOT (`.bundle.yaml`) and Artifact Registry.

---

## LAW 7 — CRITICAL RULE FOR DSL REGISTRY (Human-Dictated)

**Objective:** Prevent unauthorized modifications to Common and DSL assets.

Human leads are the **exclusive authority** for establishing and updating DSL/Common standards.

The agent has **NO AUTHORITY** to unilaterally decide what constitutes "Common".

The agent acts strictly as a clerk, permitted to register or update DSL/Common in only **3** passive cases:

1. User explicitly invokes `/common` or `/common-spec`.
2. User explicitly invokes `/docs-mark` to record rules or tags.
3. User explicitly confirms a `/grill` proposal.

In standard `/spec` runs, the sole duty is to **consume existing common definitions**.

**STRICTLY FORBIDDEN** to invent or overwrite common/DSL definitions without authorization.

---

## LAW 8 — CRITICAL RULE FOR ARTIFACTGRAPH MCP & CROSS-REPO ROUTING

**1. Boundaries & Ownership:**
- ArtifactGraph manages solely `artifactgraph.json`, `registries/*.json`, `templates`, and `lexicon/` within the current repository.
- It does **NOT** manage Architecture Markdown (owned by Docskit), Code Generators (owned by Codegenkit/Testkit), or Symbol Indexes (owned by CodeGraph).

**2. Cross-Repo Routing:**
- **STRICTLY FORBIDDEN** to use ArtifactGraph for broad cross-repo scanning or entire workspace graphs. Route by ownership:
  - Architecture ID / C4 path → Delegate to **Docskit** (`DOCSKIT_ROOT`).
  - IR / registry / generation → Delegate to **Owning Kit** (`CODEGENKIT_DOCS_ROOT`, `TESTKIT_DOCS_ROOT`, `TESTKIT_TESTS_ROOT`).
  - Symbol / Call-graph lookups for repo X → Use **CodeGraph MCP** for repo X (`codegraph-<key>`).

**3. Protocol for MCP Usage:**
- **Status & Rebuild:** Use `artifactgraph_status`. If stale, call `artifactgraph_rebuild`.
- **Analyze:** Prioritize `artifactgraph_analyze`, `artifactgraph_grill_check`, or `artifactgraph_parity_check`.
- **Remember:** Only use `artifactgraph_remember` AFTER member confirms options during Grill.
- **Handoff:** Use `artifactgraph_allowlist_check` + `artifactgraph_recommend_command` to retrieve permitted commands; hand off to corresponding kit/script. Never run `artifactgraph_gen`.
- **Cloud Prompt:** Send `cloudPromptSlice` only for unresolved work items.
- **Setup:** If indices are missing, direct member to run `artifactgraph init` with the appropriate `--type=`.

---

## Mandatory Lock Sequence for Each Skill Run

```text
1) {{DOC_SKIT_READ_TOOL}} SKILL.md                          → Law 1
2) Derive dynamic checklist                                 → Law 2
3) Write immediately upon producing durable results (No RAM) → Law 4
4) Sourced exclusively from User | ArtifactGraph; tag gaps   → Law 5
5) Grill: 4-step protocol + STOP for Confirmation           → Law 6
6) Common/DSL: only via /common|/common-spec|/docs-mark|Confirm → Law 7
```

Host overlay Antigravity: see `AGENTS.md` (synchronized Laws 1–8).
