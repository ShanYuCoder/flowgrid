import test from 'node:test';
import assert from 'node:assert';
import {
  AUDIT_ENGINES,
  resolveAuditInvocation,
  AUDIT_SUBCOMMANDS,
} from '../bin/lib/audit-run.mjs';

test('AUDIT_ENGINES maps to existing engine files', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (const rel of Object.values(AUDIT_ENGINES)) {
    assert.ok(fs.existsSync(path.join(root, rel)), rel);
  }
});

test('resolveAuditInvocation supports audit subcommand and audit:colon form', () => {
  assert.deepStrictEqual(resolveAuditInvocation(['audit', 'spec', '--type', 'list']), {
    command: 'audit:spec',
    argv: ['--type', 'list'],
  });
  assert.deepStrictEqual(resolveAuditInvocation(['audit:api', 'x.yaml']), {
    command: 'audit:api',
    argv: ['x.yaml'],
  });
  assert.deepStrictEqual(resolveAuditInvocation(['audit']), {
    command: '__help__',
    argv: [],
  });
  assert.ok(AUDIT_SUBCOMMANDS.includes('fe-be'));
  assert.ok(AUDIT_SUBCOMMANDS.includes('scenario'));
  assert.strictEqual(resolveAuditInvocation(['audit', 'fe-be', 'x.bundle.yaml'])?.command, 'audit:fe-be');
});
