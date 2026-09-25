#!/usr/bin/env node

/**
 * audit-fe-be-alignment.mjs
 * Cross-check FE bundle design actions (apiRef) vs sibling 01-backend-spec.yaml endpoints.
 */

import fs from 'fs';
import path from 'path';

function extractApiRefsFromBundle(rawText) {
  const refs = new Set();
  for (const m of rawText.matchAll(/apiRef:\s*["']?([\w.-]+)["']?/g)) {
    refs.add(m[1]);
  }
  for (const m of rawText.matchAll(/apiRefs:\s*\n([\s\S]*?)(?:\n\S|\n\s*\w+:\s*[^\s])/g)) {
    const block = m[1];
    for (const line of block.split('\n')) {
      const item = line.match(/^\s*-\s*["']?([\w.-]+)["']?/);
      if (item) refs.add(item[1]);
    }
  }
  return [...refs];
}

function extractEndpointActions(backendText) {
  const actions = new Set();
  for (const m of backendText.matchAll(/action:\s*["']?([\w.-]+)["']?/g)) {
    actions.add(m[1]);
  }
  for (const m of backendText.matchAll(/\bid:\s*["']?([\w.-]+)["']?/g)) {
    if (backendText.includes('endpoints:')) actions.add(m[1]);
  }
  return [...actions];
}

function resolveBackendSpec(bundlePath, explicitPath) {
  if (explicitPath) return path.resolve(process.cwd(), explicitPath);
  const dir = path.dirname(bundlePath);
  const candidates = [];
  const walk = (start, depth) => {
    if (depth > 4) return;
    let entries;
    try {
      entries = fs.readdirSync(start, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(start, e.name);
      if (e.isDirectory()) {
        if (e.name === 'api' || e.name.match(/^\d+$/)) walk(full, depth + 1);
      } else if (e.name === '01-backend-spec.yaml') {
        candidates.push(full);
      }
    }
  };
  walk(dir, 0);
  walk(path.join(dir, 'api'), 0);
  return candidates[0] ?? null;
}

export function auditFeBeAlignment(bundleText, backendText, meta = {}) {
  const gaps = [];
  const bundlePath = meta.bundlePath ?? '';
  const backendPath = meta.backendPath ?? '';

  function addGap(code, severity, fieldPath, message, suggestedFix) {
    gaps.push({ code, severity, path: fieldPath, message, suggestedFix, category: 'fe-be' });
  }

  const apiRefs = extractApiRefsFromBundle(bundleText);
  const hasActions = bundleText.includes('executionContract:') || bundleText.includes('apiRef:');

  if (hasActions && apiRefs.length === 0) {
    addGap(
      'FEBE_MISSING_APIREF',
      'warning',
      'design.actions[].executionContract.apiRef',
      'Bundle declares actions but no apiRef values were found.',
      'Set executionContract.apiRef to match 01-backend-spec endpoint action id.',
    );
  }

  if (!backendText) {
    if (apiRefs.length > 0) {
      addGap(
        'FEBE_MISSING_BACKEND_SPEC',
        'critical',
        'api/01-backend-spec.yaml',
        'Bundle references API but no 01-backend-spec.yaml found (pass --backend-spec).',
        'Author /api-update on docs hub, then re-run audit with --backend-spec path.',
      );
    }
    return {
      file: bundlePath,
      backendSpec: backendPath || null,
      totalGaps: gaps.length,
      gaps,
    };
  }

  const endpointActions = extractEndpointActions(backendText);
  const endpointSet = new Set(endpointActions.map((a) => a.toLowerCase()));

  for (const ref of apiRefs) {
    const hit =
      endpointSet.has(ref.toLowerCase()) ||
      backendText.includes(ref) ||
      backendText.includes(ref.replace(/\./g, '/'));
    if (!hit) {
      addGap(
        'FEBE_APIREF_UNMAPPED',
        'warning',
        `design.apiRef.${ref}`,
        `Bundle apiRef "${ref}" not found on 01-backend-spec (action/id/path).`,
        `Add endpoint with action: ${ref} or align bundle apiRef after /api-update.`,
      );
    }
  }

  if (backendText.includes('endpoints:') && apiRefs.length === 0 && hasActions) {
    addGap(
      'FEBE_ENDPOINTS_NO_FE_REFS',
      'info',
      'api.endpoints',
      'Backend spec defines endpoints but bundle has no apiRef linkage.',
      'Wire design.actions[].executionContract.apiRef to endpoint action ids.',
    );
  }

  return {
    file: bundlePath,
    backendSpec: backendPath,
    apiRefs,
    endpointActions,
    totalGaps: gaps.length,
    criticalGaps: gaps.filter((g) => g.severity === 'critical').length,
    warningGaps: gaps.filter((g) => g.severity === 'warning').length,
    infoGaps: gaps.filter((g) => g.severity === 'info').length,
    gaps,
  };
}

function parseArgs(argv) {
  let backendSpec = null;
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--backend-spec' && argv[i + 1]) {
      backendSpec = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  return { bundlePath: positional[0], backendSpec };
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(
    'Usage: node audit-fe-be-alignment.mjs <bundle.yaml> [--backend-spec path/to/01-backend-spec.yaml]',
  );
  process.exit(0);
}

const { bundlePath: argBundle, backendSpec } = parseArgs(args);
const resolvedBundle = path.resolve(process.cwd(), argBundle);
if (!fs.existsSync(resolvedBundle)) {
  console.error(JSON.stringify({ error: `File not found: ${resolvedBundle}` }));
  process.exit(1);
}
const bundleText = fs.readFileSync(resolvedBundle, 'utf8');
const backendResolved = resolveBackendSpec(resolvedBundle, backendSpec);
const backendText =
  backendResolved && fs.existsSync(backendResolved)
    ? fs.readFileSync(backendResolved, 'utf8')
    : '';
const report = auditFeBeAlignment(bundleText, backendText, {
  bundlePath: resolvedBundle,
  backendPath: backendResolved,
});
console.log(JSON.stringify(report, null, 2));
