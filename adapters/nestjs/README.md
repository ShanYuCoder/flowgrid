# NestJS adapter

Backend Nest scaffold (`nestgen`) and Nest unit-test generation (`nest-unitgen`).
Promoted from `drafts/next_nest/` with `FLOWGRID_PROJECT_ROOT` targeting.

## CLI

```bash
flowgrid api-gen --adapter=nestjs -- --spec <01-backend-spec.yaml> [--dry-run]
flowgrid api-unit-gen --adapter=nestjs -- --spec <…> [--dry-run]
flowgrid api-registry --adapter=nestjs
flowgrid api-unit-registry --adapter=nestjs
```

Registries sync on `flowgrid init --type=be --adapter=nestjs` into product
`registries/nest-*.registry.json`.
