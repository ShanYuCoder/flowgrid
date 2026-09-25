# Grill validation (bộ docs)

Deterministic gates before marking a bundle grill-approved:

- `flowgrid split` / `flowgrid check` on the target `*.bundle.yaml`
- `flowgrid render` when human-readable spec must be reviewed
- Page type / `codegen.profile` must match skill workflow (`/grill-bqa`, `/grill-dev`)

Do not write SSOT until the member confirms grill recommendations in chat.
