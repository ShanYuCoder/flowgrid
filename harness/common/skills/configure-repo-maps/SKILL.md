---
name: configure-repo-maps
description: /configure-repo-maps — Merge NL checkout paths into platform-repos.local.json / legacy-repos.local.json (no git clone).
disable-model-invocation: true
---

<!-- platform-dna:configure-repo-maps-ssot -->

# /configure-repo-maps

**Purpose:** Populate local checkout directory paths into machine-local mapping files — do not clone repositories, do not alter portable catalogs.

## Hard Rules

1. **[MANDATORY]** Write ONLY to `platform-repos.local.json` and/or `legacy-repos.local.json` (merge-by-key).
2. **[STRICTLY FORBIDDEN]** Do NOT execute `git clone` / `git fetch` / connect remotes / download source archives.
3. **[STRICTLY FORBIDDEN]** Do NOT edit `platform-repos.json` / `legacy-repos.json` (portable catalogs where `root` remains `"."`).
4. **[STRICTLY FORBIDDEN]** Do NOT hand-edit entire JSON files on behalf of the member by pasting full files — accept natural language (NL) input and prompt for missing keys or paths.
5. **[MANDATORY]** Normalize absolute paths (including `~` or Windows drives) and write to `projects.<key>.root`.

## Routing

| Intent | File |
|--------|------|
| Current platform / hub (docs, portal, api, tests, …) | `platform-repos.local.json` |
| Prefix / concept `legacy-*`, legacy archaeology | `legacy-repos.local.json` |

## Example Prompts (NL input from user)

**Platform-only**

```text
docs = base-docs at ~/ws/base-docs, portal admin at ~/ws/portal, api core at ~/ws/api
```

→ Merge `base-docs`, `portal`, `api` into `platform-repos.local.json` (prompt if keys or roles are ambiguous).

**Multi portal / API**

```text
2 portals: admin at ~/ws/portal, line at ~/ws/line; 2 APIs: core at ~/ws/api-core,
scenario at ~/ws/api-scenario; docs = ~/ws/base-docs; tests = ~/ws/base-tests
```

→ Map one key per checkout; prompt for any missing paths.

**Legacy**

```text
legacy ERP at D:\legacy\erp, key legacy-erp
```

→ Target strictly `legacy-repos.local.json`.

## After Write

1. Run `platform-dna codegraph:wire` (when utilizing Cursor + CodeGraph).
2. For checkouts lacking `.codegraph/`: `cd <root> && codegraph init`.
