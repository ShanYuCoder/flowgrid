---
name: docs-mark
extractBundle: docs-mark
description: /docs-mark — member marks tags/registries after grill confirm.
disable-model-invocation: true
---

# /docs-mark

**Owner:** ArtifactGraph (common harness)  
Member annotation following grill A/B/C confirmation — NOT for bulk `/spec` / `/dev-grill-docs`.

Hub policy (docs hub): `platform/toolchain/PLATFORM-MARK.md` (alias: docs-mark).  
Technical marks SSOT on the docs hub: `surfaces/common/integrations/*`,
`surfaces/common/data-model/derived-data.md`.

## Accelerators (optional)

When ArtifactGraph tools are available: `artifactgraph_analyze`,
`artifactgraph_suggest_tags`, `artifactgraph_remember`,
`artifactgraph_allowlist_check`, `artifactgraph_recommend_command`,
`artifactgraph_api_reuse_check` (confirm route reuse before applying `#reuse-api`),
`artifactgraph_grill_check` (re-scan for `duplicate-api-route` / missing tags after mark).  
Missing AG tools → continue with local registry/spec edits; do not invent shell
fallbacks.

## Registries (on the product / FE repo)

| Layer | File | Tags |
|-------|------|------|
| UI | `registries/design.registry.json` | `#needs-component:` `#needs-ui:` `#shell:` |
| Logic | `registries/common.registry.json` | `#common:*` `#needs-common:*` |

Executable registry validation is **bộ code FE** (or product scripts on the
FE checkout). On docs hub:

```text
if ArtifactGraph available:
  artifactgraph_allowlist_check(registryValidate|commonRegistry)
  artifactgraph_recommend_command → hand off to bộ code FE
else:
  note pending FE registry validate; do not invent local shell fallbacks
```

## Workflow

1. Feature `ir/spec.yaml` + registries (optional `artifactgraph_analyze`)
2. One mark / concern; member already confirmed at grill
3. Upsert registry · planned → HANDOFF · implemented → promote path
4. `artifactgraph_remember` subject after confirm B

## Do not

- Auto-tag without asking the member
- Put Mo* into `common.registry` (design registry only)
- Full contract rewrite
- Treat `artifactgraph_gen` as required (deprecated shim)

## Handoff

bộ code FE / product: `flowgrid gen:dry` (or repo shim) after marks change,
when that lane is available. Missing bộ code is a pending handoff, not a
docs failure.

## Compatibility

`/platform-mark` is a deprecated alias for this skill (one compatibility cycle).
