import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {Record<string, string>} */
export const AUDIT_ENGINES = {
  'audit:spec': 'engines/spec/lib/audit-bundle-gaps.mjs',
  'audit:flow': 'engines/spec/lib/audit-flow-gaps.mjs',
  'audit:api': 'engines/spec/lib/audit-api-gaps.mjs',
  'audit:testcase': 'engines/spec/lib/audit-testcase-gaps.mjs',
  'audit:legacy': 'engines/spec/lib/audit-legacy-gaps.mjs',
  'audit:fe-be': 'engines/spec/lib/audit-fe-be-alignment.mjs',
  'audit:scenario': 'engines/spec/lib/audit-scenario-coverage.mjs',
};

/** Short names for `flowgrid audit <name>`. */
export const AUDIT_SUBCOMMANDS = Object.keys(AUDIT_ENGINES).map((k) => k.replace('audit:', ''));

export function printAuditHelp() {
  const lines = [
    'FlowGrid audit — deterministic gap scripts (JSON on stdout)',
    '',
    'Usage:',
    '  flowgrid audit <kind> [engine args...]',
    '  flowgrid audit:<kind> [engine args...]',
    '',
    'Kinds:',
    '  spec       bundle YAML gaps (--type pageType)',
    '  flow       FLOW-*.md business process sections',
    '  api        API bundle / 01-backend-spec gaps',
    '  testcase   TC-*.yaml (v2) or legacy plan; --bundle cross-ref bundle',
    '  fe-be      bundle apiRef vs 01-backend-spec alignment',
    '  scenario   cross-flow SC screens vs cases/** TC coverage',
    '  legacy     legacy adoption / target-id gaps',
    '',
    'Examples:',
    '  flowgrid audit spec surfaces/.../foo.bundle.yaml --type list',
    '  flowgrid audit:api surfaces/.../api/01/01-backend-spec.yaml',
    '',
  ];
  console.log(lines.join('\n'));
}

/**
 * @param {string[]} argv — args after `flowgrid` (command + rest)
 * @returns {{ command: string; argv: string[] } | null}
 */
export function resolveAuditInvocation(argv) {
  const [head, ...rest] = argv;
  if (!head) return null;

  if (head === 'audit') {
    const sub = rest[0];
    if (!sub || sub === '--help' || sub === '-h') {
      return { command: '__help__', argv: [] };
    }
    const key = sub.startsWith('audit:') ? sub : `audit:${sub}`;
    if (!AUDIT_ENGINES[key]) {
      throw new Error(`Unknown audit kind "${sub}". Use: ${AUDIT_SUBCOMMANDS.join(', ')}`);
    }
    return { command: key, argv: rest.slice(1) };
  }

  if (AUDIT_ENGINES[head]) {
    return { command: head, argv: rest };
  }

  return null;
}

export function runAuditCommand(command, argv) {
  if (command === '__help__') {
    printAuditHelp();
    return 0;
  }

  const rel = AUDIT_ENGINES[command];
  if (!rel) {
    throw new Error(
      `Unknown audit command: ${command}. Use: ${Object.keys(AUDIT_ENGINES).join(', ')}`,
    );
  }
  const script = path.join(packageRoot, rel);
  const res = spawnSync(process.execPath, [script, ...argv], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  return res.status ?? 1;
}
