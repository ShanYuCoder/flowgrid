---
name: business-impact-review
description: Comprehensive blast-radius evaluation across repositories (Cross-repo) and functional surfaces (Cross-surface).
disable-model-invocation: true
---

# /business-impact-review

Read-only analysis by default. Do not implement fixes unless explicitly asked.

**Owner:** Common Hub (Cross-Boundary Inspector)

## Checkout resolution

Cross-repo callers/callees:

| System id | Map |
|-----------|-----|
| `legacy-*` | `legacy-repos.local.json` |
| Otherwise | `platform-repos.local.json` |

Missing/empty map or missing key → **Gaps** + **`/configure-repo-maps`**; never
guess paths. Then remind `platform-dna codegraph:wire` if needed. Ambiguous
matches → ask or Gaps.

## Context - Action - Constraint Model (CAC)

### Context
Execution triggered by `/business-impact-review` against uncommitted diffs, PR branches, or specified modified files/routes spanning cross-repo (FE ↔ BE) or cross-surface boundaries.

### Action (2-Stage Phased Protocol)

#### Stage 1: Candidate Indexing & Blast-Radius Manifest
1. **Symbol & Route Scoping:** Extract all modified public/protected methods, API routes, Jobs, Events, Listeners, Commands, and DB schemas from diff.
2. **Candidate Index Generation:** Perform targeted symbol/caller indexing (using `codegraph-<key>` or caller search across repos listed in `platform-repos.local.json`/`legacy-repos.local.json`).
3. **Compile Candidate Manifest:** Produce an indexed list of potential blast-radius targets categorized into:
   - Callers (FE/Mobile consumers, cross-repo API clients)
   - Vertical process paths (Controller → Service → Repository → DB)
   - Cross-surface listeners (Shared Events, Queue consumers, DB triggers)
4. **Workload Threshold Interlock (Law 2):**
   - **If total candidates ≤ 5:** Execute Stage 2 deep inspection directly in the current session.
   - **If total candidates > 5 (or spanning > 1 repository):**
     - **[MANDATORY HARD STOP IN CHAT]**
     - Author an implementation plan / Plan Mode document (brain dir / `plan.md`).
     - Partition candidate inspection into sequential **Phases** (each phase capped at 3–5 candidate call-sites/paths).
     - **Phase Boundary Context Pruning:** At the end of each phase, persist analysis findings into the output report on disk. For each subsequent phase, load fresh state from disk instead of maintaining full AST/diff context in conversational RAM.

#### Stage 2: Phased Deep-Dive Inspection
Inspect each candidate path sequentially across the vertical stack:
```text
Client/FE or Scheduler/Webhook
  → route/command/job
  → auth/middleware/context rewrite
  → controller/handler
  → service/domain
  → repository/model/database
  → event/listener/job/external API
  → response/error/status mapping
  → FE/consumer/next async hop
```
Apply `risk-classes.md`: authZ/IDOR, request bag, trust boundary, over-broad parse, null/empty, error collapsing, hardcode/magic, async context/idempotency, business rules, transactions, and contract compatibility.

### Constraints
- **[STRICTLY FORBIDDEN]** to rely solely on naive single-pass grep scripts that produce false negatives when member code is non-compliant or uses dynamic routing.
- **[STRICTLY FORBIDDEN]** to dump > 5 candidate analyses in a single chat turn.
- **[MANDATORY]** Write analysis findings directly to disk at each phase boundary.
- **[MANDATORY]** Maintain read-only analysis; do not generate or modify application code unless explicitly requested.

## Required Report

```text
Summary / ship recommendation
Changed symbols & Candidate Index
Horizontal callers
Vertical process paths
Cross-Boundary Impact (FE/BE & Surfaces)  <-- MANDATORY EXPLICIT SECTION
Findings: severity · class · evidence · impact · verify
Unsearched repos / residual risks
Targeted test plan
```

## Accelerators (optional)

Route per intent (rule `cross-repo-index.mdc`): never one merged
workspace graph — always the correct per-repo index.

```text
if CodeGraph available: changed symbols + callers + call graph — for repo X use
  its own server `codegraph-<key>` (--project-root = X's checkout), never the
  open repo's index; unindexed repo → report `cd <root> && codegraph init`
else: targeted repository search/read

if Docskit available: map process steps to CMP/CTR/FLOW docs via DOCSKIT_ROOT
  (never CodeGraph for architecture Markdown)
else: repository conventions/search

IR / registry / generation questions → pointer kits
  (CODEGENKIT_DOCS_ROOT, TESTKIT_DOCS_ROOT, TESTKIT_TESTS_ROOT)

if ArtifactGraph available: affected tags/registries/parity
  (local-only — never a shared index for other repos)
else: model review from scoped evidence
```

Missing accelerators never block the review. Assign one stable `runId` at run
start. Report only actual `fileReads` and `contextBytes`, never invented token claims.
