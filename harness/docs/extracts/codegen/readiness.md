# Codegen readiness (bộ code)

Before `/prototype` or `flowgrid gen`:

- `ir/design.yaml` exists after `flowgrid split`
- `gen.codegen.profile` set (`list`, `create`, `auth`, `admin-crud`, …)
- `entity` / `module` populated when profile requires them
- Run `flowgrid gen:dry` on the FE repo; fix gaps via `/grill-dev` on the docs hub
