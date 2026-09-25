# bộ docs — phase hooks

bộ docs is an optional index over Markdown owned by the configured docs repo.
In consumer repos, that root comes from machine-local `FLOWGRID_DOCS_ROOT`; never
inspect the current FE/BE/tests repo as if it were the docs hub.

```text
(1) flowgrid_docs_layout / flowgrid_docs_route / flowgrid_docs_list_ids — narrow scope
(2) flowgrid_docs_get_element — canonical file and targeted excerpt
(3) flowgrid_docs_deps_of / flowgrid_docs_dependents_of — reference impact
(4) flowgrid_docs_orphans / flowgrid_docs_validate_links — catalog health
```

Use `FLOW-*` and `flowgrid_docs_journeys` for journeys. Keep ADRs in the configured
arc42 decision home and code-level IDs in the target hub's product tree.

If bộ docs is not connected, continue with targeted Markdown inspection at the
explicit docs root. To wire it locally from another repo:

```bash
flowgrid init --location=local --docs-root=/absolute/path/to/docs-hub --yes
```
