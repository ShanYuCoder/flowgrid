# portal:unit-gen

Reads hub Code `ir/design.yaml` + `generated/codegen.manifest.json` (after `flowgrid gen`) → writes `tests/unit/`.

```bash
flowgrid unit-gen:dry --id W-AD-AUTH-001
flowgrid unit-gen --id W-AD-AUTH-001
flowgrid unit-gen --id W-AD-AUTH-001 --force
flowgrid unit-gen --spec /path/to/docs-hub/Surfaces/.../Modules/CMP-01-auth/Functions/W-AD-AUTH-001/ir/design.yaml
```

Form/create pages (`profile: create|auth|change-password|public`) generate tests against `services/{entity}Form.service.ts`. List-column model tests are not emitted for those profiles.
