---
name: build-template-code
description: /build-template-code — Scaffolds custom codegen templates and registries based on platform-dna configuration.
disable-model-invocation: true
---

# /build-template-code — Custom Template Scaffolding

## Context - Action - Constraint (CAC)

### Context
Member wants to automatically generate or update frontend/backend codegen templates for a repository using `platform-dna` presets and source models.

### Action
```bash
# Dry-run inspection
codegenkit build-template-code --dry-run

# Scaffolding templates and registry entries
codegenkit build-template-code

# Force overwrite existing custom templates
codegenkit build-template-code --force
```

#### CLI Parameters
- `--dry-run`: Preview files to be scaffolded/written without system mutation.
- `--force`: Overwrite existing templates and registries.
- `--merge`: Merge new registry entries into `registries/design.registry.json` (default).
- `--output <dir>`: Target directory for generated templates (default: `adapters/<framework>/codegen/templates/custom`).

#### Internal Pipeline
1. **Scan Project**: `src/template-builder/scanProject.ts` reads `platform-dna` to identify source components/controllers.
2. **Model Extraction**: Use AST/regex parsers to extract class names, routes, props, and build intermediate JSON models.
3. **Template Generation**: `generateTemplate.ts` produces `.hbs` (FE) and `.scriban` (BE) files from extracted models.
4. **Registry Update**: `writeRegistry.ts` creates or merges `custom.registry.json`.
5. **Report**: Emit summary list of generated templates and registry entries.

### Constraints
- **[MANDATORY]** Validate `platform-dna` configuration prior to execution.
- **[STRICTLY FORBIDDEN]** Do NOT overwrite modified custom templates without the `--force` flag.
- **[MANDATORY]** Ensure generated template tags match the host framework's UI and routing patterns.
