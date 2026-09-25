# Laravel PHP unitgen

Source of truth for the Laravel BE unit-test generator. Synced by
`flowgrid init --type=be --adapter=laravel` into the product checkout at
`src/.flowgrid/php/` (gitignored, owned by `.flowgrid/php/install-manifest.json`).

## Run

```bash
cd src   # Laravel app root (artisan + composer.json)
php .flowgrid/php/bin/unit-gen.php --spec <base-docs>/…/01-backend-spec.yaml [--dry-run] [--force] [--phase all]
```

Or via toolkit CLI (spawns the synced engine):

```bash
flowgrid api-unit-gen --adapter=laravel -- --spec <path>
```

## Dependency

Product `composer.json` must include `symfony/yaml` in `require-dev` (used to
parse `01-backend-spec.yaml` / `02-openapi.yaml`).

Registries stay at product-root `registries/unit-test.registry.json` (also
synced by init from `adapters/laravel/registries/`).
